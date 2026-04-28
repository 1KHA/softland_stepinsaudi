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

  // 🏢 companies
  db.run(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT,
      industry TEXT,
      phone TEXT,
      description TEXT
    )
  `);

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

});

module.exports = db;