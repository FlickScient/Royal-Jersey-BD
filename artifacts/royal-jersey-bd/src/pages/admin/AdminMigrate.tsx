import { useState } from "react";
import { Database, AlertTriangle, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TABLE_LABELS: Record<string, string> = {
  leagues: "Leagues",
  categories: "Categories",
  products: "Products",
  offers: "Offers",
  orders: "Orders",
  cart_items: "Cart Items",
  wishlist_items: "Wishlist Items",
  site_settings: "Site Settings",
  site_visits: "Site Visits",
};

type TableResult = { copied: number; skipped: boolean; error?: string };
type MigrateResult = { success: boolean; totalCopied: number; results: Record<string, TableResult> };

export default function AdminMigrate() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MigrateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMigrate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Migration failed");
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Database className="w-7 h-7 text-[#c9a84c]" />
        <div>
          <h1 className="text-2xl font-bold text-white">Database Migration</h1>
          <p className="text-gray-400 text-sm">Copy all data from your old database into this one</p>
        </div>
      </div>

      {!result && (
        <div className="bg-[#1a1a1a] border border-yellow-600/40 rounded-xl p-5 space-y-5">
          <div className="flex gap-3 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200 space-y-1">
              <p className="font-semibold">This will replace all current data</p>
              <p className="text-yellow-300/70">All products, orders, settings, and other data in the current database will be overwritten with data from the source database.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Source Database URL (your old Render / Neon database)</Label>
            <Input
              type="password"
              placeholder="postgres://user:password@host/dbname"
              value={sourceUrl}
              onChange={(e) => { setSourceUrl(e.target.value); setConfirmed(false); }}
              className="bg-[#111] border-gray-700 text-white font-mono text-sm"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">Paste the full PostgreSQL connection string from your old host</p>
          </div>

          {sourceUrl.length > 10 && !confirmed && (
            <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="text-sm text-red-200 font-medium">Are you sure? This cannot be undone.</p>
                <p className="text-xs text-red-300/70">Existing data in the current database will be deleted and replaced.</p>
                <Button
                  onClick={() => setConfirmed(true)}
                  variant="destructive"
                  size="sm"
                  className="mt-1"
                >
                  Yes, I understand — proceed
                </Button>
              </div>
            </div>
          )}

          {confirmed && (
            <Button
              onClick={handleMigrate}
              disabled={loading || !sourceUrl}
              className="w-full bg-[#c9a84c] hover:bg-[#b8973b] text-black font-bold h-11"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Migrating data… this may take a minute
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Start Migration
                </>
              )}
            </Button>
          )}

          {error && (
            <div className="flex gap-3 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
              <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="bg-[#1a1a1a] border border-green-600/40 rounded-xl p-5 space-y-5">
          <div className="flex gap-3 items-center">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-white font-semibold">Migration complete</p>
              <p className="text-gray-400 text-sm">{result.totalCopied.toLocaleString()} total rows copied</p>
            </div>
          </div>

          <div className="divide-y divide-gray-800 rounded-lg border border-gray-800 overflow-hidden">
            {Object.entries(result.results).map(([table, r]) => (
              <div key={table} className="flex items-center justify-between px-4 py-3 bg-[#111]">
                <span className="text-sm text-gray-300">{TABLE_LABELS[table] ?? table}</span>
                {r.error ? (
                  <span className="text-xs text-red-400 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> {r.error}
                  </span>
                ) : r.skipped ? (
                  <span className="text-xs text-gray-500">table not found in source</span>
                ) : (
                  <span className="text-xs text-green-400 font-medium">{r.copied} rows copied</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => { setResult(null); setConfirmed(false); setSourceUrl(""); }}
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300"
            >
              Migrate again
            </Button>
            <a href="/admin/products">
              <Button size="sm" className="bg-[#c9a84c] hover:bg-[#b8973b] text-black font-bold">
                View Products
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
