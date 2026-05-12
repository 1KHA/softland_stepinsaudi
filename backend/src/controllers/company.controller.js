const db = require("../db");
const {
    generateWorkflow
} = require('../services/workflow.service');

// CREATE COMPANY
exports.createCompany = (req, res) => {

const {
  name,
  manager_name,
  country,
  sector_id,
  founders,
  description,
  phone,
  email
} = req.body;

const cleanFounders =
  founders?.filter(
    founder => founder.trim() !== ""
  ) || [];

  // validation
  if (!name || !manager_name || !country || !sector_id) {
    return res.status(400).json({
      message: "Missing required fields"
    });
  }

  // check sector exists
  db.get(
    "SELECT * FROM sectors WHERE id = ?",
    [sector_id],
    (err, sector) => {

      if (err) {
        return res.status(500).json({
          message: "Database error"
        });
      }

      if (!sector) {
        return res.status(400).json({
          message: "Sector not found"
        });
      }

      // create company
      db.run(
        `
        INSERT INTO companies
(
        name,
         manager_name,
         country,
         sector_id,
         description,
         phone,
         email,
         status
        )

VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          name,
          manager_name,
          country,
          sector_id,
          description,
          phone,
          email,
         "UNDER_REVIEW"
         ],

        function (err) {

          if (err) {
            console.log(err);

            return res.status(500).json({
              message: err.message
            });
          }

          const companyId = this.lastID;

          generateWorkflow(companyId, sector_id)
    .then(() => {
        console.log('Workflow generated ✅');
    })
    .catch((err) => {
        console.error(
            'Workflow generation failed ❌',
            err
        );
    });

// link company to current user
if (req.user) {

  db.run(
    `
    UPDATE users
    SET company_id = ?
    WHERE id = ?
    `,
    [companyId, req.user.id]
  );

}
          // founders — fire-and-forget inserts; response always sent below
          if (cleanFounders.length > 0) {

            cleanFounders.forEach((founder) => {

              db.run(
                `
                INSERT INTO founders
                (company_id, full_name)
                VALUES (?, ?)
                `,
                [companyId, founder]
              );
            });

          }

          // C-06 fix: response is unconditional — fires whether founders were
          // provided or not. Previously it was inside the if-block above,
          // causing the request to hang when cleanFounders.length === 0.
          res.status(201).json({
            message: "Company created successfully ✅",
            company_id: companyId
          });

        }
      );

    }
  );

};
// GET COMPANY BY ID
exports.getCompanyById = (req, res) => {

  const companyId = req.params.id;

  db.get(
    `
    SELECT * FROM companies
    WHERE id = ?
    `,
    [companyId],

    (err, company) => {

      if (err) {
        return res.status(500).json({
          message: "Database error"
        });
      }

      if (!company) {
        return res.status(404).json({
          message: "Company not found"
        });
      }

      // founders
      db.all(
        `
        SELECT full_name
        FROM founders
        WHERE company_id = ?
        `,
        [companyId],

        (err, founders) => {

          if (err) {
            return res.status(500).json({
              message: "Database error"
            });
          }

          company.founders = founders;

          res.status(200).json(company);

        }
      );

    }
  );

};



// UPDATE COMPANY
exports.updateCompany = (req, res) => {

  const companyId = req.params.id;

const {
  name,
  manager_name,
  country,
  sector_id,
  founders,
  description,
  phone,
  email,
  branches_count,
  logo_url
} = req.body;

  // ownership validation
  if (req.user.company_id != companyId) {

    return res.status(403).json({
      message: "Unauthorized"
    });

  }

  // validation
  if (!name || !manager_name || !country || !sector_id) {

    return res.status(400).json({
      message: "Missing required fields"
    });

  }

  const cleanFounders =
    founders?.filter(
      founder => founder.trim() !== ""
    ) || [];

  // check sector exists
  db.get(
    "SELECT * FROM sectors WHERE id = ?",
    [sector_id],

    (err, sector) => {

      if (err) {

        return res.status(500).json({
          message: "Database error"
        });

      }

      if (!sector) {

        return res.status(400).json({
          message: "Sector not found"
        });

      }

      db.run(
        `
UPDATE companies
SET
  name = ?,
  manager_name = ?,
  country = ?,
  sector_id = ?,
  description = ?,
  phone = ?,
  email = ?,
  branches_count = ?,
  logo_url = ?
WHERE id = ?
        `,
[
  name,
  manager_name,
  country,
  Number(sector_id),
  description,
  phone,
  email,
  branches_count,
  logo_url,
  companyId
],

        function (err) {

          if (err) {

            console.log(err);

            return res.status(500).json({
              message: "Update failed"
            });

          }

          if (this.changes === 0) {

            return res.status(404).json({
              message: "Company not found"
            });

          }
// delete old company tasks
      db.run(
        `
        DELETE FROM company_tasks
        WHERE company_id = ?
        `,
        [companyId],
        (err) => {

          if (err) {
            console.log(err);
            return;
          }

         db.run(
  `
  DELETE FROM company_stages
  WHERE company_id = ?
  `,
  [companyId],
  async (err) => {

    if (err) {
      console.log(err);
      return;
    }

    await generateWorkflow(
      companyId,
      Number(sector_id)
    );

  }
);

        }
      );

          // delete old founders
          db.run(
            `
            DELETE FROM founders
            WHERE company_id = ?
            `,
            [companyId],

            (err) => {

              if (err) {

                return res.status(500).json({
                  message: "Failed updating founders"
                });

              }

              // no founders
              if (cleanFounders.length === 0) {

                return res.status(200).json({
                  message: "Company updated successfully ✅"
                });

              }

              let completed = 0;

              cleanFounders.forEach((founder) => {

                db.run(
                  `
                  INSERT INTO founders
                  (company_id, full_name)
                  VALUES (?, ?)
                  `,
                  [companyId, founder],

                  (err) => {

                    if (err) {

                      console.log(err);

                      return res.status(500).json({
                        message: "Failed inserting founders"
                      });

                    }

                    completed++;

                    if (completed === cleanFounders.length) {

                      return res.status(200).json({
                        message: "Company updated successfully ✅"
                      });

                    }

                  }
                );

              });

            }
          );

        }
      );

    }
  );

};

// SUBMIT COMPANY
exports.submitCompany = (req, res) => {

  const companyId = req.params.id;
db.get(
  `
  SELECT *
  FROM companies
  WHERE id = ?
  `,
  [companyId],

  (err, company) => {

    if (err) {

      return res.status(500).json({
        message: "Database error"
      });

    }

    if (!company) {

      return res.status(404).json({
        message: "Company not found"
      });

    }

    // validation before submit
    if (
      !company.name ||
      !company.manager_name ||
      !company.country ||
      !company.description ||
      !company.phone ||
      !company.email
    ) {

      return res.status(400).json({
        message: "Complete all company information before submission"
      });

    }

    // continue submit
    db.run(
      `
      UPDATE companies
      SET status = ?
      WHERE id = ?
      `,
      ["UNDER_REVIEW", companyId],

      function (err) {

        if (err) {

          return res.status(500).json({
            message: "Submit failed"
          });

        }

        if (this.changes === 0) {

          return res.status(404).json({
            message: "Company not found"
          });

        }

        res.status(200).json({
          message: "Company submitted successfully ✅"
        });

      }
    );

  }
);

};

// GET ALL COMPANIES
exports.getAllCompanies = (req, res) => {
  if (req.user.role !== "ADMIN") {

    return res.status(403).json({
      message: "Access denied"
    });

  }

  db.all(
    `
    SELECT
      id,
      name,
      manager_name,
      country,
      status
    FROM companies
    `,

    [],

    (err, companies) => {

      if (err) {

        return res.status(500).json({
          message: "Database error"
        });

      }

      res.status(200).json(companies);

    }
  );

};
// APPROVE COMPANY
exports.approveCompany = (req, res) => {

  const companyId = req.params.id;
if (req.user.role !== "ADMIN") {

  return res.status(403).json({
    message: "Access denied"
  });

}

  db.run(
    `
    UPDATE companies
    SET status = ?
    WHERE id = ?
    `,
    ["APPROVED", companyId],

    function (err) {

      if (err) {

        return res.status(500).json({
          message: "Approve failed"
        });

      }

      res.status(200).json({
        message: "Company approved ✅"
      });

    }
  );

};

/// REJECT COMPANY
exports.rejectCompany = (req, res) => {

  const companyId = req.params.id;
if (req.user.role !== "ADMIN") {

  return res.status(403).json({
    message: "Access denied"
  });

}

  db.run(
    `
    UPDATE companies
    SET status = ?
    WHERE id = ?
    `,
    ["REJECTED", companyId],

    function (err) {

      if (err) {

        return res.status(500).json({
          message: "Reject failed"
        });

      }

      if (this.changes === 0) {

        return res.status(404).json({
          message: "Company not found"
        });

      }

      res.status(200).json({
        message: "Company rejected ❌"
      });

    }
  );

};

// NEEDS COMPLETION
exports.needsCompletionCompany = (req, res) => {

  const companyId = req.params.id;
if (req.user.role !== "ADMIN") {

  return res.status(403).json({
    message: "Access denied"
  });

}

  db.run(
    `
    UPDATE companies
    SET status = ?
    WHERE id = ?
    `,
    ["NEEDS_COMPLETION", companyId],

    function (err) {

      if (err) {

        return res.status(500).json({
          message: "Update failed"
        });

      }

      if (this.changes === 0) {

        return res.status(404).json({
          message: "Company not found"
        });

      }

      res.status(200).json({
        message: "Company marked as NEEDS_COMPLETION ⚠️"
      });

    }
  );

};