// ─────────────────────────────────────────────────────────────────────────────
// Rate limiting for the authentication surface (risk R-08).
//
// `POST /auth/login` is password-only — there is no second factor any more —
// so rate limiting is the primary brute-force defence and is deliberately the
// strictest limiter here.
//
// Every limiter is keyed twice: once per IP (so one host cannot spray many
// accounts) and once per email (so one account cannot be sprayed from many
// hosts). Express runs the two limiters in sequence, whichever trips first
// answers with 429.
//
// All windows/limits are configurable through environment variables — see
// backend/.env.example. When NODE_ENV === 'test' every limiter is skipped so
// automated verification is never throttled.
// ─────────────────────────────────────────────────────────────────────────────

const {
  rateLimit,
  ipKeyGenerator
} = require('express-rate-limit');

const isTestEnv = () =>
  process.env.NODE_ENV === 'test';

function envInt(name, fallback) {

  const raw = process.env[name];

  if (raw === undefined || raw === '') {
    return fallback;
  }

  const parsed = Number(raw);

  return Number.isFinite(parsed) && parsed > 0
    ? Math.floor(parsed)
    : fallback;

}

// Minutes are friendlier to configure than milliseconds.
const envWindowMs = (name, fallbackMinutes) =>
  envInt(name, fallbackMinutes) * 60 * 1000;

// Keeps the `{ success, message }` shape used by sendError() everywhere else.
function limitHandler(message) {

  return (req, res) => {

    return res.status(429).json({
      success: false,
      message
    });

  };

}

function emailOf(req) {

  const email = req.body && req.body.email;

  return typeof email === 'string' && email.trim()
    ? email.trim().toLowerCase()
    : null;

}

function makeLimiter({
  windowMs,
  limit,
  message,
  by,
  skipSuccessfulRequests = false
}) {

  return rateLimit({

    windowMs,
    limit,

    standardHeaders: 'draft-7',
    legacyHeaders: false,

    skipSuccessfulRequests,

    // Never throttle automated verification runs.
    skip: (req) =>
      isTestEnv() ||
      (by === 'email' && emailOf(req) === null),

    keyGenerator: (req, res) =>
      by === 'email'
        ? `email:${emailOf(req)}`
        : `ip:${ipKeyGenerator(req.ip)}`,

    handler: limitHandler(message)

  });

}

// ── /auth/login ──────────────────────────────────────────────────────────────
// Only failed logins are counted, so a busy legitimate user is never locked
// out by their own successful sessions.

const LOGIN_WINDOW_MS =
  envWindowMs('RATE_LIMIT_LOGIN_WINDOW_MINUTES', 15);

const LOGIN_MESSAGE =
  'Too many failed login attempts. Please try again later.';

const loginLimiters = [

  makeLimiter({
    windowMs: LOGIN_WINDOW_MS,
    limit: envInt('RATE_LIMIT_LOGIN_MAX_PER_IP', 10),
    message: LOGIN_MESSAGE,
    by: 'ip',
    skipSuccessfulRequests: true
  }),

  makeLimiter({
    windowMs: LOGIN_WINDOW_MS,
    limit: envInt('RATE_LIMIT_LOGIN_MAX_PER_EMAIL', 10),
    message: LOGIN_MESSAGE,
    by: 'email',
    skipSuccessfulRequests: true
  })

];

// ── OTP verification (/verify-register-otp, /reset-password) ─────────────────
// A six-digit OTP is 10^6 possibilities; the point of this limiter is that
// guessing is not viable inside the 5-minute validity window.

const OTP_VERIFY_WINDOW_MS =
  envWindowMs('RATE_LIMIT_OTP_VERIFY_WINDOW_MINUTES', 15);

const OTP_VERIFY_MESSAGE =
  'Too many verification attempts. Please request a new code and try again later.';

const otpVerifyLimiters = [

  makeLimiter({
    windowMs: OTP_VERIFY_WINDOW_MS,
    limit: envInt('RATE_LIMIT_OTP_VERIFY_MAX_PER_IP', 10),
    message: OTP_VERIFY_MESSAGE,
    by: 'ip',
    skipSuccessfulRequests: true
  }),

  makeLimiter({
    windowMs: OTP_VERIFY_WINDOW_MS,
    limit: envInt('RATE_LIMIT_OTP_VERIFY_MAX_PER_EMAIL', 10),
    message: OTP_VERIFY_MESSAGE,
    by: 'email',
    skipSuccessfulRequests: true
  })

];

