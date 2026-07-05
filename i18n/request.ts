import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LANGUAGE_COOKIE, LOCALE_HEADER, isAppLocale } from "@/lib/i18n/locales";

// Locale resolution, in priority order:
//   1. The x-app-locale header set by the proxy for /es-prefixed requests (and
//      the English entry pages). This is what forces Spanish from the first
//      screen regardless of any stale cookie.
//   2. The lang cookie — a cache of the workspace (company) language, written
//      only at auth boundaries.
//   3. The product default (English).
// Browser language never decides the locale.
export default getRequestConfig(async () => {
  const headerStore = await headers();
  const headerLocale = headerStore.get(LOCALE_HEADER);

  const cookieStore = await cookies();
  const raw = isAppLocale(headerLocale) ? headerLocale : cookieStore.get(LANGUAGE_COOKIE)?.value;
  const locale = isAppLocale(raw) ? raw : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
