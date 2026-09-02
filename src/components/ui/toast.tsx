import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";

type ToastKind = "info" | "success" | "warning" | "error";
interface Toast {
  id: number;
  msg: string;
  kind: ToastKind;
}

const ToastContext = createContext<((msg: string, kind?: ToastKind) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const push = useCallback((msg: string, kind: ToastKind = "info") => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: "92vw" }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto animate-slide-up rounded-2xl px-4 py-3 flex items-center gap-3 text-sm font-medium"
            style={{
              background: "rgba(28,28,30,0.94)",
              color: "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {t.kind === "warning" && <AlertTriangle size={16} color="#FF9F0A" />}
            {t.kind === "error" && <AlertTriangle size={16} color="#FF453A" />}
            {t.kind === "success" && <CheckCircle size={16} color="#30D158" />}
            {t.kind === "info" && <Info size={16} color="#A99BD4" />}
            <span>{t.msg}</span>
            <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} className="opacity-60 hover:opacity-100" aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): (msg: string, kind?: ToastKind) => void {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
