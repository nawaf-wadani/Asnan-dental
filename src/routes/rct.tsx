import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, ChevronLeft, Plus, Trash2, Download, Mail, Copy, CircleDot, Send, Moon, Sun, Home } from "lucide-react";

const BRAND_LIGHT = {
  primary: "#897BB9",
  primaryDark: "#6B5E9E",
  primaryDeep: "#564B82",
  ink: "#1D1D1F",
  paper: "#F5F5F7",
  surface: "rgba(255,255,255,0.72)",
  surfaceSolid: "#FFFFFF",
  muted: "#86868B",
  border: "rgba(0,0,0,0.08)",
  borderSolid: "#E5E5EA",
  danger: "#FF3B30",
  dangerBg: "rgba(255,59,48,0.08)",
  success: "#34C759",
  warning: "#FF9500",
  warningBg: "rgba(255,149,0,0.1)",
  glass: "rgba(255,255,255,0.6)",
  glassBorder: "rgba(255,255,255,0.3)",
  cardShadow: "0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
  isDark: false,
};

const BRAND_DARK = {
  primary: "#A99BD4",
  primaryDark: "#BDB1DE",
  primaryDeep: "#D1C8E8",
  ink: "#F5F5F7",
  paper: "#000000",
  surface: "rgba(28,28,30,0.72)",
  surfaceSolid: "#1C1C1E",
  muted: "#98989D",
  border: "rgba(255,255,255,0.08)",
  borderSolid: "#38383A",
  danger: "#FF453A",
  dangerBg: "rgba(255,69,58,0.12)",
  success: "#30D158",
  warning: "#FF9F0A",
  warningBg: "rgba(255,159,10,0.12)",
  glass: "rgba(28,28,30,0.6)",
  glassBorder: "rgba(255,255,255,0.06)",
  cardShadow: "0 2px 8px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.3)",
  isDark: true,
};

function AsnanLogo({ size = 36 }) {
  return (
    <img src="/logo.jpeg" alt="Asnan Dental" width={size * 1.5} height={size} style={{ objectFit: "contain" }} />
  );
}

