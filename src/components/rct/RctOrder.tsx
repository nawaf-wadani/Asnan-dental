import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, ExternalLink, ImageOff, Minus, Plus, Search, Trash2 } from "lucide-react";
import { RCT_PAPER_POINTS, RCT_OBTURATION, RCT_NEEDLES, URGENCIES, type Urgency } from "@shared/rct";
import {
  ENDO_FAMILIES,
  ENDO_INDEX,
  ENDO_PRODUCTS,
  endoImageUrl,
  endoItemCode,
  endoProductUrl,
  type EndoFamily,
  type EndoOption,
  type EndoProduct,
  type EndoVariantRef,
} from "@shared/endoCatalog";
import { endoApi, ApiError } from "@/lib/api";
import { brandFor, type BrandPalette } from "@/lib/brand";
import { useDarkMode } from "@/lib/useDarkMode";
import { todayIso, downloadBase64 } from "@/lib/format";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/ui/toast";
import { GlassCard, Button, Field, ModalShell, QtyControl } from "@/components/ui/primitives";

const DENTISTS = ["Dr. Lara", "Dr. Jasmine", "Dr. Dunya", "Dr. Sirwan"];
const MAX_QTY = 99;

export default function RctOrder() {
  return (
    <AppShell title="Endo files">
      <RctBody />
    </AppShell>
  );
}

function ProductImage({ image, alt, width = 480 }: { image: string; alt: string; width?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ color: "#8A85A3" }}>
        <ImageOff size={24} aria-label="Photo unavailable" />
      </div>
    );
  }
  return (
    <img
      src={endoImageUrl(image, width)}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="w-full h-full object-contain"
    />
  );
}

