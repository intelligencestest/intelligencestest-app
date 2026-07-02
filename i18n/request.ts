import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { LANGUAGE_COOKIE, detectLocaleFromHeader, isAppLocale } from "@/lib/i18n/locales";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const raw = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const locale = isAppLocale(raw) ? raw : detectLocaleFromHeader(headerStore.get("accept-language"));

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
