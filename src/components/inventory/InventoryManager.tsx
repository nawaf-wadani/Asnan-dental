import { useEffect, useMemo, useState } from "react";
import { Search, Minus, Plus, Package, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { inventoryApi, ApiError, type InventoryRow } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { brandFor } from "@/lib/brand";
import { useDarkMode } from "@/lib/useDarkMode";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/ui/toast";
import { GlassCard, Spinner } from "@/components/ui/primitives";

export default function InventoryManager() {
  return (
    <AppShell title="Digital Inventory">
      <InventoryBody />
    </AppShell>
  );
}

function status(row: InventoryRow): "out" | "low" | "ok" {
  if (row.onHand === 0) return "out";
  if (row.onHand <= row.reorderThreshold) return "low";
  return "ok";
}

function InventoryBody() {
  const { user } = useAuth();
  const [dark] = useDarkMode();
  const BRAND = brandFor(dark);
  const toast = useToast();

  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, setPending] = useState<Record<string, boolean>>({});

  useEffect(() => {
    inventoryApi
      .list()
      .then((r) => setRows(r.items))
      .catch((e) => toast(e instanceof ApiError ? e.message : "Could not load inventory", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  const adjust = async (sku: string, patch: { delta?: number; onHand?: number; reorderThreshold?: number }) => {
    setPending((p) => ({ ...p, [sku]: true }));
    try {
      const { item } = await inventoryApi.adjust({ sku, ...patch });
      setRows((rs) => rs.map((r) => (r.sku === sku ? { ...r, onHand: item.onHand, reorderThreshold: item.reorderThreshold } : r)));
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Update failed", "error");
    } finally {
      setPending((p) => ({ ...p, [sku]: false }));
    }
  };

  const filtered = useMemo(() => {
    let list = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || (r.manufacturer ?? "").toLowerCase().includes(q));
    }
    if (lowOnly) list = list.filter((r) => r.onHand <= r.reorderThreshold);
    return list;
  }, [rows, search, lowOnly]);

  const byCat = useMemo(() => {
    const m = new Map<string, InventoryRow[]>();
    for (const r of filtered) {
      if (!m.has(r.categoryLabel)) m.set(r.categoryLabel, []);
      m.get(r.categoryLabel)!.push(r);
    }
    return m;
  }, [filtered]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      low: rows.filter((r) => r.onHand > 0 && r.onHand <= r.reorderThreshold).length,
      out: rows.filter((r) => r.onHand === 0).length,
    }),
    [rows],
  );

  if (loading) return <div className="py-24 flex justify-center"><Spinner label="Loading inventory…" /></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Items", value: stats.total, color: BRAND.ink, bg: BRAND.glass },
          { label: "Low stock", value: stats.low, color: BRAND.warning, bg: BRAND.warningBg },
          { label: "Out", value: stats.out, color: BRAND.danger, bg: BRAND.dangerBg },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg, border: `1px solid ${BRAND.glassBorder}` }}>
            <div className="text-xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-[9px] uppercase tracking-[0.15em] font-bold" style={{ color: s.color }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: BRAND.muted }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inventory…"
          className="w-full h-10 pl-9 pr-4 rounded-xl text-sm outline-none"
          style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}
        />
      </div>

      <div className="flex gap-2">
        {(["all", "low"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setLowOnly(m === "low")}
            className="flex-1 h-8 rounded-lg text-xs font-semibold"
            style={{
              background: (m === "low") === lowOnly ? (m === "low" ? BRAND.warning : BRAND.primary) : "transparent",
              color: (m === "low") === lowOnly ? "#fff" : BRAND.muted,
              border: `1px solid ${BRAND.border}`,
            }}
          >
            {m === "low" ? "Low stock only" : "All items"}
          </button>
        ))}
      </div>

      {[...byCat.entries()].map(([label, items]) => {
        const open = expanded === label || search.trim().length > 0 || lowOnly;
        const lowCount = items.filter((r) => r.onHand <= r.reorderThreshold).length;
        return (
          <GlassCard key={label} BRAND={BRAND} className="overflow-hidden">
            <button onClick={() => setExpanded(open && !search.trim() && !lowOnly ? null : label)} className="w-full px-4 py-3 flex items-center justify-between" style={{ color: BRAND.ink }}>
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", color: BRAND.muted }}>
                  {items.length}
                </span>
                {lowCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold" style={{ background: BRAND.warningBg, color: BRAND.warning }}>
                    {lowCount} low
                  </span>
                )}
              </span>
              {open ? <ChevronUp size={16} style={{ color: BRAND.muted }} /> : <ChevronDown size={16} style={{ color: BRAND.muted }} />}
            </button>
            {open && (
              <div className="px-3 pb-3 space-y-1.5">
                {items.map((r) => {
                  const st = status(r);
                  const dotColor = st === "out" ? BRAND.danger : st === "low" ? BRAND.warning : BRAND.success;
                  return (
                    <div key={r.sku} className="rounded-xl p-3 flex items-center gap-3" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", border: `1px solid ${BRAND.border}` }}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate" style={{ color: BRAND.ink }}>
                          {r.name}
                        </div>
                        <div className="text-[10px]" style={{ color: BRAND.muted }}>
                          {r.manufacturer} · reorder at {r.reorderThreshold}
                          {user?.role === "admin" && (
                            <>
                              {" "}
                              <button
                                className="underline"
                                onClick={() => {
                                  const v = window.prompt(`Reorder threshold for "${r.name}"`, String(r.reorderThreshold));
                                  const n = v == null ? NaN : parseInt(v, 10);
                                  if (Number.isFinite(n) && n >= 0) void adjust(r.sku, { reorderThreshold: n });
                                }}
                              >
                                edit
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          disabled={pending[r.sku]}
                          onClick={() => adjust(r.sku, { delta: -1 })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40"
                          style={{ background: BRAND.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: BRAND.ink }}
                          aria-label="Use one"
                        >
                          <Minus size={13} strokeWidth={2.5} />
                        </button>
                        <button
                          className="w-10 text-center text-sm font-bold"
                          style={{ color: BRAND.ink }}
                          onClick={() => {
                            const v = window.prompt(`Set count for "${r.name}"`, String(r.onHand));
                            const n = v == null ? NaN : parseInt(v, 10);
                            if (Number.isFinite(n) && n >= 0) void adjust(r.sku, { onHand: n });
                          }}
                          title="Tap to set exact count"
                        >
                          {r.onHand}
                        </button>
                        <button
                          disabled={pending[r.sku]}
                          onClick={() => adjust(r.sku, { delta: 1 })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40"
                          style={{ background: `${BRAND.primary}22`, color: BRAND.primary }}
                          aria-label="Add one"
                        >
                          <Plus size={13} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Package size={28} style={{ color: BRAND.muted, margin: "0 auto 8px" }} />
          <p className="text-sm" style={{ color: BRAND.muted }}>
            {lowOnly ? "Nothing is low on stock." : "No items match your search."}
          </p>
        </div>
      )}

      {user?.role === "admin" && (
        <p className="text-[11px] text-center flex items-center justify-center gap-1.5" style={{ color: BRAND.muted }}>
          <AlertTriangle size={11} /> Add or retire catalog items in the Admin → Catalog tab.
        </p>
      )}
    </div>
  );
}
