# ETS Backend Skeleton — Walkthrough

## What Was Built
A complete TypeScript + Express.js + Supabase backend skeleton for the Expense Tracking System.

## Project Structure

```
ETS/
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript config (ES2020, strict)
├── jest.config.ts            # Jest + ts-jest config
├── .gitignore
├── supabase/
│   └── schema.sql            # PostgreSQL table definitions (4 tables)
└── src/
    ├── index.ts              # Express server entry point (port 3000)
    ├── config/
    │   └── supabase.ts       # Supabase client (placeholder credentials)
    ├── types/
    │   └── database.ts       # TypeScript interfaces + Supabase Database type
    ├── routes/
    │   └── index.ts          # All API routes mounted at /api
    └── controllers/
        ├── userController.ts
        ├── categoryController.ts
        ├── invoiceController.ts
        ├── expenseController.ts
        └── __tests__/
            ├── userController.test.ts
            ├── categoryController.test.ts
            ├── invoiceController.test.ts
            └── expenseController.test.ts
```

## API Endpoints

| Method | Route | Controller |
|--------|-------|------------|
| `GET` | `/api/users/:userId` | [getUser](file:///c:/Users/simon/Documents/GitHub/ETS/src/controllers/userController.ts#8-32) |
| `GET` | `/api/users/:userId/companies` | [getUserCompanies](file:///c:/Users/simon/Documents/GitHub/ETS/src/controllers/userController.ts#33-57) |
| `POST` | `/api/users/:userId/companies` | [createCompany](file:///c:/Users/simon/Documents/GitHub/ETS/src/controllers/userController.ts#58-89) |
| `GET` | `/api/companies/:companyId/categories` | [getCategories](file:///c:/Users/simon/Documents/GitHub/ETS/src/controllers/categoryController.ts#8-32) |
| `POST` | `/api/companies/:companyId/categories` | [createCategory](file:///c:/Users/simon/Documents/GitHub/ETS/src/controllers/categoryController.ts#33-64) |
| `POST` | `/api/companies/:companyId/invoices` | [createInvoice](file:///c:/Users/simon/Documents/GitHub/ETS/src/controllers/invoiceController.ts#8-60) |
| `GET` | `/api/companies/:companyId/invoices` | [getInvoices](file:///c:/Users/simon/Documents/GitHub/ETS/src/controllers/invoiceController.ts#61-105) |
| `GET` | `/api/companies/:companyId/invoices/:invoiceId` | [getInvoice](file:///c:/Users/simon/Documents/GitHub/ETS/src/controllers/invoiceController.ts#106-132) |
| `PUT` | `/api/companies/:companyId/invoices/:invoiceId/pay` | [markAsPaid](file:///c:/Users/simon/Documents/GitHub/ETS/src/controllers/invoiceController.ts#133-160) |
| `PUT` | `/api/companies/:companyId/invoices/batch-pay` | [batchMarkAsPaid](file:///c:/Users/simon/Documents/GitHub/ETS/src/controllers/invoiceController.ts#161-193) |
| `GET` | `/api/companies/:companyId/expenses/summary` | [getExpenseSummary](file:///c:/Users/simon/Documents/GitHub/ETS/src/controllers/expenseController.ts#8-63) |
| `GET` | `/api/companies/:companyId/expenses/trend` | [getExpenseTrend](file:///c:/Users/simon/Documents/GitHub/ETS/src/controllers/expenseController.ts#64-122) |

## Verification Results

### Unit Tests — **38/38 passed** ✅
```
 PASS  src/controllers/__tests__/userController.test.ts
 PASS  src/controllers/__tests__/categoryController.test.ts
 PASS  src/controllers/__tests__/invoiceController.test.ts
 PASS  src/controllers/__tests__/expenseController.test.ts

Test Suites: 4 passed, 4 total
Tests:       38 passed, 38 total
```

### TypeScript Compilation — **Clean** ✅
`npx tsc --noEmit` — zero errors

### Production Build — **Successful** ✅
`npm run build` — compiled to `dist/`

## Notable Design Decisions

1. **Supabase v2.99 type compatibility**: The [Database](file:///c:/Users/simon/Documents/GitHub/ETS/src/types/database.ts#53-187) type requires `Views: {}`, `Functions: {}` on the schema, and `Relationships: []` on each table for the typed client to resolve Insert/Update types correctly.

2. **Express v5 params**: `@types/express` v5 types `req.params` values as `string | string[]`. All controllers use `as string` casts since route params are always single strings.

3. **Expense aggregation**: [getExpenseSummary](file:///c:/Users/simon/Documents/GitHub/ETS/src/controllers/expenseController.ts#8-63) and [getExpenseTrend](file:///c:/Users/simon/Documents/GitHub/ETS/src/controllers/expenseController.ts#64-122) fetch data and aggregate in-memory (Supabase JS client doesn't support `GROUP BY`). A comment suggests using an RPC/database function for production.

## Before Running

> [!IMPORTANT]
> Replace the placeholder credentials in [supabase.ts](file:///c:/Users/simon/Documents/GitHub/ETS/src/config/supabase.ts):
> - `YOUR_SUPABASE_URL_HERE` → your project URL
> - `YOUR_SUPABASE_ANON_KEY_HERE` → your anon/public key
>
> Run the SQL in [schema.sql](file:///c:/Users/simon/Documents/GitHub/ETS/supabase/schema.sql) in your Supabase SQL Editor.
