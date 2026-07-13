import { createAdminClient } from "@/lib/supabase-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { appUrl, getAppUrl } from "@/lib/app-url";
import { toAppLocale } from "@/lib/i18n/locales";
import { assessmentName as localizedAssessmentName } from "@/lib/i18n/assessment-terms";
import { assertWithinLimit } from "@/lib/plan/limits";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Resend } from "resend";

const EMAIL_LOGO_URL = appUrl("/intelligencestest-email-logo.png");

const testPaths: Record<string, string> = {
  "Critical Thinking Test": "critical-thinking",
  "Adversity Quotient (AQ) Test": "aq",
  "Emotional Intelligence Test": "emotional-intelligence",
  "Leadership Styles Test": "leadership-styles",
  "Numerical Intelligence Test": "numerical-intelligence",
  "Personality Type Test": "personality-type",
  "Situational Judgment Test": "situational-judgment",
  "Attention to Detail Test": "attention-detail",
  "Verbal Reasoning Test": "verbal-reasoning",
  "Abstract Reasoning Test": "abstract-reasoning",
  "Mechanical Reasoning Test": "mechanical-reasoning",
  "Communication Skills Test": "communication-skills",
  "Problem Solving Test": "problem-solving",
  "Work Style Assessment": "work-style",
  "Sales Aptitude Test": "sales-aptitude",
  "Customer Service Skills Test": "customer-service-skills",
  "Teamwork & Collaboration Test": "teamwork-collaboration",
  "Time Management Test": "time-management",
  "Stress Tolerance Test": "stress-tolerance",
  "Integrity & Ethics Test": "integrity-ethics",
  "Decision Making Test": "decision-making",
  "Learning Agility Test": "learning-agility",
};

type InviteEmailLocale = "en" | "es" | "fr";

const localizedAssessmentNames: Record<InviteEmailLocale, Record<string, string>> = {
  en: {},
  fr: {
    "Critical Thinking Test": "Test de Pensée Critique",
    "Adversity Quotient (AQ) Test": "Test de Quotient d'Adversité (AQ)",
    "Emotional Intelligence Test": "Test d'Intelligence Émotionnelle",
    "Leadership Styles Test": "Test de Styles de Leadership",
    "Numerical Intelligence Test": "Test d'Intelligence Numérique",
    "Personality Type Test": "Test de Type de Personnalité",
    "Situational Judgment Test": "Test de Jugement Situationnel",
    "Attention to Detail Test": "Test d'Attention aux Détails",
    "Verbal Reasoning Test": "Test de Raisonnement Verbal",
    "Abstract Reasoning Test": "Test de Raisonnement Abstrait",
    "Mechanical Reasoning Test": "Test de Raisonnement Mécanique",
    "Communication Skills Test": "Test de Compétences en Communication",
    "Problem Solving Test": "Test de Résolution de Problèmes",
    "Work Style Assessment": "Évaluation du Style de Travail",
    "Work Style Test": "Test de Style de Travail",
    "Sales Aptitude Test": "Test d'Aptitude Commerciale",
    "Customer Service Skills Test": "Test de Service Client",
    "Teamwork & Collaboration Test": "Test de Travail d'Équipe et Collaboration",
    "Time Management Test": "Test de Gestion du Temps",
    "Stress Tolerance Test": "Test de Tolérance au Stress",
    "Integrity & Ethics Test": "Test d'Intégrité et d'Éthique",
    "Decision Making Test": "Test de Prise de Décision",
    "Learning Agility Test": "Test d'Agilité d'Apprentissage",
  },
  es: {
    "Critical Thinking Test": "Prueba de Pensamiento Crítico",
    "Adversity Quotient (AQ) Test": "Prueba de Cociente de Adversidad (AQ)",
    "Emotional Intelligence Test": "Prueba de Inteligencia Emocional",
    "Leadership Styles Test": "Prueba de Estilos de Liderazgo",
    "Numerical Intelligence Test": "Prueba de Inteligencia Numérica",
    "Personality Type Test": "Prueba de Tipo de Personalidad",
    "Situational Judgment Test": "Prueba de Juicio Situacional",
    "Attention to Detail Test": "Prueba de Atención al Detalle",
    "Verbal Reasoning Test": "Prueba de Razonamiento Verbal",
    "Abstract Reasoning Test": "Prueba de Razonamiento Abstracto",
    "Mechanical Reasoning Test": "Prueba de Razonamiento Mecánico",
    "Communication Skills Test": "Prueba de Habilidades de Comunicación",
    "Problem Solving Test": "Prueba de Resolución de Problemas",
    "Work Style Assessment": "Evaluación de Estilo de Trabajo",
    "Work Style Test": "Prueba de Estilo de Trabajo",
    "Sales Aptitude Test": "Prueba de Aptitud Comercial",
    "Customer Service Skills Test": "Prueba de Atención al Cliente",
    "Teamwork & Collaboration Test": "Prueba de Trabajo en Equipo y Colaboración",
    "Time Management Test": "Prueba de Gestión del Tiempo",
    "Stress Tolerance Test": "Prueba de Tolerancia al Estrés",
    "Integrity & Ethics Test": "Prueba de Integridad y Ética",
    "Decision Making Test": "Prueba de Toma de Decisiones",
    "Learning Agility Test": "Prueba de Agilidad de Aprendizaje",
  },
};

