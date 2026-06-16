const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const db = require('../db');
const authMiddleware = require("../middleware/authMiddleware");
const checkOwnership = require("../middleware/ownership");

const {
  createCompany,
  getCompanyById,
  updateCompany,
  submitCompany,
  getAllCompanies,
  approveCompany,
  rejectCompany,
  needsCompletionCompany
} = require("../controllers/company.controller");

// CREATE
router.post(
  "/",
  authMiddleware,
  createCompany
);


router.put('/assign/:id', authMiddleware, (req, res) => {

  // L-02: only ADMIN may reassign companies to employees
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const { id } = req.params;
  const { assigned_employee_id } = req.body;

  db.run(
    `
    UPDATE companies
    SET assigned_employee_id = ?
    WHERE id = ?
    `,
    [assigned_employee_id, id],
    function(err) {

      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message
        });
      }

      res.json({
        success: true,
        message: 'Employee assigned'
      });

    }
  );

});

// UPDATE COMPANY
router.put(
  "/:id",
  authMiddleware,
  updateCompany
);

// SUBMIT COMPANY
router.put(
  "/:id/submit",
  authMiddleware,
  checkOwnership,
  submitCompany
);

// GET ALL COMPANIES
router.get(
  "/",
  authMiddleware,
  getAllCompanies
);

// APPROVE COMPANY
router.put(
  "/:id/approve",
  authMiddleware,
  approveCompany
);

// REJECT COMPANY
router.put(
  "/:id/reject",
  authMiddleware,
  rejectCompany
);

// NEEDS COMPLETION
router.put(
  "/:id/needs-completion",
  authMiddleware,
  needsCompletionCompany
);

// 📌 GET COMPANY STAGES
router.get(
  '/:companyId/stages',
  authMiddleware,
  (req, res) => {

    const { companyId } = req.params;

    db.all(
      `
SELECT
  cs.*,
  s.name AS stage_name,
  COALESCE(s.name_ar, s.name) AS stage_name_ar
FROM company_stages cs
JOIN stages s
ON cs.stage_id = s.id
      WHERE cs.company_id = ?
      ORDER BY s.stage_order ASC
      `,
      [companyId],
      (err, rows) => {

if (err) {

  return res.status(500).json({
    success: false,
    error: JSON.stringify(err),
    message: err.message
  });

}

        res.json({
          success: true,
          stages: rows
        });

      }
    );

  }
);

// 📌 GET COMPANY TASKS
router.get(
  '/:companyId/tasks',
  authMiddleware,
  (req, res) => {

    const { companyId } = req.params;

    db.all(
      `
SELECT
  ct.*,
  t.title,
  t.title_ar
FROM company_tasks ct
JOIN tasks t
ON ct.task_id = t.id
      WHERE ct.company_id = ?
      `,
      [companyId],
      (err, rows) => {

       if (err) {

  return res.status(500).json({
    success: false,
    error: JSON.stringify(err),
    message: err.message
  });

}
console.log("COMPANY TASKS:");
console.log(rows);
        res.json({
          success: true,
          tasks: rows
        });

      }
    );

  }
);


router.get(
  "/:companyId/progress",
  authMiddleware,
  (req, res) => {

    const { companyId } = req.params;

    db.all(
      `
      SELECT *
      FROM company_stages cs
      JOIN stages s
      ON cs.stage_id = s.id
      WHERE cs.company_id = ?
      `,
      [companyId],
      (err, stages) => {

        if (err) {

          console.log(err);

          return res.status(500).json({
            message: "Error calculating progress"
          });

        }

const totalStages =
  stages.length;

const completedStages =
  stages.filter(
    (stage) =>
      stage.status === "COMPLETED"
  ).length;

const progress =
  totalStages === 0
    ? 0
    : Math.round(
        (completedStages / totalStages)
        * 100
      );

        res.json({

          progress

        });

      }
    );

  }
);

