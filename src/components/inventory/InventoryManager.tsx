import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  Minus,
  Plus,
  Package,
  ChevronDown,
  ChevronUp,
  Archive,
  Trash2,
  RotateCcw,
  ShoppingCart,
  ArrowRight,
  X,
} from "lucide-react";
import { inventoryApi, catalogApi, recentApi, ApiError, type InventoryRow, type RecentItem } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { brandFor, type BrandPalette } from "@/lib/brand";
import { useDarkMode } from "@/lib/useDarkMode";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/ui/toast";
import { ItemPhoto } from "@/components/ui/ItemPhoto";
import { GlassCard, QtyControl, Spinner } from "@/components/ui/primitives";

export default function InventoryManager() {
  return (
    <AppShell title="Inventory" wide>
      <InventoryBody />
    </AppShell>
  );
}

type StatusFilter = "all" | "low" | "out" | "need" | "arch";

/** An order placed in the last this-many days counts as "recently ordered". */
const RECENT_DAYS = 14;

function stockStatus(row: InventoryRow): "out" | "low" | "ok" {
  if (row.onHand === 0) return "out";
  if (row.onHand <= row.reorderThreshold) return "low";
  return "ok";
}

/** Everything a row needs to act on an item. Shared by the table row and the phone card. */
interface RowCtx {
  BRAND: BrandPalette;
  isAdmin: boolean;
  cart: Record<string, number>;
  recent: Record<string, RecentItem>;
  pending: Record<string, boolean>;
  adjust: (sku: string, patch: { delta?: number; onHand?: number; reorderThreshold?: number }) => Promise<void>;
  setCartQty: (sku: string, qty: number) => void;
  archiveItem: (r: InventoryRow) => void;
  restoreItem: (r: InventoryRow) => Promise<void>;
  removeItem: (r: InventoryRow) => void;
  editThreshold: (r: InventoryRow) => void;
  editCount: (r: InventoryRow) => void;
}

function StatusChip({ st, archived, BRAND }: { st: "out" | "low" | "ok"; archived: boolean; BRAND: BrandPalette }) {
  const map = {
    out: { label: "Out of stock", bg: BRAND.dangerBg, fg: BRAND.danger },
    low: { label: "Running low", bg: BRAND.warningBg, fg: BRAND.warning },
    ok: { label: "In stock", bg: BRAND.successBg, fg: BRAND.success },
  } as const;
  const c = archived ? { label: "Archived", bg: BRAND.border, fg: BRAND.muted } : map[st];
  return (
    <span className="inline-flex items-center h-7 px-3 rounded-full text-xs font-semibold whitespace-nowrap" style={{ background: c.bg, color: c.fg }}>
      {c.label}
    </span>
  );
}

/** Tells you whether this item is already in your order list or was ordered recently. */
function OrderBadges({ r, ctx }: { r: InventoryRow; ctx: RowCtx }) {
  const { BRAND } = ctx;
  const inCart = ctx.cart[r.sku] ?? 0;
  const rec = ctx.recent[r.sku];
  if (r.active === false || (!inCart && !rec)) return null;
  const chip = "inline-flex items-center h-7 px-3 rounded-full text-xs font-semibold whitespace-nowrap";
  return (
    <>
      {inCart > 0 && (
        <span className={chip} style={{ background: `${BRAND.accent}40`, color: BRAND.accentDeep }}>
          In your order · {inCart}
        </span>
      )}
      {rec && (
        <span
          className={chip}
          style={{ background: BRAND.butter, color: "#4A3F00" }}
          title={`Order #${rec.orderId} by ${rec.assistantName}, ${rec.qty} ordered`}
        >
          Ordered {timeAgo(rec.createdAt)} · {rec.qty}
        </span>
      )}
    </>
  );
}

