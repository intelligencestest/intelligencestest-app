"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { PayPalSubscribeButton } from "@/components/billing/PayPalSubscribeButton";
import { localePath, toAppLocale } from "@/lib/i18n/locales";

type PlanId = "trial" | "starter" | "professional" | "enterprise";

interface PlanData {
  plan: string;
  planId: PlanId | null;
  trialStatus: "active" | "expired" | "extended" | "converted";
  trialEndsAt: string | null;
  trialDaysLeft: number | null;
  isTrialExpired: boolean;
  subscriptionStatus: string;
  billingProvider: string;
  limits: { candidates: number | null; projects: number | null; recruiters: number | null };
  usage: { candidates: number; projects: number; recruiters: number };
  priceEur: number | null;
}

function usagePercent(used: number, limit: number | null) {
  if (limit === null || limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

function usageTone(used: number, limit: number | null) {
  if (limit === null || limit <= 0) return "bg-[#7897c5]";
  const ratio = used / limit;
  if (ratio >= 1) return "bg-[#d99792]";
  if (ratio >= 0.8) return "bg-[#d2b174]";
  return "bg-[#7897c5]";
}

export default function BillingSettingsPage() {
  const locale = toAppLocale(useLocale());
  const billingT = useTranslations("billing");
  const es = locale === "es";
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);

  const copy = es
    ? {
        title: "Plan y facturación",
        description: "Gestione su prueba, límites de uso y suscripción de IntelligencesTest.",
        account: "Cuenta",
        billing: "Facturación",
        security: "Seguridad",
        notifications: "Notificaciones",
        currentSubscription: "Suscripción actual",
        currentPlan: "Plan actual",
        status: "Estado",
        provider: "Proveedor",
        trialEnds: "La prueba finaliza",
        trialEnded: "La prueba finalizó",
        daysLeft: (days: number) => (days === 1 ? "Queda 1 día" : `Quedan ${days} días`),
        paymentMode: "PayPal está disponible para Starter y Professional. Enterprise se gestiona con el equipo comercial.",
        usage: "Uso del plan",
        usageNote: "Sus proyectos, candidatos e informes existentes permanecen accesibles aunque se alcance un límite.",
        candidates: "Candidatos este mes",
        projects: "Proyectos activos",
        recruiters: "Reclutadores",
        unlimited: "sin límite",
        availablePlans: "Planes disponibles",
        availablePlansText: "Elija el plan que corresponde a su volumen actual.",
        freeTrial: "Prueba gratuita",
        starter: "Starter",
        professional: "Professional",
        enterprise: "Enterprise",
        tailored: "A medida",
        current: "Actual",
        subscribe: "Suscribirse con PayPal",
        contactSales: "Contactar con ventas",
        loading: "Cargando facturación...",
        manual: "Manual",
        paypal: "PayPal",
        legacy: (plan: string) => `Plan anterior (${plan})`,
        subscriptionLabels: {
          manual: "Manual",
          pending_payment: "Pago pendiente",
          active: "Activo",
          past_due: "Pago pendiente",
          cancelled: "Cancelado",
        },
        features: {
          trial: ["3 días de acceso", "1 proyecto activo", "10 candidatos", "1 reclutador"],
          starter: ["1 proyecto activo", "10 candidatos al mes", "1 reclutador"],
          professional: ["3 proyectos activos", "50 candidatos al mes", "3 reclutadores"],
          enterprise: ["Límites personalizados", "Soporte comercial", "Configuración a medida"],
        },
      }
    : {
        title: "Plan and billing",
        description: "Manage your trial, usage limits, and IntelligencesTest subscription.",
        account: "Account",
        billing: "Billing",
        security: "Security",
        notifications: "Notifications",
        currentSubscription: "Current subscription",
        currentPlan: "Current plan",
        status: "Status",
        provider: "Provider",
        trialEnds: "Trial ends",
        trialEnded: "Trial ended",
        daysLeft: (days: number) => (days === 1 ? "1 day left" : `${days} days left`),
        paymentMode: "PayPal is available for Starter and Professional. Enterprise is handled by the commercial team.",
        usage: "Plan usage",
        usageNote: "Existing projects, candidates, and reports remain accessible even when a limit is reached.",
        candidates: "Candidates this month",
        projects: "Active projects",
        recruiters: "Recruiters",
        unlimited: "unlimited",
        availablePlans: "Available plans",
        availablePlansText: "Choose the plan that matches your current hiring volume.",
        freeTrial: "Free trial",
        starter: "Starter",
        professional: "Professional",
        enterprise: "Enterprise",
        tailored: "Tailored",
        current: "Current",
        subscribe: "Subscribe with PayPal",
        contactSales: "Contact sales",
        loading: "Loading billing...",
        manual: "Manual",
        paypal: "PayPal",
        legacy: (plan: string) => `Legacy plan (${plan})`,
        subscriptionLabels: {
          manual: "Manual",
          pending_payment: "Pending payment",
          active: "Active",
          past_due: "Past due",
          cancelled: "Cancelled",
        },
        features: {
          trial: ["3 days access", "1 active project", "10 candidates", "1 recruiter"],
          starter: ["1 active project", "10 candidates per month", "1 recruiter"],
          professional: ["3 active projects", "50 candidates per month", "3 recruiters"],
          enterprise: ["Custom limits", "Commercial support", "Tailored setup"],
        },
      };

  useEffect(() => {
    let mounted = true;

    async function loadPlan() {
      try {
        const response = await fetch("/api/settings/plan", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as PlanData;
        if (mounted) setPlanData(data);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPlan();
    return () => {
      mounted = false;
    };
  }, []);

  const activeTrial = Boolean(
    planData?.trialStatus === "active" &&
      planData.trialEndsAt &&
      !planData.isTrialExpired &&
      planData.subscriptionStatus !== "active"
  );
  const effectivePlanId: PlanId | null = activeTrial ? "trial" : planData?.planId ?? null;
  const planName =
    effectivePlanId === "trial"
      ? copy.freeTrial
      : effectivePlanId === "starter"
        ? billingT("starterPlanLabel")
        : effectivePlanId === "professional"
          ? billingT("professionalPlanLabel")
          : effectivePlanId === "enterprise"
            ? copy.enterprise
            : planData
              ? copy.legacy(planData.plan)
              : "";
  const subscriptionKey = planData?.subscriptionStatus as keyof typeof copy.subscriptionLabels | undefined;
  const subscriptionLabel =
    subscriptionKey && copy.subscriptionLabels[subscriptionKey]
      ? copy.subscriptionLabels[subscriptionKey]
      : planData?.subscriptionStatus.replace(/_/g, " ") ?? "";
  const usageRows = planData
    ? [
        { label: copy.candidates, used: planData.usage.candidates, limit: planData.limits.candidates },
        { label: copy.projects, used: planData.usage.projects, limit: planData.limits.projects },
        { label: copy.recruiters, used: planData.usage.recruiters, limit: planData.limits.recruiters },
      ]
    : [];
  const navItems = [
    { href: "/settings", label: copy.account },
    { href: "/settings/billing", label: copy.billing, active: true },
    { href: "/settings#security", label: copy.security },
    { href: "/settings#notifications", label: copy.notifications },
  ];
  const planCards = [
    {
      id: "trial" as const,
      name: copy.freeTrial,
      price: es ? "0 €/3 días" : "€0/3 days",
      features: copy.features.trial,
    },
    {
      id: "starter" as const,
      name: copy.starter,
      price: es ? "29 €/mes" : "€29/month",
      features: copy.features.starter,
    },
    {
      id: "professional" as const,
      name: copy.professional,
      price: es ? "79 €/mes" : "€79/month",
      features: copy.features.professional,
    },
    {
      id: "enterprise" as const,
      name: copy.enterprise,
      price: copy.tailored,
      features: copy.features.enterprise,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-medium text-[var(--it-faint)]">{es ? "Configuración" : "Settings"}</p>
        <h1 className="mt-2 text-2xl font-bold text-white">{copy.title}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{copy.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
        <aside className="premium-card sticky top-24 hidden rounded-xl p-3 lg:block">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={localePath(item.href, locale)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  item.active
                    ? "bg-white/[0.055] text-white"
                    : "text-slate-400 hover:bg-white/[0.035] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="space-y-6">
          <div className="premium-card rounded-xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#1E2240] pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--it-faint)]">
                  {copy.currentSubscription}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">{loading ? copy.loading : planName}</h2>
              </div>
              {effectivePlanId && (
                <span className="rounded-full border border-[#3f5fba] bg-[#1D4ED8]/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#9BB8FF]">
                  {effectivePlanId === "trial" ? copy.freeTrial : copy.currentPlan}
                </span>
              )}
            </div>

            {loading ? (
              <p className="mt-5 text-sm text-slate-500">{copy.loading}</p>
            ) : planData ? (
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-[#1E2240] bg-[#07080F]/55 px-4 py-3.5">
                  <p className="text-xs uppercase tracking-wider text-slate-600">{copy.status}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-100">{subscriptionLabel}</p>
                </div>
                <div className="rounded-lg border border-[#1E2240] bg-[#07080F]/55 px-4 py-3.5">
                  <p className="text-xs uppercase tracking-wider text-slate-600">{copy.provider}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-100">
                    {planData.billingProvider === "paypal" ? copy.paypal : copy.manual}
                  </p>
                </div>
                {planData.trialEndsAt ? (
                  <div className="rounded-lg border border-[#1E2240] bg-[#07080F]/55 px-4 py-3.5">
                    <p className="text-xs uppercase tracking-wider text-slate-600">
                      {planData.isTrialExpired ? copy.trialEnded : copy.trialEnds}
                    </p>
                    <p className={`mt-1 text-lg font-semibold ${planData.isTrialExpired ? "text-[#d99792]" : "text-slate-100"}`}>
                      {new Date(planData.trialEndsAt).toLocaleDateString(es ? "es-ES" : "en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {activeTrial && planData.trialDaysLeft !== null ? (
                      <p className="mt-0.5 text-sm text-slate-500">{copy.daysLeft(planData.trialDaysLeft)}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {planData ? (
            <div className="premium-card rounded-xl p-6">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--it-faint)]">{copy.usage}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{copy.usageNote}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {usageRows.map((row) => (
                  <div key={row.label} className="rounded-lg border border-[#1E2240] bg-[#07080F]/55 px-3.5 py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-xs text-slate-500">{row.label}</p>
                      <p className="text-sm font-semibold tabular-nums text-slate-100">
                        {row.used}
                        <span className="font-normal text-slate-500">/{row.limit ?? copy.unlimited}</span>
                      </p>
                    </div>
                    {row.limit !== null ? (
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <span
                          className={`block h-full rounded-full ${usageTone(row.used, row.limit)}`}
                          style={{ width: `${usagePercent(row.used, row.limit)}%` }}
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="premium-card rounded-xl p-6">
            <div className="border-b border-[#1E2240] pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--it-faint)]">
                {copy.availablePlans}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">{copy.availablePlansText}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{copy.paymentMode}</p>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-4">
              {planCards.map((plan) => {
                const active = effectivePlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`flex min-h-[260px] flex-col rounded-xl border px-4 py-4 ${
                      active ? "border-[#3f5fba] bg-[#0b1430]" : "border-[#1E2240] bg-[#07080F]/55"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{plan.name}</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{plan.price}</p>
                      </div>
                      {active ? (
                        <span className="rounded-full border border-[#3f5fba] bg-[#1D4ED8]/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9BB8FF]">
                          {copy.current}
                        </span>
                      ) : null}
                    </div>

                    <ul className="mt-5 space-y-2 text-sm text-slate-300">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#7897c5]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-5">
                      {active ? (
                        <span className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-[#1E2240] bg-transparent px-3 text-sm font-semibold text-slate-300">
                          {copy.currentPlan}
                        </span>
                      ) : plan.id === "starter" || plan.id === "professional" ? (
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--it-faint)]">
                            {copy.subscribe}
                          </p>
                          <PayPalSubscribeButton plan={plan.id} locale={locale} />
                        </div>
                      ) : plan.id === "enterprise" ? (
                        <Link
                          href={localePath("/contact", locale)}
                          className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-[#1D4ED8] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af]"
                        >
                          {copy.contactSales}
                        </Link>
                      ) : (
                        <span className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-[#1E2240] bg-transparent px-3 text-sm font-semibold text-slate-500">
                          {copy.freeTrial}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
