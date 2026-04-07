import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

export function RequirePro({ children }: { children: ReactNode }) {
  const { loading, userId, isPro } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">
        正在加载权限信息...
      </div>
    );
  }

  if (!userId) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (!isPro) {
    return <Navigate to="/membership" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
