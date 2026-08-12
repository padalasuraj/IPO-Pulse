import { Info } from "lucide-react";

export function Disclaimer() {
  return (
    <footer className="mt-10 border-t border-line pt-6">
      <div className="panel flex gap-3 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
        <p className="text-xs leading-relaxed text-muted">
          <span className="font-semibold text-fg">Not investment advice.</span> Grey-market premium
          (GMP) is unofficial, unregulated and speculative — it reflects rumour in an informal market,
          not a guaranteed listing price. &ldquo;Expected listing&rdquo;, &ldquo;profit per lot&rdquo;
          and the &ldquo;risk&rdquo; score are illustrative calculations derived from GMP and
          subscription figures using a simple, transparent heuristic; they are not predictions.
          Listing gains are never guaranteed and IPOs can list at a discount. Do your own research and
          consult a SEBI-registered adviser before applying.
        </p>
      </div>
      <p className="mt-4 text-center text-[11px] text-muted/70">
        IPO Pulse · a demo project · data shown is sample/illustrative unless connected to a live source
      </p>
    </footer>
  );
}
