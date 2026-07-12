import type { AppLocale } from "@/lib/i18n/locales";

type LegalSection = { title: string; body: string[] };

type PublicCopyInternal = {
  nav: {
    primaryAria: string;
    features: string;
    assessments: string;
    faq: string;
    contact: string;
    demo: string;
    login: string;
    signup: string;
  };
  footer: {
    body: string;
    explore: string;
    product: string;
    authority: string;
    methodology: string;
    scientificFoundations: string;
    legal: string;
    rights: string;
  };
  home: {
    eyebrow: string;
    heroTitle: string;
    heroBody: string;
    primaryCta: string;
    secondaryCta: string;
    stats: Array<{ value: string; label: string }>;
    boardAria: string;
    boardTitle: string;
    boardSubtitle: string;
    boardStats: Array<{ value: string; label: string }>;
    boardRows: Array<{
      title: string;
      body: string;
      badge: string;
      tone: string;
      bars: Array<{ flex: number; className: string }>;
    }>;
    featuresEyebrow: string;
    featuresTitle: string;
    features: Array<{ index: string; title: string; body: string }>;
    assessmentsEyebrow: string;
    assessmentsTitle: string;
    assessmentsBody: string;
    assessmentGroups: Array<{ title: string; body: string }>;
    faqEyebrow: string;
    faqTitle: string;
    faq: Array<{ question: string; answer: string }>;
    finalTitle: string;
    finalBody: string;
  };
  contact: {
    badge: string;
    title: string;
    body: string;
    demoTitle: string;
    demoBody: string;
    response: string;
    form: {
      name: string;
      email: string;
      company: string;
      role: string;
      phone: string;
      companyType: string;
      employees: string;
      message: string;
      submitContact: string;
      submitDemo: string;
      sending: string;
      successContact: string;
      successDemo: string;
      error: string;
      website: string;
      typeOptions: string[];
    };
  };
  legal: {
    eyebrow: string;
    privacyTitle: string;
    termsTitle: string;
    cookiesTitle: string;
    privacyIntro: string;
    termsIntro: string;
    cookiesIntro: string;
    privacy: LegalSection[];
    terms: LegalSection[];
    cookies: LegalSection[];
  };
};

const signalBars = {
  completed: "bg-[#4f46e5]",
  started: "bg-[#a5b4fc]",
  invited: "bg-[#d1d5db]",
  expired: "bg-[#e5e7eb]",
};

