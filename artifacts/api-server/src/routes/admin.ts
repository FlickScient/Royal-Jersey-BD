import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import {
  productsTable,
  categoriesTable,
  offersTable,
  ordersTable,
  leaguesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function getAdminIds(): string[] {
  return (process.env.ADMIN_USER_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
}

// Admin auth middleware
const requireAdmin = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const adminIds = getAdminIds();
  // If no admins configured yet, first signed-in user becomes admin automatically
  if (adminIds.length === 0 || adminIds.includes(userId)) {
    req.adminUserId = userId;
    return next();
  }
  return res.status(403).json({ error: "Forbidden" });
};

// Check if current user is admin
router.get("/admin/me", (req: any, res) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) return res.status(403).json({ isAdmin: false });

  const adminIds = getAdminIds();
  // If no admins set, first signed-in user is treated as admin
  const isAdmin = adminIds.length === 0 || adminIds.includes(userId);
  return res.json({ isAdmin, userId });
});

// Promote self to admin (only works when no admins set yet — first-time setup)
router.post("/admin/setup", (req: any, res) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const adminIds = getAdminIds();
  if (adminIds.length > 0 && !adminIds.includes(userId)) {
    return res.status(403).json({ error: "Admin already configured" });
  }
  // Return userId so client can display it
  return res.json({ success: true, userId, message: "You are the admin. Add ADMIN_USER_IDS=" + userId + " to your secrets to lock this permanently." });
});

// ─── Products ───────────────────────────────────────────────────────────────

router.get("/admin/products", requireAdmin, async (req, res) => {
  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name, leagueName: leaguesTable.name, leagueLogoUrl: leaguesTable.logoUrl })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(leaguesTable, eq(productsTable.leagueId, leaguesTable.id))
    .orderBy(productsTable.createdAt);

  return res.json(rows.map((r) => mapProduct(r.product, r.categoryName, r.leagueName, r.leagueLogoUrl)));
});

router.post("/admin/products", requireAdmin, async (req, res) => {
  const body = req.body;
  const [product] = await db.insert(productsTable).values({
    name: body.name,
    description: body.description ?? null,
    price: String(body.price),
    originalPrice: body.originalPrice ? String(body.originalPrice) : null,
    imageUrl: body.imageUrl,
    images: body.images ?? [],
    categoryId: body.categoryId,
    leagueId: body.leagueId ?? null,
    teamName: body.teamName ?? null,
    edition: body.edition ?? "fan",
    fabricType: body.fabricType ?? null,
    sizes: body.sizes ?? ["S", "M", "L", "XL", "XXL"],
    inStock: body.inStock ?? true,
    isFeatured: body.isFeatured ?? false,
    isNew: body.isNew ?? false,
    discountPercent: body.discountPercent ?? 0,
    reviewCount: 0,
  }).returning();

  const category = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId)).limit(1);
  const league = product.leagueId ? await db.select().from(leaguesTable).where(eq(leaguesTable.id, product.leagueId)).limit(1) : [];

  return res.status(201).json(mapProduct(product, category[0]?.name ?? "", league[0]?.name ?? null, league[0]?.logoUrl ?? null));
});

router.put("/admin/products/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;

  const [product] = await db.update(productsTable).set({
    name: body.name,
    description: body.description ?? null,
    price: String(body.price),
    originalPrice: body.originalPrice ? String(body.originalPrice) : null,
    imageUrl: body.imageUrl,
    images: body.images ?? [],
    categoryId: body.categoryId,
    leagueId: body.leagueId ?? null,
    teamName: body.teamName ?? null,
    edition: body.edition ?? "fan",
    fabricType: body.fabricType ?? null,
    sizes: body.sizes ?? ["S", "M", "L", "XL", "XXL"],
    inStock: body.inStock ?? true,
    isFeatured: body.isFeatured ?? false,
    isNew: body.isNew ?? false,
    discountPercent: body.discountPercent ?? 0,
  }).where(eq(productsTable.id, id)).returning();

  if (!product) return res.status(404).json({ error: "Not found" });

  const category = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId)).limit(1);
  const league = product.leagueId ? await db.select().from(leaguesTable).where(eq(leaguesTable.id, product.leagueId)).limit(1) : [];

  return res.json(mapProduct(product, category[0]?.name ?? "", league[0]?.name ?? null, league[0]?.logoUrl ?? null));
});

