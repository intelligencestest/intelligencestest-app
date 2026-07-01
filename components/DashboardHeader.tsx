"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardHeader() {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    setSpinning(true);
    router.refresh();
    setTimeout(() => setSpinning(false), 900);
  };

  return (
    <div className="sticky top-0 z-20 flex h-11 items-center justify-end border-b border-[#1E2240] bg-[#07080F]/95 px-6 backdrop-blur-sm">
      <button
        type="button"
        onClick={handleRefresh}
        title="Refresh page data"
        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#1E2240] px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-[#2d3a70] hover:text-slate-300"
      >
        <svg
          className={`h-3.5 w-3.5 transition-transform ${spinning ? "animate-spin" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15"
          />
        </svg>
        Refresh
      </button>
    </div>
  );
}
