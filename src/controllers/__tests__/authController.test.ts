// ============================================================
// ETS — Auth Controller Tests
// ============================================================

import { Request, Response } from "express";
import { register, login } from "../authController";

jest.mock("../../config/supabase", () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
    from: jest.fn(),
  },
}));

import { supabase } from "../../config/supabase";

function mockReq(body: Record<string, unknown> = {}): Partial<Request> {
  return { body } as Partial<Request>;
}

function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("AuthController", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── register ─────────────────────────────────────────────
  describe("register", () => {
    it("should register a user and return 201", async () => {
      const mockUser = { id: "u1", email: "test@test.com" };
      const mockSession = { access_token: "jwt-token" };
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const req = mockReq({ email: "test@test.com", password: "pass123", username: "testuser" });
      const res = mockRes();
      await register(req as Request, res as Response);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "pass123",
        options: { data: { username: "testuser" } },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ user: mockUser, session: mockSession })
      );
    });

    it("should return 400 if fields are missing", async () => {
      const req = mockReq({ email: "test@test.com" }); // missing password + username
      const res = mockRes();
      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 on Supabase auth error", async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "User already registered" },
      });

      const req = mockReq({ email: "test@test.com", password: "pass123", username: "testuser" });
      const res = mockRes();
      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "User already registered" });
    });
  });

  // ── login ────────────────────────────────────────────────
  describe("login", () => {
    it("should login and return session", async () => {
      const mockUser = { id: "u1", email: "test@test.com" };
      const mockSession = { access_token: "jwt-token" };
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const req = mockReq({ email: "test@test.com", password: "pass123" });
      const res = mockRes();
      await login(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ user: mockUser, session: mockSession })
      );
    });

    it("should return 400 if fields are missing", async () => {
      const req = mockReq({ email: "test@test.com" }); // missing password
      const res = mockRes();
      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 401 on invalid credentials", async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Invalid login credentials" },
      });

      const req = mockReq({ email: "test@test.com", password: "wrong" });
      const res = mockRes();
      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid login credentials" });
    });
  });
});
