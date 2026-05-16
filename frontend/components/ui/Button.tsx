"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-soft hover:shadow-glow",
        secondary: "bg-surface text-text hover:bg-bg-soft border border-border",
        ghost: "text-text-soft hover:text-text hover:bg-surface",
        outline: "border border-border text-text hover:bg-surface",
        gradient: "grad-brand text-white shadow-glow hover:shadow-lg",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-sm",
        md: "h-11 px-5 text-sm rounded",
        lg: "h-12 px-7 text-base rounded-lg",
        xl: "h-13 px-8 text-base rounded-lg",
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
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = "Button";
