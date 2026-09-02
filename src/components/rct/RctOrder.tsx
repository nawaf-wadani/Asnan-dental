import { useState } from "react";
import { Plus, Trash2, ChevronRight, Download, Check } from "lucide-react";
import {
  RCT_FILE_TYPES,
  RCT_TAPERS,
  RCT_LENGTHS,
  RCT_PAPER_POINTS,
  RCT_OBTURATION,
  RCT_NEEDLES,
  URGENCIES,
  type Urgency,
} from "@shared/rct";
import { endoApi, ApiError } from "@/lib/api";
import { brandFor } from "@/lib/brand";
import { useDarkMode } from "@/lib/useDarkMode";
import { todayIso, downloadBase64 } from "@/lib/format";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/ui/toast";
import { GlassCard, Button, Field } from "@/components/ui/primitives";

const DENTISTS = ["Dr. Lara", "Dr. Jasmine", "Dr. Dunya", "Dr. Sirwan"];

interface FileRow {
  id: number;
  type: string;
  taper: string;
  length: string;
  qty: number;
}

export default function RctOrder() {
  return (
    <AppShell title="WaveOne Endo Order">
      <RctBody />
    </AppShell>
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
  const [rows, setRows] = useState<FileRow[]>([
    { id: 1, type: RCT_FILE_TYPES[1], taper: RCT_TAPERS[2], length: RCT_LENGTHS[1], qty: 1 },
  ]);
  const [nextId, setNextId] = useState(2);
  const [paper, setPaper] = useState({ size: "", qty: 0 });
  const [obtura, setObtura] = useState({ type: "", qty: 0 });
  const [needle, setNeedle] = useState({ type: "", qty: 0 });
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [doneId, setDoneId] = useState<number | null>(null);

  const dentistName = dentist === "other" ? otherDentist.trim() || "Other Provider" : dentist;

  const accessories: string[] = [];
  if (paper.size && paper.qty > 0) accessories.push(`Paper Points (${paper.size}) x${paper.qty}`);
  if (obtura.type && obtura.qty > 0) accessories.push(`${obtura.type} x${obtura.qty}`);
  if (needle.type && needle.qty > 0) accessories.push(`Irrigation Needles (${needle.type}) x${needle.qty}`);

  const updateRow = (id: number, patch: Partial<FileRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const submit = async () => {
    if (!dentist) return toast("Select a dentist", "warning");
    setBusy(true);
    try {
      const res = await endoApi.place({
        dentist: dentistName,
        orderDate,
        urgency,
        files: rows.map(({ type, taper, length, qty }) => ({ type, taper, length, qty })),
        accessories,
        notes: notes.trim(),
      });
      setDoneId(res.id);
      downloadBase64(res.pdfBase64, res.pdfFilename);
      toast(res.emailSent ? "Endo order emailed and downloaded" : `Downloaded — email failed: ${res.emailError ?? ""}`, res.emailSent ? "success" : "warning");
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not place the order", "error");
    } finally {
      setBusy(false);
    }
  };

  const selectStyle = {
    background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
    border: `1px solid ${BRAND.border}`,
    color: BRAND.ink,
  };

  if (doneId != null) {
    return (
      <div className="py-10 text-center space-y-4">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})` }}>
          <Check size={30} strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold">Endo order #{doneId} placed</h1>
        <Button BRAND={BRAND} variant="ghost" onClick={() => setDoneId(null)}>
          New endo order
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">
        WaveOne <span style={{ color: BRAND.primary }}>Endodontic Order</span>
      </h1>

      <GlassCard BRAND={BRAND} className="p-4 space-y-4">
        <Field BRAND={BRAND} label="Dentist" required>
          <select value={dentist} onChange={(e) => setDentist(e.target.value)} className="w-full h-11 px-3 rounded-xl text-sm outline-none" style={selectStyle}>
            <option value="">— Select dentist —</option>
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
              className="mt-2 w-full h-11 px-3 rounded-xl text-sm outline-none"
              style={selectStyle}
            />
          )}
        </Field>
        <Field BRAND={BRAND} label="Order date">
          <input
            type="date"
            value={orderDate}
            min={todayIso()}
            onChange={(e) => setOrderDate(e.target.value < todayIso() ? todayIso() : e.target.value)}
            className="w-full h-11 px-3 rounded-xl text-sm outline-none"
            style={{ ...selectStyle, colorScheme: dark ? "dark" : "light" }}
          />
        </Field>
        <Field BRAND={BRAND} label="Urgency">
          <div className="flex gap-2">
            {URGENCIES.map((u) => (
              <button
                key={u}
                onClick={() => setUrgency(u)}
                className="flex-1 h-10 rounded-xl text-xs font-semibold"
                style={{
                  background: urgency === u ? (u === "Urgent" ? BRAND.danger : BRAND.primary) : "transparent",
                  color: urgency === u ? "#fff" : BRAND.muted,
                  border: `1px solid ${urgency === u ? (u === "Urgent" ? BRAND.danger : BRAND.primary) : BRAND.border}`,
                }}
              >
                {u}
              </button>
            ))}
          </div>
        </Field>
      </GlassCard>

      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: BRAND.muted }}>
          WaveOne files
        </div>
        {rows.map((row) => (
          <GlassCard key={row.id} BRAND={BRAND} className="p-3 space-y-2">
            <select value={row.type} onChange={(e) => updateRow(row.id, { type: e.target.value })} className="w-full h-10 px-2 rounded-lg text-xs outline-none" style={selectStyle}>
              {RCT_FILE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <select value={row.taper} onChange={(e) => updateRow(row.id, { taper: e.target.value })} className="h-10 px-2 rounded-lg text-xs outline-none" style={selectStyle}>
                {RCT_TAPERS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <select value={row.length} onChange={(e) => updateRow(row.id, { length: e.target.value })} className="flex-1 h-10 px-2 rounded-lg text-xs outline-none" style={selectStyle}>
                  {RCT_LENGTHS.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={row.qty}
                  onChange={(e) => updateRow(row.id, { qty: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  className="w-14 h-10 px-2 rounded-lg text-xs text-center font-bold outline-none"
                  style={selectStyle}
                />
              </div>
            </div>
            {rows.length > 1 && (
              <button onClick={() => setRows((rs) => rs.filter((r) => r.id !== row.id))} className="text-[10px] font-semibold flex items-center gap-1" style={{ color: BRAND.danger }}>
                <Trash2 size={11} /> Remove
              </button>
            )}
          </GlassCard>
        ))}
        <button
          onClick={() => {
            setRows((rs) => [...rs, { id: nextId, type: RCT_FILE_TYPES[0], taper: RCT_TAPERS[0], length: RCT_LENGTHS[1], qty: 1 }]);
            setNextId((n) => n + 1);
          }}
          className="w-full h-11 rounded-2xl border-2 border-dashed text-sm font-semibold flex items-center justify-center gap-2"
          style={{ borderColor: BRAND.border, color: BRAND.muted }}
        >
          <Plus size={16} strokeWidth={2.5} /> Add file
        </button>
      </div>

      <GlassCard BRAND={BRAND} className="p-4 space-y-3">
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: BRAND.muted }}>
          Accessories
        </div>
        {[
          { label: "Paper points", opts: RCT_PAPER_POINTS, val: paper, set: setPaper },
          { label: "Obturation tips", opts: RCT_OBTURATION, val: obtura, set: setObtura },
          { label: "Irrigation needles", opts: RCT_NEEDLES, val: needle, set: setNeedle },
        ].map(({ label, opts, val, set }) => (
          <div key={label} className="grid grid-cols-2 gap-2">
            <select
              value={val.type ?? (val as { size?: string }).size ?? ""}
              onChange={(e) => set({ ...(val as object), [label === "Paper points" ? "size" : "type"]: e.target.value } as never)}
              className="h-10 px-2 rounded-lg text-xs outline-none"
              style={selectStyle}
            >
              <option value="">— {label} —</option>
              {opts.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              value={val.qty}
              onChange={(e) => set({ ...(val as object), qty: Math.max(0, parseInt(e.target.value, 10) || 0) } as never)}
              className="h-10 px-2 rounded-lg text-xs text-center outline-none"
              style={selectStyle}
            />
          </div>
        ))}
      </GlassCard>

      <GlassCard BRAND={BRAND} className="p-3">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Additional notes…"
          className="w-full bg-transparent border-0 resize-none text-sm focus:outline-none"
          style={{ color: BRAND.ink }}
        />
      </GlassCard>

      <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 pt-3" style={{ background: `linear-gradient(to top, ${BRAND.paper} 65%, transparent)` }}>
        <div className="max-w-3xl mx-auto">
          <Button BRAND={BRAND} full disabled={busy} onClick={submit}>
            {busy ? "Placing…" : <>Place endo order <ChevronRight size={18} strokeWidth={2.5} /></>}
          </Button>
        </div>
      </div>
      <div className="text-[11px] text-center flex items-center justify-center gap-1.5" style={{ color: BRAND.muted }}>
        <Download size={11} /> The PDF is emailed to the clinic and downloaded here.
      </div>
    </div>
  );
}
