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
  console.log('Migrating company_stages only...');

  const companyStages = await all(`
    SELECT *
    FROM company_stages
    WHERE company_id IN (
      SELECT id FROM companies
    )
    AND stage_id IN (
      SELECT id FROM stages
    )
  `);

  for (const stage of companyStages) {
    try {
      await prisma.company_stages.create({
        data: {
          id: stage.id,
          company_id: stage.company_id,
          stage_id: stage.stage_id,
          status: stage.status,
          progress: stage.progress,
          started_at: stage.started_at
            ? new Date(stage.started_at)
            : null,
          completed_at: stage.completed_at
            ? new Date(stage.completed_at)
            : null
        }
      });
    } catch (err) {
      console.log(`Skipping existing stage id ${stage.id}`);
    }
  }

  console.log('DONE');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });