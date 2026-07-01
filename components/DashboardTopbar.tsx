"use client";

import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

export default function DashboardTopbar() {
  const t = useTranslations("language");

  return (
    <header className="sticky top-0 z-30 border-b border-[#1E2240] bg-[#07080F]/88 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center justify-end gap-3">
        <span className="hidden text-xs font-medium text-slate-600 sm:block">{t("switcher")}</span>
        <LanguageSwitcher showLabel={false} />
      </div>
    </header>
  );
}
