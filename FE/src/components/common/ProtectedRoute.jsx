import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoute({ children, roleRequired }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 20 }}>Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  // If this is a client-only authenticated route (roleRequired is not specified),
  // redirect staff, manager, and admin roles to their dashboards.
  if (!roleRequired) {
    if (user.role === "manager") {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === "staff") {
      return <Navigate to="/admin/bookings" replace />;
    }
    if (user.role === "admin") {
      return <Navigate to="/admin/accounts" replace />;
    }
  }
  
  if (roleRequired === "admin" && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  
  if (roleRequired === "manager" && user.role !== "manager") {
    return <Navigate to="/" replace />;
  }
  
  if (roleRequired === "staff_or_manager" && user.role !== "staff" && user.role !== "manager") {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

