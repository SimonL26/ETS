// ============================================================
// ETS — Express Server Entry Point
// ============================================================

import express from "express";
import cors from "cors";
import router from "./routes";

const app = express();
const PORT = process.env.PORT ?? 3000;

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────
app.use("/api", router);

// ── Health check ─────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Start server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 ETS server running on http://localhost:${PORT}`);
  console.log(`   API routes mounted at /api`);
});

export default app;
