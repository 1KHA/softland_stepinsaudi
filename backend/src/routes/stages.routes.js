const express = require('express');
const router = express.Router();
const prisma = require('../prisma/client');

router.get('/', async (req, res) => {

  try {

    const rows = await prisma.stages.findMany({
      where: { is_active: 1 },
      orderBy: { stage_order: 'asc' },
      select: {
        id: true,
        name: true,
        name_ar: true,
        description: true,
        description_ar: true,
        stage_order: true,
        workflow_phase: true,
        weight: true,
        is_active: true
      }
    });

    res.json({
      success: true,
      stages: rows
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: 'Error fetching stages'
    });
  }

});

router.post('/', async (req, res) => {
  const {
    name,
    name_ar,
    description,
    description_ar,
    workflow_phase
  } = req.body;

  try {

    // Case-insensitive duplicate name check (LOWER(name) = LOWER(?))
    const existingStage = await prisma.stages.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      },
      select: { id: true }
    });

    if (existingStage) {
      return res.status(400).json({
        success: false,
        message: 'Stage name already exists'
      });
    }

    const maxOrderResult = await prisma.stages.aggregate({
      _max: { stage_order: true }
    });

    const nextOrder = (maxOrderResult._max.stage_order || 0) + 1;

    let newStage;
    try {
      newStage = await prisma.stages.create({
        data: {
          name,
          name_ar: name_ar || null,
          description,
          description_ar: description_ar || null,
          stage_order: nextOrder,
          weight: 25,
          is_active: 1,
          workflow_phase: workflow_phase || "PROCESSING"
        }
      });
    } catch (err) {
      console.log(err);

      return res.status(500).json({
        success: false,
        message: 'Error creating stage'
      });
    }

    const stageId = newStage.id;

    // fire-and-forget: create LOCKED company_stages rows for every existing company
    (async () => {
      try {
        const companies = await prisma.companies.findMany({
          select: { id: true }
        });

        for (const company of companies) {
          try {
            await prisma.company_stages.create({
              data: {
                company_id: company.id,
                stage_id: stageId,
                status: "LOCKED"
              }
            });
          } catch (err) {
            console.log(err);
          }
        }
      } catch (err) {
        console.log(err);
      }
    })();

    res.json({
      success: true,
      id: stageId
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: 'Error checking stage'
    });
  }

});

router.put('/reorder', async (req, res) => {
  const { stages } = req.body;
  console.log('REORDER:', stages);

  if (!stages || !Array.isArray(stages)) {
    return res.status(400).json({
      success: false
    });
  }

  for (let index = 0; index < stages.length; index++) {
    const stage = stages[index];
    try {
      await prisma.stages.update({
        where: { id: stage.id },
        data: { stage_order: index + 1 }
      });
    } catch (err) {
      console.log(err);
    }
  }

  res.json({
    success: true
  });
});

router.put('/:id', async (req, res) => {

  const { id } = req.params;

  const {
    name,
    name_ar,
    description,
    description_ar,
    workflow_phase
  } = req.body;

  async function updateStage() {
    try {
      await prisma.stages.update({
        where: { id: Number(id) },
        data: {
          name,
          name_ar: name_ar || null,
          description,
          description_ar: description_ar || null,
          workflow_phase
        }
      });

      res.json({
        success: true
      });

    } catch (err) {
      console.log(err);

      return res.status(500).json({
        success: false
      });
    }
  }

  try {

    const existingStage = await prisma.stages.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        id: { not: Number(id) }
      },
      select: { id: true }
    });

    if (existingStage) {
      return res.status(400).json({
        success: false,
        message: 'Stage name already exists'
      });
    }

    // السماح بتكرار PROCESSING فقط
    if (workflow_phase && workflow_phase !== "PROCESSING") {

      const existingPhase = await prisma.stages.findFirst({
        where: {
          workflow_phase: workflow_phase,
          id: { not: Number(id) }
        },
        select: { id: true }
      });

      if (existingPhase) {
        return res.status(400).json({
          success: false,
          message: "Workflow phase already exists"
        });
      }

      await updateStage();

    } else {

      await updateStage();

    }

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false
    });
  }

});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {

    const total = await prisma.tasks.count({
      where: { stage_id: Number(id) }
    });

    if (total > 0) {
      return res.status(400).json({
        success: false,
        message: 'This stage contains tasks and cannot be deleted'
      });
    }

    try {
      await prisma.stages.delete({
        where: { id: Number(id) }
      });
    } catch (err) {
      return res.status(500).json({
        success: false
      });
    }

    try {
      const stages = await prisma.stages.findMany({
        orderBy: { stage_order: 'asc' },
        select: { id: true }
      });

      for (let index = 0; index < stages.length; index++) {
        const stage = stages[index];
        try {
          await prisma.stages.update({
            where: { id: stage.id },
            data: { stage_order: index + 1 }
          });
        } catch (err) {
          console.log(err);
        }
      }

      return res.json({
        success: true
      });

    } catch (err) {
      return res.json({
        success: true
      });
    }

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error checking tasks'
    });
  }

});

module.exports = router;
