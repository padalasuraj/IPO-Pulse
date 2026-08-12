import type { CSSProperties } from "react";
import { AlarmClock, CheckCircle2 } from "lucide-react";
import type { Ipo, RiskBand } from "@/lib/types";
import { inr, signedPct, times } from "@/lib/utils";

const BAND_DOT: Record<RiskBand, string> = {
  LOW: "#A3E635",
  MEDIUM: "#FBBF24",
  HIGH: "#FF476F",
};

function Chip({ ipo }: { ipo: Ipo }) {
  const positive = ipo.profitPerLot >= 0;
  return (
    <div className="mx-1.5 flex shrink-0 items-center gap-2.5 rounded-full border border-line-2 bg-surface/80 py-1.5 pl-3 pr-3.5">
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: BAND_DOT[ipo.riskBand], boxShadow: `0 0 8px ${BAND_DOT[ipo.riskBand]}` }}
        title={`Risk ${ipo.riskBand.toLowerCase()}`}
      />
      <span className="text-sm font-semibold text-fg">{ipo.name}</span>
      <span className="tabular text-xs text-cyan-soft">Sub {times(ipo.subscription.overall)}</span>
      <span className={`tabular text-xs font-semibold ${positive ? "text-lime" : "text-danger"}`}>
        {positive ? "+" : "−"}
        {inr(Math.abs(ipo.profitPerLot))}/lot
      </span>
      <span className={`tabular text-[11px] ${positive ? "text-lime/70" : "text-danger/70"}`}>
        {signedPct(ipo.profitPct)}
      </span>
    </div>
  );
}

export function EmergencyTicker({ ipos }: { ipos: Ipo[] }) {
  if (ipos.length === 0) {
    return (
      <section className="panel flex items-center gap-3 px-4 py-3">
        <CheckCircle2 className="h-4 w-4 text-lime" />
        <span className="text-sm text-muted">
          No IPOs close today. Nothing needs a same-day decision — scan the board below.
        </span>
      </section>
    );
  }

  // duration scales with content so speed stays roughly constant
  const duration = Math.max(26, ipos.length * 7);

  return (
    <section
      aria-label="IPOs closing today"
      className="panel overflow-hidden border-magenta/30 shadow-glow-magenta"
    >
      <div className="flex items-stretch">
        <div className="flex shrink-0 items-center gap-2 border-r border-magenta/30 bg-magenta/10 px-4 py-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-magenta" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-magenta" />
          </span>
          <AlarmClock className="h-4 w-4 text-magenta" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-magenta">
            Closing&nbsp;today
          </span>
          <span className="hidden font-mono text-[11px] text-magenta/70 sm:inline">
            · last day to apply
          </span>
        </div>

        <div className="ticker-rail ticker-mask relative flex-1 overflow-hidden py-1.5">
          <div
            className="ticker-track"
            style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
          >
            {/* rendered twice for a seamless loop */}
            {[0, 1].map((half) => (
              <div key={half} className="flex items-center" aria-hidden={half === 1}>
                {ipos.map((ipo) => (
                  <Chip key={`${half}-${ipo.slug}`} ipo={ipo} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
