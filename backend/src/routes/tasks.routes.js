const express = require('express');
const router = express.Router();
const prisma = require('../prisma/client');

// GET ALL TASKS
router.get('/', async (req, res) => {

  const { stage_id, sector_id } = req.query;

  const where = {};

  if (stage_id) {
    where.stage_id = Number(stage_id);
  }

  if (sector_id) {
    where.sector_id = Number(sector_id);
  }

  try {

    const rows = await prisma.tasks.findMany({
      where,
      orderBy: [
        { stage_id: 'asc' },
        { task_order: 'asc' }
      ],
      include: {
        stages: {
          select: { name: true, name_ar: true }
        },
        sectors: {
          select: { name_en: true, name_ar: true }
        }
      }
    });

    // flatten to match original flat SELECT with aliases:
    // stage_name, stage_name_ar, sector_name, sector_name_ar
    const flattened = rows.map((t) => {
      const { stages, sectors, ...rest } = t;
      return {
        ...rest,
        stage_name: stages ? stages.name : null,
        stage_name_ar: stages ? stages.name_ar : null,
        sector_name: sectors ? sectors.name_en : null,
        sector_name_ar: sectors ? sectors.name_ar : null
      };
    });

    res.json({
      success: true,
      tasks: flattened
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: 'Error fetching tasks'
    });
  }

});

// CREATE TASK
router.post('/', async (req, res) => {

  const {
    stage_id,
    sector_id,
    title,
    title_ar,
    description,
    description_ar,
    required,
    task_type,
    is_global
  } = req.body;

  try {

    const maxOrderResult = await prisma.tasks.aggregate({
      where: {
        stage_id: Number(stage_id),
        sector_id: Number(sector_id)
      },
      _max: { task_order: true }
    });

    const nextOrder = (maxOrderResult._max.task_order || 0) + 1;

    let newTask;
    try {
      newTask = await prisma.tasks.create({
        data: {
          stage_id: Number(stage_id),
          sector_id: Number(sector_id),
          title,
          title_ar,
          description,
          description_ar,
          required: required ? 1 : 0,
          task_order: nextOrder,
          is_active: 1,
          task_type,
          is_global
        }
      });
    } catch (err) {
      console.log(err);

      return res.status(500).json({
        success: false,
        message: 'Error creating task'
      });
    }

    const taskId = newTask.id;

    // fire-and-forget: propagate new task to existing companies of matching sector
    (async () => {
      try {

        const companies =
          Number(sector_id) === 5
            ? await prisma.companies.findMany()
            : await prisma.companies.findMany({
                where: { sector_id: Number(sector_id) }
              });

        for (const company of companies) {
          try {
            const companyStage = await prisma.company_stages.findFirst({
              where: {
                company_id: company.id,
                stage_id: Number(stage_id)
              }
            });

            if (!companyStage) continue;

            const existingTask = await prisma.company_tasks.findFirst({
              where: {
                company_id: company.id,
                task_id: taskId
              }
            });

            if (existingTask) continue;

            await prisma.company_tasks.create({
              data: {
                company_id: company.id,
                task_id: taskId,
                company_stage_id: companyStage.id,
                status: 'PENDING'
              }
            });

          } catch (err) {
            // matches original per-company silent failure behavior
          }
        }

      } catch (err) {
        console.log(err);
      }
    })();

    const docs = req.body.documents || [];

    if (docs.length === 0) {
      return res.json({
        success: true,
        id: taskId
      });
    }

    // batch insert of required documents (replaces db.prepare/stmt.run/stmt.finalize)
    for (const doc of docs) {
      await prisma.task_required_documents.create({
        data: {
          task_id: taskId,
          document_name: doc,
          is_required: 1
        }
      });
    }

    res.json({
      success: true,
      id: taskId
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: 'Error reading task order'
    });
  }

});

router.put('/:id', async (req, res) => {

  const { id } = req.params;

  const {
    stage_id,
    sector_id,
    title,
    title_ar,
    description,
    description_ar,
    required,
    task_type,
    is_global
  } = req.body;

  console.log(
    'UPDATE REQUEST',
    { stage_id, sector_id, title }
  );

  try {

    await prisma.tasks.update({
      where: { id: Number(id) },
      data: {
        stage_id: Number(stage_id),
        sector_id: Number(sector_id),
        title,
        title_ar,
        description,
        description_ar,
        required: required ? 1 : 0,
        task_type,
        is_global
      }
    });

    console.log('TASK UPDATED', id, stage_id, sector_id);

    try {
      await prisma.company_tasks.deleteMany({
        where: { task_id: Number(id) }
      });
    } catch (err) {
      console.log(err);
    }

    console.log('OLD COMPANY TASKS DELETED');
    console.log('SECTOR ID TYPE:', sector_id, typeof sector_id);

    try {

      const companies =
        Number(sector_id) === 5
          ? await prisma.companies.findMany()
          : await prisma.companies.findMany({
              where: { sector_id: Number(sector_id) }
            });

      console.log('MATCHING COMPANIES', companies.length);

      for (const company of companies) {
        try {
          const companyStage = await prisma.company_stages.findFirst({
            where: {
              company_id: company.id,
              stage_id: Number(stage_id)
            }
          });

          if (!companyStage) continue;

          await prisma.company_tasks.create({
            data: {
              company_id: company.id,
              task_id: Number(id),
              company_stage_id: companyStage.id,
              status: 'PENDING'
            }
          });

        } catch (err) {
          // matches original per-company silent failure behavior
        }
      }

    } catch (err) {
      console.log(err);
    }

    res.json({
      success: true
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: 'Error updating task'
    });
  }

});

// DELETE TASK
router.delete('/:id', async (req, res) => {

  const { id } = req.params;

  try {
    await prisma.company_tasks.deleteMany({
      where: { task_id: Number(id) }
    });
  } catch (err) {
    console.log(err);
  }

  try {
    await prisma.task_required_documents.deleteMany({
      where: { task_id: Number(id) }
    });
  } catch (err) {
    console.log(err);
  }

  try {

    await prisma.tasks.delete({
      where: { id: Number(id) }
    });

    res.json({
      success: true
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: 'Error deleting task'
    });
  }

});

module.exports = router;
