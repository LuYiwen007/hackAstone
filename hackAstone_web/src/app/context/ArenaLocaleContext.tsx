import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchArenaI18n } from "../../shared/api/arena";
import {
  DEFAULT_LOCALE,
  formatMessage,
  LOCALE_STORAGE_KEY,
  normalizeLocale,
  readStoredLocale,
  type ArenaLocale,
} from "../../shared/i18n/format";

export type ArenaLocaleContextValue = {
  locale: ArenaLocale;
  setLocale: (locale: ArenaLocale) => void;
  strings: Record<string, string>;
  t: (key: string, vars?: Record<string, string | number>) => string;
  i18nReady: boolean;
  i18nError: string | null;
};

const ArenaLocaleContext = createContext<ArenaLocaleContextValue | null>(null);

export function ArenaLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<ArenaLocale>(() => readStoredLocale());
  const [strings, setStrings] = useState<Record<string, string>>({});
  const [i18nReady, setI18nReady] = useState(false);
  const [i18nError, setI18nError] = useState<string | null>(null);

  const loadStrings = useCallback((nextLocale: ArenaLocale) => {
    setI18nReady(false);
    fetchArenaI18n(nextLocale)
      .then((data) => {
        const next = data.strings ?? {};
        setStrings(next);
        setI18nError(null);
        setI18nReady(true);
        const title = next["app.title"];
        if (title) document.title = title;
      })
      .catch((e: Error) => {
        setI18nError(e.message);
        setStrings({});
        setI18nReady(true);
      });
  }, []);

  useEffect(() => {
    loadStrings(locale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale, loadStrings]);

  const setLocale = useCallback((next: ArenaLocale) => {
    setLocaleState(normalizeLocale(next));
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const template = strings[key];
      if (!template) return key;
      return formatMessage(template, vars);
    },
    [strings]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      strings,
      t,
      i18nReady,
      i18nError,
    }),
    [locale, setLocale, strings, t, i18nReady, i18nError]
  );

  return (
    <ArenaLocaleContext.Provider value={value}>{children}</ArenaLocaleContext.Provider>
  );
}

export function useArenaLocale(): ArenaLocaleContextValue {
  const ctx = useContext(ArenaLocaleContext);
  if (!ctx) {
    throw new Error("useArenaLocale must be used within ArenaLocaleProvider");
  }
  return ctx;
}

export function philosopherDisplayName(
  philosopher: { name: string; nameCN: string },
  locale: ArenaLocale
): string {
  return locale === "zh" ? philosopher.nameCN : philosopher.name;
}
