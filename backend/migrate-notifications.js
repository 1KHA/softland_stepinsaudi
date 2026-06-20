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
  console.log('Migrating notifications...');

  const notifications = await all(`
    SELECT *
    FROM notifications
    WHERE user_id IN (
      SELECT id FROM users
    )
    AND (
      related_company_id IS NULL
      OR related_company_id IN (
        SELECT id FROM companies
      )
    )
  `);

  let migrated = 0;
  let skipped = 0;

  for (const notification of notifications) {
    const existing = await prisma.notifications.findUnique({
      where: {
        id: notification.id
      }
    }).catch(() => null);

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.notifications.create({
      data: {
        id: notification.id,
        user_id: notification.user_id,
        message: notification.message,
        type: notification.type,
        related_company_id: notification.related_company_id,
        is_read: notification.is_read,
        created_at: notification.created_at
          ? new Date(notification.created_at)
          : null,
        message_ar: notification.message_ar
      }
    });

    migrated++;
  }

  console.log(`Migrated: ${migrated}`);
  console.log(`Skipped: ${skipped}`);
  console.log('DONE');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });