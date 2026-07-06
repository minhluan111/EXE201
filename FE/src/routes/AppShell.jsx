import { TenantProvider } from "../context/TenantContext.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import { MenuProvider } from "../context/MenuContext.jsx";
import { BookingProvider } from "../context/BookingContext.jsx";
import { ReviewProvider } from "../context/ReviewContext.jsx";

export default function AppShell({ children }) {
  return (
    <TenantProvider>
      <AuthProvider>
        <MenuProvider>
          <BookingProvider>
            <ReviewProvider>{children}</ReviewProvider>
          </BookingProvider>
        </MenuProvider>
      </AuthProvider>
    </TenantProvider>
  );
}
