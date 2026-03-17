// ============================================================
// ETS — Invoice Controller Tests
// ============================================================

import { Request, Response } from "express";
import {
  createInvoice,
  getInvoices,
  getInvoice,
  markAsPaid,
  batchMarkAsPaid,
} from "../invoiceController";

jest.mock("../../config/supabase", () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from "../../config/supabase";

function mockReq(
  params: Record<string, string> = {},
  body: Record<string, unknown> = {},
  query: Record<string, string> = {}
): Partial<Request> {
  return { params, body, query } as unknown as Partial<Request>;
}

function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const sampleInvoice = {
  id: "inv1",
  invoice_number: "252/26",
  invoice_date: "2026-02-15",
  issue_party: "Vendor A",
  amount: 1500.5,
  owner_company_id: "c1",
  reference_month: "2026-02-01",
  is_paid: false,
  expense_category: "Rent",
  attached_file: null,
  created_at: "2026-02-15T10:00:00Z",
};

describe("InvoiceController", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── createInvoice ──────────────────────────────────────
  describe("createInvoice", () => {
    it("should create invoice and return 201 when category is valid", async () => {
      // First call: category lookup; Second call: invoice insert
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: [{ expense_type: "Rent" }],
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: sampleInvoice, error: null }),
            }),
          }),
        });

      const req = mockReq({ companyId: "c1" }, {
        invoiceNumber: "252/26",
        invoiceDate: "2026-02-15",
        issueParty: "Vendor A",
        amount: 1500.5,
        referenceMonth: "2026-02-01",
        expenseCategory: "Rent",
      });
      const res = mockRes();
      await createInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(sampleInvoice);
    });

    it("should return 400 if required fields are missing", async () => {
      const req = mockReq({ companyId: "c1" }, { invoiceNumber: "252/26" }); // missing other fields
      const res = mockRes();
      await createInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 if expense category is invalid", async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [{ expense_type: "Rent" }, { expense_type: "Food" }],
              error: null,
            }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1" }, {
        invoiceNumber: "1", invoiceDate: "2026-02-15", issueParty: "V",
        amount: 100, referenceMonth: "2026-02-01", expenseCategory: "InvalidCategory",
      });
      const res = mockRes();
      await createInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid expense category" });
    });

    it("should return 500 on DB error during insert", async () => {
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: [{ expense_type: "Rent" }],
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: { message: "DB failure" } }),
            }),
          }),
        });

      const req = mockReq({ companyId: "c1" }, {
        invoiceNumber: "1", invoiceDate: "2026-02-15", issueParty: "V",
        amount: 100, referenceMonth: "2026-02-01", expenseCategory: "Rent",
      });
      const res = mockRes();
      await createInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── getInvoices ────────────────────────────────────────
  describe("getInvoices", () => {
    it("should return invoices without filters", async () => {
      const mockOrder = jest.fn().mockResolvedValue({ data: [sampleInvoice], error: null });
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({ order: mockOrder }),
        }),
      });

      const req = mockReq({ companyId: "c1" }, {}, {});
      const res = mockRes();
      await getInvoices(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith([sampleInvoice]);
    });

    it("should return 500 on DB error", async () => {
      const mockOrder = jest.fn().mockResolvedValue({ data: null, error: { message: "DB failure" } });
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({ order: mockOrder }),
        }),
      });

      const req = mockReq({ companyId: "c1" });
      const res = mockRes();
      await getInvoices(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── getInvoice ─────────────────────────────────────────
  describe("getInvoice", () => {
    it("should return single invoice", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: sampleInvoice, error: null }),
            }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1", invoiceId: "inv1" });
      const res = mockRes();
      await getInvoice(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(sampleInvoice);
    });

    it("should return 404 when not found", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: "PGRST116", message: "Not found" },
              }),
            }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1", invoiceId: "nope" });
      const res = mockRes();
      await getInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 500 on DB error", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: "UNEXPECTED", message: "DB failure" },
              }),
            }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1", invoiceId: "inv1" });
      const res = mockRes();
      await getInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── markAsPaid ─────────────────────────────────────────
  describe("markAsPaid", () => {
    it("should mark invoice as paid and return it", async () => {
      const paid = { ...sampleInvoice, is_paid: true };
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: paid, error: null }),
              }),
            }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1", invoiceId: "inv1" });
      const res = mockRes();
      await markAsPaid(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ is_paid: true }));
    });

    it("should return 404 when invoice not found", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { code: "PGRST116", message: "Not found" },
                }),
              }),
            }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1", invoiceId: "nope" });
      const res = mockRes();
      await markAsPaid(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 500 on DB error", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { code: "UNEXPECTED", message: "DB failure" },
                }),
              }),
            }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1", invoiceId: "inv1" });
      const res = mockRes();
      await markAsPaid(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── batchMarkAsPaid ────────────────────────────────────
  describe("batchMarkAsPaid", () => {
    it("should batch-mark invoices as paid", async () => {
      const updated = [
        { ...sampleInvoice, id: "inv1", is_paid: true },
        { ...sampleInvoice, id: "inv2", is_paid: true },
      ];
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({ data: updated, error: null }),
            }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1" }, { invoiceIds: ["inv1", "inv2"] });
      const res = mockRes();
      await batchMarkAsPaid(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({ updated: 2, invoices: updated });
    });

    it("should return 400 if invoiceIds is empty", async () => {
      const req = mockReq({ companyId: "c1" }, { invoiceIds: [] });
      const res = mockRes();
      await batchMarkAsPaid(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 if invoiceIds is not an array", async () => {
      const req = mockReq({ companyId: "c1" }, { invoiceIds: "not-an-array" });
      const res = mockRes();
      await batchMarkAsPaid(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 on DB error", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({ data: null, error: { message: "DB failure" } }),
            }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1" }, { invoiceIds: ["inv1"] });
      const res = mockRes();
      await batchMarkAsPaid(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
