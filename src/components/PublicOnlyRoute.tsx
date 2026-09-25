import { useConvexAuth } from "convex/react";
import { Navigate, Outlet } from "react-router-dom";

export function PublicOnlyRoute() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return <div className="min-h-svh bg-paper" aria-busy="true" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
