const prisma = require('../prisma/client');

// NOTE: This service is not currently imported by any route file.
// employee.routes.js imports updateCompanyStatus from workflow.service.js instead.
// Converted to Prisma for completeness / to remove the remaining SQLite dependency,
// but it is dead code as of this migration. Confirm with the team whether this file
// is still needed before deleting it in a future cleanup pass.

const updateCompanyStatus = async (companyId) => {

  const stages = await prisma.company_stages.findMany({
    where: { company_id: companyId },
    include: {
      stages: {
        select: { workflow_phase: true }
      }
    }
  });

  if (!stages.length) {
    return;
  }

  // flatten to match original flat SELECT shape: { status, workflow_phase }
  const flatStages = stages.map((cs) => ({
    status: cs.status,
    workflow_phase: cs.stages ? cs.stages.workflow_phase : null
  }));

  // جميع المراحل مكتملة
  const allCompleted = flatStages.every(
    (stage) => stage.status === "COMPLETED"
  );

  if (allCompleted) {
    await prisma.companies.update({
      where: { id: companyId },
      data: { status: 'APPROVED' }
    });

    return;
  }

  // المرحلة النشطة الحالية
  const activeStage = flatStages.find(
    (stage) => stage.status === "IN_PROGRESS"
  );

  if (activeStage) {

    let companyStatus = "IN_PROGRESS";

    if (activeStage.workflow_phase === "REGISTRATION") {
      companyStatus = "PENDING";
    } else if (activeStage.workflow_phase === "UNDER_REVIEW") {
      companyStatus = "UNDER_REVIEW";
    } else if (activeStage.workflow_phase === "PROCESSING") {
      companyStatus = "IN_PROGRESS";
    } else if (activeStage.workflow_phase === "FINAL_APPROVAL") {
      companyStatus = "APPROVED";
    }

    await prisma.companies.update({
      where: { id: companyId },
      data: { status: companyStatus }
    });
  }

};

module.exports = {
  updateCompanyStatus,
};
