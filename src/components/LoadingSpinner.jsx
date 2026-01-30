import { Loader2 } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

/**
 * Standardized loading spinner component
 */
export const LoadingSpinner = ({ 
  size = 'default', 
  message = 'Loading...', 
  className = '',
  showMessage = true,
  variant = 'default' // default, minimal, page
}) => {
  const { isDark } = useTheme()
  
  const sizes = {
    sm: 'w-4 h-4',
    default: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  const baseClasses = `animate-spin ${sizes[size]}`
  
  if (variant === 'minimal') {
    return (
      <Loader2 className={`${baseClasses} ${className}`} />
    )
  }
  
  if (variant === 'page') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-amber-50 dark:from-temple-dark dark:via-temple-dark-surface dark:to-[#251a30] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-temple-purple" />
          {showMessage && (
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${baseClasses} text-temple-purple mb-2`} />
      {showMessage && (
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}

export const LoadingContainer = ({ 
  loading, 
  error, 
  onRetry, 
  children, 
  message = 'Loading...',
  errorMessage = 'Something went wrong',
  minHeight = 'min-h-[20rem]'
}) => {
  const { isDark } = useTheme()
  
  if (loading) {
    return (
      <div className={`${minHeight} flex items-center justify-center`}>
        <LoadingSpinner message={message} />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={`${minHeight} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isDark ? 'bg-red-500/10' : 'bg-red-50'
          }`}>
            <Loader2 className="w-8 h-8 text-red-500" />
          </div>
          <h3 className={`text-lg font-medium mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {errorMessage}
          </h3>
          <p className={`text-sm mb-4 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {error?.message || 'Please try again'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }
  
  return children
}

export default LoadingSpinner