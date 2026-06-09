import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 20 }}>Đang tải...</div>;
  }

  if (user) {
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

  return children;
}
