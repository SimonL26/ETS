// ============================================================
// ETS — Supabase Client Initialisation
// ============================================================
// ⚠️  IMPORTANT: Replace the placeholder values below with your
//     actual Supabase project URL and anon/public key BEFORE
//     running the application.  You can find these values in
//     your Supabase dashboard under Settings → API.
// ============================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

// ── Placeholder credentials ────────────────────────────────
// Replace these with your real Supabase project credentials.
// You can also load them from environment variables (recommended
// for production) by using process.env.SUPABASE_URL, etc.
const SUPABASE_URL = "YOUR_SUPABASE_URL_HERE"; // e.g. "https://xyzcompany.supabase.co"
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE"; // e.g. "eyJhbGci..."

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
