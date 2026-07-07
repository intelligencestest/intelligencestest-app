"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function MorningGreeting({ firstName }: { firstName?: string }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  // Set after mount so the greeting reflects the viewer's clock, not the server's.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const greeting =
    now === null
      ? t("greetingFallback")
      : now.getHours() < 12
        ? t("greetingMorning")
        : now.getHours() < 19
          ? t("greetingAfternoon")
          : t("greetingEvening");

  const dateLabel = now?.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      <p className="min-h-5 text-[13px] font-medium text-[var(--it-faint)] first-letter:uppercase">
        {dateLabel ?? " "}
      </p>
      <h1 className="mt-1 text-[32px] font-semibold tracking-[-0.015em] text-white sm:text-[34px]">
        {greeting}
        {firstName ? `, ${firstName}` : ""}
      </h1>
    </div>
  );
}
