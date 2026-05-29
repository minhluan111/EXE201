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
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/menu/:id" element={<MenuDetailPage />} />
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
      <Route path="/contact" element={<ContactPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/menus"
        element={
          <ProtectedRoute adminOnly>
            <AdminManageMenuPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tables"
        element={
          <ProtectedRoute adminOnly>
            <AdminManageTablesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute adminOnly>
            <AdminManageBookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <ProtectedRoute adminOnly>
            <AdminManageReviewsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/feedbacks"
        element={
          <ProtectedRoute adminOnly>
            <AdminManageFeedbacksPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
