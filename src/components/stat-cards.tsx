import type { ReactNode } from "react";
import { AlarmClock, Flame, Sparkles, TrendingUp } from "lucide-react";
import type { Ipo } from "@/lib/types";
import { inr, signedPct } from "@/lib/utils";

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <div className="panel animate-fade-up p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${accent}1a`, color: accent }}>
          {icon}
        </span>
      </div>
      <div className="font-display text-2xl font-bold tracking-tight" style={{ color: accent }}>
        {value}
      </div>
      <div className="mt-0.5 truncate text-xs text-muted">{sub}</div>
    </div>
  );
}

export function StatCards({ ipos }: { ipos: Ipo[] }) {
  const open = ipos.filter((i) => i.status === "OPEN");
  const closingToday = ipos.filter((i) => i.closesToday);
  const live = ipos.filter((i) => i.status === "OPEN" || i.status === "UPCOMING");

  const avgGain = open.length
    ? open.reduce((s, i) => s + i.profitPct, 0) / open.length
    : 0;

  const topGainer =
    live.length > 0
      ? live.reduce((best, i) => (i.profitPerLot > best.profitPerLot ? i : best))
      : null;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Open now"
        value={String(open.length)}
        sub={`${ipos.length} tracked total`}
        icon={<Flame className="h-4 w-4" />}
        accent="#22D3EE"
      />
      <StatCard
        label="Closing today"
        value={String(closingToday.length)}
        sub={closingToday.length ? "Last day to apply" : "Nothing closes today"}
        icon={<AlarmClock className="h-4 w-4" />}
        accent="#FF2E9A"
      />
      <StatCard
        label="Avg listing gain"
        value={signedPct(avgGain)}
        sub="Across open issues (est.)"
        icon={<TrendingUp className="h-4 w-4" />}
        accent="#A3E635"
      />
      <StatCard
        label="Top profit / lot"
        value={topGainer ? inr(topGainer.profitPerLot) : "—"}
        sub={topGainer ? topGainer.name : "No live issues"}
        icon={<Sparkles className="h-4 w-4" />}
        accent="#8B5CF6"
      />
    </div>
  );
}
