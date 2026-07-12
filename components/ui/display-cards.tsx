"use client";

import type { ReactNode } from "react";
import { CircleAlert, MessageSquareText, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type DisplayCardKind = "recommendation" | "risk" | "interview";

export interface DisplayCardProps {
  className?: string;
  kind: DisplayCardKind;
  title: string;
  description: string;
  meta: string;
}

const kindStyle: Record<DisplayCardKind, { icon: ReactNode; badge: string; title: string }> = {
  recommendation: {
    icon: <UserCheck className="h-4 w-4" strokeWidth={1.8} />,
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    title: "text-emerald-800",
  },
  risk: {
    icon: <CircleAlert className="h-4 w-4" strokeWidth={1.8} />,
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    title: "text-amber-800",
  },
  interview: {
    icon: <MessageSquareText className="h-4 w-4" strokeWidth={1.8} />,
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    title: "text-indigo-800",
  },
};

function DisplayCard({ className, kind, title, description, meta }: DisplayCardProps) {
  const style = kindStyle[kind];

  return (
    <div
      className={cn(
        "relative flex h-36 w-[min(21rem,calc(100vw-3rem))] select-none flex-col justify-between rounded-lg border border-slate-200 bg-white/90 px-5 py-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur-md transition-[transform,border-color,box-shadow] duration-300 hover:border-slate-300 hover:shadow-[0_24px_55px_-30px_rgba(15,23,42,0.42)]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-md ring-1", style.badge)}>
          {style.icon}
        </span>
        <p className={cn("text-sm font-semibold", style.title)}>{title}</p>
      </div>
      <p className="text-sm font-medium leading-6 text-slate-800">{description}</p>
      <p className="text-xs text-slate-500">{meta}</p>
    </div>
  );
}

export function DisplayCards({ cards }: { cards: readonly DisplayCardProps[] }) {
  return (
    <div className="grid min-h-[310px] w-full place-items-center [grid-template-areas:'stack'] sm:min-h-[340px]">
      {cards.map((card, index) => (
        <DisplayCard
          key={`${card.kind}-${card.title}`}
          {...card}
          className={cn(
            "[grid-area:stack]",
            index === 0 && "-translate-x-5 -translate-y-16 -rotate-2 sm:-translate-x-14",
            index === 1 && "translate-x-2 translate-y-1 rotate-1 sm:translate-x-2",
            index === 2 && "translate-x-8 translate-y-20 -rotate-1 sm:translate-x-16"
          )}
        />
      ))}
    </div>
  );
}
