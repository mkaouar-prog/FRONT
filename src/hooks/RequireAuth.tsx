// src/hooks/RequireAuth.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";          
import LoadingPage from "../utils/LoadingPage";

interface Props {
  allowedRoles: Array<"Eleve" | "Enseignant" | "Admin">;
}

const RequireAuth: React.FC<Props> = ({ allowedRoles }) => {
  const { user , isLoading} = useAuth();
  const location = useLocation();
  const token = localStorage.getItem("token");
  
  if (isLoading) return <LoadingPage />;
  // 1️⃣ not authenticated?
  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // 2️⃣ role not authorized?
  if (!allowedRoles.includes(user.role as any)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ all good
  return <Outlet />;
};

export default RequireAuth;
