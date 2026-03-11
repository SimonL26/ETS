// ============================================================
// ETS — Category Controller
// ============================================================

import { Request, Response } from "express";
import { supabase } from "../config/supabase";

/**
 * GET /companies/:companyId/categories
 * Retrieve all expense categories for a company.
 */
export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const companyId = req.params.companyId as string;

    const { data, error } = await supabase
      .from("expense_categories")
      .select("*")
      .eq("owner_company_id", companyId)
      .order("created_at", { ascending: false });

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
 * POST /companies/:companyId/categories
 * Create a new expense category for a company.
 * Body: { expenseType: string }
 */
export async function createCategory(req: Request, res: Response): Promise<void> {
  try {
    const companyId = req.params.companyId as string;
    const { expenseType } = req.body;

    if (!expenseType) {
      res.status(400).json({ error: "expenseType is required" });
      return;
    }

    const { data, error } = await supabase
      .from("expense_categories")
      .insert({ expense_type: expenseType, owner_company_id: companyId })
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
