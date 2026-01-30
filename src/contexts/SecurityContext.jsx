import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { securityEvents, logSecurityEvent, getSecurityConfig } from '../config/security'
import { rateLimiters } from '../utils/security'

const SecurityContext = createContext()

export const useSecurityContext = () => {
  const context = useContext(SecurityContext)
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider')
  }
  return context
}

export const SecurityProvider = ({ children }) => {
  const [securityConfig, setSecurityConfig] = useState(() => getSecurityConfig())
  const [securityEvents, setSecurityEvents] = useState([])
  const [isSecurityEnabled, setIsSecurityEnabled] = useState(true)
  
  // Track failed attempts by IP/session
  const [failedAttempts, setFailedAttempts] = useState(new Map())
  
  // Initialize security measures
  useEffect(() => {
    // Set up CSP if in production
    if (import.meta.env.PROD && typeof document !== 'undefined') {
      const meta = document.createElement('meta')
      meta.httpEquiv = 'Content-Security-Policy'
      meta.content = Object.entries(securityConfig.csp)
        .filter(([_, values]) => values.length > 0)
        .map(([directive, values]) => `${directive} ${values.join(' ')}`)
        .join('; ')
      document.head.appendChild(meta)
    }

    // Monitor for suspicious activity
    const monitorSecurity = () => {
      // Check for rapid-fire requests
      if (performance.navigation && performance.navigation.type === performance.navigation.TYPE_RELOAD) {
        const reloadCount = parseInt(sessionStorage.getItem('reloadCount') || '0') + 1
        sessionStorage.setItem('reloadCount', reloadCount.toString())
        
        if (reloadCount > 10) {
          logSecurityEvent(securityEvents.SUSPICIOUS_ACTIVITY, {
            reason: 'excessive_reloads',
            count: reloadCount
          })
        }
      }

      // Monitor for potential XSS attempts
      const originalError = window.onerror
      window.onerror = (message, source, lineno, colno, error) => {
        if (typeof message === 'string' && (
          message.includes('<script>') ||
          message.includes('javascript:') ||
          message.includes('eval(')
        )) {
          logSecurityEvent(securityEvents.XSS_ATTEMPT, {
            message,
            source,
            line: lineno
          })
        }
        
        if (originalError) {
          originalError(message, source, lineno, colno, error)
        }
      }
    }

    monitorSecurity()
    
    // Cleanup rate limiters periodically
    const cleanupInterval = setInterval(() => {
      Object.values(rateLimiters).forEach(limiter => limiter.cleanup())
    }, 60000)

    return () => {
      clearInterval(cleanupInterval)
    }
  }, [])

  // Track security events
  const trackSecurityEvent = useCallback((eventType, data = {}) => {
    const event = {
      id: Date.now() + Math.random(),
      type: eventType,
      timestamp: Date.now(),
      data
    }
    
    setSecurityEvents(prev => [event, ...prev.slice(0, 99)]) // Keep last 100 events
    logSecurityEvent(eventType, data)
  }, [])

  // Check if request should be rate limited
  const checkRateLimit = useCallback((identifier, limiter = rateLimiters.general) => {
    const result = limiter.isAllowed(identifier)
    
    if (!result.allowed) {
      trackSecurityEvent(securityEvents.RATE_LIMIT_EXCEEDED, {
        identifier,
        remainingTime: result.retryAfter
      })
    }
    
    return result
  }, [trackSecurityEvent])

  // Track failed authentication attempts
  const trackFailedAttempt = useCallback((identifier, type = 'login') => {
    const key = `${identifier}_${type}`
    const current = failedAttempts.get(key) || 0
    const newCount = current + 1
    
    setFailedAttempts(prev => new Map(prev).set(key, newCount))
    
    // Track security event for multiple failures
    if (newCount >= 3) {
      trackSecurityEvent(securityEvents.BRUTE_FORCE, {
        identifier,
        type,
        attemptCount: newCount
      })
    }
    
    return newCount
  }, [failedAttempts, trackSecurityEvent])

  // Reset failed attempts on successful auth
  const resetFailedAttempts = useCallback((identifier, type = 'login') => {
    const key = `${identifier}_${type}`
    setFailedAttempts(prev => {
      const newMap = new Map(prev)
      newMap.delete(key)
      return newMap
    })
  }, [])

  // Validate input against security patterns
  const validateInput = useCallback((input, options = {}) => {
    const { type, maxLength = 1000, allowHTML = false } = options
    
    if (typeof input !== 'string') {
      return { valid: false, error: 'Invalid input type', sanitized: '' }
    }
    
    // Check length
    if (input.length > maxLength) {
      trackSecurityEvent(securityEvents.INVALID_INPUT, {
        reason: 'length_exceeded',
        inputLength: input.length,
        maxLength
      })
      return { valid: false, error: 'Input too long', sanitized: input.substring(0, maxLength) }
    }
    
    // Check for potential XSS
    if (!allowHTML && /<[^>]*script|javascript:|on\w+=/i.test(input)) {
      trackSecurityEvent(securityEvents.XSS_ATTEMPT, {
        input: input.substring(0, 100) // Log first 100 chars only
      })
      return { valid: false, error: 'Invalid content detected', sanitized: input.replace(/<[^>]*>/g, '') }
    }
    
    // Sanitize based on type
    let sanitized = input
    if (type === 'email') {
      sanitized = input.toLowerCase().trim()
    } else if (type === 'text') {
      sanitized = input.trim()
    }
    
    return { valid: true, error: null, sanitized }
  }, [trackSecurityEvent])

  // Check if user is in security lockout
  const isLocked = useCallback((identifier, type = 'login', threshold = 5) => {
    const key = `${identifier}_${type}`
    const attempts = failedAttempts.get(key) || 0
    return attempts >= threshold
  }, [failedAttempts])

  // Security status for monitoring
  const getSecurityStatus = useCallback(() => {
    const recentEvents = securityEvents.filter(event => 
      Date.now() - event.timestamp < 3600000 // Last hour
    )
    
    const eventCounts = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    }, {})
    
    return {
      isEnabled: isSecurityEnabled,
      recentEventCount: recentEvents.length,
      eventBreakdown: eventCounts,
      activeLockouts: Array.from(failedAttempts.entries())
        .filter(([_, count]) => count >= 5)
        .length,
      rateLimitStatus: {
        login: rateLimiters.login.requests.size,
        general: rateLimiters.general.requests.size
      }
    }
  }, [securityEvents, isSecurityEnabled, failedAttempts])

  const value = {
    securityConfig,
    securityEvents,
    isSecurityEnabled,
    trackSecurityEvent,
    checkRateLimit,
    trackFailedAttempt,
    resetFailedAttempts,
    validateInput,
    isLocked,
    getSecurityStatus,
    rateLimiters
  }

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  )
}