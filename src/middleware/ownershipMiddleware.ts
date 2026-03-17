// ============================================================
// ETS — Ownership / Authorization Middleware
// ============================================================
// These middleware functions check that the authenticated user
// has the right to access the requested resource.
// ============================================================

import { Response, NextFunction } from "express";
import { supabase } from "../config/supabase";
import { AuthenticatedRequest } from "../types/database";

/**
 * Middleware: require that req.user.id matches :userId in params.
 * Use on /users/:userId/* routes.
 */
export function requireSelf(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const userId = req.params.userId as string;

  if (!req.user || req.user.id !== userId) {
    res.status(403).json({ error: "Forbidden: you can only access your own resources" });
    return;
  }

  next();
}

/**
 * Middleware: require that req.user.id is the owner of :companyId.
 * Queries the companies table to verify ownership.
 * Use on /companies/:companyId/* routes.
 */
export async function requireCompanyOwner(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const companyId = req.params.companyId as string;

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { data, error } = await supabase
      .from("companies")
      .select("owner_id")
      .eq("id", companyId)
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    if (data.owner_id !== req.user.id) {
      res.status(403).json({ error: "Forbidden: you do not own this company" });
      return;
    }

    next();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}
