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
  console.log('Migrating task_documents...');

  const docs = await all(`
    SELECT *
    FROM task_documents
  `);

  let migrated = 0;
  let skipped = 0;

  for (const doc of docs) {
  try {

    const companyTask = await prisma.company_tasks.findUnique({
      where: { id: doc.company_task_id }
    });

    if (!companyTask) {
  console.log(
    `Missing companyTask: ${doc.company_task_id} (document ${doc.id})`
  );

  skipped++;
  continue;
}

    let uploadedBy = doc.uploaded_by;

    if (uploadedBy) {
      const user = await prisma.users.findUnique({
        where: { id: uploadedBy }
      });

      if (!user) {
        uploadedBy = null;
      }
    }

    await prisma.task_documents.create({
      data: {
        id: doc.id,
        company_task_id: doc.company_task_id,
        file_name: doc.file_name,
        file_url: doc.file_url,
        status: doc.status,
        uploaded_by: uploadedBy,
        uploaded_at: doc.uploaded_at
          ? new Date(doc.uploaded_at)
          : null,
        reviewed_by: doc.reviewed_by,
        reviewed_at: doc.reviewed_at
          ? new Date(doc.reviewed_at)
          : null,
        rejection_reason: doc.rejection_reason,
        task_id: doc.task_id,
        assigned_employee_id: doc.assigned_employee_id,
        required_document_name: doc.required_document_name,
        is_final_license: doc.is_final_license
      }
    });

    migrated++;

  } catch (err) {

  console.log(`Skipping document id ${doc.id}`);
  console.log(err);

  skipped++;
}
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