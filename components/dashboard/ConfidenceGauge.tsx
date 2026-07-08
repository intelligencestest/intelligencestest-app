const TONE_COLOR: Record<"high" | "moderate" | "low", string> = {
  high: "var(--it-success)",
  moderate: "var(--it-warning)",
  low: "var(--it-danger)",
};

interface ConfidenceGaugeProps {
  score: number;
  tone: "high" | "moderate" | "low";
  label: string;
  sublabel?: string;
}

/** Radial confidence meter — the score as an arc, not just a number/level line. */
export function ConfidenceGauge({ score, tone, label, sublabel }: ConfidenceGaugeProps) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - clamped / 100);
  const color = TONE_COLOR[tone];

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 flex-shrink-0">
        <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-white">{clamped}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color }}>{label}</p>
        {sublabel && <p className="mt-0.5 text-xs text-[var(--it-faint)]">{sublabel}</p>}
      </div>
    </div>
  );
}
