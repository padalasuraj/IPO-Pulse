import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, inr, signedPct, times } from "@/lib/utils";
import type { IpoStatus, RiskBand } from "@/lib/types";

/* ---- status + board -------------------------------------------------- */

const STATUS_LABEL: Record<IpoStatus, string> = {
  OPEN: "Open",
  UPCOMING: "Upcoming",
  CLOSED: "Closed",
  LISTED: "Listed",
};

export function StatusBadge({ status }: { status: IpoStatus }) {
  const tone =
    status === "OPEN" ? "cyan" : status === "UPCOMING" ? "violet" : status === "LISTED" ? "lime" : "neutral";
  return (
    <Badge tone={tone}>
      {status === "OPEN" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-cyan" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan" />
        </span>
      )}
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function BoardBadge({ board }: { board: "MAINBOARD" | "SME" }) {
  return <Badge tone={board === "SME" ? "amber" : "neutral"}>{board === "SME" ? "SME" : "Mainboard"}</Badge>;
}

/* ---- risk ------------------------------------------------------------ */

const BAND_TONE: Record<RiskBand, "lime" | "amber" | "danger"> = {
  LOW: "lime",
  MEDIUM: "amber",
  HIGH: "danger",
};
const BAND_COLOR: Record<RiskBand, string> = {
  LOW: "#A3E635",
  MEDIUM: "#FBBF24",
  HIGH: "#FF476F",
};

export function RiskPill({ risk, band }: { risk: number; band: RiskBand }) {
  return (
    <Badge tone={BAND_TONE[band]} className="tabular">
      {band} · {risk}
    </Badge>
  );
}

export function RiskMeter({ risk, band }: { risk: number; band: RiskBand }) {
  const color = BAND_COLOR[band];
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between">
        <span className="eyebrow">Risk</span>
        <span className="tabular text-xs" style={{ color }}>
          {band} · {risk}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
        role="meter"
        aria-valuenow={risk}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Risk ${risk} out of 100 (${band})`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${risk}%`, background: color, boxShadow: `0 0 12px ${color}` }}
        />
      </div>
    </div>
  );
}

/* ---- subscription ---------------------------------------------------- */

export function SubBar({ overall }: { overall: number | null }) {
  if (overall == null) {
    return <span className="tabular text-sm text-muted">—</span>;
  }
  // cap the bar at 50x so a modest 3x is still visibly different from 40x
  const pct = Math.min(100, (overall / 50) * 100);
  const hot = overall >= 10;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(4, pct)}%`,
            background: hot ? "#22D3EE" : "#3E7C8F",
            boxShadow: hot ? "0 0 10px rgba(34,211,238,0.7)" : "none",
          }}
        />
      </div>
      <span className={cn("tabular text-sm", hot ? "text-cyan-soft" : "text-fg")}>{times(overall)}</span>
    </div>
  );
}

/* ---- profit ---------------------------------------------------------- */

export function ProfitText({
  amount,
  pct,
  size = "md",
}: {
  amount: number;
  pct: number;
  size?: "md" | "lg";
}) {
  const positive = amount >= 0;
  const color = positive ? "text-lime" : "text-danger";
  const Arrow = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="flex flex-col items-end leading-tight">
      <span className={cn("tabular font-semibold", color, size === "lg" ? "text-lg" : "text-sm")}>
        <Arrow className="mr-0.5 inline h-3.5 w-3.5" />
        {inr(Math.abs(amount))}
      </span>
      <span className={cn("tabular text-[11px]", color)}>{signedPct(pct)}</span>
    </div>
  );
}
