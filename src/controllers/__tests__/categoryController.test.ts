// ============================================================
// ETS — Category Controller Tests
// ============================================================

import { Request, Response } from "express";
import { getCategories, createCategory } from "../categoryController";

jest.mock("../../config/supabase", () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from "../../config/supabase";

function mockReq(params: Record<string, string> = {}, body: Record<string, unknown> = {}): Partial<Request> {
  return { params, body } as Partial<Request>;
}

function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("CategoryController", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── getCategories ──────────────────────────────────────
  describe("getCategories", () => {
    it("should return categories for a company", async () => {
      const cats = [{ id: "cat1", expense_type: "Rent", owner_company_id: "c1", created_at: "2026-01-01" }];
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: cats, error: null }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1" });
      const res = mockRes();
      await getCategories(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(cats);
    });

    it("should return empty array when no categories", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1" });
      const res = mockRes();
      await getCategories(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("should return 500 on DB error", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: null, error: { message: "DB failure" } }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1" });
      const res = mockRes();
      await getCategories(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── createCategory ─────────────────────────────────────
  describe("createCategory", () => {
    it("should create category and return 201", async () => {
      const created = { id: "cat1", expense_type: "Rent", owner_company_id: "c1", created_at: "2026-01-01" };
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: created, error: null }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1" }, { expenseType: "Rent" });
      const res = mockRes();
      await createCategory(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it("should return 400 if expenseType is missing", async () => {
      const req = mockReq({ companyId: "c1" }, {});
      const res = mockRes();
      await createCategory(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 on DB error", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: "DB failure" } }),
          }),
        }),
      });

      const req = mockReq({ companyId: "c1" }, { expenseType: "Rent" });
      const res = mockRes();
      await createCategory(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
