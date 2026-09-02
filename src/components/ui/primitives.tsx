import { useEffect, type ReactNode } from "react";
import { X, Minus, Plus, Loader2 } from "lucide-react";
import type { BrandPalette } from "@/lib/brand";
import { classNames } from "@/lib/format";

export function AsnanLogo({ size = 26 }: { size?: number }) {
  return <img src="/logo.jpeg" alt="Asnan Dental" width={size * 1.5} height={size} style={{ objectFit: "contain" }} />;
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm" style={{ opacity: 0.7 }}>
      <Loader2 size={16} className="animate-spin" />
      {label ?? "Loading…"}
    </div>
  );
}

export function GlassCard({
  BRAND,
  children,
  className,
  style,
}: {
  BRAND: BrandPalette;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={classNames("rounded-2xl", className)}
      style={{
        background: BRAND.glass,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${BRAND.glassBorder}`,
        boxShadow: BRAND.cardShadow,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Button({
  BRAND,
  variant = "primary",
  full,
  children,
  ...rest
}: {
  BRAND: BrandPalette;
  variant?: "primary" | "ghost" | "danger" | "success";
  full?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const bg =
    variant === "primary"
      ? BRAND.primary
      : variant === "danger"
        ? BRAND.danger
        : variant === "success"
          ? BRAND.success
          : "transparent";
  const color = variant === "ghost" ? BRAND.muted : "#fff";
  return (
    <button
      {...rest}
      className={classNames(
        "h-11 px-5 rounded-2xl text-sm font-semibold transition-apple hover-scale inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed",
        full && "w-full",
        rest.className,
      )}
      style={{
        background: bg,
        color,
        border: variant === "ghost" ? `1px solid ${BRAND.border}` : "none",
        boxShadow: variant === "ghost" ? "none" : `0 4px 14px ${bg}44`,
        ...rest.style,
      }}
    >
      {children}
    </button>
  );
}

export function Field({
  BRAND,
  label,
  hint,
  children,
  required,
}: {
  BRAND: BrandPalette;
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: BRAND.muted }}>
        {label} {required && <span style={{ color: BRAND.primary }}>*</span>}
      </span>
      {children}
      {hint && (
        <span className="block text-[10px] mt-1.5" style={{ color: BRAND.muted }}>
          {hint}
        </span>
      )}
    </label>
  );
}

export function TextInput({
  BRAND,
  ...rest
}: { BRAND: BrandPalette } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={classNames("w-full h-11 px-3.5 rounded-xl text-sm outline-none transition-apple", rest.className)}
      style={{
        background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
        border: `1px solid ${BRAND.border}`,
        color: BRAND.ink,
        ...rest.style,
      }}
    />
  );
}

export function QtyControl({
  BRAND,
  qty,
  onChange,
  compact,
}: {
  BRAND: BrandPalette;
  qty: number;
  onChange: (q: number) => void;
  compact?: boolean;
}) {
  const size = compact ? "h-9" : "h-10";
  const btn = compact ? "w-9" : "w-10";
  if (qty <= 0) {
    return (
      <button
        onClick={() => onChange(1)}
        className={`${btn} ${size} rounded-full text-white flex items-center justify-center transition-apple hover-scale`}
        style={{ background: BRAND.primary, boxShadow: `0 2px 8px ${BRAND.primary}44` }}
        aria-label="Add"
      >
        <Plus size={compact ? 16 : 18} strokeWidth={2.5} />
      </button>
    );
  }
  return (
    <div
      className={`flex items-center rounded-full text-white ${size}`}
      style={{ background: `linear-gradient(135deg, ${BRAND.ink}, ${BRAND.isDark ? "#2C2C2E" : "#3A3A3C"})` }}
    >
      <button onClick={() => onChange(qty - 1)} className={`${btn} ${size} flex items-center justify-center`} aria-label="Decrease">
        <Minus size={14} strokeWidth={2.5} />
      </button>
      <input
        value={qty}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isFinite(n) ? Math.max(0, Math.min(9999, n)) : 0);
        }}
        inputMode="numeric"
        className="w-9 text-center text-sm font-bold bg-transparent outline-none"
        aria-label="Quantity"
      />
      <button onClick={() => onChange(qty + 1)} className={`${btn} ${size} flex items-center justify-center`} aria-label="Increase">
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export function ModalShell({
  BRAND,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  BRAND: BrandPalette;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[88vh] overflow-hidden flex flex-col animate-slide-up"
        style={{ background: BRAND.surfaceSolid, boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3 border-b flex items-start gap-3" style={{ borderColor: BRAND.border }}>
          <div className="flex-1">
            {subtitle && (
              <div className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: BRAND.muted }}>
                {subtitle}
              </div>
            )}
            <h3 className="text-xl leading-tight font-bold" style={{ color: BRAND.ink }}>
              {title}
            </h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ color: BRAND.muted }} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 flex-1">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t" style={{ borderColor: BRAND.border, background: BRAND.surface }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
