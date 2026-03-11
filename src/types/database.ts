// ============================================================
// ETS — TypeScript Types / Database Interfaces
// ============================================================
// This file defines the row types and the Supabase `Database`
// type mapping compatible with @supabase/supabase-js v2.99+.
//
// NOTE: In production, regenerate this file using the Supabase CLI:
//   npx supabase gen types typescript --project-id "$PROJECT_REF" > src/types/database.ts
// ============================================================

/** Row type for the `users` table */
export interface User {
  id: string;
  username: string;
  created_at: string;
}

/** Row type for the `companies` table */
export interface Company {
  id: string;
  company_name: string;
  owner_id: string;
  created_at: string;
}

/** Row type for the `expense_categories` table */
export interface ExpenseCategory {
  id: string;
  expense_type: string;
  owner_company_id: string;
  created_at: string;
}

/** Row type for the `invoices` table */
export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;        // YYYY-MM-DD
  issue_party: string;
  amount: number;
  owner_company_id: string;
  reference_month: string;     // YYYY-MM-DD (first of month)
  is_paid: boolean;
  expense_category: string;
  attached_file: string | null;
  created_at: string;
}

// ── Supabase Database type mapping ─────────────────────────
// GenericSchema requires: { Tables, Views, Functions }
// GenericTable requires:  { Row, Insert, Update, Relationships }

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          company_name: string;
          owner_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          owner_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          owner_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      expense_categories: {
        Row: {
          id: string;
          expense_type: string;
          owner_company_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          expense_type: string;
          owner_company_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          expense_type?: string;
          owner_company_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expense_categories_owner_company_id_fkey";
            columns: ["owner_company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          invoice_date: string;
          issue_party: string;
          amount: number;
          owner_company_id: string;
          reference_month: string;
          is_paid: boolean;
          expense_category: string;
          attached_file: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          invoice_date: string;
          issue_party: string;
          amount: number;
          owner_company_id: string;
          reference_month: string;
          is_paid?: boolean;
          expense_category: string;
          attached_file?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          invoice_date?: string;
          issue_party?: string;
          amount?: number;
          owner_company_id?: string;
          reference_month?: string;
          is_paid?: boolean;
          expense_category?: string;
          attached_file?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_owner_company_id_fkey";
            columns: ["owner_company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {};
    Functions: {};
  };
}
