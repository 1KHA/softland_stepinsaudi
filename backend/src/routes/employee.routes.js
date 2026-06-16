const express = require('express');
const router = express.Router();
const db = require('../db');
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

router.get('/dashboard/stats', authMiddleware, employeeOrAdmin, (req, res) => {
  console.log('USER:', req.user);
  const employeeId = req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  const whereClause = isAdmin ? '' : 'WHERE c.assigned_employee_id = ?';
  const params = isAdmin ? [] : [employeeId];

  db.all(
    `SELECT c.id, c.status, c.name, c.assigned_employee_id
     FROM companies c
     ${whereClause}`,
    params,
    (err, companies) => {
      if (err) return res.status(500).json({ success: false, message: 'DB error', error: err.message });

      const total = companies.length;
      const pending = companies.filter(c => ['UNDER_REVIEW', 'SUBMITTED'].includes(c.status)).length;
      const approved = companies.filter(c => c.status === 'APPROVED').length;
      const rejected = companies.filter(c => c.status === 'REJECTED').length;
      const needsCompletion = companies.filter(c => c.status === 'NEEDS_COMPLETION').length;
      const activeCompanies = companies.filter(
  c => c.status !== 'REJECTED'
).length;

db.all(
  `
SELECT
  s.id,
  s.name,
  s.name_ar,
  COUNT(cs.company_id) as total
FROM stages s
LEFT JOIN company_stages cs
  ON s.id = cs.stage_id
  AND cs.status = 'IN_PROGRESS'
GROUP BY s.id
ORDER BY s.stage_order
  `,
  [],
  (err, stageStats) => {

    if (err) {
      return res.status(500).json({
        success: false
      });
    }

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

  }
);
    }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// REQUESTS LIST
// Fix: was selecting c.name — actual column is c.company_name
// Fix: search was filtering on c.name — must be c.company_name
// ─────────────────────────────────────────────────────────────────────────────
router.get('/requests', authMiddleware, employeeOrAdmin, (req, res) => {
  const { status, search } = req.query;
  const employeeId = req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

let query = `
  SELECT
    c.id,
    c.name AS company_name,
    c.status,
    c.created_at,
    c.assigned_employee_id,
    u.name AS assigned_employee_name,
    s.name_en AS sector_name,
    s.name_ar AS sector_name_ar,

    (
      SELECT st2.name
      FROM company_stages cs2
      JOIN stages st2
        ON cs2.stage_id = st2.id
      WHERE cs2.company_id = c.id
        AND cs2.status = 'IN_PROGRESS'
      LIMIT 1
    ) AS current_stage_name,

    (
      SELECT st2.name_ar
      FROM company_stages cs2
      JOIN stages st2
        ON cs2.stage_id = st2.id
      WHERE cs2.company_id = c.id
        AND cs2.status = 'IN_PROGRESS'
      LIMIT 1
    ) AS current_stage_name_ar

  FROM companies c
  LEFT JOIN users u
    ON c.assigned_employee_id = u.id
  LEFT JOIN sectors s
    ON c.sector_id = s.id
  WHERE 1 = 1
`;

  const params = [];

  if (!isAdmin) {
    query += ' AND c.assigned_employee_id = ?';
    params.push(employeeId);
  }

  if (status) {
    query += ' AND c.status = ?';
    params.push(status);
  }

  if (search) {
    // c.name is the real DB column name; the SELECT aliases it as company_name
    query += ' AND (c.name LIKE ? OR CAST(c.id AS TEXT) LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY c.created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error', error: err.message });
    res.json({ success: true, requests: rows });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST DETAILS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/requests/:id', authMiddleware, employeeOrAdmin, (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT c.*, s.name_en AS sector_name, u.name AS assigned_employee_name
     FROM companies c
     LEFT JOIN sectors s ON c.sector_id = s.id
     LEFT JOIN users u ON c.assigned_employee_id = u.id
     WHERE c.id = ?`,
    [id],
    (err, company) => {
      if (err) return res.status(500).json({ success: false, message: 'DB error' });
      if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

      db.all(
        `SELECT
  cs.*,
  st.name AS stage_name,
  st.name_ar AS stage_name_ar,
  st.stage_order
         FROM company_stages cs
         JOIN stages st ON cs.stage_id = st.id
         WHERE cs.company_id = ?
         ORDER BY st.stage_order ASC`,
        [id],
        (err, stages) => {
          if (err) return res.status(500).json({ success: false, message: 'DB error' });

          db.all(
            `SELECT
  ct.*,
  t.title AS task_title,
  t.title_ar AS task_title_ar,
  t.task_type
FROM company_tasks ct
JOIN tasks t
ON ct.task_id = t.id
WHERE ct.company_id = ?`,
            [id],
            (err, tasks) => {
              if (err) return res.status(500).json({ success: false, message: 'DB error' });

              const taskIds = tasks.map(t => t.id);
              if (taskIds.length === 0) {
                return res.json({ success: true, company, stages, tasks, documents: [] });
              }

              db.all(
                `SELECT td.*, ct.company_id,
                        t.title AS task_title,
                        st.name AS stage_name
                 FROM task_documents td
                 JOIN company_tasks ct ON td.company_task_id = ct.id
                 JOIN tasks t ON ct.task_id = t.id
                 JOIN company_stages cs ON ct.company_stage_id = cs.id
                 JOIN stages st ON cs.stage_id = st.id
                 WHERE td.company_task_id IN (${taskIds.map(() => '?').join(',')})`,
                taskIds,
                (err, documents) => {
                  if (err) return res.status(500).json({ success: false, message: 'DB error' });
                  res.json({ success: true, company, stages, tasks, documents });
                }
              );
            }
          );
        }
      );
    }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// APPROVE REQUEST
// ─────────────────────────────────────────────────────────────────────────────
router.put('/requests/:id/approve', authMiddleware, employeeOrAdmin, (req, res) => {
  const { id } = req.params;

  // S-04: verify the requesting employee is assigned to this company (admins bypass)
  const verifyOwnership = (callback) => {
    if (req.user.role === 'ADMIN') return callback();
    db.get(
      `SELECT assigned_employee_id FROM companies WHERE id = ?`,
      [id],
      (err, row) => {
        if (err) return res.status(500).json({ success: false, message: 'DB error' });
        if (!row) return res.status(404).json({ success: false, message: 'Company not found' });
        if (row.assigned_employee_id !== req.user.id) {
          return res.status(403).json({ success: false, message: 'Not assigned to this company' });
        }
        callback();
      }
    );
  };

  verifyOwnership(() => {
  // تحديث الشركة
  db.run(
   `UPDATE companies
    SET status = 'APPROVED'
     WHERE id = ? ` ,
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'DB error'
        });
      }

      // تحديث التاسكات
      db.run(
        `UPDATE company_tasks
         SET status = 'COMPLETED',
             completed_at = CURRENT_TIMESTAMP
         WHERE company_id = ?`,
        [id],
        function (err2) {

          if (err2) {
            return res.status(500).json({
              success: false,
              message: 'Task update failed'
            });
          }

          // تحديث الستيج
          db.run(
            `UPDATE company_stages
             SET status = 'COMPLETED',
                 completed_at = CURRENT_TIMESTAMP
             WHERE company_id = ?`,
            [id],
            function (err3) {

              if (err3) {
                return res.status(500).json({
                  success: false,
                  message: 'Stage update failed'
                });
              }

              // إشعار — CLIENT role only to avoid notifying employees linked to the same company
              db.run(
                `INSERT INTO notifications
                 (user_id, message, type, related_company_id)
                 SELECT u.id,
                        'requestApprovedDesc',
                        'REQUEST_APPROVED',
                        ?
                 FROM users u
                 WHERE u.company_id = ?
                   AND u.role = 'CLIENT'`,
                [id, id],
                () => {}
              );

              res.json({
                success: true,
                message: 'Request approved'
              });
            }
          );
        }
      );
    }
  );
  }); // end verifyOwnership
});

// ─────────────────────────────────────────────────────────────────────────────
// REJECT REQUEST
// ─────────────────────────────────────────────────────────────────────────────
router.put('/requests/:id/reject', authMiddleware, employeeOrAdmin, (req, res) => {
  const { id } = req.params;

  // S-04: verify the requesting employee is assigned to this company (admins bypass)
  const verifyOwnership = (callback) => {
    if (req.user.role === 'ADMIN') return callback();
    db.get(
      `SELECT assigned_employee_id FROM companies WHERE id = ?`,
      [id],
      (err, row) => {
        if (err) return res.status(500).json({ success: false, message: 'DB error' });
        if (!row) return res.status(404).json({ success: false, message: 'Company not found' });
        if (row.assigned_employee_id !== req.user.id) {
          return res.status(403).json({ success: false, message: 'Not assigned to this company' });
        }
        callback();
      }
    );
  };

  verifyOwnership(() => {
  db.run(
    `UPDATE companies SET status = 'NEEDS_COMPLETION' WHERE id = ?`,
    [id],
    function (err) {
      if (err) return res.status(500).json({ success: false, message: 'DB error' });

      // CLIENT role only to avoid notifying employees linked to the same company
      db.run(
        `INSERT INTO notifications (user_id, message, type, related_company_id)
         SELECT u.id, 'Your request requires additional information. Please complete the required details and resubmit.', 'RESUBMISSION_REQUESTED', ?
         FROM users u WHERE u.company_id = ? AND u.role = 'CLIENT'`,
        [id, id],
        () => {}
      );

      res.json({ success: true, message: 'Request rejected' });
    }
  );
  }); // end verifyOwnership
});

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST RESUBMISSION
// ─────────────────────────────────────────────────────────────────────────────
router.put('/requests/:id/resubmit', authMiddleware, employeeOrAdmin, (req, res) => {
  const { id } = req.params;

  // S-04: verify the requesting employee is assigned to this company (admins bypass)
  const verifyOwnership = (callback) => {
    if (req.user.role === 'ADMIN') return callback();
    db.get(
      `SELECT assigned_employee_id FROM companies WHERE id = ?`,
      [id],
      (err, row) => {
        if (err) return res.status(500).json({ success: false, message: 'DB error' });
        if (!row) return res.status(404).json({ success: false, message: 'Company not found' });
        if (row.assigned_employee_id !== req.user.id) {
          return res.status(403).json({ success: false, message: 'Not assigned to this company' });
        }
        callback();
      }
    );
  };

  verifyOwnership(() => {
  db.run(
    `UPDATE companies SET status = 'NEEDS_COMPLETION' WHERE id = ?`,
    [id],
    function (err) {
      if (err) return res.status(500).json({ success: false, message: 'DB error' });

      // CLIENT role only to avoid notifying employees linked to the same company
      db.run(
        `INSERT INTO notifications (user_id, message, type, related_company_id)
         SELECT u.id, 'Please re-submit the required documents.', 'RESUBMISSION_REQUESTED', ?
         FROM users u WHERE u.company_id = ? AND u.role = 'CLIENT'`,
        [id, id],
        () => {}
      );

      res.json({ success: true, message: 'Resubmission requested' });
    }
  );
  }); // end verifyOwnership
});

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTS LIST
// Fix: was selecting c.name AS company_name — must use c.company_name
// Fix: search was using c.name — must be c.company_name
// ─────────────────────────────────────────────────────────────────────────────
router.get('/documents', authMiddleware, employeeOrAdmin, (req, res) => {
  const { status, search } = req.query;
  const employeeId = req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  let query = `
    SELECT
      td.id,
      td.file_name,
      td.file_url,
      td.status,
      td.uploaded_at,
      td.rejection_reason,
      td.company_task_id,
      c.name AS company_name,
      c.id AS company_id,
      t.title AS task_title,
      st.name AS stage_name
    FROM task_documents td
    JOIN company_tasks ct ON td.company_task_id = ct.id
    JOIN companies c ON ct.company_id = c.id
    JOIN tasks t ON ct.task_id = t.id
    JOIN company_stages cs ON ct.company_stage_id = cs.id
    JOIN stages st ON cs.stage_id = st.id
    WHERE 1=1
  `;

  const params = [];

  if (!isAdmin) {
    query += ' AND c.assigned_employee_id = ?';
    params.push(employeeId);
  }

  if (status) {
    query += ' AND td.status = ?';
    params.push(status);
  }

  if (search) {
    // c.name is the real DB column; the SELECT aliases it as company_name
    query += ' AND (c.name LIKE ? OR t.title LIKE ? OR td.file_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY td.uploaded_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error', error: err.message });
    res.json({ success: true, documents: rows });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// APPROVE DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────
router.put(
  '/documents/:id/approve',
  authMiddleware,
  employeeOrAdmin,
  (req, res) => {

    const { id } = req.params;

    db.get(
      `
      SELECT status
      FROM task_documents
      WHERE id = ?
      `,
      [id],
      (err, docStatus) => {

        if (err) {
          return res.status(500).json({
            success: false,
            message: "DB error"
          });
        }

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

        db.run(
          `
          UPDATE task_documents
          SET
            status = 'APPROVED',
            reviewed_by = ?,
            reviewed_at = CURRENT_TIMESTAMP
          WHERE id = ?
          `,
          [req.user.id, id],
          function (err) {

      if (err) {
        return res.status(500).json({
          success: false,
          message: 'DB error'
        });
      }

      db.get(
        `
SELECT
  td.company_task_id,
  ct.company_id
FROM task_documents td
JOIN company_tasks ct
  ON td.company_task_id = ct.id
WHERE td.id = ?
        `,
        [id],
        (err2, doc) => {
console.log('DOC ID =', id);
console.log(
  'COMPANY TASK ID =',
  doc?.company_task_id
);          if (err2 || !doc) {
            return res.json({
              success: true,
              message: 'Document approved'
            });
          }

db.get(
  `
  SELECT COUNT(*) AS uploadedCount
  FROM task_documents
  WHERE company_task_id = ?
  AND status = 'APPROVED'
  `,
  [doc.company_task_id],
  (err3, approvedResult) => {

    console.log('UPDATED TASK =', doc.company_task_id);
    console.log('CHANGES =', this.changes);
    console.log('ERROR =', err3);

    db.get(
  `
SELECT
  ct.company_stage_id,
  ct.task_id,
  t.task_type
FROM company_tasks ct
JOIN tasks t
  ON ct.task_id = t.id
WHERE ct.id = ?
  `,
  [doc.company_task_id],
  (err4, taskRow) => {

    if (!taskRow) {
      return res.json({
        success: true,
        message: 'Document approved'
      });
    }
// إذا كان File -> يكفي أول ملف
if (taskRow.task_type === "file") {

  db.run(
    `
    UPDATE company_tasks
    SET status = 'COMPLETED'
    WHERE id = ?
    `,
    [doc.company_task_id]
  );
db.run(
  `
  INSERT INTO notifications (
    user_id,
    message,
    type,
    related_company_id
  )
  SELECT
    u.id,
  "documentUploadedDesc",
    'DOCUMENT_APPROVED',
    ?
  FROM users u
  WHERE u.company_id = ?
    AND u.role = 'CLIENT'
  `,
  [
    doc.company_id,
    doc.company_id,
  ]
);
} else {

  // في حالة License:
  // إذا تم اعتماد جميع الملفات، لا نكمل التاسك.
  // نتركه UNDER_REVIEW إلى أن يرفع الأدمن الترخيص النهائي.
  db.get(
    `
    SELECT COUNT(*) AS requiredCount
    FROM task_required_documents
    WHERE task_id = ?
    `,
    [taskRow.task_id],
    (errReq, requiredResult) => {

      if (
        approvedResult.uploadedCount >=
        requiredResult.requiredCount
      ) {

        console.log(
          "All required documents approved. Waiting for final license upload."
        );

      }

    }
  );

}

    db.get(
      `
      SELECT COUNT(*) AS remaining
      FROM company_tasks
      WHERE company_stage_id = ?
      AND status != 'COMPLETED'
      `,
      [taskRow.company_stage_id],
      (err5, result) => {

        if (result.remaining > 0) {
          
          return res.json({
            success: true,
            message: 'Document approved'
          });
        }

db.run(
  `
  UPDATE company_stages
  SET status = 'COMPLETED'
  WHERE id = ?
  `,
  [taskRow.company_stage_id],
  function () {

    db.get(
      `
      SELECT company_id, stage_id
      FROM company_stages
      WHERE id = ?
      `,
      [taskRow.company_stage_id],
      (err6, currentStage) => {

        if (!currentStage) {
          return res.json({
            success: true,
            message: 'Document approved'
          });
        }

        db.get(
          `
          SELECT cs.id
FROM company_stages cs
JOIN stages s
ON cs.stage_id = s.id
WHERE cs.company_id = ?
AND s.stage_order > (
  SELECT s2.stage_order
  FROM company_stages cs2
  JOIN stages s2
  ON cs2.stage_id = s2.id
  WHERE cs2.id = ?
)
ORDER BY s.stage_order
LIMIT 1
          `,
         [
  currentStage.company_id,
  taskRow.company_stage_id
],
          (err7, nextStage) => {

if (!nextStage) {

   updateCompanyStatus(
    currentStage.company_id
  );

  return res.json({
    success: true,
    message: 'Document approved'
  });

}

db.run(
  `
  UPDATE company_stages
  SET status = 'IN_PROGRESS'
  WHERE id = ?
  `,
  [nextStage.id],
  async function () {

     updateCompanyStatus(
      currentStage.company_id
    );

    return res.json({
      success: true,
      message: 'Document approved'
    
    });

  }
);

          }
        );

      }
    );

  }
);

      }
    );

  }
);

  }
);

        }
      );

    }
  );
});
      }
    );
// ─────────────────────────────────────────────────────────────────────────────
// REJECT DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────
router.put('/documents/:id/reject', authMiddleware, employeeOrAdmin, (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  db.run(
    `UPDATE task_documents SET status = 'REJECTED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, rejection_reason = ? WHERE id = ?`,
    [req.user.id, reason || '', id],
    function (err) {
      if (err) return res.status(500).json({ success: false, message: 'DB error' });
      res.json({ success: true, message: 'Document rejected' });
    }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST DOCUMENT RESUBMISSION
// ─────────────────────────────────────────────────────────────────────────────
router.put(
  '/documents/:id/needs-resubmission',
  authMiddleware,
  employeeOrAdmin,
  (req, res) => {

    const { id } = req.params;
    const { reason } = req.body;

    db.run(
      `
      UPDATE task_documents
      SET
        status = 'NEEDS_RESUBMISSION',
        reviewed_by = ?,
        reviewed_at = CURRENT_TIMESTAMP,
        rejection_reason = ?
      WHERE id = ?
      `,
      [req.user.id, reason || '', id],
      function (err) {

        if (err) {
          return res.status(500).json({
            success: false,
            message: 'DB error'
          });
        }

        db.get(
          `
          SELECT
            ct.company_id,
            ct.id AS company_task_id
          FROM task_documents td
          JOIN company_tasks ct
            ON td.company_task_id = ct.id
          WHERE td.id = ?
          `,
          [id],
          (err, row) => {

            if (!row) {
              return res.json({
                success: true,
                message: 'Resubmission requested'
              });
            }

            // رجوع التاسك إلى Pending
            db.run(
              `
              UPDATE company_tasks
              SET status = 'PENDING'
              WHERE id = ?
              `,
              [row.company_task_id]
            );

            db.run(
  `
  UPDATE company_stages
  SET status = 'IN_PROGRESS'
  WHERE id = (
    SELECT company_stage_id
    FROM company_tasks
    WHERE id = ?
  )
  `,
  [row.company_task_id]
);

db.run(
  `
  UPDATE companies
  SET status = 'NEEDS_COMPLETION'
  WHERE id = ?
  `,
  [row.company_id]
);

// إشعار للعميل
db.run(
  `
  INSERT INTO notifications
  (
    user_id,
    message,
    type,
    related_company_id
  )
  SELECT
    u.id,
    ?,
    'RESUBMISSION_REQUESTED',
    ?
  FROM users u
  WHERE u.company_id = ?
    AND u.role = 'CLIENT'
  `,
[
  `resubmissionRequestedDesc|${reason || "Please review the uploaded document."}`,
    row.company_id,
    row.company_id,
  ]
);

            return res.json({
              success: true,
              message: 'Resubmission requested'
            });

          }
        );

      }
    );

  }
);

// ─────────────────────────────────────────────────────────────────────────────
// MARK ALL NOTIFICATIONS READ
// IMPORTANT: This MUST come BEFORE /:id/read to avoid Express matching
//            "read-all" as an id param
// Fix: was placed after /:id/read — caused route collision
// ─────────────────────────────────────────────────────────────────────────────
router.put('/notifications/read-all', authMiddleware, (req, res) => {
  db.run(
    `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
    [req.user.id],
    function (err) {
      if (err) return res.status(500).json({ success: false, message: 'DB error' });
      res.json({ success: true });
    }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS LIST
// Fix: was selecting c.name — actual column is c.company_name
// ─────────────────────────────────────────────────────────────────────────────
router.get('/notifications', authMiddleware, (req, res) => {
  db.all(
    `SELECT n.*, c.name AS company_name
     FROM notifications n
     LEFT JOIN companies c ON n.related_company_id = c.id
     WHERE n.user_id = ?
     ORDER BY n.created_at DESC
     LIMIT 50`,
    [req.user.id],
    (err, rows) => {
      console.log('NOTIFICATIONS:' , rows);
      if (err) 
        return res.status(500).json({
       success: false, 
       message: 'DB error' });
      res.json({ 
        success: true,
         notifications: rows });
    }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// MARK SINGLE NOTIFICATION READ
// ─────────────────────────────────────────────────────────────────────────────
router.put('/notifications/:id/read', authMiddleware, (req, res) => {
  db.run(
    `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
    [req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ success: false, message: 'DB error' });
      res.json({ success: true });
    }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL OVERRIDE TASK STATUS (ADMIN ONLY)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/tasks/:id/status', authMiddleware, (req, res) => {

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin only'
    });
  }

  const { status } = req.body;

  db.run(
    `UPDATE company_tasks
     SET status = ?
     WHERE id = ?`,
    [status, req.params.id],
    function (err) {

      if (err) {
        return res.status(500).json({
          success: false,
          message: 'DB error'
        });
      }
db.get(
  `
  SELECT company_stage_id
  FROM company_tasks
  WHERE id = ?
  `,
  [req.params.id],
  (err2, taskRow) => {

    if (err2 || !taskRow) {
      return res.json({
        success: true,
        message: 'Task status updated'
      });
    }

    db.get(
      `
      SELECT COUNT(*) AS remaining
      FROM company_tasks
      WHERE company_stage_id = ?
      AND status != 'COMPLETED'
      `,
      [taskRow.company_stage_id],
      (err3, result) => {

const stageCompleted = result.remaining === 0;

db.run(
  `
  UPDATE company_stages
  SET status = ?
  WHERE id = ?
  `,
  [
    stageCompleted ? 'COMPLETED' : 'IN_PROGRESS',
    taskRow.company_stage_id
  ],
  function () {

    db.get(
      `
      SELECT company_id, stage_id
      FROM company_stages
      WHERE id = ?
      `,
      [taskRow.company_stage_id],
      (err4, currentStage) => {

        if (err4 || !currentStage) {
          return res.json({
            success: true,
            message: 'Task status updated'
          });
        }

if (!stageCompleted) {
console.log('STAGE NOT COMPLETED');
console.log('CURRENT STAGE:', currentStage);
  db.get(
    `
SELECT cs.id
FROM company_stages cs
JOIN stages s
ON cs.stage_id = s.id
WHERE cs.company_id = ?
AND s.stage_order > (
  SELECT s2.stage_order
  FROM company_stages cs2
  JOIN stages s2
  ON cs2.stage_id = s2.id
  WHERE cs2.id = ?
)
ORDER BY s.stage_order
LIMIT 1
    `,
   [
  currentStage.company_id,
  taskRow.company_stage_id
],
    (errNext, nextStage) => {

      if (nextStage) {
console.log('LOCKING STAGE:', nextStage.id);
db.run(
  `
  UPDATE company_stages
  SET status = 'LOCKED'
  WHERE company_id = ?
  AND stage_id > ?
  `,
  [
    currentStage.company_id,
    currentStage.stage_id
  ]
);

      }

      return res.json({
        success: true,
        message: 'Task status updated'
      });

    }
  );

  return;
}

        db.get(
          `
SELECT cs.id
FROM company_stages cs
JOIN stages s
ON cs.stage_id = s.id
WHERE cs.company_id = ?
AND s.stage_order > (
  SELECT s2.stage_order
  FROM company_stages cs2
  JOIN stages s2
  ON cs2.stage_id = s2.id
  WHERE cs2.id = ?
)
ORDER BY s.stage_order
LIMIT 1
          `,
         [
  currentStage.company_id,
  taskRow.company_stage_id
],
          (err5, nextStage) => {

console.log('CURRENT STAGE =', currentStage);
console.log('NEXT STAGE FOUND =', nextStage);

if (!nextStage) {

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

return res.json({
              success: true,
              message: 'Task status updated'
            });

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
);

    }
  );

});

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL OVERRIDE COMPANY STATUS (ADMIN ONLY)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/companies/:id/status', authMiddleware, (req, res) => {

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin only'
    });
  }

  const { status } = req.body;

  db.run(
    `UPDATE companies
     SET status = ?
     WHERE id = ?`,
    [status, req.params.id],
    function (err) {

      if (err) {
        return res.status(500).json({
          success: false,
          message: 'DB error'
        });
      }

      res.json({
        success: true,
        message: 'Company status updated'
      });

    }
  );

});

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL OVERRIDE STAGE STATUS (ADMIN ONLY)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/stages/:id/status', authMiddleware, (req, res) => {

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin only'
    });
  }

  const { status } = req.body;

  db.run(
    `UPDATE company_stages
     SET status = ?
     WHERE id = ?`,
    [status, req.params.id],
    function (err) {

      if (err) {
        return res.status(500).json({
          success: false,
          message: 'DB error'
        });
      }

      res.json({
        success: true,
        message: 'Stage status updated'
      });

    }
  );

});

