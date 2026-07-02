import { Resend } from "resend";

export type AuthEmailLocale = "en" | "es";
export type AuthEmailKind = "confirmation" | "recovery";

const APP_URL = "https://app.intelligencestest.com";
const LOGO_URL = `${APP_URL}/intelligencestest-email-logo.png`;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toLocale(value: unknown): AuthEmailLocale {
  return value === "es" ? "es" : "en";
}

function copy(kind: AuthEmailKind, locale: AuthEmailLocale) {
  if (kind === "recovery") {
    if (locale === "es") {
      return {
        subject: "Restablezca su contraseña de IntelligencesTest",
        preheader: "Use este enlace seguro para restablecer su contraseña.",
        greeting: (name?: string | null) => (name ? `Estimado/a ${name},` : "Estimado/a usuario/a,"),
        title: "Restablezca su contraseña",
        intro:
          "Recibimos una solicitud para restablecer la contraseña de su cuenta. Si usted hizo esta solicitud, use el botón de abajo para continuar.",
        cta: "Restablecer contraseña",
        noticeTitle: "Enlace seguro",
        notice:
          "Por seguridad, este enlace puede caducar pronto. Si usted no solicitó este cambio, puede ignorar este correo.",
        fallback: "Si el botón no funciona, copie y pegue este enlace en su navegador:",
        footer: "Soporte: support@intelligencestest.com",
        powered: "Con tecnología de IntelligencesTest",
        brandSubtitle: "Plataforma de evaluación humana",
        logoAlt: "Logotipo de IntelligencesTest",
      };
    }

    return {
      subject: "Reset your IntelligencesTest password",
      preheader: "Use this secure link to reset your password.",
      greeting: (name?: string | null) => (name ? `Hi ${name},` : "Hi there,"),
      title: "Reset your password",
      intro:
        "We received a request to reset your account password. If this was you, use the button below to continue.",
      cta: "Reset password",
      noticeTitle: "Secure link",
      notice:
        "For your security, this link may expire soon. If you did not request this change, you can safely ignore this email.",
      fallback: "If the button does not work, copy and paste this link into your browser:",
      footer: "Support: support@intelligencestest.com",
      powered: "Powered by IntelligencesTest",
      brandSubtitle: "Human Assessment Platform",
      logoAlt: "IntelligencesTest logo",
    };
  }

  if (locale === "es") {
    return {
      subject: "Confirme su cuenta de IntelligencesTest",
      preheader: "Confirme su correo electrónico para activar su espacio de trabajo.",
      greeting: (name?: string | null) => (name ? `Estimado/a ${name},` : "Estimado/a usuario/a,"),
      title: "Confirme su correo electrónico",
      intro:
        "Gracias por crear su cuenta. Confirme este correo electrónico para activar el espacio de trabajo de su empresa y acceder al panel.",
      cta: "Confirmar correo electrónico",
      noticeTitle: "Enlace de activación",
      notice:
        "Por seguridad, este enlace puede caducar pronto. Si usted no creó esta cuenta, puede ignorar este correo.",
      fallback: "Si el botón no funciona, copie y pegue este enlace en su navegador:",
      footer: "Soporte: support@intelligencestest.com",
      powered: "Con tecnología de IntelligencesTest",
      brandSubtitle: "Plataforma de evaluación humana",
      logoAlt: "Logotipo de IntelligencesTest",
    };
  }

  return {
    subject: "Confirm your IntelligencesTest account",
    preheader: "Confirm your email address to activate your workspace.",
    greeting: (name?: string | null) => (name ? `Hi ${name},` : "Hi there,"),
    title: "Confirm your email address",
    intro:
      "Thank you for creating your account. Confirm this email address to activate your company workspace and access your dashboard.",
    cta: "Confirm email",
    noticeTitle: "Activation link",
    notice:
      "For your security, this link may expire soon. If you did not create this account, you can safely ignore this email.",
    fallback: "If the button does not work, copy and paste this link into your browser:",
    footer: "Support: support@intelligencestest.com",
    powered: "Powered by IntelligencesTest",
    brandSubtitle: "Human Assessment Platform",
    logoAlt: "IntelligencesTest logo",
  };
}