const es: PublicCopyInternal = {
  nav: {
    primaryAria: "Navegación principal",
    features: "Producto",
    assessments: "Precios",
    faq: "Seguridad",
    contact: "Soporte",
    demo: "Comenzar prueba gratuita",
    login: "Iniciar sesión",
    signup: "Prueba gratuita",
  },
  footer: {
    explore: "Explorar",
    body: "Evaluaciones psicométricas y cognitivas para equipos de selección que necesitan comparar candidatos con criterios claros y trazables.",
    product: "Producto",
    authority: "Confianza",
    methodology: "Metodología",
    scientificFoundations: "Fundamentos científicos",
    legal: "Legal",
    rights: "© 2026 IntelligencesTest. Todos los derechos reservados.",
  },
  home: {
    eyebrow: "B2B para selección y consultoría HR",
    heroTitle: "Evaluaciones psicométricas para decisiones de selección más claras",
    heroBody:
      "Invite candidatos, combine pruebas cognitivas y conductuales, y revise resultados en un espacio de trabajo diseñado para agencias de reclutamiento, pymes, call centers y consultoras de RR. HH.",
    primaryCta: "Comenzar ahora",
    secondaryCta: "Ver evaluaciones",
    stats: [
      { value: "22+", label: "evaluaciones activas" },
      { value: "ES/EN", label: "experiencia bilingüe" },
      { value: "7 días", label: "enlaces seguros" },
    ],
    boardAria: "Vista previa del flujo de evaluación",
    boardTitle: "Operación de evaluaciones",
    boardSubtitle: "Pipeline, invitaciones y resultados en un solo lugar",
    boardStats: [
      { value: "84%", label: "finalización" },
      { value: "18", label: "candidatos activos" },
      { value: "4", label: "proyectos en curso" },
    ],
    boardRows: [
      {
        title: "Supervisor de atención al cliente",
        body: "Call center con foco en comunicación, resiliencia y atención al detalle.",
        badge: "En curso",
        tone: "border-[rgba(79,70,229,0.25)] bg-[rgba(79,70,229,0.08)] text-[#4338ca]",
        bars: [
          { flex: 5, className: signalBars.completed },
          { flex: 2, className: signalBars.started },
          { flex: 3, className: signalBars.invited },
        ],
      },
      {
        title: "Analista administrativo",
        body: "Batería con razonamiento numérico, verbal y precisión operativa.",
        badge: "Revisar",
        tone: "border-[rgba(217,119,6,0.28)] bg-[rgba(217,119,6,0.07)] text-[#b45309]",
        bars: [
          { flex: 7, className: signalBars.completed },
          { flex: 1, className: signalBars.started },
          { flex: 1, className: signalBars.expired },
        ],
      },
    ],
    featuresEyebrow: "Lo que resuelve",
    featuresTitle: "Una plataforma práctica para equipos que evalúan talento todos los días",
    features: [
      { index: "01", title: "Proyectos por rol", body: "Organice procesos por vacante, cliente o campaña y mantenga cada batería separada." },
      { index: "02", title: "Invitaciones sin cuenta", body: "Los candidatos reciben un enlace seguro y completan la evaluación sin crear usuario." },
      { index: "03", title: "Comparación trazable", body: "Resultados, rankings e informes se conservan por proyecto para revisión interna." },
      { index: "04", title: "Español primero", body: "Interfaz e invitaciones adaptadas al contexto corporativo de LATAM, con inglés disponible." },
    ],
    assessmentsEyebrow: "Biblioteca de pruebas",
    assessmentsTitle: "Cognitivo, personalidad, liderazgo y habilidades laborales",
    assessmentsBody:
      "Combine pruebas según el rol: razonamiento, atención al detalle, inteligencia emocional, liderazgo, comunicación, resolución de problemas y más.",
    assessmentGroups: [
      { title: "Cognitivas", body: "Pensamiento crítico, razonamiento verbal, abstracto, mecánico y numérico." },
      { title: "Conductuales", body: "AQ, inteligencia emocional, estilo de trabajo, estrés y adaptabilidad." },
      { title: "Liderazgo", body: "Estilos de liderazgo, toma de decisiones, colaboración e influencia." },
      { title: "Operativas", body: "Atención al detalle, servicio al cliente, comunicación y ventas." },
    ],
    faqEyebrow: "Preguntas frecuentes",
    faqTitle: "Diseñado para uso real en selección",
    faq: [
      { question: "¿Los candidatos necesitan una cuenta?", answer: "No. Reciben un enlace seguro por correo o copiado desde el panel y completan la evaluación directamente." },
      { question: "¿La plataforma funciona en español?", answer: "Sí. El español es el idioma predeterminado y el inglés queda disponible para equipos o candidatos que lo necesiten." },
      { question: "¿Sirve para agencias con varios clientes?", answer: "Sí. Puede crear proyectos separados por cliente, vacante o campaña para mantener resultados y candidatos ordenados." },
      { question: "¿Las pruebas reemplazan la entrevista?", answer: "No. Las evaluaciones entregan señales comparables para priorizar entrevistas y profundizar con preguntas más precisas." },
    ],
    finalTitle: "Prepare su próximo proceso con mejores señales desde el inicio",
    finalBody: "Cuéntenos su caso y le mostraremos cómo estructurar una batería para su tipo de organización.",
  },
  contact: {
    badge: "Hablemos",
    title: "Contacto comercial",
    body: "Escríbanos sobre su operación de selección, volumen de candidatos o necesidades de evaluación.",
    demoTitle: "Solicitar una demo",
    demoBody: "Le mostraremos el flujo completo: proyectos, invitaciones, evaluaciones e informes para recruiters.",
    response: "Normalmente respondemos dentro de 1 día hábil.",
    form: {
      name: "Nombre",
      email: "Correo laboral",
      company: "Empresa",
      role: "Cargo",
      phone: "Teléfono",
      companyType: "Tipo de organización",
      employees: "Tamaño aproximado",
      message: "Mensaje",
      submitContact: "Enviar mensaje",
      submitDemo: "Solicitar demo",
      sending: "Enviando...",
      successContact: "Gracias. Su mensaje fue enviado correctamente.",
      successDemo: "Gracias. Recibimos su solicitud de demo.",
      error: "No pudimos enviar el formulario. Intente nuevamente.",
      website: "Sitio web",
      typeOptions: ["Agencia de reclutamiento", "Pyme", "Call center", "Consultora HR", "Otro"],
    },
  },
  legal: {
    eyebrow: "Información legal",
    privacyTitle: "Política de Privacidad",
    termsTitle: "Términos y Condiciones",
    cookiesTitle: "Política de Cookies",
    privacyIntro: "Última actualización: 2 de julio de 2026. Esta política explica cómo IntelligencesTest trata datos de empresas, usuarios administradores y candidatos invitados.",
    termsIntro: "Última actualización: 2 de julio de 2026. Estos términos regulan el acceso y uso de la plataforma IntelligencesTest.",
    cookiesIntro: "Última actualización: 2 de julio de 2026. Esta política describe las cookies y tecnologías similares usadas por la plataforma.",
    privacy: [
      { title: "Responsable y contacto", body: ["IntelligencesTest opera la plataforma disponible en app.intelligencestest.com. Para consultas de privacidad, escriba a contact@intelligencestest.com."] },
      { title: "Datos que tratamos", body: ["Podemos tratar datos de cuenta, datos de empresa, usuarios administradores, proyectos de selección, candidatos invitados, respuestas de evaluación, resultados, actividad técnica y comunicaciones enviadas por formularios."] },
      { title: "Finalidad", body: ["Usamos los datos para prestar el servicio, autenticar usuarios, enviar invitaciones, generar resultados, mantener seguridad, responder consultas y mejorar la estabilidad de la plataforma."] },
      { title: "Candidatos", body: ["Los candidatos acceden mediante enlaces enviados por la empresa que los invita. La empresa cliente determina el contexto de uso de los resultados y debe informar a los candidatos según sus obligaciones legales aplicables."] },
      { title: "Conservación", body: ["Conservamos datos mientras la cuenta esté activa o mientras sea necesario para prestar el servicio, cumplir obligaciones legales, resolver disputas o mantener registros de seguridad."] },
      { title: "Seguridad y proveedores", body: ["Usamos controles técnicos y proveedores especializados para alojamiento, autenticación, base de datos y correo transaccional. Ningún sistema es completamente infalible, pero aplicamos medidas razonables para proteger la información."] },
      { title: "Derechos", body: ["Según la ley aplicable, usuarios y candidatos pueden solicitar acceso, corrección, eliminación u oposición al tratamiento. Algunas solicitudes de candidatos pueden requerir coordinación con la empresa que realizó la invitación."] },
    ],
    terms: [
      { title: "Uso permitido", body: ["La plataforma está destinada a organizaciones que gestionan procesos de selección, evaluación interna o consultoría de talento. Usted debe usarla de forma lícita y respetuosa de los derechos de candidatos y usuarios."] },
      { title: "Cuentas y seguridad", body: ["Cada organización es responsable de mantener la confidencialidad de sus credenciales, controlar el acceso de sus usuarios y revisar la información antes de tomar decisiones laborales."] },
      { title: "Evaluaciones y decisiones", body: ["Los resultados son herramientas de apoyo y no deben usarse como único fundamento para contratar, rechazar o tomar decisiones de alto impacto. Recomendamos combinarlos con entrevistas estructuradas, experiencia y criterios del rol."] },
      { title: "Disponibilidad", body: ["Trabajamos para mantener la plataforma disponible, pero pueden existir interrupciones por mantenimiento, proveedores externos o causas fuera de nuestro control."] },
      { title: "Propiedad intelectual", body: ["La plataforma, sus diseños, reportes, textos, lógica de evaluación y marca pertenecen a IntelligencesTest o sus licenciantes. No se permite copiar, revender o explotar el servicio sin autorización escrita."] },
      { title: "Suspensión", body: ["Podemos suspender o limitar el acceso si detectamos uso abusivo, riesgo de seguridad, incumplimiento de estos términos o solicitudes legales válidas."] },
    ],
    cookies: [
      { title: "Cookies necesarias", body: ["Usamos cookies necesarias para autenticación, seguridad, sesión e idioma. Sin ellas, el inicio de sesión y la experiencia bilingüe no funcionarían correctamente."] },
      { title: "Preferencias", body: ["Guardamos preferencias como idioma seleccionado para evitar que el usuario tenga que configurarlo en cada visita."] },
      { title: "Analítica", body: ["Si incorporamos herramientas de analítica en el futuro, se usarán para entender rendimiento y uso agregado del sitio. Actualizaremos esta política cuando corresponda."] },
      { title: "Gestión", body: ["Puede borrar cookies desde su navegador. Al hacerlo, es posible que deba volver a iniciar sesión o seleccionar idioma nuevamente."] },
    ],
  },
};

