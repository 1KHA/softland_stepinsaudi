// R-13: no hardcoded JWT secret fallback exists any more, so an unset
// JWT_SECRET must stop the process at boot rather than silently signing
// and verifying tokens with `undefined`.
if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is not set. Refusing to start: tokens cannot be signed or verified. ' +
    'Set JWT_SECRET in backend/.env (local) or in the service environment (Render).'
  );
}

const cors = require('cors');
const helmet = require('helmet');
const express = require('express');
const app = express();
// NOTE: src/db.js (SQLite bootstrap) is no longer required here.
// Schema creation/migration is now owned by Prisma (prisma/schema.prisma +
// `npx prisma migrate` / `npx prisma db push`) against PostgreSQL.
// db.js is left in place, unused, in case any one-off script still
// references it directly — see migration report for removal guidance.

// R-08: on Render (and behind any reverse proxy) req.ip is the proxy address
// unless the hop count is trusted, which would collapse every client onto one
// rate-limit bucket. Off by default so a direct-to-node deployment cannot be
// spoofed via a forged X-Forwarded-For.
if (process.env.TRUST_PROXY) {

  const hops = Number(process.env.TRUST_PROXY);

  app.set(
    'trust proxy',
    Number.isFinite(hops) ? hops : process.env.TRUST_PROXY
  );

}

// R-18: baseline security headers (nosniff, frameguard, HSTS, no x-powered-by).
// The uploads directory is still served cross-origin to the SPA, so the
// resource policy is relaxed for it — tightening that belongs to the uploads
// phase, which replaces express.static with an authenticated download route.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(express.json());

// R-18: `cors()` with no options reflects any Origin and is effectively
// Access-Control-Allow-Origin: *. Allowlist instead, driven by CORS_ORIGINS
// (comma-separated). The default keeps both local dev servers working.
const DEFAULT_CORS_ORIGINS =
  'http://localhost:5173,http://localhost:8080';

const allowedOrigins =
  (process.env.CORS_ORIGINS || DEFAULT_CORS_ORIGINS)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {

    // No Origin header: curl, health checks, server-to-server. Not a browser
    // request, so the same-origin policy is not what is protecting anything.
    if (!origin) {
      return callback(null, true);
    }

    return allowedOrigins.includes(origin)
      ? callback(null, true)
      : callback(null, false);

  },
  credentials: true
}));

// R-12: `express.static('uploads')` used to serve every uploaded licence, ID
// and company profile to anyone who guessed the URL, with a content type taken
// from the file extension — so an uploaded .html or .svg executed as stored XSS
// on the API origin. Documents are now behind /files, which checks company
// access and forces an attachment disposition.
const filesRoutes = require('./routes/files.routes');
app.use('/files', filesRoutes);

const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

const companyRoutes = require('./routes/company.routes');
app.use('/companies', companyRoutes);

const stageRoutes = require('./routes/stages.routes');
const taskRoutes = require('./routes/tasks.routes');
const sectorsRoutes = require('./routes/sectors.routes');
app.use('/stages', stageRoutes);
app.use('/tasks', taskRoutes);
app.use('/sectors', sectorsRoutes);

const employeeRoutes = require('./routes/employee.routes');
app.use('/employee', employeeRoutes);

// Landing-page application wizard. POST here is public (rate-limited); every
// read/write against stored submissions is ADMIN-only — the rows are prospect
// PII.
const applicationsRoutes = require('./routes/applications.routes');
app.use('/applications', applicationsRoutes);

app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

// ─────────────────────────────────────────────────────────────────────────────
// R-18: 404 + central error handling. These must stay last — Express matches
// middleware in registration order, so anything mounted below them is dead.
// ─────────────────────────────────────────────────────────────────────────────

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: 'Not found'
  });

});

// eslint-disable-next-line no-unused-vars -- Express identifies the error
// handler by arity; dropping `next` turns this back into normal middleware.
app.use((err, req, res, next) => {

  // Full detail server-side...
  console.error(
    `[error] ${req.method} ${req.originalUrl}`,
    err
  );

  // ...generic message to the client. Express 5 forwards rejected promises
  // here, and its default handler serialises stack traces whenever
  // NODE_ENV !== 'production'. Never echo err.message or err.stack.
  const status =
    Number.isInteger(err && err.status) && err.status >= 400 && err.status < 600
      ? err.status
      : (Number.isInteger(err && err.statusCode) && err.statusCode >= 400 && err.statusCode < 600
        ? err.statusCode
        : 500);

  if (res.headersSent) {
    return next(err);
  }

  res.status(status).json({
    success: false,
    message: status === 500
      ? 'Internal server error'
      : 'Request could not be processed'
  });

});

module.exports = app;                                                                                                                                                                                                                         