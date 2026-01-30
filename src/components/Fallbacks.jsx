import { ChefHat, BookOpen, Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

/**
 * Fallback component for when data fails to load
 */
export const DataFallback = ({ 
  icon: Icon = AlertCircle,
  title = 'Unable to load data',
  message = 'Please check your connection and try again',
  onRetry = null,
  children = null,
  className = ''
}) => {
  const { isDark } = useTheme()
  
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <Icon className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
      </div>
      <h3 className={`text-lg font-medium mb-2 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {title}
      </h3>
      <p className={`text-sm mb-4 max-w-sm mx-auto ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
      {children}
    </div>
  )
}

/**
 * Fallback for empty recipe lists
 */
export const EmptyRecipesFallback = ({ onGenerate }) => {
  return (
    <DataFallback
      icon={ChefHat}
      title="No recipes yet"
      message="Generate your first healthy, faith-inspired recipe to get started on your wellness journey"
    >
      {onGenerate && (
        <button
          onClick={onGenerate}
          className="btn-primary mt-4 inline-flex items-center gap-2"
        >
          <ChefHat className="w-4 h-4" />
          Generate Recipe
        </button>
      )}
    </DataFallback>
  )
}

/**
 * Fallback for empty devotionals
 */
export const EmptyDevotionalsFallback = ({ onGenerate }) => {
  return (
    <DataFallback
      icon={BookOpen}
      title="No devotionals yet"
      message="Start your day with a personalized devotional that combines faith and wellness"
    >
      {onGenerate && (
        <button
          onClick={onGenerate}
          className="btn-primary mt-4 inline-flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Generate Devotional
        </button>
      )}
    </DataFallback>
  )
}

/**
 * Network error fallback
 */
export const NetworkErrorFallback = ({ onRetry, isOffline = false }) => {
  const { isDark } = useTheme()
  
  return (
    <div className={`text-center py-12 px-4`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
        isDark ? 'bg-orange-900/20' : 'bg-orange-100'
      }`}>
        {isOffline ? (
          <WifiOff className="w-8 h-8 text-orange-500" />
        ) : (
          <Wifi className="w-8 h-8 text-orange-500" />
        )}
      </div>
      <h3 className={`text-lg font-medium mb-2 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {isOffline ? 'No internet connection' : 'Connection problem'}
      </h3>
      <p className={`text-sm mb-4 max-w-sm mx-auto ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {isOffline 
          ? 'Please check your internet connection and try again'
          : 'Unable to connect to our servers. Please try again in a moment'
        }
      </p>
      {onRetry && !isOffline && (
        <button
          onClick={onRetry}
          className="btn-primary inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
      {isOffline && (
        <p className={`text-xs mt-4 ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}>
          Some features may be limited while offline
        </p>
      )}
    </div>
  )
}

/**
 * Generic permission denied fallback
 */
export const PermissionDeniedFallback = ({ 
  title = 'Access denied',
  message = 'You don\'t have permission to view this content',
  showLogin = false,
  onLogin = null
}) => {
  const { isDark } = useTheme()
  
  return (
    <div className="text-center py-12 px-4">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
        isDark ? 'bg-red-900/20' : 'bg-red-100'
      }`}>
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className={`text-lg font-medium mb-2 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {title}
      </h3>
      <p className={`text-sm mb-4 max-w-sm mx-auto ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {message}
      </p>
      {showLogin && onLogin && (
        <button
          onClick={onLogin}
          className="btn-primary"
        >
          Sign In
        </button>
      )}
    </div>
  )
}

/**
 * Feature coming soon fallback
 */
export const ComingSoonFallback = ({ 
  feature = 'This feature',
  message = 'We\'re working hard to bring you this feature. Stay tuned!'
}) => {
  const { isDark } = useTheme()
  
  return (
    <div className="text-center py-12 px-4">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
        isDark ? 'bg-temple-purple/20' : 'bg-temple-purple/10'
      }`}>
        <span className="text-2xl">🚧</span>
      </div>
      <h3 className={`text-lg font-medium mb-2 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {feature} Coming Soon
      </h3>
      <p className={`text-sm max-w-sm mx-auto ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {message}
      </p>
    </div>
  )
}

/**
 * Maintenance mode fallback
 */
export const MaintenanceFallback = ({ 
  title = 'Under Maintenance',
  message = 'We\'re making some improvements. Please check back soon.',
  estimatedTime = null
}) => {
  const { isDark } = useTheme()
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isDark ? 'bg-yellow-900/20' : 'bg-yellow-100'
        }`}>
          <span className="text-2xl">🔧</span>
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h1>
        <p className={`text-sm mb-4 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {message}
        </p>
        {estimatedTime && (
          <p className={`text-xs ${
            isDark ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Estimated time: {estimatedTime}
          </p>
        )}
      </div>
    </div>
  )
}

export default DataFallback