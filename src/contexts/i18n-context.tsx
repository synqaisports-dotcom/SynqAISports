"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { AVAILABLE_LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n-config";

type Dictionary = Record<string, string>;

type I18nContextType = {
  locale: string;
  localeMeta: Locale;
  setLocale: (next: string) => Promise<void>;
  t: (key: string, fallback?: string) => string;
};

const STORAGE_KEY = "synq_locale_v1";

const I18nContext = createContext<I18nContextType>({
  locale: DEFAULT_LOCALE,
  localeMeta: AVAILABLE_LOCALES[0],
  setLocale: async () => {},
  t: (_key: string, fallback?: string) => fallback ?? "",
});

function normalizeLocale(input: string | null | undefined): string {
  const raw = String(input || "").toLowerCase().trim();
  if (!raw) return DEFAULT_LOCALE;
  const base = raw.split("-")[0];
  return AVAILABLE_LOCALES.some((l) => l.code === base) ? base : DEFAULT_LOCALE;
}

async function loadDictionary(locale: string): Promise<Dictionary> {
  const target = normalizeLocale(locale);
  const tryFetch = async (code: string): Promise<Dictionary | null> => {
    try {
      const res = await fetch(`/locales/${code}.json`, { cache: "no-store" });
      if (!res.ok) return null;
      return (await res.json()) as Dictionary;
    } catch {
      return null;
    }
  };
  return (await tryFetch(target)) ?? (await tryFetch("en")) ?? {};
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [locale, setLocaleState] = useState<string>(DEFAULT_LOCALE);
  const [dict, setDict] = useState<Dictionary>({});

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const userLocale = normalizeLocale((user?.user_metadata as Record<string, unknown> | undefined)?.preferred_locale as string);
    const browserLocale =
      typeof navigator !== "undefined" ? normalizeLocale(navigator.language) : DEFAULT_LOCALE;
    const initial = normalizeLocale(saved || userLocale || browserLocale);
    setLocaleState(initial);
  }, [user?.id]);

  useEffect(() => {
    let alive = true;
    loadDictionary(locale).then((d) => {
      if (!alive) return;
      setDict(d);
    });
    const meta = AVAILABLE_LOCALES.find((l) => l.code === locale) ?? AVAILABLE_LOCALES[0];
    if (typeof document !== "undefined") {
      document.documentElement.lang = meta.code;
      document.documentElement.dir = meta.dir ?? "ltr";
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, locale);
    }
    return () => {
      alive = false;
    };
  }, [locale]);

  const setLocale = async (next: string) => {
    const normalized = normalizeLocale(next);
    setLocaleState(normalized);
    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.auth.updateUser({
          data: {
            preferred_locale: normalized,
          },
        });
      } catch {
        // fail-soft: la preferencia local ya queda guardada.
      }
    }
  };

  const value = useMemo<I18nContextType>(() => {
    const localeMeta = AVAILABLE_LOCALES.find((l) => l.code === locale) ?? AVAILABLE_LOCALES[0];
    return {
      locale,
      localeMeta,
      setLocale,
      t: (key: string, fallback?: string) => dict[key] ?? fallback ?? key,
    };
  }, [locale, dict]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

