import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext-minimal'
import { useEffect } from 'react'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Log auth state for debugging
  useEffect(() => {
    console.log('ProtectedRoute - User:', user?.id, 'Loading:', loading, 'Path:', location.pathname)
  }, [user, loading, location.pathname])

  // Show loading spinner while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your session...</p>
        </div>
      </div>
    )
  }

  // Only redirect if we're definitely not authenticated and not still loading
  if (!user && !loading) {
    console.log('ProtectedRoute - No authenticated user, redirecting to login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
