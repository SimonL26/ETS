-- ============================================================
-- ETS — RLS Policy Fix
-- Run this in the Supabase SQL Editor.
--
-- Since the ETS Express backend handles authorization via
-- middleware (authMiddleware + ownershipMiddleware), we disable
-- RLS on these tables. The backend is the only client accessing
-- the database, and it uses the Secret Key.
--
-- If you later add a frontend that talks to Supabase directly,
-- re-enable RLS and create proper policies instead.
-- ============================================================

-- Disable RLS on all ETS tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
