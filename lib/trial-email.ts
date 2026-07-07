import { Resend } from "resend";

/**
 * Trial lifecycle email templates. Mirrors lib/auth-email.ts (same visual
 * template, same escaping, same Resend call shape) so the two stay visually
 * consistent. Nothing here is scheduled — each kind is a plain callable
 * function; wiring a cron/queue to call these on day 1 / day 2 / expiry is
 * a later, separate decision.
 */

export type TrialEmailLocale = "en" | "es";
export type TrialEmailKind = "trial_started" | "trial_day1" | "trial_day2" | "trial_ending" | "trial_expired";

const APP_URL = "https://app.intelligencestest.com";
const LOGO_URL = `${APP_URL}/intelligencestest-email-logo.png`;
const DASHBOARD_URL = `${APP_URL}/dashboard`;
const CONTACT_URL = `${APP_URL}/contact`;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toLocale(value: unknown): TrialEmailLocale {
  return value === "en" ? "en" : "es";
}

function copy(kind: TrialEmailKind, locale: TrialEmailLocale) {
  const es = locale === "es";

  if (kind === "trial_started") {
    return {
      subject: es ? "Su prueba de 3 días ha comenzado" : "Your 3-day trial has started",
      preheader: es
        ? "Invite a su primer candidato y vea los resultados en minutos."
        : "Invite your first candidate and see results in minutes.",
      greeting: (name?: string | null) => (es ? `Estimado/a ${name ?? "usuario/a"},` : `Hi ${name ?? "there"},`),
      title: es ? "Su espacio de trabajo está listo" : "Your workspace is ready",
      intro: es
        ? "Tiene 3 días para crear un proyecto e invitar hasta 10 candidatos, sin necesidad de tarjeta de crédito. Empiece ahora para no perder tiempo de prueba."
        : "You have 3 days to create a project and invite up to 10 candidates — no credit card required. Start now to make the most of your trial.",
      cta: es ? "Ir al panel" : "Go to dashboard",
      ctaUrl: DASHBOARD_URL,
      noticeTitle: es ? "Su prueba" : "Your trial",
      notice: es
        ? "Incluye 1 reclutador, 1 proyecto y 10 candidatos durante 3 días."
        : "Includes 1 recruiter, 1 project, and 10 candidates for 3 days.",
    };
  }

  if (kind === "trial_day1") {
    return {
      subject: es ? "¿Ya invitó a su primer candidato?" : "Have you invited your first candidate yet?",
      preheader: es ? "Quedan 2 días de su prueba gratuita." : "2 days left in your free trial.",
      greeting: (name?: string | null) => (es ? `Estimado/a ${name ?? "usuario/a"},` : `Hi ${name ?? "there"},`),
      title: es ? "Aproveche su prueba gratuita" : "Make the most of your free trial",
      intro: es
        ? "Cree un proyecto de contratación e invite a un candidato para ver un informe ejecutivo real antes de que termine su prueba."
        : "Create a hiring project and invite a candidate to see a real executive report before your trial ends.",
      cta: es ? "Invitar a un candidato" : "Invite a candidate",
      ctaUrl: DASHBOARD_URL,
      noticeTitle: es ? "Quedan 2 días" : "2 days left",
      notice: es
        ? "Su prueba termina en 2 días. Sin tarjeta de crédito requerida."
        : "Your trial ends in 2 days. No credit card required.",
    };
  }

  if (kind === "trial_day2") {
    return {
      subject: es ? "Su prueba termina mañana" : "Your trial ends tomorrow",
      preheader: es ? "Último día para probar la plataforma sin compromiso." : "Last day to try the platform, no commitment.",
      greeting: (name?: string | null) => (es ? `Estimado/a ${name ?? "usuario/a"},` : `Hi ${name ?? "there"},`),
      title: es ? "Su prueba termina mañana" : "Your trial ends tomorrow",
      intro: es
        ? "Mañana finaliza su periodo de prueba. Si le está funcionando, hable con nuestro equipo para continuar sin interrupciones."
        : "Your trial period ends tomorrow. If it's working for you, talk to our team to keep going without interruption.",
      cta: es ? "Hablar con ventas" : "Talk to sales",
      ctaUrl: CONTACT_URL,
      noticeTitle: es ? "Último día" : "Last day",
      notice: es
        ? "Después de mañana, no podrá invitar nuevos candidatos ni crear proyectos hasta actualizar su plan."
        : "After tomorrow, you won't be able to invite new candidates or create projects until you upgrade your plan.",
    };
  }

  if (kind === "trial_ending") {
    return {
      subject: es ? "Su prueba termina hoy" : "Your trial ends today",
      preheader: es ? "Actualice su plan para continuar sin interrupciones." : "Upgrade to keep going without interruption.",
      greeting: (name?: string | null) => (es ? `Estimado/a ${name ?? "usuario/a"},` : `Hi ${name ?? "there"},`),
      title: es ? "Su prueba termina hoy" : "Your trial ends today",
      intro: es
        ? "Hoy es el último día de su prueba gratuita. Contacte con nuestro equipo comercial para elegir un plan y seguir invitando candidatos sin interrupción."
        : "Today is the last day of your free trial. Contact our sales team to choose a plan and keep inviting candidates without interruption.",
      cta: es ? "Hablar con ventas" : "Talk to sales",
      ctaUrl: CONTACT_URL,
      noticeTitle: es ? "Termina hoy" : "Ends today",
      notice: es
        ? "Starter desde 29 €/mes, Professional desde 79 €/mes. Enterprise a medida — contacte con ventas."
        : "Starter from €29/month, Professional from €79/month. Custom Enterprise — contact sales.",
    };
  }

  // trial_expired
  return {
    subject: es ? "Su periodo de prueba ha finalizado" : "Your trial has ended",
    preheader: es
      ? "Contacte con ventas para continuar usando la plataforma."
      : "Contact sales to keep using the platform.",
    greeting: (name?: string | null) => (es ? `Estimado/a ${name ?? "usuario/a"},` : `Hi ${name ?? "there"},`),
    title: es ? "Su periodo de prueba ha finalizado" : "Your trial has ended",
    intro: es
      ? "Ya no puede invitar nuevos candidatos ni crear proyectos. Sus datos siguen disponibles. Contacte con nuestro equipo comercial para continuar."
      : "You can no longer invite new candidates or create projects. Your existing data remains available. Contact our sales team to continue.",
    cta: es ? "Contactar con ventas" : "Contact sales",
    ctaUrl: CONTACT_URL,
    noticeTitle: es ? "Sus datos están a salvo" : "Your data is safe",
    notice: es
      ? "Todos sus proyectos, candidatos y resultados existentes siguen visibles — solo se bloquean las acciones nuevas."
      : "All your existing projects, candidates, and results remain visible — only new actions are blocked.",
  };
}