function StockStepper({ r, ctx }: { r: InventoryRow; ctx: RowCtx }) {
  const { BRAND } = ctx;
  return (
    <span className="inline-flex items-center rounded-full" style={{ border: `1px solid ${BRAND.borderSolid}`, background: BRAND.surfaceSolid }}>
      <button
        disabled={ctx.pending[r.sku]}
        onClick={() => void ctx.adjust(r.sku, { delta: -1 })}
        className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40"
        style={{ color: BRAND.primaryDark }}
        aria-label={`Use one ${r.name}`}
      >
        <Minus size={15} strokeWidth={2.5} />
      </button>
      <button className="min-w-[34px] text-center text-base font-semibold" style={{ color: BRAND.ink }} onClick={() => ctx.editCount(r)} title="Click to type the exact count">
        {r.onHand}
      </button>
      <button
        disabled={ctx.pending[r.sku]}
        onClick={() => void ctx.adjust(r.sku, { delta: 1 })}
        className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40"
        style={{ color: BRAND.primaryDark }}
        aria-label={`Add one to stock ${r.name}`}
      >
        <Plus size={15} strokeWidth={2.5} />
      </button>
    </span>
  );
}

function OrderControl({ r, ctx, needs, showLabel = true }: { r: InventoryRow; ctx: RowCtx; needs: boolean; showLabel?: boolean }) {
  const { BRAND } = ctx;
  const inCart = ctx.cart[r.sku] ?? 0;
  if (inCart > 0) {
    return (
      <div className="flex items-center gap-2" title="In your order">
        <QtyControl BRAND={BRAND} qty={inCart} onChange={(q) => ctx.setCartQty(r.sku, q)} compact />
        {showLabel && (
          <span className="text-xs font-medium" style={{ color: BRAND.accentDeep }}>
            In your order
          </span>
        )}
      </div>
    );
  }
  return (
    <button
      onClick={() => ctx.setCartQty(r.sku, 1)}
      className="h-10 px-4 rounded-full text-[13px] font-semibold flex items-center gap-1.5 transition-apple hover-scale whitespace-nowrap"
      style={{
        background: needs ? BRAND.primaryDark : "transparent",
        color: needs ? "#fff" : BRAND.primaryDark,
        border: `1.5px solid ${BRAND.primaryDark}`,
      }}
    >
      <ShoppingCart size={14} /> Add to order
    </button>
  );
}

