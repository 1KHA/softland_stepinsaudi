// ─────────────────────────────────────────────────────────────────────────────
// Landing-page applications.
//
// The wizard in frontend/src/pages/StepInLandingV5.tsx collects 19 fields
// across four steps and, before this route existed, threw the submission away.
// These endpoints persist it and give admins a review workflow.
//
// POST /applications is the only unauthenticated write endpoint on the API, so
// it is treated as the security boundary: per-IP rate limit, server-side
// validation mirroring the client's VALID array, hard length caps, and a
// response that never echoes the stored row or its id back to an anonymous
// caller.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const prisma = require('../prisma/client');

const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

const { applicationLimiters } = require('../middleware/rateLimit');

// Same shape used across auth.routes.js — kept local so the two cannot drift.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The lifecycle from mdfiles/08-LANDING-APPLICATIONS-PLAN.md §2.1. Validated
// against this allowlist rather than written blindly — the same pattern as
// COMPANY_STATUSES in company.controller.js.
const APPLICATION_STATUSES = [
  'NEW',
  'REVIEWING',
  'CONTACTED',
  'CONVERTED',
  'REJECTED'
];

// A single request must not be able to write megabytes. Over-long input is
// rejected outright rather than truncated: silently storing a different value
// than the applicant typed is worse than telling them it was too long.
const SHORT_MAX = 255;
const TEXT_MAX = 2000;

// Free-text fields get the larger cap; everything else is a short field.
const LONG_FIELDS = ['activity'];

const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 100;

function sendSuccess(res, message, data = {}, status = 200) {
  return res.status(status).json({
    success: true,
    message,
    ...data
  });
}

function sendError(res, status, message, data = {}) {
  return res.status(status).json({
    success: false,
    message,
    ...data
  });
}

// Trim to a string. Anything non-scalar (objects, arrays sent by a hostile
// client) becomes '' rather than being coerced to "[object Object]".
function str(value) {

  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'object') {
    return '';
  }

  return String(value).trim();

}

// Optional fields are stored as null rather than '' so the admin UI can tell
// "not answered" from "answered with an empty string".
function optional(value) {

  const trimmed = str(value);

  return trimmed === '' ? null : trimmed;

}

// The consent checkbox. Only an explicit true (or its string/1 equivalents)
// counts — a missing or falsy value must never be read as agreement.
function isConsentGiven(value) {

  return value === true ||
    value === 1 ||
    value === 'true' ||
    value === '1';

}

// The camelCase keys the wizard sends, paired with the snake_case column each
// one lands in. Anything not listed here is ignored, so a client cannot set
// `status`, `reviewed_by` or `id` by including them in the body.
const FIELD_MAP = {
  profile: 'profile',
  homeMarket: 'home_market',
  company: 'company',
  website: 'website',
  linkedin: 'linkedin',
  size: 'size',
  activity: 'activity',
  stage: 'stage',
  capital: 'capital',
  saudi: 'saudi',
  timeline: 'timeline',
  file: 'file_url',
  first: 'first_name',
  last: 'last_name',
  email: 'email',
  dial: 'dial',
  phone: 'phone',
  role: 'role'
};

// Returns an error message, or null when every field is within its cap.
function findOverLongField(body) {

  for (const key of Object.keys(FIELD_MAP)) {

    const max = LONG_FIELDS.includes(key)
      ? TEXT_MAX
      : SHORT_MAX;

    if (str(body[key]).length > max) {
      return `${key} is too long (maximum ${max} characters)`;
    }

  }

  return null;

}

// ── POST /applications — public ──────────────────────────────────────────────

router.post('/', applicationLimiters, async (req, res) => {

  const body = req.body || {};

  // Mirrors VALID in StepInLandingV5.tsx. Client validation is a convenience,
  // not a security control, so all of it is repeated here.
  const company = str(body.company);
  const first = str(body.first);
  const last = str(body.last);
  const email = str(body.email);
  const phone = str(body.phone);

  if (!company) {
    return sendError(res, 400, 'Company name is required');
  }

  if (!first) {
    return sendError(res, 400, 'First name is required');
  }

  if (!last) {
    return sendError(res, 400, 'Last name is required');
  }

  if (!email) {
    return sendError(res, 400, 'Email is required');
  }

  if (!EMAIL_REGEX.test(email)) {
    return sendError(res, 400, 'A valid email address is required');
  }

  if (!phone) {
    return sendError(res, 400, 'Phone number is required');
  }

  if (!isConsentGiven(body.consent)) {
    return sendError(res, 400, 'Consent is required');
  }

  const overLong = findOverLongField(body);

  if (overLong) {
    return sendError(res, 400, overLong);
  }

  let created;

  try {

    created = await prisma.applications.create({
      data: {
        profile: optional(body.profile),
        home_market: optional(body.homeMarket),
        company,
        website: optional(body.website),
        linkedin: optional(body.linkedin),
        size: optional(body.size),
        activity: optional(body.activity),
        stage: optional(body.stage),
        capital: optional(body.capital),
        saudi: optional(body.saudi),
        timeline: optional(body.timeline),
        // Attachments are deferred: the wizard only ever had the filename
        // string, never the File object (plan §6). Stored as-is for now.
        file_url: optional(body.file),
        first_name: first,
        last_name: last,
        email: email.toLowerCase(),
        dial: optional(body.dial),
        phone,
        role: optional(body.role),
        consent: true,
        status: 'NEW'
      }
    });

  } catch (err) {

    console.error('Application create error:', err);

    return sendError(res, 500, 'Could not submit the application');

  }

  // Non-fatal by construction: the application is already committed, and a
  // notification failure must never turn a saved submission into an error the
  // applicant sees.
  await notifyAdminsOfApplication(created.company);

  // Deliberately minimal. An anonymous caller learns nothing about the row it
  // just wrote — not its id, not the table's size.
  return sendSuccess(
    res,
    'Application received',
    {},
    201
  );

});

