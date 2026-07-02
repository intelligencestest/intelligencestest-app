"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  DEFAULT_LOCALE,
  LANGUAGE_COOKIE,
  LANGUAGE_COOKIE_MAX_AGE,
  LANGUAGE_OVERRIDE_COOKIE,
  LANGUAGE_OVERRIDE_STORAGE_KEY,
  LANGUAGE_STORAGE_KEY,
  type AppLocale,
  toAppLocale,
} from "@/lib/i18n/locales";

const LOCALES: Array<{ value: AppLocale; short: string; labelKey: "english" | "spanish" }> = [
  { value: "es", short: "ES", labelKey: "spanish" },
  { value: "en", short: "EN", labelKey: "english" },
];

function persistLanguage(locale: AppLocale) {
  document.cookie = `${LANGUAGE_COOKIE}=${locale}; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE}; samesite=lax`;
  document.cookie = `${LANGUAGE_OVERRIDE_COOKIE}=1; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE}; samesite=lax`;
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  window.localStorage.setItem(LANGUAGE_OVERRIDE_STORAGE_KEY, "1");
}

interface LanguageSwitcherProps {
  variant?: "dashboard" | "candidate" | "settings";
  className?: string;
  preserveLangParam?: boolean;
  showLabel?: boolean;
  onLocaleChange?: (locale: AppLocale) => void;
}

export default function LanguageSwitcher({
  variant = "dashboard",
  className = "",
  preserveLangParam = false,
  showLabel = true,
  onLocaleChange,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const intlLocale = toAppLocale(useLocale());
  const t = useTranslations("language");
  const [selected, setSelected] = useState<AppLocale>(intlLocale);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryLang = params.get("lang");
    const queryLocale = queryLang === "en" || queryLang === "es" ? queryLang : null;

    if (preserveLangParam && queryLocale) {
      setSelected(queryLocale);
      if (queryLocale !== intlLocale) {
        persistLanguage(queryLocale);
        router.refresh();
      }
      return;
    }

    const savedLocale =
      window.localStorage.getItem(LANGUAGE_OVERRIDE_STORAGE_KEY) === "1"
        ? toAppLocale(window.localStorage.getItem(LANGUAGE_STORAGE_KEY), intlLocale)
        : null;

    if (savedLocale && savedLocale !== intlLocale) {
      setSelected(savedLocale);
      persistLanguage(savedLocale);
      router.refresh();
      return;
    }

    setSelected(intlLocale);
  }, [intlLocale, preserveLangParam, router]);

  function setLanguage(locale: AppLocale) {
    setSelected(locale);
    persistLanguage(locale);
    onLocaleChange?.(locale);

    startTransition(() => {
      if (preserveLangParam) {
        const params = new URLSearchParams(window.location.search);
        if (locale === DEFAULT_LOCALE) {
          params.delete("lang");
        } else {
          params.set("lang", locale);
        }
        const nextQuery = params.toString();
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
      }
      router.refresh();
    });
  }

  const compact = variant === "candidate";
  const outerClass =
    variant === "candidate"
      ? "inline-flex items-center rounded-full border border-[#1E2240] bg-[#0D1020]/92 p-1 shadow-2xl shadow-black/25 backdrop-blur"
      : variant === "settings"
        ? "inline-flex w-full items-center rounded-xl border border-[#1E2240] bg-[#07080F] p-1"
        : "inline-flex items-center gap-2 rounded-xl border border-[#1E2240] bg-[#0D1020] p-1 shadow-lg shadow-black/15";

  return (
    <div className={`${outerClass} ${className}`} aria-label={t("switcher")}>
      {showLabel && !compact && (
        <span className="hidden whitespace-nowrap px-2 text-xs font-medium text-slate-500 sm:inline">
          {t("switcher")}
        </span>
      )}
      <div className="flex min-w-0 items-center gap-1">
        {LOCALES.map((locale) => {
          const active = selected === locale.value;
          return (
            <button
              key={locale.value}
              type="button"
              onClick={() => setLanguage(locale.value)}
              disabled={isPending && active}
              className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/45 disabled:cursor-wait sm:px-3 ${
                active
                  ? "bg-[#1D4ED8] text-white shadow-[0_10px_24px_rgba(29,78,216,0.25)]"
                  : "text-slate-400 hover:bg-[#1E2240]/70 hover:text-slate-100"
              } ${variant === "settings" ? "flex-1 py-2.5 text-sm" : ""}`}
              aria-pressed={active}
              aria-label={t(locale.labelKey)}
            >
              <span className={compact ? "sr-only" : "hidden sm:inline"}>{t(locale.labelKey)}</span>
              <span className={compact ? "" : "sm:hidden"}>{locale.short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
