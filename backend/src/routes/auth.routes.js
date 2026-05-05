const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const authMiddleware = require('../middleware/authMiddleware');
const checkOwnership = require('../middleware/ownership');
const checkRole = require("../middleware/checkRole");

const { generateWorkflow } = require('../services/workflow.service');

const PHONE_REGEX = /^\d{10}$/;

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
            "UNDER_REVIEW"
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
                company_id
              )
              VALUES (?, ?, ?, ?, ?)
              `,
              [
                name,
                email,
                hashedPassword,
                'CLIENT',
                companyId
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

    if (!email || !password) {

      return sendError(
        res,
        400,
        'Email and password are required'
      );

    }

    findUserByEmail(
      email,
      async (err, user) => {

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

        const token = jwt.sign(
          {
            id: user.id,
            role: user.role,
            company_id: user.company_id
          },
          process.env.JWT_SECRET || 'secret_key',
          {
            expiresIn: '7d'
          }
        );

        sendSuccess(
          res,
          'Login successful ✅',
          {
            token,

            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              company_id: user.company_id
            }
          }
        );

      }
    );

  } catch (error) {

    console.error(error);

    sendError(
      res,
      500,
      'Server error'
    );

  }

});

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
              company_id
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
              name,
              email,
              hashedPassword,
              "ADMIN",
              null
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


// ================= LOGOUT =================

router.post(
  "/logout",
  (req, res) => {

    res.json({
      message: "Logged out successfully 👋"
    });

  }
);

module.exports = router;