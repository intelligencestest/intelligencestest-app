"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export function AuroraBackground({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn("relative overflow-hidden bg-[#fbfbfc]", className)}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className={cn(
            "aurora-field absolute -inset-24 opacity-25 blur-[12px] will-change-transform",
            showRadialGradient && "aurora-field-mask"
          )}
        />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
