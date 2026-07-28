import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface Props {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const { user, profile, loading, profileLoaded } = useAuth()
  const location = useLocation()

  // Show a slim top progress bar instead of a full-screen block —
  // much less jarring, page feels faster.
  // Also wait while an admin route's profile is still loading: profile
  // arrives after the session (AuthContext unblocks the UI early), so
  // without this an admin hard-loading /admin gets bounced to /dashboard
  // because profile is momentarily null. profileLoaded settles even if the
  // fetch fails, so this never hangs indefinitely.
  if (loading || (requireAdmin && user && !profileLoaded)) {
    return (
      <div className="min-h-screen bg-page">
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-navy-200 z-50">
          <div className="h-full bg-navy-600 animate-[progress_1.2s_ease-in-out_infinite]"
            style={{ width: '60%', animation: 'progressBar 1.4s ease-in-out infinite' }} />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