// Fans out to every ADMIN. Both `message` and `message_ar` are set — eight of
// the nine existing creators set only `message`, which makes the Arabic UI
// fall back to English (mdfiles/02-NOTIFICATIONS.md).
async function notifyAdminsOfApplication(company) {

  try {

    const admins = await prisma.users.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    for (const admin of admins) {

      await prisma.notifications.create({
        data: {
          user_id: admin.id,
          message: `newApplicationReceived|${company}`,
          message_ar: `newApplicationReceived|${company}`,
          type: 'NEW_APPLICATION',
          is_read: 0
        }
      });

    }

  } catch (err) {

    console.log('New application notification error:', err);

  }

}

// ── GET /applications — ADMIN ────────────────────────────────────────────────

router.get(
  '/',
  authMiddleware,
  checkRole('ADMIN'),
  async (req, res) => {

    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const requestedLimit =
      Number.parseInt(req.query.limit, 10) || PAGE_SIZE_DEFAULT;

    // Capped so a single request cannot ask for the whole table. This data is
    // PII (plan §5) and the table only grows.
    const limit = Math.min(
      PAGE_SIZE_MAX,
      Math.max(1, requestedLimit)
    );

    const status = str(req.query.status).toUpperCase();
    const search = str(req.query.search);

    const where = {};

    if (status) {

      if (!APPLICATION_STATUSES.includes(status)) {
        return sendError(res, 400, 'Invalid status');
      }

      where.status = status;

    }

    if (search) {

      where.OR = [
        { company: { contains: search, mode: 'insensitive' } },
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];

    }

    try {

      const [applications, total] = await Promise.all([

        prisma.applications.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),

        prisma.applications.count({ where })

      ]);

      return sendSuccess(
        res,
        'Applications loaded',
        {
          applications,
          total,
          page,
          limit
        }
      );

    } catch (err) {

      console.error('Application list error:', err);

      return sendError(res, 500, 'Database error');

    }

  }
);

// ── GET /applications/:id — ADMIN ────────────────────────────────────────────

router.get(
  '/:id',
  authMiddleware,
  checkRole('ADMIN'),
  async (req, res) => {

    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id < 1) {
      return sendError(res, 404, 'Application not found');
    }

    try {

      const application = await prisma.applications.findUnique({
        where: { id }
      });

      if (!application) {
        return sendError(res, 404, 'Application not found');
      }

      return sendSuccess(
        res,
        'Application loaded',
        { application }
      );

    } catch (err) {

      console.error('Application detail error:', err);

      return sendError(res, 500, 'Database error');

    }

  }
);

// ── PATCH /applications/:id — ADMIN ──────────────────────────────────────────

router.patch(
  '/:id',
  authMiddleware,
  checkRole('ADMIN'),
  async (req, res) => {

    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id < 1) {
      return sendError(res, 404, 'Application not found');
    }

    const body = req.body || {};

    const statusRequested =
      body.status !== undefined &&
      body.status !== null &&
      str(body.status) !== '';

    const noteRequested = body.admin_note !== undefined;

    if (!statusRequested && !noteRequested) {
      return sendError(res, 400, 'Nothing to update');
    }

    const data = {};

    if (statusRequested) {

      const status = str(body.status).toUpperCase();

      if (!APPLICATION_STATUSES.includes(status)) {
        return sendError(res, 400, 'Invalid status');
      }

      data.status = status;

    }

    if (noteRequested) {

      const note = str(body.admin_note);

      if (note.length > TEXT_MAX) {
        return sendError(
          res,
          400,
          `admin_note is too long (maximum ${TEXT_MAX} characters)`
        );
      }

      data.admin_note = note === '' ? null : note;

    }

    try {

      const existing = await prisma.applications.findUnique({
        where: { id },
        select: { status: true }
      });

      if (!existing) {
        return sendError(res, 404, 'Application not found');
      }

      // Only a real status change stamps the reviewer — re-saving a note
      // should not rewrite who last made a decision.
      if (data.status && data.status !== existing.status) {
        data.reviewed_by = req.user.id;
        data.reviewed_at = new Date();
      }

      const application = await prisma.applications.update({
        where: { id },
        data
      });

      return sendSuccess(
        res,
        'Application updated',
        { application }
      );

    } catch (err) {

      console.error('Application update error:', err);

      return sendError(res, 500, 'Database error');

    }

  }
);

module.exports = router;
