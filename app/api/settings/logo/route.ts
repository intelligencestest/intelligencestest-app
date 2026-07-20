import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import { validateLogoUrlInput } from "@/lib/security/logo-url";

export const runtime = "nodejs";

const LOGO_BUCKET = "company-logos";
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

type SupportedLogo = {
  extension: "gif" | "jpg" | "png" | "webp";
  mimeType: "image/gif" | "image/jpeg" | "image/png" | "image/webp";
};

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

function detectLogoType(bytes: Uint8Array): SupportedLogo | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { extension: "png", mimeType: "image/png" };
  }
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return { extension: "jpg", mimeType: "image/jpeg" };
  }
  if (
    startsWith(bytes, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
    startsWith(bytes, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  ) {
    return { extension: "gif", mimeType: "image/gif" };
  }
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return { extension: "webp", mimeType: "image/webp" };
  }
  return null;
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_LOGO_BYTES + 64 * 1024) {
    return NextResponse.json({ error: "Logo files must be 2 MB or smaller." }, { status: 413 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .single();
  const companyId = profile?.company_id;
  if (!companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("logo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a logo image to upload." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_LOGO_BYTES) {
    return NextResponse.json({ error: "Logo files must be 2 MB or smaller." }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const logoType = detectLogoType(bytes);
  if (!logoType) {
    return NextResponse.json(
      { error: "Logo must be a PNG, JPG, WEBP, or GIF image." },
      { status: 415 }
    );
  }

  const objectPath = `${companyId}/${randomUUID()}.${logoType.extension}`;
  const { error: uploadError } = await admin.storage.from(LOGO_BUCKET).upload(objectPath, bytes, {
    cacheControl: "3600",
    contentType: logoType.mimeType,
    upsert: false,
  });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = admin.storage.from(LOGO_BUCKET).getPublicUrl(objectPath);
  const logoUrl = validateLogoUrlInput(publicUrlData.publicUrl);
  if (!logoUrl.ok || !logoUrl.value) {
    await admin.storage.from(LOGO_BUCKET).remove([objectPath]);
    return NextResponse.json(
      { error: logoUrl.ok ? "Could not create a valid logo URL." : logoUrl.error },
      { status: 500 }
    );
  }

  const { error: companyError } = await admin
    .from("companies")
    .update({ logo_url: logoUrl.value, updated_at: new Date().toISOString() })
    .eq("id", companyId);
  if (companyError) {
    await admin.storage.from(LOGO_BUCKET).remove([objectPath]);
    return NextResponse.json({ error: companyError.message }, { status: 500 });
  }

  return NextResponse.json({ logo_url: logoUrl.value });
}
