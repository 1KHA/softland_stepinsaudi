const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const checkOwnership = require('../middleware/ownership');


const checkRole = require("../middleware/checkRole");

const PHONE_REGEX = /^\d{10}$/;

function sendSuccess(res, message, data = {}, status = 200) {
  return res.status(status).json({
    success: true,
    message,
    ...data
  });
}

function sendError(res, status, message, data = {}) {
  return res.status(status).json({
    success: false,
    message,
    ...data
  });
}

function isDuplicateEmailError(err) {
  return err && err.code === 'SQLITE_CONSTRAINT';
}

function isValidPhone(phone) {
  return PHONE_REGEX.test(String(phone || ''));
}

function findUserByEmail(email, callback) {
  db.get(`SELECT * FROM users WHERE email = ?`, [email], callback);
}


// ✅ REGISTER WITH COMPANY
router.post('/register-with-company', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      company_name,
      industry,
      phone,
      description
    } = req.body;

    if (!email || !password || !company_name) {
      return sendError(res, 400, 'Missing required fields');
    }

    if (phone && !isValidPhone(phone)) {
      return sendError(res, 400, 'Phone must be exactly 10 digits');
    }

    // 🔍 تحقق من الايميل
    findUserByEmail(email, async (err, existingUser) => {

      if (err) {
        console.error("DB ERROR:", err);
        return sendError(res, 500, "Database error");
      }

      if (existingUser) {
        return sendError(res, 400, 'Email already exists');
      }

      // 🔐 تشفير الباسورد
      const hashedPassword = await bcrypt.hash(password, 10);

      // 🏢 إنشاء الشركة
      db.run(
        `INSERT INTO companies (company_name, industry, phone, description)
         VALUES (?, ?, ?, ?)`,
        [company_name, industry, phone, description],
        function (err) {

          if (err) {
            console.error("Company insert error:", err);
            return sendError(res, 500, "Error creating company");
          }

          const companyId = this.lastID;

          // 👤 إنشاء المستخدم
          db.run(
            `INSERT INTO users (name, email, password, role, company_id)
             VALUES (?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, 'CLIENT', companyId],
            function (err) {

              if (err) {
                console.error("User insert error:", err);
                if (isDuplicateEmailError(err)) {
                  return sendError(res, 400, "Email already exists");
                }

                return sendError(res, 500, "Error creating user");
              }
const token = jwt.sign(
  {
    id: this.lastID,
    role: 'CLIENT',
    company_id: companyId
  },
  'secret_key',
  { expiresIn: '1d' }
);

sendSuccess(res, 'User & Company created ✅', {
  message: 'User & Company created ✅',
  token,
  user: {
    id: this.lastID,
    name,
    email,
    role: 'CLIENT',
    company_id: companyId
  }
});

            }
          );
        }
      );

    });

  } catch (err) {
    console.error(err);
    sendError(res, 500, 'Server error');
  }
});


// 🔐 LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    findUserByEmail(email, async (err, user) => {

      if (err) {
        console.error("DB ERROR:", err);
        return sendError(res, 500, "Database error");
      }

      if (!user) {
        return sendError(res, 400, 'المستخدم غير موجود');
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return sendError(res, 400, 'كلمة المرور غلط');
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          company_id: user.company_id
        },
        'secret_key',
        { expiresIn: '1d' }
      );

      sendSuccess(res, 'تم تسجيل الدخول 🎉', {
        message: 'تم تسجيل الدخول 🎉',
        token,
        user
      });

    });

  } catch (err) {
    console.error(err);
    sendError(res, 500, 'خطأ في السيرفر');
  }
});


// 🔒 ownership route
router.get(
  "/company/:companyId",
  authMiddleware,
  checkOwnership,
  (req, res) => {
    res.json({ message: "هذا بيانات شركتك فقط ✅" });
  }
);


// 👤 current user
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    message: 'بيانات المستخدم الحالي',
    user: req.user
  });
});

router.get(
  "/admin-only",
  authMiddleware,
  checkRole("ADMIN"),
  (req, res) => {
    res.json({ message: "Welcome Admin 🔥" });
  }
);

router.post(
  "/users/employee",
  authMiddleware,
  checkRole("ADMIN"), // أو ADMIN
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const companyId = req.user.company_id;

      if (!companyId) {
        return sendError(res, 400, "Company is required for this action");
      }

      findUserByEmail(email, async (findErr, existingUser) => {
        if (findErr) {
          console.error("DB ERROR:", findErr);
          return sendError(res, 500, "Database error");
        }

        if (existingUser) {
          return sendError(res, 400, "Email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
          `INSERT INTO users (name, email, password, role, company_id)
           VALUES (?, ?, ?, ?, ?)`,
          [name, email, hashedPassword, "EMPLOYEE", companyId],
          function (err) {   // 👈 هنا مكانها الصحيح

            if (err) {
              if (isDuplicateEmailError(err)) {
                return sendError(res, 400, "Email already exists");
              }

              console.error("User insert error:", err);
              return sendError(res, 500, "Error creating employee");
            }

            sendSuccess(res, "Employee created ✅", {
              message: "Employee created ✅",
              employee_id: this.lastID
            });

          }
        );
      });

    } catch (err) {
      console.error(err);
      sendError(res, 500, "Server error");
    }
  }
);

router.post("/create-admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // تحقق هل الايميل موجود
    findUserByEmail(email, async (err, user) => {
      if (err) {
        console.error("DB ERROR:", err);
        return sendError(res, 500, "Database error");
      }

      if (user) {
        return sendError(res, 400, "Email already exists");
      }

      // تشفير الباسورد
      const hashedPassword = await bcrypt.hash(password, 10);

      // إدخال الأدمن
      db.run(
        `INSERT INTO users (name, email, password, role, company_id)
         VALUES (?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, "ADMIN", null],
        function (err) {
          if (err) {
            if (isDuplicateEmailError(err)) {
              return sendError(res, 400, "Email already exists");
            }

            console.error("Admin insert error:", err);
            return sendError(res, 500, "Error creating admin");
          }

          sendSuccess(res, "Admin created successfully 🔥", {
            message: "Admin created successfully 🔥",
            admin_id: this.lastID,
          });
        }
      );
    });

  } catch (err) {
    console.error(err);
    sendError(res, 500, "Server error");
  }
});

