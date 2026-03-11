-- ============================================================
-- ETS (Expense Tracking System) — Database Schema
-- Run this SQL in your Supabase SQL Editor to create tables.
-- ============================================================

-- Enable UUID generation (already available in Supabase by default)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- 1. Users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 2. Companies
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name  TEXT NOT NULL,
  owner_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON companies(owner_id);

-- ─────────────────────────────────────────────
-- 3. Expense Categories
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expense_categories (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_type      TEXT NOT NULL,
  owner_company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expense_categories_company
  ON expense_categories(owner_company_id);

-- ─────────────────────────────────────────────
-- 4. Invoices
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number    TEXT NOT NULL,              -- e.g. "252/26", may contain special chars
  invoice_date      DATE NOT NULL,              -- YYYY-MM-DD
  issue_party       TEXT NOT NULL,
  amount            NUMERIC(12, 2) NOT NULL,    -- 2-decimal precision
  owner_company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reference_month   DATE NOT NULL,              -- first day of the reference month
  is_paid           BOOLEAN NOT NULL DEFAULT FALSE,
  expense_category  TEXT NOT NULL,              -- should match an expense_categories.expense_type
  attached_file     TEXT,                       -- nullable — file URL or path
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_company   ON invoices(owner_company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_is_paid   ON invoices(is_paid);
CREATE INDEX IF NOT EXISTS idx_invoices_ref_month ON invoices(reference_month);
