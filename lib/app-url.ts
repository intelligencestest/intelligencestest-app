const FALLBACK_APP_URL = "https://app.intelligencestest.com";

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_APP_URL).replace(/\/+$/, "");
}

export function appUrl(path = "") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${getAppUrl()}${cleanPath}`;
}
