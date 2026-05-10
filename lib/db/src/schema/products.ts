import { pgTable, serial, text, decimal, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const editionEnum = pgEnum("edition", ["player", "fan", "kid", "premium"]);

export const leaguesTable = pgTable("leagues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  country: text("country"),
  logoUrl: text("logo_url"),
  isInternational: boolean("is_international").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url").notNull(),
  images: text("images").array(),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  leagueId: integer("league_id").references(() => leaguesTable.id),
  teamName: text("team_name"),
  edition: editionEnum("edition").notNull().default("fan"),
  fabricType: text("fabric_type"),
  sizes: text("sizes").array(),
  inStock: boolean("in_stock").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
  discountPercent: integer("discount_percent").notNull().default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("4.5"),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const offersTable = pgTable("offers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  discountPercent: integer("discount_percent").notNull().default(0),
  imageUrl: text("image_url"),
  validUntil: timestamp("valid_until"),
  code: text("code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cartItemsTable = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  quantity: integer("quantity").notNull().default(1),
  size: text("size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wishlistItemsTable = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("pending"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  notes: text("notes"),
  itemsJson: text("items_json").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteSettingsTable = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export const insertOfferSchema = createInsertSchema(offersTable).omit({ id: true, createdAt: true });
export const insertLeagueSchema = createInsertSchema(leaguesTable).omit({ id: true, createdAt: true });

export type League = typeof leaguesTable.$inferSelect;
export type Category = typeof categoriesTable.$inferSelect;
export type Product = typeof productsTable.$inferSelect;
export type Offer = typeof offersTable.$inferSelect;
export type CartItem = typeof cartItemsTable.$inferSelect;
export type WishlistItem = typeof wishlistItemsTable.$inferSelect;
export type Order = typeof ordersTable.$inferSelect;
export type SiteSetting = typeof siteSettingsTable.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertLeague = z.infer<typeof insertLeagueSchema>;
