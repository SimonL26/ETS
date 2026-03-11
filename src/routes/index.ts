// ============================================================
// ETS — Express Routes
// ============================================================

import { Router } from "express";
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

const router = Router();

// ── Users & Companies ────────────────────────────────────
router.get("/users/:userId", getUser);
router.get("/users/:userId/companies", getUserCompanies);
router.post("/users/:userId/companies", createCompany);

// ── Expense Categories ───────────────────────────────────
router.get("/companies/:companyId/categories", getCategories);
router.post("/companies/:companyId/categories", createCategory);

// ── Invoices ─────────────────────────────────────────────
// NOTE: batch-pay must be defined BEFORE the :invoiceId param routes
// to avoid Express interpreting "batch-pay" as an invoiceId.
router.put("/companies/:companyId/invoices/batch-pay", batchMarkAsPaid);
router.post("/companies/:companyId/invoices", createInvoice);
router.get("/companies/:companyId/invoices", getInvoices);
router.get("/companies/:companyId/invoices/:invoiceId", getInvoice);
router.put("/companies/:companyId/invoices/:invoiceId/pay", markAsPaid);

// ── Expense Reporting ────────────────────────────────────
router.get("/companies/:companyId/expenses/summary", getExpenseSummary);
router.get("/companies/:companyId/expenses/trend", getExpenseTrend);

export default router;
