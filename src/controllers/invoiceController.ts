// ============================================================
// ETS — Invoice Controller
// ============================================================

import { Request, Response } from "express";
import { supabase } from "../config/supabase";

/**
 * POST /companies/:companyId/invoices
 * Create a new manual invoice record.
 * Body: { invoiceNumber, invoiceDate, issueParty, amount,
 *         referenceMonth, expenseCategory, attachedFile? }
 */
export async function createInvoice(req: Request, res: Response): Promise<void> {
  try {
    const companyId = req.params.companyId as string;
    const {
      invoiceNumber,
      invoiceDate,
      issueParty,
      amount,
      referenceMonth,
      expenseCategory,
      attachedFile,
    } = req.body;

    // Validate required fields
    if (!invoiceNumber || !invoiceDate || !issueParty || amount == null || !referenceMonth || !expenseCategory) {
      res.status(400).json({
        error: "Missing required fields: invoiceNumber, invoiceDate, issueParty, amount, referenceMonth, expenseCategory",
      });
      return;
    }

    const { data, error } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        issue_party: issueParty,
        amount,
        owner_company_id: companyId,
        reference_month: referenceMonth,
        expense_category: expenseCategory,
        attached_file: attachedFile ?? null,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /companies/:companyId/invoices
 * Read all invoices for a company.
 * Supports query params: ?month=YYYY-MM&category=string&isPaid=true|false
 */
export async function getInvoices(req: Request, res: Response): Promise<void> {
  try {
    const companyId = req.params.companyId as string;
    const { month, category, isPaid } = req.query;

    let query = supabase
      .from("invoices")
      .select("*")
      .eq("owner_company_id", companyId);

    // Filter by reference month (expects YYYY-MM, we match against the first day)
    if (month && typeof month === "string") {
      const startDate = `${month}-01`;
      // Calculate end of month by going to next month
      const [year, mon] = month.split("-").map(Number);
      const nextMonth = mon === 12 ? `${year + 1}-01-01` : `${year}-${String(mon + 1).padStart(2, "0")}-01`;
      query = query.gte("reference_month", startDate).lt("reference_month", nextMonth);
    }

    if (category && typeof category === "string") {
      query = query.eq("expense_category", category);
    }

    if (isPaid !== undefined && typeof isPaid === "string") {
      query = query.eq("is_paid", isPaid === "true");
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /companies/:companyId/invoices/:invoiceId
 * Read a single invoice record.
 */
export async function getInvoice(req: Request, res: Response): Promise<void> {
  try {
    const companyId = req.params.companyId as string;
    const invoiceId = req.params.invoiceId as string;

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .eq("owner_company_id", companyId)
      .single();

    if (error) {
      res.status(error.code === "PGRST116" ? 404 : 500).json({ error: error.message });
      return;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PUT /companies/:companyId/invoices/:invoiceId/pay
 * Mark a single invoice as paid.
 */
export async function markAsPaid(req: Request, res: Response): Promise<void> {
  try {
    const companyId = req.params.companyId as string;
    const invoiceId = req.params.invoiceId as string;

    const { data, error } = await supabase
      .from("invoices")
      .update({ is_paid: true })
      .eq("id", invoiceId)
      .eq("owner_company_id", companyId)
      .select()
      .single();

    if (error) {
      res.status(error.code === "PGRST116" ? 404 : 500).json({ error: error.message });
      return;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PUT /companies/:companyId/invoices/batch-pay
 * Mark an array of invoices as paid in a batch.
 * Body: { invoiceIds: string[] }
 */
export async function batchMarkAsPaid(req: Request, res: Response): Promise<void> {
  try {
    const companyId = req.params.companyId as string;
    const { invoiceIds } = req.body;

    if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      res.status(400).json({ error: "invoiceIds must be a non-empty array" });
      return;
    }

    const { data, error } = await supabase
      .from("invoices")
      .update({ is_paid: true })
      .eq("owner_company_id", companyId)
      .in("id", invoiceIds)
      .select();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ updated: data?.length ?? 0, invoices: data });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}
