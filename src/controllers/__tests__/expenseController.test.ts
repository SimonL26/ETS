// ============================================================
// ETS — Expense Controller Tests
// ============================================================

import { Request, Response } from "express";
import { getExpenseSummary, getExpenseTrend } from "../expenseController";

jest.mock("../../config/supabase", () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from "../../config/supabase";

function mockReq(
  params: Record<string, string> = {},
  query: Record<string, string> = {}
): Partial<Request> {
  return { params, body: {}, query } as unknown as Partial<Request>;
}

function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("ExpenseController", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── getExpenseSummary ──────────────────────────────────
  describe("getExpenseSummary", () => {
    it("should return grouped summary for a valid month", async () => {
      const rows = [
        { expense_category: "Rent", amount: 1000 },
        { expense_category: "Rent", amount: 500 },
        { expense_category: "Utilities", amount: 250 },
      ];
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lt: jest.fn().mockResolvedValue({ data: rows, error: null }),
              }),
            }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1" }, { month: "202602" });
      const res = mockRes();
      await getExpenseSummary(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        month: "202602",
        categories: expect.arrayContaining([
          { category: "Rent", total: 1500 },
          { category: "Utilities", total: 250 },
        ]),
      });
    });

    it("should return 400 if month is missing", async () => {
      const req = mockReq({ companyId: "c1" }, {});
      const res = mockRes();
      await getExpenseSummary(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 if month format is wrong", async () => {
      const req = mockReq({ companyId: "c1" }, { month: "2026-02" });
      const res = mockRes();
      await getExpenseSummary(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 on DB error", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lt: jest.fn().mockResolvedValue({ data: null, error: { message: "DB failure" } }),
              }),
            }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1" }, { month: "202602" });
      const res = mockRes();
      await getExpenseSummary(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── getExpenseTrend ────────────────────────────────────
  describe("getExpenseTrend", () => {
    it("should return monthly trend data", async () => {
      const rows = [
        { reference_month: "2026-01-01", amount: 1000 },
        { reference_month: "2026-01-01", amount: 500 },
        { reference_month: "2026-02-01", amount: 800 },
      ];
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lt: jest.fn().mockResolvedValue({ data: rows, error: null }),
              }),
            }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1" }, { from: "202601", to: "202602" });
      const res = mockRes();
      await getExpenseTrend(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        from: "202601",
        to: "202602",
        trend: [
          { month: "2026-01", total: 1500 },
          { month: "2026-02", total: 800 },
        ],
      });
    });

    it("should return 400 if from or to is missing", async () => {
      const req = mockReq({ companyId: "c1" }, { from: "202601" }); // missing 'to'
      const res = mockRes();
      await getExpenseTrend(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 if params have wrong format", async () => {
      const req = mockReq({ companyId: "c1" }, { from: "2026-01", to: "2026-12" }); // wrong format
      const res = mockRes();
      await getExpenseTrend(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 on DB error", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lt: jest.fn().mockResolvedValue({ data: null, error: { message: "DB failure" } }),
              }),
            }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1" }, { from: "202601", to: "202612" });
      const res = mockRes();
      await getExpenseTrend(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
