"use client";

import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "yellow" | "green" | "blue" | "red";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(
          "badge",
          {
            "badge-neutral": variant === "default",
            "badge-yellow": variant === "yellow",
            "bg-green-500/10 text-green-500 border-green-500/30": variant === "green",
            "bg-blue-500/10 text-blue-500 border-blue-500/30": variant === "blue",
            "bg-red-500/10 text-red-500 border-red-500/30": variant === "red",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
