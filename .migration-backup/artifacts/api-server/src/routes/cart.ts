import { Router } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { AddToCartBody, RemoveFromCartParams } from "@workspace/api-zod";

const router = Router();

function getSessionId(req: import("express").Request): string {
  const sid = req.headers["x-session-id"] as string;
  return sid || "default-session";
}

async function buildCart(sessionId: string) {
  const items = await db
    .select({
      cartItem: cartItemsTable,
      product: productsTable,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.sessionId, sessionId));

  const mapped = items.map((r) => ({
    productId: r.cartItem.productId,
    name: r.product.name,
    imageUrl: r.product.imageUrl,
    price: parseFloat(r.product.price),
    quantity: r.cartItem.quantity,
    size: r.cartItem.size ?? undefined,
  }));

  const subtotal = mapped.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal;
  const itemCount = mapped.reduce((sum, i) => sum + i.quantity, 0);

  return { items: mapped, subtotal, total, itemCount };
}

router.get("/cart", async (req, res) => {
  const sessionId = getSessionId(req);
  return res.json(await buildCart(sessionId));
});

router.post("/cart/items", async (req, res) => {
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const sessionId = getSessionId(req);
  const { productId, quantity, size } = parsed.data;

  const existing = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId)))
    .limit(1);

  if (existing.length) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItemsTable.id, existing[0].id));
  } else {
    await db.insert(cartItemsTable).values({ sessionId, productId, quantity, size: size ?? null });
  }

  return res.json(await buildCart(sessionId));
});

router.delete("/cart/items/:productId", async (req, res) => {
  const parsed = RemoveFromCartParams.safeParse({ productId: parseInt(req.params.productId) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid productId" });

  const sessionId = getSessionId(req);
  await db
    .delete(cartItemsTable)
    .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, parsed.data.productId)));

  return res.json(await buildCart(sessionId));
});

export default router;
