// ============================================================
// ETS — User Controller Tests
// ============================================================

import { Request, Response } from "express";
import { getUser, getUserCompanies, createCompany } from "../userController";

// ── Mock Supabase ──────────────────────────────────────────
const mockSingle = jest.fn();
const mockSelect = jest.fn(() => ({ single: mockSingle }));
const mockOrder = jest.fn();
const mockEq = jest.fn();
const mockInsert = jest.fn(() => ({ select: mockSelect }));

jest.mock("../../config/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({ eq: jest.fn(() => ({ single: mockSingle })) })),
      insert: mockInsert,
    })),
  },
}));

// Re-import after mock
import { supabase } from "../../config/supabase";

// ── Helpers ────────────────────────────────────────────────
function mockReq(params: Record<string, string> = {}, body: Record<string, unknown> = {}): Partial<Request> {
  return { params, body } as Partial<Request>;
}

function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ── Tests ──────────────────────────────────────────────────
describe("UserController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── getUser ────────────────────────────────────────────
  describe("getUser", () => {
    it("should return user on success", async () => {
      const user = { id: "u1", username: "alice", created_at: "2026-01-01T00:00:00Z" };
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: user, error: null }),
          }),
        }),
      });

      const req = mockReq({ userId: "u1" });
      const res = mockRes();
      await getUser(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(user);
    });

    it("should return 404 when user not found", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116", message: "Not found" },
            }),
          }),
        }),
      });

      const req = mockReq({ userId: "nonexistent" });
      const res = mockRes();
      await getUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 500 on DB error", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: "UNEXPECTED", message: "DB failure" },
            }),
          }),
        }),
      });

      const req = mockReq({ userId: "u1" });
      const res = mockRes();
      await getUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── getUserCompanies ───────────────────────────────────
  describe("getUserCompanies", () => {
    it("should return list of companies", async () => {
      const companies = [{ id: "c1", company_name: "Acme", owner_id: "u1", created_at: "2026-01-01" }];
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: companies, error: null }),
          }),
        }),
      });

      const req = mockReq({ userId: "u1" });
      const res = mockRes();
      await getUserCompanies(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(companies);
    });

    it("should return empty array when no companies", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const req = mockReq({ userId: "u1" });
      const res = mockRes();
      await getUserCompanies(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("should return 500 on DB error", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "DB failure" },
            }),
          }),
        }),
      });

      const req = mockReq({ userId: "u1" });
      const res = mockRes();
      await getUserCompanies(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── createCompany ──────────────────────────────────────
  describe("createCompany", () => {
    it("should create company and return 201", async () => {
      const created = { id: "c1", company_name: "Acme", owner_id: "u1", created_at: "2026-01-01" };
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: created, error: null }),
          }),
        }),
      });

      const req = mockReq({ userId: "u1" }, { companyName: "Acme" });
      const res = mockRes();
      await createCompany(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it("should return 400 if companyName is missing", async () => {
      const req = mockReq({ userId: "u1" }, {});
      const res = mockRes();
      await createCompany(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 on DB error", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "DB failure" },
            }),
          }),
        }),
      });

      const req = mockReq({ userId: "u1" }, { companyName: "Acme" });
      const res = mockRes();
      await createCompany(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
