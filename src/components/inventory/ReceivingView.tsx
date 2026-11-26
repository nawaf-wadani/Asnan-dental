import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, PackageCheck, Trash2, Undo2 } from "lucide-react";
import type { ReceivingLine, ReceivingOrder } from "@shared/types";
import { receivingApi, receivingAdminApi, ApiError } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import type { BrandPalette } from "@/lib/brand";
import { useToast } from "@/components/ui/toast";
import { ItemPhoto } from "@/components/ui/ItemPhoto";
import { GlassCard, Spinner } from "@/components/ui/primitives";

type View = "todo" | "done" | "all";

function remainingOf(o: ReceivingOrder): number {
  return o.lines.reduce((s, l) => s + Math.max(0, l.qty - l.receivedQty), 0);
}

/** Order history with a "Received" button on every line. Receiving adds the units to stock. */
export function ReceivingView({
  BRAND,
  onStock,
  isAdmin = false,
}: {
  BRAND: BrandPalette;
  onStock: (stock: Record<string, number>) => void;
  isAdmin?: boolean;
}) {
  const toast = useToast();
  const [orders, setOrders] = useState<ReceivingOrder[] | null>(null);
  const [view, setView] = useState<View>("todo");
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [busy, setBusy] = useState<string>("");

  useEffect(() => {
    receivingApi
      .list()
      .then((r) => setOrders(r.orders))
      .catch((e) => {
        setOrders([]);
        toast(e instanceof ApiError ? e.message : "Could not load your orders", "error");
      });
  }, [toast]);

  const apply = useCallback(
    async (order: ReceivingOrder, items: { lineId: number; qty: number }[], busyKey: string, message: string) => {
      setBusy(busyKey);
      try {
        const r = await receivingApi.receive(order.id, items);
        setOrders((os) => (os ? os.map((o) => (o.id === r.order.id ? r.order : o)) : os));
        onStock(r.stock);
        toast(message, "success");
      } catch (e) {
        toast(e instanceof ApiError ? e.message : "That did not save. Try again", "error");
      } finally {
        setBusy("");
      }
    },
    [onStock, toast],
  );

  /** Admin: take an item off an order (added by mistake, or it will not be delivered). */
  const removeLine = useCallback(
    async (order: ReceivingOrder, line: ReceivingLine) => {
      const extra =
        line.receivedQty > 0
          ? `\n\n${line.receivedQty} already received stay in your stock. Press Undo first if you want them taken out.`
          : "";
      if (!window.confirm(`Remove "${line.name}" (ordered ${line.qty}) from order #${order.id}?${extra}`)) return;
      setBusy(`remove:${line.id}`);
      try {
        const r = await receivingAdminApi.removeLine(line.id);
        setOrders((os) => {
          if (!os) return os;
          const updated = r.order;
          if (!updated || updated.lines.length === 0) return os.filter((o) => o.id !== order.id);
          return os.map((o) => (o.id === updated.id ? updated : o));
        });
        toast(`"${line.name}" removed from order #${order.id}`, "success");
      } catch (e) {
        toast(e instanceof ApiError ? e.message : "Could not remove that item", "error");
      } finally {
        setBusy("");
      }
    },
    [toast],
  );

  const shown = useMemo(() => {
    const list = orders ?? [];
    return view === "todo" ? list.filter((o) => o.status !== "received") : view === "done" ? list.filter((o) => o.status === "received") : list;
  }, [orders, view]);

  if (orders === null) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner label="Loading your orders…" />
      </div>
    );
  }

  const waiting = orders.filter((o) => o.status !== "received");
  const unitsOnTheWay = waiting.reduce((s, o) => s + remainingOf(o), 0);

  const tabs: { id: View; label: string; n: number }[] = [
    { id: "todo", label: "To receive", n: waiting.length },
    { id: "done", label: "Received", n: orders.length - waiting.length },
    { id: "all", label: "All", n: orders.length },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Order history</h2>
        <p className="text-sm mt-1" style={{ color: BRAND.muted }}>
          {waiting.length === 0
            ? "Nothing is waiting to arrive."
            : `${waiting.length} order${waiting.length === 1 ? "" : "s"} waiting, ${unitsOnTheWay} unit${unitsOnTheWay === 1 ? "" : "s"} on the way.`}{" "}
          When a delivery arrives, press <b>Received</b> and the items are added to your stock.
        </p>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className="h-10 px-4 rounded-full text-sm font-medium"
            style={{
              background: view === t.id ? BRAND.primaryDark : BRAND.surfaceSolid,
              color: view === t.id ? "#fff" : BRAND.ink,
              border: `1px solid ${view === t.id ? BRAND.primaryDark : BRAND.borderSolid}`,
            }}
          >
            {t.label} · {t.n}
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <div className="text-center py-14">
          <PackageCheck size={30} style={{ color: BRAND.muted, margin: "0 auto 10px" }} />
          <p className="text-sm" style={{ color: BRAND.muted }}>
            {view === "todo" ? "No orders are waiting. When you place an order it shows up here until it arrives." : "No orders to show."}
          </p>
        </div>
      )}

      {shown.map((o) => {
        const remaining = remainingOf(o);
        const isOpen = open[o.id] ?? o.status !== "received";
        const pill =
          o.status === "received"
            ? { label: "All received", bg: BRAND.successBg, fg: BRAND.success }
            : o.status === "partial"
              ? { label: "Partly received", bg: BRAND.warningBg, fg: BRAND.warning }
              : { label: "Not received", bg: BRAND.butter, fg: "#4A3F00" };
        const units = o.lines.reduce((s, l) => s + l.qty, 0);
        return (
          <GlassCard key={o.id} BRAND={BRAND} className="overflow-hidden">
            <div className="p-4 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setOpen((s) => ({ ...s, [o.id]: !isOpen }))}
                className="flex-1 min-w-[220px] text-left flex items-center gap-3"
                aria-expanded={isOpen}
                aria-label={`Order ${o.id}, ${isOpen ? "hide" : "show"} items`}
              >
                {isOpen ? <ChevronUp size={18} style={{ color: BRAND.muted }} /> : <ChevronDown size={18} style={{ color: BRAND.muted }} />}
                <span>
                  <span className="block font-semibold" style={{ color: BRAND.ink }}>
                    Order #{o.id}
                  </span>
                  <span className="block text-xs mt-0.5" style={{ color: BRAND.muted }}>
                    Placed {timeAgo(o.createdAt)} by {o.assistantName} · {units} unit{units === 1 ? "" : "s"}
                    {o.urgency !== "Routine" ? ` · ${o.urgency}` : ""}
                  </span>
                </span>
              </button>
              <span className="inline-flex items-center h-7 px-3 rounded-full text-xs font-semibold" style={{ background: pill.bg, color: pill.fg }}>
                {pill.label}
              </span>
              {remaining > 0 && (
                <button
                  disabled={busy !== ""}
                  onClick={() => {
                    if (!window.confirm(`Add everything still on order #${o.id} (${remaining} unit${remaining === 1 ? "" : "s"}) to your stock?`)) return;
                    void apply(
                      o,
                      o.lines.filter((l) => l.qty > l.receivedQty).map((l) => ({ lineId: l.id, qty: l.qty - l.receivedQty })),
                      `order:${o.id}`,
                      `Order #${o.id} received. ${remaining} unit${remaining === 1 ? "" : "s"} added to stock`,
                    );
                  }}
                  className="h-11 px-5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-50"
                  style={{ background: BRAND.primaryDark }}
                >
                  <Check size={16} strokeWidth={2.5} /> {busy === `order:${o.id}` ? "Saving…" : "Receive all"}
                </button>
              )}
            </div>

            {isOpen && (
              <ul style={{ borderTop: `1px solid ${BRAND.borderSolid}` }}>
                {o.lines.map((l) => {
                  const left = l.qty - l.receivedQty;
                  return (
                    <li key={l.id} className="px-4 py-3 flex items-center gap-3 flex-wrap" style={{ borderBottom: `1px solid ${BRAND.border}` }}>
                      <ItemPhoto sku={l.sku} photoUrl={l.photoUrl} size={44} />
                      <div className="flex-1 min-w-[180px]">
                        <div className="text-sm font-medium leading-snug" style={{ color: BRAND.ink }}>
                          {l.name}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
                          Ordered {l.qty} · Received {l.receivedQty}
                          {l.receivedAt ? ` (${timeAgo(l.receivedAt)}${l.receivedBy ? ` by ${l.receivedBy}` : ""})` : ""}
                        </div>
                      </div>

                      {left > 0 ? (
                        <div className="flex items-center gap-2">
                          <button
                            disabled={busy !== ""}
                            onClick={() => void apply(o, [{ lineId: l.id, qty: left }], `line:${l.id}`, `${left} × ${l.name} added to stock`)}
                            className="h-11 px-4 rounded-xl text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
                            style={{ background: `${BRAND.primary}26`, color: BRAND.primaryDark }}
                          >
                            <Check size={15} strokeWidth={2.5} /> {busy === `line:${l.id}` ? "Saving…" : left === l.qty ? "Received" : `Received ${left}`}
                          </button>
                          {left > 1 && (
                            <button
                              disabled={busy !== ""}
                              onClick={() => {
                                const v = window.prompt(`How many "${l.name}" arrived? (up to ${left})`, String(left));
                                const n = v == null ? NaN : parseInt(v, 10);
                                if (!Number.isFinite(n) || n <= 0) return;
                                const take = Math.min(n, left);
                                void apply(o, [{ lineId: l.id, qty: take }], `line:${l.id}`, `${take} × ${l.name} added to stock`);
                              }}
                              className="h-11 px-3 rounded-xl text-sm font-medium"
                              style={{ color: BRAND.muted, border: `1px solid ${BRAND.borderSolid}` }}
                            >
                              Only some
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 h-8 px-3 rounded-full text-xs font-semibold" style={{ background: BRAND.successBg, color: BRAND.success }}>
                          <Check size={13} strokeWidth={3} /> Received
                        </span>
                      )}

                      {l.receivedQty > 0 && (
                        <button
                          disabled={busy !== ""}
                          onClick={() => {
                            if (!window.confirm(`Take the ${l.receivedQty} received "${l.name}" back out of your stock? Use this if you pressed Received by mistake.`)) return;
                            void apply(o, [{ lineId: l.id, qty: -l.receivedQty }], `line:${l.id}`, `${l.receivedQty} × ${l.name} taken back out of stock`);
                          }}
                          className="h-9 px-2.5 rounded-lg text-xs flex items-center gap-1 disabled:opacity-50"
                          style={{ color: BRAND.muted }}
                          title="Undo this receipt"
                        >
                          <Undo2 size={13} /> Undo
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          disabled={busy !== ""}
                          onClick={() => void removeLine(o, l)}
                          className="w-10 h-10 rounded-lg flex items-center justify-center disabled:opacity-50"
                          style={{ color: BRAND.danger }}
                          aria-label={`Remove ${l.name} from order ${o.id}`}
                          title="Remove this item from the order"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
}
