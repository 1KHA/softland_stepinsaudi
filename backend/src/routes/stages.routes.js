const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.all(
    `
SELECT
  id,
  name,
  description,
  stage_order,
  workflow_phase,
  weight,
  is_active
FROM stages
WHERE is_active = 1
ORDER BY stage_order ASC
    `,
    [],
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
});

router.post('/', (req, res) => {
const {
  name,
  description,
  workflow_phase
} = req.body;



  db.get(
    `
    SELECT id
    FROM stages
    WHERE LOWER(name) = LOWER(?)
    `,
    [name],
    (err, existingStage) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error checking stage'
        });
      }

      if (existingStage) {
        return res.status(400).json({
          success: false,
          message: 'Stage name already exists'
        });
      }

      db.get(
        `
        SELECT MAX(stage_order) as maxOrder
        FROM stages
        `,
        [],
        (err, row) => {

          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Error reading stages'
            });
          }

          const nextOrder = (row?.maxOrder || 0) + 1;
          db.run(
            `
INSERT INTO stages
(
  name,
  description,
  stage_order,
  weight,
  is_active,
  workflow_phase

)
            VALUES (?, ?, ?, ?, ?, ?)           `,
[
  name,
  description,
  nextOrder,
  25,
  1,
  workflow_phase || "PROCESSING"

],
            function (err) {
              if (err) {
                console.log(err);

                return res.status(500).json({
                  success: false,
                  message: 'Error creating stage'
                });
              }
const stageId = this.lastID;
db.all(
  `
  SELECT id
  FROM companies
  `,
  [],

  (err, companies) => {

    if (err) {
      console.log(err);
      return;
    }
    companies.forEach((company) => {

      db.run(
        `
        INSERT INTO company_stages
        (
          company_id,
          stage_id,
          status
        )
        VALUES (?, ?, ?)
        `,
        [
          company.id,
          stageId,
          "LOCKED"
        ]
      );

    });

  });
              res.json({
                success: true,
                id: this.lastID
              });

            });
});
});
});

router.put('/reorder', (req, res) => {
const { stages } = req.body;
console.log('REORDER:', stages);

  if (!stages || !Array.isArray(stages)) {
    return res.status(400).json({
      success: false
    });
  }
  stages.forEach((stage, index) => {

    db.run(
      `
      UPDATE stages
      SET stage_order = ?
      WHERE id = ?
      `,
      [index + 1, stage.id]
    );
 });

  res.json({
    success: true
  });
});

router.put('/:id', (req, res) => {

const { id } = req.params;

const {
  name,
  description,
  workflow_phase
} = req.body;

  db.get(
    `
    SELECT id
    FROM stages
    WHERE LOWER(name) = LOWER(?)
    AND id != ?
    `,
    [name, id],
    (err, existingStage) => {

if (existingStage) {
  return res.status(400).json({
    success: false,
    message: 'Stage name already exists'
  });
}

// السماح بتكرار PROCESSING فقط
if (
  workflow_phase &&
  workflow_phase !== "PROCESSING"
) {

  db.get(
    `
    SELECT id
    FROM stages
    WHERE workflow_phase = ?
    AND id != ?
    `,
    [workflow_phase, id],
    (err, existingPhase) => {

      if (err) {
        return res.status(500).json({
          success: false
        });
      }

      if (existingPhase) {
        return res.status(400).json({
          success: false,
          message: "Workflow phase already exists"
        });
      }

      updateStage();

    }
  );

} else {

  updateStage();

}

function updateStage() {

  db.run(
        `
UPDATE stages
SET
  name = ?,
  description = ?,
  workflow_phase = ?
WHERE id = ?
        `,
        [
  name,
  description,
  workflow_phase,
  id
],
        function (err) {

          if (err) {

            console.log(err);

            return res.status(500).json({
              success: false
            });
          }

          res.json({
            success: true
          });

        }
      );
    }

    }
  );

});


router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `
    SELECT COUNT(*) as total
    FROM tasks
    WHERE stage_id = ?
    `,
    [id],
    (err, row) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error checking tasks'
        });
      }

      if (row.total > 0) {
        return res.status(400).json({
          success: false,
          message: 'This stage contains tasks and cannot be deleted'
        });
      }

      db.run(
        `
        DELETE FROM stages
        WHERE id = ?
        `,
        [id],
        function (err) {

          if (err) {
            return res.status(500).json({
              success: false
            });
          }

db.all(
  `
  SELECT id
  FROM stages
  ORDER BY stage_order ASC
  `,
  [],
  (err, stages) => {

    if (err) {
      return res.json({
        success: true
      });
    }

    stages.forEach((stage, index) => {
      db.run(
        `
        UPDATE stages
        SET stage_order = ?
        WHERE id = ?
        `,
        [index + 1, stage.id]
      );
    });

    return res.json({
      success: true
    });

  }
);

        });
    });
});

module.exports = router;