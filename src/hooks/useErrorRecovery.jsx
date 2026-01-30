import { useState, useCallback } from 'react'
import { useToast } from '../contexts/ToastContext'
import { withRetry } from '../lib/apiHelpers'

/**
 * Hook for handling async operations with error recovery
 */
export const useAsyncOperation = (options = {}) => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  
  const {
    showSuccessToast = false,
    showErrorToast = true,
    retryOptions = { maxRetries: 2, delayMs: 1000 },
    onSuccess = null,
    onError = null
  } = options
  
  const execute = useCallback(async (asyncFn, successMessage = 'Operation completed') => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await withRetry(asyncFn, retryOptions)
      setData(result)
      
      if (showSuccessToast) {
        toast.success(successMessage)
      }
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (err) {
      console.error('Async operation failed:', err)
      setError(err)
      
      if (showErrorToast) {
        toast.error(err.message || 'Operation failed')
      }
      
      if (onError) {
        onError(err)
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast, showSuccessToast, showErrorToast, retryOptions, onSuccess, onError])
  
  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
  }, [])
  
  const retry = useCallback(async (asyncFn, successMessage) => {
    return execute(asyncFn, successMessage)
  }, [execute])
  
  return {
    loading,
    error,
    data,
    execute,
    reset,
    retry
  }
}

/**
 * Higher-order component for error recovery
 */
export const withErrorRecovery = (WrappedComponent, options = {}) => {
  const ErrorRecoveryWrapper = (props) => {
    const [hasError, setHasError] = useState(false)
    const [error, setError] = useState(null)
    
    const {
      fallbackComponent: FallbackComponent = null,
      onError = null,
      resetOnPropsChange = []
    } = options
    
    // Reset error state when specific props change
    useState(() => {
      if (resetOnPropsChange.length > 0) {
        setHasError(false)
        setError(null)
      }
    }, resetOnPropsChange)
    
    const handleError = (error, errorInfo) => {
      console.error('Component error caught:', error, errorInfo)
      setHasError(true)
      setError(error)
      
      if (onError) {
        onError(error, errorInfo)
      }
    }
    
    const reset = () => {
      setHasError(false)
      setError(null)
    }
    
    if (hasError) {
      if (FallbackComponent) {
        return <FallbackComponent error={error} reset={reset} />
      }
      
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
            Something went wrong
          </h3>
          <p className="text-red-600 dark:text-red-300 text-sm mb-3">
            {error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={reset}
            className="btn-secondary text-sm"
          >
            Try Again
          </button>
        </div>
      )
    }
    
    try {
      return <WrappedComponent {...props} />
    } catch (error) {
      handleError(error)
      return null
    }
  }
  
  ErrorRecoveryWrapper.displayName = `withErrorRecovery(${WrappedComponent.displayName || WrappedComponent.name})`
  
  return ErrorRecoveryWrapper
}

/**
 * Standardized error display component
 */
export const ErrorDisplay = ({ 
  error, 
  onRetry = null, 
  title = 'Something went wrong',
  className = ''
}) => {
  const { isDark } = useTheme()
  
  return (
    <div className={`rounded-lg p-6 text-center ${
      isDark 
        ? 'bg-red-900/20 border border-red-800' 
        : 'bg-red-50 border border-red-200'
    } ${className}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
        isDark ? 'bg-red-800/30' : 'bg-red-100'
      }`}>
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className={`font-medium mb-2 ${
        isDark ? 'text-red-200' : 'text-red-800'
      }`}>
        {title}
      </h3>
      <p className={`text-sm mb-4 ${
        isDark ? 'text-red-300' : 'text-red-600'
      }`}>
        {error?.message || 'Please try again or contact support if the problem persists.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

// Export both useAsyncOperation and useErrorRecovery (alias)
export const useErrorRecovery = useAsyncOperation
export default useAsyncOperation