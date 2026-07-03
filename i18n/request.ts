import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LANGUAGE_COOKIE, isAppLocale } from "@/lib/i18n/locales";

// The lang cookie is a cache of the workspace (company) language, written
// only at auth boundaries. Browser language never decides the locale:
// public pages render in the product default until a workspace is known.
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const locale = isAppLocale(raw) ? raw : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
