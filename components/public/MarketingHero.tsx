"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, FingerprintIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { localePath, type AppLocale } from "@/lib/i18n/locales";
import type { PublicCopy } from "@/lib/public-site-copy";
import { SignalBoard } from "./PublicSite";

export function MarketingHero({ copy, locale }: { copy: PublicCopy; locale: AppLocale }) {
  return (
    <section className="theme-verdant-sky relative overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,color-mix(in_oklab,var(--color-primary)_16%,transparent),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col items-center space-y-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.p
            className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            {copy.home.eyebrow}
          </motion.p>
          <motion.h1
            className="max-w-3xl text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {copy.home.heroTitle}
          </motion.h1>
          <motion.p
            className="mx-auto max-w-xl text-base leading-7 text-muted-foreground sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {copy.home.heroBody}
          </motion.p>
          <motion.div
            className="flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Button asChild size="lg" className="rounded-xl">
              <Link href={localePath("/signup", locale)}>
                {copy.home.primaryCta}
                <FingerprintIcon className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <a href={`${localePath("/", locale)}#assessments`}>
                {copy.home.secondaryCta}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </motion.div>

          <motion.dl
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pb-2 pt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {copy.home.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="text-xl font-semibold tracking-tight text-foreground">{stat.value}</dt>
                <dd className="text-xs text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </motion.dl>

          <motion.div
            className="w-full rounded-3xl border border-border bg-card p-2"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="relative w-full overflow-hidden rounded-[20px] border border-border bg-background p-6 sm:p-8">
              <SignalBoard copy={copy} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-card to-transparent" aria-hidden="true" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
