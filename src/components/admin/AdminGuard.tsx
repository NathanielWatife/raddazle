import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth";

export function AdminGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user, loading, initialized, isAuthenticated, isAdmin } = useAuthStore();

  useEffect(() => {
    if (!initialized || loading) return;
    if (!isAuthenticated || !isAdmin) {
      navigate({ to: "/admin/login" });
    }
  }, [initialized, loading, isAuthenticated, isAdmin, navigate]);

  if (!initialized || loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  return <>{children}</>;
}
