import type { AppLocale } from "@/lib/i18n/locales";

type LegalSection = { title: string; body: string[] };

type PublicCopyInternal = {
  nav: {
    primaryAria: string;
    features: string;
    assessments: string;
    pricing: string;
    faq: string;
    contact: string;
    demo: string;
    login: string;
    signup: string;
  };
  footer: { body: string; product: string; legal: string; rights: string };
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
  pricing: {
    eyebrow: string;
    title: string;
    body: string;
    billedNote: string;
    highlightLabel: string;
    plans: Array<{
      id: string;
      name: string;
      price: string;
      priceSuffix: string;
      description: string;
      features: string[];
      ctaLabel: string;
      ctaHref: "/signup" | "/contact";
      highlighted?: boolean;
    }>;
    faqEyebrow: string;
    faqTitle: string;
    faq: Array<{ question: string; answer: string }>;
    finalTitle: string;
    finalBody: string;
  };
};

const signalBars = {
  completed: "bg-emerald-400",
  started: "bg-blue-400",
  invited: "bg-amber-300",
  expired: "bg-slate-600",
};

const es: PublicCopyInternal = {
  nav: {
    primaryAria: "Navegación principal",
    features: "Plataforma",
    assessments: "Evaluaciones",
    pricing: "Precios",
    faq: "FAQ",
    contact: "Contacto",
    demo: "Comenzar",
    login: "Ingresar",
    signup: "Crear cuenta",
  },
  footer: {
    body: "Evaluaciones psicométricas y cognitivas para equipos de selección que necesitan comparar candidatos con criterios claros y trazables.",
    product: "Producto",
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
        tone: "border-blue-500/25 bg-blue-500/10 text-blue-300",
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
        tone: "border-amber-500/25 bg-amber-500/10 text-amber-200",
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
  pricing: {
    eyebrow: "Precios",
    title: "Un plan para cada volumen de contratación",
    body: "Empiece con una prueba gratuita de 3 días y pase a Starter o Professional cuando su equipo lo necesite. Enterprise se adapta a operaciones de mayor volumen.",
    billedNote: "Precios en euros, facturación mensual con PayPal. Cancele cuando quiera.",
    highlightLabel: "Recomendado",
    plans: [
      {
        id: "trial",
        name: "Prueba gratuita",
        price: "0 €",
        priceSuffix: "/3 días",
        description: "Para probar el flujo completo antes de decidir.",
        features: ["3 días de acceso", "1 proyecto activo", "10 candidatos", "1 reclutador"],
        ctaLabel: "Comenzar prueba",
        ctaHref: "/signup",
      },
      {
        id: "starter",
        name: "Starter",
        price: "29 €",
        priceSuffix: "/mes",
        description: "Para equipos pequeños con procesos puntuales.",
        features: ["1 proyecto activo", "10 candidatos al mes", "1 reclutador"],
        ctaLabel: "Comenzar ahora",
        ctaHref: "/signup",
      },
      {
        id: "professional",
        name: "Professional",
        price: "79 €",
        priceSuffix: "/mes",
        description: "Para equipos que gestionan varios procesos a la vez.",
        features: ["3 proyectos activos", "50 candidatos al mes", "3 reclutadores"],
        ctaLabel: "Comenzar ahora",
        ctaHref: "/signup",
        highlighted: true,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: "A medida",
        priceSuffix: "",
        description: "Para operaciones de alto volumen con necesidades específicas.",
        features: ["Límites personalizados", "Soporte comercial", "Configuración a medida"],
        ctaLabel: "Contactar con ventas",
        ctaHref: "/contact",
      },
    ],
    faqEyebrow: "Preguntas frecuentes",
    faqTitle: "Antes de elegir un plan",
    faq: [
      {
        question: "¿Qué pasa si supero el límite de candidatos de mi plan?",
        answer: "Sus candidatos y proyectos existentes siguen siendo accesibles. Para invitar nuevos candidatos por encima del límite, deberá pasar al siguiente plan.",
      },
      {
        question: "¿Puedo cambiar de plan más adelante?",
        answer: "Sí. Puede pasar de Starter a Professional (o a Enterprise) cuando su volumen de contratación crezca.",
      },
      {
        question: "¿Qué incluye la prueba gratuita?",
        answer: "3 días de acceso completo con los mismos límites que Starter: 1 proyecto activo, 10 candidatos y 1 reclutador.",
      },
      {
        question: "¿Cómo funciona la facturación?",
        answer: "Starter y Professional se facturan mensualmente a través de PayPal. Enterprise se gestiona directamente con el equipo comercial.",
      },
    ],
    finalTitle: "¿Aún decidiendo? Hablemos de su volumen de contratación.",
    finalBody: "Cuéntenos cuántos procesos gestiona al mes y le recomendamos el plan adecuado.",
  },
};

const en: PublicCopyInternal = {
  nav: {
    primaryAria: "Primary navigation",
    features: "Platform",
    assessments: "Assessments",
    pricing: "Pricing",
    faq: "FAQ",
    contact: "Contact",
    demo: "Get started",
    login: "Log in",
    signup: "Create account",
  },
  footer: {
    body: "Psychometric and cognitive assessments for hiring teams that need clear, comparable candidate signals.",
    product: "Product",
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
        tone: "border-blue-500/25 bg-blue-500/10 text-blue-300",
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
        tone: "border-amber-500/25 bg-amber-500/10 text-amber-200",
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
  pricing: {
    eyebrow: "Pricing",
    title: "One plan for every hiring volume",
    body: "Start with a free 3-day trial, then move to Starter or Professional as your team grows. Enterprise adapts to higher-volume operations.",
    billedNote: "Prices in EUR, billed monthly via PayPal. Cancel anytime.",
    highlightLabel: "Recommended",
    plans: [
      {
        id: "trial",
        name: "Free trial",
        price: "€0",
        priceSuffix: "/3 days",
        description: "Try the full workflow before deciding.",
        features: ["3 days access", "1 active project", "10 candidates", "1 recruiter"],
        ctaLabel: "Start trial",
        ctaHref: "/signup",
      },
      {
        id: "starter",
        name: "Starter",
        price: "€29",
        priceSuffix: "/month",
        description: "For small teams running occasional hiring.",
        features: ["1 active project", "10 candidates per month", "1 recruiter"],
        ctaLabel: "Start now",
        ctaHref: "/signup",
      },
      {
        id: "professional",
        name: "Professional",
        price: "€79",
        priceSuffix: "/month",
        description: "For teams running several hiring processes at once.",
        features: ["3 active projects", "50 candidates per month", "3 recruiters"],
        ctaLabel: "Start now",
        ctaHref: "/signup",
        highlighted: true,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: "Tailored",
        priceSuffix: "",
        description: "For high-volume operations with specific needs.",
        features: ["Custom limits", "Commercial support", "Tailored setup"],
        ctaLabel: "Contact sales",
        ctaHref: "/contact",
      },
    ],
    faqEyebrow: "FAQ",
    faqTitle: "Before you choose a plan",
    faq: [
      {
        question: "What happens if I go over my plan's candidate limit?",
        answer: "Existing candidates and projects stay accessible. To invite new candidates beyond the limit, you'll need to move to the next plan.",
      },
      {
        question: "Can I change plans later?",
        answer: "Yes. You can move from Starter to Professional (or Enterprise) as your hiring volume grows.",
      },
      {
        question: "What does the free trial include?",
        answer: "3 days of full access with the same limits as Starter: 1 active project, 10 candidates, and 1 recruiter.",
      },
      {
        question: "How does billing work?",
        answer: "Starter and Professional are billed monthly through PayPal. Enterprise is arranged directly with our commercial team.",
      },
    ],
    finalTitle: "Still deciding? Let's talk about your hiring volume.",
    finalBody: "Tell us how many hiring processes you run each month and we'll recommend the right plan.",
  },
};

export type PublicCopy = typeof es;

export function getPublicCopy(locale: AppLocale): PublicCopy {
  return locale === "en" ? en : es;
}