function buildText(kind: TrialEmailKind, locale: TrialEmailLocale, name?: string | null) {
  const c = copy(kind, locale);
  return [c.greeting(name), "", c.title, "", c.intro, "", `${c.cta}: ${c.ctaUrl}`, "", c.noticeTitle, c.notice].join("\n");
}

function buildHtml(kind: TrialEmailKind, locale: TrialEmailLocale, name?: string | null) {
  const c = copy(kind, locale);
  const safeUrl = escapeHtml(c.ctaUrl);

  return `<!doctype html>
<html lang="${locale}">
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
                      <img src="${LOGO_URL}" width="48" height="48" alt="IntelligencesTest" style="display:block;width:48px;height:48px;border:0;outline:none;text-decoration:none;border-radius:12px;" />
                    </td>
                    <td style="padding-left:13px;">
                      <div style="font-size:17px;line-height:21px;font-weight:700;color:#FFFFFF;">IntelligencesTest</div>
                      <div style="font-size:12px;line-height:16px;color:#64748B;">${locale === "es" ? "Plataforma de evaluación humana" : "Human Assessment Platform"}</div>
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
                      <h1 style="margin:0 0 10px 0;color:#FFFFFF;font-size:24px;line-height:31px;font-weight:700;">${escapeHtml(c.greeting(name))}</h1>
                      <p style="margin:0;color:#CBD5E1;font-size:17px;line-height:27px;font-weight:700;">${escapeHtml(c.title)}</p>
                      <p style="margin:14px 0 0 0;color:#94A3B8;font-size:15px;line-height:25px;">${escapeHtml(c.intro)}</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:28px 24px 8px 24px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                        <tr>
                          <td align="center" bgcolor="#1D4ED8" style="border-radius:12px;background-color:#1D4ED8;">
                            <a href="${safeUrl}" target="_blank" style="display:block;padding:16px 28px;color:#FFFFFF;background-color:#1D4ED8;border:1px solid #1D4ED8;border-radius:12px;font-size:16px;line-height:20px;font-weight:700;text-decoration:none;text-align:center;">
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
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 8px 0 8px;text-align:center;">
                <p style="margin:0;color:#475569;font-size:11px;line-height:18px;">${locale === "es" ? "Soporte" : "Support"}: support@intelligencestest.com</p>
                <p style="margin:10px 0 0 0;color:#334155;font-size:11px;line-height:16px;">${locale === "es" ? "Con tecnología de IntelligencesTest" : "Powered by IntelligencesTest"}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Sends one trial-lifecycle email. Call sites are manual for now (e.g. an
 * ops action, or a future cron/queue) — nothing here schedules itself.
 */
export async function sendTrialEmail(args: { kind: TrialEmailKind; locale?: unknown; to: string; name?: string | null }) {
  const locale = toLocale(args.locale);
  const c = copy(args.kind, locale);
  const resend = new Resend(process.env.RESEND_API_KEY);

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: args.to,
    subject: c.subject,
    html: buildHtml(args.kind, locale, args.name),
    text: buildText(args.kind, locale, args.name),
  });
}
