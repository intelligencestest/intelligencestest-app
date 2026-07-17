const DEFAULT_LOGO_HOSTS = ["intelligencestest.com", "www.intelligencestest.com", "app.intelligencestest.com"];
const ALLOWED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const MAX_LOGO_URL_LENGTH = 1000;

function hostFromUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function configuredHosts(): Set<string> {
  const hosts = new Set(DEFAULT_LOGO_HOSTS);
  const siteHost = hostFromUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const supabaseHost = hostFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (siteHost) hosts.add(siteHost);
  if (supabaseHost) hosts.add(supabaseHost);

  for (const host of (process.env.ALLOWED_LOGO_IMAGE_HOSTS ?? "").split(",")) {
    const normalized = host.trim().toLowerCase();
    if (normalized) hosts.add(normalized);
  }

  return hosts;
}

export function isAllowedLogoUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_LOGO_URL_LENGTH) return false;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;
  if (url.username || url.password || url.port) return false;
  if (!configuredHosts().has(url.hostname.toLowerCase())) return false;

  const path = url.pathname.toLowerCase();
  const extensionIndex = path.lastIndexOf(".");
  if (extensionIndex === -1) return false;
  const extension = path.slice(extensionIndex);
  return ALLOWED_IMAGE_EXTENSIONS.has(extension);
}

export function sanitizeLogoUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return isAllowedLogoUrl(trimmed) ? trimmed : null;
}

export function validateLogoUrlInput(value: unknown): { ok: true; value: string | null } | { ok: false; error: string } {
  if (typeof value !== "string") return { ok: true, value: null };
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  if (isAllowedLogoUrl(trimmed)) return { ok: true, value: trimmed };

  return {
    ok: false,
    error:
      "Logo URL must be an https image URL from an allowed host. Use PNG, JPG, WEBP, or GIF on the configured logo image hosts.",
  };
}
