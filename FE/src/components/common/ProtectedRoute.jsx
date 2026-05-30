import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoute({ children, roleRequired }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 20 }}>Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
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