function AdminActions({ r, ctx }: { r: InventoryRow; ctx: RowCtx }) {
  const { BRAND } = ctx;
  const archived = r.active === false;
  if (!ctx.isAdmin) return null;
  return (
    <div className="flex items-center justify-end gap-0.5">
      {archived ? (
        <button
          disabled={ctx.pending[r.sku]}
          onClick={() => void ctx.restoreItem(r)}
          className="h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 disabled:opacity-40"
          style={{ background: `${BRAND.primary}28`, color: BRAND.primaryDark }}
        >
          <RotateCcw size={12} /> Restore
        </button>
      ) : (
        <button
          disabled={ctx.pending[r.sku]}
          onClick={() => ctx.archiveItem(r)}
          className="w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-40"
          style={{ color: BRAND.muted }}
          aria-label={`Archive ${r.name}`}
          title="Archive (can be restored)"
        >
          <Archive size={16} />
        </button>
      )}
      <button
        disabled={ctx.pending[r.sku]}
        onClick={() => ctx.removeItem(r)}
        className="w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-40"
        style={{ color: BRAND.danger }}
        aria-label={`Delete ${r.name} permanently`}
        title="Delete permanently"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

/** Wide-screen table row. */
function TableRow({ r, ctx }: { r: InventoryRow; ctx: RowCtx }) {
  const { BRAND } = ctx;
  const archived = r.active === false;
  const st = stockStatus(r);
  const needs = !archived && st !== "ok";
  return (
    <tr style={{ background: !archived && st === "out" ? BRAND.dangerBg : undefined, opacity: archived ? 0.6 : 1 }}>
      <td className="px-4 py-3" style={{ borderBottom: `1px solid ${BRAND.border}` }}>
        <div className="flex items-start gap-3 min-w-0">
          <ItemPhoto sku={r.sku} photoUrl={r.photoUrl} size={52} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium leading-snug break-words" style={{ color: BRAND.ink }}>
              {r.name}
            </div>
            <div className="mt-1.5 flex items-center gap-x-2 gap-y-1 flex-wrap">
              <StatusChip st={st} archived={archived} BRAND={BRAND} />
              <OrderBadges r={r} ctx={ctx} />
              <span className="text-xs" style={{ color: BRAND.muted }}>
                {r.manufacturer ? `${r.manufacturer} · ` : ""}
                {r.categoryLabel}
              </span>
            </div>
            <div className="text-xs mt-1" style={{ color: BRAND.muted }}>
              Reorder at {r.reorderThreshold}
              {ctx.isAdmin && !archived && (
                <button className="ml-1.5 underline" style={{ color: BRAND.primaryDark }} onClick={() => ctx.editThreshold(r)}>
                  edit
                </button>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 align-top" style={{ borderBottom: `1px solid ${BRAND.border}` }}>
        {archived ? <span className="text-base">{r.onHand}</span> : <StockStepper r={r} ctx={ctx} />}
      </td>
      <td className="px-3 py-3 align-top" style={{ borderBottom: `1px solid ${BRAND.border}` }}>
        {!archived && <OrderControl r={r} ctx={ctx} needs={needs} showLabel={false} />}
      </td>
      <td className="px-3 py-2.5" style={{ borderBottom: `1px solid ${BRAND.border}` }}>
        <AdminActions r={r} ctx={ctx} />
      </td>
    </tr>
  );
}

/** Phone / small tablet card. */
function MobileCard({ r, ctx }: { r: InventoryRow; ctx: RowCtx }) {
  const { BRAND } = ctx;
  const archived = r.active === false;
  const st = stockStatus(r);
  const needs = !archived && st !== "ok";
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: BRAND.surfaceSolid,
        border: `1px solid ${needs ? (st === "out" ? BRAND.danger : BRAND.warning) + "55" : BRAND.border}`,
        opacity: archived ? 0.6 : 1,
      }}
    >
      <div className="flex items-center gap-3">
        <ItemPhoto sku={r.sku} photoUrl={r.photoUrl} size={52} />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold leading-snug" style={{ color: BRAND.ink }}>
            {r.name}
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <StatusChip st={st} archived={archived} BRAND={BRAND} />
            <OrderBadges r={r} ctx={ctx} />
            <span className="text-[11px]" style={{ color: BRAND.muted }}>
              {r.manufacturer ? `${r.manufacturer} · ` : ""}reorder at {r.reorderThreshold}
              {ctx.isAdmin && !archived && (
                <>
                  {" "}
                  <button className="underline" onClick={() => ctx.editThreshold(r)}>
                    edit
                  </button>
                </>
              )}
            </span>
          </div>
        </div>
        {!archived && <StockStepper r={r} ctx={ctx} />}
      </div>

      <div className="flex items-center justify-between gap-2 mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${BRAND.border}` }}>
        {!archived ? <OrderControl r={r} ctx={ctx} needs={needs} /> : <span />}
        <AdminActions r={r} ctx={ctx} />
      </div>
    </div>
  );
}

function InventoryBody() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [dark] = useDarkMode();
  const BRAND = brandFor(dark);
  const toast = useToast();
  const { cart, lines: cartLines, units: cartUnits, setQty: setCartQty, addMany, clear: clearCart } = useCart();

  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [category, setCategory] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [recent, setRecent] = useState<Record<string, RecentItem>>({});

  useEffect(() => {
    // Which items were ordered lately. Not essential, so a failure just hides the badges.
    recentApi
      .items(RECENT_DAYS)
      .then((r) => setRecent(Object.fromEntries(r.items.map((i) => [i.sku, i]))))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    inventoryApi
      .list(isAdmin)
      .then((r) => setRows(r.items))
      .catch((e) => toast(e instanceof ApiError ? e.message : "Could not load inventory", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const withPending = useCallback(
    async (sku: string, fn: () => Promise<void>) => {
      setPending((p) => ({ ...p, [sku]: true }));
      try {
        await fn();
      } catch (e) {
        toast(e instanceof ApiError ? e.message : "Update failed", "error");
      } finally {
        setPending((p) => ({ ...p, [sku]: false }));
      }
    },
    [toast],
  );

  const adjust = useCallback(
    (sku: string, patch: { delta?: number; onHand?: number; reorderThreshold?: number }) =>
      withPending(sku, async () => {
        const { item } = await inventoryApi.adjust({ sku, ...patch });
        setRows((rs) => rs.map((r) => (r.sku === sku ? { ...r, onHand: item.onHand, reorderThreshold: item.reorderThreshold } : r)));
      }),
    [withPending],
  );

  const ctx: RowCtx = {
    BRAND,
    isAdmin,
    cart,
    recent,
    pending,
    adjust,
    setCartQty,
    archiveItem: (r) => {
      if (!window.confirm(`Archive "${r.name}"?\n\nIt is removed from ordering and this list, but its history is kept. You can restore it from the Archived view.`)) return;
      void withPending(r.sku, async () => {
        await catalogApi.archive(r.sku);
        setCartQty(r.sku, 0);
        setRows((rs) => rs.map((x) => (x.sku === r.sku ? { ...x, active: false } : x)));
        toast(`"${r.name}" archived`, "success");
      });
    },
    restoreItem: (r) =>
      withPending(r.sku, async () => {
        await catalogApi.restore(r.sku);
        setRows((rs) => rs.map((x) => (x.sku === r.sku ? { ...x, active: true } : x)));
        toast(`"${r.name}" restored`, "success");
      }),
    removeItem: (r) => {
      if (!window.confirm(`Permanently delete "${r.name}"?\n\nThis cannot be undone. Past orders that included it are not affected. If you might want it back, archive it instead.`)) return;
      void withPending(r.sku, async () => {
        await catalogApi.remove(r.sku);
        setCartQty(r.sku, 0);
        setRows((rs) => rs.filter((x) => x.sku !== r.sku));
        toast(`"${r.name}" deleted`, "success");
      });
    },
    editThreshold: (r) => {
      const v = window.prompt(`Reorder when stock is at or below (for "${r.name}")`, String(r.reorderThreshold));
      const n = v == null ? NaN : parseInt(v, 10);
      if (Number.isFinite(n) && n >= 0) void adjust(r.sku, { reorderThreshold: n });
    },
    editCount: (r) => {
      const v = window.prompt(`How many "${r.name}" are in stock?`, String(r.onHand));
      const n = v == null ? NaN : parseInt(v, 10);
      if (Number.isFinite(n) && n >= 0) void adjust(r.sku, { onHand: n });
    },
  };

  const live = useMemo(() => rows.filter((r) => r.active !== false), [rows]);
  const archivedCount = rows.length - live.length;

  /** Low or out of stock, and not in the order list and not ordered recently: still needs ordering. */
  const needsOrdering = useCallback((r: InventoryRow) => stockStatus(r) !== "ok" && !cart[r.sku] && !recent[r.sku], [cart, recent]);

  const counts = useMemo(
    () => ({
      all: live.length,
      low: live.filter((r) => stockStatus(r) === "low").length,
      out: live.filter((r) => stockStatus(r) === "out").length,
      need: live.filter(needsOrdering).length,
      arch: archivedCount,
    }),
    [live, archivedCount, needsOrdering],
  );

  const categories = useMemo(() => {
    const m = new Map<string, { n: number; low: number }>();
    for (const r of live) {
      const c = m.get(r.categoryLabel) ?? { n: 0, low: 0 };
      c.n++;
      if (stockStatus(r) !== "ok") c.low++;
      m.set(r.categoryLabel, c);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [live]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const archived = r.active === false;
      if (filter === "arch" ? !archived : archived) return false;
      if (filter === "low" && stockStatus(r) !== "low") return false;
      if (filter === "out" && stockStatus(r) !== "out") return false;
      if (filter === "need" && !needsOrdering(r)) return false;
      if (category && r.categoryLabel !== category) return false;
      if (q && !(r.name.toLowerCase().includes(q) || (r.manufacturer ?? "").toLowerCase().includes(q) || r.sku.includes(q))) return false;
      return true;
    });
  }, [rows, search, filter, category, needsOrdering]);

  const byCat = useMemo(() => {
    const m = new Map<string, InventoryRow[]>();
    for (const r of filtered) {
      if (!m.has(r.categoryLabel)) m.set(r.categoryLabel, []);
      m.get(r.categoryLabel)!.push(r);
    }
    return m;
  }, [filtered]);

  const lowSkusNotInOrder = useMemo(() => live.filter(needsOrdering).map((r) => r.sku), [live, needsOrdering]);
  const lowAlreadyOrdered = useMemo(() => live.filter((r) => stockStatus(r) !== "ok" && !cart[r.sku] && recent[r.sku]).length, [live, cart, recent]);

  const bySku = useMemo(() => new Map(rows.map((r) => [r.sku, r])), [rows]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner label="Loading inventory…" />
      </div>
    );
  }

  const filterOptions: { id: StatusFilter; label: string; n: number; tone?: "warn" | "danger" }[] = [
    { id: "all", label: "All items", n: counts.all },
    { id: "low", label: "Running low", n: counts.low, tone: "warn" },
    { id: "out", label: "Out of stock", n: counts.out, tone: "danger" },
    { id: "need", label: "Needs ordering", n: counts.need, tone: "warn" },
    ...(isAdmin ? [{ id: "arch" as const, label: "Archived", n: counts.arch }] : []),
  ];

  const navBtn = (on: boolean) =>
    ({
      background: on ? `${BRAND.primary}26` : "transparent",
      color: on ? BRAND.primaryDark : BRAND.ink,
      fontWeight: on ? 600 : 500,
    }) as const;

  const countBadge = (n: number, tone?: "warn" | "danger") =>
    tone && n > 0 ? (
      <span className="min-w-[26px] h-6 px-2 rounded-full text-xs font-semibold inline-flex items-center justify-center" style={{ background: tone === "warn" ? BRAND.warningBg : BRAND.dangerBg, color: tone === "warn" ? BRAND.warning : BRAND.danger }}>
        {n}
      </span>
    ) : (
      <span className="text-[13px]" style={{ color: BRAND.muted }}>
        {n}
      </span>
    );

  return (
    <div className="space-y-4 xl:space-y-0 xl:grid xl:grid-cols-[208px_minmax(0,1fr)_300px] 2xl:grid-cols-[232px_minmax(0,1fr)_340px] xl:gap-6 xl:items-start">
      {/* ---------- Left: filters (wide screens) ---------- */}
      <aside className="hidden xl:block sticky top-[84px] space-y-6" aria-label="Filters">
        <nav>
          <h2 className="text-[13px] font-medium mb-1.5 px-3" style={{ color: BRAND.muted }}>
            Show
          </h2>
          {filterOptions.map((o) => (
            <button key={o.id} onClick={() => setFilter(o.id)} className="w-full min-h-[42px] px-3 rounded-[10px] flex items-center justify-between text-sm text-left" style={navBtn(filter === o.id)}>
              {o.label}
              {countBadge(o.n, o.tone)}
            </button>
          ))}
        </nav>
        <nav>
          <h2 className="text-[13px] font-medium mb-1.5 px-3" style={{ color: BRAND.muted }}>
            Category
          </h2>
          <button onClick={() => setCategory("")} className="w-full min-h-[42px] px-3 rounded-[10px] flex items-center justify-between text-sm text-left" style={navBtn(category === "")}>
            All categories
            <span className="text-[13px]" style={{ color: BRAND.muted }}>
              {live.length}
            </span>
          </button>
          {categories.map(([label, c]) => (
            <button key={label} onClick={() => setCategory(label)} className="w-full min-h-[42px] px-3 rounded-[10px] flex items-center justify-between gap-2 text-sm text-left" style={navBtn(category === label)}>
              <span className="flex items-center min-w-0">
                <span className="truncate">{label}</span>
                {c.low > 0 && <i className="ml-1.5 w-[7px] h-[7px] rounded-full flex-none" style={{ background: BRAND.warning }} title="Something here is running low" />}
              </span>
              <span className="text-[13px]" style={{ color: BRAND.muted }}>
                {c.n}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ---------- Middle: stock ---------- */}
      <section className="space-y-4 min-w-0" aria-label="Stock">
        <div className="grid grid-cols-3 gap-2 xl:hidden">
          {[
            { label: "Items", value: counts.all, color: BRAND.ink, bg: BRAND.glass },
            { label: "Running low", value: counts.low, color: BRAND.warning, bg: BRAND.warningBg },
            { label: "Out of stock", value: counts.out, color: BRAND.danger, bg: BRAND.dangerBg },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg, border: `1px solid ${BRAND.glassBorder}` }}>
              <div className="text-2xl font-semibold" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-xs font-medium" style={{ color: s.color }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          <label className="relative flex-1 basis-[260px] block">
            <span className="sr-only">Search inventory</span>
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: BRAND.muted }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, maker or item number"
              className="w-full h-12 pl-10 pr-4 rounded-xl text-sm outline-none"
              style={{ background: BRAND.surfaceSolid, border: `1px solid ${BRAND.borderSolid}`, color: BRAND.ink }}
            />
          </label>
          {lowSkusNotInOrder.length > 0 && (
            <button
              onClick={() => {
                addMany(lowSkusNotInOrder);
                toast(`${lowSkusNotInOrder.length} low-stock item${lowSkusNotInOrder.length === 1 ? "" : "s"} added to your order`, "success");
              }}
              className="h-12 px-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-apple hover-scale"
              style={{ background: BRAND.butter, color: "#4A3F00", border: "1px solid rgba(74,63,0,0.18)" }}
            >
              <ShoppingCart size={16} />
              Add all {lowSkusNotInOrder.length} low-stock item{lowSkusNotInOrder.length === 1 ? "" : "s"} to order
            </button>
          )}
          {lowAlreadyOrdered > 0 && (
            <p className="basis-full text-xs" style={{ color: BRAND.muted }}>
              {lowAlreadyOrdered} low or out-of-stock item{lowAlreadyOrdered === 1 ? " was" : "s were"} ordered in the last {RECENT_DAYS} days and {lowAlreadyOrdered === 1 ? "is" : "are"} left out of "Add all". Add them one by one if you need more.
            </p>
          )}
        </div>

        {/* Filter chips for phones, tablets and smaller laptops */}
        <div className="flex gap-2 overflow-x-auto xl:hidden pb-1">
          {filterOptions.map((o) => (
            <button
              key={o.id}
              onClick={() => setFilter(o.id)}
              className="h-10 px-4 rounded-full text-sm font-medium flex-shrink-0"
              style={{
                background: filter === o.id ? BRAND.primaryDark : BRAND.surfaceSolid,
                color: filter === o.id ? "#fff" : BRAND.ink,
                border: `1px solid ${filter === o.id ? BRAND.primaryDark : BRAND.borderSolid}`,
              }}
            >
              {o.label} · {o.n}
            </button>
          ))}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Category"
            className="h-10 px-3 rounded-full text-sm flex-shrink-0 outline-none"
            style={{ background: BRAND.surfaceSolid, color: BRAND.ink, border: `1px solid ${BRAND.borderSolid}` }}
          >
            <option value="">All categories</option>
            {categories.map(([label]) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Wide screens: table */}
        <div className="hidden lg:block rounded-2xl overflow-hidden" style={{ background: BRAND.surfaceSolid, border: `1px solid ${BRAND.borderSolid}`, boxShadow: BRAND.cardShadow }}>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col />
                <col style={{ width: 150 }} />
                <col style={{ width: 156 }} />
                <col style={{ width: 96 }} />
              </colgroup>
              <thead>
                <tr>
                  {["Item", "In stock", "Order", ""].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-[13px] font-medium" style={{ color: BRAND.muted, borderBottom: `1px solid ${BRAND.borderSolid}` }}>
                      {h || <span className="sr-only">Admin actions</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <TableRow key={r.sku} r={r} ctx={ctx} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 text-[13px]" style={{ color: BRAND.muted, borderTop: `1px solid ${BRAND.borderSolid}` }}>
            Showing {filtered.length} of {filter === "arch" ? archivedCount : live.length} items
          </div>
        </div>

        {/* Phones and small tablets: cards grouped by category */}
        <div className="space-y-3 lg:hidden">
          {[...byCat.entries()].map(([label, items]) => {
            const open = expanded === label || search.trim().length > 0 || filter !== "all" || category !== "";
            const lowCount = items.filter((r) => r.active !== false && stockStatus(r) !== "ok").length;
            return (
              <GlassCard key={label} BRAND={BRAND} className="overflow-hidden">
                <button onClick={() => setExpanded(expanded === label ? null : label)} className="w-full px-4 py-3.5 flex items-center justify-between" style={{ color: BRAND.ink }}>
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: BRAND.border, color: BRAND.muted }}>
                      {items.length}
                    </span>
                    {lowCount > 0 && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded-md font-semibold" style={{ background: BRAND.warningBg, color: BRAND.warning }}>
                        {lowCount} low
                      </span>
                    )}
                  </span>
                  {open ? <ChevronUp size={16} style={{ color: BRAND.muted }} /> : <ChevronDown size={16} style={{ color: BRAND.muted }} />}
                </button>
                {open && (
                  <div className="px-3 pb-3 space-y-2">
                    {items.map((r) => (
                      <MobileCard key={r.sku} r={r} ctx={ctx} />
                    ))}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Package size={28} style={{ color: BRAND.muted, margin: "0 auto 8px" }} />
            <p className="text-sm" style={{ color: BRAND.muted }}>
              {filter === "low" || filter === "out" ? "Nothing here right now." : filter === "arch" ? "No archived items." : "No items match your search."}
            </p>
          </div>
        )}

        {isAdmin && (
          <p className="text-xs text-center leading-relaxed" style={{ color: BRAND.muted }}>
            Archive hides an item but keeps it, and you can restore it from the Archived view. Delete removes it for good. Add new items under Admin → Catalog.
          </p>
        )}
      </section>

      {/* ---------- Right: order list (wide screens) ---------- */}
      <aside className="hidden xl:block sticky top-[84px]" aria-label="Order list">
        <GlassCard BRAND={BRAND}>
          <div className="flex items-center justify-between px-[18px] pt-4 pb-2.5">
            <h2 className="text-base font-semibold">Order list</h2>
            <span className="text-[13px] font-semibold rounded-full px-2.5 py-0.5" style={{ background: `${BRAND.primary}26`, color: BRAND.primaryDark }}>
              {cartLines}
            </span>
          </div>
          {cartLines === 0 ? (
            <p className="px-[18px] pb-5 text-sm" style={{ color: BRAND.muted }}>
              Nothing here yet. Add items that are running low and they wait here until you place the order.
            </p>
          ) : (
            <ul className="px-2 max-h-[46vh] overflow-y-auto">
              {Object.entries(cart).map(([sku, qty]) => {
                const r = bySku.get(sku);
                return (
                  <li key={sku} className="flex items-center gap-2.5 p-2 rounded-xl">
                    <ItemPhoto sku={sku} photoUrl={r?.photoUrl} size={40} />
                    <span className="flex-1 min-w-0 text-[13.5px] font-medium leading-snug line-clamp-2" title={r?.name ?? sku}>
                      {r?.name ?? sku}
                    </span>
                    <QtyControl BRAND={BRAND} qty={qty} onChange={(q) => setCartQty(sku, q)} compact />
                    <button onClick={() => setCartQty(sku, 0)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: BRAND.muted }} aria-label={`Remove ${r?.name ?? sku} from the list`}>
                      <X size={15} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {cartLines > 0 && (
            <div className="grid gap-2.5 px-[18px] pt-3.5 pb-[18px] mt-2" style={{ borderTop: `1px solid ${BRAND.borderSolid}` }}>
              <div className="text-sm" style={{ color: BRAND.muted }}>
                <b style={{ color: BRAND.ink }}>{cartLines}</b> item{cartLines === 1 ? "" : "s"}, <b style={{ color: BRAND.ink }}>{cartUnits}</b> unit{cartUnits === 1 ? "" : "s"}
              </div>
              <Link to="/" className="h-12 rounded-xl text-[15px] font-semibold text-white flex items-center justify-center gap-2 transition-apple hover-scale" style={{ background: BRAND.primaryDark }}>
                Go to order <ArrowRight size={17} />
              </Link>
              <button
                onClick={() => {
                  clearCart();
                  toast("Order list cleared", "info");
                }}
                className="text-[13px] underline justify-self-center"
                style={{ color: BRAND.primaryDark }}
              >
                Clear list
              </button>
            </div>
          )}
        </GlassCard>
      </aside>

      {/* ---------- Bottom bar (phones, tablets, smaller laptops) ---------- */}
      {cartLines > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 pt-3 xl:hidden" style={{ background: `linear-gradient(to top, ${BRAND.paper} 65%, transparent)` }}>
          <div className="max-w-3xl mx-auto flex gap-2">
            <button
              onClick={() => {
                clearCart();
                toast("Order list cleared", "info");
              }}
              className="h-14 px-5 rounded-2xl text-sm font-semibold"
              style={{ background: BRAND.surfaceSolid, color: BRAND.muted, border: `1px solid ${BRAND.borderSolid}` }}
            >
              Clear
            </button>
            <Link
              to="/"
              className="flex-1 h-14 rounded-2xl text-base font-semibold text-white flex items-center justify-center gap-2 transition-apple hover-scale"
              style={{ background: BRAND.primaryDark, boxShadow: `0 6px 18px ${BRAND.primaryDark}55` }}
            >
              Go to order · {cartUnits} item{cartUnits === 1 ? "" : "s"} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
