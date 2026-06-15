const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const authMiddleware = require('../middleware/authMiddleware');
const checkOwnership = require('../middleware/ownership');
const checkRole = require("../middleware/checkRole");

const { generateWorkflow } =
require('../services/workflow.service');

const { sendOTP } =
require("../services/email.service");

const PHONE_REGEX = /^\d{10}$/;

function generateOTP() {

return Math.floor(
100000 +
Math.random() *
900000
).toString();

}

function getExpiry() {

return new Date(
Date.now() +
5 *
60 *
1000
).toISOString();

}

function getResendTime() {

return new Date(
Date.now() +
35 *
1000
).toISOString();

}
// ================= HELPERS =================

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
  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [email],
    callback
  );
}

// ================= REGISTER WITH COMPANY =================

router.post('/register-with-company', async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      company_name,
      manager_name,
      sector_id,
      country,
      phone,
      description,
      founders
    } = req.body;

    if (!email || !password || !company_name) {

      return sendError(
        res,
        400,
        'Missing required fields'
      );

    }

    if (phone && !isValidPhone(phone)) {

      return sendError(
        res,
        400,
        'Phone must be exactly 10 digits'
      );

    }

    // check existing email
    findUserByEmail(
      email,
      async (err, existingUser) => {

        if (err) {

          console.error("DB ERROR:", err);

          return sendError(
            res,
            500,
            "Database error"
          );

        }

        if (existingUser) {

          return sendError(
            res,
            400,
            'Email already exists'
          );

        }
const otp =
generateOTP();

db.run(
`
DELETE FROM otp_requests
WHERE email = ?
AND type = 'REGISTER'
`,
[email]
);

db.run(
`
INSERT INTO otp_requests
(
email,
otp,
type,
payload,
expires_at,
resend_after
)
VALUES
(
?,
?,
?,
?,
?,
?
)
`,
[
email,
otp,
'REGISTER',

JSON.stringify(
req.body
),

getExpiry(),

getResendTime()
],

async (otpErr) => {

if (otpErr) {

console.log(
otpErr
);

return sendError(
res,
500,
'OTP error'
);

}

try {

await sendOTP(
email,
otp
);

return sendSuccess(
res,
'OTP sent',
{
requiresOTP:
true
}
);

}

catch {

return sendError(
res,
500,
'Email failed'
);

}

}
);

return;
        // hash password
        const hashedPassword =
          await bcrypt.hash(password, 10);

        // create company
        db.run(
          `
          INSERT INTO companies
          (
            name,
            manager_name,
            country,
            sector_id,
            description,
            phone,
            email,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            company_name,
            manager_name || name,
            country,
            sector_id,
            description || "",
            phone || "",
            email,
            "PENDING"
          ],

          function (err) {

if (err) {

  console.error(
    "Company insert error:",
    err
  );

  return sendError(
    res,
    500,
    "Error creating company"
  );

}

            const companyId = this.lastID;

            // Send notification to all admins
db.all(
  `SELECT id FROM users WHERE role = 'ADMIN'`,
  [],
  (err, admins) => {
    if (err) {
      console.error("Failed to fetch admins:", err);
      return;
    }

    admins.forEach((admin) => {
      db.run(
        `
        INSERT INTO notifications
        (user_id, message, type, is_read)
        VALUES (?, ?, ?, 0)
        `,
        [
          admin.id,
          `A new company (${company_name}) has registered.`,
          "NEW_COMPANY"
        ]
      );
    });
  }
);

            // generate workflow
            generateWorkflow(companyId, sector_id)
              .then(() => {
                console.log("Workflow generated ✅");
              })
              .catch((err) => {
                console.error(
                  "Workflow generation failed ❌",
                  err
                );
              });

            // founders
            if (
              founders &&
              Array.isArray(founders)
            ) {

              founders.forEach((founderName) => {

                db.run(
                  `
                  INSERT INTO founders
                  (company_id, full_name)
                  VALUES (?, ?)
                  `,
                  [companyId, founderName]
                );

              });

            }

            // create user
            db.run(
              `
              INSERT INTO users
(
  name,
  email,
  password,
  role,
  company_id,
  status
)
VALUES (?, ?, ?, ?, ?, ?)
              `,
              [
  name,
  email,
  hashedPassword,
  "CLIENT",
  companyId,
  "ACTIVE"
],

              function (err) {

                if (err) {

                  console.error(
                    "User insert error:",
                    err
                  );
                  if (
                    isDuplicateEmailError(err)
                  ) {

                    return sendError(
                      res,
                      400,
                      "Email already exists"
                    );

                  }

                  return sendError(
                    res,
                    500,
                    "Error creating user"
                  );

                }

                const token = jwt.sign(
                  {
                    id: this.lastID,
                    role: 'CLIENT',
                    company_id: companyId
                  },
                  process.env.JWT_SECRET || 'secret_key',
                  {
                    expiresIn: '7d'
                  }
                );

                sendSuccess(
                  res,
                  'User & Company created ✅',
                  {
                    token,

                    user: {
                      id: this.lastID,
                      name,
                      email,
                      role: 'CLIENT',
                      company_id: companyId
                    }
                  }
                );

              }
            );

          }
        );

      }
    );

  } catch (err) {

    console.error(err);

    sendError(
      res,
      500,
      'Server error'
    );

  }

});

// ================= LOGIN =================
router.post('/login', async (req, res) => {

try {

const {
email,
password
} = req.body;

if (
!email ||
!password
) {

return sendError(
res,
400,
'Email and password are required'
);

}

findUserByEmail(

email,

async (
err,
user
) => {

if (err) {

console.error(err);

return sendError(
res,
500,
'Database error'
);

}

if (!user) {

return sendError(
res,
401,
'Invalid credentials'
);

}

if (
user.status &&
user.status.toUpperCase() === 'INACTIVE'
) {

return sendError(
res,
403,
'Your account has been deactivated'
);

}

const isMatch =
await bcrypt.compare(
password,
user.password
);

if (!isMatch) {

return sendError(
res,
401,
'Invalid credentials'
);

}

// إنشاء OTP
const otp =
generateOTP();

// حذف أي OTP قديم
db.run(
`
DELETE FROM otp_requests
WHERE email = ?
AND type = 'LOGIN'
`,
[email]
);

// حفظ OTP
db.run(
`
INSERT INTO otp_requests
(
email,
otp,
type,
expires_at,
resend_after
)
VALUES
(
?,
?,
?,
?,
?
)
`,
[
email,
otp,
'LOGIN',
getExpiry(),
getResendTime()
],

async (otpErr) => {

if (otpErr) {

console.log(otpErr);

return sendError(
res,
500,
'OTP error'
);

}

try {

await sendOTP(
email,
otp
);

return sendSuccess(
res,
'OTP sent',
{
requiresOTP:
true
}
);

}

catch (mailErr) {

console.log(
mailErr
);

return sendError(
res,
500,
'Email failed'
);

}

}

);

}

);

}

catch (error) {

console.error(error);

return sendError(
res,
500,
'Server error'
);

}

});
router.post(
"/verify-login-otp",

async (
req,
res
) => {

try {

const {
email,
otp
} = req.body;

if (
!email ||
!otp
) {

return sendError(
res,
400,
"OTP required"
);

}

db.get(

`
SELECT *
FROM otp_requests
WHERE email = ?
AND otp = ?
AND type = 'LOGIN'
`,

[
email,
otp
],

(
err,
otpRow
) => {

if (
err
) {

return sendError(
res,
500,
"Database error"
);

}

if (
!otpRow
) {

return sendError(
res,
400,
"رمز التحقق غير صحيح"
);

}

if (
new Date(
otpRow.expires_at
) < new Date()
) {

return sendError(
res,
400,
"انتهت صلاحية الرمز"
);

}

findUserByEmail(

email,

async (
err,
user
) => {

if (
err ||
!user
) {

return sendError(
res,
404,
"User not found"
);

}

const token =
jwt.sign(

{
id:
user.id,

role:
user.role,

company_id:
user.company_id

},

process.env.JWT_SECRET
||
"secret_key",

{
expiresIn:
"7d"
}

);

db.run(

`
DELETE FROM otp_requests
WHERE email = ?
AND type = 'LOGIN'
`,

[
email
]

);

return sendSuccess(

res,

"Login successful ✅",

{

token,

user: {

id:
user.id,

name:
user.name,

email:
user.email,

role:
user.role,

company_id:
user.company_id

}

}

);

}

);

}

);

}

catch (
error
) {

console.log(
error
);

return sendError(
res,
500,
"Server error"
);

}

}
);
// ================= CURRENT USER =================

router.get(
  '/me',
  authMiddleware,
  (req, res) => {

    res.json({
      message: 'Current user',
      user: req.user
    });

  }
);

// ================= OWNERSHIP TEST =================

router.get(
  "/company/:companyId",
  authMiddleware,
  checkOwnership,
  (req, res) => {

    res.json({
      message: "هذا بيانات شركتك فقط ✅"
    });

  }
);

// ================= ADMIN TEST =================

router.get(
  "/admin-only",
  authMiddleware,
  checkRole("ADMIN"),
  (req, res) => {

    res.json({
      message: "Welcome Admin 🔥"
    });

  }
);

// ================= CREATE ADMIN =================

router.post(
  "/create-admin",
  async (req, res) => {

    try {

      const {
        name,
        email,
        password
      } = req.body;

      findUserByEmail(
        email,
        async (err, user) => {

          if (err) {

            console.error(
              "DB ERROR:",
              err
            );

            return sendError(
              res,
              500,
              "Database error"
            );

          }

          if (user) {

            return sendError(
              res,
              400,
              "Email already exists"
            );

          }

          const hashedPassword =
            await bcrypt.hash(password, 10);

          db.run(
            `
            INSERT INTO users
(
  name,
  email,
  password,
  role,
  company_id,
  status
)
VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
  name,
  email,
  hashedPassword,
  "ADMIN",
  null,
  "ACTIVE"
],

            function (err) {

              if (err) {

                if (
                  isDuplicateEmailError(err)
                ) {

                  return sendError(
                    res,
                    400,
                    "Email already exists"
                  );

                }

                console.error(
                  "Admin insert error:",
                  err
                );

                return sendError(
                  res,
                  500,
                  "Error creating admin"
                );

              }

              sendSuccess(
                res,
                "Admin created successfully 🔥",
                {
                  admin_id: this.lastID
                }
              );

            }
          );

        }
      );

    } catch (err) {

      console.error(err);

      sendError(
        res,
        500,
        "Server error"
      );

    }

  }
);

