import { useState } from "react";
import { Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { brandFor } from "@/lib/brand";
import { useDarkMode } from "@/lib/useDarkMode";


export default function LoginScreen() {
  const { login } = useAuth();
  const [dark] = useDarkMode();
  const BRAND = brandFor(dark);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign in. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: BRAND.paper, color: BRAND.ink, fontFamily: "'Manrope', system-ui, sans-serif" }}
    >
      
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl p-6 animate-slide-up"
        style={{ background: BRAND.surfaceSolid, boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})` }}
          >
            <Lock size={22} color="#fff" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] font-bold" style={{ color: BRAND.muted }}>
              Asnan Dental
            </div>
            <h1 className="text-2xl font-bold leading-tight mt-0.5">Supply Ordering</h1>
          </div>
        </div>

        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mt-7 mb-2" style={{ color: BRAND.muted }}>
          Email
        </label>
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          required
          className="w-full h-12 px-4 rounded-2xl outline-none text-base"
          style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1.5px solid ${BRAND.border}`, color: BRAND.ink }}
        />

        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mt-4 mb-2" style={{ color: BRAND.muted }}>
          Password
        </label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full h-12 px-4 rounded-2xl outline-none text-base"
          style={{
            background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
            border: `1.5px solid ${error ? BRAND.danger : BRAND.border}`,
            color: BRAND.ink,
          }}
        />
        {error && (
          <div className="mt-2 text-xs font-semibold" style={{ color: BRAND.danger }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full h-12 rounded-2xl text-white text-sm font-semibold transition-apple hover-scale disabled:opacity-50"
          style={{ background: BRAND.primary, boxShadow: `0 4px 16px ${BRAND.primary}44` }}
        >
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