// ── OTP issuing (/register-with-company, /forgot-password) ───────────────────
// Moderate: these send email, so the abuse case is mail bombing rather than
// guessing. `resend_after` is enforced separately in the handlers.

const OTP_REQUEST_WINDOW_MS =
  envWindowMs('RATE_LIMIT_OTP_REQUEST_WINDOW_MINUTES', 60);

const OTP_REQUEST_MESSAGE =
  'Too many verification codes requested. Please try again later.';

const otpRequestIpLimiter = makeLimiter({
  windowMs: OTP_REQUEST_WINDOW_MS,
  limit: envInt('RATE_LIMIT_OTP_REQUEST_MAX_PER_IP', 20),
  message: OTP_REQUEST_MESSAGE,
  by: 'ip'
});

// `/register-with-company` is multipart, so req.body does not exist until
// multer has run. This limiter must be mounted *after* the upload middleware
// or its key is always null and it silently does nothing.
const otpRequestEmailLimiter = makeLimiter({
  windowMs: OTP_REQUEST_WINDOW_MS,
  limit: envInt('RATE_LIMIT_OTP_REQUEST_MAX_PER_EMAIL', 5),
  message: OTP_REQUEST_MESSAGE,
  by: 'email'
});

const otpRequestLimiters = [
  otpRequestIpLimiter,
  otpRequestEmailLimiter
];

// ── /applications (public landing-page submissions) ──────────────────────────
// The only unauthenticated write endpoint on the API, so this limiter is the
// feature's security boundary against spam and database-fill. Keyed by IP
// only: the applicant is anonymous and the email field is attacker-chosen, so
// an email key would be trivially bypassed by varying it per request.

const APPLICATION_WINDOW_MS =
  envWindowMs('RATE_LIMIT_APPLICATION_WINDOW_MINUTES', 60);

const applicationIpLimiter = makeLimiter({
  windowMs: APPLICATION_WINDOW_MS,
  limit: envInt('RATE_LIMIT_APPLICATION_MAX_PER_IP', 10),
  message: 'Too many applications submitted. Please try again later.',
  by: 'ip'
});

const applicationLimiters = [
  applicationIpLimiter
];

// ─────────────────────────────────────────────────────────────────────────────
// OTP attempt counter with lockout (R-08).
//
// `otp_requests` has no `attempts` column and this phase adds no migrations,
// so the counter lives in process memory. That is enough to stop a single
// long-running guessing session, but it resets on restart and is not shared
// between instances — the durable version is follow-up work (see report).
// ─────────────────────────────────────────────────────────────────────────────

const OTP_MAX_ATTEMPTS =
  envInt('OTP_MAX_ATTEMPTS', 5);

const OTP_LOCKOUT_MS =
  envWindowMs('OTP_LOCKOUT_MINUTES', 15);

const otpAttempts = new Map();

function attemptKey(email, type) {

  return `${type}:${String(email || '').trim().toLowerCase()}`;

}

// Cheap sweep so the map cannot grow without bound.
function pruneOtpAttempts(now) {

  for (const [key, entry] of otpAttempts) {

    if (entry.resetAt <= now) {
      otpAttempts.delete(key);
    }

  }

}

// Returns the number of milliseconds left in the lockout, or 0 if not locked.
function otpLockoutRemainingMs(email, type) {

  if (isTestEnv()) {
    return 0;
  }

  const now = Date.now();
  const entry = otpAttempts.get(attemptKey(email, type));

  if (!entry || entry.resetAt <= now) {
    return 0;
  }

  return entry.count >= OTP_MAX_ATTEMPTS
    ? entry.resetAt - now
    : 0;

}

function recordFailedOtpAttempt(email, type) {

  if (isTestEnv()) {
    return 0;
  }

  const now = Date.now();

  pruneOtpAttempts(now);

  const key = attemptKey(email, type);
  const entry = otpAttempts.get(key);

  if (!entry || entry.resetAt <= now) {

    otpAttempts.set(key, {
      count: 1,
      resetAt: now + OTP_LOCKOUT_MS
    });

    return 1;

  }

  entry.count += 1;

  return entry.count;

}

function clearOtpAttempts(email, type) {

  otpAttempts.delete(attemptKey(email, type));

}

module.exports = {
  loginLimiters,
  otpVerifyLimiters,
  otpRequestLimiters,
  otpRequestIpLimiter,
  otpRequestEmailLimiter,
  applicationLimiters,
  applicationIpLimiter,
  otpLockoutRemainingMs,
  recordFailedOtpAttempt,
  clearOtpAttempts,
  OTP_MAX_ATTEMPTS
};
