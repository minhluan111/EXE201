import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "../pages/homePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import MenuPage from "../pages/menuPage.jsx";
import MenuDetailPage from "../pages/MenuDetailPage.jsx";
import BookingPage from "../pages/BookingPage.jsx";
import BookingConfirmPage from "../pages/BookingConfirmPage.jsx";
import BookingHistoryPage from "../pages/BookingHistoryPage.jsx";
import ContactPage from "../pages/ContactPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import AdminDashboardPage from "../pages/admin/DashboardPage.jsx";
import AdminManageMenuPage from "../pages/admin/ManageMenuPage.jsx";
import AdminManageTablesPage from "../pages/admin/ManageTablesPage.jsx";
import AdminManageBookingsPage from "../pages/admin/ManageBookingsPage.jsx";
import AdminManageReviewsPage from "../pages/admin/ManageReviewsPage.jsx";
import AdminManageFeedbacksPage from "../pages/admin/ManageFeedbacksPage.jsx";
import AdminManageAccountsPage from "../pages/admin/ManageAccountsPage.jsx";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
import PublicRoute from "../components/common/PublicRoute.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/menu" element={<PublicRoute><MenuPage /></PublicRoute>} />
      <Route path="/menu/:id" element={<PublicRoute><MenuDetailPage /></PublicRoute>} />
      
      {/* Standard Authenticated User Routes */}
      <Route
        path="/booking"
        element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/confirm"
        element={
          <ProtectedRoute>
            <BookingConfirmPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/history"
        element={
          <ProtectedRoute>
            <BookingHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route path="/contact" element={<PublicRoute><ContactPage /></PublicRoute>} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Staff & Manager Shared Routes */}
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute roleRequired="staff_or_manager">
            <AdminManageBookingsPage />
          </ProtectedRoute>
        }
      />

      {/* Manager Only Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roleRequired="manager">
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/feedbacks"
        element={
          <ProtectedRoute roleRequired="manager">
            <AdminManageFeedbacksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/menus"
        element={
          <ProtectedRoute roleRequired="manager">
            <AdminManageMenuPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tables"
        element={
          <ProtectedRoute roleRequired="manager">
            <AdminManageTablesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <ProtectedRoute roleRequired="manager">
            <AdminManageReviewsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Only Routes */}
      <Route
        path="/admin/accounts"
        element={
          <ProtectedRoute roleRequired="admin">
            <AdminManageAccountsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
