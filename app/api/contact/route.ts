import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

type ContactPayload = {
  kind?: string;
  locale?: string;
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  phone?: string;
  companyType?: string;
  employees?: string;
  message?: string;
  website?: string;
};

const BUSINESS_EMAIL = process.env.CONTACT_TO_EMAIL || process.env.BUSINESS_EMAIL || "contact@intelligencestest.com";
const APP_URL = "https://app.intelligencestest.com";
const LOGO_URL = `${APP_URL}/intelligencestest-email-logo.png`;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 2000) : "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type NormalizedPayload = {
  kind: "contact" | "demo";
  locale: "en" | "es";
  name: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  companyType: string;
  employees: string;
  message: string;
};

function buildText(payload: NormalizedPayload) {
  return [
    payload.kind === "demo" ? "Nueva solicitud de demo" : "Nuevo mensaje de contacto",
    "",
    `Nombre: ${payload.name}`,
    `Email: ${payload.email}`,
    `Empresa: ${payload.company}`,
    `Cargo: ${payload.role || "-"}`,
    `Tipo: ${payload.companyType || "-"}`,
    `Tamaño: ${payload.employees || "-"}`,
    `Teléfono: ${payload.phone || "-"}`,
    `Idioma: ${payload.locale}`,
    "",
    "Mensaje:",
    payload.message,
  ].join("\n");
}

function buildHtml(payload: NormalizedPayload) {
  const title = payload.kind === "demo" ? "Nueva solicitud de demo" : "Nuevo mensaje de contacto";
  const preheader = `${payload.company} envió ${payload.kind === "demo" ? "una solicitud de demo" : "un mensaje de contacto"}.`;
  const rows = [
    ["Nombre", payload.name],
    ["Email", payload.email],
    ["Empresa", payload.company],
    ["Cargo", payload.role || "-"],
    ["Tipo", payload.companyType || "-"],
    ["Tamaño", payload.employees || "-"],
    ["Teléfono", payload.phone || "-"],
    ["Idioma", payload.locale],
  ];

  return `<!doctype html>
<html lang="es">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#07080F;color:#E2E8F0;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">
      ${escapeHtml(preheader)}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#07080F;border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 16px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td width="48" height="48" align="center" valign="middle" style="width:48px;height:48px;">
                      <img src="${LOGO_URL}" width="48" height="48" alt="IntelligencesTest" style="display:block;width:48px;height:48px;border:0;outline:none;text-decoration:none;border-radius:12px;" />
                    </td>
                    <td style="padding-left:13px;">
                      <div style="font-size:17px;line-height:21px;font-weight:700;color:#FFFFFF;">IntelligencesTest</div>
                      <div style="font-size:12px;line-height:16px;color:#64748B;">Plataforma de evaluación humana</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:#0D1020;border:1px solid #1E2240;border-radius:8px;overflow:hidden;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:24px;">
                      <p style="margin:0 0 8px 0;color:#8CB1FF;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;">${escapeHtml(payload.kind)}</p>
                      <h1 style="margin:0;color:#FFFFFF;font-size:24px;line-height:31px;">${escapeHtml(title)}</h1>
                      <p style="margin:12px 0 0 0;color:#94A3B8;font-size:14px;line-height:22px;">Formulario enviado desde app.intelligencestest.com.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 24px 8px 24px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background:#07080F;border:1px solid #1E2240;border-radius:8px;">
                        ${rows.map(([label, value]) => `
                          <tr>
                            <td style="padding:10px 14px;color:#64748B;font-size:12px;border-bottom:1px solid #1E2240;width:34%;">${escapeHtml(label)}</td>
                            <td style="padding:10px 14px;color:#FFFFFF;font-size:14px;border-bottom:1px solid #1E2240;">${escapeHtml(value)}</td>
                          </tr>`).join("")}
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 24px 24px 24px;">
                      <div style="padding:16px;background:#07080F;border:1px solid #1E2240;border-radius:8px;color:#CBD5E1;font-size:14px;line-height:23px;white-space:pre-wrap;">${escapeHtml(payload.message)}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function POST(request: NextRequest) {
  let body: ContactPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (clean(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const payload: NormalizedPayload = {
    kind: body.kind === "demo" ? "demo" : "contact",
    locale: body.locale === "en" ? "en" : "es",
    name: clean(body.name),
    email: clean(body.email).toLowerCase(),
    company: clean(body.company),
    role: clean(body.role),
    phone: clean(body.phone),
    companyType: clean(body.companyType),
    employees: clean(body.employees),
    message: clean(body.message),
  };

  if (!payload.name || !payload.company || !payload.message || !isEmail(payload.email)) {
    return NextResponse.json(
      { error: payload.locale === "es" ? "Complete los campos obligatorios." : "Please complete the required fields." },
      { status: 400 }
    );
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    console.error("[contact] Missing Resend configuration");
    return NextResponse.json({ error: "Email is not configured" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const subjectPrefix = payload.kind === "demo" ? "Demo" : "Contacto";
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: BUSINESS_EMAIL,
    replyTo: payload.email,
    subject: `[IntelligencesTest] ${subjectPrefix}: ${payload.company}`,
    html: buildHtml(payload),
    text: buildText(payload),
  });

  if (result.error) {
    console.error("[contact] Resend failed", result.error);
    return NextResponse.json({ error: "Email failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
