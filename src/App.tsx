import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

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
import TrackApplicationPage from '@/pages/public/TrackApplicationPage'
import ImpactPage from '@/pages/public/ImpactPage'
import NewsPage from '@/pages/public/NewsPage'
import CareersPage from '@/pages/public/CareersPage'
import ResourcesPage from '@/pages/public/ResourcesPage'
import GovernancePage from '@/pages/public/GovernancePage'
import FAQPage from '@/pages/public/FAQPage'
import PartnersPage from '@/pages/public/PartnersPage'
import CookieBanner from '@/components/ui/CookieBanner'
import DonatePage from '@/pages/public/DonatePage'
import FraudWarningPage from '@/pages/public/FraudWarningPage'
import AccessibilityPage from '@/pages/public/AccessibilityPage'
import StoriesPage from '@/pages/public/StoriesPage'
import SitemapPage from '@/pages/public/SitemapPage'
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
import ProfilePage from '@/pages/user/ProfilePage'
import WalletPage from '@/pages/user/WalletPage'

// Admin pages
import UsersPage from '@/pages/admin/UsersPage'
import WithdrawalRequestsPage from '@/pages/admin/WithdrawalRequestsPage'
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
        <ScrollToTop />
        <CookieBanner />
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
            <Route path="/track" element={<TrackApplicationPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/resources"   element={<ResourcesPage />} />
            <Route path="/governance" element={<GovernancePage />} />
            <Route path="/faq"        element={<FAQPage />} />
            <Route path="/partners"     element={<PartnersPage />} />
            <Route path="/donate"       element={<DonatePage />} />
            <Route path="/fraud-warning" element={<FraudWarningPage />} />
            <Route path="/accessibility" element={<AccessibilityPage />} />
            <Route path="/stories"       element={<StoriesPage />} />
            <Route path="/sitemap"       element={<SitemapPage />} />
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
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wallet" element={<WalletPage />} />
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
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/withdrawals" element={<WithdrawalRequestsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
