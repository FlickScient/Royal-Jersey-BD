import { Router } from "express";
import { getAuth } from "@clerk/express";
import pg from "pg";

const router = Router();

function getAdminIds(): string[] {
  return (process.env.ADMIN_USER_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
}

const requireAdmin = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const adminIds = getAdminIds();
  if (adminIds.length === 0 || adminIds.includes(userId)) return next();
  return res.status(403).json({ error: "Forbidden" });
};

const TABLE_ORDER = [
  "leagues",
  "categories",
  "products",
  "offers",
  "orders",
  "cart_items",
  "wishlist_items",
  "site_settings",
  "site_visits",
];

async function tableExists(pool: pg.Pool, tableName: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
    [tableName],
  );
  return rows.length > 0;
}

async function copyTable(
  srcPool: pg.Pool,
  dstPool: pg.Pool,
  table: string,
): Promise<{ copied: number; skipped: boolean; error?: string }> {
  const exists = await tableExists(srcPool, table);
  if (!exists) return { copied: 0, skipped: true };

  const { rows } = await srcPool.query(`SELECT * FROM ${table} ORDER BY 1`);
  if (rows.length === 0) return { copied: 0, skipped: false };

  const columns = Object.keys(rows[0]);
  const colList = columns.map((c) => `"${c}"`).join(", ");

  const dstClient = await dstPool.connect();
  try {
    await dstClient.query("BEGIN");

    if (table === "site_settings") {
      await dstClient.query(`DELETE FROM site_settings`);
    } else {
      await dstClient.query(`TRUNCATE "${table}" RESTART IDENTITY CASCADE`);
    }

    for (const row of rows) {
      const vals = columns.map((_, i) => `$${i + 1}`).join(", ");
      const values = columns.map((c) => row[c]);
      await dstClient.query(
        `INSERT INTO "${table}" (${colList}) VALUES (${vals}) ON CONFLICT DO NOTHING`,
        values,
      );
    }

    if (table !== "site_settings") {
      const maxId = rows.reduce((m: number, r: any) => (r.id > m ? r.id : m), 0);
      if (maxId > 0) {
        const seqName = `${table}_id_seq`;
        const seqExists = await dstClient.query(
          `SELECT 1 FROM information_schema.sequences WHERE sequence_name = $1`,
          [seqName],
        );
        if (seqExists.rows.length > 0) {
          await dstClient.query(`SELECT setval('${seqName}', $1, true)`, [maxId]);
        }
      }
    }

    await dstClient.query("COMMIT");
    return { copied: rows.length, skipped: false };
  } catch (err: any) {
    await dstClient.query("ROLLBACK");
    return { copied: 0, skipped: false, error: err.message };
  } finally {
    dstClient.release();
  }
}

router.post("/admin/migrate", requireAdmin, async (req: any, res) => {
  const { sourceUrl } = req.body;
  if (!sourceUrl || typeof sourceUrl !== "string") {
    return res.status(400).json({ error: "sourceUrl is required" });
  }
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "No destination DATABASE_URL configured" });
  }

  const needsSsl =
    sourceUrl.includes("neon.tech") ||
    sourceUrl.includes("sslmode=require") ||
    sourceUrl.includes("render.com") ||
    sourceUrl.includes("supabase");

  const srcPool = new pg.Pool({
    connectionString: sourceUrl,
    max: 2,
    connectionTimeoutMillis: 10000,
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
  });

  const dstPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 10000,
    ssl:
      process.env.DATABASE_URL.includes("neon.tech") ||
      process.env.DATABASE_URL.includes("sslmode=require")
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    await srcPool.query("SELECT 1");
  } catch (err: any) {
    await srcPool.end();
    await dstPool.end();
    return res
      .status(400)
      .json({ error: "Cannot connect to source database: " + err.message });
  }

  const results: Record<string, { copied: number; skipped: boolean; error?: string }> = {};
  for (const table of TABLE_ORDER) {
    results[table] = await copyTable(srcPool, dstPool, table);
  }

  await srcPool.end();
  await dstPool.end();

  const totalCopied = Object.values(results).reduce((s, r) => s + r.copied, 0);
  return res.json({ success: true, totalCopied, results });
});

export default router;
