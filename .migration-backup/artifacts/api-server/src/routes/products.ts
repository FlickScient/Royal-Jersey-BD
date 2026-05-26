import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable, leaguesTable } from "@workspace/db";
import { eq, and, or, ilike, gte, lte, asc, desc, sql } from "drizzle-orm";
import { ListProductsQueryParams } from "@workspace/api-zod";

const router = Router();

function mapProduct(
  p: typeof productsTable.$inferSelect,
  categoryName: string,
  leagueName?: string | null,
  leagueLogoUrl?: string | null,
) {
  let variantPrices: Record<string, number> | undefined;
  if (p.variantPrices) {
    try { variantPrices = JSON.parse(p.variantPrices); } catch {}
  }
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    price: parseFloat(p.price),
    originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : undefined,
    imageUrl: p.imageUrl,
    images: p.images ?? [],
    categoryId: p.categoryId,
    categoryName,
    edition: p.edition,
    fabricType: p.fabricType ?? undefined,
    sizes: p.sizes ?? ["S", "M", "L", "XL", "XXL"],
    inStock: p.inStock,
    stockCount: p.stockCount ?? undefined,
    isFeatured: p.isFeatured,
    isNew: p.isNew,
    discountPercent: p.discountPercent,
    rating: p.rating ? parseFloat(p.rating) : 4.5,
    reviewCount: p.reviewCount,
    leagueId: p.leagueId ?? undefined,
    leagueName: leagueName ?? undefined,
    leagueLogoUrl: leagueLogoUrl ?? undefined,
    teamName: p.teamName ?? undefined,
    tags: p.tags ?? [],
    variantPrices,
    videoUrl: p.videoUrl ?? undefined,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/products", async (req, res) => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  const { categoryId, edition, search, inStock, leagueId, sort, minPrice, maxPrice } = parsed.data;

  // Search across name, teamName, description, and tags for broad keyword matching
  const searchCondition = search
    ? or(
        ilike(productsTable.name, `%${search}%`),
        ilike(sql`coalesce(${productsTable.teamName}, '')`, `%${search}%`),
        ilike(sql`coalesce(${productsTable.description}, '')`, `%${search}%`),
        sql`${productsTable.tags}::text ilike ${'%' + search + '%'}`,
      )
    : undefined;

  const conditions = and(
    categoryId ? eq(productsTable.categoryId, categoryId) : undefined,
    edition ? eq(productsTable.edition, edition) : undefined,
    searchCondition,
    inStock !== undefined ? eq(productsTable.inStock, inStock) : undefined,
    leagueId ? eq(productsTable.leagueId, leagueId) : undefined,
    minPrice !== undefined ? gte(productsTable.price, String(minPrice)) : undefined,
    maxPrice !== undefined ? lte(productsTable.price, String(maxPrice)) : undefined,
  );

  let orderBy;
  switch (sort) {
    case "price_asc": orderBy = asc(productsTable.price); break;
    case "price_desc": orderBy = desc(productsTable.price); break;
    case "newest": orderBy = desc(productsTable.createdAt); break;
    case "popular": orderBy = desc(productsTable.reviewCount); break;
    default: orderBy = desc(productsTable.isFeatured);
  }

  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name, leagueName: leaguesTable.name, leagueLogoUrl: leaguesTable.logoUrl })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(leaguesTable, eq(productsTable.leagueId, leaguesTable.id))
    .where(conditions)
    .orderBy(orderBy);

  return res.json(rows.map((r) => mapProduct(r.product, r.categoryName, r.leagueName, r.leagueLogoUrl)));
});

router.get("/products/featured", async (req, res) => {
  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name, leagueName: leaguesTable.name, leagueLogoUrl: leaguesTable.logoUrl })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(leaguesTable, eq(productsTable.leagueId, leaguesTable.id))
    .where(eq(productsTable.isFeatured, true))
    .limit(8);

  return res.json(rows.map((r) => mapProduct(r.product, r.categoryName, r.leagueName, r.leagueLogoUrl)));
});

router.get("/products/new-arrivals", async (req, res) => {
  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name, leagueName: leaguesTable.name, leagueLogoUrl: leaguesTable.logoUrl })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(leaguesTable, eq(productsTable.leagueId, leaguesTable.id))
    .where(eq(productsTable.isNew, true))
    .limit(8);

  return res.json(rows.map((r) => mapProduct(r.product, r.categoryName, r.leagueName, r.leagueLogoUrl)));
});

router.get("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name, leagueName: leaguesTable.name, leagueLogoUrl: leaguesTable.logoUrl })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(leaguesTable, eq(productsTable.leagueId, leaguesTable.id))
    .where(eq(productsTable.id, id))
    .limit(1);

  if (!rows.length) return res.status(404).json({ error: "Product not found" });
  return res.json(mapProduct(rows[0].product, rows[0].categoryName, rows[0].leagueName, rows[0].leagueLogoUrl));
});

export default router;
