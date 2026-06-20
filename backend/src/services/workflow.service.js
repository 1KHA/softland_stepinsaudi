const prisma = require('../prisma/client');

const generateWorkflow = async (companyId, sectorId) => {
  console.log('Generate workflow started ✅');
  console.log(companyId, sectorId);

  // get all active stages
  const stages = await prisma.stages.findMany({
    where: { is_active: 1 },
    orderBy: { stage_order: 'asc' }
  });

  if (!stages.length) {
    console.log('No stages found ❌');
    throw new Error('No stages found');
  }

  let completedStages = 0;
  let noTasksRejected = false;

  for (let index = 0; index < stages.length; index++) {
    const stage = stages[index];

    // first stage unlocked
    let status = 'LOCKED';
    if (index === 0) {
      status = 'COMPLETED';
    }
    if (index === 1) {
      status = 'IN_PROGRESS';
    }

    const companyStage = await prisma.company_stages.create({
      data: {
        company_id: companyId,
        stage_id: stage.id,
        status
      }
    });

    const companyStageId = companyStage.id;

    // fetch tasks for this stage + sector
    const tasks = await prisma.tasks.findMany({
      where: {
        stage_id: stage.id,
        is_active: 1,
        OR: [
          { sector_id: sectorId },
          { sector_id: 5 }
        ]
      },
      orderBy: { task_order: 'asc' }
    });

    if (!tasks.length) {
      console.log(`No tasks found for stage ${stage.id}`);

      completedStages++;

      if (completedStages === stages.length) {
        throw new Error('No tasks found for workflow generation');
      }

      continue;
    }

    let completedTasks = 0;

    for (const task of tasks) {
      await prisma.company_tasks.create({
        data: {
          company_id: companyId,
          task_id: task.id,
          company_stage_id: companyStageId,
          status: 'PENDING'
        }
      });

      completedTasks++;

      if (completedTasks === tasks.length) {
        completedStages++;
      }
    }
  }

  // resolves once every stage has been processed (matches original Promise resolve semantics)
};

const updateCompanyStatus = async (companyId) => {

  const stages = await prisma.company_stages.findMany({
    where: { company_id: companyId },
    select: { status: true }
  });

  // إذا كل المراحل مكتملة
  const allCompleted =
    stages.length > 0 &&
    stages.every(stage => stage.status === "COMPLETED");

  let newStatus = "PENDING";

  if (allCompleted) {
    newStatus = "APPROVED";
  } else {

    const completedCount =
      stages.filter(s => s.status === "COMPLETED").length;

    if (completedCount <= 1) {
      // التسجيل فقط مكتمل
      newStatus = "PENDING";
    } else {
      // بدأ تنفيذ بقية المراحل
      newStatus = "IN_PROGRESS";
    }
  }

  await prisma.companies.update({
    where: { id: companyId },
    data: { status: newStatus }
  });

  return newStatus;
};

module.exports = {
  generateWorkflow,
  updateCompanyStatus
};