router.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(productsTable).where(eq(productsTable.id, id));
  return res.json({ success: true });
});

// ─── Offers ─────────────────────────────────────────────────────────────────

router.get("/admin/offers", requireAdmin, async (req, res) => {
  const rows = await db.select().from(offersTable).orderBy(offersTable.createdAt);
  return res.json(rows.map(mapOffer));
});

router.post("/admin/offers", requireAdmin, async (req, res) => {
  const body = req.body;
  const [offer] = await db.insert(offersTable).values({
    title: body.title,
    description: body.description,
    discountPercent: body.discountPercent ?? 0,
    imageUrl: body.imageUrl ?? null,
    validUntil: body.validUntil ? new Date(body.validUntil) : null,
    code: body.code ?? null,
  }).returning();
  return res.status(201).json(mapOffer(offer));
});

router.put("/admin/offers/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  const [offer] = await db.update(offersTable).set({
    title: body.title,
    description: body.description,
    discountPercent: body.discountPercent ?? 0,
    imageUrl: body.imageUrl ?? null,
    validUntil: body.validUntil ? new Date(body.validUntil) : null,
    code: body.code ?? null,
  }).where(eq(offersTable.id, id)).returning();
  if (!offer) return res.status(404).json({ error: "Not found" });
  return res.json(mapOffer(offer));
});

router.delete("/admin/offers/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(offersTable).where(eq(offersTable.id, id));
  return res.json({ success: true });
});

// ─── Categories ──────────────────────────────────────────────────────────────

router.post("/admin/categories", requireAdmin, async (req, res) => {
  const body = req.body;
  const [cat] = await db.insert(categoriesTable).values({
    name: body.name,
    slug: body.slug,
    imageUrl: body.imageUrl ?? null,
  }).returning();
  return res.status(201).json({ id: cat.id, name: cat.name, slug: cat.slug, imageUrl: cat.imageUrl ?? undefined, productCount: 0 });
});

router.put("/admin/categories/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  const [cat] = await db.update(categoriesTable).set({
    name: body.name,
    slug: body.slug,
    imageUrl: body.imageUrl ?? null,
  }).where(eq(categoriesTable.id, id)).returning();
  if (!cat) return res.status(404).json({ error: "Not found" });
  return res.json({ id: cat.id, name: cat.name, slug: cat.slug, imageUrl: cat.imageUrl ?? undefined, productCount: 0 });
});

// ─── Orders ──────────────────────────────────────────────────────────────────

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

function mapOrder(o: typeof ordersTable.$inferSelect, includeItems = false) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    total: parseFloat(o.total),
    paymentMethod: o.paymentMethod,
    customerName: o.customerName,
    phone: o.phone,
    address: o.address,
    notes: o.notes ?? undefined,
    items: includeItems ? JSON.parse(o.itemsJson) : undefined,
    createdAt: o.createdAt.toISOString(),
  };
}

router.get("/admin/orders", requireAdmin, async (req, res) => {
  const rows = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  return res.json(rows.map((o) => mapOrder(o, true)));
});

router.get("/admin/orders/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  return res.json(mapOrder(rows[0], true));
});

router.patch("/admin/orders/:id/status", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${ORDER_STATUSES.join(", ")}` });
  }
  const [order] = await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
  if (!order) return res.status(404).json({ error: "Not found" });
  return res.json(mapOrder(order, true));
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapProduct(
  p: typeof productsTable.$inferSelect,
  categoryName: string,
  leagueName: string | null,
  leagueLogoUrl: string | null,
) {
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
    leagueId: p.leagueId ?? undefined,
    leagueName: leagueName ?? undefined,
    leagueLogoUrl: leagueLogoUrl ?? undefined,
    teamName: p.teamName ?? undefined,
    createdAt: p.createdAt.toISOString(),
  };
}

function mapOffer(o: typeof offersTable.$inferSelect) {
  return {
    id: o.id,
    title: o.title,
    description: o.description,
    discountPercent: o.discountPercent,
    imageUrl: o.imageUrl ?? undefined,
    validUntil: o.validUntil?.toISOString() ?? undefined,
    code: o.code ?? undefined,
  };
}

export default router;
