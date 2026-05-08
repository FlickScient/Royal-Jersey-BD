import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, and, ilike, sql } from "drizzle-orm";
import { ListProductsQueryParams } from "@workspace/api-zod";

const router = Router();

function mapProduct(p: typeof productsTable.$inferSelect, categoryName: string) {
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
    isFeatured: p.isFeatured,
    isNew: p.isNew,
    discountPercent: p.discountPercent,
    rating: p.rating ? parseFloat(p.rating) : 4.5,
    reviewCount: p.reviewCount,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/products", async (req, res) => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  const { categoryId, edition, search, inStock } = parsed.data;

  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(
      and(
        categoryId ? eq(productsTable.categoryId, categoryId) : undefined,
        edition ? eq(productsTable.edition, edition) : undefined,
        search ? ilike(productsTable.name, `%${search}%`) : undefined,
        inStock !== undefined ? eq(productsTable.inStock, inStock) : undefined,
      ),
    );

  return res.json(rows.map((r) => mapProduct(r.product, r.categoryName)));
});

router.get("/products/featured", async (req, res) => {
  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.isFeatured, true))
    .limit(8);

  return res.json(rows.map((r) => mapProduct(r.product, r.categoryName)));
});

router.get("/products/new-arrivals", async (req, res) => {
  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.isNew, true))
    .limit(8);

  return res.json(rows.map((r) => mapProduct(r.product, r.categoryName)));
});

router.get("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, id))
    .limit(1);

  if (!rows.length) return res.status(404).json({ error: "Product not found" });
  return res.json(mapProduct(rows[0].product, rows[0].categoryName));
});

export default router;