function FontLink() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
      input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
      body { font-family: 'Manrope', system-ui, sans-serif; }
      ::-webkit-scrollbar { width: 0; height: 0; }
    `}</style>
  );
}

function escapeHtml(s: string | null | undefined) {
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c));
}

const todayIso = () => new Date().toISOString().slice(0, 10);

function safeGet<T>(key: string, defaultVal: T): T {
  try {
    if (typeof window === "undefined") return defaultVal;
    const r = localStorage.getItem(key);
    return r ? JSON.parse(r) : defaultVal;
  } catch {
    return defaultVal;
  }
}

const RCT_FILE_TYPES = [
  "WaveOne Gold Small",
  "WaveOne Gold Primary",
  "WaveOne Gold Medium",
  "WaveOne Gold Large",
  "WaveOne Gold SX",
  "WaveOne (Original) Small",
  "WaveOne (Original) Primary",
  "WaveOne (Original) Large",
  "WaveOne Gold Glider",
];
const RCT_TAPERS = [
  ".02 / #15",
  ".02 / #20",
  ".04 / #25 (Primary)",
  ".06 / #25 (Primary+)",
  ".03 / #25 (Small)",
  ".05 / #35 (Medium)",
  ".08 / #45 (Large)",
  "Other",
];
const RCT_LENGTHS = ["21 mm", "25 mm", "31 mm"];
const RCT_DENTISTS = ["Dr. Lara", "Dr. Jasmine", "Dr. Dunya", "Dr. Sirwan"];

function RCTStandalonePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [dentist, setDentist] = useState("");
  const [otherDentist, setOtherDentist] = useState("");
  const [rctDate, setRctDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [urgency, setUrgency] = useState("Routine");
  const [fileRows, setFileRows] = useState([{ id: 1, type: "WaveOne Gold Primary", taper: ".04 / #25 (Primary)", length: "25 mm", qty: 1 }]);
  const [paperSize, setPaperSize] = useState("");
  const [paperQty, setPaperQty] = useState(0);
  const [obturaType, setObturaType] = useState("");
  const [obturaQty, setObturaQty] = useState(0);
  const [needleType, setNeedleType] = useState("");
  const [needleQty, setNeedleQty] = useState(0);
  const [notes, setNotes] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [nextId, setNextId] = useState(2);

  useEffect(() => {
    const settings = safeGet<{ darkMode?: boolean }>("asnan:settings", { darkMode: false });
    setDarkMode(!!settings.darkMode);
  }, []);

  const BRAND = darkMode ? BRAND_DARK : BRAND_LIGHT;

  const getDentistName = () => dentist === "other" ? (otherDentist.trim() || "Other Provider") : dentist;

  const addFileRow = () => {
    setFileRows((p) => [...p, { id: nextId, type: RCT_FILE_TYPES[0], taper: RCT_TAPERS[0], length: RCT_LENGTHS[1], qty: 1 }]);
    setNextId((n) => n + 1);
  };

  const removeFileRow = (id: number) => setFileRows((p) => p.filter((r) => r.id !== id));

  const updateFileRow = (id: number, field: string, value: string | number) => {
    setFileRows((p) => p.map((r) => r.id === id ? { ...r, [field]: value } : r));
  };

  const accessories: string[] = [];
  if (paperSize && paperQty > 0) accessories.push(`Paper Points (${paperSize}) x${paperQty}`);
  if (obturaType && obturaQty > 0) accessories.push(`${obturaType} x${obturaQty}`);
  if (needleType && needleQty > 0) accessories.push(`Irrigation Needles (${needleType}) x${needleQty}`);

  const handleGenerate = () => {
    if (!dentist) { alert("Please select a dentist."); return; }
    if (fileRows.length === 0) { alert("Add at least one file."); return; }
    setShowSummary(true);
  };

  const buildRctPlainText = () => {
    const dateStr = rctDate ? new Date(rctDate + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
    let out = `ASNAN DENTAL — WAVONE ENDO SUPPLY ORDER\n`;
    out += `${"=".repeat(50)}\n`;
    out += `Dentist: ${getDentistName()}\n`;
    out += `Date: ${dateStr}\n`;
    out += `Urgency: ${urgency}\n`;
    out += `\nFILES ORDERED\n${"-".repeat(16)}\n`;
    fileRows.forEach((r) => {
      out += `  ${r.qty}× ${r.type} — ${r.taper} — ${r.length}\n`;
    });
    if (accessories.length > 0) {
      out += `\nACCESSORIES\n${"-".repeat(16)}\n`;
      accessories.forEach((a) => { out += `  • ${a}\n`; });
    }
    if (notes.trim()) out += `\nNOTES: ${notes}\n`;
    out += `\n${"=".repeat(50)}\nGenerated ${new Date().toLocaleString()}\n`;
    return out;
  };

  const handleRctEmail = () => {
    const dateStr = rctDate ? new Date(rctDate + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
    const subject = `Asnan Dental — WaveOne Order — ${getDentistName()} — ${dateStr}`;
    const body = buildRctPlainText();
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleRctCopyText = async () => {
    try {
      await navigator.clipboard.writeText(buildRctPlainText());
      alert("Order copied to clipboard");
    } catch { alert("Could not copy — try another browser"); }
  };

  const handleRctSendToConfirm = () => {
    handlePrint();
    const dateStr = rctDate ? new Date(rctDate + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
    const subject = `Order Confirmation — WaveOne Endo — ${getDentistName()} — ${dateStr}`;
    const body = buildRctPlainText() + "\n\n---\nPlease find the order document attached to this email.";
    setTimeout(() => {
      window.location.href = `mailto:Nawaf@asnandental.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 500);
  };

  const handlePrint = () => {
    const dateStr = rctDate ? new Date(rctDate + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const urgColors = { Routine: "#059669", Priority: "#F59E0B", Urgent: "#DC2626" };
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Asnan Dental — WaveOne Order</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Manrope', -apple-system, system-ui, sans-serif; color: ${BRAND_LIGHT.ink}; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .header { background: ${BRAND_LIGHT.primary}; color: white; padding: 24px 28px; border-radius: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
  .header-left { display: flex; align-items: center; gap: 16px; }
  .logo-img { width: 60px; height: 60px; object-fit: contain; border-radius: 8px; }
  .logo-text { line-height: 1; }
  .logo-text .l1, .logo-text .l2 { display: block; font-weight: 800; letter-spacing: 0.18em; font-size: 14px; }
  .logo-text .l2 { margin-top: 4px; }
  .doc-title { text-align: right; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.85; }
  .doc-title strong { display: block; font-size: 20px; letter-spacing: -0.01em; text-transform: none; margin-top: 4px; font-weight: 700; }
  .meta { display: flex; gap: 32px; padding: 16px 0 24px; border-bottom: 2px solid ${BRAND_LIGHT.borderSolid}; margin-bottom: 24px; flex-wrap: wrap; }
  .meta-item .meta-label { color: ${BRAND_LIGHT.muted}; text-transform: uppercase; letter-spacing: 0.18em; font-weight: 600; font-size: 9px; margin-bottom: 4px; }
  .meta-item .meta-value { font-size: 16px; font-weight: 600; color: ${BRAND_LIGHT.ink}; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
  th { text-align: left; padding: 8px 10px; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: ${BRAND_LIGHT.muted}; border-bottom: 1px solid ${BRAND_LIGHT.borderSolid}; font-weight: 600; }
  td { padding: 9px 10px; border-bottom: 1px solid #F0F0F2; }
  td.qty { text-align: right; font-weight: 700; font-size: 14px; color: ${BRAND_LIGHT.primaryDeep}; width: 60px; }
  h2.section { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: ${BRAND_LIGHT.primaryDeep}; margin: 22px 0 10px; padding-bottom: 6px; border-bottom: 1.5px solid ${BRAND_LIGHT.primary}; font-weight: 700; }
  .notes-block { background: ${BRAND_LIGHT.warningBg}; border-left: 3px solid ${BRAND_LIGHT.warning}; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; line-height: 1.5; }
  .notes-block strong { display: block; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #92400E; margin-bottom: 4px; }
  .footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid ${BRAND_LIGHT.borderSolid}; font-size: 9px; color: ${BRAND_LIGHT.muted}; text-align: center; letter-spacing: 0.15em; text-transform: uppercase; }
  @media screen { body { background: #F0F0F5; padding: 32px; } .doc { background: white; max-width: 800px; margin: 0 auto; padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.08); border-radius: 12px; } }
  @media print { body { background: white; padding: 0; } .doc { box-shadow: none; padding: 0; max-width: none; } }
</style></head><body><div class="doc">
  <div class="header">
    <div class="header-left">
      <img class="logo-img" src="/logo.jpeg" alt="Asnan Dental" />
      <div class="logo-text"><span class="l1">ASNAN</span><span class="l2">DENTAL</span></div>
    </div>
    <div class="doc-title">WaveOne Endo Supply Order<strong>${dateStr}</strong></div>
  </div>
  <div class="meta">
    <div class="meta-item"><div class="meta-label">Dentist</div><div class="meta-value">${escapeHtml(getDentistName())}</div></div>
    <div class="meta-item"><div class="meta-label">Date</div><div class="meta-value">${dateStr}</div></div>
    <div class="meta-item"><div class="meta-label">Urgency</div><div class="meta-value" style="color:${urgColors[urgency as keyof typeof urgColors]};font-weight:700;">${urgency}</div></div>
  </div>
  <h2 class="section">Files Ordered</h2>
  <table><thead><tr><th>File Type</th><th>Taper / Size</th><th>Length</th><th style="text-align:right;">Qty</th></tr></thead>
  <tbody>${fileRows.map((r) => `<tr><td>${escapeHtml(r.type)}</td><td>${escapeHtml(r.taper)}</td><td>${escapeHtml(r.length)}</td><td class="qty">${r.qty}</td></tr>`).join("")}</tbody></table>
  ${accessories.length > 0 ? `<h2 class="section">Accessories</h2>${accessories.map((a) => `<p style="font-size:12px;margin:6px 0 6px 8px;">• ${escapeHtml(a)}</p>`).join("")}` : ""}
  ${notes.trim() ? `<div class="notes-block"><strong>Notes</strong>${escapeHtml(notes)}</div>` : ""}
  <div class="footer">Asnan Dental · WaveOne Order · Generated ${new Date().toLocaleString()}</div>
</div></body></html>`;

    const dateFilename = rctDate || todayIso();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Asnan-WaveOne-Order-${dateFilename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const urgColors = { Routine: BRAND.success, Priority: BRAND.warning, Urgent: BRAND.danger };

  if (showSummary) {
    const dateStr = rctDate ? new Date(rctDate + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
    return (
      <div className="min-h-screen pb-32" style={{ background: BRAND.paper, color: BRAND.ink, fontFamily: "'Manrope', system-ui, sans-serif" }}>
        <FontLink />
        <header className="sticky top-0 z-30 border-b" style={{ background: BRAND.glass, backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)", borderColor: BRAND.glassBorder }}>
          <div className="px-4 pt-3 pb-3 flex items-center gap-3">
            <button onClick={() => setShowSummary(false)} className="w-9 h-9 -ml-1 flex items-center justify-center rounded-full transition-apple hover-scale" style={{ color: BRAND.ink }}><ChevronLeft size={20} strokeWidth={2.5} /></button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <AsnanLogo size={26} />
              <div className="flex flex-col leading-none ml-0.5">
                <span className="text-[11px] font-bold tracking-[0.18em]" style={{ color: BRAND.ink }}>ASNAN</span>
                <span className="text-[11px] font-bold tracking-[0.18em] mt-0.5" style={{ color: BRAND.ink }}>DENTAL</span>
              </div>
            </div>
            <button onClick={() => setDarkMode((d) => !d)} className="w-9 h-9 flex items-center justify-center rounded-full hover-scale transition-apple" style={{ color: BRAND.muted }} aria-label="Toggle dark">
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
          <div className="px-4 pb-2 text-[11px] tracking-wide" style={{ color: BRAND.muted }}>WaveOne Order Summary</div>
        </header>

        <div className="px-5 pt-5">
          <div className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: BRAND.muted }}>WaveOne Order</div>
          <h2 className="text-[28px] leading-tight font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>Order Summary</h2>

          <div className="mt-4 rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${BRAND.ink} 0%, ${BRAND.isDark ? '#2C2C2E' : '#3A3A3C'} 100%)`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><div className="text-[10px] uppercase tracking-[0.15em]" style={{ color: BRAND.primary }}>Dentist</div><div className="text-sm font-bold mt-1">{getDentistName()}</div></div>
              <div><div className="text-[10px] uppercase tracking-[0.15em]" style={{ color: BRAND.primary }}>Date</div><div className="text-sm font-bold mt-1 tabular-nums">{dateStr}</div></div>
              <div><div className="text-[10px] uppercase tracking-[0.15em]" style={{ color: BRAND.primary }}>Urgency</div><div className="text-sm font-bold mt-1" style={{ color: urgColors[urgency as keyof typeof urgColors] }}>{urgency}</div></div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <CircleDot size={13} style={{ color: BRAND.primary }} />
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: BRAND.primary }}>Files Ordered</span>
              <div className="h-px flex-1" style={{ background: `${BRAND.primary}30` }} />
            </div>
            <div className="rounded-2xl divide-y overflow-hidden" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
              {fileRows.map((r) => (
                <div key={r.id} className="p-3 flex items-center justify-between" style={{ borderColor: BRAND.border }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold" style={{ color: BRAND.ink }}>{r.type}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: BRAND.muted }}>{r.taper} · {r.length}</div>
                  </div>
                  <div className="min-w-[32px] h-7 px-2 rounded-lg text-white text-xs font-bold flex items-center justify-center" style={{ background: BRAND.primary }}>{r.qty}</div>
                </div>
              ))}
            </div>
          </div>

          {accessories.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: BRAND.muted }}>Accessories</div>
              {accessories.map((a, i) => (
                <div key={i} className="text-sm py-1" style={{ color: BRAND.ink }}>• {a}</div>
              ))}
            </div>
          )}

          {notes.trim() && (
            <div className="mt-4 rounded-2xl p-3 border" style={{ background: `${BRAND.warning}10`, borderColor: `${BRAND.warning}30` }}>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: BRAND.warning }}>Notes</div>
              <div className="text-sm" style={{ color: BRAND.ink }}>{notes}</div>
            </div>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 pt-2" style={{ background: `linear-gradient(to top, ${BRAND.paper} 60%, transparent)` }}>
          <div className="flex flex-col gap-2 max-w-md mx-auto">
            <button onClick={handleRctSendToConfirm} className="w-full h-14 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 transition-apple hover-scale active:scale-[0.98]" style={{ background: BRAND.success, boxShadow: `0 4px 16px ${BRAND.success}30` }}>
              <Send size={16} strokeWidth={2.5} /> Send to Confirm Order
            </button>
            <button onClick={handlePrint} className="w-full h-14 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 transition-apple hover-scale active:scale-[0.98]" style={{ background: BRAND.primary, boxShadow: `0 4px 16px ${BRAND.primary}30` }}>
              <Download size={16} strokeWidth={2.5} /> Download Order
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleRctEmail} className="h-11 rounded-2xl text-xs font-semibold transition-apple hover-lift flex items-center justify-center gap-1.5" style={{ border: `1px solid ${BRAND.glassBorder}`, color: BRAND.ink, background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: BRAND.cardShadow }}>
                <Mail size={13} /> Email
              </button>
              <button onClick={handleRctCopyText} className="h-11 rounded-2xl text-xs font-semibold transition-apple hover-lift flex items-center justify-center gap-1.5" style={{ border: `1px solid ${BRAND.glassBorder}`, color: BRAND.ink, background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: BRAND.cardShadow }}>
                <Copy size={13} /> Copy Text
              </button>
            </div>
            <button onClick={() => setShowSummary(false)} className="h-11 rounded-2xl text-xs font-semibold transition-apple hover-scale flex items-center justify-center gap-1.5" style={{ color: BRAND.muted }}>
              <ChevronLeft size={14} strokeWidth={2.5} /> Edit Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-32 ${BRAND.isDark ? 'mesh-gradient-dark' : 'mesh-gradient-light'}`} style={{ background: BRAND.paper, color: BRAND.ink, fontFamily: "'Manrope', system-ui, sans-serif" }}>
      <FontLink />
      <header className="sticky top-0 z-30 border-b" style={{ background: BRAND.glass, backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)", borderColor: BRAND.glassBorder }}>
        <div className="px-4 pt-3 pb-3 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <AsnanLogo size={26} />
            <div className="flex flex-col leading-none ml-0.5">
              <span className="text-[11px] font-bold tracking-[0.18em]" style={{ color: BRAND.ink }}>ASNAN</span>
              <span className="text-[11px] font-bold tracking-[0.18em] mt-0.5" style={{ color: BRAND.ink }}>DENTAL</span>
            </div>
          </div>
          <button onClick={() => setDarkMode((d) => !d)} className="w-9 h-9 flex items-center justify-center rounded-full hover-scale transition-apple" style={{ color: BRAND.muted }} aria-label="Toggle dark">
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
        <div className="px-4 pb-2 text-[11px] tracking-wide" style={{ color: BRAND.muted }}>RCT Rotary File System</div>
      </header>

      <div className="px-5 pt-5">
        <h2 className="text-[28px] leading-tight font-bold" style={{ letterSpacing: "-0.02em" }}>
          WaveOne<br /><span style={{ color: BRAND.primary }}>Endodontic Order</span>
        </h2>

        {/* Dentist & Date */}
        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-2" style={{ color: BRAND.muted }}>
            Dentist & Order Info
            <div className="h-px flex-1" style={{ background: BRAND.border }} />
          </div>
          <div className="rounded-2xl p-4" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: BRAND.muted }}>
                  Dentist <span style={{ color: BRAND.danger }}>*</span>
                </label>
                <select value={dentist} onChange={(e) => { setDentist(e.target.value); if (e.target.value !== "other") setOtherDentist(""); }} className="w-full h-11 px-3 rounded-xl text-sm outline-none transition-apple" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}>
                  <option value="">— Select dentist —</option>
                  {RCT_DENTISTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  <option value="other">Other Provider</option>
                </select>
                {dentist === "other" && (
                  <input type="text" value={otherDentist} onChange={(e) => setOtherDentist(e.target.value)} placeholder="Enter provider name…" className="mt-2 w-full h-11 px-3 rounded-xl text-sm outline-none transition-apple" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }} />
                )}
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: BRAND.muted }}>Order Date</label>
                <input type="date" value={rctDate} min={todayIso()} onChange={(e) => setRctDate(e.target.value < todayIso() ? todayIso() : e.target.value)} className="w-full h-11 px-3 rounded-xl text-sm outline-none transition-apple" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink, colorScheme: BRAND.isDark ? "dark" : "light" }} />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: BRAND.muted }}>Urgency</label>
                <div className="flex gap-2">
                  {(["Routine", "Priority", "Urgent"] as const).map((u) => (
                    <button key={u} onClick={() => setUrgency(u)} className="flex-1 h-10 rounded-xl text-xs font-semibold transition-apple hover-scale" style={{ background: urgency === u ? (u === "Urgent" ? BRAND.danger : BRAND.primary) : "transparent", color: urgency === u ? "white" : BRAND.muted, border: `1px solid ${urgency === u ? (u === "Urgent" ? BRAND.danger : BRAND.primary) : BRAND.border}`, boxShadow: urgency === u ? `0 2px 8px ${u === "Urgent" ? BRAND.danger : BRAND.primary}30` : "none" }}>
                      {u === "Routine" ? "Routine" : u === "Priority" ? "Priority" : "Urgent"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* File rows */}
        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-2" style={{ color: BRAND.muted }}>
            WaveOne File Order
            <div className="h-px flex-1" style={{ background: BRAND.border }} />
          </div>

          <div className="space-y-3">
            {fileRows.map((row) => (
              <div key={row.id} className="rounded-2xl p-3" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>File Type</label>
                    <select value={row.type} onChange={(e) => updateFileRow(row.id, "type", e.target.value)} className="w-full h-10 px-2 rounded-lg text-xs outline-none" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}>
                      {RCT_FILE_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Taper / Size</label>
                    <select value={row.taper} onChange={(e) => updateFileRow(row.id, "taper", e.target.value)} className="w-full h-10 px-2 rounded-lg text-xs outline-none" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}>
                      {RCT_TAPERS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Length</label>
                      <select value={row.length} onChange={(e) => updateFileRow(row.id, "length", e.target.value)} className="w-full h-10 px-2 rounded-lg text-xs outline-none" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}>
                        {RCT_LENGTHS.map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="w-16">
                      <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Qty</label>
                      <input type="number" min={1} max={99} value={row.qty} onChange={(e) => updateFileRow(row.id, "qty", Math.max(1, parseInt(e.target.value) || 1))} className="w-full h-10 px-2 rounded-lg text-xs border outline-none text-center font-bold" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }} />
                    </div>
                  </div>
                </div>
                {fileRows.length > 1 && (
                  <button onClick={() => removeFileRow(row.id)} className="mt-2 text-[10px] font-semibold flex items-center gap-1" style={{ color: BRAND.danger }}>
                    <Trash2 size={11} /> Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addFileRow} className="mt-2 w-full h-12 rounded-2xl border-2 border-dashed text-sm font-semibold flex items-center justify-center gap-2 transition-apple hover-scale" style={{ borderColor: BRAND.border, color: BRAND.muted }}>
            <Plus size={16} strokeWidth={2.5} /> Add File
          </button>
        </div>

        {/* Accessories */}
        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-2" style={{ color: BRAND.muted }}>
            Accessories & Consumables
            <div className="h-px flex-1" style={{ background: BRAND.border }} />
          </div>
          <div className="rounded-2xl p-4 space-y-3" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Paper Points</label>
                <select value={paperSize} onChange={(e) => setPaperSize(e.target.value)} className="w-full h-10 px-2 rounded-lg text-xs outline-none" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}>
                  <option value="">— None —</option>
                  <option>Small (15-20)</option><option>Medium (25-30)</option><option>Large (35-40)</option><option>Assorted</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Paper Pts Qty</label>
                <input type="number" min={0} value={paperQty} onChange={(e) => setPaperQty(Math.max(0, parseInt(e.target.value) || 0))} className="w-full h-10 px-2 rounded-lg text-xs border outline-none text-center" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Obturation Tips</label>
                <select value={obturaType} onChange={(e) => setObturaType(e.target.value)} className="w-full h-10 px-2 rounded-lg text-xs outline-none" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}>
                  <option value="">— None —</option>
                  <option>WaveOne Small Tips</option><option>WaveOne Primary Tips</option><option>WaveOne Large Tips</option><option>WaveOne Gold Glider Tips</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Obtura Qty</label>
                <input type="number" min={0} value={obturaQty} onChange={(e) => setObturaQty(Math.max(0, parseInt(e.target.value) || 0))} className="w-full h-10 px-2 rounded-lg text-xs border outline-none text-center" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Irrigation Needles</label>
                <select value={needleType} onChange={(e) => setNeedleType(e.target.value)} className="w-full h-10 px-2 rounded-lg text-xs outline-none" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}>
                  <option value="">— None —</option>
                  <option>27G (1.5")</option><option>30G (1")</option><option>NaviTip 30G</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Needle Qty</label>
                <input type="number" min={0} value={needleQty} onChange={(e) => setNeedleQty(Math.max(0, parseInt(e.target.value) || 0))} className="w-full h-10 px-2 rounded-lg text-xs border outline-none text-center" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }} />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-2" style={{ color: BRAND.muted }}>
            Additional Notes
            <div className="h-px flex-1" style={{ background: BRAND.border }} />
          </div>
          <div className="rounded-2xl p-3" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions or requests…" rows={3} className="w-full bg-transparent border-0 resize-none text-sm leading-relaxed focus:outline-none placeholder:opacity-50" style={{ color: BRAND.ink }} />
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 pt-2" style={{ background: `linear-gradient(to top, ${BRAND.paper} 60%, transparent)` }}>
        <div className="flex flex-col gap-2 max-w-md mx-auto">
          <button onClick={handleGenerate} className="w-full h-14 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 transition-apple hover-scale active:scale-[0.98]" style={{ background: BRAND.primary, boxShadow: `0 4px 16px ${BRAND.primary}30` }}>
            Generate Summary <ChevronRight size={18} strokeWidth={2.5} />
          </button>
          <Link to="/" className="h-11 rounded-2xl text-xs font-semibold transition-apple hover-scale flex items-center justify-center gap-1.5" style={{ color: BRAND.muted }}>
            <Home size={14} strokeWidth={2.5} /> Back to Main Page
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/rct")({
  component: RCTStandalonePage,
});
