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
                                AND sector_id = ?
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

module.exports = {
    generateWorkflow
};