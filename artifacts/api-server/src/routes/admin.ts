import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import {
  productsTable,
  categoriesTable,
  offersTable,
  ordersTable,
  leaguesTable,
  siteSettingsTable,
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

router.delete("/admin/categories/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const products = await db.select({ id: productsTable.id }).from(productsTable).where(eq(productsTable.categoryId, id)).limit(1);
  if (products.length > 0) {
    return res.status(400).json({ error: "Cannot delete category with existing products. Remove or reassign products first." });
  }
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  return res.json({ success: true });
});

// ─── Site Settings ────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: Record<string, string> = {
  whatsapp_number: "+8801234567890",
  phone_number: "+880 1234-567890",
  announcement_text: "Free delivery on orders above ৳2,000",
  free_delivery_threshold: "2000",
  store_name: "Royal Jersey BD",
  store_tagline: "Premium luxury sports apparel crafted with Bangladeshi pride.",
  since_year: "2020",
  facebook_url: "https://facebook.com/royaljersey.bd",
  instagram_url: "https://instagram.com/royaljersey.bd",
  about_text: "Royal Jersey BD was born from a passion for football and frustration with low-quality, overpriced jerseys. We set out to build something different — premium quality, honest pricing, and a brand Bangladeshis can be proud of.\n\nFrom a small Facebook page to a full-fledged e-commerce store, thousands of fans and athletes across Bangladesh now trust us for their sportswear. Every jersey we sell carries our commitment to quality and your pride.",
  faq_items: JSON.stringify([
    { question: "What fabric types do you offer?", answer: "We offer Lorex, Box Mash, and Leap Jacquard fabrics — each with unique properties for different needs." },
    { question: "How long does delivery take?", answer: "Inside Dhaka: 24-48 hours. Outside Dhaka: 3-5 business days." },
    { question: "Do you accept returns?", answer: "Yes! We offer 7-day easy returns for wrong size or defective products." },
    { question: "What payment methods do you accept?", answer: "We accept bKash, Nagad, card payments, and Cash on Delivery (COD)." },
  ]),
  hero_slides: JSON.stringify([
    { title: "PREMIUM LOREX FABRIC", subtitle: "EXPERIENCE LUXURY ON THE PITCH", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop", cta: "Shop Lorex Edition", link: "/products?fabric=lorex" },
    { title: "PLAYER EDITION", subtitle: "AUTHENTIC FIT. ULTIMATE PERFORMANCE.", image: "https://images.unsplash.com/photo-1518063319808-ce6e719ed025?q=80&w=2070&auto=format&fit=crop", cta: "Discover Player Editions", link: "/products?edition=player" },
    { title: "ROYAL CUSTOM", subtitle: "YOUR TEAM. YOUR COLORS. OUR CRAFT.", image: "https://images.unsplash.com/photo-1522778526114-f2a4bbcefb66?q=80&w=2065&auto=format&fit=crop", cta: "Bulk Orders", link: "/contact" },
  ]),
  edition_player_image: "https://images.unsplash.com/photo-1600147184288-024d29f8f2b6?q=80&w=2070&auto=format&fit=crop",
  edition_fan_image: "https://images.unsplash.com/photo-1508344928928-7137b2f6b8b0?q=80&w=2070&auto=format&fit=crop",
  edition_kid_image: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=2070&auto=format&fit=crop",
  edition_premium_image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1974&auto=format&fit=crop",
  fabric_image_1: "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?q=80&w=1974&auto=format&fit=crop",
  fabric_image_2: "https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?q=80&w=1998&auto=format&fit=crop",
  fabric_image_3: "https://images.unsplash.com/photo-1608248593842-b054238e4a9e?q=80&w=1974&auto=format&fit=crop",
  fabric_image_4: "https://images.unsplash.com/photo-1544413660-299165566b1d?q=80&w=1974&auto=format&fit=crop",
};

router.get("/admin/site-settings", requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(siteSettingsTable);
    const settings = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return res.json(settings);
  } catch {
    return res.json(DEFAULT_SETTINGS);
  }
});

router.put("/admin/site-settings", requireAdmin, async (req, res) => {
  const body = req.body as Record<string, string>;
  for (const [key, value] of Object.entries(body)) {
    if (typeof value !== "string") continue;
    await db.insert(siteSettingsTable)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value, updatedAt: new Date() } });
  }
  const rows = await db.select().from(siteSettingsTable);
  const settings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return res.json(settings);
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
