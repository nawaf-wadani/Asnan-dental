import { useState, useEffect, useCallback, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle, AlertTriangle, X, Zap, Home } from "lucide-react";
import DigitalInventory, { type CustomInventoryItem } from "@/components/DigitalInventory";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  reorderThreshold: number;
  supplier?: string | null;
  itemNumber?: string | null;
  photo?: string | null;
}

interface ToastMsg {
  id: number;
  msg: string;
  type: "info" | "warning" | "success";
}

function safeGet<T>(key: string, defaultVal: T): T {
  try {
    if (typeof window === "undefined") return defaultVal;
    const r = localStorage.getItem(key);
    return r ? JSON.parse(r) : defaultVal;
  } catch {
    return defaultVal;
  }
}

async function fetchInventoryFromDb(): Promise<InventoryItem[]> {
  try {
    const res = await fetch("/api/inventory");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function saveInventoryToDb(items: InventoryItem[]): Promise<void> {
  try {
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  } catch {}
}

const BRAND_LIGHT = {
  primary: "#897BB9",
  primaryDark: "#6B5E9E",
  ink: "#1D1D1F",
  paper: "#F5F5F7",
  surface: "rgba(255,255,255,0.72)",
  muted: "#86868B",
  border: "rgba(0,0,0,0.08)",
  borderSolid: "#E5E5EA",
  success: "#34C759",
  warning: "#FF9500",
  danger: "#FF3B30",
  glass: "rgba(255,255,255,0.6)",
  glassBorder: "rgba(255,255,255,0.3)",
  cardShadow: "0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
  isDark: false,
};

const BRAND_DARK = {
  primary: "#A99BD4",
  primaryDark: "#BDB1DE",
  ink: "#F5F5F7",
  paper: "#000000",
  surface: "rgba(28,28,30,0.72)",
  muted: "#98989D",
  border: "rgba(255,255,255,0.08)",
  borderSolid: "#38383A",
  success: "#30D158",
  warning: "#FF9F0A",
  danger: "#FF453A",
  glass: "rgba(28,28,30,0.6)",
  glassBorder: "rgba(255,255,255,0.06)",
  cardShadow: "0 2px 8px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.3)",
  isDark: true,
};

function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const toastIdRef = useRef(0);
  const dbSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const BRAND = darkMode ? BRAND_DARK : BRAND_LIGHT;

  useEffect(() => {
    (async () => {
      const settings = safeGet<{ darkMode?: boolean }>("asnan:settings", { darkMode: false });
      setDarkMode(!!settings.darkMode);

      const dbItems = await fetchInventoryFromDb();
      setInventory(dbItems);
      setLoading(false);
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (dbSaveTimerRef.current) clearTimeout(dbSaveTimerRef.current);
    dbSaveTimerRef.current = setTimeout(() => {
      saveInventoryToDb(inventory);
    }, 800);
    return () => {
      if (dbSaveTimerRef.current) clearTimeout(dbSaveTimerRef.current);
    };
  }, [inventory, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const interval = setInterval(() => {
      const settings = safeGet<{ darkMode?: boolean }>("asnan:settings", { darkMode: false });
      setDarkMode(!!settings.darkMode);
    }, 1000);
    return () => clearInterval(interval);
  }, [hydrated]);

  const showToast = useCallback((msg: string, type: ToastMsg["type"] = "info") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const handleUseItem = useCallback((itemId: string) => {
    setInventory((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== itemId) return item;
        const newQty = Math.max(0, item.quantity - 1);
        return { ...item, quantity: newQty };
      });

      const item = updated.find((it) => it.id === itemId);
      if (item && item.quantity <= (item.reorderThreshold || 1)) {
        showToast(`${item.name} stock is low.`, "warning");
      }

      return updated;
    });
  }, [showToast]);

  const handleRestockItem = useCallback((itemId: string) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }, []);

  const handleAddCustomItem = useCallback((custom: CustomInventoryItem) => {
    setInventory((prev) => {
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newItem: InventoryItem = {
        id,
        name: custom.name,
        category: custom.category,
        quantity: custom.quantity,
        reorderThreshold: custom.reorderThreshold,
        supplier: custom.supplier,
        itemNumber: custom.itemNumber,
        photo: custom.photo,
      };
      return [...prev, newItem];
    });
    showToast(`${custom.name} added to inventory.`, "success");
  }, [showToast]);

  if (!hydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BRAND.paper }}>
        <div className="animate-pulse text-sm" style={{ color: BRAND.muted }}>Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BRAND.paper, color: BRAND.ink, fontFamily: "'Manrope', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        <DigitalInventory
          inventory={inventory}
          onUseItem={handleUseItem}
          onRestockItem={handleRestockItem}
          onAddCustomItem={handleAddCustomItem}
          darkMode={darkMode}
        />
      </div>

      <div className="px-5 py-6 max-w-2xl mx-auto w-full flex justify-center">
        <Link to="/" className="h-11 px-6 rounded-2xl text-xs font-semibold transition-apple hover-scale flex items-center justify-center gap-1.5" style={{ color: BRAND.muted, border: `1px solid ${BRAND.border}` }}>
          <Home size={14} strokeWidth={2.5} /> Back to Main Page
        </Link>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: "90vw" }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto animate-slide-up rounded-2xl px-5 py-3 flex items-center gap-3"
            style={{
              background: BRAND.isDark ? "rgba(28,28,30,0.92)" : "rgba(255,255,255,0.95)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: `1px solid ${t.type === "warning" ? BRAND.warning + "40" : t.type === "success" ? BRAND.success + "40" : BRAND.glassBorder}`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)",
              color: BRAND.ink,
            }}
          >
            {t.type === "warning" && <AlertTriangle size={16} style={{ color: BRAND.warning, flexShrink: 0 }} />}
            {t.type === "success" && <CheckCircle size={16} style={{ color: BRAND.success, flexShrink: 0 }} />}
            {t.type === "info" && <Zap size={16} style={{ color: BRAND.primary, flexShrink: 0 }} />}
            <span className="text-sm font-medium">{t.msg}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="ml-1 flex-shrink-0 opacity-50 hover:opacity-100 transition-apple"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/inventory")({
  component: InventoryPage,
});
