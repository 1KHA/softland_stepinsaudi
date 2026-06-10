const express = require('express');
const router = express.Router();
const db = require('../db');

// GET ALL TASKS
router.get('/', (req, res) => {

  const { stage_id, sector_id } = req.query;

  let query = `
    SELECT
      t.*,
      s.name AS stage_name,
      sec.name_en AS sector_name
    FROM tasks t
    LEFT JOIN stages s
      ON t.stage_id = s.id
    LEFT JOIN sectors sec
      ON t.sector_id = sec.id
    WHERE 1 = 1
  `;

  const params = [];

  if (stage_id) {
    query += ' AND t.stage_id = ?';
    params.push(stage_id);
  }

  if (sector_id) {
    query += ' AND t.sector_id = ?';
    params.push(sector_id);
  }

  query += `
    ORDER BY
      t.stage_id,
      t.task_order
  `;

  db.all(query, params, (err, rows) => {

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

  });

});

// CREATE TASK
router.post('/', (req, res) => {

  const {
  stage_id,
  sector_id,
  title,
  description,
  required,
  task_type,
  is_global
} = req.body;

  db.get(
    `
    SELECT MAX(task_order) AS maxOrder
    FROM tasks
    WHERE stage_id = ?
    AND sector_id = ?
    `,
    [stage_id, sector_id],
    (err, row) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error reading task order'
        });
      }

      const nextOrder = (row?.maxOrder || 0) + 1;

      db.run(
        `
        INSERT INTO tasks
(
  stage_id,
  sector_id,
  title,
  description,
  required,
  task_order,
  is_active,
  task_type,
  is_global
)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
[
  stage_id,
  sector_id,
  title,
  description,
  required ? 1 : 0,
  nextOrder,
  1,
  task_type,
  is_global
],
        function(err) {

          if (err) {

            console.log(err);

            return res.status(500).json({
              success: false,
              message: 'Error creating task'
            });

          }

const taskId = this.lastID;

const companiesQuery =
  Number(sector_id) === 5
    ? `
      SELECT *
      FROM companies
    `
    : `
      SELECT *
      FROM companies
      WHERE sector_id = ?
    `;

const companiesParams =
  Number(sector_id) === 5
    ? []
    : [sector_id];

db.all(
  companiesQuery,
  companiesParams,
  (err, companies) => {

    if (err) {
      console.log(err);
      return;
    }

    companies.forEach((company) => {

    db.get(
      `
      SELECT *
      FROM company_stages
      WHERE company_id = ?
      AND stage_id = ?
      `,
      [company.id, stage_id],

      (err, companyStage) => {

        if (err || !companyStage) {
          return;
        }

        db.get(
          `
          SELECT *
          FROM company_tasks
          WHERE company_id = ?
          AND task_id = ?
          `,
          [company.id, taskId],

          (err, existingTask) => {

            if (existingTask) {
              return;
            }

            db.run(
              `
              INSERT INTO company_tasks
              (
                company_id,
                task_id,
                company_stage_id,
                status
              )
              VALUES (?, ?, ?, 'PENDING')
              `,
              [
                company.id,
                taskId,
                companyStage.id
              ]
            );

          }
        );

      }
    );

  });

}
);
const docs = req.body.documents || [];

if (docs.length === 0) {

  return res.json({
    success: true,
    id: taskId
  });

}

const stmt = db.prepare(`
INSERT INTO task_required_documents
(task_id, document_name, is_required)
VALUES (?, ?, 1)
`);

docs.forEach((doc) => {
  stmt.run(taskId, doc);
});

stmt.finalize();

res.json({
  success: true,
  id: taskId
});

        }
      );

    }
  );

});

router.put('/:id', (req, res) => {

  const { id } = req.params;

  const {
    stage_id,
    sector_id,
    title,
    description,
    required,
    task_type,
    is_global
  } = req.body;

  console.log(
  'UPDATE REQUEST',
  {
    stage_id,
    sector_id,
    title
  }
);
  db.run(
    `
    UPDATE tasks
    SET
      stage_id = ?,
      sector_id = ?,
      title = ?,
      description = ?,
      required = ?,
      task_type = ?,
      is_global = ?
    WHERE id = ?
    `,
    [
      stage_id,
      sector_id,
      title,
      description,
      required ? 1 : 0,
      task_type,
      is_global,
      id
    ],
    function(err) {

      if (err) {

        console.log(err);

        return res.status(500).json({
          success: false,
          message: 'Error updating task'
        });

      }

      console.log(
        'TASK UPDATED',
        id,
        stage_id,
        sector_id
      );
      db.run(
  `
  DELETE FROM company_tasks
  WHERE task_id = ?
  `,
  [id],
  (err) => {

    if (err) {
      console.log(err);
    }

    console.log(
      'OLD COMPANY TASKS DELETED'
    );
    console.log(
  'SECTOR ID TYPE:',
  sector_id,
  typeof sector_id
);
const companiesQuery =
  Number(sector_id) === 5
    ? `
      SELECT *
      FROM companies
    `
    : `
      SELECT *
      FROM companies
      WHERE sector_id = ?
    `;

const companiesParams =
  Number(sector_id) === 5
    ? []
    : [sector_id];

db.all(
  companiesQuery,
  companiesParams,
  (err, companies) => {

    if (err) {
      console.log(err);
      return;
    }

    console.log(
      'MATCHING COMPANIES',
      companies.length
    );
companies.forEach((company) => {

  db.get(
    `
    SELECT *
    FROM company_stages
    WHERE company_id = ?
    AND stage_id = ?
    `,
    [company.id, stage_id],

    (err, companyStage) => {

      if (err || !companyStage) {
        return;
      }

      db.run(
        `
        INSERT INTO company_tasks
        (
          company_id,
          task_id,
          company_stage_id,
          status
        )
        VALUES (?, ?, ?, 'PENDING')
        `,
        [
          company.id,
          id,
          companyStage.id
        ]
      );

    }
  );

});
  }
);
  }
);

      res.json({
        success: true
      });

    }
  );

});

// DELETE TASK
router.delete('/:id', (req, res) => {

  const { id } = req.params;

  db.run(
    `
    DELETE FROM company_tasks
    WHERE task_id = ?
    `,
    [id],
    (err) => {

      if (err) {
        console.log(err);
      }

      db.run(
        `
        DELETE FROM task_required_documents
        WHERE task_id = ?
        `,
        [id],
        (err) => {

          if (err) {
            console.log(err);
          }

          db.run(
            `
            DELETE FROM tasks
            WHERE id = ?
            `,
            [id],
            function(err) {

              if (err) {

                console.log(err);

                return res.status(500).json({
                  success: false,
                  message: 'Error deleting task'
                });

              }

              res.json({
                success: true
              });

            }
          );

        }
      );

    }
  );

});
module.exports = router;