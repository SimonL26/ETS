// ============================================================
// ETS — Express Routes
// ============================================================

import { Router } from "express";
import { register, login } from "../controllers/authController";
import { getUser, getUserCompanies, createCompany } from "../controllers/userController";
import { getCategories, createCategory } from "../controllers/categoryController";
import {
  createInvoice,
  getInvoices,
  getInvoice,
  markAsPaid,
  batchMarkAsPaid,
} from "../controllers/invoiceController";
import { getExpenseSummary, getExpenseTrend } from "../controllers/expenseController";

import { authMiddleware } from "../middleware/authMiddleware";
import { requireSelf, requireCompanyOwner } from "../middleware/ownershipMiddleware";

const router = Router();

// ── Public — Auth ────────────────────────────────────────
router.post("/auth/register", register);
router.post("/auth/login", login);

// ── All routes below require authentication ──────────────
router.use(authMiddleware as any);

// ── Users & Companies (require self-ownership) ──────────
router.get("/users/:userId", requireSelf as any, getUser);
router.get("/users/:userId/companies", requireSelf as any, getUserCompanies);
router.post("/users/:userId/companies", requireSelf as any, createCompany);

// ── Expense Categories (require company ownership) ──────
router.get("/companies/:companyId/categories", requireCompanyOwner as any, getCategories);
router.post("/companies/:companyId/categories", requireCompanyOwner as any, createCategory);

// ── Invoices (require company ownership) ─────────────────
// NOTE: batch-pay must be defined BEFORE the :invoiceId param routes
// to avoid Express interpreting "batch-pay" as an invoiceId.
router.put("/companies/:companyId/invoices/batch-pay", requireCompanyOwner as any, batchMarkAsPaid);
router.post("/companies/:companyId/invoices", requireCompanyOwner as any, createInvoice);
router.get("/companies/:companyId/invoices", requireCompanyOwner as any, getInvoices);
router.get("/companies/:companyId/invoices/:invoiceId", requireCompanyOwner as any, getInvoice);
router.put("/companies/:companyId/invoices/:invoiceId/pay", requireCompanyOwner as any, markAsPaid);

// ── Expense Reporting (require company ownership) ────────
router.get("/companies/:companyId/expenses/summary", requireCompanyOwner as any, getExpenseSummary);
router.get("/companies/:companyId/expenses/trend", requireCompanyOwner as any, getExpenseTrend);

export default router;
