// ============================================================
// ETS — Supabase Client Initialisation
// ============================================================
// ⚠️  IMPORTANT: Set the following environment variables BEFORE
//     running the application. You can find these values in your
//     Supabase dashboard under Settings → API → API Keys.
//
//     SUPABASE_URL          – Your project URL
//     SUPABASE_SECRET_KEY   – Secret key (sb_secret_...) for
//                             server-side access (bypasses RLS)
// ============================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

// ── Credentials from environment variables ─────────────────
// Store these in a .env file or your hosting provider's config.
// Never commit real keys to source control.
const SUPABASE_URL = process.env.SUPABASE_URL ?? "YOUR_SUPABASE_URL_HERE";
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY ?? "YOUR_SUPABASE_SECRET_KEY_HERE";

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SECRET_KEY
);

