import { useEffect, useMemo, useState } from "react";
import { BarChart3, ClipboardList, Package, Users as UsersIcon, ScrollText, Download, Trash2, Plus } from "lucide-react";
import type { CatalogItem, Order, OrderSummary, Role, User } from "@shared/types";
import { CATALOG_CATEGORIES } from "@shared/catalog";
import {
  catalogApi,
  ordersApi,
  usersApi,
  statsApi,
  ApiError,
  type AuditEntry,
  type DashboardStats,
} from "@/lib/api";
import { brandFor } from "@/lib/brand";
import { useDarkMode } from "@/lib/useDarkMode";
import { formatDate, formatDateTime } from "@/lib/format";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/ui/toast";
import { GlassCard, Button, Field, TextInput, ModalShell, Spinner } from "@/components/ui/primitives";

type Tab = "dashboard" | "orders" | "catalog" | "users" | "audit";

export default function AdminApp() {
  return (
    <AppShell title="Admin">
      <AdminBody />
    </AppShell>
  );
}

function AdminBody() {
  const [dark] = useDarkMode();
  const BRAND = brandFor(dark);
  const [tab, setTab] = useState<Tab>("dashboard");

  const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "orders", label: "Orders", icon: ClipboardList },
    { id: "catalog", label: "Catalog", icon: Package },
    { id: "users", label: "Users", icon: UsersIcon },
    { id: "audit", label: "Audit", icon: ScrollText },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="h-9 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0"
            style={{ background: tab === id ? BRAND.primary : "transparent", color: tab === id ? "#fff" : BRAND.muted, border: `1px solid ${tab === id ? BRAND.primary : BRAND.border}` }}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <DashboardTab BRAND={BRAND} />}
      {tab === "orders" && <OrdersTab BRAND={BRAND} />}
      {tab === "catalog" && <CatalogTab BRAND={BRAND} />}
      {tab === "users" && <UsersTab BRAND={BRAND} />}
      {tab === "audit" && <AuditTab BRAND={BRAND} />}
    </div>
  );
}

type B = ReturnType<typeof brandFor>;

