import cors from "cors";
import express from "express";
import { pool } from "../db/pool.js";

export const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (error) {
    res.status(500).json({
      error: "Database health check failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});
