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

});

module.exports = db;