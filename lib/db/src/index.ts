import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leagues (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      country TEXT,
      logo_url TEXT,
      is_international BOOLEAN NOT NULL DEFAULT false,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      image_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      original_price DECIMAL(10,2),
      image_url TEXT NOT NULL,
      images TEXT[],
      category_id INTEGER REFERENCES categories(id),
      league_id INTEGER REFERENCES leagues(id),
      team_name TEXT,
      edition TEXT NOT NULL DEFAULT 'fan',
      fabric_type TEXT,
      sizes TEXT[],
      in_stock BOOLEAN NOT NULL DEFAULT true,
      stock_count INTEGER,
      is_featured BOOLEAN NOT NULL DEFAULT false,
      is_new BOOLEAN NOT NULL DEFAULT false,
      discount_percent INTEGER NOT NULL DEFAULT 0,
      rating DECIMAL(3,2) DEFAULT '4.5',
      review_count INTEGER NOT NULL DEFAULT 0,
      tags TEXT[],
      variant_prices TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS offers (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      discount_percent INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      valid_until TIMESTAMP,
      code TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      total DECIMAL(10,2) NOT NULL,
      payment_method TEXT,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      notes TEXT,
      items_json TEXT NOT NULL DEFAULT '[]',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      session_id TEXT NOT NULL,
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL DEFAULT 1,
      size TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id SERIAL PRIMARY KEY,
      session_id TEXT NOT NULL,
      product_id INTEGER NOT NULL REFERENCES products(id),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_count INTEGER;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[];
    ALTER TABLE products ADD COLUMN IF NOT EXISTS league_id INTEGER REFERENCES leagues(id);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS team_name TEXT;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[];
    ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_prices TEXT;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS items_json TEXT NOT NULL DEFAULT '[]';
  `);
}

export * from "./schema";
