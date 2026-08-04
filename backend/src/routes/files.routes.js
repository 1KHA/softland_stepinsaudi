// ─────────────────────────────────────────────────────────────────────────────
// Authenticated document download (risk R-12).
//
// Replaces `app.use('/uploads', express.static('uploads'))`, which served every
// licence, ID and company profile to anyone who knew the URL, with a content
// type derived from the extension — so an uploaded .html or .svg was stored XSS
// on the API origin.
//
// Here, every byte goes out behind `requireCompanyAccess(fromTaskDocument(...))`,
// as `application/octet-stream`, with `Content-Disposition: attachment` and
// `X-Content-Type-Options: nosniff`. Nothing the browser receives from this
// route can execute in the API's origin.
//
// ── On the ?t= query token ───────────────────────────────────────────────────
// An `<a href>` cannot carry an Authorization header, and the UI needs to open
// documents in a tab. So this router — and ONLY this router — also accepts a
// short-lived download token as `?t=`.
//
// The global authMiddleware is deliberately left alone: query strings end up in
// access logs, Referer headers, proxy logs and browser history, so a 7-day
// session token must never travel in one. The download token here is:
//
//   * valid for 60 seconds;
//   * scoped to one document id (`sub`);
//   * tagged with `aud: "file-download"`, which a normal login token does not
//     carry — so a leaked session token cannot be replayed as `?t=`, and a
//     leaked download token cannot be replayed against any other endpoint;
//   * minted only from an authenticated POST that runs the same company access
//     check as the download itself.
//
// Access is re-checked against the database on redemption, so a token minted
// before the user lost access does not outlive that access.
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const express = require('express');
const jwt = require('jsonwebtoken');

const prisma = require('../prisma/client');
const authMiddleware = require('../middleware/authMiddleware');
const {
  requireCompanyAccess,
  fromTaskDocument
} = require('../middleware/ownership');
const { toDiskPath, toRelative } = require('../lib/fileUrl');

const router = express.Router();

const DOWNLOAD_TOKEN_TTL_SECONDS = 60;
const DOWNLOAD_TOKEN_AUDIENCE = 'file-download';

// ─────────────────────────────────────────────────────────────────────────────
// Router-scoped authentication.
//
// Authorization header first (the normal API path). Falls back to ?t= only for
// a token that was minted for THIS document by the endpoint below.
// ─────────────────────────────────────────────────────────────────────────────
function fileAuth(req, res, next) {

  if (req.headers.authorization) {
    return authMiddleware(req, res, next);
  }

  const raw = req.query ? req.query.t : undefined;

  if (!raw || typeof raw !== 'string') {
    return res.status(401).json({
      success: false,
      message: 'No token'
    });
  }

  let decoded;

  try {

    decoded = jwt.verify(raw, process.env.JWT_SECRET, {
      audience: DOWNLOAD_TOKEN_AUDIENCE
    });

  } catch {

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired download token'
    });

  }

  // A download token unlocks exactly one document.
  if (String(decoded.sub) !== String(req.params.documentId)) {
    return res.status(403).json({
      success: false,
      message: 'Token is not valid for this document'
    });
  }

  req.user = {
    id: decoded.id,
    role: decoded.role,
    company_id: decoded.company_id
  };

  return next();
}

// RFC 6266 / RFC 5987. Filenames here are frequently Arabic, so the ASCII
// fallback alone would lose the name entirely.
function contentDisposition(filename) {

  const name = String(filename || 'document');

  const ascii = name
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x20-\x7e]/g, '_')
    .replace(/["\\]/g, '_');

  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /files/:documentId/token
// Mint a 60-second, single-document download token. Requires a real session.
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/:documentId/token',
  authMiddleware,
  requireCompanyAccess(fromTaskDocument('documentId')),
  async (req, res) => {

    const documentId = Number(req.params.documentId);

    if (!Number.isFinite(documentId)) {
      return res.status(404).json({
        success: false,
        message: 'Not found'
      });
    }

    // requireCompanyAccess short-circuits for ADMIN without touching the row,
    // so existence still has to be confirmed here.
    const row = await prisma.task_documents.findUnique({
      where: { id: documentId },
      select: { id: true }
    });

    if (!row) {
      return res.status(404).json({
        success: false,
        message: 'Not found'
      });
    }

    const token = jwt.sign(
      {
        id: req.user.id,
        role: req.user.role,
        company_id: req.user.company_id
      },
      process.env.JWT_SECRET,
      {
        subject: String(documentId),
        audience: DOWNLOAD_TOKEN_AUDIENCE,
        expiresIn: DOWNLOAD_TOKEN_TTL_SECONDS
      }
    );

    return res.json({
      success: true,
      token,
      expires_in: DOWNLOAD_TOKEN_TTL_SECONDS
    });

  }
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /files/:documentId
// 401 unauthenticated · 403 cross-tenant · 404 row or file missing.
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  '/:documentId',
  fileAuth,
  requireCompanyAccess(fromTaskDocument('documentId')),
  async (req, res, next) => {

    const documentId = Number(req.params.documentId);

    if (!Number.isFinite(documentId)) {
      return res.status(404).json({
        success: false,
        message: 'Not found'
      });
    }

    let row;

    try {

      row = await prisma.task_documents.findUnique({
        where: { id: documentId },
        select: {
          id: true,
          file_name: true,
          file_url: true
        }
      });

    } catch (err) {
      return next(err);
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        message: 'Not found'
      });
    }

    // toDiskPath() runs the value through toRelative(), which is what makes the
    // legacy `http://localhost:3000/uploads/...` rows resolve without a
    // migration.
    const absolutePath = toDiskPath(row.file_url);

    if (!absolutePath) {
      return res.status(404).json({
        success: false,
        message: 'Not found'
      });
    }

    let stat;

    try {
      stat = fs.statSync(absolutePath);
    } catch {
      stat = null;
    }

    if (!stat || !stat.isFile()) {

      console.log(
        `[files] document ${documentId} has no file on disk: ${absolutePath}`
      );

      return res.status(404).json({
        success: false,
        message: 'Not found'
      });
    }

    const downloadName =
      row.file_name || toRelative(row.file_url) || `document-${documentId}`;

    // Never echo a content type derived from the extension: octet-stream plus
    // nosniff plus attachment is what removes the stored-XSS vector.
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', contentDisposition(downloadName));
    res.setHeader('Content-Length', String(stat.size));
    res.setHeader('Cache-Control', 'private, no-store');

    const stream = fs.createReadStream(absolutePath);

    stream.on('error', (err) => {

      console.error(`[files] stream error for document ${documentId}`, err);

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }

      res.destroy(err);
    });

    return stream.pipe(res);

  }
);

module.exports = router;