const en: PublicCopyInternal = {
  nav: {
    primaryAria: "Primary navigation",
    features: "Product",
    assessments: "Pricing",
    faq: "Security",
    contact: "Support",
    demo: "Start free trial",
    login: "Log in",
    signup: "Free trial",
  },
  footer: {
    explore: "Explore",
    body: "Psychometric and cognitive assessments for hiring teams that need clear, comparable candidate signals.",
    product: "Product",
    authority: "Trust",
    methodology: "Methodology",
    scientificFoundations: "Scientific foundations",
    legal: "Legal",
    rights: "© 2026 IntelligencesTest. All rights reserved.",
  },
  home: {
    eyebrow: "B2B for recruitment and HR consulting",
    heroTitle: "Psychometric assessments for clearer hiring decisions",
    heroBody:
      "Invite candidates, combine cognitive and behavioral tests, and review results in a workspace built for recruitment agencies, SMEs, call centers, and HR consulting firms.",
    primaryCta: "Start now",
    secondaryCta: "Explore assessments",
    stats: [
      { value: "22+", label: "active assessments" },
      { value: "ES/EN", label: "bilingual experience" },
      { value: "7 days", label: "secure links" },
    ],
    boardAria: "Assessment workflow preview",
    boardTitle: "Assessment operations",
    boardSubtitle: "Pipeline, invitations, and results in one place",
    boardStats: [
      { value: "84%", label: "completion" },
      { value: "18", label: "active candidates" },
      { value: "4", label: "open projects" },
    ],
    boardRows: [
      {
        title: "Customer support supervisor",
        body: "Call center battery focused on communication, resilience, and attention to detail.",
        badge: "In progress",
        tone: "border-[rgba(79,70,229,0.25)] bg-[rgba(79,70,229,0.08)] text-[#4338ca]",
        bars: [
          { flex: 5, className: signalBars.completed },
          { flex: 2, className: signalBars.started },
          { flex: 3, className: signalBars.invited },
        ],
      },
      {
        title: "Administrative analyst",
        body: "Battery with numerical reasoning, verbal reasoning, and operational accuracy.",
        badge: "Review",
        tone: "border-[rgba(217,119,6,0.28)] bg-[rgba(217,119,6,0.07)] text-[#b45309]",
        bars: [
          { flex: 7, className: signalBars.completed },
          { flex: 1, className: signalBars.started },
          { flex: 1, className: signalBars.expired },
        ],
      },
    ],
    featuresEyebrow: "What it solves",
    featuresTitle: "A practical platform for teams evaluating talent every day",
    features: [
      { index: "01", title: "Projects by role", body: "Organize hiring by vacancy, client, or campaign while keeping every battery separate." },
      { index: "02", title: "No candidate account", body: "Candidates receive a secure link and complete the assessment directly." },
      { index: "03", title: "Traceable comparison", body: "Results, rankings, and reports stay attached to each project for review." },
      { index: "04", title: "Spanish first", body: "Interface and invitations are adapted for LATAM teams, with English still available." },
    ],
    assessmentsEyebrow: "Assessment library",
    assessmentsTitle: "Cognitive, personality, leadership, and workplace skills",
    assessmentsBody:
      "Combine tests by role: reasoning, attention to detail, emotional intelligence, leadership, communication, problem solving, and more.",
    assessmentGroups: [
      { title: "Cognitive", body: "Critical thinking, verbal, abstract, mechanical, and numerical reasoning." },
      { title: "Behavioral", body: "AQ, emotional intelligence, work style, stress tolerance, and adaptability." },
      { title: "Leadership", body: "Leadership styles, decision making, collaboration, and influence." },
      { title: "Operational", body: "Attention to detail, customer service, communication, and sales aptitude." },
    ],
    faqEyebrow: "FAQ",
    faqTitle: "Built for real hiring operations",
    faq: [
      { question: "Do candidates need an account?", answer: "No. They receive a secure link by email or copied from the dashboard and complete the assessment directly." },
      { question: "Does the platform work in Spanish?", answer: "Yes. Spanish is the default language, and English remains available when a team or candidate needs it." },
      { question: "Does it work for agencies with many clients?", answer: "Yes. You can create separate projects by client, vacancy, or campaign to keep candidates and results organized." },
      { question: "Do assessments replace interviews?", answer: "No. Assessments provide comparable signals that help prioritize interviews and ask sharper follow-up questions." },
    ],
    finalTitle: "Start your next process with better signals from day one",
    finalBody: "Tell us about your use case and we will show you how to structure an assessment battery for your organization.",
  },
  contact: {
    badge: "Talk to us",
    title: "Contact sales",
    body: "Tell us about your hiring operation, candidate volume, or assessment needs.",
    demoTitle: "Request a demo",
    demoBody: "We will walk you through projects, invitations, assessments, and recruiter reports.",
    response: "We usually respond within 1 business day.",
    form: {
      name: "Name",
      email: "Work email",
      company: "Company",
      role: "Role",
      phone: "Phone",
      companyType: "Organization type",
      employees: "Approximate size",
      message: "Message",
      submitContact: "Send message",
      submitDemo: "Request demo",
      sending: "Sending...",
      successContact: "Thank you. Your message was sent successfully.",
      successDemo: "Thank you. We received your demo request.",
      error: "We could not send the form. Please try again.",
      website: "Website",
      typeOptions: ["Recruitment agency", "SME", "Call center", "HR consulting firm", "Other"],
    },
  },
  legal: {
    eyebrow: "Legal information",
    privacyTitle: "Privacy Policy",
    termsTitle: "Terms and Conditions",
    cookiesTitle: "Cookie Policy",
    privacyIntro: "Last updated: July 2, 2026. This policy explains how IntelligencesTest handles company, admin user, and invited candidate data.",
    termsIntro: "Last updated: July 2, 2026. These terms govern access to and use of the IntelligencesTest platform.",
    cookiesIntro: "Last updated: July 2, 2026. This policy describes cookies and similar technologies used by the platform.",
    privacy: [
      { title: "Controller and contact", body: ["IntelligencesTest operates the platform available at app.intelligencestest.com. For privacy questions, contact contact@intelligencestest.com."] },
      { title: "Data we process", body: ["We may process account data, company data, admin users, hiring projects, invited candidates, assessment responses, results, technical activity, and communications submitted through forms."] },
      { title: "Purpose", body: ["We use data to provide the service, authenticate users, send invitations, generate results, maintain security, respond to inquiries, and improve platform stability."] },
      { title: "Candidates", body: ["Candidates access assessments through links sent by the inviting company. The customer company determines the hiring context and must inform candidates according to applicable legal obligations."] },
      { title: "Retention", body: ["We retain data while the account is active or as needed to provide the service, meet legal obligations, resolve disputes, or maintain security records."] },
      { title: "Security and providers", body: ["We use technical controls and specialized providers for hosting, authentication, database, and transactional email. No system is perfect, but we apply reasonable safeguards to protect information."] },
      { title: "Rights", body: ["Depending on applicable law, users and candidates may request access, correction, deletion, or objection to processing. Some candidate requests may require coordination with the inviting company."] },
    ],
    terms: [
      { title: "Permitted use", body: ["The platform is intended for organizations managing hiring, internal assessment, or talent consulting workflows. You must use it lawfully and respect candidate and user rights."] },
      { title: "Accounts and security", body: ["Each organization is responsible for keeping credentials confidential, controlling user access, and reviewing information before making employment decisions."] },
      { title: "Assessments and decisions", body: ["Results are support tools and should not be used as the only basis for hiring, rejection, or other high-impact decisions. We recommend combining them with structured interviews, experience, and role criteria."] },
      { title: "Availability", body: ["We work to keep the platform available, but interruptions may happen because of maintenance, third-party providers, or events outside our control."] },
      { title: "Intellectual property", body: ["The platform, designs, reports, text, assessment logic, and brand belong to IntelligencesTest or its licensors. Copying, reselling, or exploiting the service without written authorization is not allowed."] },
      { title: "Suspension", body: ["We may suspend or limit access if we detect abusive use, security risk, breach of these terms, or valid legal requests."] },
    ],
    cookies: [
      { title: "Necessary cookies", body: ["We use necessary cookies for authentication, security, sessions, and language. Without them, login and the bilingual experience would not work properly."] },
      { title: "Preferences", body: ["We store preferences such as selected language so users do not need to configure it on every visit."] },
      { title: "Analytics", body: ["If we add analytics tools in the future, they will be used to understand performance and aggregate site usage. We will update this policy when appropriate."] },
      { title: "Management", body: ["You can delete cookies from your browser. If you do, you may need to sign in again or select your language again."] },
    ],
  },
};

