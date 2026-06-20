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
  console.log('Starting Part 2...');

  // FOUNDERS
  const founders = await all(`
    SELECT *
    FROM founders
    WHERE company_id IN (
      SELECT id FROM companies
    )
  `);

  for (const founder of founders) {
    await prisma.founders.create({
      data: {
        id: founder.id,
        company_id: founder.company_id,
        full_name: founder.full_name
      }
    });
  }

  console.log(`Founders migrated: ${founders.length}`);

  // COMPANY STAGES
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
  }

  console.log(`Company Stages migrated: ${companyStages.length}`);

  console.log('DONE');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });