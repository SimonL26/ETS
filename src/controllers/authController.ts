// ============================================================
// ETS — Auth Controller (Register & Login)
// ============================================================

import { Request, Response } from "express";
import { supabase } from "../config/supabase";

/**
 * POST /auth/register
 * Register a new user via Supabase Auth.
 * Body: { email: string, password: string, username: string }
 *
 * The username is passed inside options.data so the SQL trigger
 * on auth.users can populate public.users automatically.
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      res.status(400).json({ error: "email, password, and username are required" });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },  // stored in raw_user_meta_data → picked up by trigger
      },
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({
      message: "User registered successfully",
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /auth/login
 * Log in with email and password via Supabase Auth.
 * Body: { email: string, password: string }
 *
 * Returns the session containing the JWT access_token.
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }

    res.json({
      message: "Login successful",
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}
