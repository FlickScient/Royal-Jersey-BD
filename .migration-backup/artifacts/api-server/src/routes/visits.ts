import { Router } from "express";
import { db } from "@workspace/db";
import { siteVisitsTable } from "@workspace/db";

const router = Router();

router.post("/track-visit", async (req, res) => {
  const { path, sessionId } = req.body as { path?: string; sessionId?: string };
  try {
    await db.insert(siteVisitsTable).values({
      path: path || "/",
      sessionId: sessionId || null,
    });
  } catch {
    // silently ignore
  }
  return res.json({ ok: true });
});

export default router;
