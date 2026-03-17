// ============================================================
// ETS — Ownership Middleware Tests
// ============================================================

import { Response, NextFunction } from "express";
import { requireSelf, requireCompanyOwner } from "../ownershipMiddleware";
import { AuthenticatedRequest } from "../../types/database";

jest.mock("../../config/supabase", () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    from: jest.fn(),
  },
}));

import { supabase } from "../../config/supabase";

function mockReq(
  user: { id: string; email: string } | undefined,
  params: Record<string, string> = {}
): Partial<AuthenticatedRequest> {
  return { user, params } as Partial<AuthenticatedRequest>;
}

function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("Ownership Middleware", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── requireSelf ────────────────────────────────────────
  describe("requireSelf", () => {
    it("should call next() when user.id matches userId param", () => {
      const req = mockReq({ id: "u1", email: "a@b.com" }, { userId: "u1" });
      const res = mockRes();
      const next = jest.fn() as NextFunction;
      requireSelf(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it("should return 403 when user.id does not match userId param", () => {
      const req = mockReq({ id: "u1", email: "a@b.com" }, { userId: "u2" });
      const res = mockRes();
      const next = jest.fn() as NextFunction;
      requireSelf(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 when req.user is undefined", () => {
      const req = mockReq(undefined, { userId: "u1" });
      const res = mockRes();
      const next = jest.fn() as NextFunction;
      requireSelf(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── requireCompanyOwner ────────────────────────────────
  describe("requireCompanyOwner", () => {
    it("should call next() when user owns the company", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { owner_id: "u1" },
              error: null,
            }),
          }),
        }),
      });

      const req = mockReq({ id: "u1", email: "a@b.com" }, { companyId: "c1" });
      const res = mockRes();
      const next = jest.fn() as NextFunction;
      await requireCompanyOwner(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it("should return 403 when user does not own the company", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { owner_id: "u2" },
              error: null,
            }),
          }),
        }),
      });

      const req = mockReq({ id: "u1", email: "a@b.com" }, { companyId: "c1" });
      const res = mockRes();
      const next = jest.fn() as NextFunction;
      await requireCompanyOwner(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 when company is not found", async () => {
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

      const req = mockReq({ id: "u1", email: "a@b.com" }, { companyId: "nope" });
      const res = mockRes();
      const next = jest.fn() as NextFunction;
      await requireCompanyOwner(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when req.user is undefined", async () => {
      const req = mockReq(undefined, { companyId: "c1" });
      const res = mockRes();
      const next = jest.fn() as NextFunction;
      await requireCompanyOwner(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
