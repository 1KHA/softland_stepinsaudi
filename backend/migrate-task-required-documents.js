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
  console.log('Migrating task_required_documents...');

  const documents = await all(`
    SELECT *
    FROM task_required_documents
    WHERE task_id IN (
      SELECT id FROM tasks
    )
  `);

  let migrated = 0;

  for (const doc of documents) {
    await prisma.task_required_documents.create({
      data: {
        id: doc.id,
        task_id: doc.task_id,
        document_name: doc.document_name,
        is_required: doc.is_required,
        document_name_ar: doc.document_name_ar
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