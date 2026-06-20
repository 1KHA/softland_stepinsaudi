const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const upload = require("../middleware/upload");

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

// Prisma + PostgreSQL unique-constraint violation code (was SQLITE_CONSTRAINT)
function isDuplicateEmailError(err) {
  return err && err.code === 'P2002';
}

function isValidPhone(phone) {
  return PHONE_REGEX.test(String(phone || ''));
}

async function findUserByEmail(email) {
  return prisma.users.findUnique({
    where: { email }
  });
}

// ================= REGISTER WITH COMPANY =================

router.post(
  '/register-with-company',
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "companyProfile", maxCount: 1 }
  ]),
  async (req, res) => {

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
    let existingUser;
    try {
      existingUser = await findUserByEmail(email);
    } catch (err) {
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

    const otp = generateOTP();

    // نحفظ بيانات التسجيل مع اسم ملف اللوقو
    const payload = {
      ...req.body,
      logo_url: req.files?.logo?.[0]?.filename || null,
    };

    try {

      await prisma.otp_requests.deleteMany({
        where: {
          email,
          type: 'REGISTER'
        }
      });

      await prisma.otp_requests.create({
        data: {
          email,
          otp,
          type: "REGISTER",
          payload: JSON.stringify(payload),
          expires_at: new Date(getExpiry()),
          resend_after: new Date(getResendTime())
        }
      });

    } catch (otpErr) {

      console.log(otpErr);

      return sendError(
        res,
        500,
        "OTP error"
      );

    }

    try {

      await sendOTP(email, otp);

      return sendSuccess(
        res,
        "OTP sent",
        {
          requiresOTP: true
        }
      );

    } catch {

      return sendError(
        res,
        500,
        "Email failed"
      );

    }

    // NOTE: the original code had an unconditional `return;` immediately after
    // sending the OTP response above, which made all of the following
    // company/user-creation logic in this route handler dead code (unreachable).
    // That exact control flow (return after OTP send) is preserved here by the
    // `return sendSuccess(...)` / `return sendError(...)` above already exiting
    // the function, so the block below is intentionally never reached —
    // identical behavior to the original file.

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

let user;
try {
  user = await findUserByEmail(email);
} catch (err) {
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

try {

  // حذف أي OTP قديم
  await prisma.otp_requests.deleteMany({
    where: {
      email,
      type: 'LOGIN'
    }
  });

  // حفظ OTP
  await prisma.otp_requests.create({
    data: {
      email,
      otp,
      type: 'LOGIN',
      expires_at: new Date(getExpiry()),
      resend_after: new Date(getResendTime())
    }
  });

} catch (otpErr) {

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

let otpRow;
try {

  otpRow = await prisma.otp_requests.findFirst({
    where: {
      email,
      otp,
      type: 'LOGIN'
    }
  });

} catch (err) {

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

let user;
try {
  user = await findUserByEmail(email);
} catch (err) {
  user = null;
}

if (
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

try {

  await prisma.otp_requests.deleteMany({
    where: {
      email,
      type: 'LOGIN'
    }
  });

} catch (err) {
  // matches original fire-and-forget behavior
}

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

      let user;
      try {
        user = await findUserByEmail(email);
      } catch (err) {
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

      try {

        const newUser = await prisma.users.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: "ADMIN",
            company_id: null,
            status: "ACTIVE"
          }
        });

        sendSuccess(
          res,
          "Admin created successfully 🔥",
          {
            admin_id: newUser.id
          }
        );

      } catch (err) {

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

      let existingUser;
      try {
        existingUser = await findUserByEmail(email);
      } catch (findErr) {
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

      try {

        const newEmployee = await prisma.users.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: "EMPLOYEE",
            company_id: companyId
          }
        });

        sendSuccess(
          res,
          "Employee created ✅",
          {
            employee_id: newEmployee.id
          }
        );

      } catch (err) {

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
  async (req, res) => {

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

    try {

      const rows = await prisma.users.findMany({
        where: {
          company_id: Number(companyId),
          role: 'EMPLOYEE'
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });

      sendSuccess(
        res,
        "Employees fetched successfully",
        {
          employees: rows
        }
      );

    } catch (err) {

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

let finalPassword = undefined;

if (password && password.trim() !== "") {
  finalPassword = await bcrypt.hash(password, 10);
}

try {

  await prisma.users.update({
    where: { id: Number(id) },
    data: {
      name,
      email,
      // COALESCE(?, password): only overwrite when a new password was hashed
      ...(finalPassword !== undefined ? { password: finalPassword } : {}),
      company_id,
      status
    }
  });

} catch (err) {
  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Error updating user"
  });
}

// إذا كان المستخدم Client حدّث إيميل الشركة أيضاً
try {

  const user = await prisma.users.findUnique({
    where: { id: Number(id) },
    select: { role: true, company_id: true }
  });

  if (
    user &&
    user.role === "CLIENT" &&
    user.company_id
  ) {
    try {
      await prisma.companies.update({
        where: { id: user.company_id },
        data: { email }
      });
    } catch (err) {
      // matches original fire-and-forget behavior
    }
  }

  res.json({
    success: true,
    message: "User updated successfully"
  });

} catch (findErr) {

  // original ignored findErr (only checked `!findErr && user && ...`)
  // and always responded 200 regardless of this lookup's outcome
  res.json({
    success: true,
    message: "User updated successfully"
  });

}

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

      let user;
      try {

        user = await prisma.users.findUnique({
          where: { id: Number(id) },
          select: { role: true, company_id: true }
        });

      } catch (err) {
        user = null;
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // إذا كان Client احذف كل بيانات الشركة أولاً
      if (user.role === "CLIENT" && user.company_id) {

        const companyId = user.company_id;

        try {

          await prisma.task_documents.deleteMany({
            where: {
              company_tasks: {
                company_id: companyId
              }
            }
          });

          await prisma.company_tasks.deleteMany({
            where: { company_id: companyId }
          });

          await prisma.company_stages.deleteMany({
            where: { company_id: companyId }
          });

          await prisma.founders.deleteMany({
            where: { company_id: companyId }
          });

          await prisma.companies.delete({
            where: { id: companyId }
          });

        } catch (err) {
          // matches original fire-and-forget cascade-delete behavior
        }
      }

      // حذف المستخدم
      try {

        await prisma.users.delete({
          where: { id: Number(id) }
        });

        res.json({
          success: true,
          message: "User deleted successfully"
        });

      } catch (deleteErr) {

        console.error(deleteErr);

        return res.status(500).json({
          success: false,
          message: "Error deleting user"
        });

      }

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
  async (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    try {

      await prisma.users.update({
        where: { id: Number(id) },
        data: { status }
      });

    } catch (err) {

      console.error(err);

      return res.status(500).json({
        success: false,
        message: "Error updating status"
      });

    }

    // جلب معلومات المستخدم
    let user;
    try {

      user = await prisma.users.findUnique({
        where: { id: Number(id) },
        select: { company_id: true, role: true }
      });

    } catch (err2) {

      return res.json({
        success: true,
        message: "Status updated successfully"
      });

    }

    if (!user) {
      return res.json({
        success: true,
        message: "Status updated successfully"
      });
    }

    // إذا كان CLIENT فقط، غيّر حالة الشركة معه
    if (user.role === "CLIENT") {

      try {
        await prisma.companies.update({
          where: { id: user.company_id },
          data: {
            status:
              status === "ACTIVE"
                ? "UNDER_REVIEW"
                : "DISABLED"
          }
        });
      } catch (err) {
        // matches original fire-and-forget behavior
      }

    }

    res.json({
      success: true,
      message: "Status updated successfully"
    });

  }
);

// ================= GET ALL USERS (ADMIN) =================
router.get(
  "/users",
  authMiddleware,

  async (req, res) => {

    try {

      const rows = await prisma.users.findMany({
        orderBy: { id: 'desc' },
        include: {
          companies: {
            select: { name: true }
          }
        }
      });

      // flatten to match original: u.id, u.name, u.email, u.role, u.status,
      // u.company_id, company (= c.name)
      const users = rows.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        company_id: u.company_id,
        company: u.companies ? u.companies.name : null
      }));

      res.json({
        success: true,
        users
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error fetching users"
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

      const companies = await prisma.companies.findMany({
        orderBy: { id: 'desc' },
        include: {
          company_stages: {
            select: {
              status: true,
              stages: { select: { name: true } }
            }
          }
        }
      });

      let founders;
      try {

        founders = await prisma.founders.findMany({
          select: {
            company_id: true,
            full_name: true
          }
        });

      } catch (foundersErr) {

        console.error(foundersErr);

        return res.status(500).json({
          success: false,
          message: "Error fetching founders"
        });

      }

      // flatten companies to match original flat SELECT shape and attach founders
      const flattenedCompanies = companies.map((c) => {
        const completed_stages = c.company_stages.filter(
          (cs) => cs.status === 'COMPLETED'
        ).length;

        const total_stages = c.company_stages.length;

        const inProgress = c.company_stages.find(
          (cs) => cs.status === 'IN_PROGRESS'
        );

        const current_stage = inProgress && inProgress.stages
          ? inProgress.stages.name
          : null;

        const {  company_stages, ...rest } = c;

        return {
          ...rest,
          
          completed_stages,
          total_stages,
          current_stage
        };
      });

      flattenedCompanies.forEach((company) => {

        company.founders = founders
          .filter(
            (f) => f.company_id === company.id
          )
          .map(
            (f) => f.full_name
          );

      });

      console.log(flattenedCompanies[0]);

      res.json({
        success: true,
        companies: flattenedCompanies
      });

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

      let user;
      try {

        user = await prisma.users.findUnique({
          where: { id: userId }
        });

      } catch (err) {

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

      try {

        await prisma.users.update({
          where: { id: userId },
          data: { password: hashedPassword }
        });

        res.json({
          success: true,
          message: "Password updated successfully"
        });

      } catch (updateErr) {

        return res.status(500).json({
          success: false,
          message: "Error updating password"
        });

      }

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

let record;
try {

  record = await prisma.otp_requests.findFirst({
    where: {
      email,
      type: 'REGISTER'
    }
  });

} catch (err) {
  record = null;
}

if (
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

let companyId;
try {

  const newCompany = await prisma.companies.create({
    data: {
      name: data.company_name,
      manager_name: data.manager_name || data.name,
      country: data.country,
      sector_id: Number(data.sector_id),
      description: data.description || "",
      phone: data.phone || "",
      email: data.email,
      logo_url: data.logo_url || null,
      status: "PENDING"
    }
  });

  companyId = newCompany.id;

} catch (companyErr) {

  return sendError(
    res,
    500,
    'Company error'
  );

}

generateWorkflow(
companyId,
data.sector_id
);

let newUser;
try {

  newUser = await prisma.users.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "CLIENT",
      company_id: companyId,
      status: "ACTIVE"
    }
  });

} catch (userErr) {

  return sendError(
    res,
    500,
    'User error'
  );

}

try {

  await prisma.otp_requests.delete({
    where: { id: record.id }
  });

} catch (err) {
  // matches original fire-and-forget behavior
}

const token =
jwt.sign(

{

id:
newUser.id,

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

id: newUser.id,

name: data.name,

email: data.email,

role: "CLIENT",

company_id: companyId

}

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

let user;
try {
  user = await findUserByEmail(email);
} catch (err) {
  user = null;
}

if (!user) {

return sendError(
res,
404,
"Email not found"
);

}

const otp =
generateOTP();

try {

  await prisma.otp_requests.deleteMany({
    where: {
      email,
      type: 'RESET_PASSWORD'
    }
  });

  await prisma.otp_requests.create({
    data: {
      email,
      otp,
      type: "RESET_PASSWORD",
      expires_at: new Date(getExpiry()),
      resend_after: new Date(getResendTime())
    }
  });

} catch (err) {
  // matches original fire-and-forget behavior
}

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

let record;
try {

  record = await prisma.otp_requests.findFirst({
    where: {
      email,
      type: 'RESET_PASSWORD'
    }
  });

} catch (err) {
  record = null;
}

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

try {

  await prisma.users.updateMany({
    where: { email },
    data: { password: hashed }
  });

} catch (err) {
  // matches original fire-and-forget behavior
}

try {

  await prisma.otp_requests.delete({
    where: { id: record.id }
  });

} catch (err) {
  // matches original fire-and-forget behavior
}

return sendSuccess(
res,
"Password updated"
);

}
);

console.log("END OF AUTH FILE");
module.exports = router;
