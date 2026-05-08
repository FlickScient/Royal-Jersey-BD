import { Router } from "express";
import { db } from "@workspace/db";
import { offersTable } from "@workspace/db";

const router = Router();

router.get("/offers", async (req, res) => {
  const rows = await db.select().from(offersTable);
  return res.json(rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    discountPercent: r.discountPercent,
    imageUrl: r.imageUrl ?? undefined,
    validUntil: r.validUntil?.toISOString() ?? undefined,
    code: r.code ?? undefined,
  })));
});

export default router;
