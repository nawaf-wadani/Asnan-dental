import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Moon, Sun, LogOut, Package, Home, CircleDot, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { brandFor } from "@/lib/brand";
import { useDarkMode } from "@/lib/useDarkMode";
import { AsnanLogo, Spinner } from "@/components/ui/primitives";
import LoginScreen from "@/components/LoginScreen";

export function RequireAuth({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  const [dark] = useDarkMode();
  const BRAND = brandFor(dark);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BRAND.paper }}>
        
        <Spinner label="Checking your session…" />
      </div>
    );
  }
  if (!user) return <LoginScreen />;
  if (adminOnly && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center" style={{ background: BRAND.paper, color: BRAND.ink }}>
        
        <div>
          <Shield size={32} style={{ color: BRAND.muted, margin: "0 auto 12px" }} />
          <p className="font-semibold">Admin access required</p>
          <Link to="/" className="text-sm underline mt-2 inline-block" style={{ color: BRAND.primary }}>
            Back to ordering
          </Link>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

const NAV = [
  { to: "/", label: "Order", icon: Home },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/rct", label: "Endo", icon: CircleDot },
] as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { user, logout } = useAuth();
  const [dark, toggleDark] = useDarkMode();
  const BRAND = brandFor(dark);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div
      className="min-h-screen"
      style={{ background: BRAND.paper, color: BRAND.ink, fontFamily: "'Manrope', system-ui, sans-serif" }}
    >
      
      <header
        className="sticky top-0 z-30 border-b"
        style={{
          background: BRAND.glass,
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderColor: BRAND.glassBorder,
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <AsnanLogo size={24} />
          <div className="flex flex-col leading-none">
            <span className="text-[11px] font-bold tracking-[0.18em]" style={{ color: BRAND.ink }}>
              ASNAN DENTAL
            </span>
            <span className="text-[10px]" style={{ color: BRAND.muted }}>
              {title}
            </span>
          </div>

          <nav className="ml-auto flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className="h-9 px-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-apple"
                  style={{
                    background: active ? BRAND.primary : "transparent",
                    color: active ? "#fff" : BRAND.muted,
                  }}
                >
                  <Icon size={13} strokeWidth={2.5} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="h-9 px-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-apple"
                style={{ background: pathname.startsWith("/admin") ? BRAND.primary : "transparent", color: pathname.startsWith("/admin") ? "#fff" : BRAND.muted }}
              >
                <Shield size={13} strokeWidth={2.5} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <button onClick={toggleDark} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ color: BRAND.muted }} aria-label="Toggle dark mode">
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button onClick={() => void logout()} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ color: BRAND.muted }} aria-label="Sign out" title={user?.email}>
              <LogOut size={15} />
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-28 pt-5">{children}</main>
    </div>
  );
}
