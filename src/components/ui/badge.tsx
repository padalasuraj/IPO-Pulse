import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider",
  {
    variants: {
      tone: {
        neutral: "border-line-2 bg-surface-2 text-muted",
        cyan: "border-cyan/30 bg-cyan/10 text-cyan-soft",
        magenta: "border-magenta/40 bg-magenta/10 text-magenta",
        lime: "border-lime/30 bg-lime/10 text-lime",
        amber: "border-amber/30 bg-amber/10 text-amber",
        danger: "border-danger/40 bg-danger/10 text-danger",
        violet: "border-violet/40 bg-violet/10 text-violet",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
