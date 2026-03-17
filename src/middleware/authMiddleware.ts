// ============================================================
// ETS — JWT Authentication Middleware
// ============================================================
// Extracts and verifies the Bearer token from the Authorization
// header using Supabase Auth. Attaches the authenticated user
// to req.user for downstream handlers.
// ============================================================

import { Response, NextFunction } from "express";
import { supabase } from "../config/supabase";
import { AuthenticatedRequest } from "../types/database";

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid Authorization header" });
      return;
    }

    const token = authHeader.split(" ")[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // Attach user info to the request for downstream use
    req.user = {
      id: data.user.id,
      email: data.user.email ?? "",
    };

    next();
  } catch (err) {
    res.status(401).json({ error: "Authentication failed" });
  }
}
