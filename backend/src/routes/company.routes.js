const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const prisma = require('../prisma/client');
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


router.put('/assign/:id', authMiddleware, async (req, res) => {

  // L-02: only ADMIN may reassign companies to employees
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const { id } = req.params;
  const { assigned_employee_id } = req.body;

  try {

    await prisma.companies.update({
      where: { id: Number(id) },
      data: { assigned_employee_id }
    });

    res.json({
      success: true,
      message: 'Employee assigned'
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }

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
  async (req, res) => {

    const { companyId } = req.params;

    try {

      const rows = await prisma.company_stages.findMany({
        where: { company_id: Number(companyId) },
        include: {
          stages: {
            select: { name: true, name_ar: true }
          }
        },
        orderBy: {
          stages: { stage_order: 'asc' }
        }
      });

      // flatten to match original: cs.*, stage_name, stage_name_ar (COALESCE(name_ar, name))
      const flattened = rows.map((cs) => {
        const { stages, ...rest } = cs;
        return {
          ...rest,
          stage_name: stages ? stages.name : null,
          stage_name_ar: stages
            ? (stages.name_ar || stages.name)
            : null
        };
      });

      res.json({
        success: true,
        stages: flattened
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        error: JSON.stringify(err),
        message: err.message
      });
    }

  }
);

// 📌 GET COMPANY TASKS
router.get(
  '/:companyId/tasks',
  authMiddleware,
  async (req, res) => {

    const { companyId } = req.params;

    try {

      const rows = await prisma.company_tasks.findMany({
        where: { company_id: Number(companyId) },
        include: {
tasks: {
  select: {
    title: true,
    title_ar: true
  }
}}
      });

      // flatten to match original: ct.*, title, title_ar
      const flattened = rows.map((ct) => {
        const { tasks, ...rest } = ct;
        return {
          ...rest,
          title: tasks ? tasks.title : null,
          title_ar: tasks ? tasks.title_ar : null
        };
      });

      console.log("COMPANY TASKS:");
      console.log(flattened);

      res.json({
        success: true,
        tasks: flattened
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        error: JSON.stringify(err),
        message: err.message
      });
    }

  }
);


router.get(
  "/:companyId/progress",
  authMiddleware,
  async (req, res) => {

    const { companyId } = req.params;

    try {

      const stages = await prisma.company_stages.findMany({
        where: { company_id: Number(companyId) },
        include: { stages: true }
      });

      const totalStages = stages.length;

      const completedStages = stages.filter(
        (stage) => stage.status === "COMPLETED"
      ).length;

      const progress =
        totalStages === 0
          ? 0
          : Math.round((completedStages / totalStages) * 100);

      res.json({
        progress
      });

    } catch (err) {
      console.log(err);

      return res.status(500).json({
        message: "Error calculating progress"
      });
    }

  }
);

router.post(
  "/tasks/:taskId/upload",
  authMiddleware,
  upload.array("files"),
  async (req, res) => {

    console.log("🚨🚨🚨 ROUTE VERSION 999 🚨🚨🚨");
    console.log("UPLOAD ROUTE HIT");
    console.log("TASK ID =", req.params.taskId);

    try {

      const { taskId } = req.params;
      const requiredDocumentNames =
        req.body.required_document_name || [];

      const documentNames = Array.isArray(requiredDocumentNames)
        ? requiredDocumentNames
        : [requiredDocumentNames];

        console.log("FILES COUNT =", req.files.length);
console.log("DOCUMENT NAMES =", documentNames);
console.log("BODY =", req.body);

      console.log("TASK ID =", taskId);
      console.log("USER =", req.user);

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: "File is required"
        });
      }

      for (let index = 0; index < req.files.length; index++) {
        const file = req.files[index];

        const fileUrl =
          `http://localhost:3000/uploads/${file.filename}`;

        const documentName =
          documentNames[index] || null;

        try {
console.log("CREATING DOCUMENT");
console.log("TASK =", taskId);
console.log("DOC NAME =", documentName);
console.log("FILE =", file.originalname);

          const existing = await prisma.task_documents.findFirst({
            where: {
              company_task_id: Number(taskId),
              required_document_name: documentName
            },
            select: { id: true }
          });

          if (existing) {

            await prisma.task_documents.update({
              where: { id: existing.id },
              data: {
                file_name: file.originalname,
                file_url: fileUrl,
                uploaded_by: req.user.id,
                uploaded_at: new Date(),
                status: 'PENDING',
                rejection_reason: null,
                reviewed_by: null,
                reviewed_at: null
              }
            });

          } else {

const created = await prisma.task_documents.create({
  data: {
    company_task_id: Number(taskId),

    file_name: Buffer.from(
      file.originalname,
      "latin1"
    ).toString("utf8"),

    file_url: fileUrl,

    uploaded_by: req.user.id,
    required_document_name: documentName
  }
});

console.log("CREATED DOCUMENT ID =", created.id);

          }

} catch (err) {
  console.log("DOCUMENT CREATE ERROR");
  console.log(err);
}
      }

      try {
        await prisma.company_tasks.update({
          where: { id: Number(taskId) },
          data: { status: 'UNDER_REVIEW' }
        });
      } catch (err) {
        // matches original fire-and-forget behavior
      }
console.log("BEFORE NOTIFICATION BLOCK");
      (async () => {
        console.log("INSIDE NOTIFICATION BLOCK");
        try {
          const company = await prisma.companies.findUnique({
  where: { id: req.user.company_id },
  select: { name: true }
});

const companyName = company?.name || "Unknown Company";


console.log("CREATING ADMIN NOTIFICATION");
console.log("COMPANY ID =", req.user.company_id);
console.log("USER =", req.user);

const admins = await prisma.users.findMany({
  where: { role: 'ADMIN' },
  select: { id: true }
});

for (const admin of admins) {

  console.log("ADMIN =", admin.id);

  try {

    await prisma.notifications.create({
      data: {
        user_id: admin.id,
        message: `documentUploadedDesc|${companyName}`,
        type: "DOCUMENT",
        is_read: 0
      }
    });

    console.log("NOTIFICATION CREATED");

  } catch (err) {

    console.log("NOTIFICATION ERROR", err);

  }

}
        } catch (err) {
          console.error("Failed to fetch admins:", err);
        }
      })();

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

router.get("/tasks/:id", async (req, res) => {

  const taskId = req.params.id;

  try {

    const row = await prisma.company_tasks.findUnique({
      where: { id: Number(taskId) },
      include: {
        tasks: {
          select: {
            title: true,
            title_ar: true,
            description: true,
            description_ar: true,
            task_type: true
          }
        }
      }
    });

    if (!row) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // flatten to match original join shape
    const flatRow = {
      ...row,
      title: row.tasks ? row.tasks.title : null,
      title_ar: row.tasks ? row.tasks.title_ar : null,
      description: row.tasks ? row.tasks.description : null,
      description_ar: row.tasks ? row.tasks.description_ar : null,
      task_type: row.tasks ? row.tasks.task_type : null
    };
    delete flatRow.tasks;

    console.log(flatRow);

    try {

      const docs = await prisma.task_required_documents.findMany({
        where: { task_id: flatRow.task_id }
      });

      const taskDocs = await prisma.task_documents.findMany({
        where: { company_task_id: flatRow.id }
      });

      // original SQL: LEFT JOIN task_documents td
      //   ON td.required_document_name = trd.document_name
      //   AND td.company_task_id = ?
      const docsJoined = docs.map((trd) => {
        const matchingDoc = taskDocs.find(
          (td) => td.required_document_name === trd.document_name
        );

        return {
          document_name: trd.document_name,
          document_name_ar: trd.document_name_ar,
          status: matchingDoc ? matchingDoc.status : null,
          rejection_reason: matchingDoc ? matchingDoc.rejection_reason : null
        };
      });

      res.json({
        id: flatRow.id,

        title: flatRow.title,
        title_ar: flatRow.title_ar,

        status: flatRow.status,

        description:
          flatRow.description ||
          "Complete all required documents for this task.",

        description_ar: flatRow.description_ar,

        requiredDocuments:
          flatRow.task_type === "file"
            ? [{
                document_name: flatRow.title,
                document_name_ar: flatRow.title_ar,
                status: flatRow.status,
                rejection_reason: null
              }]
            : docsJoined.map((d) => ({
                document_name: d.document_name,
                document_name_ar: d.document_name_ar,
                status: d.status || "PENDING",
                rejection_reason: d.rejection_reason
              }))
      });

    } catch (err) {
      return res.status(500).json({
        message: "Error fetching documents"
      });
    }

  } catch (err) {
    return res.status(500).json(err);
  }

});

router.post(
  "/tasks/upload",
  upload.array("files"),
  async (req, res) => {

    console.log("FILES:", req.files?.length);
console.log("BODY:", req.body);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const companyTaskId =
      req.body.company_task_id;

    for (let index = 0; index < req.files.length; index++) {
      const file = req.files[index];

try {
  await prisma.task_documents.create({
    data: {
      company_task_id: Number(companyTaskId),

      file_name: Buffer.from(
        file.originalname,
        "latin1"
      ).toString("utf8"),

      file_url: `/uploads/${file.filename}`,

      required_document_name:
        req.body.required_document_name[index]
    }
  });
      } catch (err) {
        // matches original fire-and-forget behavior
      }
    }

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
  async (req, res) => {

    const taskId = req.params.id;

    const { status } = req.body;

    try {

      await prisma.company_tasks.update({
        where: { id: Number(taskId) },
        data: { status }
      });

      // 🔥 fetch current task
      const task = await prisma.company_tasks.findUnique({
        where: { id: Number(taskId) }
      });

      if (!task) {
        return res.status(500).json({
          message: "Task fetch failed"
        });
      }

      // 🔥 check remaining tasks in same stage
      const tasks = await prisma.company_tasks.findMany({
        where: { company_stage_id: task.company_stage_id }
      });

      const allCompleted = tasks.every(
        (t) => t.status === "COMPLETED"
      );

      // 🔥 if all completed
      if (allCompleted) {

        // complete stage
        await prisma.company_stages.update({
          where: { id: task.company_stage_id },
          data: { status: 'COMPLETED' }
        });

        // open next stage
        const currentCompanyStage = await prisma.company_stages.findUnique({
          where: { id: task.company_stage_id },
          include: { stages: { select: { stage_order: true } } }
        });

        const nextStage = currentCompanyStage
          ? await prisma.company_stages.findFirst({
              where: {
                company_id: task.company_id,
                stages: {
                  stage_order: { gt: currentCompanyStage.stages.stage_order }
                }
              },
              include: { stages: { select: { stage_order: true } } },
              orderBy: { stages: { stage_order: 'asc' } }
            })
          : null;

        if (nextStage) {

          // افتح المرحلة التالية
          await prisma.company_stages.update({
            where: { id: nextStage.id },
            data: { status: 'IN_PROGRESS' }
          });

        } else {

          // لا توجد مرحلة تالية => جميع المراحل اكتملت
          await prisma.companies.update({
            where: { id: task.company_id },
            data: { status: 'APPROVED' }
          });

        }

      }

      res.json({
        message:
          "Task status updated"
      });

    } catch (err) {
      return res.status(500).json(err);
    }

  }
);

router.put(
  "/admin/tasks/:id/status",
  authMiddleware,
  async (req, res) => {

    // admin only
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const taskId = req.params.id;

    const { status } = req.body;

    try {

      await prisma.company_tasks.update({
        where: { id: Number(taskId) },
        data: { status }
      });

      res.json({
        message:
          "Task updated manually ✅"
      });

    } catch (err) {
      console.log(err);

      return res.status(500).json({
        message: "Update failed"
      });
    }

  }
);

// ─────────────────────────────────────────────
// GET COMPANY NOTIFICATIONS
// ─────────────────────────────────────────────
router.get(
  "/notifications",
  authMiddleware,
  async (req, res) => {

    try {

      const rows = await prisma.notifications.findMany({
        where: { user_id: req.user.id },
        orderBy: { created_at: 'desc' }
      });

      res.json({
        success: true,
        notifications: rows
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications"
      });
    }

  }
);

// ─────────────────────────────────────────────
// GET COMPANY LICENSES
// ─────────────────────────────────────────────
router.get(
  "/licenses",
  authMiddleware,
  async (req, res) => {

    try {

      const rows = await prisma.task_documents.findMany({
        where: {
          is_final_license: 1,
          company_tasks: {
            company_id: req.user.company_id
          }
        },
include: {
  company_tasks: {
    include: {
      tasks: {
        select: {
          title: true,
          title_ar: true
        }
      }
    }
  }
},
        orderBy: { uploaded_at: 'desc' }
      });

      // flatten to match original: td.id, td.file_name, td.file_url, td.uploaded_at, license_name
const flattened = rows.map((td) => ({
  id: td.id,
  file_name: td.file_name,
  file_url: td.file_url,
  uploaded_at: td.uploaded_at,

  license_name:
    td.company_tasks?.tasks?.title || null,

  license_name_ar:
    td.company_tasks?.tasks?.title_ar || null
}));

      res.json({
        success: true,
        licenses: flattened,
      });

    } catch (err) {
      console.log(err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch licenses",
      });
    }

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
  async (req, res) => {

    try {

      await prisma.notifications.updateMany({
        where: { user_id: req.user.id },
        data: { is_read: 1 }
      });

      return res.json({
        success: true,
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

  }
);

// GET UNREAD NOTIFICATIONS COUNT
router.get(
  "/notifications/unread-count",
  authMiddleware,
  async (req, res) => {

    try {

      const count = await prisma.notifications.count({
        where: {
          user_id: req.user.id,
          is_read: 0
        }
      });

      res.json({
        success: true,
        count
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
      });
    }

  }
);

module.exports = router;
