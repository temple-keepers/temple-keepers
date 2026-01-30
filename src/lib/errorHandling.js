/**
 * User-friendly error messages for common errors
 */
export const errorMessages = {
  // Network errors
  'Failed to fetch': 'Unable to connect to the server. Please check your internet connection.',
  'NetworkError': 'Network connection lost. Please check your internet and try again.',
  'Connection failed': 'Connection problem. Please try again in a moment.',
  'NETWORK_ERROR': 'Unable to reach our servers. Please check your connection.',
  
  // Authentication errors
  'Invalid credentials': 'The email or password you entered is incorrect. Please try again.',
  'User not found': 'No account found with this email address. Please check your email or sign up.',
  'Email not confirmed': 'Please check your email and click the confirmation link before signing in.',
  'Password too weak': 'Password must be at least 8 characters with uppercase, lowercase, and numbers.',
  'Email already in use': 'An account with this email already exists. Try signing in instead.',
  'Invalid email': 'Please enter a valid email address.',
  'JWT expired': 'Your session has expired. Please sign in again.',
  'Invalid JWT': 'Your session is no longer valid. Please sign in again.',
  'Unauthorized': 'You need to sign in to access this feature.',
  
  // Database errors
  'duplicate key': 'This item already exists. Please choose a different name.',
  'foreign key': 'Cannot delete this item as it\'s being used elsewhere.',
  'not null': 'Please fill in all required fields.',
  'check constraint': 'The data you entered is not in the correct format.',
  'Row Level Security': 'You don\'t have permission to access this data.',
  
  // Supabase specific
  'PGRST116': 'No data found.',
  'PGRST301': 'You don\'t have permission to perform this action.',
  'PGRST204': 'Operation completed successfully.',
  '23505': 'This item already exists. Please choose a different name.',
  '23503': 'Cannot complete this action due to related data.',
  '23502': 'Please fill in all required fields.',
  
  // File upload errors
  'File too large': 'File size is too large. Please choose a smaller file.',
  'Invalid file type': 'File type not supported. Please choose a different file.',
  'Upload failed': 'Failed to upload file. Please try again.',
  
  // API rate limiting
  'Too many requests': 'Too many attempts. Please wait a moment and try again.',
  'Rate limit exceeded': 'Please slow down and try again in a moment.',
  
  // Generic fallbacks
  'Internal server error': 'Something went wrong on our end. Our team has been notified.',
  'Service unavailable': 'Service is temporarily unavailable. Please try again later.',
  'Timeout': 'Request timed out. Please check your connection and try again.',
  
  // Form validation
  'required': 'This field is required.',
  'email': 'Please enter a valid email address.',
  'minLength': 'Too short. Please enter more characters.',
  'maxLength': 'Too long. Please enter fewer characters.',
  'pattern': 'Invalid format. Please check your input.',
}

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) return fallback
  
  // Handle string errors
  if (typeof error === 'string') {
    // Check for exact matches first
    if (errorMessages[error]) {
      return errorMessages[error]
    }
    
    // Check for partial matches
    for (const [key, message] of Object.entries(errorMessages)) {
      if (error.toLowerCase().includes(key.toLowerCase())) {
        return message
      }
    }
    
    return error
  }
  
  // Handle error objects
  if (error && typeof error === 'object') {
    // Supabase error format
    if (error.message) {
      const message = getErrorMessage(error.message)
      if (message !== error.message) return message
    }
    
    // HTTP status codes
    if (error.status) {
      switch (error.status) {
        case 400:
          return 'Invalid request. Please check your input.'
        case 401:
          return 'Please sign in to continue.'
        case 403:
          return 'You don\'t have permission to perform this action.'
        case 404:
          return 'The requested item was not found.'
        case 408:
          return 'Request timed out. Please try again.'
        case 409:
          return 'This item already exists.'
        case 422:
          return 'Invalid data. Please check your input.'
        case 429:
          return 'Too many requests. Please wait and try again.'
        case 500:
          return 'Server error. Our team has been notified.'
        case 502:
        case 503:
        case 504:
          return 'Service temporarily unavailable. Please try again later.'
        default:
          return `Server error (${error.status}). Please try again.`
      }
    }
    
    // PostgreSQL error codes
    if (error.code) {
      const pgMessage = errorMessages[error.code]
      if (pgMessage) return pgMessage
    }
    
    // Network errors
    if (error.name) {
      const networkMessage = errorMessages[error.name]
      if (networkMessage) return networkMessage
    }
    
    // Try to get any message property
    return error.message || error.error_description || error.error || fallback
  }
  
  return fallback
}

/**
 * Enhanced toast with better error messages
 */
export const showErrorToast = (toast, error, customMessage = null) => {
  const message = customMessage || getErrorMessage(error)
  
  // Add contextual help for common errors
  let helpText = null
  
  if (message.includes('internet') || message.includes('connection')) {
    helpText = 'Check your WiFi or cellular connection'
  } else if (message.includes('sign in') || message.includes('session')) {
    helpText = 'You may need to refresh the page'
  } else if (message.includes('permission')) {
    helpText = 'Contact support if this seems wrong'
  }
  
  toast.error(message, {
    duration: helpText ? 6000 : 5000,
    ...(helpText && {
      description: helpText
    })
  })
}

/**
 * Development vs production error handling
 */
export const handleError = (error, context = 'Unknown', toast = null) => {
  // Log full error details in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error in ${context}`)
    console.error('Error:', error)
    console.error('Stack:', error?.stack)
    console.error('Context:', context)
    console.groupEnd()
  } else {
    // Log minimal info in production
    console.error(`Error in ${context}:`, error?.message || error)
  }
  
  // Show user-friendly error if toast is available
  if (toast) {
    showErrorToast(toast, error)
  }
  
  // Report to external service in production
  if (process.env.NODE_ENV === 'production' && window.gtag) {
    window.gtag('event', 'exception', {
      description: error?.message || error || 'Unknown error',
      fatal: false,
      custom_map: {
        context: context
      }
    })
  }
}

/**
 * Retry with exponential backoff and user feedback
 */
export const retryOperation = async (operation, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    toast = null,
    onRetry = null,
    context = 'operation'
  } = options
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      handleError(error, context, attempt === 0 ? toast : null) // Only show toast on first attempt
      
      if (attempt === maxRetries) {
        // Final attempt failed
        if (toast) {
          toast.error(`Failed after ${maxRetries + 1} attempts. Please try again later.`)
        }
        throw error
      }
      
      // Calculate delay with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      
      if (onRetry) {
        onRetry(attempt + 1, delay, error)
      }
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

export default getErrorMessage