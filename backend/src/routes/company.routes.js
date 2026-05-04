const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const checkOwnership = require("../middleware/ownership");
const {
  createCompany,
  getCompanyById,
  updateCompany,
  submitCompany,
  getAllCompanies,
  approveCompany,
  rejectCompany,
  needsCompletionCompany
} = require("../controllers/company.controller");

// CREATE
router.post(
  "/companies",
  authMiddleware,
  createCompany
);

// GET BY ID
router.get(
  "/companies/:id",
  authMiddleware,
  checkOwnership,
  getCompanyById
);

// UPDATE COMPANY
router.put(
  "/companies/:id",
  authMiddleware,
  updateCompany
);

// SUBMIT COMPANY
router.post(
  "/companies/:id/submit",
  authMiddleware,
  checkOwnership,
  submitCompany
);

// GET ALL COMPANIES
router.get(
  "/companies",
  authMiddleware,
  getAllCompanies
);

// APPROVE COMPANY
router.put(
  "/companies/:id/approve",
  authMiddleware,
  approveCompany
);

// REJECT COMPANY
router.put(
  "/companies/:id/reject",
  authMiddleware,
  rejectCompany
);

// NEEDS COMPLETION
router.put(
  "/companies/:id/needs-completion",
  authMiddleware,
  needsCompletionCompany
);

module.exports = router;