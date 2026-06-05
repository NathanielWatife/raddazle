import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.href });
  const { user, loading, initialized, isAuthenticated, isAdmin } = useAuthStore();

  useEffect(() => {
    if (!initialized || loading) return;
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: path } as never });
    } else if (requireAdmin && !isAdmin) {
      navigate({ to: "/" });
    }
  }, [initialized, loading, isAuthenticated, isAdmin, requireAdmin, navigate, path]);

  if (!initialized || loading || !user || (requireAdmin && !isAdmin)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
