import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

export default function AdminRoute() {
  const { user, token } = useAppSelector((state) => state.auth);

  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin or master role
  if (user?.role !== "admin" && user?.role !== "master") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
