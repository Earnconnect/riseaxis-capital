import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface Props {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // Show a slim top progress bar instead of a full-screen block —
  // much less jarring, page feels faster
  if (loading) {
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
