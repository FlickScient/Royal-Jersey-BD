import { Router } from "express";
import { db } from "@workspace/db";
import { wishlistItemsTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function getSessionId(req: import("express").Request): string {
  return (req.headers["x-session-id"] as string) || "default-session";
}

async function getWishlistProducts(sessionId: string) {
  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(wishlistItemsTable)
    .innerJoin(productsTable, eq(wishlistItemsTable.productId, productsTable.id))
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(wishlistItemsTable.sessionId, sessionId));

  return rows.map((r) => ({
    id: r.product.id,
    name: r.product.name,
    description: r.product.description ?? undefined,
    price: parseFloat(r.product.price),
    originalPrice: r.product.originalPrice ? parseFloat(r.product.originalPrice) : undefined,
    imageUrl: r.product.imageUrl,
    images: r.product.images ?? [],
    categoryId: r.product.categoryId,
    categoryName: r.categoryName,
    edition: r.product.edition,
    fabricType: r.product.fabricType ?? undefined,
    sizes: r.product.sizes ?? ["S", "M", "L", "XL", "XXL"],
    inStock: r.product.inStock,
    isFeatured: r.product.isFeatured,
    isNew: r.product.isNew,
    discountPercent: r.product.discountPercent,
    rating: r.product.rating ? parseFloat(r.product.rating) : 4.5,
    reviewCount: r.product.reviewCount,
    createdAt: r.product.createdAt.toISOString(),
  }));
}

router.get("/wishlist", async (req, res) => {
  const sessionId = getSessionId(req);
  return res.json(await getWishlistProducts(sessionId));
});

router.post("/wishlist/:productId", async (req, res) => {
  const productId = parseInt(req.params.productId);
  if (isNaN(productId)) return res.status(400).json({ error: "Invalid productId" });

  const sessionId = getSessionId(req);
  const existing = await db
    .select()
    .from(wishlistItemsTable)
    .where(and(eq(wishlistItemsTable.sessionId, sessionId), eq(wishlistItemsTable.productId, productId)))
    .limit(1);

  if (!existing.length) {
    await db.insert(wishlistItemsTable).values({ sessionId, productId });
  }

  return res.json(await getWishlistProducts(sessionId));
});

router.delete("/wishlist/:productId", async (req, res) => {
  const productId = parseInt(req.params.productId);
  if (isNaN(productId)) return res.status(400).json({ error: "Invalid productId" });

  const sessionId = getSessionId(req);
  await db
    .delete(wishlistItemsTable)
    .where(and(eq(wishlistItemsTable.sessionId, sessionId), eq(wishlistItemsTable.productId, productId)));

  return res.json(await getWishlistProducts(sessionId));
});

export default router;
