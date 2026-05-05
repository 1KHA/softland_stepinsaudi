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

        let progress = 0;

        stages.forEach((stage) => {

          if (
            stage.status === "COMPLETED"
          ) {

            progress += stage.weight;

          }

        });

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

    try {

      const { taskId } = req.params;

      if (!req.files || req.files.length === 0) {

        return res.status(400).json({
          message: "File is required"
        });

      }

      const fileUrl =
        `http://localhost:3000/uploads/${req.files[0].filename}`;

      db.run(

        `
        INSERT INTO task_documents (
          company_task_id,
          file_name,
          file_url,
          uploaded_by
        )
        VALUES (?, ?, ?, ?)
        `,

        [
          taskId,
          req.files[0].originalname,
          fileUrl,
          req.user.id
        ],

        function (err) {

          if (err) {

            console.log(err);

            return res.status(500).json({
              message: "Upload failed"
            });

          }

          db.run(

            `
            UPDATE company_tasks
            SET status = 'UNDER_REVIEW'
            WHERE id = ?
            `,

            [taskId]

          );

          res.json({

            message: "File uploaded successfully",

            documentId: this.lastID,

            fileUrl

          });

        }

      );

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
  tasks.title
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
res.json({
  id: row.id,
  title: row.title,
  status: row.status,

description:
  row.title === "Reserve Trade Name"
    ? "Reserve and confirm the official trade name for the company."

    : row.title === "Commercial Registration"
    ? "Submit all required documents for commercial registration approval."

    : row.title === "Articles of Association Upload"
    ? "Upload the Articles of Association document for verification."

    : row.title === "ZATCA Registration"
    ? "Complete ZATCA tax registration and upload related documents."

    : row.title === "Chamber Registration"
    ? "Upload Chamber of Commerce registration documents."

    : row.title === "Municipality License"
    ? "Upload municipality license and related approvals."

    : row.title === "Commercial Activity License"
    ? "Submit the commercial activity license documents."

    : row.title === "Final Legal Review"
    ? "Complete all final legal review requirements before approval."

    // Industrial
    : row.title === "Environmental Compliance"
    ? "Complete environmental compliance requirements and upload related documents."

    : row.title === "Industrial License"
    ? "Submit industrial license documents for approval."

    : row.title === "Factory Permit"
    ? "Upload factory permit and operational approvals."

    : row.title === "Industrial Final Audit"
    ? "Complete final industrial audit requirements."

    : row.title === "Industrial Registration"
    ? "Submit industrial registration documents."

    : row.title === "Industrial Safety Compliance"
    ? "Upload industrial safety and compliance documents."

    // Real Estate
    : row.title === "Real Estate Registration"
    ? "Submit all real estate registration documents."

    : row.title === "Property Compliance Review"
    ? "Complete property compliance review requirements."

    : row.title === "Real Estate License"
    ? "Upload real estate licensing documents."

    : row.title === "Legal Property Review"
    ? "Complete legal property review and approvals."

    // Startup
    : row.title === "Founder Verification"
    ? "Verify founder identity and startup ownership."

    : row.title === "Innovation Compliance"
    ? "Submit innovation compliance and startup validation documents."

    : row.title === "Startup Final Review"
    ? "Complete final startup review requirements."

    : row.title === "Startup Activity Permit"
    ? "Upload startup activity permit documents."

    : row.title === "Startup Registration"
    ? "Submit startup registration and founder information."

    : "Complete all required documents for this task.",

requiredDocuments:
  row.title === "Reserve Trade Name"
    ? [
        "Preferred Trade Name",
        "Owner ID / Passport",
      ]

    : row.title === "Commercial Registration"
    ? [
        "Commercial Registration Form",
        "Owner ID / Passport",
        "Business Details",
      ]

    : row.title === "Articles of Association Upload"
    ? [
        "Articles of Association PDF",
        "Partner Information",
      ]

    : row.title === "ZATCA Registration"
    ? [
        "Tax Registration Certificate",
        "Company Information",
      ]

    : row.title === "Chamber Registration"
    ? [
        "Chamber Registration Form",
        "Commercial Registration Copy",
      ]

    : row.title === "Municipality License"
    ? [
        "Municipality License",
        "Office Lease Contract",
      ]

    : row.title === "Commercial Activity License"
    ? [
        "Commercial Activity License",
        "Business Activity Details",
      ]

    : row.title === "Final Legal Review"
    ? [
        "Final Review Form",
        "Approval Letter",
      ]

    // Industrial
    : row.title === "Environmental Compliance"
    ? [
        "Environmental Compliance Certificate",
        "Environmental Safety Report",
      ]

    : row.title === "Industrial License"
    ? [
        "Industrial License",
        "Factory Information",
      ]

    : row.title === "Factory Permit"
    ? [
        "Factory Permit",
        "Operational Approval",
      ]

    : row.title === "Industrial Final Audit"
    ? [
        "Industrial Audit Report",
        "Final Approval Form",
      ]

    : row.title === "Industrial Registration"
    ? [
        "Industrial Registration Form",
        "Factory Registration Details",
      ]

    : row.title === "Industrial Safety Compliance"
    ? [
        "Safety Compliance Certificate",
        "Industrial Safety Report",
      ]

    // Real Estate
    : row.title === "Real Estate Registration"
    ? [
        "Property Registration Form",
        "Owner Identification",
      ]

    : row.title === "Property Compliance Review"
    ? [
        "Compliance Report",
        "Property Inspection Document",
      ]

    : row.title === "Real Estate License"
    ? [
        "Real Estate License",
        "Business Activity Details",
      ]

    : row.title === "Legal Property Review"
    ? [
        "Legal Property Documents",
        "Ownership Verification",
      ]

    // Startup
    : row.title === "Founder Verification"
    ? [
        "Founder ID / Passport",
        "Founder Information",
      ]

    : row.title === "Innovation Compliance"
    ? [
        "Innovation Report",
        "Startup Business Model",
      ]

    : row.title === "Startup Final Review"
    ? [
        "Final Review Form",
        "Startup Approval Letter",
      ]

    : row.title === "Startup Activity Permit"
    ? [
        "Startup Activity Permit",
        "Business Activity Details",
      ]

    : row.title === "Startup Registration"
    ? [
        "Startup Registration Form",
        "Founder Registration Details",
      ]

    : ["Required Document"],
});
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