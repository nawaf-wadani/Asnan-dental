import { useCallback, useEffect, useState } from "react";
import { safeGet, safeSet, STORAGE_KEYS } from "./storage";

/** App-wide dark-mode preference, persisted per device and synced across tabs. */
export function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState<boolean>(() => safeGet(STORAGE_KEYS.darkMode, false));

  useEffect(() => {
    safeSet(STORAGE_KEYS.darkMode, dark);
  }, [dark]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.darkMode && e.newValue != null) {
        try {
          setDark(JSON.parse(e.newValue));
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback(() => setDark((d) => !d), []);
  return [dark, toggle];
}
