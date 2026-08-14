// ─────────────────────────────────────────────────────────────────────────────
// Object storage for uploaded documents.
//
// WHY THIS EXISTS
//
// multer used to write straight to `uploads/` on the local filesystem. That is
// fine locally and under docker-compose (which mounts a named volume), but on
// Railway the container disk is EPHEMERAL: every deploy, restart or crash wiped
// every uploaded document while the task_documents rows that point at them
// survived, leaving permanently broken downloads.
//
// This module puts one seam between the routes and wherever the bytes actually
// live, so the same code runs in both places:
//
//   S3 configured   -> objects in the bucket, under the `uploads/` prefix
//   not configured  -> the original local `uploads/` directory
//
// Selection is automatic (see `isS3Enabled`), so local development keeps
// working with no AWS credentials and production picks up the bucket with no
// code change.
//
// KEYS
//
// The database stores a RELATIVE filename (see lib/fileUrl.js — `toRelative`
// normalises legacy absolute URLs). That same relative value is the disk path
// under UPLOADS_DIR and, in S3, the object key with the `uploads/` prefix
// added. Nothing about the storage backend leaks into the database, so the two
// backends stay interchangeable and a row written by one resolves under the
// other once the object is copied across.
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

const { UPLOADS_DIR, toRelative } = require('./fileUrl');

const S3_PREFIX = 'uploads/';

// Cached across calls: constructing a client per request would rebuild the
// signer and the HTTP agent every time.
let cachedClient = null;
let cachedSdk = null;

function s3Config() {
  return {
    bucket: process.env.AWS_S3_BUCKET_NAME,
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
    endpoint: process.env.AWS_ENDPOINT_URL || undefined,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  };
}

// S3 is used only when the bucket AND both credentials are present. A partial
// configuration falls back to disk rather than failing every upload at runtime.
function isS3Enabled() {
  const c = s3Config();
  return Boolean(c.bucket && c.accessKeyId && c.secretAccessKey);
}

function getSdk() {
  if (!cachedSdk) {
    // Required lazily so a deployment without the bucket configured does not
    // pay the SDK's load cost, and so a missing optional dependency cannot stop
    // the process from booting.
    cachedSdk = require('@aws-sdk/client-s3');
  }
  return cachedSdk;
}

function getClient() {

  if (cachedClient) {
    return cachedClient;
  }

  const { S3Client } = getSdk();
  const c = s3Config();

  cachedClient = new S3Client({
    region: c.region,
    endpoint: c.endpoint,
    // Railway's bucket service (and MinIO, and most S3-compatible providers)
    // address buckets by path rather than by virtual host.
    forcePathStyle: true,
    credentials: {
      accessKeyId: c.accessKeyId,
      secretAccessKey: c.secretAccessKey
    }
  });

  return cachedClient;
}

function objectKey(relative) {
  return S3_PREFIX + relative;
}

// Everything below takes the RELATIVE value as stored in the database. Callers
// that hold a raw column value should pass it through unchanged: each entry
// point normalises via toRelative() so legacy absolute URLs keep resolving.

function normalise(stored) {
  return toRelative(stored);
}

function diskPathFor(relative) {

  const absolute = path.resolve(UPLOADS_DIR, relative);

  // toRelative() already rejects traversal, but the join is re-checked here so
  // this module is safe to call with any string.
  if (
    absolute !== UPLOADS_DIR &&
    !absolute.startsWith(UPLOADS_DIR + path.sep)
  ) {
    return null;
  }

  return absolute;
}

// ─────────────────────────────────────────────────────────────────────────────
// put(relative, buffer, contentType)
//
// Writes the bytes and returns the relative key that should be stored in the
// database.
// ─────────────────────────────────────────────────────────────────────────────
async function put(relative, buffer, contentType) {

  const rel = normalise(relative);

  if (!rel) {
    throw new Error('storage.put: invalid key');
  }

  if (isS3Enabled()) {

    const { PutObjectCommand } = getSdk();

    await getClient().send(new PutObjectCommand({
      Bucket: s3Config().bucket,
      Key: objectKey(rel),
      Body: buffer,
      // Recorded for provenance only. Downloads are always served as
      // application/octet-stream regardless (see routes/files.routes.js), so a
      // spoofed type here cannot turn into stored XSS.
      ContentType: contentType || 'application/octet-stream'
    }));

    return rel;
  }

  const absolute = diskPathFor(rel);

  if (!absolute) {
    throw new Error('storage.put: refusing to write outside uploads/');
  }

  await fs.promises.mkdir(path.dirname(absolute), { recursive: true });
  await fs.promises.writeFile(absolute, buffer);

  return rel;
}

// ─────────────────────────────────────────────────────────────────────────────
// getStream(stored) -> { stream, size } | null
//
// null means "not found", which callers translate into a 404. `size` may be
// null when the backend does not report it; the caller then omits
// Content-Length rather than sending a wrong one.
// ─────────────────────────────────────────────────────────────────────────────
async function getStream(stored) {

  const rel = normalise(stored);

  if (!rel) {
    return null;
  }

  if (isS3Enabled()) {

    const { GetObjectCommand } = getSdk();

    try {

      const out = await getClient().send(new GetObjectCommand({
        Bucket: s3Config().bucket,
        Key: objectKey(rel)
      }));

      return {
        stream: out.Body,
        size: typeof out.ContentLength === 'number' ? out.ContentLength : null
      };

    } catch (err) {

      const code = err && (err.name || err.Code);

      if (code === 'NoSuchKey' || code === 'NotFound' || err?.$metadata?.httpStatusCode === 404) {
        return null;
      }

      throw err;
    }
  }

  const absolute = diskPathFor(rel);

  if (!absolute) {
    return null;
  }

  let stat;

  try {
    stat = await fs.promises.stat(absolute);
  } catch {
    return null;
  }

  if (!stat.isFile()) {
    return null;
  }

  return {
    stream: fs.createReadStream(absolute),
    size: stat.size
  };
}

async function exists(stored) {

  const rel = normalise(stored);

  if (!rel) {
    return false;
  }

  if (isS3Enabled()) {

    const { HeadObjectCommand } = getSdk();

    try {
      await getClient().send(new HeadObjectCommand({
        Bucket: s3Config().bucket,
        Key: objectKey(rel)
      }));
      return true;
    } catch {
      return false;
    }
  }

  const absolute = diskPathFor(rel);

  if (!absolute) {
    return false;
  }

  try {
    return (await fs.promises.stat(absolute)).isFile();
  } catch {
    return false;
  }
}

async function remove(stored) {

  const rel = normalise(stored);

  if (!rel) {
    return false;
  }

  if (isS3Enabled()) {

    const { DeleteObjectCommand } = getSdk();

    try {
      await getClient().send(new DeleteObjectCommand({
        Bucket: s3Config().bucket,
        Key: objectKey(rel)
      }));
      return true;
    } catch {
      return false;
    }
  }

  const absolute = diskPathFor(rel);

  if (!absolute) {
    return false;
  }

  try {
    await fs.promises.unlink(absolute);
    return true;
  } catch {
    return false;
  }
}

// One line at boot so it is obvious in the logs which backend is live —
// the same pattern the email service uses for its transport.
function describe() {

  if (isS3Enabled()) {
    const c = s3Config();
    return `s3 bucket "${c.bucket}" (${c.endpoint || 'aws'}, region ${c.region})`;
  }

  return `local disk ${UPLOADS_DIR} — NOT durable on Railway; uploads are lost on redeploy`;
}

module.exports = {
  isS3Enabled,
  put,
  getStream,
  exists,
  remove,
  describe,
  objectKey,
  S3_PREFIX
};
