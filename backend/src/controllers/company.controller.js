const prisma = require("../prisma/client");
const {
    generateWorkflow
} = require('../services/workflow.service');

// CREATE COMPANY
exports.createCompany = async (req, res) => {

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

  try {

    // check sector exists
    const sector = await prisma.sectors.findUnique({
      where: { id: Number(sector_id) }
    });

    if (!sector) {
      return res.status(400).json({
        message: "Sector not found"
      });
    }

    // create company
    let newCompany;
    try {
      newCompany = await prisma.companies.create({
        data: {
          name,
          manager_name,
          country,
          sector_id: Number(sector_id),
          description,
          phone,
          email,
          status: "PENDING"
        }
      });
    } catch (err) {
      console.log(err);

      return res.status(500).json({
        message: err.message
      });
    }

    const companyId = newCompany.id;

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
      try {
        await prisma.users.update({
          where: { id: req.user.id },
          data: { company_id: companyId }
        });
      } catch (err) {
        console.log(err);
      }
    }

    // founders — fire-and-forget inserts; response always sent below
    if (cleanFounders.length > 0) {
      for (const founder of cleanFounders) {
        try {
          await prisma.founders.create({
            data: {
              company_id: companyId,
              full_name: founder
            }
          });
        } catch (err) {
          console.log(err);
        }
      }
    }

    // C-06 fix: response is unconditional — fires whether founders were
    // provided or not. Previously it was inside the if-block above,
    // causing the request to hang when cleanFounders.length === 0.
    res.status(201).json({
      message: "Company created successfully ✅",
      company_id: companyId
    });

  } catch (err) {
    return res.status(500).json({
      message: "Database error"
    });
  }

};

// GET COMPANY BY ID
exports.getCompanyById = async (req, res) => {

  const companyId = req.params.id;

  try {

    const company = await prisma.companies.findUnique({
      where: { id: Number(companyId) }
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found"
      });
    }

    // founders
    const founders = await prisma.founders.findMany({
      where: { company_id: Number(companyId) },
      select: { full_name: true }
    });

    company.founders = founders;

    res.status(200).json(company);

  } catch (err) {
    return res.status(500).json({
      message: "Database error"
    });
  }

};


// UPDATE COMPANY
exports.updateCompany = async (req, res) => {

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
  if (
    req.user.role !== "ADMIN" &&
    req.user.company_id != companyId
  ) {
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

  try {

    // check sector exists
    const sector = await prisma.sectors.findUnique({
      where: { id: Number(sector_id) }
    });

    if (!sector) {
      return res.status(400).json({
        message: "Sector not found"
      });
    }

    const currentCompany = await prisma.companies.findUnique({
      where: { id: Number(companyId) },
      select: { sector_id: true, status: true }
    });

    if (!currentCompany) {
      // original SQLite code did not explicitly guard this, but a missing
      // company would null-deref below; preserve closest behavior (500).
      return res.status(500).json({
        message: "Database error"
      });
    }

    const sectorChanged =
      Number(currentCompany.sector_id) !== Number(sector_id);

    const newStatus = sectorChanged
      ? "UNDER_REVIEW"
      : currentCompany.status;

    let updateResult;
    try {
      updateResult = await prisma.companies.updateMany({
        where: { id: Number(companyId) },
        data: {
          name,
          manager_name,
          country,
          sector_id: Number(sector_id),
          status: newStatus,
          description,
          phone,
          email,
          branches_count: Number(branches_count) || null,
          logo_url
        }
      });
    } catch (err) {
      console.log(err);

      return res.status(500).json({
        message: "Update failed"
      });
    }

    if (updateResult.count === 0) {
      return res.status(404).json({
        message: "Company not found"
      });
    }

    // مزامنة إيميل العميل مع إيميل الشركة
    try {
      await prisma.users.updateMany({
        where: {
          company_id: Number(companyId),
          role: 'CLIENT'
        },
        data: { email }
      });
    } catch (err) {
      console.log(err);
    }

    if (sectorChanged) {
      (async () => {
        try {
          await prisma.company_tasks.deleteMany({
            where: { company_id: Number(companyId) }
          });

          await prisma.company_stages.deleteMany({
            where: { company_id: Number(companyId) }
          });

          await generateWorkflow(
            Number(companyId),
            Number(sector_id)
          );

        } catch (err) {
          console.log(err);
        }
      })();
    }

    // delete old founders
    try {
      await prisma.founders.deleteMany({
        where: { company_id: Number(companyId) }
      });
    } catch (err) {
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

    try {
      for (const founder of cleanFounders) {
        await prisma.founders.create({
          data: {
            company_id: Number(companyId),
            full_name: founder
          }
        });
      }

      return res.status(200).json({
        message: "Company updated successfully ✅"
      });

    } catch (err) {
      console.log(err);

      return res.status(500).json({
        message: "Failed inserting founders"
      });
    }

  } catch (err) {
    return res.status(500).json({
      message: "Database error"
    });
  }

};

// SUBMIT COMPANY
exports.submitCompany = async (req, res) => {

  const companyId = req.params.id;

  try {

    const company = await prisma.companies.findUnique({
      where: { id: Number(companyId) }
    });

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
    let updateResult;
    try {
      updateResult = await prisma.companies.updateMany({
        where: { id: Number(companyId) },
        data: { status: "PENDING" }
      });
    } catch (err) {
      return res.status(500).json({
        message: "Submit failed"
      });
    }

    if (updateResult.count === 0) {
      return res.status(404).json({
        message: "Company not found"
      });
    }

    res.status(200).json({
      message: "Company submitted successfully ✅"
    });

  } catch (err) {
    return res.status(500).json({
      message: "Database error"
    });
  }

};

// GET ALL COMPANIES
exports.getAllCompanies = async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Access denied"
    });
  }

  try {

    const companies = await prisma.companies.findMany({
      select: {
        id: true,
        name: true,
        manager_name: true,
        country: true,
        status: true
      }
    });

    res.status(200).json(companies);

  } catch (err) {
    return res.status(500).json({
      message: "Database error"
    });
  }

};

// APPROVE COMPANY
exports.approveCompany = async (req, res) => {

  const companyId = req.params.id;

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Access denied"
    });
  }

  try {

    await prisma.companies.update({
      where: { id: Number(companyId) },
      data: { status: "APPROVED" }
    });

    res.status(200).json({
      message: "Company approved ✅"
    });

  } catch (err) {
    return res.status(500).json({
      message: "Approve failed"
    });
  }

};

/// REJECT COMPANY
exports.rejectCompany = async (req, res) => {

  const companyId = req.params.id;

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Access denied"
    });
  }

  try {

    const updateResult = await prisma.companies.updateMany({
      where: { id: Number(companyId) },
      data: { status: "REJECTED" }
    });

    if (updateResult.count === 0) {
      return res.status(404).json({
        message: "Company not found"
      });
    }

    res.status(200).json({
      message: "Company rejected ❌"
    });

  } catch (err) {
    return res.status(500).json({
      message: "Reject failed"
    });
  }

};

// NEEDS COMPLETION
exports.needsCompletionCompany = async (req, res) => {

  const companyId = req.params.id;

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Access denied"
    });
  }

  try {

    const updateResult = await prisma.companies.updateMany({
      where: { id: Number(companyId) },
      data: { status: "NEEDS_COMPLETION" }
    });

    if (updateResult.count === 0) {
      return res.status(404).json({
        message: "Company not found"
      });
    }

    res.status(200).json({
      message: "Company marked as NEEDS_COMPLETION ⚠️"
    });

  } catch (err) {
    return res.status(500).json({
      message: "Update failed"
    });
  }

};
