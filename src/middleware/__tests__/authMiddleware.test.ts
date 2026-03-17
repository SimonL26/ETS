// ============================================================
// ETS — Auth Middleware Tests
// ============================================================

import { Response, NextFunction } from "express";
import { authMiddleware } from "../authMiddleware";
import { AuthenticatedRequest } from "../../types/database";

jest.mock("../../config/supabase", () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    from: jest.fn(),
  },
}));

import { supabase } from "../../config/supabase";

function mockReq(authHeader?: string): Partial<AuthenticatedRequest> {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
  } as Partial<AuthenticatedRequest>;
}

function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("authMiddleware", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should call next() and attach user when token is valid", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "u1", email: "test@test.com" } },
      error: null,
    });

    const req = mockReq("Bearer valid-token");
    const res = mockRes();
    const next = jest.fn() as NextFunction;
    await authMiddleware(req as AuthenticatedRequest, res as Response, next);

    expect(supabase.auth.getUser).toHaveBeenCalledWith("valid-token");
    expect(req.user).toEqual({ id: "u1", email: "test@test.com" });
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 when no Authorization header", async () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn() as NextFunction;
    await authMiddleware(req as AuthenticatedRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when header is not Bearer format", async () => {
    const req = mockReq("Basic abc123");
    const res = mockRes();
    const next = jest.fn() as NextFunction;
    await authMiddleware(req as AuthenticatedRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when token is invalid", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: "Token expired" },
    });

    const req = mockReq("Bearer expired-token");
    const res = mockRes();
    const next = jest.fn() as NextFunction;
    await authMiddleware(req as AuthenticatedRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
