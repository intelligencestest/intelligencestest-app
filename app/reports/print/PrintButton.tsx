"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="enterprise-button inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
    >
      <Printer className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
      Print or Save PDF
    </button>
  );
}
