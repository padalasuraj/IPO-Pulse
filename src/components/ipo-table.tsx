import type { Ipo } from "@/lib/types";
import { cn, inr, shortDate, signedPct } from "@/lib/utils";
import {
  BoardBadge,
  ProfitText,
  RiskMeter,
  RiskPill,
  StatusBadge,
  SubBar,
} from "@/components/ipo-visuals";

function dateSub(ipo: Ipo): string {
  if (ipo.status === "UPCOMING") return `opens ${shortDate(ipo.openDate)}`;
  if (ipo.status === "OPEN") return `opened ${shortDate(ipo.openDate)}`;
  if (ipo.status === "CLOSED" && ipo.listingDate) return `lists ${shortDate(ipo.listingDate)}`;
  if (ipo.status === "LISTED" && ipo.listingDate) return `listed ${shortDate(ipo.listingDate)}`;
  return "";
}

function DateCell({ ipo }: { ipo: Ipo }) {
  return (
    <div className="leading-tight">
      <div className={cn("text-sm font-medium", ipo.closesToday ? "text-magenta" : "text-fg")}>
        {ipo.closesToday ? "Today" : shortDate(ipo.closeDate)}
      </div>
      <div className="text-[11px] text-muted">{dateSub(ipo)}</div>
    </div>
  );
}

function GmpCell({ ipo }: { ipo: Ipo }) {
  const positive = ipo.gmp >= 0;
  return (
    <div className="leading-tight text-right">
      <div className={cn("tabular text-sm font-medium", positive ? "text-lime" : "text-danger")}>
        {positive ? "+" : "−"}
        {inr(Math.abs(ipo.gmp))}
      </div>
      <div className={cn("tabular text-[11px]", positive ? "text-lime/70" : "text-danger/70")}>
        {signedPct(ipo.gmpPct)}
      </div>
    </div>
  );
}

/* ------------------------------- desktop ------------------------------- */

function DesktopTable({ ipos }: { ipos: Ipo[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] border-collapse">
        <thead>
          <tr className="border-b border-line text-left">
            {["#", "IPO", "Last date", "Subscribed", "Lot value", "GMP", "Exp. listing", "Profit / lot", "Risk"].map(
              (h, i) => (
                <th
                  key={h}
                  className={cn(
                    "px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted",
                    i >= 4 && "text-right",
                    i === 8 && "text-left",
                  )}
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {ipos.map((ipo) => (
            <tr
              key={ipo.slug}
              className={cn(
                "group border-b border-line/60 transition-colors hover:bg-surface-2/60",
                ipo.closesToday && "bg-magenta/[0.06]",
              )}
            >
              <td className="relative px-3 py-3">
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 w-0.5",
                    ipo.closesToday ? "bg-magenta" : "bg-transparent group-hover:bg-cyan/60",
                  )}
                />
                <span className="tabular text-sm text-muted">{ipo.serial}</span>
              </td>
              <td className="px-3 py-3">
                <div className="font-medium text-fg">{ipo.name}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <StatusBadge status={ipo.status} />
                  <BoardBadge board={ipo.board} />
                  <span className="tabular text-[11px] text-muted">
                    ₹{ipo.priceMin}–{ipo.priceMax} · {ipo.lotSize} sh
                  </span>
                </div>
              </td>
              <td className="px-3 py-3">
                <DateCell ipo={ipo} />
              </td>
              <td className="px-3 py-3">
                <SubBar overall={ipo.subscription.overall} />
              </td>
              <td className="tabular px-3 py-3 text-right text-sm text-fg">{inr(ipo.lotValue)}</td>
              <td className="px-3 py-3">
                <GmpCell ipo={ipo} />
              </td>
              <td className="tabular px-3 py-3 text-right text-sm text-fg">
                {inr(ipo.expectedListingPrice)}
              </td>
              <td className="px-3 py-3">
                <div className="flex justify-end">
                  <ProfitText amount={ipo.profitPerLot} pct={ipo.profitPct} />
                </div>
              </td>
              <td className="px-3 py-3">
                <RiskPill risk={ipo.risk} band={ipo.riskBand} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------- mobile ------------------------------- */

function MobileCard({ ipo }: { ipo: Ipo }) {
  return (
    <div
      className={cn(
        "panel p-4",
        ipo.closesToday && "border-magenta/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="tabular text-xs text-muted">#{ipo.serial}</span>
            <span className="font-medium text-fg">{ipo.name}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={ipo.status} />
            <BoardBadge board={ipo.board} />
          </div>
        </div>
        <ProfitText amount={ipo.profitPerLot} pct={ipo.profitPct} size="lg" />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Last date</dt>
          <dd className={ipo.closesToday ? "font-semibold text-magenta" : "text-fg"}>
            {ipo.closesToday ? "Today" : shortDate(ipo.closeDate)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Subscribed</dt>
          <dd>
            <SubBar overall={ipo.subscription.overall} />
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Lot value</dt>
          <dd className="tabular text-fg">{inr(ipo.lotValue)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">GMP</dt>
          <dd className={cn("tabular", ipo.gmp >= 0 ? "text-lime" : "text-danger")}>
            {ipo.gmp >= 0 ? "+" : "−"}
            {inr(Math.abs(ipo.gmp))}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Exp. listing</dt>
          <dd className="tabular text-fg">{inr(ipo.expectedListingPrice)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Price band</dt>
          <dd className="tabular text-fg">
            ₹{ipo.priceMin}–{ipo.priceMax}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <RiskMeter risk={ipo.risk} band={ipo.riskBand} />
      </div>
    </div>
  );
}

/* -------------------------------- shell -------------------------------- */

export function IpoTable({ ipos }: { ipos: Ipo[] }) {
  if (ipos.length === 0) {
    return (
      <div className="panel grid place-items-center px-6 py-16 text-center">
        <p className="text-sm text-muted">No IPOs match these filters. Try clearing the search or board filter.</p>
      </div>
    );
  }

  return (
    <>
      <div className="panel hidden overflow-hidden lg:block">
        <DesktopTable ipos={ipos} />
      </div>
      <div className="flex flex-col gap-3 lg:hidden">
        {ipos.map((ipo) => (
          <MobileCard key={ipo.slug} ipo={ipo} />
        ))}
      </div>
    </>
  );
}
