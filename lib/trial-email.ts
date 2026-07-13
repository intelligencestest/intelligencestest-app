import { Resend } from "resend";
import { appUrl } from "@/lib/app-url";

/**
 * Trial lifecycle email templates. Mirrors lib/auth-email.ts (same visual
 * template, same escaping, same Resend call shape) so the two stay visually
 * consistent. Nothing here is scheduled — each kind is a plain callable
 * function; wiring a cron/queue to call these during the trial and at expiry is
 * a later, separate decision.
 */

export type TrialEmailLocale = "en" | "es" | "fr";
export type TrialEmailKind = "trial_started" | "trial_day1" | "trial_day2" | "trial_ending" | "trial_expired";

const LOGO_URL = appUrl("/intelligencestest-email-logo.png");
const DASHBOARD_URL = appUrl("/dashboard");
const CONTACT_URL = appUrl("/contact");

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toLocale(value: unknown): TrialEmailLocale {
  return value === "en" ? "en" : value === "fr" ? "fr" : "es";
}

function copy(kind: TrialEmailKind, locale: TrialEmailLocale) {
  const es = locale === "es";
  const fr = locale === "fr";

  if (kind === "trial_started") {
    return {
      subject: es ? "Su prueba de 14 días ha comenzado" : fr ? "Votre essai de 14 jours a commencé" : "Your 14-day trial has started",
      preheader: es
        ? "Cree su primer proyecto e invite candidatos para revisar un informe ejecutivo."
        : fr
        ? "Créez votre premier projet et invitez des candidats pour consulter un rapport exécutif."
        : "Invite your first candidate and see results in minutes.",
      greeting: (name?: string | null) => (es ? `Estimado/a ${name ?? "usuario/a"},` : fr ? `Bonjour ${name ?? ""},` : `Hi ${name ?? "there"},`),
      title: es ? "Su espacio de trabajo está listo" : fr ? "Votre espace de travail est prêt" : "Your workspace is ready",
      intro: es
        ? "Su prueba gratuita está activa durante 14 días. Puede crear 2 proyectos e invitar hasta 10 candidatos, sin necesidad de tarjeta de crédito."
        : fr
        ? "Votre essai gratuit est actif pendant 14 jours. Vous pouvez créer 2 projets et inviter jusqu'à 10 candidats, sans carte bancaire requise."
        : "You have 14 days to create up to 2 projects and invite up to 10 candidates — no credit card required. Start now to make the most of your trial.",
      cta: es ? "Ir al panel" : fr ? "Aller au tableau de bord" : "Go to dashboard",
      ctaUrl: DASHBOARD_URL,
      noticeTitle: es ? "Su prueba" : fr ? "Votre essai" : "Your trial",
      notice: es
        ? "Incluye 1 reclutador, 2 proyectos y 10 invitaciones de candidatos durante 14 días."
        : fr
        ? "Inclut 1 recruteur, 2 projets et 10 invitations de candidats pendant 14 jours."
        : "Includes 1 recruiter, 2 projects, and 10 candidate invitations for 14 days.",
    };
  }

  if (kind === "trial_day1") {
    return {
      subject: es ? "¿Ha invitado ya a su primer candidato?" : fr ? "Avez-vous déjà invité votre premier candidat ?" : "Have you invited your first candidate yet?",
      preheader: es
        ? "Aproveche su prueba gratuita de 14 días."
        : fr
        ? "Profitez pleinement de votre essai gratuit de 14 jours."
        : "Make the most of your 14-day free trial.",
      greeting: (name?: string | null) => (es ? `Estimado/a ${name ?? "usuario/a"},` : fr ? `Bonjour ${name ?? ""},` : `Hi ${name ?? "there"},`),
      title: es ? "Aproveche su prueba gratuita" : fr ? "Profitez de votre essai gratuit" : "Make the most of your free trial",
      intro: es
        ? "Cree un proyecto de contratación e invite a un candidato para ver un informe ejecutivo real antes de que finalice su prueba."
        : fr
        ? "Créez un projet de recrutement et invitez un candidat pour consulter un vrai rapport exécutif avant la fin de votre essai."
        : "Create a hiring project and invite a candidate to see a real executive report before your trial ends.",
      cta: es ? "Invitar a un candidato" : fr ? "Inviter un candidat" : "Invite a candidate",
      ctaUrl: DASHBOARD_URL,
      noticeTitle: es ? "Prueba gratuita activa" : fr ? "Essai gratuit actif" : "Free trial active",
      notice: es
        ? "Su prueba incluye 2 proyectos, 10 invitaciones de candidatos e informes ejecutivos. Sin tarjeta de crédito requerida."
        : fr
        ? "Votre essai inclut 2 projets, 10 invitations de candidats et des rapports exécutifs. Aucune carte bancaire requise."
        : "Your trial includes 2 projects, 10 candidate invitations, and executive reports. No credit card required.",
    };
  }

  if (kind === "trial_day2") {
    return {
      subject: es ? "Continúe construyendo señales de selección" : fr ? "Continuez à construire des signaux de recrutement" : "Keep building hiring signal",
      preheader: es
        ? "Todavía tiene tiempo para probar la plataforma con candidatos reales."
        : fr
        ? "Vous avez encore le temps de tester la plateforme avec de vrais candidats."
        : "You still have time to test the platform with real candidates.",
      greeting: (name?: string | null) => (es ? `Estimado/a ${name ?? "usuario/a"},` : fr ? `Bonjour ${name ?? ""},` : `Hi ${name ?? "there"},`),
      title: es ? "Saque más valor de su prueba" : fr ? "Tirez davantage parti de votre essai" : "Get more value from your trial",
      intro: es
        ? "Use su prueba para comparar candidatos en un proyecto real y revisar informes ejecutivos antes de elegir un plan."
        : fr
        ? "Utilisez votre essai pour comparer des candidats sur un projet réel et consulter des rapports exécutifs avant de choisir une offre."
        : "Use your trial to compare candidates in a real project and review executive reports before choosing a plan.",
      cta: es ? "Ir al panel" : fr ? "Aller au tableau de bord" : "Go to dashboard",
      ctaUrl: DASHBOARD_URL,
      noticeTitle: es ? "Límites incluidos" : fr ? "Limites incluses" : "Included limits",
      notice: es
        ? "Puede crear hasta 2 proyectos e invitar hasta 10 candidatos durante la prueba."
        : fr
        ? "Vous pouvez créer jusqu'à 2 projets et inviter jusqu'à 10 candidats pendant l'essai."
        : "You can create up to 2 projects and invite up to 10 candidates during the trial.",
    };
  }

  if (kind === "trial_ending") {
    return {
      subject: es ? "Su prueba termina hoy" : fr ? "Votre essai se termine aujourd'hui" : "Your trial ends today",
      preheader: es
        ? "Solicite una ampliación para continuar sin interrupciones."
        : fr
        ? "Demandez une prolongation pour continuer sans interruption."
        : "Request an extension to keep going without interruption.",
      greeting: (name?: string | null) => (es ? `Estimado/a ${name ?? "usuario/a"},` : fr ? `Bonjour ${name ?? ""},` : `Hi ${name ?? "there"},`),
      title: es ? "Su prueba termina hoy" : fr ? "Votre essai se termine aujourd'hui" : "Your trial ends today",
      intro: es
        ? "Hoy es el último día de su prueba gratuita. Contacte con nuestro equipo comercial para elegir un plan y seguir invitando candidatos sin interrupción."
        : fr
        ? "Aujourd'hui est le dernier jour de votre essai gratuit. Contactez notre équipe commerciale pour choisir une offre et continuer à inviter des candidats sans interruption."
        : "Today is the last day of your free trial. Contact our sales team to choose a plan and keep inviting candidates without interruption.",
      cta: es ? "Hablar con ventas" : fr ? "Contacter les ventes" : "Talk to sales",
      ctaUrl: CONTACT_URL,
      noticeTitle: es ? "Termina hoy" : fr ? "Se termine aujourd'hui" : "Ends today",
      notice: es
        ? "Starter desde 49 €/mes, Professional desde 149 €/mes. Enterprise a medida — contacte con ventas."
        : fr
        ? "Starter à partir de 49 €/mois, Professional à partir de 149 €/mois. Enterprise sur mesure — contactez les ventes."
        : "Starter from €49/month, Professional from €149/month. Custom Enterprise — contact sales.",
    };
  }

  // trial_expired
  return {
    subject: es ? "Su periodo de prueba ha finalizado" : fr ? "Votre période d'essai est terminée" : "Your trial has ended",
    preheader: es
      ? "Solicite una ampliación para continuar usando la plataforma."
      : fr
      ? "Demandez une prolongation pour continuer à utiliser la plateforme."
      : "Request an extension to keep using the platform.",
    greeting: (name?: string | null) => (es ? `Estimado/a ${name ?? "usuario/a"},` : fr ? `Bonjour ${name ?? ""},` : `Hi ${name ?? "there"},`),
    title: es ? "Su periodo de prueba ha finalizado" : fr ? "Votre période d'essai est terminée" : "Your trial has ended",
    intro: es
      ? "Ya no puede invitar nuevos candidatos ni crear proyectos. Sus datos siguen disponibles. Contacte con nuestro equipo comercial para continuar."
      : fr
      ? "Vous ne pouvez plus inviter de nouveaux candidats ni créer de projets. Vos données restent disponibles. Contactez notre équipe commerciale pour continuer."
      : "You can no longer invite new candidates or create projects. Your existing data remains available. Contact our sales team to continue.",
    cta: es ? "Contactar con ventas" : fr ? "Contacter les ventes" : "Contact sales",
    ctaUrl: CONTACT_URL,
    noticeTitle: es ? "Sus datos están a salvo" : fr ? "Vos données sont en sécurité" : "Your data is safe",
    notice: es
      ? "Todos sus proyectos, candidatos y resultados existentes siguen visibles — solo se bloquean las acciones nuevas."
      : fr
      ? "Tous vos projets, candidats et résultats existants restent visibles — seules les nouvelles actions sont bloquées."
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
                      <div style="font-size:12px;line-height:16px;color:#64748B;">${locale === "es" ? "Plataforma de evaluación humana" : locale === "fr" ? "Plateforme d'évaluation humaine" : "Human Assessment Platform"}</div>
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
                <p style="margin:0;color:#475569;font-size:11px;line-height:18px;">${locale === "es" ? "Soporte" : locale === "fr" ? "Support" : "Support"}: support@intelligencestest.com</p>
                <p style="margin:10px 0 0 0;color:#334155;font-size:11px;line-height:16px;">${locale === "es" ? "Con tecnología de IntelligencesTest" : locale === "fr" ? "Propulsé par IntelligencesTest" : "Powered by IntelligencesTest"}</p>
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
