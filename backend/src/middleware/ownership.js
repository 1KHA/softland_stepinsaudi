const prisma = require('../prisma/client');

function checkOwnership(req, res, next) {
  const user = req.user;
const companyIdFromParams = parseInt(req.params.id);
  // 🔒 تحقق من وجود المستخدم
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized ❌"
    });
  }

  // 🔒 تحقق من الشركة
  if (user.company_id !== companyIdFromParams) {
    return res.status(403).json({
      message: "ما عندك صلاحية ❌"
    });
  }

  next();
}

// ─────────────────────────────────────────────────────────────
// RESOLVERS
// each returns the company id a request targets, or null when
// the target row does not exist (=> 404)
// ─────────────────────────────────────────────────────────────

// companyId taken straight from a route param
function fromParam(paramName) {
  return async (req) => {
    const raw = req.params[paramName];
    const id = Number(raw);

    if (!raw || Number.isNaN(id)) {
      return null;
    }

    return id;
  };
}

// company_tasks.id -> company_id
function fromCompanyTask(paramName) {
  return async (req) => {
    const id = Number(req.params[paramName]);

    if (Number.isNaN(id)) {
      return null;
    }

    const row = await prisma.company_tasks.findUnique({
      where: { id },
      select: { company_id: true }
    });

    return row ? row.company_id : null;
  };
}

// task_documents.id -> company_tasks -> company_id
function fromTaskDocument(paramName) {
  return async (req) => {
    const id = Number(req.params[paramName]);

    if (Number.isNaN(id)) {
      return null;
    }

    const row = await prisma.task_documents.findUnique({
      where: { id },
      select: {
        company_tasks: {
          select: { company_id: true }
        }
      }
    });

    return row && row.company_tasks
      ? row.company_tasks.company_id
      : null;
  };
}

// companies.id -> company_id (verifies the row exists)
function fromCompany(paramName) {
  return async (req) => {
    const id = Number(req.params[paramName]);

    if (Number.isNaN(id)) {
      return null;
    }

    const row = await prisma.companies.findUnique({
      where: { id },
      select: { id: true }
    });

    return row ? row.id : null;
  };
}

// company id taken from a body field (multipart/JSON uploads)
function fromBodyCompanyTask(fieldName) {
  return async (req) => {
    const id = Number(req.body ? req.body[fieldName] : NaN);

    if (Number.isNaN(id)) {
      return null;
    }

    const row = await prisma.company_tasks.findUnique({
      where: { id },
      select: { company_id: true }
    });

    return row ? row.company_id : null;
  };
}

// ─────────────────────────────────────────────────────────────
// requireCompanyAccess(resolver)
//
// ADMIN    -> always allowed
// EMPLOYEE -> only when companies.assigned_employee_id === req.user.id
// CLIENT   -> only when the resolved company is their own company
//
// The client's company is read from the DATABASE (users.company_id),
// never from the JWT claim: tokens live for 7 days and the claim
// goes stale as soon as the user is moved between companies.
// ─────────────────────────────────────────────────────────────
function requireCompanyAccess(resolver) {
  return async (req, res, next) => {

    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized ❌"
      });
    }

    if (user.role === 'ADMIN') {
      return next();
    }

    let companyId;

    try {
      companyId = await resolver(req);
    } catch (err) {
      console.log('COMPANY ACCESS RESOLVE ERROR');
      console.log(err);

      return res.status(500).json({
        success: false,
        message: "Access check failed"
      });
    }

    if (companyId === null || companyId === undefined) {
      return res.status(404).json({
        success: false,
        message: "Not found"
      });
    }

    try {

      if (user.role === 'EMPLOYEE') {

        const company = await prisma.companies.findUnique({
          where: { id: Number(companyId) },
          select: { assigned_employee_id: true }
        });

        if (!company) {
          return res.status(404).json({
            success: false,
            message: "Not found"
          });
        }

        if (company.assigned_employee_id !== user.id) {
          return res.status(403).json({
            success: false,
            message: "Not assigned to this company"
          });
        }

        return next();
      }

      // CLIENT (and any other role): own company only
      const dbUser = await prisma.users.findUnique({
        where: { id: Number(user.id) },
        select: { company_id: true }
      });

      if (
        !dbUser ||
        dbUser.company_id === null ||
        dbUser.company_id !== Number(companyId)
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      return next();

    } catch (err) {
      console.log('COMPANY ACCESS ERROR');
      console.log(err);

      return res.status(500).json({
        success: false,
        message: "Access check failed"
      });
    }

  };
}

module.exports = checkOwnership;
module.exports.requireCompanyAccess = requireCompanyAccess;
module.exports.fromParam = fromParam;
module.exports.fromCompanyTask = fromCompanyTask;
module.exports.fromTaskDocument = fromTaskDocument;
module.exports.fromCompany = fromCompany;
module.exports.fromBodyCompanyTask = fromBodyCompanyTask;
