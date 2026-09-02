/**
 * Centralised, validated access to environment variables.
 * Throws a clear error at first use if a required var is missing, rather than
 * failing deep inside a request with an opaque message.
 */

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

function optional(name: string, fallback = ""): string {
  const v = process.env[name];
  return v && v.trim() !== "" ? v : fallback;
}

export const env = {
  get authSecret(): string {
    return required("AUTH_SECRET");
  },
  get adminEmail(): string {
    return required("ADMIN_EMAIL").trim().toLowerCase();
  },
  get adminPassword(): string {
    return optional("ADMIN_PASSWORD");
  },
  get sessionHours(): number {
    const n = Number(optional("SESSION_HOURS", "12"));
    return Number.isFinite(n) && n > 0 ? n : 12;
  },
  smtp: {
    get host() {
      return optional("SMTP_HOST", "smtp.gmail.com");
    },
    get port() {
      const n = Number(optional("SMTP_PORT", "465"));
      return Number.isFinite(n) ? n : 465;
    },
    get user() {
      return required("SMTP_USER");
    },
    get pass() {
      return required("SMTP_PASS");
    },
    get from() {
      return optional("SMTP_FROM") || required("SMTP_USER");
    },
  },
  get orderEmailTo(): string[] {
    return optional("ORDER_EMAIL_TO")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  },
  get ccAssistant(): boolean {
    return optional("ORDER_EMAIL_CC_ASSISTANT", "true").toLowerCase() === "true";
  },
  get appOrigin(): string {
    return optional("APP_ORIGIN") || optional("URL") || "";
  },
  /** True when SMTP is fully configured; lets order placement degrade gracefully. */
  get emailConfigured(): boolean {
    return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
  },
};