router.get(
  "/users/employees",
  authMiddleware,
  checkRole("ADMIN"),
  (req, res) => {
    const companyId = req.user.company_id;

    db.all(
      "SELECT id, name, email, role FROM users WHERE company_id = ? AND role = 'EMPLOYEE'",
      [companyId],
      (err, rows) => {
        if (err) {
          console.error("Employees fetch error:", err);
          return sendError(res, 500, "Error fetching employees");
        }

        sendSuccess(res, "Employees fetched successfully", {
          employees: rows
        });
      }
    );
  }
);

router.post("/logout", (req, res) => {
  res.json({
    message: "Logged out successfully 👋"
  });
});

// invite emp..
router.post(
  "/users/invite",
  authMiddleware,
  checkRole("CLIENT"), // فقط الكلاينت يقدر يدعو
  async (req, res) => {
    try {
      const { email } = req.body;

      const companyId = req.user.company_id;

      if (!companyId) {
        return sendError(res, 400, "Company is required for this action");
      }

      if (!email) {
        return sendError(res, 400, "Email is required");
      }

      // 🔍 تحقق من وجود المستخدم
      findUserByEmail(email, async (err, user) => {
        if (err) {
          console.error("DB ERROR:", err);
          return sendError(res, 500, "Database error");
        }

        if (user) {
          return sendError(res, 400, "Email already exists");
        }

        // 🔐 باسورد مؤقت
        const tempPassword = "123456";
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // 👤 إنشاء موظف
        db.run(
          `INSERT INTO users (name, email, password, role, company_id)
           VALUES (?, ?, ?, ?, ?)`,
          ["Invited User", email, hashedPassword, "EMPLOYEE", companyId],
          function (err) {
            if (err) {
              if (isDuplicateEmailError(err)) {
                return sendError(res, 400, "Email already exists");
              }

              console.error("Invite insert error:", err);
              return sendError(res, 500, "Error inviting employee");
            }

            sendSuccess(res, "Employee invited ✅", {
              message: "Employee invited ✅",
              employee_id: this.lastID,
              temp_password: tempPassword // للتجربة فقط
            });
          }
        );
      });

    } catch (err) {
      console.error(err);
      sendError(res, 500, "Server error");
    }
  }
);
module.exports = router;