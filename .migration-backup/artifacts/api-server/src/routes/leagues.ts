import { Router } from "express";
import { db } from "@workspace/db";
import { leaguesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/leagues", async (req, res) => {
  const rows = await db
    .select({
      id: leaguesTable.id,
      name: leaguesTable.name,
      slug: leaguesTable.slug,
      country: leaguesTable.country,
      logoUrl: leaguesTable.logoUrl,
      isInternational: leaguesTable.isInternational,
      productCount: sql<number>`count(${productsTable.id})::int`,
    })
    .from(leaguesTable)
    .leftJoin(productsTable, eq(leaguesTable.id, productsTable.leagueId))
    .groupBy(leaguesTable.id)
    .orderBy(leaguesTable.sortOrder, leaguesTable.name);

  return res.json(rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    country: r.country ?? undefined,
    logoUrl: r.logoUrl ?? undefined,
    isInternational: r.isInternational,
    productCount: r.productCount ?? 0,
  })));
});

export default router;
