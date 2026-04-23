import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// Layouts
import PublicLayout from '@/components/layout/PublicLayout'
import UserLayout from '@/components/layout/UserLayout'
import AdminLayout from '@/components/layout/AdminLayout'

// Public pages
import HomePage from '@/pages/public/HomePage'
import ProgramsPage from '@/pages/public/ProgramsPage'
import AboutPage from '@/pages/public/AboutPage'
import ContactPage from '@/pages/public/ContactPage'
import PrivacyPage from '@/pages/public/PrivacyPage'
import TermsPage from '@/pages/public/TermsPage'
import NotFoundPage from '@/pages/public/NotFoundPage'
import VerifyReceiptPage from '@/pages/public/VerifyReceiptPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'

// User pages
import UserDashboard from '@/pages/user/UserDashboard'
import ApplyOnlinePage from '@/pages/user/ApplyOnlinePage'
import AIChatPage from '@/pages/user/AIChatPage'
import NotificationsPage from '@/pages/user/NotificationsPage'
import NotificationSettingsPage from '@/pages/user/NotificationSettingsPage'
import MyApplicationsPage from '@/pages/user/MyApplicationsPage'
import ApplicationDetailPage from '@/pages/user/ApplicationDetailPage'

// Admin pages
import AdminOverview from '@/pages/admin/AdminOverview'
import ApplicationsDashboard from '@/pages/admin/ApplicationsDashboard'
import ReviewApplicationPage from '@/pages/admin/ReviewApplicationPage'
import PaymentDashboard from '@/pages/admin/PaymentDashboard'
import CreateReceiptPage from '@/pages/admin/CreateReceiptPage'
import ViewReceiptPage from '@/pages/admin/ViewReceiptPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/verify" element={<VerifyReceiptPage />} />
            <Route path="/verify/:txId" element={<VerifyReceiptPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            {/* AI chat accessible to public */}
            <Route path="/apply/chat" element={<AIChatPage />} />
          </Route>

          {/* User routes */}
          <Route
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/apply" element={<ApplyOnlinePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/applications" element={<MyApplicationsPage />} />
            <Route path="/applications/:id" element={<ApplicationDetailPage />} />
            <Route path="/settings" element={<NotificationSettingsPage />} />
          </Route>

          {/* Admin routes */}
          <Route
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/applications" element={<ApplicationsDashboard />} />
            <Route path="/admin/applications/:id" element={<ReviewApplicationPage />} />
            <Route path="/admin/payments" element={<PaymentDashboard />} />
            <Route path="/admin/payments/new" element={<CreateReceiptPage />} />
            <Route path="/admin/payments/:id" element={<ViewReceiptPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
