/** Local per-device preferences only (dark mode, in-progress order draft).
 *  Never used for anything authoritative — that all lives in the database. */

export function safeGet<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function safeSet(key: string, value: unknown): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or privacy mode — ignore */
  }
}

export function safeDelete(key: string): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const STORAGE_KEYS = {
  darkMode: "asnan:dark-mode",
  draft: "asnan:order-draft",
} as const;
