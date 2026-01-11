import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ title = "Error", message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-red-500">{title}</p>
          <p className="text-sm text-neutral-400 mt-1">{message}</p>
          {onRetry && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
              className="mt-3"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ErrorPageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorPage({
  title = "Something went wrong",
  message = "An error occurred while loading this page.",
  onRetry,
}: ErrorPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <div>
        <h2 className="text-xl font-heading font-semibold text-neutral-200 mb-2">
          {title}
        </h2>
        <p className="text-neutral-400 max-w-md">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry}>
          <RefreshCw className="w-5 h-5" />
          Try Again
        </Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-heading font-semibold text-neutral-200 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-neutral-400 max-w-md mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
