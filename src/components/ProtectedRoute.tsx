import { useConvexAuth, useQuery } from "convex/react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { TrialOfferDialog } from "./TrialOfferDialog";

export function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const access = useQuery(api.billing.access, isAuthenticated ? {} : "skip");

  if (isLoading) {
    return <div className="min-h-svh bg-paper" aria-busy="true" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (access === undefined) {
    return <div className="min-h-svh bg-paper" aria-busy="true" />;
  }

  if (!access.entitled) {
    return (
      <div className="min-h-svh bg-paper">
        <TrialOfferDialog email={access.email} userId={access.userId} />
      </div>
    );
  }

  return <Outlet />;
}