router.post(
  "/tasks/:taskId/upload",
  authMiddleware,
  upload.array("files"),
  (req, res) => {

console.log("UPLOAD ROUTE HIT");
console.log("TASK ID =", req.params.taskId);
    try {

      const { taskId } = req.params;
      const requiredDocumentNames =
  req.body.required_document_name || [];

const documentNames = Array.isArray(requiredDocumentNames)
  ? requiredDocumentNames
  : [requiredDocumentNames];

console.log("TASK ID =", taskId);
console.log("USER =", req.user);

      if (!req.files || req.files.length === 0) {

        return res.status(400).json({
          message: "File is required"
        });

      }

req.files.forEach((file, index) => {

  const fileUrl =
    `http://localhost:3000/uploads/${file.filename}`;

  const documentName =
    documentNames[index] || null;

  db.get(
    `
    SELECT id
    FROM task_documents
    WHERE company_task_id = ?
      AND required_document_name = ?
    `,
    [taskId, documentName],
    (err, existing) => {

      if (existing) {

        db.run(
          `
          UPDATE task_documents
          SET
            file_name = ?,
            file_url = ?,
            uploaded_by = ?,
            uploaded_at = CURRENT_TIMESTAMP,
            status = 'PENDING',
            rejection_reason = NULL,
            reviewed_by = NULL,
            reviewed_at = NULL
          WHERE id = ?
          `,
          [
            file.originalname,
            fileUrl,
            req.user.id,
            existing.id
          ]
        );

      } else {

        db.run(
          `
          INSERT INTO task_documents (
            company_task_id,
            file_name,
            file_url,
            uploaded_by,
            required_document_name
          )
          VALUES (?, ?, ?, ?, ?)
          `,
          [
            taskId,
            file.originalname,
            fileUrl,
            req.user.id,
            documentName
          ]
        );

      }

    }
  );

});

db.run(
  `
  UPDATE company_tasks
  SET status = 'UNDER_REVIEW'
  WHERE id = ?
  `,
  [taskId]
);

db.all(
  `
  SELECT id
  FROM users
  WHERE role = 'ADMIN'
  `,
  [],
  (err, admins) => {

    if (err || !admins) return;

    admins.forEach((admin) => {

      db.run(
        `
        INSERT INTO notifications
        (
          user_id,
          message,
          type,
          is_read
        )
        VALUES (?, ?, ?, 0)
        `,
        [
          admin.id,
          `documentUploadedDesc|${req.user.company_name}`,
          "DOCUMENT"
        ]
      );

    });

  }
);

return res.json({
  message: "Files uploaded successfully",
  filesCount: req.files.length
});

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: "Server error"
      });

    }

  }
);

router.get("/tasks/:id", (req, res) => {

  const taskId = req.params.id;

  db.get(
    `
SELECT
  company_tasks.*,
  tasks.title,
  tasks.title_ar,
  tasks.description,
  tasks.description_ar,
  tasks.task_type
FROM company_tasks
JOIN tasks
ON company_tasks.task_id = tasks.id
WHERE company_tasks.id = ?
    `,
    [taskId],
    (err, row) => {

      if (err) {
        return res.status(500).json(err);
      }

      if (!row) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

console.log(row);

db.all(
  `
SELECT
  trd.document_name,
  trd.document_name_ar,
  td.status,
  td.rejection_reason
FROM task_required_documents trd
LEFT JOIN task_documents td
  ON td.required_document_name = trd.document_name
 AND td.company_task_id = ?
WHERE trd.task_id = ?
  `,
  [
  row.id,      // company_task_id
  row.task_id  // task_id
],

  (err, docs) => {

    if (err) {
      return res.status(500).json({
        message: "Error fetching documents"
      });
    }

res.json({
  id: row.id,

  title: row.title,
  title_ar: row.title_ar,

  status: row.status,

  description:
    row.description ||
    "Complete all required documents for this task.",

  description_ar: row.description_ar,

  requiredDocuments:
    row.task_type === "file"
      ? [{
          document_name: row.title,
          document_name_ar: row.title_ar,
          status: row.status,
          rejection_reason: null
        }]
      : docs.map((d) => ({
  document_name: d.document_name,
  document_name_ar: d.document_name_ar,
  status: d.status || "PENDING",
  rejection_reason: d.rejection_reason
}))
});

  }
);

}
);
});
router.post(
  "/tasks/upload",
  upload.array("files"),
  (req, res) => {

    if (!req.files || req.files.length === 0) {

      return res.status(400).json({
        message: "No file uploaded",
      });

    }

    const companyTaskId =
      req.body.company_task_id;

req.files.forEach((file, index) => {

  db.run(
    `
    INSERT INTO task_documents (
      company_task_id,
      file_name,
      file_url,
      required_document_name
    )
    VALUES (?, ?, ?, ?)
    `,
    [
      companyTaskId,
      file.originalname,
      `/uploads/${file.filename}`,
      req.body.required_document_name[index]
    ]
  );

});

    res.json({
      message:
        "Files uploaded successfully",
      filesCount: req.files.length,
    });

  }
);

