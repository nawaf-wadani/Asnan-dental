import { useEffect, useState } from "react";
import { AlertCircle, Check, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { brandFor } from "@/lib/brand";
import { useDarkMode } from "@/lib/useDarkMode";

/** The Asnan mark sits centred on a porcelain square; crop in so it reads as an app icon. */
function LogoTile({ size = 56 }: { size?: number }) {
  return (
    <span
      className="relative inline-block overflow-hidden flex-shrink-0"
      style={{ width: size, height: size, borderRadius: size * 0.28, background: "#F9F8FF" }}
    >
      <img
        src="/logo.jpeg"
        alt="Asnan Dental"
        style={{ position: "absolute", width: "230%", height: "230%", left: "-65%", top: "-65%", maxWidth: "none" }}
      />
    </span>
  );
}

const POINTS = ["Order supplies in a few taps", "See what is running low at a glance", "Add low-stock items straight to your order"];

export default function LoginScreen() {
  const { login } = useAuth();
  const [dark] = useDarkMode();
  const BRAND = brandFor(dark);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign in. Check your connection and try again");
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = {
    background: BRAND.surfaceSolid,
    border: `1.5px solid ${BRAND.borderSolid}`,
    color: BRAND.ink,
  } as const;
  const inputCls =
    "w-full h-14 px-4 rounded-xl text-base outline-none transition-apple focus:ring-4 focus:ring-[#80CDC4]/40 focus:border-[#6862A3]";

  return (
    <div className="min-h-screen grid md:grid-cols-[5fr_6fr]" style={{ background: BRAND.paper, color: BRAND.ink }}>
      {/* Brand panel */}
      <aside className="flex flex-col justify-between gap-8 px-7 py-8 md:px-12 md:py-12" style={{ background: "#6862A3", color: "#fff" }}>
        <div className="flex items-center gap-3">
          <LogoTile />
          <span className="text-lg font-semibold tracking-tight">Asnan Dental</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-[28px] leading-[1.15] md:text-[40px] font-light" style={{ letterSpacing: "-0.01em" }}>
            Supplies ordered, stock checked, back to your patients.
          </h1>
          <ul className="hidden md:block mt-8 space-y-3.5 text-base" style={{ color: "rgba(255,255,255,0.92)" }}>
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#80CDC4", color: "#1F3F3B" }}>
                  <Check size={14} strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="hidden md:block text-sm" style={{ color: "rgba(255,255,255,0.78)" }}>
          Asnan Dental · Staff supply ordering
        </p>
      </aside>

      {/* Sign-in */}
      <main className="flex items-center justify-center px-6 py-10 md:px-12">
        <form onSubmit={submit} className="w-full max-w-sm">
          <h2 className="text-[30px] font-semibold leading-tight" style={{ letterSpacing: "-0.01em" }}>
            {greeting}
          </h2>
          <p className="mt-2 text-base" style={{ color: BRAND.muted }}>
            Sign in with your clinic email.
          </p>

          <label htmlFor="email" className="block text-sm font-medium mt-8 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            required
            className={inputCls}
            style={inputStyle}
          />

          <label htmlFor="password" className="block text-sm font-medium mt-5 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`${inputCls} pr-14`}
              style={{ ...inputStyle, borderColor: error ? BRAND.danger : BRAND.borderSolid }}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg flex items-center justify-center"
              style={{ color: BRAND.muted }}
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 px-4 py-3 rounded-xl text-sm flex items-start gap-2.5"
              style={{ background: BRAND.dangerBg, color: BRAND.danger }}
            >
              <AlertCircle size={18} className="flex-shrink-0 mt-px" />
              <span>{error}. Check your email and password and try again.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full h-14 rounded-xl text-base font-semibold text-white transition-apple hover-scale disabled:opacity-60"
            style={{ background: "#6862A3" }}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-6 text-sm leading-relaxed" style={{ color: BRAND.muted }}>
            Forgot your password? Ask Nawaf or your office manager — they can reset it from the Admin page.
          </p>
        </form>
      </main>
    </div>
  );
}
