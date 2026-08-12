"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

/** Parts of "now" in IST, independent of the viewer's timezone. */
function istParts(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
  return {
    label: `${parts.hour}:${parts.minute}:${parts.second} IST`,
    weekday: parts.weekday as string,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

/** NSE/BSE equity market hours: 09:15–15:30 IST, Mon–Fri. */
function marketIsOpen(p: ReturnType<typeof istParts>): boolean {
  const weekend = p.weekday === "Sat" || p.weekday === "Sun";
  if (weekend) return false;
  const mins = p.hour * 60 + p.minute;
  return mins >= 9 * 60 + 15 && mins <= 15 * 60 + 30;
}

export function Header() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = now ? istParts(now) : null;
  const open = parts ? marketIsOpen(parts) : false;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-cyan/30 bg-cyan/10">
            <Activity className="h-5 w-5 text-cyan" strokeWidth={2.4} />
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-magenta" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-magenta" />
            </span>
          </span>
          <div className="leading-none">
            <div className="font-display text-lg font-bold tracking-tight">
              IPO <span className="neon-word">Pulse</span>
            </div>
            <div className="eyebrow mt-1">Grey-market radar</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="tabular hidden text-sm text-muted sm:inline" suppressHydrationWarning>
            {parts?.label ?? "—"}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
              open
                ? "border-lime/30 bg-lime/10 text-lime"
                : "border-line-2 bg-surface-2 text-muted"
            }`}
            suppressHydrationWarning
          >
            <span className={`h-1.5 w-1.5 rounded-full ${open ? "bg-lime" : "bg-muted"}`} />
            Market {open ? "Open" : "Closed"}
          </span>
        </div>
      </div>
    </header>
  );
}
