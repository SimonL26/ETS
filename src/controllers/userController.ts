// ============================================================
// ETS — User Controller
// ============================================================

import { Request, Response } from "express";
import { supabase } from "../config/supabase";

/**
 * GET /users/:userId
 * Retrieve basic user info by ID.
 */
export async function getUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.userId as string;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
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
 * GET /users/:userId/companies
 * Retrieve all companies owned by a user.
 */
export async function getUserCompanies(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.userId as string;

    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("owner_id", userId)
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
 * POST /users/:userId/companies
 * Create a new company for the user.
 * Body: { companyName: string }
 */
export async function createCompany(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const { companyName } = req.body;

    if (!companyName) {
      res.status(400).json({ error: "companyName is required" });
      return;
    }

    const { data, error } = await supabase
      .from("companies")
      .insert({ company_name: companyName, owner_id: userId })
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
