/**
 * verify-row-counts.js
 *
 * Compares row counts between the legacy SQLite database (./database.db)
 * and the live PostgreSQL database (via Prisma / DATABASE_URL) for every
 * table covered by schema.prisma.
 *
 * Usage (from backend/ directory, with node_modules installed):
 *   node verification/verify-row-counts.js
 *
 * Exit code 0  => all counts match
 * Exit code 1  => at least one mismatch found (see printed table)
 */

const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const sqlite = new sqlite3.Database(
  path.resolve(__dirname, '..', 'database.db')
);

function sqliteCount(table) {
  return new Promise((resolve, reject) => {
    sqlite.get(
      `SELECT COUNT(*) AS count FROM ${table}`,
      (err, row) => {
        if (err) {
          // table may not exist in the old DB (e.g. was added after cutover)
          return resolve(null);
        }
        resolve(row.count);
      }
    );
  });
}

// Every model defined in prisma/schema.prisma, mapped to its Prisma
// client accessor and the corresponding legacy SQLite table name.
const TABLES = [
  { label: 'companies',                prismaModel: 'companies',                sqliteTable: 'companies' },
  { label: 'company_stages',           prismaModel: 'company_stages',           sqliteTable: 'company_stages' },
  { label: 'company_tasks',            prismaModel: 'company_tasks',            sqliteTable: 'company_tasks' },
  { label: 'founders',                 prismaModel: 'founders',                 sqliteTable: 'founders' },
  { label: 'notifications',            prismaModel: 'notifications',            sqliteTable: 'notifications' },
  { label: 'otp_requests',             prismaModel: 'otp_requests',             sqliteTable: 'otp_requests' },
  { label: 'sectors',                  prismaModel: 'sectors',                  sqliteTable: 'sectors' },
  { label: 'stages',                   prismaModel: 'stages',                   sqliteTable: 'stages' },
  { label: 'task_documents',           prismaModel: 'task_documents',           sqliteTable: 'task_documents' },
  { label: 'task_required_documents',  prismaModel: 'task_required_documents',  sqliteTable: 'task_required_documents' },
  { label: 'tasks',                    prismaModel: 'tasks',                    sqliteTable: 'tasks' },
  { label: 'users',                    prismaModel: 'users',                    sqliteTable: 'users' },
];

async function main() {
  console.log('Comparing row counts: SQLite (./database.db) vs PostgreSQL (Prisma)\n');

  const results = [];
  let hasMismatch = false;
  let hasUnknown = false;

  for (const t of TABLES) {
    const sqliteRows = await sqliteCount(t.sqliteTable);

    let pgRows;
    try {
      pgRows = await prisma[t.prismaModel].count();
    } catch (err) {
      pgRows = null;
    }

    let status;
    if (sqliteRows === null || pgRows === null) {
      status = 'UNKNOWN';
      hasUnknown = true;
    } else if (sqliteRows === pgRows) {
      status = 'MATCH';
    } else {
      status = 'MISMATCH';
      hasMismatch = true;
    }

    results.push({
      table: t.label,
      sqlite: sqliteRows === null ? 'n/a' : sqliteRows,
      postgres: pgRows === null ? 'n/a' : pgRows,
      status
    });
  }

  const colWidths = { table: 26, sqlite: 10, postgres: 10, status: 10 };
  const pad = (str, width) => String(str).padEnd(width);

  console.log(
    pad('TABLE', colWidths.table) +
    pad('SQLITE', colWidths.sqlite) +
    pad('POSTGRES', colWidths.postgres) +
    pad('STATUS', colWidths.status)
  );
  console.log('-'.repeat(56));

  for (const r of results) {
    console.log(
      pad(r.table, colWidths.table) +
      pad(r.sqlite, colWidths.sqlite) +
      pad(r.postgres, colWidths.postgres) +
      pad(r.status, colWidths.status)
    );
  }

  console.log('');

  if (hasMismatch) {
    console.log('❌ One or more tables have mismatched row counts. Review the migrate-*.js scripts for the affected table(s).');
  } else if (hasUnknown) {
    console.log('⚠️  One or more tables could not be compared (missing table or query error). Check database.db path and DATABASE_URL.');
  } else {
    console.log('✅ All row counts match between SQLite and PostgreSQL.');
  }

  sqlite.close();
  await prisma.$disconnect();

  if (hasMismatch) {
    process.exitCode = 1;
  }
}

main().catch(async (err) => {
  console.error('Verification script failed:', err);
  try { sqlite.close(); } catch (_) {}
  try { await prisma.$disconnect(); } catch (_) {}
  process.exitCode = 1;
});
