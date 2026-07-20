"use client";

import { useEffect, useRef, useState } from "react";
import type { AppLocale } from "@/lib/i18n/locales";

type Locale = AppLocale;
type PayPalPlan = "starter" | "professional";

interface PayPalSubscribeButtonProps {
  plan: PayPalPlan;
  locale: Locale;
}

interface PayPalConfig {
  clientId: string | null;
  configured: boolean;
  missing?: string[];
  plans: Record<PayPalPlan, string | null>;
}

interface PayPalActions {
  subscription: {
    create: (payload: { plan_id: string }) => Promise<string> | string;
  };
}

interface PayPalApproveData {
  subscriptionID?: string;
}

interface PayPalButtonsRenderer {
  render: (target: HTMLElement) => Promise<void> | void;
}

interface PayPalNamespace {
  Buttons: (options: {
    style: {
      shape: "pill";
      color: "blue";
      layout: "vertical";
      label: "subscribe";
    };
    createSubscription: (_data: unknown, actions: PayPalActions) => Promise<string> | string;
    onApprove: (data: PayPalApproveData) => Promise<void> | void;
    onError: () => void;
  }) => PayPalButtonsRenderer;
}

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

function loadPayPalSdk(clientId: string) {
  const scriptId = "paypal-subscription-sdk";

  return new Promise<void>((resolve, reject) => {
    if (window.paypal) {
      resolve();
      return;
    }

    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("PayPal SDK failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&vault=true&intent=subscription`;
    script.async = true;
    script.dataset.sdkIntegrationSource = "intelligencestest-settings";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("PayPal SDK failed to load"));
    document.body.appendChild(script);
  });
}

const paypalCopy: Record<Locale, {
  loading: string;
  recording: string;
  missing: string;
  error: string;
  success: string;
  subscription: string;
}> = {
  es: {
    loading: "Cargando PayPal...",
    recording: "Registrando la suscripción...",
    missing: "El pago con PayPal se está configurando. Contacte con ventas para activar este plan.",
    error: "No pudimos completar el registro de PayPal. Inténtelo de nuevo.",
    success: "Suscripción registrada. Su plan se activará automáticamente en unos minutos.",
    subscription: "ID de suscripción",
  },
  en: {
    loading: "Loading PayPal...",
    recording: "Recording subscription...",
    missing: "PayPal checkout is being configured. Contact sales to activate this plan.",
    error: "We could not complete PayPal registration. Please try again.",
    success: "Subscription recorded. Your plan will activate automatically within a few minutes.",
    subscription: "Subscription ID",
  },
  fr: {
    loading: "Chargement de PayPal...",
    recording: "Enregistrement de l'abonnement...",
    missing: "Le paiement PayPal est en cours de configuration. Contactez l'équipe commerciale pour activer cette offre.",
    error: "Nous n'avons pas pu finaliser l'enregistrement PayPal. Veuillez réessayer.",
    success: "Abonnement enregistré. Votre offre sera activée automatiquement dans quelques minutes.",
    subscription: "ID d'abonnement",
  },
};

export function PayPalSubscribeButton({ plan, locale }: PayPalSubscribeButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "recording" | "configured" | "error" | "success">("loading");
  const [missingConfig, setMissingConfig] = useState<string[]>([]);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  const copy = paypalCopy[locale];

  useEffect(() => {
    let cancelled = false;

    async function renderButton() {
      try {
        setStatus("loading");
        const response = await fetch("/api/billing/paypal-config", { cache: "no-store" });
        const config = (await response.json()) as PayPalConfig;
        const planId = config.plans[plan];

        if (!config.configured || !config.clientId || !planId) {
          if (!cancelled) {
            const missing = config.missing ?? [];
            setMissingConfig(missing);
            if (missing.length > 0) {
              console.warn(`PayPal subscription checkout is missing config: ${missing.join(", ")}`);
            }
            setStatus("configured");
          }
          return;
        }

        await loadPayPalSdk(config.clientId);
        if (cancelled || !containerRef.current || !window.paypal) return;

        containerRef.current.innerHTML = "";
        window.paypal
          .Buttons({
            style: {
              shape: "pill",
              color: "blue",
              layout: "vertical",
              label: "subscribe",
            },
            createSubscription: (_data, actions) => actions.subscription.create({ plan_id: planId }),
            onApprove: async (data) => {
              const approvedSubscriptionId = data.subscriptionID ?? "";
              if (!approvedSubscriptionId) {
                setStatus("error");
                return;
              }

              setSubscriptionId(approvedSubscriptionId);
              setStatus("recording");
              const recordResponse = await fetch("/api/billing/paypal-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan, subscription_id: approvedSubscriptionId }),
              });

              if (!recordResponse.ok) {
                setStatus("error");
                return;
              }

              setStatus("success");
            },
            onError: () => setStatus("error"),
          })
          .render(containerRef.current);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    renderButton();

    return () => {
      cancelled = true;
    };
  }, [plan]);

  return (
    <div className="space-y-2">
      <div ref={containerRef} />
      {status === "loading" && <p className="text-xs text-slate-500">{copy.loading}</p>}
      {status === "recording" && <p className="text-xs text-slate-500">{copy.recording}</p>}
      {status === "configured" && (
        <p className="text-xs leading-5 text-amber-300" title={missingConfig.join(", ") || undefined}>
          {copy.missing}
        </p>
      )}
      {status === "error" && <p className="text-xs text-[#b91c1c]">{copy.error}</p>}
      {status === "success" && (
        <p className="text-xs leading-5 text-[#15803d]">
          {copy.success}
          {subscriptionId ? (
            <>
              <br />
              {copy.subscription}: {subscriptionId}
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}
