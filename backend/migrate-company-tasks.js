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
  console.log('Migrating company_tasks...');

  const companyTasks = await all(`
    SELECT *
    FROM company_tasks
    WHERE company_id IN (
      SELECT id FROM companies
    )
    AND task_id IN (
      SELECT id FROM tasks
    )
    AND company_stage_id IN (
      SELECT id FROM company_stages
    )
  `);

  let migrated = 0;
  let skipped = 0;

  for (const task of companyTasks) {
    const existing = await prisma.company_tasks.findUnique({
      where: {
        id: task.id
      }
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.company_tasks.create({
      data: {
        id: task.id,
        company_id: task.company_id,
        task_id: task.task_id,
        company_stage_id: task.company_stage_id,
        status: task.status,
        assigned_employee_id: task.assigned_employee_id,
        completed_at: task.completed_at
          ? new Date(task.completed_at)
          : null,
        requires_documents: task.requires_documents,
        requires_license: task.requires_license,
        admin_note: task.admin_note
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