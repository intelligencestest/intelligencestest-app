"use client";

import { useEffect, useRef, useState } from "react";

type Locale = "en" | "es";
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
    onApprove: (data: PayPalApproveData) => void;
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

export function PayPalSubscribeButton({ plan, locale }: PayPalSubscribeButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "configured" | "error" | "success">("loading");
  const [missingConfig, setMissingConfig] = useState<string[]>([]);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const es = locale === "es";

  const copy = es
    ? {
        loading: "Cargando PayPal...",
        missing: "El pago con PayPal se está configurando. Contacte con ventas para activar este plan.",
        error: "No pudimos cargar PayPal. Inténtelo de nuevo.",
        success: "Suscripción creada. El equipo comercial confirmará la activación.",
        subscription: "ID de suscripción",
      }
    : {
        loading: "Loading PayPal...",
        missing: "PayPal checkout is being configured. Contact sales to activate this plan.",
        error: "We could not load PayPal. Please try again.",
        success: "Subscription created. The commercial team will confirm activation.",
        subscription: "Subscription ID",
      };

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
            onApprove: (data) => {
              setSubscriptionId(data.subscriptionID ?? null);
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
      {status === "configured" && (
        <p className="text-xs leading-5 text-amber-300" title={missingConfig.join(", ") || undefined}>
          {copy.missing}
        </p>
      )}
      {status === "error" && <p className="text-xs text-red-300">{copy.error}</p>}
      {status === "success" && (
        <p className="text-xs leading-5 text-emerald-300">
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
