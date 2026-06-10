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

// GET BY ID
router.get(
  "/:id",
  authMiddleware,
  checkOwnership,
  getCompanyById
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
        s.name AS stage_name
      FROM company_stages cs
      JOIN stages s
      ON cs.stage_id = s.id
      WHERE cs.company_id = ?
      ORDER BY s.stage_order ASC
      `,
      [companyId],
      (err, rows) => {

        if (err) {

          console.log(err);

          return res.status(500).json({
            success: false,
            message: 'Error fetching stages'
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
        t.title
      FROM company_tasks ct
      JOIN tasks t
      ON ct.task_id = t.id
      WHERE ct.company_id = ?
      `,
      [companyId],
      (err, rows) => {

        if (err) {

          console.log(err);

          return res.status(500).json({
            success: false,
            message: 'Error fetching tasks'
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
      documentNames[index] || null
    ]
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
  tasks.description,
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
  SELECT document_name
  FROM task_required_documents
  WHERE task_id = ?
  `,
  [row.task_id],

  (err, docs) => {

    if (err) {
      return res.status(500).json({
        message: "Error fetching documents"
      });
    }

    res.json({
      id: row.id,
      title: row.title,
      status: row.status,

      description:
        row.description ||
        "Complete all required documents for this task.",

      requiredDocuments:
        row.task_type === "file"
          ? [row.title]
          : docs.map(
              (d) => d.document_name
            )
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

    req.files.forEach((file) => {

      db.run(
        `
        INSERT INTO task_documents (
          company_task_id,
          file_name,
          file_url
        )
        VALUES (?, ?, ?)
        `,
        [
          companyTaskId,
          file.originalname,
          `/uploads/${file.filename}`,
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

                        db.run(
                          `
                          UPDATE company_stages
                          SET status = 'IN_PROGRESS'
                          WHERE id = ?
                          `,
                          [nextStage.id]
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

module.exports = router;