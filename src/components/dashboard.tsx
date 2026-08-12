"use client";

import { useCallback, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCards } from "@/components/stat-cards";
import { EmergencyTicker } from "@/components/emergency-ticker";
import { IpoTable } from "@/components/ipo-table";
import {
  IpoFilters,
  type BoardFilter,
  type SortKey,
  type StatusFilter,
  type StatusOption,
} from "@/components/ipo-filters";
import type { Ipo } from "@/lib/types";

function matchesQuery(ipo: Ipo, q: string): boolean {
  if (!q.trim()) return true;
  return ipo.name.toLowerCase().includes(q.trim().toLowerCase());
}

function sortIpos(list: Ipo[], sort: SortKey): Ipo[] {
  const copy = [...list];
  switch (sort) {
    case "PROFIT":
      return copy.sort((a, b) => b.profitPerLot - a.profitPerLot);
    case "RISK":
      return copy.sort((a, b) => a.risk - b.risk);
    case "SUB":
      return copy.sort((a, b) => (b.subscription.overall ?? -1) - (a.subscription.overall ?? -1));
    case "CLOSING":
      return copy.sort((a, b) => {
        const av = a.daysToClose >= 0 ? a.daysToClose : Number.POSITIVE_INFINITY;
        const bv = b.daysToClose >= 0 ? b.daysToClose : Number.POSITIVE_INFINITY;
        return av - bv || b.profitPerLot - a.profitPerLot;
      });
    default:
      return copy; // SMART = server order (already prioritised)
  }
}

export function Dashboard({ initialIpos, generatedAt }: { initialIpos: Ipo[]; generatedAt: string }) {
  const [ipos, setIpos] = useState<Ipo[]>(initialIpos);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [board, setBoard] = useState<BoardFilter>("ALL");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("SMART");
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string>(generatedAt);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/ipos", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { ipos: Ipo[]; at: string };
      setIpos(data.ipos);
      setUpdatedAt(data.at);
    } catch (err) {
      console.error("refresh failed", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // board + search first, so the status chip counts reflect what you'd see
  const base = useMemo(
    () => ipos.filter((i) => (board === "ALL" || i.board === board) && matchesQuery(i, query)),
    [ipos, board, query],
  );

  const statusOptions: StatusOption[] = useMemo(() => {
    const count = (s: StatusFilter) => (s === "ALL" ? base.length : base.filter((i) => i.status === s).length);
    return [
      { key: "ALL", label: "All", count: count("ALL") },
      { key: "OPEN", label: "Open", count: count("OPEN") },
      { key: "UPCOMING", label: "Upcoming", count: count("UPCOMING") },
      { key: "CLOSED", label: "Closed", count: count("CLOSED") },
      { key: "LISTED", label: "Listed", count: count("LISTED") },
    ];
  }, [base]);

  const visible = useMemo(() => {
    const filtered = base.filter((i) => status === "ALL" || i.status === status);
    return sortIpos(filtered, sort);
  }, [base, status, sort]);

  const closingToday = useMemo(() => ipos.filter((i) => i.closesToday), [ipos]);

  return (
    <div className="flex flex-col gap-6">
      <StatCards ipos={ipos} />

      <EmergencyTicker ipos={closingToday} />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-lg font-semibold tracking-tight">Live board</h2>
            <span className="tabular text-sm text-muted">{visible.length} shown</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="tabular hidden text-[11px] text-muted sm:inline" suppressHydrationWarning>
              Updated {new Date(updatedAt).toLocaleTimeString("en-IN")}
            </span>
            <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing" : "Refresh"}
            </Button>
          </div>
        </div>

        <IpoFilters
          status={status}
          onStatus={setStatus}
          statusOptions={statusOptions}
          board={board}
          onBoard={setBoard}
          query={query}
          onQuery={setQuery}
          sort={sort}
          onSort={setSort}
        />

        <IpoTable ipos={visible} />
      </section>
    </div>
  );
}
