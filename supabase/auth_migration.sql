-- ============================================================
-- ETS — Auth Migration
-- Run this SQL in your Supabase SQL Editor AFTER schema.sql.
-- It adds email to public.users and creates a trigger that
-- auto-populates public.users when a new Supabase Auth user
-- signs up.
-- ============================================================

-- 1. Add email column to existing users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- 2. Create trigger function that fires on auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user')
  );
  RETURN NEW;
END;
$$;

-- 3. Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
