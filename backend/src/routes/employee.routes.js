const express = require('express');
const router = express.Router();
const prisma = require('../prisma/client');
const {
    generateWorkflow,
    updateCompanyStatus
} = require('../services/workflow.service');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require("../middleware/upload");

// ─── MIDDLEWARE: employee or admin only ───────────────────────────────────────
function employeeOrAdmin(req, res, next) {

  console.log('ROLE =', req.user.role);

  if (
    req.user.role !== 'EMPLOYEE' &&
    req.user.role !== 'ADMIN'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  next();
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD STATS
// Fix: was using c.name — actual column is c.company_name
// ─────────────────────────────────────────────────────────────────────────────

router.get('/dashboard/stats', authMiddleware, employeeOrAdmin, async (req, res) => {
  console.log('USER:', req.user);
  const employeeId = req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  try {

    const companies = await prisma.companies.findMany({
      where: isAdmin ? {} : { assigned_employee_id: employeeId },
      select: {
        id: true,
        status: true,
        name: true,
        assigned_employee_id: true
      }
    });

    const total = companies.length;
    const pending = companies.filter(c => ['UNDER_REVIEW', 'SUBMITTED'].includes(c.status)).length;
    const approved = companies.filter(c => c.status === 'APPROVED').length;
    const rejected = companies.filter(c => c.status === 'REJECTED').length;
    const needsCompletion = companies.filter(c => c.status === 'NEEDS_COMPLETION').length;
    const activeCompanies = companies.filter(
      c => c.status !== 'REJECTED'
    ).length;

    const stagesRaw = await prisma.stages.findMany({
      orderBy: { stage_order: 'asc' },
      include: {
        company_stages: {
          where: { status: 'IN_PROGRESS' },
          select: { company_id: true }
        }
      }
    });

    const stageStats = stagesRaw.map((s) => ({
      id: s.id,
      name: s.name,
      name_ar: s.name_ar,
      total: s.company_stages.length
    }));

    res.json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
        needsCompletion,
        activeCompanies
      },
      stageStats
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'DB error', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// REQUESTS LIST
// Fix: was selecting c.name — actual column is c.company_name
// Fix: search was filtering on c.name — must be c.company_name
// ─────────────────────────────────────────────────────────────────────────────
router.get('/requests', authMiddleware, employeeOrAdmin, async (req, res) => {
  const { status, search } = req.query;
  const employeeId = req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  const where = {};

  if (!isAdmin) {
    where.assigned_employee_id = employeeId;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    // c.name is the real DB column name; the SELECT aliases it as company_name
    where.OR = [
      { name: { contains: search } },
      // CAST(c.id AS TEXT) LIKE ? has no direct Prisma equivalent on Int columns;
      // numeric-id search is handled by attempting an exact id match below.
    ];
    const searchAsNumber = Number(search);
    if (!Number.isNaN(searchAsNumber)) {
      where.OR.push({ id: searchAsNumber });
    }
  }

  try {

    const rows = await prisma.companies.findMany({
  where,
  orderBy: { created_at: 'desc' },
  include: {
    company_stages: {
      where: { status: 'IN_PROGRESS' },
      select: {
        stages: {
          select: {
            name: true,
            name_ar: true
          }
        }
      },
      take: 1
    }
  }
});

    // need assigned_employee_name (u.name) via a separate lookup since
    // companies.assigned_employee_id has no declared relation in schema.prisma
    const employeeIds = [...new Set(rows.map(r => r.assigned_employee_id).filter(Boolean))];
    const employees = employeeIds.length
      ? await prisma.users.findMany({
          where: { id: { in: employeeIds } },
          select: { id: true, name: true }
        })
      : [];
    const employeeNameById = new Map(employees.map(e => [e.id, e.name]));

    const requests = rows.map((c) => {
      const inProgress = c.company_stages[0];
      return {
  id: c.id,
  company_name: c.name,
  status: c.status,
  created_at: c.created_at,

  assigned_employee_id: c.assigned_employee_id,

  assigned_employee_name: c.assigned_employee_id
    ? (employeeNameById.get(c.assigned_employee_id) || null)
    : null,

  sector_name: null,
  sector_name_ar: null,

  current_stage_name: inProgress
    ? inProgress.stages.name
    : null,

  current_stage_name_ar: inProgress
    ? inProgress.stages.name_ar
    : null
};
    });

    res.json({ success: true, requests });

 } catch (err) {

  console.log('REQUESTS ERROR');
  console.log(err);

  return res.status(500).json({
    success: false,
    message: 'DB error',
    error: err.message
  });

}
});

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST DETAILS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/requests/:id', authMiddleware, employeeOrAdmin, async (req, res) => {
  const { id } = req.params;

  try {

    const companyRow = await prisma.companies.findUnique({
  where: { id: Number(id) }
});

    if (!companyRow) return res.status(404).json({ success: false, message: 'Company not found' });

    let assignedEmployeeName = null;
    if (companyRow.assigned_employee_id) {
      const emp = await prisma.users.findUnique({
        where: { id: companyRow.assigned_employee_id },
        select: { name: true }
      });
      assignedEmployeeName = emp ? emp.name : null;
    }

    const company = {
  ...companyRow,
  assigned_employee_name: assignedEmployeeName
};

    const stagesRaw = await prisma.company_stages.findMany({
      where: { company_id: Number(id) },
      include: { stages: { select: { name: true, name_ar: true, stage_order: true } } },
      orderBy: { stages: { stage_order: 'asc' } }
    });

    const stages = stagesRaw.map((cs) => {
      const { stages: st, ...rest } = cs;
      return {
        ...rest,
        stage_name: st ? st.name : null,
        stage_name_ar: st ? st.name_ar : null,
        stage_order: st ? st.stage_order : null
      };
    });

    const tasksRaw = await prisma.company_tasks.findMany({
      where: { company_id: Number(id) },
      include: { tasks: { select: { title: true, title_ar: true, task_type: true } } }
    });

    const tasks = tasksRaw.map((ct) => {
      const { tasks: t, ...rest } = ct;
      return {
        ...rest,
        task_title: t ? t.title : null,
        task_title_ar: t ? t.title_ar : null,
        task_type: t ? t.task_type : null
      };
    });

    console.log("TASKS COUNT =", tasks.length);
console.log("TASK IDS =", tasks.map(t => t.id));

    const taskIds = tasks.map(t => t.id);
    if (taskIds.length === 0) {
      return res.json({ success: true, company, stages, tasks, documents: [] });
    }

    const documentsRaw = await prisma.task_documents.findMany({
      where: { company_task_id: { in: taskIds } },
      include: {
        company_tasks: {
          include: {
            tasks: { select: { title: true } },
            company_stages: { include: { stages: { select: { name: true } } } }
          }
        }
      }
    });
console.log("DOCUMENTS COUNT =", documentsRaw.length);
    const documents = documentsRaw.map((td) => {
      const { company_tasks: ct, ...rest } = td;
      return {
        ...rest,
        company_id: ct ? ct.company_id : null,
        task_title: ct && ct.tasks ? ct.tasks.title : null,
        stage_name: ct && ct.company_stages && ct.company_stages.stages
          ? ct.company_stages.stages.name
          : null
      };
    });

    res.json({ success: true, company, stages, tasks, documents });

  } catch (err) {

  console.log('REQUEST DETAILS ERROR');
  console.log(err);

  return res.status(500).json({
    success: false,
    message: 'DB error',
    error: err.message
  });

}
});

// ─────────────────────────────────────────────────────────────────────────────
// APPROVE REQUEST
// ─────────────────────────────────────────────────────────────────────────────
router.put('/requests/:id/approve', authMiddleware, employeeOrAdmin, async (req, res) => {
  const { id } = req.params;

  // S-04: verify the requesting employee is assigned to this company (admins bypass)
  async function verifyOwnership() {
    if (req.user.role === 'ADMIN') return { ok: true };
    const row = await prisma.companies.findUnique({
      where: { id: Number(id) },
      select: { assigned_employee_id: true }
    });
    if (!row) return { ok: false, status: 404, message: 'Company not found' };
    if (row.assigned_employee_id !== req.user.id) {
      return { ok: false, status: 403, message: 'Not assigned to this company' };
    }
    return { ok: true };
  }

  try {

    const ownership = await verifyOwnership();
    if (!ownership.ok) {
      return res.status(ownership.status).json({ success: false, message: ownership.message });
    }

    // تحديث الشركة
    await prisma.companies.update({
      where: { id: Number(id) },
      data: { status: 'APPROVED' }
    });

    // تحديث التاسكات
    await prisma.company_tasks.updateMany({
      where: { company_id: Number(id) },
      data: { status: 'COMPLETED', completed_at: new Date() }
    });

    // تحديث الستيج
    await prisma.company_stages.updateMany({
      where: { company_id: Number(id) },
      data: { status: 'COMPLETED', completed_at: new Date() }
    });

    // إشعار — CLIENT role only to avoid notifying employees linked to the same company
    try {
      const clients = await prisma.users.findMany({
        where: { company_id: Number(id), role: 'CLIENT' },
        select: { id: true }
      });

      for (const u of clients) {
        try {
          await prisma.notifications.create({
            data: {
              user_id: u.id,
              message: 'requestApprovedDesc',
              type: 'REQUEST_APPROVED',
              related_company_id: Number(id)
            }
          });
        } catch (err) {
          // matches original fire-and-forget behavior
        }
      }
    } catch (err) {
      // matches original fire-and-forget behavior
    }

    res.json({ success: true, message: 'Request approved' });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'DB error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// REJECT REQUEST
// ─────────────────────────────────────────────────────────────────────────────
router.put('/requests/:id/reject', authMiddleware, employeeOrAdmin, async (req, res) => {
  const { id } = req.params;

  async function verifyOwnership() {
    if (req.user.role === 'ADMIN') return { ok: true };
    const row = await prisma.companies.findUnique({
      where: { id: Number(id) },
      select: { assigned_employee_id: true }
    });
    if (!row) return { ok: false, status: 404, message: 'Company not found' };
    if (row.assigned_employee_id !== req.user.id) {
      return { ok: false, status: 403, message: 'Not assigned to this company' };
    }
    return { ok: true };
  }

  try {

    const ownership = await verifyOwnership();
    if (!ownership.ok) {
      return res.status(ownership.status).json({ success: false, message: ownership.message });
    }

    await prisma.companies.update({
      where: { id: Number(id) },
      data: { status: 'NEEDS_COMPLETION' }
    });

    try {
      const clients = await prisma.users.findMany({
        where: { company_id: Number(id), role: 'CLIENT' },
        select: { id: true }
      });

      for (const u of clients) {
        try {
          await prisma.notifications.create({
            data: {
              user_id: u.id,
              message: 'Your request requires additional information. Please complete the required details and resubmit.',
              type: 'RESUBMISSION_REQUESTED',
              related_company_id: Number(id)
            }
          });
        } catch (err) {
          // matches original fire-and-forget behavior
        }
      }
    } catch (err) {
      // matches original fire-and-forget behavior
    }

    res.json({ success: true, message: 'Request rejected' });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'DB error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST RESUBMISSION
// ─────────────────────────────────────────────────────────────────────────────
router.put('/requests/:id/resubmit', authMiddleware, employeeOrAdmin, async (req, res) => {
  const { id } = req.params;

  async function verifyOwnership() {
    if (req.user.role === 'ADMIN') return { ok: true };
    const row = await prisma.companies.findUnique({
      where: { id: Number(id) },
      select: { assigned_employee_id: true }
    });
    if (!row) return { ok: false, status: 404, message: 'Company not found' };
    if (row.assigned_employee_id !== req.user.id) {
      return { ok: false, status: 403, message: 'Not assigned to this company' };
    }
    return { ok: true };
  }

  try {

    const ownership = await verifyOwnership();
    if (!ownership.ok) {
      return res.status(ownership.status).json({ success: false, message: ownership.message });
    }

    await prisma.companies.update({
      where: { id: Number(id) },
      data: { status: 'NEEDS_COMPLETION' }
    });

    try {
      const clients = await prisma.users.findMany({
        where: { company_id: Number(id), role: 'CLIENT' },
        select: { id: true }
      });

      for (const u of clients) {
        try {
          await prisma.notifications.create({
            data: {
              user_id: u.id,
              message: 'Please re-submit the required documents.',
              type: 'RESUBMISSION_REQUESTED',
              related_company_id: Number(id)
            }
          });
        } catch (err) {
          // matches original fire-and-forget behavior
        }
      }
    } catch (err) {
      // matches original fire-and-forget behavior
    }

    res.json({ success: true, message: 'Resubmission requested' });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'DB error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTS LIST
// Fix: was selecting c.name AS company_name — must use c.company_name
// Fix: search was using c.name — must be c.company_name
// ─────────────────────────────────────────────────────────────────────────────
router.get('/documents', authMiddleware, employeeOrAdmin, async (req, res) => {
  const { status, search } = req.query;
  const employeeId = req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  const where = {};

  if (!isAdmin) {
    where.company_tasks = { company: { assigned_employee_id: employeeId } };
  }

  if (status) {
    where.status = status;
  }

  try {

    const rows = await prisma.task_documents.findMany({
      where: {
        ...where,
        ...(status ? { status } : {}),
        ...(isAdmin ? {} : {
          company_tasks: { companies: { assigned_employee_id: employeeId } }
        })
      },
      include: {
        company_tasks: {
          include: {
            companies: { select: { id: true, name: true, assigned_employee_id: true } },
            tasks: { select: { title: true } },
            company_stages: { include: { stages: { select: { name: true } } } }
          }
        }
      },
      orderBy: { uploaded_at: 'desc' }
    });

    let documents = rows.map((td) => {
      const ct = td.company_tasks;
      return {
        id: td.id,
        file_name: td.file_name,
        file_url: td.file_url,
        status: td.status,
        uploaded_at: td.uploaded_at,
        rejection_reason: td.rejection_reason,
        company_task_id: td.company_task_id,
        company_name: ct && ct.companies ? ct.companies.name : null,
        company_id: ct && ct.companies ? ct.companies.id : null,
        task_title: ct && ct.tasks ? ct.tasks.title : null,
        stage_name: ct && ct.company_stages && ct.company_stages.stages
          ? ct.company_stages.stages.name
          : null
      };
    });

    if (search) {
      const s = String(search).toLowerCase();
      documents = documents.filter((d) =>
        (d.company_name && d.company_name.toLowerCase().includes(s)) ||
        (d.task_title && d.task_title.toLowerCase().includes(s)) ||
        (d.file_name && d.file_name.toLowerCase().includes(s))
      );
    }

    res.json({ success: true, documents });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'DB error', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// APPROVE DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────
router.put(
  '/documents/:id/approve',
  authMiddleware,
  employeeOrAdmin,
  async (req, res) => {

    const { id } = req.params;

    try {

      const docStatus = await prisma.task_documents.findUnique({
        where: { id: Number(id) },
        select: { status: true }
      });

      if (
        docStatus &&
        (
          docStatus.status === "APPROVED" ||
          docStatus.status === "NEEDS_RESUBMISSION"
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Document has already been reviewed."
        });
      }

      await prisma.task_documents.update({
        where: { id: Number(id) },
        data: {
          status: 'APPROVED',
          reviewed_by: req.user.id,
          reviewed_at: new Date()
        }
      });

      const doc = await prisma.task_documents.findUnique({
        where: { id: Number(id) },
        select: {
          company_task_id: true,
          company_tasks: { select: { company_id: true } }
        }
      });

      console.log('DOC ID =', id);
      console.log('COMPANY TASK ID =', doc?.company_task_id);

      if (!doc) {
        return res.json({
          success: true,
          message: 'Document approved'
        });
      }

      const docCompanyId = doc.company_tasks ? doc.company_tasks.company_id : null;

      const approvedResult = {
        uploadedCount: await prisma.task_documents.count({
          where: {
            company_task_id: doc.company_task_id,
            status: 'APPROVED'
          }
        })
      };

      console.log('UPDATED TASK =', doc.company_task_id);
      console.log('CHANGES =', undefined);
      console.log('ERROR =', null);

      const taskRow = await prisma.company_tasks.findUnique({
        where: { id: doc.company_task_id },
        select: {
          company_stage_id: true,
          task_id: true,
          tasks: { select: { task_type: true } }
        }
      });

      if (!taskRow) {
        return res.json({
          success: true,
          message: 'Document approved'
        });
      }

      const taskType = taskRow.tasks ? taskRow.tasks.task_type : null;

      // إذا كان File -> يكفي أول ملف
      if (taskType === "file") {

        await prisma.company_tasks.update({
          where: { id: doc.company_task_id },
          data: { status: 'COMPLETED' }
        });

        try {

          const company = await prisma.companies.findUnique({
            where: { id: docCompanyId },
            select: { name: true }
          });

          const companyName = company?.name || "Unknown Company";

          const clients = await prisma.users.findMany({
            where: { company_id: docCompanyId, role: 'CLIENT' },
            select: { id: true }
          });

          for (const u of clients) {
            try {
              await prisma.notifications.create({
                data: {
                  user_id: u.id,
                  message: `Company "${companyName}" uploaded documents.`,
                  type: 'DOCUMENT_APPROVED',
                  related_company_id: docCompanyId
                }
              });
            } catch (err) {
              // matches original fire-and-forget behavior
            }
          }

        } catch (err) {
          // matches original fire-and-forget behavior
        }

      } else {

        // في حالة License:
        // إذا تم اعتماد جميع الملفات، لا نكمل التاسك.
        // نتركه UNDER_REVIEW إلى أن يرفع الأدمن الترخيص النهائي.
        try {

          const requiredResult = {
            requiredCount: await prisma.task_required_documents.count({
              where: { task_id: taskRow.task_id }
            })
          };

          if (approvedResult.uploadedCount >= requiredResult.requiredCount) {
            console.log(
              "All required documents approved. Waiting for final license upload."
            );
          }

        } catch (errReq) {
          // matches original fire-and-forget behavior
        }

      }

      const remainingResult = {
        remaining: await prisma.company_tasks.count({
          where: {
            company_stage_id: taskRow.company_stage_id,
            status: { not: 'COMPLETED' }
          }
        })
      };

      if (remainingResult.remaining > 0) {
        return res.json({
          success: true,
          message: 'Document approved'
        });
      }

      await prisma.company_stages.update({
        where: { id: taskRow.company_stage_id },
        data: { status: 'COMPLETED' }
      });

      const currentStage = await prisma.company_stages.findUnique({
        where: { id: taskRow.company_stage_id },
        select: { company_id: true, stage_id: true, stages: { select: { stage_order: true } } }
      });

      if (!currentStage) {
        return res.json({
          success: true,
          message: 'Document approved'
        });
      }

      const nextStage = await prisma.company_stages.findFirst({
        where: {
          company_id: currentStage.company_id,
          stages: {
            stage_order: { gt: currentStage.stages.stage_order }
          }
        },
        include: { stages: { select: { stage_order: true } } },
        orderBy: { stages: { stage_order: 'asc' } }
      });

      if (!nextStage) {

        await updateCompanyStatus(
          currentStage.company_id
        );

        return res.json({
          success: true,
          message: 'Document approved'
        });

      }

      await prisma.company_stages.update({
        where: { id: nextStage.id },
        data: { status: 'IN_PROGRESS' }
      });

      await updateCompanyStatus(
        currentStage.company_id
      );

      return res.json({
        success: true,
        message: 'Document approved'
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'DB error'
      });
    }

  }
);

// ─────────────────────────────────────────────────────────────────────────────
// REJECT DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────
router.put('/documents/:id/reject', authMiddleware, employeeOrAdmin, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

 try {

  await prisma.task_documents.update({
    where: { id: Number(id) },
    data: {
      status: 'REJECTED',
      reviewed_by: req.user.id,
      reviewed_at: new Date(),
      rejection_reason: reason || ''
    }
  });

  const row = await prisma.task_documents.findUnique({
    where: { id: Number(id) },
    select: {
      company_tasks: {
        select: {
          company_id: true
        }
      }
    }
  });

  const companyId = row?.company_tasks?.company_id;

  if (companyId) {

    const clients = await prisma.users.findMany({
      where: {
        company_id: companyId,
        role: 'CLIENT'
      },
      select: {
        id: true
      }
    });

    for (const client of clients) {

      await prisma.notifications.create({
        data: {
          user_id: client.id,
          message: reason || "Document rejected",
          type: "DOCUMENT_REJECTED",
          related_company_id: companyId
        }
      });

    }

  }

  res.json({
    success: true,
    message: 'Document rejected'
  });

} catch (err) {
}});

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST DOCUMENT RESUBMISSION
// ─────────────────────────────────────────────────────────────────────────────
router.put(
  '/documents/:id/needs-resubmission',
  authMiddleware,
  employeeOrAdmin,
  async (req, res) => {

    const { id } = req.params;
    const { reason } = req.body;

    try {

      await prisma.task_documents.update({
        where: { id: Number(id) },
        data: {
          status: 'NEEDS_RESUBMISSION',
          reviewed_by: req.user.id,
          reviewed_at: new Date(),
          rejection_reason: reason || ''
        }
      });

      const row = await prisma.task_documents.findUnique({
        where: { id: Number(id) },
        select: {
          company_task_id: true,
          company_tasks: { select: { company_id: true } }
        }
      });

      if (!row) {
        return res.json({
          success: true,
          message: 'Resubmission requested'
        });
      }

      const companyId = row.company_tasks ? row.company_tasks.company_id : null;

      // رجوع التاسك إلى Pending
      try {
        await prisma.company_tasks.update({
          where: { id: row.company_task_id },
          data: { status: 'PENDING' }
        });
      } catch (err) {
        // matches original fire-and-forget behavior
      }

      try {
        const ct = await prisma.company_tasks.findUnique({
          where: { id: row.company_task_id },
          select: { company_stage_id: true }
        });

        if (ct) {
          await prisma.company_stages.update({
            where: { id: ct.company_stage_id },
            data: { status: 'IN_PROGRESS' }
          });
        }
      } catch (err) {
        // matches original fire-and-forget behavior
      }

      try {
        await prisma.companies.update({
          where: { id: companyId },
          data: { status: 'NEEDS_COMPLETION' }
        });
      } catch (err) {
        // matches original fire-and-forget behavior
      }

      // إشعار للعميل
      try {
        const clients = await prisma.users.findMany({
          where: { company_id: companyId, role: 'CLIENT' },
          select: { id: true }
        });

        for (const u of clients) {
          try {
            await prisma.notifications.create({
              data: {
                user_id: u.id,
                message: `resubmissionRequestedDesc|${reason || "Please review the uploaded document."}`,
                type: 'RESUBMISSION_REQUESTED',
                related_company_id: companyId
              }
            });
          } catch (err) {
            // matches original fire-and-forget behavior
          }
        }
      } catch (err) {
        // matches original fire-and-forget behavior
      }

      return res.json({
        success: true,
        message: 'Resubmission requested'
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'DB error'
      });
    }

  }
);

// ─────────────────────────────────────────────────────────────────────────────
// MARK ALL NOTIFICATIONS READ
// IMPORTANT: This MUST come BEFORE /:id/read to avoid Express matching
//            "read-all" as an id param
// Fix: was placed after /:id/read — caused route collision
// ─────────────────────────────────────────────────────────────────────────────
router.put('/notifications/read-all', authMiddleware, async (req, res) => {
  try {

    await prisma.notifications.updateMany({
      where: { user_id: req.user.id },
      data: { is_read: 1 }
    });

    res.json({ success: true });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'DB error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS LIST
// Fix: was selecting c.name — actual column is c.company_name
// ─────────────────────────────────────────────────────────────────────────────
router.get('/notifications', authMiddleware, async (req, res) => {
  try {

    const rows = await prisma.notifications.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' },
      take: 50,
      include: {
        companies: { select: { name: true } }
      }
    });

    const notifications = rows.map((n) => {
      const { companies, ...rest } = n;
      return {
        ...rest,
        company_name: companies ? companies.name : null
      };
    });

    console.log('NOTIFICATIONS:', notifications);

    res.json({
      success: true,
      notifications
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'DB error'
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// MARK SINGLE NOTIFICATION READ
// ─────────────────────────────────────────────────────────────────────────────
router.put('/notifications/:id/read', authMiddleware, async (req, res) => {
  try {

    await prisma.notifications.updateMany({
      where: {
        id: Number(req.params.id),
        user_id: req.user.id
      },
      data: { is_read: 1 }
    });

    res.json({ success: true });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'DB error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL OVERRIDE TASK STATUS (ADMIN ONLY)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/tasks/:id/status', authMiddleware, async (req, res) => {

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin only'
    });
  }

  const { status } = req.body;

  try {

    await prisma.company_tasks.update({
      where: { id: Number(req.params.id) },
      data: { status }
    });

    const taskRow = await prisma.company_tasks.findUnique({
      where: { id: Number(req.params.id) },
      select: { company_stage_id: true }
    });

    if (!taskRow) {
      return res.json({
        success: true,
        message: 'Task status updated'
      });
    }

    const remaining = await prisma.company_tasks.count({
      where: {
        company_stage_id: taskRow.company_stage_id,
        status: { not: 'COMPLETED' }
      }
    });

    const stageCompleted = remaining === 0;

    await prisma.company_stages.update({
      where: { id: taskRow.company_stage_id },
      data: { status: stageCompleted ? 'COMPLETED' : 'IN_PROGRESS' }
    });

    const currentStage = await prisma.company_stages.findUnique({
      where: { id: taskRow.company_stage_id },
      select: { company_id: true, stage_id: true }
    });

    if (!currentStage) {
      return res.json({
        success: true,
        message: 'Task status updated'
      });
    }

    if (!stageCompleted) {
      console.log('STAGE NOT COMPLETED');
      console.log('CURRENT STAGE:', currentStage);

      const currentStageOrder = await prisma.stages.findUnique({
        where: { id: currentStage.stage_id },
        select: { stage_order: true }
      });

      const nextStage = await prisma.company_stages.findFirst({
        where: {
          company_id: currentStage.company_id,
          stages: {
            stage_order: { gt: currentStageOrder ? currentStageOrder.stage_order : -1 }
          }
        },
        include: { stages: { select: { stage_order: true } } },
        orderBy: { stages: { stage_order: 'asc' } }
      });

      if (nextStage) {
        console.log('LOCKING STAGE:', nextStage.id);

        await prisma.company_stages.updateMany({
          where: {
            company_id: currentStage.company_id,
            stage_id: { gt: currentStage.stage_id }
          },
          data: { status: 'LOCKED' }
        });

      }

      return res.json({
        success: true,
        message: 'Task status updated'
      });
    }

    const currentStageOrder2 = await prisma.stages.findUnique({
      where: { id: currentStage.stage_id },
      select: { stage_order: true }
    });

    const nextStage2 = await prisma.company_stages.findFirst({
      where: {
        company_id: currentStage.company_id,
        stages: {
          stage_order: { gt: currentStageOrder2 ? currentStageOrder2.stage_order : -1 }
        }
      },
      include: { stages: { select: { stage_order: true } } },
      orderBy: { stages: { stage_order: 'asc' } }
    });

    console.log('CURRENT STAGE =', currentStage);
    console.log('NEXT STAGE FOUND =', nextStage2);

    // NOTE: original code has a redundant `if (!nextStage) { if (nextStage) {...} }`
    // construct — the inner branch is unreachable because nextStage is falsy in
    // that scope. Preserved exactly: this handler only ever returns the success
    // response below and never actually calls UPDATE company_stages here,
    // matching the original's effective behavior.
    if (!nextStage2) {

      return res.json({
        success: true,
        message: 'Task status updated'
      });

    }

    return res.json({
      success: true,
      message: 'Task status updated'
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'DB error'
    });
  }

});

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL OVERRIDE COMPANY STATUS (ADMIN ONLY)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/companies/:id/status', authMiddleware, async (req, res) => {

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin only'
    });
  }

  const { status } = req.body;

  try {

    await prisma.companies.update({
      where: { id: Number(req.params.id) },
      data: { status }
    });

    res.json({
      success: true,
      message: 'Company status updated'
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'DB error'
    });
  }

});

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL OVERRIDE STAGE STATUS (ADMIN ONLY)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/stages/:id/status', authMiddleware, async (req, res) => {

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin only'
    });
  }

  const { status } = req.body;

  try {

    await prisma.company_stages.update({
      where: { id: Number(req.params.id) },
      data: { status }
    });

    res.json({
      success: true,
      message: 'Stage status updated'
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'DB error'
    });
  }

});

router.post(
  "/tasks/:taskId/final-license",
  authMiddleware,
  employeeOrAdmin,
  upload.single("file"),
  async (req, res) => {
    const { taskId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;

    try {

      await prisma.task_documents.create({
        data: {
          company_task_id: Number(taskId),
          file_name: req.file.originalname,
          file_url: fileUrl,
          uploaded_by: req.user.id,
          status: 'APPROVED',
          is_final_license: 1
        }
      });

      const task = await prisma.company_tasks.findUnique({
        where: { id: Number(taskId) },
        select: { company_id: true }
      });

      console.log(task);

      if (task) {
        try {
          const clients = await prisma.users.findMany({
            where: { company_id: task.company_id, role: 'CLIENT' },
            select: { id: true }
          });

const licenseTask = await prisma.company_tasks.findUnique({
  where: { id: Number(taskId) },
  select: {
    tasks: {
      select: {
        title: true,
        title_ar: true
      }
    }
  }
});

const licenseNameEn =
  licenseTask?.tasks?.title || "";

const licenseNameAr =
  licenseTask?.tasks?.title_ar || "";
  console.log("LICENSE TASK:", licenseTask);
console.log("EN:", licenseNameEn);
console.log("AR:", licenseNameAr);

          for (const u of clients) {
            try {

await prisma.notifications.create({
  data: {
    user_id: u.id,
    message: `LICENSE|${licenseNameEn}`,
    message_ar: `LICENSE|${licenseNameAr}`,
    type: "LICENSE_ISSUED",
    related_company_id: task.company_id
  }
});
            } catch (err) {
              // matches original fire-and-forget behavior
            }
          }
        } catch (err) {
          // matches original fire-and-forget behavior
        }
      }

      await prisma.company_tasks.update({
        where: { id: Number(taskId) },
        data: { status: 'COMPLETED' }
      });

      const taskRow = await prisma.company_tasks.findUnique({
        where: { id: Number(taskId) },
        select: { company_stage_id: true }
      });

      if (!taskRow) {
        return res.json({ success: true });
      }

      const remaining = await prisma.company_tasks.count({
        where: {
          company_stage_id: taskRow.company_stage_id,
          status: { not: 'COMPLETED' }
        }
      });

      if (remaining !== 0) {
        return res.json({
          success: true,
        });
      }

      await prisma.company_stages.update({
        where: { id: taskRow.company_stage_id },
        data: { status: 'COMPLETED' }
      });

      const currentStage = await prisma.company_stages.findUnique({
        where: { id: taskRow.company_stage_id },
        select: { company_id: true, stage_id: true }
      });

      if (!currentStage) {
        return res.json({ success: true });
      }

      const currentStageOrder = await prisma.stages.findUnique({
        where: { id: currentStage.stage_id },
        select: { stage_order: true }
      });

      const nextStage = await prisma.company_stages.findFirst({
        where: {
          company_id: currentStage.company_id,
          stages: {
            stage_order: { gt: currentStageOrder ? currentStageOrder.stage_order : -1 }
          }
        },
        include: { stages: { select: { stage_order: true } } },
        orderBy: { stages: { stage_order: 'asc' } }
      });

      if (nextStage) {

        await prisma.company_stages.update({
          where: { id: nextStage.id },
          data: { status: 'IN_PROGRESS' }
        });

        await updateCompanyStatus(
          currentStage.company_id
        );

        return res.json({
          success: true,
        });

      } else {

        await updateCompanyStatus(
          currentStage.company_id
        );

        return res.json({
          success: true,
        });

      }

    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false });
    }
  }
);
module.exports = router;
