const db = require("../db");

const updateCompanyStatus = (companyId) => {
  return new Promise((resolve, reject) => {

    db.all(
      `
SELECT
  cs.status,
  s.workflow_phase
FROM company_stages cs
JOIN stages s
  ON cs.stage_id = s.id
WHERE cs.company_id = ?
      `,
      [companyId],
      (err, stages) => {

        if (err) {
          return reject(err);
        }

        if (!stages.length) {
          return resolve();
        }

    

       // جميع المراحل مكتملة
const allCompleted = stages.every(
  (stage) => stage.status === "COMPLETED"
);

if (allCompleted) {
  db.run(
    `
    UPDATE companies
    SET status = 'APPROVED'
    WHERE id = ?
    `,
    [companyId]
  );

  return resolve();
}

// المرحلة النشطة الحالية
const activeStage = stages.find(
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

  db.run(
    `
    UPDATE companies
    SET status = ?
    WHERE id = ?
    `,
    [companyStatus, companyId]
  );
}

resolve();
      }
    );
  });
};

module.exports = {
  updateCompanyStatus,
};