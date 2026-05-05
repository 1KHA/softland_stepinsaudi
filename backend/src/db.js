const sqlite3 = require('sqlite3').verbose();

// إنشاء / فتح قاعدة البيانات
const db = new sqlite3.Database('./database.db', (err) => {
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  db.run(`
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT NOT NULL,
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
  (4, 'Entrepreneurial', 'ريادي')
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
INSERT OR IGNORE INTO tasks
(id, stage_id, sector_id, title, description, required, task_order)
VALUES

-- =========================
-- COMMERCIAL
-- =========================

(1, 1, 1, 'Reserve Trade Name', 'Reserve company trade name', 1, 1),
(2, 1, 1, 'Commercial Registration', 'Issue commercial registration', 1, 2),
(3, 1, 1, 'Articles of Association Upload', 'Upload company legal documents', 1, 3),

(4, 2, 1, 'ZATCA Registration', 'Register in ZATCA', 1, 1),
(5, 2, 1, 'Chamber Registration', 'Register in Chamber of Commerce', 1, 2),

(6, 3, 1, 'Municipality License', 'Issue municipality license', 1, 1),
(7, 3, 1, 'Commercial Activity License', 'Issue activity license', 1, 2),

(8, 4, 1, 'Final Legal Review', 'Final company review', 1, 1),

-- =========================
-- ENTREPRENEURIAL
-- =========================

(9, 1, 4, 'Startup Registration', 'Register startup company', 1, 1),
(10, 1, 4, 'Founder Verification', 'Verify founders identity', 1, 2),

(11, 2, 4, 'Innovation Compliance', 'Review innovation requirements', 1, 1),

(12, 3, 4, 'Startup Activity Permit', 'Issue startup permit', 1, 1),

(13, 4, 4, 'Startup Final Review', 'Final startup review', 1, 1),

-- =========================
-- INDUSTRIAL
-- =========================

(14, 1, 2, 'Industrial Registration', 'Register industrial company', 1, 1),

(15, 2, 2, 'Industrial Safety Compliance', 'Safety compliance review', 1, 1),
(16, 2, 2, 'Environmental Compliance', 'Environmental review', 1, 2),

(17, 3, 2, 'Industrial License', 'Issue industrial license', 1, 1),
(18, 3, 2, 'Factory Permit', 'Factory operation permit', 1, 2),

(19, 4, 2, 'Industrial Final Audit', 'Final industrial audit', 1, 1),

-- =========================
-- REAL ESTATE
-- =========================

(20, 1, 3, 'Real Estate Registration', 'Register real estate company', 1, 1),

(21, 2, 3, 'Property Compliance Review', 'Property compliance review', 1, 1),

(22, 3, 3, 'Real Estate License', 'Issue real estate license', 1, 1),

(23, 4, 3, 'Legal Property Review', 'Final legal property review', 1, 1)
`);
});


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

module.exports = db;