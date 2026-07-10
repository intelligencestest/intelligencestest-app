"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function MorningGreeting({ firstName }: { firstName?: string }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  // Set after mount so the greeting reflects the viewer's clock, not the server's.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      {/* Editorial register — the one serif element on this screen (design-language.md §2) */}
      <h1 className="font-editorial mt-1 text-[32px] font-medium text-[var(--it-text)] sm:text-[34px]">
        {greeting}
        {firstName ? `, ${firstName}` : ""}
      </h1>
    </div>
  );
}
