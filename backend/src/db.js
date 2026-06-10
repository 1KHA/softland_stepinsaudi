const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log(
  "DB PATH:",
  path.resolve('./database.db')
);
// إنشاء / فتح قاعدة البيانات
const db = new sqlite3.Database('./database.db', (err) => {
  console.log("DB PATH:", require('path').resolve('./database.db'));
  if (err) {
    console.error('❌ DB Error:', err.message);
  } else {
    console.log('Connected to SQLite ✅');
  }
});

// إنشاء الجداول
db.serialize(() => {

  // 👤 users
  db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('ADMIN', 'EMPLOYEE', 'CLIENT')) NOT NULL,
  company_id INTEGER,
  status TEXT DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
)
  `);
  db.run(`
ALTER TABLE users
ADD COLUMN status TEXT DEFAULT 'ACTIVE'
`, () => {});

  db.run(`
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  country TEXT NOT NULL,
  sector_id INTEGER NOT NULL,
  description TEXT,
  logo_url TEXT,
  branches_count INTEGER,
  phone TEXT,
  email TEXT,
  assigned_employee_id INTEGER,
  status TEXT NOT NULL DEFAULT 'UNDER_REVIEW',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

db.run(`
  CREATE TABLE IF NOT EXISTS founders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    full_name TEXT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS sectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_en TEXT,
    name_ar TEXT
  )
`);

db.run(`
INSERT OR IGNORE INTO sectors (id, name_en, name_ar)
VALUES
(1, 'Commercial', 'تجاري'),
(2, 'Industrial', 'صناعي'),
(3, 'Real Estate', 'عقاري'),
(4, 'Entrepreneurial', 'ريادي'),
(5, 'All Sectors', 'جميع القطاعات')
`);

db.run(`
CREATE TABLE IF NOT EXISTS stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  weight INTEGER DEFAULT 25,
  is_active INTEGER DEFAULT 1
)
`);


db.run(`
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stage_id INTEGER NOT NULL,
  sector_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  required INTEGER DEFAULT 1,
  task_order INTEGER DEFAULT 1,
  is_active INTEGER DEFAULT 1,

  FOREIGN KEY (stage_id) REFERENCES stages(id),
  FOREIGN KEY (sector_id) REFERENCES sectors(id)
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS company_stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  stage_id INTEGER NOT NULL,
  status TEXT DEFAULT 'LOCKED',
  progress INTEGER DEFAULT 0,
  started_at DATETIME,
  completed_at DATETIME,

  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (stage_id) REFERENCES stages(id)
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS company_tasks (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  company_id INTEGER NOT NULL,

  task_id INTEGER NOT NULL,

  company_stage_id INTEGER NOT NULL,

  status TEXT DEFAULT 'PENDING',

  requires_documents INTEGER DEFAULT 1,

  requires_license INTEGER DEFAULT 0,

  assigned_employee_id INTEGER,

  admin_note TEXT,

  completed_at DATETIME,

  FOREIGN KEY (company_id)
  REFERENCES companies(id),

  FOREIGN KEY (task_id)
  REFERENCES tasks(id),

  FOREIGN KEY (company_stage_id)
  REFERENCES company_stages(id),

  FOREIGN KEY (assigned_employee_id)
  REFERENCES users(id)

)
`);

db.run(`
ALTER TABLE company_tasks
ADD COLUMN requires_documents INTEGER DEFAULT 1
`, () => {});

db.run(`
ALTER TABLE company_tasks
ADD COLUMN requires_license INTEGER DEFAULT 0
`, () => {});

db.run(`
ALTER TABLE company_tasks
ADD COLUMN admin_note TEXT
`, () => {});



db.run(`
INSERT OR IGNORE INTO stages (id, name, stage_order, weight)
VALUES
(1, 'Registration', 1, 15),
(2, 'Compliance', 2, 35),
(3, 'Licensing', 3, 40),
(4, 'Final Approval', 4, 10)
`);

db.run(`
UPDATE stages
SET description = 'Initial company registration'
WHERE id = 1
`);

db.run(`
UPDATE stages
SET description = 'Compliance and legal checks'
WHERE id = 2
`);

db.run(`
UPDATE stages
SET description = 'Licensing and permits'
WHERE id = 3
`);

db.run(`
UPDATE stages
SET description = 'Final review and approval'
WHERE id = 4
`);

});


db.run(`
CREATE TABLE IF NOT EXISTS task_required_documents (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  task_id INTEGER NOT NULL,

  document_name TEXT NOT NULL,

  is_required INTEGER DEFAULT 1,

  FOREIGN KEY (task_id)
  REFERENCES tasks(id)

)
`);


db.run(`
CREATE TABLE IF NOT EXISTS task_documents (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  company_task_id INTEGER NOT NULL,

  file_name TEXT NOT NULL,

  file_url TEXT NOT NULL,

  status TEXT DEFAULT 'PENDING',

  uploaded_by INTEGER,

  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  reviewed_by INTEGER,

  reviewed_at DATETIME,

  rejection_reason TEXT,

  FOREIGN KEY (company_task_id)
  REFERENCES company_tasks(id),

  FOREIGN KEY (uploaded_by)
  REFERENCES users(id),

  FOREIGN KEY (reviewed_by)
  REFERENCES users(id)

)
`);

// ─── NOTIFICATIONS TABLE ───────────────────────────────
db.run(`
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'INFO',
  related_company_id INTEGER,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (related_company_id) REFERENCES companies(id)
)
`);

module.exports = db;