function RctBody() {
  const [dark] = useDarkMode();
  const BRAND = brandFor(dark);
  const toast = useToast();

  const [dentist, setDentist] = useState("");
  const [otherDentist, setOtherDentist] = useState("");
  const [orderDate, setOrderDate] = useState(todayIso());
  const [urgency, setUrgency] = useState<Urgency>("Routine");
  const [family, setFamily] = useState<EndoFamily>("All");
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState<Record<string, number>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [showAcc, setShowAcc] = useState(false);
  const [paper, setPaper] = useState({ type: "", qty: 0 });
  const [obtura, setObtura] = useState({ type: "", qty: 0 });
  const [needle, setNeedle] = useState({ type: "", qty: 0 });
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [doneId, setDoneId] = useState<number | null>(null);

  const dentistName = dentist === "other" ? otherDentist.trim() || "Other provider" : dentist;

  const setLine = (code: string, qty: number) =>
    setLines((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[code];
      else next[code] = Math.min(MAX_QTY, qty);
      return next;
    });

  const orderLines = useMemo(() => {
    const out: { ref: EndoVariantRef; qty: number }[] = [];
    for (const [code, qty] of Object.entries(lines)) {
      const ref = ENDO_INDEX.get(code);
      if (ref && qty > 0) out.push({ ref, qty });
    }
    return out;
  }, [lines]);
  const totalUnits = orderLines.reduce((s, l) => s + l.qty, 0);

  const qtyByProduct = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of orderLines) m.set(l.ref.product.id, (m.get(l.ref.product.id) ?? 0) + l.qty);
    return m;
  }, [orderLines]);

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ENDO_PRODUCTS.filter((p) => {
      if (family !== "All" && p.family !== family) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.options.some((o) => `${o.label} ${o.code}`.toLowerCase().includes(q));
    });
  }, [family, query]);

  const accessories: string[] = [];
  if (paper.type && paper.qty > 0) accessories.push(`Paper Points (${paper.type}) x${paper.qty}`);
  if (obtura.type && obtura.qty > 0) accessories.push(`${obtura.type} x${obtura.qty}`);
  if (needle.type && needle.qty > 0) accessories.push(`Irrigation Needles (${needle.type}) x${needle.qty}`);

  const submit = async () => {
    if (!dentist) {
      toast("Choose the dentist first", "warning");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (orderLines.length === 0) {
      toast("Tap a photo to add at least one file", "warning");
      return;
    }
    setBusy(true);
    try {
      const res = await endoApi.place({
        dentist: dentistName,
        orderDate,
        urgency,
        files: orderLines.map(({ ref, qty }) => ({
          type: ref.product.name,
          taper: ref.option.label,
          length: ref.length ? `${ref.length} mm` : "—",
          qty,
          code: ref.code,
        })),
        accessories,
        notes: notes.trim(),
      });
      setDoneId(res.id);
      downloadBase64(res.pdfBase64, res.pdfFilename);
      toast(res.emailSent ? "Endo order emailed and downloaded" : `Downloaded. Email did not send: ${res.emailError ?? "unknown error"}`, res.emailSent ? "success" : "warning");
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not place the order", "error");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setDoneId(null);
    setLines({});
    setPaper({ type: "", qty: 0 });
    setObtura({ type: "", qty: 0 });
    setNeedle({ type: "", qty: 0 });
    setNotes("");
  };

  const selectStyle = {
    background: BRAND.surfaceSolid,
    border: `1px solid ${BRAND.borderSolid}`,
    color: BRAND.ink,
  } as const;

  if (doneId != null) {
    return (
      <div className="py-10 text-center space-y-4">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white" style={{ background: BRAND.primaryDark }}>
          <Check size={30} strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-semibold">Endo order #{doneId} placed</h1>
        <p className="text-sm" style={{ color: BRAND.muted }}>
          The PDF was downloaded to this device and sent to the clinic.
        </p>
        <Button BRAND={BRAND} onClick={reset}>
          Start a new endo order
        </Button>
      </div>
    );
  }

  const openProduct = openId ? ENDO_PRODUCTS.find((p) => p.id === openId) ?? null : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold" style={{ letterSpacing: "-0.01em" }}>
          Endo files
        </h1>
        <p className="text-sm mt-1" style={{ color: BRAND.muted }}>
          Tap a photo, pick the size and length, and add it to the order.
        </p>
      </div>

      <GlassCard BRAND={BRAND} className="p-4 space-y-4">
        <Field BRAND={BRAND} label="Dentist" required>
          <select value={dentist} onChange={(e) => setDentist(e.target.value)} className="w-full h-12 px-3 rounded-xl text-base outline-none" style={selectStyle}>
            <option value="">Choose a dentist</option>
            {DENTISTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
            <option value="other">Other provider</option>
          </select>
          {dentist === "other" && (
            <input
              value={otherDentist}
              onChange={(e) => setOtherDentist(e.target.value)}
              placeholder="Provider name"
              className="mt-2 w-full h-12 px-3 rounded-xl text-base outline-none"
              style={selectStyle}
            />
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field BRAND={BRAND} label="Order date">
            <input
              type="date"
              value={orderDate}
              min={todayIso()}
              onChange={(e) => setOrderDate(e.target.value < todayIso() ? todayIso() : e.target.value)}
              className="w-full h-12 px-3 rounded-xl text-base outline-none"
              style={{ ...selectStyle, colorScheme: dark ? "dark" : "light" }}
            />
          </Field>
          <Field BRAND={BRAND} label="How soon">
            <div className="flex gap-1.5 h-12">
              {URGENCIES.map((u) => (
                <button
                  key={u}
                  onClick={() => setUrgency(u)}
                  className="flex-1 rounded-xl text-xs font-semibold"
                  style={{
                    background: urgency === u ? (u === "Urgent" ? BRAND.danger : BRAND.primaryDark) : "transparent",
                    color: urgency === u ? "#fff" : BRAND.muted,
                    border: `1px solid ${urgency === u ? "transparent" : BRAND.borderSolid}`,
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </GlassCard>

      {/* Search + family filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: BRAND.muted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or item code"
            className="w-full h-12 pl-10 pr-4 rounded-xl text-base outline-none"
            style={selectStyle}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {ENDO_FAMILIES.map((f) => (
            <button
              key={f}
              onClick={() => setFamily(f)}
              className="h-10 px-4 rounded-full text-sm font-medium flex-shrink-0"
              style={{
                background: family === f ? BRAND.primaryDark : BRAND.surfaceSolid,
                color: family === f ? "#fff" : BRAND.ink,
                border: `1px solid ${family === f ? BRAND.primaryDark : BRAND.borderSolid}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {products.map((p) => {
          const n = qtyByProduct.get(p.id) ?? 0;
          return (
            <button
              key={p.id}
              onClick={() => setOpenId(p.id)}
              className="text-left rounded-2xl overflow-hidden transition-apple hover-scale relative"
              style={{
                background: BRAND.surfaceSolid,
                border: `${n > 0 ? 2 : 1}px solid ${n > 0 ? BRAND.primaryDark : BRAND.borderSolid}`,
                boxShadow: BRAND.cardShadow,
              }}
            >
              <div className="aspect-[3/2] p-2" style={{ background: "#fff" }}>
                <ProductImage image={p.image} alt={p.name} />
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: BRAND.ink, minHeight: "2.6em" }}>
                  {p.name}
                </div>
                <div className="text-xs mt-1" style={{ color: BRAND.muted }}>
                  {p.options.length} {p.options.length === 1 ? "option" : "options"}
                </div>
              </div>
              {n > 0 && (
                <span
                  className="absolute top-2 right-2 min-w-[28px] h-7 px-2 rounded-full text-xs font-bold text-white flex items-center justify-center"
                  style={{ background: BRAND.primaryDark }}
                >
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {products.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: BRAND.muted }}>
          Nothing matches “{query}”. Try a shorter name or a different group.
        </p>
      )}

      {/* The order so far */}
      <section id="endo-order" className="space-y-3 pt-2">
        <h2 className="text-lg font-semibold">Your endo order</h2>
        {orderLines.length === 0 ? (
          <p className="text-sm" style={{ color: BRAND.muted }}>
            Nothing added yet. Tap a photo above to start.
          </p>
        ) : (
          <GlassCard BRAND={BRAND} className="divide-y" style={{ borderColor: BRAND.border }}>
            {orderLines.map(({ ref, qty }) => (
              <div key={ref.code} className="p-3 flex items-center gap-3" style={{ borderColor: BRAND.border }}>
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 p-1" style={{ background: "#fff", border: `1px solid ${BRAND.borderSolid}` }}>
                  <ProductImage image={ref.product.image} alt={ref.product.name} width={160} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-snug" style={{ color: BRAND.ink }}>
                    {ref.product.name}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
                    {ref.option.label}
                    {ref.length ? ` · ${ref.length} mm` : ""} · {ref.code}
                  </div>
                </div>
                <QtyControl BRAND={BRAND} qty={qty} onChange={(q) => setLine(ref.code, q)} compact />
                <button onClick={() => setLine(ref.code, 0)} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ color: BRAND.muted }} aria-label={`Remove ${ref.product.name}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </GlassCard>
        )}

        <GlassCard BRAND={BRAND} className="overflow-hidden">
          <button onClick={() => setShowAcc((s) => !s)} className="w-full px-4 py-3.5 flex items-center justify-between text-sm font-semibold" style={{ color: BRAND.ink }}>
            <span>
              Accessories <span className="font-normal" style={{ color: BRAND.muted }}>(paper points, obturation tips, needles)</span>
            </span>
            {showAcc ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showAcc && (
            <div className="px-4 pb-4 space-y-3">
              {[
                { label: "Paper points", opts: RCT_PAPER_POINTS, val: paper, set: setPaper },
                { label: "Obturation tips", opts: RCT_OBTURATION, val: obtura, set: setObtura },
                { label: "Irrigation needles", opts: RCT_NEEDLES, val: needle, set: setNeedle },
              ].map(({ label, opts, val, set }) => (
                <div key={label} className="grid grid-cols-[1fr_88px] gap-2">
                  <select value={val.type} onChange={(e) => set({ ...val, type: e.target.value })} aria-label={label} className="h-12 px-3 rounded-xl text-sm outline-none" style={selectStyle}>
                    <option value="">{label}: none</option>
                    {opts.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={val.qty}
                    aria-label={`${label} quantity`}
                    onChange={(e) => set({ ...val, qty: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className="h-12 px-2 rounded-xl text-base text-center outline-none"
                    style={selectStyle}
                  />
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard BRAND={BRAND} className="p-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Notes for this order (optional)"
            className="w-full bg-transparent border-0 resize-none text-base focus:outline-none"
            style={{ color: BRAND.ink }}
          />
        </GlassCard>
        <p className="text-xs" style={{ color: BRAND.muted }}>
          Product photos and item codes come from the Dentsply Sirona shop. The order PDF is emailed to the clinic and downloaded here.
        </p>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 pt-3" style={{ background: `linear-gradient(to top, ${BRAND.paper} 65%, transparent)` }}>
        <div className="max-w-3xl mx-auto flex gap-2">
          {orderLines.length > 0 && (
            <button
              onClick={() => document.getElementById("endo-order")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="h-14 px-5 rounded-2xl text-sm font-semibold"
              style={{ background: BRAND.surfaceSolid, color: BRAND.ink, border: `1px solid ${BRAND.borderSolid}` }}
            >
              Review
            </button>
          )}
          <button
            disabled={busy || orderLines.length === 0}
            onClick={submit}
            className="flex-1 h-14 rounded-2xl text-base font-semibold text-white disabled:opacity-40 transition-apple hover-scale"
            style={{ background: BRAND.primaryDark, boxShadow: `0 6px 18px ${BRAND.primaryDark}55` }}
          >
            {busy ? "Placing order…" : orderLines.length === 0 ? "Add files to place an order" : `Place endo order · ${totalUnits} file${totalUnits === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>

      {openProduct && (
        <ProductSheet
          BRAND={BRAND}
          product={openProduct}
          lines={lines}
          setLine={setLine}
          onClose={() => setOpenId(null)}
          count={qtyByProduct.get(openProduct.id) ?? 0}
        />
      )}
    </div>
  );
}

function ProductSheet({
  BRAND,
  product,
  lines,
  setLine,
  onClose,
  count,
}: {
  BRAND: BrandPalette;
  product: EndoProduct;
  lines: Record<string, number>;
  setLine: (code: string, qty: number) => void;
  onClose: () => void;
  count: number;
}) {
  const [filter, setFilter] = useState("");
  const q = filter.trim().toLowerCase();
  const options = q ? product.options.filter((o) => `${o.label} ${o.code}`.toLowerCase().includes(q)) : product.options;

  return (
    <ModalShell
      BRAND={BRAND}
      title={product.name}
      subtitle={product.family}
      onClose={onClose}
      footer={
        <Button BRAND={BRAND} full onClick={onClose}>
          {count > 0 ? `Done · ${count} in order` : "Close"}
        </Button>
      }
    >
      <div className="rounded-xl overflow-hidden h-44 p-2 mb-3" style={{ background: "#fff", border: `1px solid ${BRAND.borderSolid}` }}>
        <ProductImage image={product.image} alt={product.name} width={720} />
      </div>
      {product.note && (
        <p className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ background: BRAND.butter, color: "#4A3F00" }}>
          {product.note}
        </p>
      )}

      {product.options.length > 8 && (
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter sizes, e.g. 25 or .06"
          className="w-full h-11 px-3 rounded-xl text-sm outline-none mb-2"
          style={{ background: BRAND.surfaceSolid, border: `1px solid ${BRAND.borderSolid}`, color: BRAND.ink }}
        />
      )}

      <div>
        {options.map((o) => (
          <OptionRow key={o.code} BRAND={BRAND} option={o} lines={lines} setLine={setLine} />
        ))}
        {options.length === 0 && (
          <p className="text-sm py-6 text-center" style={{ color: BRAND.muted }}>
            No size matches “{filter}”.
          </p>
        )}
      </div>

      <a
        href={endoProductUrl(product.path)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium underline"
        style={{ color: BRAND.primaryDark }}
      >
        View on Dentsply Sirona <ExternalLink size={12} />
      </a>
    </ModalShell>
  );
}

function OptionRow({
  BRAND,
  option,
  lines,
  setLine,
}: {
  BRAND: BrandPalette;
  option: EndoOption;
  lines: Record<string, number>;
  setLine: (code: string, qty: number) => void;
}) {
  const hasLengths = !!option.lengths && option.lengths.length > 0;
  return (
    <div className="py-3" style={{ borderBottom: `1px solid ${BRAND.border}` }}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold" style={{ color: BRAND.ink }}>
            {option.label}
          </div>
          {option.detail && (
            <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
              {option.detail}
            </div>
          )}
        </div>
        {!hasLengths && <QtyControl BRAND={BRAND} qty={lines[endoItemCode(option)] ?? 0} onChange={(q) => setLine(endoItemCode(option), q)} compact />}
      </div>

      {hasLengths && (
        <div className="flex flex-wrap gap-2 mt-2.5">
          {option.lengths!.map((len) => {
            const code = endoItemCode(option, len);
            const qty = lines[code] ?? 0;
            return qty > 0 ? (
              <div
                key={code}
                className="h-11 rounded-full flex items-center text-white"
                style={{ background: BRAND.primaryDark }}
                role="group"
                aria-label={`${len} millimetre, quantity ${qty}`}
              >
                <button onClick={() => setLine(code, qty - 1)} className="w-10 h-11 flex items-center justify-center" aria-label={`Remove one ${len} mm`}>
                  <Minus size={14} strokeWidth={2.5} />
                </button>
                <span className="text-sm font-semibold min-w-[56px] text-center">
                  {len} mm · {qty}
                </span>
                <button onClick={() => setLine(code, qty + 1)} className="w-10 h-11 flex items-center justify-center" aria-label={`Add one ${len} mm`}>
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button
                key={code}
                onClick={() => setLine(code, 1)}
                className="h-11 px-5 rounded-full text-sm font-medium transition-apple"
                style={{ background: BRAND.surfaceSolid, color: BRAND.ink, border: `1.5px solid ${BRAND.borderSolid}` }}
              >
                {len} mm
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