// ================= CREATE EMPLOYEE =================

router.post(
  "/users/employee",
  authMiddleware,
  checkRole(["ADMIN", "CLIENT"]),
  async (req, res) => {

    try {

      const {
        name,
        email,
        password,
        company_id
      } = req.body;

      const companyId =
        req.user.role === "ADMIN"
          ? company_id
          : req.user.company_id;

      if (!companyId) {

        return sendError(
          res,
          400,
          "Company is required"
        );

      }

      findUserByEmail(
        email,
        async (findErr, existingUser) => {

          if (findErr) {

            console.error(
              "DB ERROR:",
              findErr
            );

            return sendError(
              res,
              500,
              "Database error"
            );

          }

          if (existingUser) {

            return sendError(
              res,
              400,
              "Email already exists"
            );

          }

          const hashedPassword =
            await bcrypt.hash(password, 10);

          db.run(
            `
            INSERT INTO users
            (
              name,
              email,
              password,
              role,
              company_id
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
              name,
              email,
              hashedPassword,
              "EMPLOYEE",
              companyId
            ],

            function (err) {

              if (err) {

                if (
                  isDuplicateEmailError(err)
                ) {

                  return sendError(
                    res,
                    400,
                    "Email already exists"
                  );

                }

                console.error(
                  "User insert error:",
                  err
                );

                return sendError(
                  res,
                  500,
                  "Error creating employee"
                );

              }

              sendSuccess(
                res,
                "Employee created ✅",
                {
                  employee_id: this.lastID
                }
              );

            }
          );

        }
      );

    } catch (err) {

      console.error(err);

      sendError(
        res,
        500,
        "Server error"
      );

    }

  }
);

// ================= GET EMPLOYEES =================

router.get(
  "/users/employees",
  authMiddleware,
  checkRole(["ADMIN", "CLIENT"]),
  (req, res) => {

    const companyId =
      req.user.role === "ADMIN"
        ? req.query.company_id
        : req.user.company_id;

    if (!companyId) {

      return sendError(
        res,
        400,
        "Company ID is required"
      );

    }

    db.all(
      `
      SELECT
        id,
        name,
        email,
        role
      FROM users
      WHERE company_id = ?
      AND role = 'EMPLOYEE'
      `,
      [companyId],

      (err, rows) => {

        if (err) {

          console.error(
            "Employees fetch error:",
            err
          );

          return sendError(
            res,
            500,
            "Error fetching employees"
          );

        }

        sendSuccess(
          res,
          "Employees fetched successfully",
          {
            employees: rows
          }
        );

      }
    );

  }
);

// ===== PUT USER =====
router.put(
  "/users/:id",
  authMiddleware,
  async (req, res) => {

    try {

const { id } = req.params;

const {
  name,
  email,
  password,
  company_id,
  status
} = req.body;

let finalPassword = null;

if (password && password.trim() !== "") {
  finalPassword = await bcrypt.hash(password, 10);
}

db.run(
  `
  UPDATE users
  SET
    name = ?,
    email = ?,
    password = COALESCE(?, password),
    company_id = ?,
    status = ?
  WHERE id = ?
  `,
  [
    name,
    email,
    finalPassword,
    company_id,
    status,
    id
  ],

function (err) {
  if (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Error updating user"
    });
  }

  // إذا كان المستخدم Client حدّث إيميل الشركة أيضاً
  db.get(
    `
    SELECT role, company_id
    FROM users
    WHERE id = ?
    `,
    [id],
    (findErr, user) => {

      if (
        !findErr &&
        user &&
        user.role === "CLIENT" &&
        user.company_id
      ) {
        db.run(
          `
          UPDATE companies
          SET email = ?
          WHERE id = ?
          `,
          [email, user.company_id]
        );
      }

      res.json({
        success: true,
        message: "User updated successfully"
      });

    }
  );
}
);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: "Server error"
      });

    }

  }
);


// ====== DELETE USER =======
router.delete(
  "/users/:id",
  authMiddleware,
  async (req, res) => {

    try {

      const { id } = req.params;

      db.get(
        `
        SELECT role, company_id
        FROM users
        WHERE id = ?
        `,
        [id],

        (err, user) => {

          if (err || !user) {
            return res.status(404).json({
              success: false,
              message: "User not found"
            });
          }

          // إذا كان Client احذف كل بيانات الشركة أولاً
          if (user.role === "CLIENT" && user.company_id) {

            const companyId = user.company_id;

            db.run(
  `
  DELETE FROM task_documents
  WHERE company_task_id IN (
    SELECT id
    FROM company_tasks
    WHERE company_id = ?
  )
  `,
  [companyId]
);

  db.run(
    `DELETE FROM company_tasks WHERE company_id = ?`,
    [companyId]
  ); 

              db.run(
              `DELETE FROM company_stages WHERE company_id = ?`,
              [companyId]
            );

            db.run(
              `DELETE FROM founders WHERE company_id = ?`,
              [companyId]
            );

            db.run(
              `DELETE FROM companies WHERE id = ?`,
              [companyId]
            );
          }

          // حذف المستخدم
          db.run(
            `
            DELETE FROM users
            WHERE id = ?
            `,
            [id],

            function (deleteErr) {

              if (deleteErr) {

                console.error(deleteErr);

                return res.status(500).json({
                  success: false,
                  message: "Error deleting user"
                });

              }

              res.json({
                success: true,
                message: "User deleted successfully"
              });

            }
          );

        }
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: "Server error"
      });

    }

  }
);

// ===== UPDATE USER STATUS =====
router.put(
  "/users/:id/status",
  authMiddleware,
  (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    db.run(
      `
      UPDATE users
      SET status = ?
      WHERE id = ?
      `,
      [status, id],

      function (err) {

  if (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Error updating status"
    });

  }

  // جلب معلومات المستخدم
  db.get(
    `
    SELECT company_id, role
    FROM users
    WHERE id = ?
    `,
    [id],
    (err2, user) => {

      if (err2 || !user) {
        return res.json({
          success: true,
          message: "Status updated successfully"
        });
      }

      // إذا كان CLIENT فقط، غيّر حالة الشركة معه
      if (user.role === "CLIENT") {

        db.run(
          `
          UPDATE companies
          SET status = ?
          WHERE id = ?
          `,
          [
            status === "ACTIVE"
              ? "UNDER_REVIEW"
              : "DISABLED",
            user.company_id
          ]
        );

      }

      res.json({
        success: true,
        message: "Status updated successfully"
      });

    }
  );

}
    );
  }
);

// ================= GET ALL USERS (ADMIN) =================
router.get(
  "/users",
  authMiddleware,

  async (req, res) => {

    try {

      db.all(
        `
SELECT
  u.id,
  u.name,
  u.email,
  u.role,
  u.status,
  u.company_id,
  c.name AS company
FROM users u
LEFT JOIN companies c
ON u.company_id = c.id
ORDER BY u.id DESC
        `,

        [],

        (err, users) => {

          if (err) {

            console.error(err);

            return res.status(500).json({
              success: false,
              message: "Error fetching users"
            });

          }

          res.json({
            success: true,
            users
          });

        }
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: "Server error"
      });

    }

  }
);


// ================ GET ALL COMPANIES ==================
router.get(
  "/companies",
  authMiddleware,

  async (req, res) => {

    try {
      console.log("AUTH COMPANIES ROUTE");
console.log("DB FILE=", db.filename);
      db.all(
  `
SELECT
  c.*,
  s.name_en,
  s.name_ar,

  (
    SELECT COUNT(*)
    FROM company_stages cs
    WHERE cs.company_id = c.id
    AND cs.status = 'COMPLETED'
  ) AS completed_stages,

  (
    SELECT COUNT(*)
    FROM company_stages cs
    WHERE cs.company_id = c.id
  ) AS total_stages,

  (
    SELECT st.name
    FROM company_stages cs
    JOIN stages st
    ON cs.stage_id = st.id
    WHERE cs.company_id = c.id
    AND cs.status = 'IN_PROGRESS'
    LIMIT 1
  ) AS current_stage

FROM companies c
LEFT JOIN sectors s
ON c.sector_id = s.id

ORDER BY c.id DESC
  `,
        [],

       (err, companies) => {

  if (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Error fetching companies"
    });

  }

  db.all(
    `
    SELECT
      company_id,
      full_name
    FROM founders
    `,
    [],
    (foundersErr, founders) => {

      if (foundersErr) {

        console.error(foundersErr);

        return res.status(500).json({
          success: false,
          message: "Error fetching founders"
        });

      }

      companies.forEach((company) => {

        company.founders = founders
          .filter(
            (f) => f.company_id === company.id
          )
          .map(
            (f) => f.full_name
          );

      });

      console.log(companies[0]);

      res.json({
        success: true,
        companies
      });

    }
  );

}
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: "Server error"
      });

    }

  }
);



// ==== EDIT PASSWORD ADMIN ====
router.put(
  "/change-password",
  authMiddleware,

  async (req, res) => {

    try {

      const userId = req.user.id;

      const {
        currentPassword,
        newPassword
      } = req.body;

      db.get(
        `
        SELECT *
        FROM users
        WHERE id = ?
        `,
        [userId],

async (err, user) => {
          if (err) {

            return res.status(500).json({
              success: false,
              message: "Server error"
            });

          }

          if (!user) {

            return res.status(404).json({
              success: false,
              message: "User not found"
            });

          }

const isMatch = await bcrypt.compare(
  currentPassword,
  user.password
);

if (!isMatch) {

  return res.status(400).json({
    success: false,
    message: "Current password is incorrect"
  });

}

const hashedPassword = await bcrypt.hash(
  newPassword,
  10
);

db.run(
  `
  UPDATE users
  SET password = ?
  WHERE id = ?
  `,
  [hashedPassword, userId],

  function (updateErr) {

    if (updateErr) {

      return res.status(500).json({
        success: false,
        message: "Error updating password"
      });

    }

    res.json({
      success: true,
      message: "Password updated successfully"
    });

  }
);

        }
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: "Server error"
      });

    }

  }
);

// ================= LOGOUT =================

router.post(
  "/logout",
  (req, res) => {

    res.json({
      message: "Logged out successfully 👋"
    });

  }
  );

  router.post(
'/verify-register-otp',

async (
req,
res
) => {

try {

const {
email,
otp
} =
req.body;

db.get(
`
SELECT *
FROM otp_requests
WHERE email = ?
AND type =
'REGISTER'
`,
[email],

async (
err,
record
) => {

if (
err
||
!record
) {

return sendError(
res,
404,
'OTP not found'
);

}

if (
record.otp
!== otp
) {

return sendError(
res,
400,
'Invalid OTP'
);

}

if (
new Date()
>
new Date(
record.expires_at
)
) {

return sendError(
res,
400,
'OTP expired'
);

}

const data =
JSON.parse(
record.payload
);

const hashedPassword =
await bcrypt.hash(
data.password,
10
);

// رجعنا للكود القديم
// إنشاء الشركة

db.run(
`
INSERT INTO companies
(
name,
manager_name,
country,
sector_id,
description,
phone,
email,
status
)
VALUES
(
?,
?,
?,
?,
?,
?,
?,
?
)
`,
[
data.company_name,

data.manager_name
||
data.name,

data.country,

data.sector_id,

data.description
||
"",

data.phone
||
"",

data.email,

"PENDING"
],

function (
companyErr
) {

if (
companyErr
) {

return sendError(
res,
500,
'Company error'
);

}

const companyId =
this.lastID;

generateWorkflow(
companyId,
data.sector_id
);

db.run(
`
INSERT INTO users
(
name,
email,
password,
role,
company_id,
status
)
VALUES
(
?,
?,
?,
?,
?,
?
)
`,
[
data.name,

data.email,

hashedPassword,

"CLIENT",

companyId,

"ACTIVE"
],

function (
userErr
) {

if (
userErr
) {

return sendError(
res,
500,
'User error'
);

}

db.run(
`
DELETE
FROM otp_requests
WHERE id = ?
`,
[
record.id
]
);

const token =
jwt.sign(

{

id:
this.lastID,

role:
'CLIENT',

company_id:
companyId

},

process.env.JWT_SECRET
||
'secret_key',

{

expiresIn:
'7d'

}

);

return sendSuccess(
res,
'Account created',
{

token,

user: {

id: this.lastID,

name: data.name,

email: data.email,

role: "CLIENT",

company_id: companyId

}

}

);

}

);

}

);

}

);

}

catch {

return sendError(
res,
500,
'Server error'
);

}

}
);

router.post(
"/forgot-password",

async (req, res) => {

const { email } = req.body;

findUserByEmail(
email,

async (err, user) => {

if (err || !user) {

return sendError(
res,
404,
"Email not found"
);

}

const otp =
generateOTP();

db.run(
`
DELETE FROM otp_requests
WHERE email = ?
AND type = 'RESET_PASSWORD'
`,
[
email
]
);

db.run(
`
INSERT INTO otp_requests
(
email,
otp,
type,
expires_at,
resend_after
)
VALUES
(
?,
?,
?,
?,
?
)
`,
[
email,
otp,
"RESET_PASSWORD",
getExpiry(),
getResendTime()
]
);

await sendOTP(
email,
otp
);

return sendSuccess(
res,
"OTP sent",
{
requiresOTP: true
}
);

}

);

}
);
router.post(
"/reset-password",

async (
req,
res
) => {

const {
email,
otp,
password
} =
req.body;

db.get(
`
SELECT *
FROM otp_requests
WHERE email = ?
AND type =
'RESET_PASSWORD'
`,
[email],

async (
err,
record
) => {

if (
!record
) {

return sendError(
res,
404,
"OTP not found"
);

}

if (
record.otp
!== otp
) {

return sendError(
res,
400,
"Invalid OTP"
);

}

const hashed =
await bcrypt.hash(
password,
10
);

db.run(
`
UPDATE users
SET password = ?
WHERE email = ?
`,
[
hashed,
email
]
);

db.run(
`
DELETE FROM otp_requests
WHERE id = ?
`,
[
record.id
]
);

return sendSuccess(
res,
"Password updated"
);

}

);

}
);

console.log("END OF AUTH FILE");
module.exports = router;