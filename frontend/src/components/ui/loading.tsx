import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={clsx(
        "animate-spin text-yellow-500",
        size === "sm" && "w-4 h-4",
        size === "md" && "w-6 h-6",
        size === "lg" && "w-8 h-8",
        className
      )}
    />
  );
}

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = "Loading..." }: LoadingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-neutral-400">{message}</p>
    </div>
  );
}

interface LoadingCardProps {
  rows?: number;
}

export function LoadingCard({ rows = 3 }: LoadingCardProps) {
  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 animate-pulse">
      <div className="h-4 bg-neutral-700 rounded w-3/4 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 bg-neutral-700 rounded w-full mb-2" />
      ))}
      <div className="h-3 bg-neutral-700 rounded w-1/2" />
    </div>
  );
}

interface LoadingGridProps {
  count?: number;
  columns?: 2 | 3 | 4;
}

export function LoadingGrid({ count = 6, columns = 3 }: LoadingGridProps) {
  return (
    <div
      className={clsx(
        "grid gap-4",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}
