import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-cyan/15 text-cyan-soft border border-cyan/30 hover:bg-cyan/25 hover:shadow-glow-cyan",
        ghost: "text-muted hover:text-fg hover:bg-surface-2",
        outline: "border border-line-2 text-fg hover:border-cyan/40 hover:text-cyan-soft",
        subtle: "bg-surface-2 text-fg hover:bg-line",
      },
      size: {
        sm: "h-8 px-3",
        default: "h-9 px-4",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
