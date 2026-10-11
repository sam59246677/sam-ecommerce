
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import useAuthStore from "../../store/authStore";

interface RoleRouteProps {
  children: ReactNode;
  allowedRole: "customer" | "admin";
}

function RoleRoute({
  children,
  allowedRole,
}: RoleRouteProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const location = useLocation();

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (user.role !== allowedRole) {
    return <Navigate to="/products" replace />;
  }

  return children;
}

export default RoleRoute;
