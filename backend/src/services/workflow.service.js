const db = require('../db');

const generateWorkflow = (companyId, sectorId) => {
console.log('Generate workflow started ✅');
console.log(companyId, sectorId);
    return new Promise((resolve, reject) => {

        // get all active stages
        db.all(
            `
            SELECT *
            FROM stages
            WHERE is_active = 1
            ORDER BY stage_order ASC
            `,
            [],
            (err, stages) => {

                if (err) {
                    return reject(err);
                }

if (!stages.length) {

    console.log(
        'No stages found ❌'
    );

    return reject(
        new Error(
            'No stages found'
        )
    );

}

                let completedStages = 0;

                stages.forEach((stage, index) => {

                    // first stage unlocked
                    let status = 'LOCKED';
                    if (index === 0) {
                   status = 'COMPLETED';

                  }

                  if (index === 1) {
                  status = 'IN_PROGRESS';
                  }

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
                            companyId,
                            stage.id,
                            status
                        ],
                        function (err) {

                            if (err) {
                                return reject(err);
                            }

                            const companyStageId = this.lastID;

                            // fetch tasks for this stage + sector
                            db.all(
                                `
                                SELECT *
FROM tasks
WHERE stage_id = ?
AND (
  sector_id = ?
  OR sector_id = 5
)
AND is_active = 1
ORDER BY task_order ASC
                                `,
                                [
                                    stage.id,
                                    sectorId
                                ],
                                (err, tasks) => {

                                    if (err) {
                                        return reject(err);
                                    }

                            if (!tasks.length) {

                            console.log(
                           `No tasks found for stage ${stage.id}`
                            );

                         completedStages++;

                         if (
                          completedStages === stages.length
                          ) {

                         return reject(
                         new Error(
                         "No tasks found for workflow generation"
                         )
                         );

                         }

                         return;
                        }

                                    let completedTasks = 0;

                                    tasks.forEach((task) => {

                                        db.run(
                                            `
                                            INSERT INTO company_tasks
                                            (
                                                company_id,
                                                task_id,
                                                company_stage_id,
                                                status
                                            )
                                            VALUES (?, ?, ?, ?)
                                            `,
                                            [
                                                companyId,
                                                task.id,
                                                companyStageId,
                                                'PENDING'
                                            ],
                                            (err) => {

                                                if (err) {
                                                    return reject(err);
                                                }

                                                completedTasks++;

                                                if (
                                                    completedTasks === tasks.length
                                                ) {

                                                    completedStages++;

                                                    if (
                                                        completedStages === stages.length
                                                    ) {
                                                        resolve();
                                                    }
                                                }
                                            }
                                        );
                                    });
                                }
                            );
                        }
                    );
                });
            }
        );
    });
};
const updateCompanyStatus = (companyId) => {
    return new Promise((resolve, reject) => {

        db.all(
            `
            SELECT status
            FROM company_stages
            WHERE company_id = ?
            `,
            [companyId],
            (err, stages) => {

                if (err) {
                    return reject(err);
                }

                // إذا كل المراحل مكتملة
                const allCompleted =
                    stages.length > 0 &&
                    stages.every(
                        stage => stage.status === "COMPLETED"
                    );

                let newStatus = "PENDING";

                if (allCompleted) {
                    newStatus = "APPROVED";
                } else {

                    const completedCount =
                        stages.filter(
                            s => s.status === "COMPLETED"
                        ).length;

                    if (completedCount <= 1) {
                        // التسجيل فقط مكتمل
                        newStatus = "PENDING";
                    } else {
                        // بدأ تنفيذ بقية المراحل
                        newStatus = "IN_PROGRESS";
                    }
                }

                db.run(
                    `
                    UPDATE companies
                    SET status = ?
                    WHERE id = ?
                    `,
                    [
                        newStatus,
                        companyId
                    ],
                    (err2) => {

                        if (err2) {
                            return reject(err2);
                        }

                        resolve(newStatus);

                    }
                );

            }
        );

    });
};

module.exports = {
    generateWorkflow,
    updateCompanyStatus
};