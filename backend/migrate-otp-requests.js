const sqlite3 = require('sqlite3').verbose();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const sqlite = new sqlite3.Database('./database.db');

function all(query) {
  return new Promise((resolve, reject) => {
    sqlite.all(query, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function migrate() {
  console.log('Migrating otp_requests...');

  const requests = await all(`
    SELECT *
    FROM otp_requests
  `);

  let migrated = 0;

  for (const req of requests) {
    await prisma.otp_requests.create({
      data: {
        id: req.id,
        email: req.email,
        otp: req.otp,
        type: req.type,
        payload: req.payload,
        expires_at: new Date(req.expires_at),
        resend_after: new Date(req.resend_after),
        created_at: req.created_at
          ? new Date(req.created_at)
          : null
      }
    });

    migrated++;
  }

  console.log(`Migrated: ${migrated}`);
  console.log('DONE');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });