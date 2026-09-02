import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  ShoppingCart,
  Sparkles,
  Search,
  Star,
  TrendingUp,
  Download,
  Mail,
  AlertCircle,
} from "lucide-react";
import type { CatalogItem, PlaceOrderResult } from "@shared/types";
import { PAIRINGS, RECOMMENDED_ADDITIONS, type CatalogCategory } from "@shared/catalog";
import { URGENCIES, type Urgency } from "@shared/rct";
import { catalogApi, ordersApi, statsApi, ApiError, type FrequentItem } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { brandFor } from "@/lib/brand";
import { useDarkMode } from "@/lib/useDarkMode";
import { todayIso, downloadBase64, classNames } from "@/lib/format";
import { safeGet, safeSet, safeDelete, STORAGE_KEYS } from "@/lib/storage";
import { iconFor } from "@/data/categoryIcons";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/ui/toast";
import { GlassCard, Button, Field, TextInput, QtyControl, ModalShell, Spinner } from "@/components/ui/primitives";
import {
  SpecialRequestsEditor,
  newSpecialRequest,
  type SpecialRequestDraft,
} from "@/components/order/SpecialRequests";

type Step = "intro" | "browse" | "review" | "done";
const FAV_KEY = "asnan:favorites";

interface DraftShape {
  assistantName: string;
  orderDate: string;
  urgency: Urgency;
  notes: string;
  quantities: Record<string, number>;
  specials: SpecialRequestDraft[];
  step: Step;
}

export default function OrderApp() {
  return (
    <AppShell title="Supply Ordering">
      <OrderFlow />
    </AppShell>
  );
}

function fuzzy(text: string, q: string): boolean {
  const t = text.toLowerCase();
  const query = q.toLowerCase().trim();
  if (!query) return true;
  if (t.includes(query)) return true;
  let i = 0;
  for (const c of t) {
    if (c === query[i]) i++;
    if (i === query.length) return true;
  }
  return false;
}

function OrderFlow() {
  const { user } = useAuth();
  const [dark] = useDarkMode();
  const BRAND = brandFor(dark);
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [frequent, setFrequent] = useState<FrequentItem[]>([]);

  const [step, setStep] = useState<Step>("intro");
  const [assistantName, setAssistantName] = useState(user?.displayName ?? "");
  const [orderDate, setOrderDate] = useState(todayIso());
  const [urgency, setUrgency] = useState<Urgency>("Routine");
  const [notes, setNotes] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [specials, setSpecials] = useState<SpecialRequestDraft[]>([newSpecialRequest()]);

  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => safeGet<string[]>(FAV_KEY, []));
  const [showRecommended, setShowRecommended] = useState(false);
  const [pairFor, setPairFor] = useState<string | null>(null);

  const [placing, setPlacing] = useState(false);
  const [result, setResult] = useState<PlaceOrderResult | null>(null);
  const hydratedRef = useRef(false);

  // ---- load catalogue + restore draft ----
  useEffect(() => {
    (async () => {
      try {
        const [{ items, categories }, freq] = await Promise.all([
          catalogApi.list(),
          statsApi.frequent(12).catch(() => ({ items: [] as FrequentItem[] })),
        ]);
        setCatalog(items);
        setCategories(categories);
        setFrequent(freq.items);

        const draft = safeGet<DraftShape | null>(STORAGE_KEYS.draft, null);
        if (
          draft &&
          draft.step &&
          draft.step !== "intro" &&
          (Object.keys(draft.quantities ?? {}).length > 0 || (draft.specials ?? []).some((s) => s.text))
        ) {
          setAssistantName(draft.assistantName || user?.displayName || "");
          setOrderDate(draft.orderDate >= todayIso() ? draft.orderDate : todayIso());
          setUrgency(draft.urgency ?? "Routine");
          setNotes(draft.notes ?? "");
          setQuantities(draft.quantities ?? {});
          setSpecials(draft.specials?.length ? draft.specials : [newSpecialRequest()]);
          setStep(draft.step);
          toast("Draft from your last session restored", "info");
        }
      } catch (err) {
        toast(err instanceof ApiError ? err.message : "Could not load the catalog", "error");
      } finally {
        setLoading(false);
        hydratedRef.current = true;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- autosave draft ----
  useEffect(() => {
    if (!hydratedRef.current || step === "intro" || step === "done") return;
    const t = setTimeout(() => {
      safeSet(STORAGE_KEYS.draft, { assistantName, orderDate, urgency, notes, quantities, specials, step } as DraftShape);
    }, 400);
    return () => clearTimeout(t);
  }, [assistantName, orderDate, urgency, notes, quantities, specials, step]);

  const bySku = useMemo(() => new Map(catalog.map((c) => [c.sku, c])), [catalog]);

  const setQty = useCallback(
    (sku: string, qty: number) => {
      setQuantities((prev) => {
        const next = { ...prev };
        if (qty <= 0) delete next[sku];
        else next[sku] = Math.min(9999, qty);
        const wasZero = !prev[sku];
        if (wasZero && qty > 0 && PAIRINGS[sku]) setTimeout(() => setPairFor(sku), 200);
        return next;
      });
    },
    [],
  );

  const toggleFav = (sku: string) =>
    setFavorites((prev) => {
      const next = prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku];
      safeSet(FAV_KEY, next);
      return next;
    });

  const totalUnits = useMemo(() => Object.values(quantities).reduce((s, n) => s + n, 0), [quantities]);
  const validSpecials = specials.filter((s) => s.text.trim());
  const specialsMissingPhoto = validSpecials.filter((s) => !s.photo);
  const lineCount = Object.keys(quantities).length;
  const canReview = totalUnits > 0 || validSpecials.length > 0;
  const canProceedIntro = assistantName.trim().length > 0 && orderDate >= todayIso();

  const placeOrder = async () => {
    if (specialsMissingPhoto.length > 0) {
      toast(`${specialsMissingPhoto.length} special request(s) still need a photo`, "warning");
      setActiveCat("__special__");
      setStep("browse");
      return;
    }
    setPlacing(true);
    try {
      const res = await ordersApi.place({
        assistantName: assistantName.trim(),
        orderDate,
        urgency,
        notes: notes.trim(),
        lines: Object.entries(quantities).map(([sku, qty]) => ({ sku, qty })),
        specialRequests: validSpecials.map((s) => ({ text: s.text.trim(), photoUrl: s.photo })),
      });
      setResult(res);
      setStep("done");
      safeDelete(STORAGE_KEYS.draft);
      downloadBase64(res.pdfBase64, res.pdfFilename);
      if (res.emailSent) toast("Order emailed and downloaded", "success");
      else toast(`Order saved & downloaded, but email failed: ${res.emailError ?? "unknown"}`, "warning");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not place the order", "error");
    } finally {
      setPlacing(false);
    }
  };

  const startNew = () => {
    setQuantities({});
    setSpecials([newSpecialRequest()]);
    setNotes("");
    setUrgency("Routine");
    setOrderDate(todayIso());
    setResult(null);
    setStep("intro");
    safeDelete(STORAGE_KEYS.draft);
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner label="Loading the catalog…" />
      </div>
    );
  }

  // ---------------------------------------------------------------- INTRO ---
  if (step === "intro") {
    return (
      <div className="space-y-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: BRAND.muted }}>
            Inventory Ordering
          </div>
          <h1 className="text-3xl font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>
            Stock the operatory.
          </h1>
        </div>

        <GlassCard BRAND={BRAND} className="p-5 space-y-4">
          <Field BRAND={BRAND} label="Assistant's name" required>
            <TextInput BRAND={BRAND} value={assistantName} onChange={(e) => setAssistantName(e.target.value)} placeholder="Who is ordering today?" />
          </Field>
          <Field BRAND={BRAND} label="Date of order" required hint="Defaults to today. Past dates are not allowed.">
            <TextInput
              BRAND={BRAND}
              type="date"
              value={orderDate}
              min={todayIso()}
              onChange={(e) => setOrderDate(e.target.value < todayIso() ? todayIso() : e.target.value)}
              style={{ colorScheme: dark ? "dark" : "light" }}
            />
          </Field>
          <Field BRAND={BRAND} label="Urgency">
            <div className="flex gap-2">
              {URGENCIES.map((u) => (
                <button
                  key={u}
                  onClick={() => setUrgency(u)}
                  className="flex-1 h-10 rounded-xl text-xs font-semibold transition-apple"
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

        <Button BRAND={BRAND} full disabled={!canProceedIntro} onClick={() => setStep("browse")}>
          Begin order <ChevronRight size={18} strokeWidth={2.5} />
        </Button>
        <button
          onClick={() => setShowRecommended(true)}
          className="w-full h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
          style={{ color: BRAND.muted }}
        >
          <Sparkles size={13} /> View catalog gap analysis
        </button>

        {showRecommended && <RecommendedModal BRAND={BRAND} onClose={() => setShowRecommended(false)} />}
      </div>
    );
  }

  // --------------------------------------------------------------- BROWSE ---
  if (step === "browse") {
    const isSpecial = activeCat === "__special__";
    const catItems = activeCat && !isSpecial ? catalog.filter((c) => c.category === activeCat) : [];
    const searchResults = search.trim()
      ? catalog.filter((c) => fuzzy(c.name, search) || fuzzy(c.manufacturer ?? "", search)).slice(0, 60)
      : [];

    return (
      <div className="space-y-4">
        <StepHeader BRAND={BRAND} onBack={() => (activeCat ? setActiveCat(null) : setStep("intro"))} label={isSpecial ? "Special requests" : activeCat ? bySku.get(catItems[0]?.sku)?.categoryLabel ?? "Category" : "Browse catalog"} />

        {!activeCat && (
          <>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: BRAND.primary }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search all items, manufacturers…"
                className="w-full h-12 pl-11 pr-4 rounded-2xl text-sm outline-none"
                style={{ background: BRAND.glass, border: `2px solid ${search ? BRAND.primary : BRAND.border}`, color: BRAND.ink }}
              />
            </div>

            {search.trim() ? (
              <div className="space-y-2">
                {searchResults.length === 0 && (
                  <p className="text-sm text-center py-8" style={{ color: BRAND.muted }}>
                    Nothing matches “{search}”. Try special requests.
                  </p>
                )}
                {searchResults.map((it) => (
                  <ItemRow key={it.sku} BRAND={BRAND} item={it} qty={quantities[it.sku] ?? 0} onQty={(q) => setQty(it.sku, q)} fav={favorites.includes(it.sku)} onFav={() => toggleFav(it.sku)} />
                ))}
              </div>
            ) : (
              <>
                {frequent.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: BRAND.muted }}>
                      <TrendingUp size={11} /> Frequently ordered
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {frequent.map((f) => {
                        const qty = quantities[f.sku] ?? 0;
                        return (
                          <button
                            key={f.sku}
                            onClick={() => setQty(f.sku, qty + 1)}
                            className="flex-shrink-0 w-40 rounded-2xl p-3 text-left"
                            style={{ background: BRAND.glass, border: `1px solid ${qty > 0 ? BRAND.primary : BRAND.glassBorder}` }}
                          >
                            <div className="text-xs font-semibold leading-snug line-clamp-2" style={{ color: BRAND.ink, minHeight: "2.4em" }}>
                              {f.name}
                            </div>
                            <div className="text-[10px] mt-1" style={{ color: BRAND.muted }}>
                              {f.manufacturer} · ordered {f.count}×
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {categories.map((cat, i) => {
                    const Icon = iconFor(cat.key);
                    const count = catalog.filter((c) => c.category === cat.key).reduce((s, c) => s + (quantities[c.sku] ?? 0), 0);
                    return (
                      <button
                        key={cat.key}
                        onClick={() => setActiveCat(cat.key)}
                        className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-apple hover-scale"
                        style={{ background: BRAND.glass, border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}
                      >
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND.primary}18`, color: BRAND.primary }}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: BRAND.muted }}>
                            {String(i + 1).padStart(2, "0")}
                            {count > 0 && <span className="ml-2 px-1.5 py-0.5 rounded-full text-white" style={{ background: BRAND.primary }}>{count} added</span>}
                          </div>
                          <div className="text-base font-bold mt-0.5" style={{ color: BRAND.ink }}>
                            {cat.label}
                          </div>
                        </div>
                        <ChevronRight size={18} style={{ color: BRAND.muted }} />
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setActiveCat("__special__")}
                    className="w-full rounded-2xl p-4 flex items-center gap-4 text-left text-white transition-apple hover-scale"
                    style={{ background: `linear-gradient(135deg, ${BRAND.ink}, ${BRAND.isDark ? "#2C2C2E" : "#3A3A3C"})` }}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND.primary}44` }}>
                      <Sparkles size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: BRAND.primary }}>
                        Anything else
                      </div>
                      <div className="text-base font-bold mt-0.5">Special requests</div>
                      <div className="text-xs mt-0.5 text-white/60">Not in the catalog · photo required</div>
                    </div>
                    <ChevronRight size={18} className="text-white/60" />
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {activeCat && !isSpecial && (
          <div className="space-y-2">
            {catItems.map((it) => (
              <ItemRow key={it.sku} BRAND={BRAND} item={it} qty={quantities[it.sku] ?? 0} onQty={(q) => setQty(it.sku, q)} fav={favorites.includes(it.sku)} onFav={() => toggleFav(it.sku)} />
            ))}
          </div>
        )}

        {isSpecial && <SpecialRequestsEditor BRAND={BRAND} requests={specials} onChange={setSpecials} />}

        <StickyBar BRAND={BRAND}>
          <Button BRAND={BRAND} variant="ghost" onClick={() => (activeCat ? setActiveCat(null) : setStep("intro"))}>
            <ChevronLeft size={16} /> Back
          </Button>
          <Button BRAND={BRAND} full disabled={!canReview} onClick={() => setStep("review")}>
            Review order · {totalUnits + validSpecials.length}
          </Button>
        </StickyBar>

        {pairFor && <PairingModal BRAND={BRAND} sku={pairFor} bySku={bySku} quantities={quantities} setQty={setQty} onClose={() => setPairFor(null)} />}
        {showRecommended && <RecommendedModal BRAND={BRAND} onClose={() => setShowRecommended(false)} />}
      </div>
    );
  }

  // --------------------------------------------------------------- REVIEW ---
  if (step === "review") {
    const grouped = new Map<string, { item: CatalogItem; qty: number }[]>();
    for (const [sku, qty] of Object.entries(quantities)) {
      const item = bySku.get(sku);
      if (!item) continue;
      const key = item.categoryLabel;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push({ item, qty });
    }

    return (
      <div className="space-y-4">
        <StepHeader BRAND={BRAND} onBack={() => setStep("browse")} label="Review order" />

        <GlassCard BRAND={BRAND} className="p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: BRAND.muted }}>
              Assistant
            </div>
            <div className="font-bold">{assistantName}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: BRAND.muted }}>
              {orderDate} · {urgency}
            </div>
            <div className="font-bold">{totalUnits + validSpecials.length} lines</div>
          </div>
        </GlassCard>

        <GlassCard BRAND={BRAND} className="p-3">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5" style={{ color: BRAND.muted }}>
            Order notes (optional)
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Rush — needed by Friday."
            className="w-full bg-transparent border-0 resize-none text-sm focus:outline-none"
            style={{ color: BRAND.ink }}
          />
        </GlassCard>

        {[...grouped.entries()].map(([label, rows]) => (
          <div key={label}>
            <div className="text-[11px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: BRAND.primary }}>
              {label}
            </div>
            <GlassCard BRAND={BRAND} className="divide-y" style={{ borderColor: BRAND.border }}>
              {rows.map(({ item, qty }) => (
                <div key={item.sku} className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold" style={{ color: BRAND.ink }}>
                      {item.name}
                    </div>
                    <div className="text-[11px]" style={{ color: BRAND.muted }}>
                      {item.manufacturer} · {item.pkg}
                    </div>
                  </div>
                  <QtyControl BRAND={BRAND} qty={qty} onChange={(q) => setQty(item.sku, q)} compact />
                </div>
              ))}
            </GlassCard>
          </div>
        ))}

        {validSpecials.length > 0 && (
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] font-bold mb-2">Special requests</div>
            <GlassCard BRAND={BRAND} className="divide-y" style={{ borderColor: BRAND.border }}>
              {validSpecials.map((s, i) => (
                <div key={s.id} className="p-3 flex gap-3 items-start">
                  <span className="text-[10px] font-bold pt-1" style={{ color: BRAND.muted }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 text-sm" style={{ color: BRAND.ink }}>
                    {s.text}
                  </div>
                  {s.photo ? (
                    <img src={s.photo} alt="" className="w-14 h-14 rounded-lg object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: BRAND.dangerBg, color: BRAND.danger }}>
                      No photo
                    </span>
                  )}
                </div>
              ))}
            </GlassCard>
          </div>
        )}

        {specialsMissingPhoto.length > 0 && (
          <div className="px-3 py-2 rounded-xl text-xs flex items-center gap-2" style={{ background: BRAND.dangerBg, color: BRAND.danger }}>
            <AlertCircle size={14} /> {specialsMissingPhoto.length} special request(s) need a photo before you can place the order.
          </div>
        )}

        <StickyBar BRAND={BRAND}>
          <Button BRAND={BRAND} variant="ghost" onClick={() => setStep("browse")}>
            <ChevronLeft size={16} /> Edit
          </Button>
          <Button BRAND={BRAND} full variant="success" disabled={placing || !canReview} onClick={placeOrder}>
            {placing ? "Placing…" : <>Place order <Check size={16} strokeWidth={2.5} /></>}
          </Button>
        </StickyBar>
      </div>
    );
  }

  // ----------------------------------------------------------------- DONE ---
  return (
    <div className="py-10 text-center space-y-4">
      <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})` }}>
        <Check size={30} strokeWidth={2.5} />
      </div>
      <h1 className="text-2xl font-bold">Order #{result?.order.id} placed</h1>
      <p className="text-sm" style={{ color: BRAND.muted }}>
        {result?.emailSent
          ? "The PDF was emailed to the clinic and downloaded to this device."
          : "The PDF was downloaded to this device. Email delivery did not go through — forward the file manually."}
      </p>
      <div className="flex flex-col gap-2 max-w-xs mx-auto pt-2">
        {result && (
          <Button BRAND={BRAND} onClick={() => downloadBase64(result.pdfBase64, result.pdfFilename)}>
            <Download size={15} /> Download PDF again
          </Button>
        )}
        {result && !result.emailSent && (
          <a
            href={`mailto:?subject=${encodeURIComponent(`Asnan Dental Order #${result.order.id}`)}`}
            className="h-11 rounded-2xl text-sm font-semibold inline-flex items-center justify-center gap-2"
            style={{ border: `1px solid ${BRAND.border}`, color: BRAND.muted }}
          >
            <Mail size={15} /> Open email app
          </a>
        )}
        <Button BRAND={BRAND} variant="ghost" onClick={startNew}>
          Start a new order
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- helpers ---

function StepHeader({ BRAND, onBack, label }: { BRAND: ReturnType<typeof brandFor>; onBack: () => void; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onBack} className="w-9 h-9 -ml-1 flex items-center justify-center rounded-full" style={{ color: BRAND.ink }} aria-label="Back">
        <ChevronLeft size={20} strokeWidth={2.5} />
      </button>
      <h2 className="text-lg font-bold">{label}</h2>
    </div>
  );
}

function StickyBar({ BRAND, children }: { BRAND: ReturnType<typeof brandFor>; children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 pt-3" style={{ background: `linear-gradient(to top, ${BRAND.paper} 65%, transparent)` }}>
      <div className="max-w-3xl mx-auto flex gap-2">{children}</div>
    </div>
  );
}

function ItemRow({
  BRAND,
  item,
  qty,
  onQty,
  fav,
  onFav,
}: {
  BRAND: ReturnType<typeof brandFor>;
  item: CatalogItem;
  qty: number;
  onQty: (q: number) => void;
  fav: boolean;
  onFav: () => void;
}) {
  return (
    <div
      className={classNames("rounded-2xl p-3 flex items-start gap-3")}
      style={{
        background: BRAND.glass,
        border: `1px solid ${qty > 0 ? BRAND.primary : BRAND.glassBorder}`,
        boxShadow: qty > 0 ? `inset 3px 0 0 ${BRAND.primary}` : "none",
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold leading-snug" style={{ color: BRAND.ink }}>
          {item.name}
        </div>
        <div className="text-[11px] mt-1" style={{ color: BRAND.muted }}>
          {item.manufacturer} · {item.pkg} · SKU {item.sku}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <button onClick={onFav} aria-label="Favourite" className="w-7 h-7 flex items-center justify-center">
          <Star size={14} fill={fav ? BRAND.primary : "none"} color={fav ? BRAND.primary : BRAND.muted} />
        </button>
        <QtyControl BRAND={BRAND} qty={qty} onChange={onQty} />
      </div>
    </div>
  );
}

function PairingModal({
  BRAND,
  sku,
  bySku,
  quantities,
  setQty,
  onClose,
}: {
  BRAND: ReturnType<typeof brandFor>;
  sku: string;
  bySku: Map<string, CatalogItem>;
  quantities: Record<string, number>;
  setQty: (sku: string, q: number) => void;
  onClose: () => void;
}) {
  const source = bySku.get(sku);
  const pairs = (PAIRINGS[sku] ?? []).map((s) => bySku.get(s)).filter((x): x is CatalogItem => !!x);
  if (!source || pairs.length === 0) return null;
  return (
    <ModalShell BRAND={BRAND} title="Often ordered together" subtitle="Suggestion" onClose={onClose} footer={<Button BRAND={BRAND} full onClick={onClose}>Done</Button>}>
      <p className="text-xs mb-3" style={{ color: BRAND.muted }}>
        You added <strong style={{ color: BRAND.ink }}>{source.name}</strong>. Add these too?
      </p>
      <div className="space-y-2">
        {pairs.map((it) => (
          <div key={it.sku} className="rounded-xl p-3 flex items-center gap-3" style={{ border: `1px solid ${quantities[it.sku] ? BRAND.primary : BRAND.border}` }}>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ color: BRAND.ink }}>
                {it.name}
              </div>
              <div className="text-[11px]" style={{ color: BRAND.muted }}>
                {it.manufacturer} · {it.pkg}
              </div>
            </div>
            <QtyControl BRAND={BRAND} qty={quantities[it.sku] ?? 0} onChange={(q) => setQty(it.sku, q)} compact />
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

function RecommendedModal({ BRAND, onClose }: { BRAND: ReturnType<typeof brandFor>; onClose: () => void }) {
  return (
    <ModalShell BRAND={BRAND} title="Recommended additions" subtitle="Gap analysis" onClose={onClose} footer={<Button BRAND={BRAND} full onClick={onClose}>Got it</Button>}>
      <p className="text-xs mb-4" style={{ color: BRAND.muted }}>
        Consumables not detected in the current catalog. Add them via special requests or the admin catalog editor.
      </p>
      <ul className="space-y-3">
        {RECOMMENDED_ADDITIONS.map((r, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-[10px] font-bold pt-0.5 w-6" style={{ color: BRAND.primary }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <div className="text-sm font-semibold" style={{ color: BRAND.ink }}>
                {r.name}
              </div>
              <div className="text-[11px] italic" style={{ color: BRAND.muted }}>
                {r.reason}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </ModalShell>
  );
}