router.put(
  "/tasks/:id/status",
  authMiddleware,
  (req, res) => {

    const taskId = req.params.id;

    const { status } = req.body;

    db.run(
      `
      UPDATE company_tasks
      SET status = ?
      WHERE id = ?
      `,
      [status, taskId],
      function (err) {

        if (err) {

          return res.status(500).json(err);

        }

        // 🔥 fetch current task
        db.get(
          `
          SELECT *
          FROM company_tasks
          WHERE id = ?
          `,
          [taskId],
          (err, task) => {

            if (err || !task) {

              return res.status(500).json({
                message: "Task fetch failed"
              });

            }

            // 🔥 check remaining tasks in same stage
            db.all(
              `
              SELECT *
              FROM company_tasks
              WHERE company_stage_id = ?
              `,
              [task.company_stage_id],
              (err, tasks) => {

                if (err) {

                  return res.status(500).json(err);

                }

                const allCompleted =
                  tasks.every(
                    (t) =>
                      t.status === "COMPLETED"
                  );

                // 🔥 if all completed
                if (allCompleted) {

                  // complete stage
                  db.run(
                    `
                    UPDATE company_stages
                    SET status = 'COMPLETED'
                    WHERE id = ?
                    `,
                    [task.company_stage_id]
                  );

                  // open next stage
                  db.get(
                    `
                   SELECT
                   cs.*,
                   s.stage_order
                   FROM company_stages cs
                   JOIN stages s
                   ON cs.stage_id = s.id
                   WHERE cs.company_id = ?
                   AND s.stage_order >
                   (
                   SELECT s2.stage_order
                   FROM company_stages cs2
                   JOIN stages s2
                   ON cs2.stage_id = s2.id
                   WHERE cs2.id = ?
                   )
                   ORDER BY s.stage_order ASC
                   LIMIT 1
                    `,
                    [
                      task.company_id,
                      task.company_stage_id
                    ],
(err, nextStage) => {

  if (nextStage) {

    // افتح المرحلة التالية
    db.run(
      `
      UPDATE company_stages
      SET status = 'IN_PROGRESS'
      WHERE id = ?
      `,
      [nextStage.id]
    );

  } else {

    // لا توجد مرحلة تالية => جميع المراحل اكتملت
    db.run(
      `
      UPDATE companies
      SET status = 'APPROVED'
      WHERE id = ?
      `,
      [task.company_id]
    );

  }

}
                  );
                }
                
                res.json({
                  message:
                    "Task status updated"
                });

              }
            );

          }
        );

      }
    );

  }
);

router.put(
  "/admin/tasks/:id/status",
  authMiddleware,
  (req, res) => {

    // admin only
    if (req.user.role !== "ADMIN") {

      return res.status(403).json({
        message: "Access denied"
      });

    }

    const taskId = req.params.id;

    const { status } = req.body;

    db.run(
      `
      UPDATE company_tasks
      SET status = ?
      WHERE id = ?
      `,
      [status, taskId],

      function (err) {

        if (err) {

          console.log(err);

          return res.status(500).json({
            message: "Update failed"
          });

        }

        res.json({

          message:
            "Task updated manually ✅"

        });

      }
    );

  }
);

// ─────────────────────────────────────────────
// GET COMPANY NOTIFICATIONS
// ─────────────────────────────────────────────
router.get(
  "/notifications",
  authMiddleware,
  (req, res) => {

    db.all(
      `
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [req.user.id],
      (err, rows) => {

        if (err) {
          return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications"
          });
        }

        res.json({
          success: true,
          notifications: rows
        });

      }
    );

  }
);

// ─────────────────────────────────────────────
// GET COMPANY LICENSES
// ─────────────────────────────────────────────
router.get(
  "/licenses",
  authMiddleware,
  (req, res) => {
    db.all(
      `
      SELECT
        td.id,
        td.file_name,
        td.file_url,
        td.uploaded_at,
        t.title AS license_name
      FROM task_documents td
      JOIN company_tasks ct
        ON td.company_task_id = ct.id
      JOIN tasks t
        ON ct.task_id = t.id
      WHERE
        ct.company_id = ?
        AND td.is_final_license = 1
      ORDER BY td.uploaded_at DESC
      `,
      [req.user.company_id],
      (err, rows) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            success: false,
            message: "Failed to fetch licenses",
          });
        }

        res.json({
          success: true,
          licenses: rows,
        });
      }
    );
  }
);

// GET BY ID
router.get(
  "/:id",
  authMiddleware,
  checkOwnership,
  getCompanyById
);

// Mark all notifications as read
router.put(
  "/notifications/read",
  authMiddleware,
  (req, res) => {
    db.run(
      `
      UPDATE notifications
      SET is_read = 1
      WHERE user_id = ?
      `,
      [req.user.id],
      function (err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error",
          });
        }

        return res.json({
          success: true,
        });
      }
    );
  }
);

// GET UNREAD NOTIFICATIONS COUNT
router.get(
  "/notifications/unread-count",
  authMiddleware,
  (req, res) => {
    db.get(
      `
      SELECT COUNT(*) AS count
      FROM notifications
      WHERE user_id = ?
      AND is_read = 0
      `,
      [req.user.id],
      (err, row) => {
        if (err) {
          return res.status(500).json({
            success: false,
          });
        }

        res.json({
          success: true,
          count: row.count,
        });
      }
    );
  }
);

module.exports = router;