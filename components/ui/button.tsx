"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-transparent transition-[transform,background-color,box-shadow,color] duration-200 ease-spring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-brand-blue to-brand-violet text-white shadow-glow hover:shadow-[0_14px_50px_-12px_rgba(99,102,241,0.6)] hover:-translate-y-0.5",
        secondary:
          "glass text-ink hover:bg-surface-elevated/80 hover:-translate-y-0.5",
        ghost: "text-ink-muted hover:text-ink hover:bg-surface-elevated/60",
        outline:
          "border border-line bg-transparent text-ink hover:bg-surface-elevated/50 hover:-translate-y-0.5",
        danger:
          "bg-red-500/90 text-white hover:bg-red-500 hover:-translate-y-0.5 shadow-[0_10px_30px_-10px_rgba(239,68,68,0.6)]",
      },
      size: {
        sm: "h-9 px-3.5 text-[13px]",
        md: "h-11 px-5",
        lg: "h-12 px-7 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