router.post(
  "/tasks/:taskId/final-license",
  authMiddleware,
  employeeOrAdmin,
  upload.single("file"),
  (req, res) => {
    const { taskId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;

    db.run(
      `
      INSERT INTO task_documents (
        company_task_id,
        file_name,
        file_url,
        uploaded_by,
        status,
        is_final_license
      )
      VALUES (?, ?, ?, ?, 'APPROVED', 1)
      `,
      [taskId, req.file.originalname, fileUrl, req.user.id],
      function (err) {
        if (err) {
          console.log(err);
          return res.status(500).json({ success: false });
        }

        db.get(
  `
  SELECT company_id
  FROM company_tasks
  WHERE id = ?
  `,
  [taskId],
  function (err, task) {
    console.log(task);
    if (!err && task) {
      db.run(
        `
        INSERT INTO notifications (
          user_id,
          message,
          type,
          related_company_id
        )
        SELECT
          u.id,
'licenseIssuedDesc',
          'LICENSE_ISSUED',
          ?
        FROM users u
        WHERE u.company_id = ?
          AND u.role = 'CLIENT'
        `,
        [
          task.company_id,
          task.company_id
        ]
      );
    }
  }
);

        db.run(
          `
          UPDATE company_tasks
          SET status = 'COMPLETED'
          WHERE id = ?
          `,
          [taskId],
          function () {
            db.get(
              `
              SELECT company_stage_id
              FROM company_tasks
              WHERE id = ?
              `,
              [taskId],
              function (err2, taskRow) {
                if (err2 || !taskRow) {
                  return res.json({ success: true });
                }

                db.get(
                  `
                  SELECT COUNT(*) AS remaining
                  FROM company_tasks
                  WHERE company_stage_id = ?
                  AND status != 'COMPLETED'
                  `,
                  [taskRow.company_stage_id],
                  function (err3, result) {
                    if (err3) {
                      return res.json({ success: true });
                    }

                    if (result.remaining === 0) {
                      db.run(
                        `
                        UPDATE company_stages
                        SET status = 'COMPLETED'
                        WHERE id = ?
                        `,
                        [taskRow.company_stage_id],
                        function () {
                          db.get(
                            `
                            SELECT company_id
                            FROM company_stages
                            WHERE id = ?
                            `,
                            [taskRow.company_stage_id],
                            function (err4, currentStage) {
                              if (err4 || !currentStage) {
                                return res.json({ success: true });
                              }

                              db.get(
                                `
                                SELECT cs.id
                                FROM company_stages cs
                                JOIN stages s ON cs.stage_id = s.id
                                WHERE cs.company_id = ?
                                  AND s.stage_order > (
                                    SELECT s2.stage_order
                                    FROM company_stages cs2
                                    JOIN stages s2 ON cs2.stage_id = s2.id
                                    WHERE cs2.id = ?
                                  )
                                ORDER BY s.stage_order
                                LIMIT 1
                                `,
                                [
                                  currentStage.company_id,
                                  taskRow.company_stage_id,
                                ],
                                function (err5, nextStage) {
if (nextStage) {

  db.run(
    `
    UPDATE company_stages
    SET status = 'IN_PROGRESS'
    WHERE id = ?
    `,
    [nextStage.id],
    async function () {

       updateCompanyStatus(
        currentStage.company_id
      );

      return res.json({
        success: true,
      });

    }
  );

} else {

   updateCompanyStatus(
    currentStage.company_id
  );

  return res.json({
    success: true,
  });

}
                                }
                              );
                            }
                          );
                        }
                      );
                    } else {
                      return res.json({
                        success: true,
                        
                      });
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
);
module.exports = router;