interface InviteEmailOptions {
  candidateName: string | null;
  companyName: string;
  assessmentName: string;
  durationMinutes: number | null;
  questionCount: number | null;
  testUrl: string;
  logoUrl: string;
  locale: InviteEmailLocale;
}

function getPublicAppUrl() {
  return getAppUrl();
}

function getLocalizedAssessmentName(name: string, locale: InviteEmailLocale) {
  return localizedAssessmentNames[locale][name] ?? name;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function inviteCopy(locale: InviteEmailLocale) {
  if (locale === "es") {
    return {
      subject: (companyName: string) => `${companyName} - Invitación a evaluación`,
      preheader: (companyName: string) => `${companyName} le ha invitado a completar una evaluación online.`,
      greeting: (name: string | null) => (name ? `Estimado/a ${name},` : "Estimado/a candidato/a,"),
      brandSubtitle: "Plataforma de evaluación humana",
      logoAlt: "Logotipo de IntelligencesTest",
      title: (companyName: string) => `${companyName} le ha invitado a completar una evaluación`,
      intro:
        "Esta evaluación ayuda al equipo a conocer mejor sus fortalezas y su forma de resolver situaciones de trabajo. Busque un lugar tranquilo antes de comenzar.",
      whatToExpect: "Qué esperar",
      assessment: "Evaluación",
      time: "Tiempo estimado",
      questions: "Preguntas",
      minutes: (minutes: number) => `${minutes} min`,
      unknown: "Se indicará al iniciar",
      cta: "Comenzar evaluación",
      expiryTitle: "Enlace válido por 7 días",
      expiry:
        "Por seguridad, este enlace caduca en 7 días. Si no esperaba esta invitación, puede ignorar este correo.",
      fallback: "Si el botón no funciona, copie y pegue este enlace en su navegador:",
      footerIntro: (companyName: string) => `Este correo fue enviado porque ${companyName} le invitó a completar una evaluación.`,
      support: "Soporte: support@intelligencestest.com | Preferencias de correo: gestionadas por la organización que invita.",
      powered: "Con tecnología de IntelligencesTest",
    };
  }

  if (locale === "fr") {
    return {
      subject: (companyName: string) => `${companyName} - Invitation à une évaluation`,
      preheader: (companyName: string) => `${companyName} vous a invité(e) à compléter une évaluation en ligne.`,
      greeting: (name: string | null) => (name ? `Bonjour ${name},` : "Bonjour,"),
      brandSubtitle: "Plateforme d'évaluation humaine",
      logoAlt: "Logo IntelligencesTest",
      title: (companyName: string) => `${companyName} vous a invité(e) à compléter une évaluation`,
      intro:
        "Cette évaluation aide l'équipe à mieux comprendre vos points forts et votre façon d'aborder les situations professionnelles. Installez-vous dans un endroit calme avant de commencer.",
      whatToExpect: "À quoi vous attendre",
      assessment: "Évaluation",
      time: "Durée estimée",
      questions: "Questions",
      minutes: (minutes: number) => `${minutes} min`,
      unknown: "Indiqué au démarrage",
      cta: "Commencer l'évaluation",
      expiryTitle: "Lien valide 7 jours",
      expiry:
        "Par sécurité, ce lien expire dans 7 jours. Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet e-mail en toute sécurité.",
      fallback: "Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :",
      footerIntro: (companyName: string) => `Cet e-mail a été envoyé car ${companyName} vous a invité(e) à compléter une évaluation.`,
      support: "Support : support@intelligencestest.com | Préférences d'e-mail : gérées par l'organisation invitante.",
      powered: "Propulsé par IntelligencesTest",
    };
  }

  return {
    subject: (companyName: string) => `${companyName} - Assessment invitation`,
    preheader: (companyName: string) => `${companyName} has invited you to complete an online assessment.`,
    greeting: (name: string | null) => (name ? `Hi ${name},` : "Hi there,"),
    brandSubtitle: "Human Assessment Platform",
    logoAlt: "IntelligencesTest logo",
    title: (companyName: string) => `${companyName} has invited you to complete an assessment`,
    intro:
      "This helps the recruitment team better understand your strengths and prepare a more structured interview. It does not replace human review or make an automatic hiring decision. Please find a quiet place before you begin.",
    whatToExpect: "What to expect",
    assessment: "Assessment",
    time: "Estimated time",
    questions: "Questions",
    minutes: (minutes: number) => `${minutes} min`,
    unknown: "Shown when you start",
    cta: "Start Assessment",
    expiryTitle: "Link valid for 7 days",
    expiry:
      "For your security, this link expires in 7 days. If you were not expecting this invitation, you can safely ignore this email.",
    fallback: "If the button does not work, copy and paste this link into your browser:",
    footerIntro: (companyName: string) => `This email was sent because ${companyName} invited you to complete an assessment.`,
    support: "Support: support@intelligencestest.com | Email preferences: managed by the inviting organization.",
    powered: "Powered by IntelligencesTest",
  };
}

function buildInviteSubject(opts: { companyName: string; locale: InviteEmailLocale }) {
  return inviteCopy(opts.locale).subject(opts.companyName);
}

function buildInviteEmailText(opts: InviteEmailOptions): string {
  const copy = inviteCopy(opts.locale);
  const candidateName = opts.candidateName?.trim() || null;
  const assessmentName = getLocalizedAssessmentName(opts.assessmentName, opts.locale);
  const duration = opts.durationMinutes ? copy.minutes(opts.durationMinutes) : copy.unknown;
  const questions = opts.questionCount ? `${opts.questionCount}` : copy.unknown;

  return [
    copy.greeting(candidateName),
    "",
    copy.title(opts.companyName),
    "",
    copy.intro,
    "",
    `${copy.assessment}: ${assessmentName}`,
    `${copy.time}: ${duration}`,
    `${copy.questions}: ${questions}`,
    "",
    `${copy.cta}: ${opts.testUrl}`,
    "",
    copy.expiryTitle,
    copy.expiry,
    "",
    copy.footerIntro(opts.companyName),
    copy.support,
    copy.powered,
  ].join("\n");
}

function buildInviteEmail(opts: InviteEmailOptions): string {
  const copy = inviteCopy(opts.locale);
  const candidateName = opts.candidateName?.trim() || null;
  const assessmentName = getLocalizedAssessmentName(opts.assessmentName, opts.locale);
  const safeCompanyName = escapeHtml(opts.companyName);
  const safeAssessmentName = escapeHtml(assessmentName);
  const safeGreeting = escapeHtml(copy.greeting(candidateName));
  const safeTitle = escapeHtml(copy.title(opts.companyName));
  const safeIntro = escapeHtml(copy.intro);
  const safeUrl = escapeHtml(opts.testUrl);
  const safeLogoUrl = escapeHtml(opts.logoUrl);
  const safeLogoAlt = escapeHtml(copy.logoAlt);
  const safeBrandSubtitle = escapeHtml(copy.brandSubtitle);
  const duration = opts.durationMinutes ? copy.minutes(opts.durationMinutes) : copy.unknown;
  const questions = opts.questionCount ? `${opts.questionCount}` : copy.unknown;

  return `<!doctype html>
<html lang="${opts.locale}">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${escapeHtml(copy.subject(opts.companyName))}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#07080F;color:#E2E8F0;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;-webkit-text-size-adjust:100%;text-size-adjust:100%;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">
      ${escapeHtml(copy.preheader(opts.companyName))}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#07080F;border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 16px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td width="48" height="48" align="center" valign="middle" style="width:48px;height:48px;">
                      <img src="${safeLogoUrl}" width="48" height="48" alt="${safeLogoAlt}" style="display:block;width:48px;height:48px;border:0;outline:none;text-decoration:none;border-radius:12px;" />
                    </td>
                    <td style="padding-left:13px;">
                      <div style="font-size:17px;line-height:21px;font-weight:700;color:#FFFFFF;">IntelligencesTest</div>
                      <div style="font-size:12px;line-height:16px;color:#64748B;">${safeBrandSubtitle}</div>
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
                      <div style="display:inline-block;margin:0 0 18px 0;padding:7px 10px;border:1px solid #1E2240;border-radius:999px;background-color:#07080F;color:#9BB8FF;font-size:12px;line-height:14px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
                        ${safeCompanyName}
                      </div>
                      <h1 style="margin:0 0 10px 0;color:#FFFFFF;font-size:26px;line-height:33px;font-weight:700;letter-spacing:-0.01em;">${safeGreeting}</h1>
                      <p style="margin:0;color:#CBD5E1;font-size:17px;line-height:27px;font-weight:600;">${safeTitle}</p>
                      <p style="margin:14px 0 0 0;color:#94A3B8;font-size:15px;line-height:25px;">${safeIntro}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px 24px 0 24px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background-color:#07080F;border:1px solid #1E2240;border-radius:14px;">
                        <tr>
                          <td colspan="2" style="padding:18px 18px 8px 18px;color:#FFFFFF;font-size:13px;line-height:18px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">
                            ${escapeHtml(copy.whatToExpect)}
                          </td>
                        </tr>
                        <tr>
                          <td valign="top" style="padding:10px 18px 10px 18px;width:38%;color:#64748B;font-size:12px;line-height:18px;border-bottom:1px solid #1E2240;">
                            ${escapeHtml(copy.assessment)}
                          </td>
                          <td valign="top" style="padding:10px 18px 10px 18px;color:#FFFFFF;font-size:14px;line-height:20px;font-weight:700;border-bottom:1px solid #1E2240;">
                            ${safeAssessmentName}
                          </td>
                        </tr>
                        <tr>
                          <td valign="top" style="padding:10px 18px;width:38%;color:#64748B;font-size:12px;line-height:18px;border-bottom:1px solid #1E2240;">
                            ${escapeHtml(copy.time)}
                          </td>
                          <td valign="top" style="padding:10px 18px;color:#FFFFFF;font-size:14px;line-height:20px;font-weight:700;border-bottom:1px solid #1E2240;">
                            ${escapeHtml(duration)}
                          </td>
                        </tr>
                        <tr>
                          <td valign="top" style="padding:10px 18px 18px 18px;width:38%;color:#64748B;font-size:12px;line-height:18px;">
                            ${escapeHtml(copy.questions)}
                          </td>
                          <td valign="top" style="padding:10px 18px 18px 18px;color:#FFFFFF;font-size:14px;line-height:20px;font-weight:700;">
                            ${escapeHtml(questions)}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:28px 24px 8px 24px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                        <tr>
                          <td align="center" bgcolor="#1D4ED8" style="border-radius:12px;background-color:#1D4ED8;">
                            <a href="${safeUrl}" target="_blank" style="display:block;padding:16px 28px;color:#FFFFFF;background-color:#1D4ED8;border:1px solid #1D4ED8;border-radius:12px;font-size:16px;line-height:20px;font-weight:700;text-decoration:none;text-align:center;">
                              ${escapeHtml(copy.cta)}
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
                            <div style="color:#BFDBFE;font-size:13px;line-height:18px;font-weight:700;">${escapeHtml(copy.expiryTitle)}</div>
                            <div style="margin-top:6px;color:#94A3B8;font-size:13px;line-height:21px;">${escapeHtml(copy.expiry)}</div>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:18px 0 0 0;color:#64748B;font-size:12px;line-height:19px;">${escapeHtml(copy.fallback)}</p>
                      <p style="margin:6px 0 0 0;word-break:break-all;color:#8CB1FF;font-size:12px;line-height:18px;">
                        <a href="${safeUrl}" target="_blank" style="color:#8CB1FF;text-decoration:underline;">${safeUrl}</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 8px 0 8px;text-align:center;">
                <p style="margin:0;color:#64748B;font-size:12px;line-height:19px;">${escapeHtml(copy.footerIntro(opts.companyName))}</p>
                <p style="margin:8px 0 0 0;color:#475569;font-size:11px;line-height:18px;">${escapeHtml(copy.support)}</p>
                <p style="margin:10px 0 0 0;color:#334155;font-size:11px;line-height:16px;">${escapeHtml(copy.powered)}</p>
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
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { full_name, email, project_id, assessment_type, delivery_method } = body;

  if (!project_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate email early when sending via email to avoid creating dangling records
  if (delivery_method === "email") {
    if (!email || !String(email).includes("@")) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }
  }

  const admin = createAdminClient();

  const { data: userProfile } = await admin
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!userProfile?.company_id) {
    return NextResponse.json({ error: "User has no company" }, { status: 400 });
  }

  const { data: company } = await admin
    .from("companies")
    .select("name, language")
    .eq("id", userProfile.company_id)
    .single();

  const lang = toAppLocale(company?.language);
  const companyName = company?.name ?? "Your Company";

  const { data: project } = await admin
    .from("hiring_projects")
    .select("id")
    .eq("id", project_id)
    .eq("company_id", userProfile.company_id)
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const limitCheck = await assertWithinLimit(admin, userProfile.company_id, "candidate");
  if (!limitCheck.ok) {
    return NextResponse.json(
      { error: limitCheck.message?.[lang], reason: limitCheck.reason },
      { status: 403 }
    );
  }

  if (!assessment_type) {
    return NextResponse.json({ error: "Assessment type is required" }, { status: 400 });
  }

  const { data: assessment } = await admin
    .from("assessments")
    .select("id, name, duration_minutes, question_count")
    .eq("name", assessment_type)
    .single();

  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const { data: linked } = await admin
    .from("project_assessments")
    .select("assessment_id")
    .eq("project_id", project.id)
    .eq("assessment_id", assessment.id)
    .maybeSingle();

  if (!linked) {
    return NextResponse.json({ error: "This assessment is not part of the selected project" }, { status: 403 });
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: candidate, error } = await admin
    .from("candidates")
    .insert({
      company_id: userProfile.company_id,
      project_id: project.id,
      full_name: (full_name ?? "").trim(),
      email: (email ?? "").toLowerCase().trim(),
      status: "invited",
      language: lang,
      token,
      token_expires_at: expiresAt,
    })
    .select("id, token")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 });
  }

  const testPath = testPaths[assessment_type] ?? "critical-thinking";
  const langParam = `&lang=${lang}`;
  const testUrl = `/test/${testPath}?token=${candidate.token}${langParam}`;

  if (delivery_method === "email") {
    const appUrl = getPublicAppUrl();
    const absoluteUrl = `${appUrl}${testUrl}`;
    const logoUrl = EMAIL_LOGO_URL;
    const toAddress = email.toLowerCase().trim();
    const emailLocale: InviteEmailLocale = lang === "es" ? "es" : lang === "fr" ? "fr" : "en";
    const emailOptions: InviteEmailOptions = {
      candidateName: full_name?.trim() || null,
      companyName,
      assessmentName: localizedAssessmentName(assessment.name ?? assessment_type, lang),
      durationMinutes: assessment.duration_minutes ?? null,
      questionCount: assessment.question_count ?? null,
      testUrl: absoluteUrl,
      logoUrl,
      locale: emailLocale,
    };
    const subject = buildInviteSubject({ companyName, locale: emailLocale });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const resendResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: toAddress,
      subject,
      html: buildInviteEmail(emailOptions),
      text: buildInviteEmailText(emailOptions),
    });

    console.log("[invite/email] Resend response", JSON.stringify(resendResult));

    if (resendResult.error) {
      console.error("[invite/email] send FAILED:", resendResult.error);
      return NextResponse.json(
        { error: `Candidate created but email failed: ${resendResult.error.message}`, test_url: testUrl, candidate_id: candidate.id },
        { status: 502 }
      );
    }

    console.log("[invite/email] sent OK, id:", resendResult.data?.id);
    return NextResponse.json({ candidate_id: candidate.id, test_url: testUrl, email_sent: true });
  }

  return NextResponse.json({ candidate_id: candidate.id, test_url: testUrl });
}
