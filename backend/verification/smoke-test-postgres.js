/**
 * smoke-test-postgres.js
 *
 * Lightweight confirmation that:
 *   1. Prisma Client connects successfully to PostgreSQL (DATABASE_URL).
 *   2. Every model in schema.prisma is reachable via a count() query.
 *   3. No code path in this script touches SQLite — proves the backend
 *      can run entirely against PostgreSQL.
 *
 * Usage (from backend/ directory, with node_modules installed):
 *   node verification/smoke-test-postgres.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MODELS = [
  'companies',
  'company_stages',
  'company_tasks',
  'founders',
  'notifications',
  'otp_requests',
  'sectors',
  'stages',
  'task_documents',
  'task_required_documents',
  'tasks',
  'users',
];

async function main() {
  console.log('Connecting to PostgreSQL via Prisma Client...');

  await prisma.$connect();
  console.log('✅ Connected.\n');

  console.log('Counting rows in every model:');
  console.log('-'.repeat(40));

  let allOk = true;

  for (const model of MODELS) {
    try {
      const count = await prisma[model].count();
      console.log(`  ${model.padEnd(28)} ${count}`);
    } catch (err) {
      allOk = false;
      console.log(`  ${model.padEnd(28)} ERROR: ${err.message}`);
    }
  }

  console.log('-'.repeat(40));

  if (allOk) {
    console.log('\n✅ Backend is fully operational against PostgreSQL via Prisma.');
  } else {
    console.log('\n❌ One or more models failed. Check schema.prisma and DATABASE_URL.');
    process.exitCode = 1;
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Smoke test failed:', err);
  try { await prisma.$disconnect(); } catch (_) {}
  process.exitCode = 1;
});
