// ============================================================
// ETS — Expense Reporting Controller
// ============================================================

import { Request, Response } from "express";
import { supabase } from "../config/supabase";

/**
 * GET /companies/:companyId/expenses/summary
 * Retrieve the total sum of expenses grouped by expenseCategory
 * for a specified month.
 * Query params: ?month=YYYYMM  (e.g. 202602)
 */
export async function getExpenseSummary(req: Request, res: Response): Promise<void> {
  try {
    const companyId = req.params.companyId as string;
    const { month } = req.query;

    if (!month || typeof month !== "string" || month.length !== 6) {
      res.status(400).json({ error: "month query param is required in YYYYMM format (e.g. 202602)" });
      return;
    }

    const year = month.slice(0, 4);
    const mon = month.slice(4, 6);
    const startDate = `${year}-${mon}-01`;
    const nextMon = Number(mon) === 12 ? `${Number(year) + 1}-01-01` : `${year}-${String(Number(mon) + 1).padStart(2, "0")}-01`;

    // Fetch all paid invoices in the month range, then aggregate in-memory
    // (Supabase JS client doesn't support GROUP BY natively — for production,
    //  consider an RPC / database function for server-side aggregation.)
    const { data, error } = await supabase
      .from("invoices")
      .select("expense_category, amount")
      .eq("owner_company_id", companyId)
      .eq("is_paid", true)
      .gte("reference_month", startDate)
      .lt("reference_month", nextMon);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    // Group by expense_category and sum amounts
    const summary: Record<string, number> = {};
    for (const row of data ?? []) {
      const cat = row.expense_category;
      summary[cat] = (summary[cat] ?? 0) + Number(row.amount);
    }

    res.json({
      month,
      categories: Object.entries(summary).map(([category, total]) => ({
        category,
        total: Math.round(total * 100) / 100,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /companies/:companyId/expenses/trend
 * Retrieve monthly expense totals over a time range for trend graphs.
 * Query params: ?from=YYYYMM&to=YYYYMM
 */
export async function getExpenseTrend(req: Request, res: Response): Promise<void> {
  try {
    const companyId = req.params.companyId as string;
    const { from, to } = req.query;

    if (
      !from || typeof from !== "string" || from.length !== 6 ||
      !to || typeof to !== "string" || to.length !== 6
    ) {
      res.status(400).json({
        error: "from and to query params are required in YYYYMM format (e.g. ?from=202501&to=202512)",
      });
      return;
    }

    const startDate = `${from.slice(0, 4)}-${from.slice(4, 6)}-01`;
    const toMon = Number(to.slice(4, 6));
    const toYear = Number(to.slice(0, 4));
    const endDate =
      toMon === 12
        ? `${toYear + 1}-01-01`
        : `${toYear}-${String(toMon + 1).padStart(2, "0")}-01`;

    const { data, error } = await supabase
      .from("invoices")
      .select("reference_month, amount")
      .eq("owner_company_id", companyId)
      .eq("is_paid", true)
      .gte("reference_month", startDate)
      .lt("reference_month", endDate);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    // Group by month (reference_month is stored as YYYY-MM-DD)
    const monthlyTotals: Record<string, number> = {};
    for (const row of data ?? []) {
      const monthKey = row.reference_month.slice(0, 7); // "YYYY-MM"
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] ?? 0) + Number(row.amount);
    }

    // Sort by month and return as data points
    const trend = Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({ month, total: Math.round(total * 100) / 100 }));

    res.json({ from, to, trend });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}