const fr: PublicCopyInternal = {
  nav: {
    primaryAria: "Navigation principale",
    features: "Produit",
    assessments: "Tarifs",
    faq: "Sécurité",
    contact: "Support",
    demo: "Commencer l'essai gratuit",
    login: "Connexion",
    signup: "Essai gratuit",
  },
  footer: {
    explore: "Explorer",
    body: "Évaluations psychométriques et cognitives pour les équipes de recrutement qui doivent comparer les candidats avec des critères clairs et traçables.",
    product: "Produit",
    authority: "Confiance",
    methodology: "Méthodologie",
    scientificFoundations: "Fondements scientifiques",
    legal: "Mentions légales",
    rights: "© 2026 IntelligencesTest. Tous droits réservés.",
  },
  home: {
    eyebrow: "B2B pour le recrutement et le conseil RH",
    heroTitle: "Comparez les candidats avant l'entretien avec des critères clairs et structurés",
    heroBody:
      "IntelligencesTest aide les cabinets de recrutement à comparer les candidats avant de les présenter au client, avec des preuves claires, des risques identifiés et des questions d'entretien structurées.",
    primaryCta: "Commencer maintenant",
    secondaryCta: "Découvrir les évaluations",
    stats: [
      { value: "22+", label: "évaluations actives" },
      { value: "FR/EN/ES", label: "expérience multilingue" },
      { value: "7 jours", label: "liens sécurisés" },
    ],
    boardAria: "Aperçu du flux d'évaluation",
    boardTitle: "Pilotage des évaluations",
    boardSubtitle: "Pipeline, invitations et résultats au même endroit",
    boardStats: [
      { value: "84%", label: "taux de complétion" },
      { value: "18", label: "candidats actifs" },
      { value: "4", label: "projets en cours" },
    ],
    boardRows: [
      {
        title: "Superviseur service client",
        body: "Centre d'appels axé sur la communication, la résilience et la rigueur.",
        badge: "En cours",
        tone: "border-[rgba(79,70,229,0.25)] bg-[rgba(79,70,229,0.08)] text-[#4338ca]",
        bars: [
          { flex: 5, className: signalBars.completed },
          { flex: 2, className: signalBars.started },
          { flex: 3, className: signalBars.invited },
        ],
      },
      {
        title: "Analyste administratif",
        body: "Batterie de raisonnement numérique, verbal et de précision opérationnelle.",
        badge: "À examiner",
        tone: "border-[rgba(217,119,6,0.28)] bg-[rgba(217,119,6,0.07)] text-[#b45309]",
        bars: [
          { flex: 7, className: signalBars.completed },
          { flex: 1, className: signalBars.started },
          { flex: 1, className: signalBars.expired },
        ],
      },
    ],
    featuresEyebrow: "Ce que ça résout",
    featuresTitle: "Une plateforme pratique pour les équipes qui évaluent des talents au quotidien",
    features: [
      { index: "01", title: "Projets par poste", body: "Organisez vos processus par poste, client ou campagne et gardez chaque batterie séparée." },
      { index: "02", title: "Invitations sans compte", body: "Les candidats reçoivent un lien sécurisé et passent l'évaluation sans créer de compte." },
      { index: "03", title: "Comparaison traçable", body: "Résultats, classements et rapports sont conservés par projet pour la revue interne." },
      { index: "04", title: "Pensé pour le Maroc et la francophonie", body: "Interface et invitations adaptées aux cabinets de recrutement francophones, avec l'anglais et l'espagnol disponibles." },
    ],
    assessmentsEyebrow: "Bibliothèque d'évaluations",
    assessmentsTitle: "Cognitif, personnalité, leadership et compétences professionnelles",
    assessmentsBody:
      "Combinez les tests selon le poste : raisonnement, rigueur, intelligence émotionnelle, leadership, communication, résolution de problèmes et plus encore.",
    assessmentGroups: [
      { title: "Cognitives", body: "Pensée critique, raisonnement verbal, abstrait, mécanique et numérique." },
      { title: "Comportementales", body: "AQ, intelligence émotionnelle, style de travail, gestion du stress et adaptabilité." },
      { title: "Leadership", body: "Styles de leadership, prise de décision, collaboration et influence." },
      { title: "Opérationnelles", body: "Rigueur, service client, communication et aptitude commerciale." },
    ],
    faqEyebrow: "Questions fréquentes",
    faqTitle: "Conçu pour un usage réel en recrutement",
    faq: [
      { question: "Les candidats ont-ils besoin d'un compte ?", answer: "Non. Ils reçoivent un lien sécurisé par e-mail ou copié depuis le tableau de bord et passent l'évaluation directement." },
      { question: "La plateforme fonctionne-t-elle en français ?", answer: "Oui, pour le tableau de bord et les invitations. Le contenu détaillé des évaluations et le texte généré des rapports restent disponibles en anglais ou en espagnol pour le moment." },
      { question: "Est-ce adapté aux cabinets avec plusieurs clients ?", answer: "Oui. Vous pouvez créer des projets séparés par client, poste ou campagne pour garder candidats et résultats organisés." },
      { question: "Les évaluations remplacent-elles l'entretien ?", answer: "Non. Elles fournissent des preuves comparables pour prioriser les entretiens et poser des questions plus précises — la décision finale reste celle du recruteur." },
    ],
    finalTitle: "Préparez votre prochain processus avec de meilleures preuves dès le départ",
    finalBody: "Testez gratuitement votre prochaine short-list — jusqu'à 10 candidats. Parlez-nous de votre cas et nous vous montrerons comment structurer une batterie adaptée à votre cabinet.",
  },
  contact: {
    badge: "Parlons-en",
    title: "Contact commercial",
    body: "Écrivez-nous à propos de votre activité de recrutement, du volume de candidats ou de vos besoins d'évaluation.",
    demoTitle: "Demander une démo",
    demoBody: "Nous vous présenterons le flux complet : projets, invitations, évaluations et rapports pour recruteurs.",
    response: "Nous répondons généralement sous 1 jour ouvré.",
    form: {
      name: "Nom",
      email: "E-mail professionnel",
      company: "Cabinet / Entreprise",
      role: "Fonction",
      phone: "Téléphone",
      companyType: "Type d'organisation",
      employees: "Taille approximative",
      message: "Message",
      submitContact: "Envoyer le message",
      submitDemo: "Demander une démo",
      sending: "Envoi en cours...",
      successContact: "Merci. Votre message a été envoyé avec succès.",
      successDemo: "Merci. Nous avons bien reçu votre demande de démo.",
      error: "Nous n'avons pas pu envoyer le formulaire. Veuillez réessayer.",
      website: "Site web",
      typeOptions: ["Cabinet de recrutement", "PME", "Centre d'appels", "Cabinet conseil RH", "Autre"],
    },
  },
  legal: {
    eyebrow: "Informations légales",
    privacyTitle: "Politique de confidentialité",
    termsTitle: "Conditions générales",
    cookiesTitle: "Politique de cookies",
    privacyIntro: "Dernière mise à jour : 2 juillet 2026. Cette politique explique comment IntelligencesTest traite les données des entreprises, des utilisateurs administrateurs et des candidats invités.",
    termsIntro: "Dernière mise à jour : 2 juillet 2026. Ces conditions régissent l'accès et l'utilisation de la plateforme IntelligencesTest.",
    cookiesIntro: "Dernière mise à jour : 2 juillet 2026. Cette politique décrit les cookies et technologies similaires utilisés par la plateforme.",
    privacy: [
      { title: "Responsable et contact", body: ["IntelligencesTest exploite la plateforme disponible sur app.intelligencestest.com. Pour toute question relative à la confidentialité, écrivez à contact@intelligencestest.com."] },
      { title: "Données traitées", body: ["Nous pouvons traiter des données de compte, des données d'entreprise, des utilisateurs administrateurs, des projets de recrutement, des candidats invités, des réponses aux évaluations, des résultats, des données d'activité technique et des communications envoyées via les formulaires."] },
      { title: "Finalité", body: ["Nous utilisons ces données pour fournir le service, authentifier les utilisateurs, envoyer des invitations, générer des résultats, assurer la sécurité, répondre aux demandes et améliorer la stabilité de la plateforme."] },
      { title: "Candidats", body: ["Les candidats accèdent à la plateforme via des liens envoyés par l'entreprise qui les invite. L'entreprise cliente détermine le contexte d'utilisation des résultats et doit informer les candidats conformément à ses obligations légales applicables."] },
      { title: "Conservation", body: ["Nous conservons les données tant que le compte est actif ou aussi longtemps que nécessaire pour fournir le service, respecter des obligations légales, résoudre des litiges ou conserver des registres de sécurité."] },
      { title: "Sécurité et prestataires", body: ["Nous utilisons des contrôles techniques et des prestataires spécialisés pour l'hébergement, l'authentification, la base de données et l'e-mail transactionnel. Aucun système n'est infaillible, mais nous appliquons des mesures raisonnables pour protéger les informations."] },
      { title: "Droits", body: ["Selon la loi applicable, les utilisateurs et les candidats peuvent demander l'accès, la correction, la suppression ou l'opposition au traitement de leurs données. Certaines demandes de candidats peuvent nécessiter une coordination avec l'entreprise à l'origine de l'invitation."] },
    ],
    terms: [
      { title: "Utilisation autorisée", body: ["La plateforme est destinée aux organisations qui gèrent des processus de recrutement, d'évaluation interne ou de conseil en talents. Vous devez l'utiliser de manière licite et dans le respect des droits des candidats et des utilisateurs."] },
      { title: "Comptes et sécurité", body: ["Chaque organisation est responsable de la confidentialité de ses identifiants, du contrôle de l'accès de ses utilisateurs et de la vérification des informations avant de prendre des décisions d'emploi."] },
      { title: "Évaluations et décisions", body: ["Les résultats sont des outils d'aide à la décision et ne doivent pas constituer l'unique fondement d'une décision d'embauche, de refus ou de toute autre décision à fort impact. Nous recommandons de les combiner avec des entretiens structurés, l'expérience et les critères du poste."] },
      { title: "Disponibilité", body: ["Nous nous efforçons de maintenir la plateforme disponible, mais des interruptions peuvent survenir en raison de maintenance, de prestataires tiers ou de causes hors de notre contrôle."] },
      { title: "Propriété intellectuelle", body: ["La plateforme, ses designs, rapports, textes, logique d'évaluation et sa marque appartiennent à IntelligencesTest ou à ses concédants. Toute copie, revente ou exploitation du service sans autorisation écrite est interdite."] },
      { title: "Suspension", body: ["Nous pouvons suspendre ou limiter l'accès en cas d'usage abusif détecté, de risque de sécurité, de non-respect des présentes conditions ou de demandes légales valables."] },
    ],
    cookies: [
      { title: "Cookies nécessaires", body: ["Nous utilisons des cookies nécessaires à l'authentification, à la sécurité, à la session et à la langue. Sans eux, la connexion et l'expérience multilingue ne fonctionneraient pas correctement."] },
      { title: "Préférences", body: ["Nous conservons des préférences telles que la langue sélectionnée afin que l'utilisateur n'ait pas à la reconfigurer à chaque visite."] },
      { title: "Analytique", body: ["Si nous ajoutons des outils d'analyse à l'avenir, ils serviront à comprendre la performance et l'utilisation agrégée du site. Nous mettrons à jour cette politique le cas échéant."] },
      { title: "Gestion", body: ["Vous pouvez supprimer les cookies depuis votre navigateur. Si vous le faites, il se peut que vous deviez vous reconnecter ou sélectionner à nouveau votre langue."] },
    ],
  },
};

export type PublicCopy = typeof es;

export function getPublicCopy(locale: AppLocale): PublicCopy {
  if (locale === "en") return en;
  if (locale === "fr") return fr;
  return es;
}
