const express = require('express');
const router = express.Router();
const prisma = require('../prisma/client');

router.get('/', async (req, res) => {

  try {

    const rows = await prisma.sectors.findMany({
      orderBy: { id: 'asc' }
    });

    res.json({
      success: true,
      sectors: rows
    });

  } catch (err) {

    return res.status(500).json({
      success: false
    });

  }

});

module.exports = router;
