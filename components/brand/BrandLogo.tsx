import { cn } from "@/lib/utils";

export const BRAND_LOGO_SRC = "/brand/intelligences-test-logo.png";

type BrandLogoMarkProps = {
  className?: string;
  imageClassName?: string;
};

export function BrandLogoMark({ className, imageClassName }: BrandLogoMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-white/10",
        className
      )}
    >
      <img
        src={BRAND_LOGO_SRC}
        alt=""
        className={cn("h-full w-full object-contain p-1", imageClassName)}
      />
    </span>
  );
}

type BrandLockupProps = {
  subtitle?: string;
  className?: string;
  markClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

export function BrandLockup({
  subtitle,
  className,
  markClassName,
  titleClassName,
  subtitleClassName,
}: BrandLockupProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandLogoMark className={cn("h-11 w-11", markClassName)} />
      <div className="min-w-0">
        <p className={cn("truncate text-sm font-semibold tracking-tight text-[var(--it-text)]", titleClassName)}>
          IntelligencesTest
        </p>
        {subtitle && (
          <p className={cn("truncate text-xs text-slate-500", subtitleClassName)}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