function DashboardTab({ BRAND }: { BRAND: B }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const toast = useToast();
  useEffect(() => {
    statsApi.dashboard().then(setStats).catch((e) => toast(e instanceof ApiError ? e.message : "Failed", "error"));
  }, [toast]);
  if (!stats) return <Spinner />;
  const cells = [
    ["Orders placed", stats.totalOrders],
    ["Units ordered", stats.totalUnits],
    ["Catalog items", stats.catalogSize],
    ["Low stock", stats.lowStock],
    ["Out of stock", stats.outOfStock],
  ] as const;
  return (
    <div className="grid grid-cols-2 gap-3">
      {cells.map(([label, value]) => (
        <GlassCard key={label} BRAND={BRAND} className="p-4 text-center">
          <div className="text-3xl font-bold" style={{ color: BRAND.primary }}>
            {value}
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold mt-1" style={{ color: BRAND.muted }}>
            {label}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function OrdersTab({ BRAND }: { BRAND: B }) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Order | null>(null);
  const toast = useToast();

  const load = () =>
    ordersApi
      .list(100)
      .then((r) => setOrders(r.orders))
      .catch((e) => toast(e instanceof ApiError ? e.message : "Failed", "error"))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (id: number) => {
    if (!window.confirm(`Delete order #${id}? This cannot be undone.`)) return;
    try {
      await ordersApi.remove(id);
      setOrders((o) => o.filter((x) => x.id !== id));
      toast(`Order #${id} deleted`, "success");
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Failed", "error");
    }
  };

  const exportCsv = () => {
    const header = "id,date,assistant,placed_by,urgency,items,email_sent,created_at";
    const lines = orders.map((o) =>
      [o.id, o.orderDate, `"${o.assistantName}"`, o.createdByEmail, o.urgency, o.itemCount, o.emailSent, o.createdAt].join(","),
    );
    const blob = new Blob([`${header}\n${lines.join("\n")}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `asnan-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  if (loading) return <Spinner />;
  return (
    <div className="space-y-2">
      <Button BRAND={BRAND} variant="ghost" onClick={exportCsv}>
        <Download size={14} /> Export CSV
      </Button>
      {orders.map((o) => (
        <GlassCard key={o.id} BRAND={BRAND} className="p-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold">
              #{o.id} · {formatDate(o.orderDate)} · {o.urgency}
            </div>
            <div className="text-[11px]" style={{ color: BRAND.muted }}>
              {o.assistantName} ({o.createdByEmail}) · {o.itemCount} items · {o.emailSent ? "emailed" : "email failed"}
            </div>
          </div>
          <button
            onClick={() => ordersApi.get(o.id).then((r) => setOpen(r.order)).catch(() => toast("Failed", "error"))}
            className="text-xs font-semibold underline"
            style={{ color: BRAND.primary }}
          >
            View
          </button>
          <a href={ordersApi.pdfUrl(o.id)} className="text-xs" style={{ color: BRAND.muted }} aria-label="Download PDF">
            <Download size={15} />
          </a>
          <button onClick={() => remove(o.id)} style={{ color: BRAND.danger }} aria-label="Delete">
            <Trash2 size={15} />
          </button>
        </GlassCard>
      ))}
      {orders.length === 0 && <p className="text-sm text-center py-8" style={{ color: BRAND.muted }}>No orders yet.</p>}

      {open && (
        <ModalShell BRAND={BRAND} title={`Order #${open.id}`} subtitle={formatDateTime(open.createdAt)} onClose={() => setOpen(null)}>
          <div className="text-xs mb-3" style={{ color: BRAND.muted }}>
            {open.assistantName} · {open.createdByEmail} · {open.urgency}
          </div>
          {open.notes && <p className="text-sm mb-3 italic">{open.notes}</p>}
          <div className="space-y-1">
            {open.lines.map((l) => (
              <div key={l.sku} className="flex justify-between text-sm">
                <span>{l.name}</span>
                <span className="font-bold">{l.qty}</span>
              </div>
            ))}
          </div>
          {open.specialRequests.length > 0 && (
            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: BRAND.muted }}>
                Special requests
              </div>
              {open.specialRequests.map((s, i) => (
                <div key={i} className="text-sm mt-1 flex gap-2">
                  <span>{s.text}</span>
                  {s.photoUrl && <img src={s.photoUrl} alt="" className="w-10 h-10 rounded object-cover" />}
                </div>
              ))}
            </div>
          )}
        </ModalShell>
      )}
    </div>
  );
}

function CatalogTab({ BRAND }: { BRAND: B }) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<CatalogItem | "new" | null>(null);
  const toast = useToast();

  const load = () =>
    catalogApi
      .list(true)
      .then((r) => setItems(r.items))
      .catch((e) => toast(e instanceof ApiError ? e.message : "Failed", "error"))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () => (q.trim() ? items.filter((i) => (i.name + i.sku + (i.manufacturer ?? "")).toLowerCase().includes(q.toLowerCase())) : items),
    [items, q],
  );

  if (loading) return <Spinner />;
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <TextInput BRAND={BRAND} placeholder="Search catalog…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button BRAND={BRAND} onClick={() => setEditing("new")}>
          <Plus size={15} />
        </Button>
      </div>
      {filtered.slice(0, 200).map((it) => (
        <GlassCard key={it.sku} BRAND={BRAND} className="p-3 flex items-center gap-3" style={{ opacity: it.active ? 1 : 0.5 }}>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{it.name}</div>
            <div className="text-[11px]" style={{ color: BRAND.muted }}>
              {it.sku} · {it.categoryLabel} · {it.manufacturer} · stock {it.onHand}
            </div>
          </div>
          <button onClick={() => setEditing(it)} className="text-xs font-semibold underline" style={{ color: BRAND.primary }}>
            Edit
          </button>
        </GlassCard>
      ))}
      {filtered.length > 200 && <p className="text-[11px] text-center" style={{ color: BRAND.muted }}>Showing first 200 — refine your search.</p>}

      {editing && (
        <CatalogEditor
          BRAND={BRAND}
          item={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function CatalogEditor({
  BRAND,
  item,
  onClose,
  onSaved,
}: {
  BRAND: B;
  item: CatalogItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [f, setF] = useState({
    sku: item?.sku ?? "",
    name: item?.name ?? "",
    category: item?.category ?? CATALOG_CATEGORIES[0].key,
    pkg: item?.pkg ?? "",
    manufacturer: item?.manufacturer ?? "",
    supplier: item?.supplier ?? "Patterson",
    itemNumber: item?.itemNumber ?? "",
    onHand: item?.onHand ?? 0,
    reorderThreshold: item?.reorderThreshold ?? 1,
  });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const categoryLabel = CATALOG_CATEGORIES.find((c) => c.key === f.category)?.label ?? f.category;
    try {
      if (item) {
        await catalogApi.update(item.sku, { ...f, categoryLabel });
      } else {
        await catalogApi.create({ ...f, categoryLabel });
      }
      toast("Saved", "success");
      onSaved();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Save failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const retire = async () => {
    if (!item || !window.confirm(`Retire "${item.name}"? It will disappear from ordering.`)) return;
    try {
      await catalogApi.retire(item.sku);
      toast("Item retired", "success");
      onSaved();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Failed", "error");
    }
  };

  return (
    <ModalShell
      BRAND={BRAND}
      title={item ? "Edit item" : "New catalog item"}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          {item && (
            <Button BRAND={BRAND} variant="danger" onClick={retire}>
              Retire
            </Button>
          )}
          <Button BRAND={BRAND} full disabled={busy} onClick={save}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <Field BRAND={BRAND} label="SKU" required>
          <TextInput BRAND={BRAND} value={f.sku} disabled={!!item} onChange={(e) => setF({ ...f, sku: e.target.value })} />
        </Field>
        <Field BRAND={BRAND} label="Name" required>
          <TextInput BRAND={BRAND} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </Field>
        <Field BRAND={BRAND} label="Category">
          <select
            value={f.category}
            onChange={(e) => setF({ ...f, category: e.target.value })}
            className="w-full h-11 px-3 rounded-xl text-sm outline-none"
            style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}
          >
            {CATALOG_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field BRAND={BRAND} label="Pack size">
            <TextInput BRAND={BRAND} value={f.pkg} onChange={(e) => setF({ ...f, pkg: e.target.value })} />
          </Field>
          <Field BRAND={BRAND} label="Manufacturer">
            <TextInput BRAND={BRAND} value={f.manufacturer} onChange={(e) => setF({ ...f, manufacturer: e.target.value })} />
          </Field>
          <Field BRAND={BRAND} label="Supplier">
            <TextInput BRAND={BRAND} value={f.supplier} onChange={(e) => setF({ ...f, supplier: e.target.value })} />
          </Field>
          <Field BRAND={BRAND} label="Supplier item #">
            <TextInput BRAND={BRAND} value={f.itemNumber} onChange={(e) => setF({ ...f, itemNumber: e.target.value })} />
          </Field>
          <Field BRAND={BRAND} label="On hand">
            <TextInput BRAND={BRAND} type="number" value={f.onHand} onChange={(e) => setF({ ...f, onHand: parseInt(e.target.value, 10) || 0 })} />
          </Field>
          <Field BRAND={BRAND} label="Reorder at">
            <TextInput BRAND={BRAND} type="number" value={f.reorderThreshold} onChange={(e) => setF({ ...f, reorderThreshold: parseInt(e.target.value, 10) || 0 })} />
          </Field>
        </div>
      </div>
    </ModalShell>
  );
}

function UsersTab({ BRAND }: { BRAND: B }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const toast = useToast();

  const load = () =>
    usersApi
      .list()
      .then((r) => setUsers(r.users))
      .catch((e) => toast(e instanceof ApiError ? e.message : "Failed", "error"))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = async (id: number, p: Parameters<typeof usersApi.update>[1], label: string) => {
    try {
      await usersApi.update(id, p);
      toast(label, "success");
      load();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Failed", "error");
    }
  };

  if (loading) return <Spinner />;
  return (
    <div className="space-y-2">
      <Button BRAND={BRAND} onClick={() => setCreating(true)}>
        <Plus size={15} /> Add user
      </Button>
      {users.map((u) => (
        <GlassCard key={u.id} BRAND={BRAND} className="p-3" style={{ opacity: u.active ? 1 : 0.5 }}>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">
                {u.displayName} <span className="text-[10px] uppercase px-1.5 py-0.5 rounded" style={{ background: `${BRAND.primary}22`, color: BRAND.primary }}>{u.role}</span>
              </div>
              <div className="text-[11px]" style={{ color: BRAND.muted }}>
                {u.email} {!u.active && "· disabled"}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 text-[11px] font-semibold">
            <button style={{ color: BRAND.primary }} onClick={() => patch(u.id, { role: u.role === "admin" ? "assistant" : "admin" }, "Role changed")}>
              Make {u.role === "admin" ? "assistant" : "admin"}
            </button>
            <button style={{ color: BRAND.primary }} onClick={() => patch(u.id, { active: !u.active }, u.active ? "Disabled" : "Enabled")}>
              {u.active ? "Disable" : "Enable"}
            </button>
            <button
              style={{ color: BRAND.primary }}
              onClick={() => {
                const pw = window.prompt(`New password for ${u.displayName} (min 8 chars)`);
                if (pw && pw.length >= 8) patch(u.id, { newPassword: pw }, "Password reset — their sessions are now signed out");
                else if (pw != null) toast("Password too short", "warning");
              }}
            >
              Reset password
            </button>
          </div>
        </GlassCard>
      ))}

      {creating && (
        <NewUserModal
          BRAND={BRAND}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function NewUserModal({ BRAND, onClose, onCreated }: { BRAND: B; onClose: () => void; onCreated: () => void }) {
  const toast = useToast();
  const [f, setF] = useState({ email: "", displayName: "", password: "", role: "assistant" as Role });
  const [busy, setBusy] = useState(false);
  const create = async () => {
    if (f.password.length < 8) return toast("Password must be at least 8 characters", "warning");
    setBusy(true);
    try {
      await usersApi.create(f);
      toast("User created", "success");
      onCreated();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Failed", "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <ModalShell BRAND={BRAND} title="Add user" onClose={onClose} footer={<Button BRAND={BRAND} full disabled={busy} onClick={create}>{busy ? "Creating…" : "Create"}</Button>}>
      <div className="space-y-3">
        <Field BRAND={BRAND} label="Full name" required>
          <TextInput BRAND={BRAND} value={f.displayName} onChange={(e) => setF({ ...f, displayName: e.target.value })} />
        </Field>
        <Field BRAND={BRAND} label="Email" required>
          <TextInput BRAND={BRAND} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </Field>
        <Field BRAND={BRAND} label="Temporary password" required hint="Min 8 characters. They cannot reset it themselves — you do.">
          <TextInput BRAND={BRAND} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        </Field>
        <Field BRAND={BRAND} label="Role">
          <select
            value={f.role}
            onChange={(e) => setF({ ...f, role: e.target.value as Role })}
            className="w-full h-11 px-3 rounded-xl text-sm outline-none"
            style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}
          >
            <option value="assistant">Assistant</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
      </div>
    </ModalShell>
  );
}

function AuditTab({ BRAND }: { BRAND: B }) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  useEffect(() => {
    statsApi
      .audit(150)
      .then((r) => setEntries(r.entries))
      .catch((e) => toast(e instanceof ApiError ? e.message : "Failed", "error"))
      .finally(() => setLoading(false));
  }, [toast]);
  if (loading) return <Spinner />;
  return (
    <div className="space-y-1.5">
      {entries.map((e) => (
        <div key={e.id} className="text-[11px] px-3 py-2 rounded-lg" style={{ background: BRAND.glass, border: `1px solid ${BRAND.glassBorder}` }}>
          <span style={{ color: BRAND.muted }}>{formatDateTime(e.at)}</span> — <strong>{e.actor_email}</strong> {e.action}{" "}
          <span style={{ color: BRAND.muted }}>
            {e.entity}
            {e.entity_id ? ` #${e.entity_id}` : ""}
          </span>
        </div>
      ))}
      {entries.length === 0 && <p className="text-sm text-center py-8" style={{ color: BRAND.muted }}>No audit entries yet.</p>}
    </div>
  );
}
