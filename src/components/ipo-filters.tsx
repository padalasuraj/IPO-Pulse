import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusFilter = "ALL" | "OPEN" | "UPCOMING" | "CLOSED" | "LISTED";
export type BoardFilter = "ALL" | "MAINBOARD" | "SME";
export type SortKey = "SMART" | "PROFIT" | "RISK" | "CLOSING" | "SUB";

export interface StatusOption {
  key: StatusFilter;
  label: string;
  count: number;
}

interface Props {
  status: StatusFilter;
  onStatus: (s: StatusFilter) => void;
  statusOptions: StatusOption[];
  board: BoardFilter;
  onBoard: (b: BoardFilter) => void;
  query: string;
  onQuery: (q: string) => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
}

export function IpoFilters({
  status,
  onStatus,
  statusOptions,
  board,
  onBoard,
  query,
  onQuery,
  sort,
  onSort,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {statusOptions.map((opt) => {
          const active = status === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => onStatus(opt.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-all",
                active
                  ? "border-cyan/40 bg-cyan/15 text-cyan-soft shadow-glow-cyan"
                  : "border-line-2 text-muted hover:border-line-2 hover:text-fg",
              )}
            >
              {opt.label}
              <span className={cn("tabular text-[11px]", active ? "text-cyan-soft/80" : "text-muted/70")}>
                {opt.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search IPO name…"
            aria-label="Search IPO name"
            className="h-9 w-full rounded-xl border border-line-2 bg-surface/60 pl-9 pr-3 text-sm text-fg placeholder:text-muted focus:border-cyan/40 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-line-2 p-0.5">
            {(["ALL", "MAINBOARD", "SME"] as BoardFilter[]).map((b) => (
              <button
                key={b}
                onClick={() => onBoard(b)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs transition-colors",
                  board === b ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
                )}
              >
                {b === "ALL" ? "All" : b === "MAINBOARD" ? "Mainboard" : "SME"}
              </button>
            ))}
          </div>

          <label className="sr-only" htmlFor="sort">
            Sort IPOs
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => onSort(e.target.value as SortKey)}
            className="h-9 rounded-xl border border-line-2 bg-surface/60 px-3 text-sm text-fg focus:border-cyan/40 focus:outline-none"
          >
            <option value="SMART">Smart order</option>
            <option value="PROFIT">Profit / lot</option>
            <option value="RISK">Lowest risk</option>
            <option value="CLOSING">Closing soon</option>
            <option value="SUB">Most subscribed</option>
          </select>
        </div>
      </div>
    </div>
  );
}
