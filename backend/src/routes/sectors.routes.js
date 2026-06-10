const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {

  db.all(
    `
    SELECT *
    FROM sectors
    ORDER BY id
    `,
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json({
          success: false
        });
      }

      res.json({
        success: true,
        sectors: rows
      });

    }
  );

});

module.exports = router;