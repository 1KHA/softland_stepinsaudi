// ─────────────────────────────────────────────────────────────────────────────
// Stored file paths and public URLs (risk R-12).
//
// `task_documents.file_url` historically held a fully-qualified URL baked at
// write time — `http://localhost:3000/uploads/<name>`. Two problems:
//
//   * the host is wrong everywhere. The API has not listened on 3000 for a long
//     time (it is 4000 locally, and a Render hostname in production), so every
//     row already in the database points at nothing;
//   * an absolute URL in a data column means the deployment topology is
//     embedded in the data, and changing it requires a migration.
//
// From this phase on the column stores a RELATIVE path — just the filename that
// multer wrote under uploads/. Legacy absolute values keep working because
// every read goes through `toRelative()`, which strips any scheme/host/uploads
// prefix. No data migration is needed, and none should be run: old and new rows
// both resolve.
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

const DEFAULT_PUBLIC_API_URL = 'http://localhost:4000';

// multer writes to the relative directory "uploads/", i.e. relative to the
// process working directory. Resolve it the same way so the download route
// looks in exactly the place the upload route wrote to. UPLOADS_DIR overrides
// it for deployments that mount the volume somewhere else.
const UPLOADS_DIR = path.resolve(
  process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads')
);

function publicApiUrl() {

  const raw = process.env.PUBLIC_API_URL || DEFAULT_PUBLIC_API_URL;

  return String(raw).replace(/\/+$/, '');

}

// ─────────────────────────────────────────────────────────────────────────────
// toRelative(stored)
//
// Accepts anything that has ever been written into file_url and returns the
// stored path relative to the uploads directory:
//
//   'http://localhost:3000/uploads/1700-a.pdf' -> '1700-a.pdf'
//   'https://api.example.com/uploads/1700-a.pdf' -> '1700-a.pdf'
//   '/uploads/1700-a.pdf'                      -> '1700-a.pdf'
//   'uploads/1700-a.pdf'                       -> '1700-a.pdf'
//   '1700-a.pdf'                               -> '1700-a.pdf'
//
// Returns null for empty input or for anything that tries to escape uploads/.
// ─────────────────────────────────────────────────────────────────────────────
function toRelative(stored) {

  if (stored === null || stored === undefined) {
    return null;
  }

  let value = String(stored).trim();

  if (!value) {
    return null;
  }

  // scheme://host[:port] — or a protocol-relative //host — prefix.
  //
  // Deliberately no query/fragment splitting and no percent-decoding here: the
  // legacy write sites concatenated the RAW filename onto the URL without
  // encoding it, and these filenames routinely contain '#' and '&'. Splitting
  // on '#' would truncate them. `toDiskPath()` retries with a decoded form if
  // the raw one is not on disk, which covers any row that did get encoded.
  value = value.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]*/i, '');
  value = value.replace(/^\/\/[^/]*/, '');

  value = value.replace(/\\/g, '/');
  value = value.replace(/^\/+/, '');
  value = value.replace(/^uploads\//i, '');
  value = value.replace(/^\/+/, '');

  if (!value) {
    return null;
  }

  // Path traversal: '../../etc/passwd', or an absolute path smuggled in.
  const normalised = path.posix.normalize(value);

  if (
    normalised.startsWith('..') ||
    normalised.startsWith('/') ||
    normalised.split('/').includes('..')
  ) {
    return null;
  }

  return normalised;
}

// ─────────────────────────────────────────────────────────────────────────────
// toPublicUrl(rel)
//
// Absolute URL for a stored relative path, built from PUBLIC_API_URL rather
// than from a hardcoded host. Note this is the *raw* uploads path: it is only
// meaningful while express.static is mounted, and the authenticated route
// (`toDownloadUrl`) is what callers should use.
// ─────────────────────────────────────────────────────────────────────────────
function toPublicUrl(rel) {

  const relative = toRelative(rel);

  if (!relative) {
    return null;
  }

  const encoded = relative
    .split('/')
    .map(encodeURIComponent)
    .join('/');

  return `${publicApiUrl()}/uploads/${encoded}`;
}

// Absolute URL of the authenticated download endpoint for a document row.
function toDownloadUrl(documentId) {

  const id = Number(documentId);

  if (!Number.isFinite(id)) {
    return null;
  }

  return `${publicApiUrl()}/files/${id}`;
}

function resolveInsideUploads(relative) {

  if (!relative) {
    return null;
  }

  const absolute = path.resolve(UPLOADS_DIR, relative);

  // Belt and braces: even after normalising, refuse anything outside the root.
  if (
    absolute !== UPLOADS_DIR &&
    !absolute.startsWith(UPLOADS_DIR + path.sep)
  ) {
    return null;
  }

  return absolute;
}

// ─────────────────────────────────────────────────────────────────────────────
// toDiskPath(stored)
//
// Absolute path on disk for a stored value, or null when it is unusable or
// missing. Two candidates are tried: the raw relative path (what every write
// site has ever produced) and, only if that is not on disk, a percent-decoded
// form — so a row that was stored URL-encoded still resolves without risking
// the corruption of a filename that legitimately contains '%'.
// ─────────────────────────────────────────────────────────────────────────────
function toDiskPath(stored) {

  const relative = toRelative(stored);

  if (!relative) {
    return null;
  }

  const candidates = [relative];

  if (/%[0-9a-f]{2}/i.test(relative)) {
    try {
      const decoded = toRelative(decodeURIComponent(relative));

      if (decoded && decoded !== relative) {
        candidates.push(decoded);
      }
    } catch {
      // Malformed escape sequence: the raw candidate is all there is.
    }
  }

  let firstResolved = null;

  for (const candidate of candidates) {

    const absolute = resolveInsideUploads(candidate);

    if (!absolute) {
      continue;
    }

    if (firstResolved === null) {
      firstResolved = absolute;
    }

    if (fs.existsSync(absolute)) {
      return absolute;
    }
  }

  // Nothing on disk: return the primary candidate so the caller reports a 404
  // with a usable path in the log rather than a null.
  return firstResolved;
}

module.exports = {
  UPLOADS_DIR,
  publicApiUrl,
  toRelative,
  toPublicUrl,
  toDownloadUrl,
  toDiskPath
};
