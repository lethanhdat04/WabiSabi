"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LoadingPage } from "@/components/ui";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Redirect to learn page if already authenticated
    if (!isLoading && isAuthenticated) {
      router.push("/learn");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900">
        <LoadingPage message="Checking authentication..." />
      </div>
    );
  }

  // Show auth pages only if not authenticated
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Redirecting...
  return (
    <div className="min-h-screen bg-neutral-900">
      <LoadingPage message="Redirecting..." />
    </div>
  );
}
