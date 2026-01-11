"use client";

import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, size = "md", showLabel = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div ref={ref} className={clsx("w-full", className)} {...props}>
        {showLabel && (
          <div className="flex justify-between text-sm text-neutral-400 mb-1">
            <span>Progress</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          className={clsx(
            "w-full bg-neutral-800 border border-neutral-700 rounded-md overflow-hidden",
            {
              "h-1": size === "sm",
              "h-2": size === "md",
              "h-3": size === "lg",
            }
          )}
        >
          <div
            className="h-full bg-yellow-500 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
