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
  console.log('Starting migration...');

  // =====================
  // SECTORS
  // =====================
  const sectors = await all('SELECT * FROM sectors');

  for (const sector of sectors) {
    await prisma.sectors.create({
      data: {
        id: sector.id,
        name_en: sector.name_en,
        name_ar: sector.name_ar
      }
    });
  }

  console.log(`Sectors migrated: ${sectors.length}`);

  // =====================
  // STAGES
  // =====================
  const stages = await all('SELECT * FROM stages');

  for (const stage of stages) {
    await prisma.stages.create({
      data: {
        id: stage.id,
        name: stage.name,
        stage_order: stage.stage_order,
        weight: stage.weight,
        is_active: stage.is_active,
        description: stage.description,
        workflow_phase: stage.workflow_phase,
        name_ar: stage.name_ar,
        description_ar: stage.description_ar
      }
    });
  }

  console.log(`Stages migrated: ${stages.length}`);

  // =====================
  // TASKS
  // =====================
  const tasks = await all('SELECT * FROM tasks');

  for (const task of tasks) {
    await prisma.tasks.create({
      data: {
        id: task.id,
        stage_id: task.stage_id,
        sector_id: task.sector_id,
        title: task.title,
        description: task.description,
        required: task.required,
        task_order: task.task_order,
        is_active: task.is_active,
        task_type: task.task_type,
        is_global: task.is_global,
        title_ar: task.title_ar,
        description_ar: task.description_ar
      }
    });
  }

  console.log(`Tasks migrated: ${tasks.length}`);

  // =====================
  // COMPANIES
  // =====================
  const companies = await all('SELECT * FROM companies');

  for (const company of companies) {
    await prisma.companies.create({
      data: {
        id: company.id,
        name: company.name,
        manager_name: company.manager_name,
        country: company.country || '',
        sector_id: Number(company.sector_id),
        description: company.description,
        logo_url: company.logo_url,
        branches_count:
          company.branches_count &&
          company.branches_count !== ''
            ? Number(company.branches_count)
            : null,
        phone: company.phone,
        email: company.email,
        assigned_employee_id: company.assigned_employee_id,
        status: company.status,
        created_at: company.created_at
          ? new Date(company.created_at)
          : null,
        profile_file_url: company.profile_file_url
      }
    });
  }

  console.log(`Companies migrated: ${companies.length}`);

  // =====================
  // USERS
  // =====================
  const users = await all('SELECT * FROM users');

  for (const user of users) {
    await prisma.users.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        company_id: null,
        status: user.status,
        created_at: user.created_at
          ? new Date(user.created_at)
          : null
      }
    });
  }

  console.log(`Users migrated: ${users.length}`);
// founders
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


// company_stages
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