function buildTextEmail(args: {
  kind: AuthEmailKind;
  locale: AuthEmailLocale;
  name?: string | null;
  actionUrl: string;
}) {
  const c = copy(args.kind, args.locale);
  return [
    c.greeting(args.name),
    "",
    c.title,
    "",
    c.intro,
    "",
    `${c.cta}: ${args.actionUrl}`,
    "",
    c.noticeTitle,
    c.notice,
    "",
    c.footer,
    c.powered,
  ].join("\n");
}

function buildHtmlEmail(args: {
  kind: AuthEmailKind;
  locale: AuthEmailLocale;
  name?: string | null;
  actionUrl: string;
}) {
  const c = copy(args.kind, args.locale);
  const safeActionUrl = escapeHtml(args.actionUrl);

  return `<!doctype html>
<html lang="${args.locale}">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${escapeHtml(c.subject)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#07080F;color:#E2E8F0;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;-webkit-text-size-adjust:100%;text-size-adjust:100%;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">
      ${escapeHtml(c.preheader)}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#07080F;border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 16px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td width="48" height="48" align="center" valign="middle" style="width:48px;height:48px;">
                      <img src="${LOGO_URL}" width="48" height="48" alt="${escapeHtml(c.logoAlt)}" style="display:block;width:48px;height:48px;border:0;outline:none;text-decoration:none;border-radius:12px;" />
                    </td>
                    <td style="padding-left:13px;">
                      <div style="font-size:17px;line-height:21px;font-weight:700;color:#FFFFFF;">IntelligencesTest</div>
                      <div style="font-size:12px;line-height:16px;color:#64748B;">${escapeHtml(c.brandSubtitle)}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background-color:#0D1020;border:1px solid #1E2240;border-radius:18px;overflow:hidden;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:28px 24px 10px 24px;">
                      <h1 style="margin:0 0 10px 0;color:#FFFFFF;font-size:24px;line-height:31px;font-weight:700;">${escapeHtml(c.greeting(args.name))}</h1>
                      <p style="margin:0;color:#CBD5E1;font-size:17px;line-height:27px;font-weight:700;">${escapeHtml(c.title)}</p>
                      <p style="margin:14px 0 0 0;color:#94A3B8;font-size:15px;line-height:25px;">${escapeHtml(c.intro)}</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:28px 24px 8px 24px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                        <tr>
                          <td align="center" bgcolor="#1D4ED8" style="border-radius:12px;background-color:#1D4ED8;">
                            <a href="${safeActionUrl}" target="_blank" style="display:block;padding:16px 28px;color:#FFFFFF;background-color:#1D4ED8;border:1px solid #1D4ED8;border-radius:12px;font-size:16px;line-height:20px;font-weight:700;text-decoration:none;text-align:center;">
                              ${escapeHtml(c.cta)}
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 24px 24px 24px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background-color:#11182B;border:1px solid #24305A;border-radius:14px;">
                        <tr>
                          <td style="padding:16px 18px;">
                            <div style="color:#BFDBFE;font-size:13px;line-height:18px;font-weight:700;">${escapeHtml(c.noticeTitle)}</div>
                            <div style="margin-top:6px;color:#94A3B8;font-size:13px;line-height:21px;">${escapeHtml(c.notice)}</div>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:18px 0 0 0;color:#64748B;font-size:12px;line-height:19px;">${escapeHtml(c.fallback)}</p>
                      <p style="margin:6px 0 0 0;word-break:break-all;color:#8CB1FF;font-size:12px;line-height:18px;">
                        <a href="${safeActionUrl}" target="_blank" style="color:#8CB1FF;text-decoration:underline;">${safeActionUrl}</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 8px 0 8px;text-align:center;">
                <p style="margin:0;color:#475569;font-size:11px;line-height:18px;">${escapeHtml(c.footer)}</p>
                <p style="margin:10px 0 0 0;color:#334155;font-size:11px;line-height:16px;">${escapeHtml(c.powered)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendAuthEmail(args: {
  kind: AuthEmailKind;
  locale?: unknown;
  to: string;
  name?: string | null;
  actionUrl: string;
}) {
  const locale = toLocale(args.locale);
  const c = copy(args.kind, locale);
  const resend = new Resend(process.env.RESEND_API_KEY);

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: args.to,
    subject: c.subject,
    html: buildHtmlEmail({ kind: args.kind, locale, name: args.name, actionUrl: args.actionUrl }),
    text: buildTextEmail({ kind: args.kind, locale, name: args.name, actionUrl: args.actionUrl }),
  });
}
