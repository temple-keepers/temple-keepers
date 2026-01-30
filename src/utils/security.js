/**
 * Security utilities and validation patterns
 */

// Input sanitization utilities
export const sanitizeInput = {
  // Remove HTML tags and dangerous characters
  html: (input) => {
    if (typeof input !== 'string') return input
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
  },

  // Sanitize email input
  email: (email) => {
    if (typeof email !== 'string') return ''
    return email.toLowerCase().trim().replace(/[^\w@.-]/g, '')
  },

  // Sanitize text input (preserve basic formatting)
  text: (input) => {
    if (typeof input !== 'string') return input
    return input
      .replace(/[<>\"']/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  },

  // Sanitize numeric input
  number: (input) => {
    const num = parseFloat(input)
    return isNaN(num) ? 0 : num
  },

  // Sanitize URL input
  url: (url) => {
    if (typeof url !== 'string') return ''
    try {
      const parsed = new URL(url)
      // Only allow http, https, and mailto protocols
      if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
        return ''
      }
      return parsed.toString()
    } catch {
      return ''
    }
  }
}

// Enhanced form validation
export const validateForm = {
  // Email validation with enhanced security
  email: (email) => {
    const sanitized = sanitizeInput.email(email)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const maxLength = 254 // RFC 5321 limit
    
    if (!sanitized) return { valid: false, error: 'Email is required' }
    if (sanitized.length > maxLength) return { valid: false, error: 'Email too long' }
    if (!emailRegex.test(sanitized)) return { valid: false, error: 'Invalid email format' }
    
    // Check for suspicious patterns
    if (sanitized.includes('..') || sanitized.startsWith('.') || sanitized.endsWith('.')) {
      return { valid: false, error: 'Invalid email format' }
    }
    
    return { valid: true, value: sanitized }
  },

  // Password validation with security requirements
  password: (password) => {
    if (!password) return { valid: false, error: 'Password is required' }
    if (password.length < 8) return { valid: false, error: 'Password must be at least 8 characters' }
    if (password.length > 128) return { valid: false, error: 'Password too long' }
    
    // Check for common weak patterns
    const weakPatterns = [
      /^(.)\1+$/, // All same character
      /^123456/, // Sequential numbers
      /^password/i, // Contains "password"
      /^qwerty/i, // Keyboard patterns
    ]
    
    for (const pattern of weakPatterns) {
      if (pattern.test(password)) {
        return { valid: false, error: 'Password too weak' }
      }
    }
    
    // Require mixed case, numbers, and symbols
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    const requirements = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length
    if (requirements < 3) {
      return { valid: false, error: 'Password must contain at least 3: lowercase, uppercase, numbers, symbols' }
    }
    
    return { valid: true, value: password }
  },

  // Text field validation with XSS prevention
  text: (text, options = {}) => {
    const { minLength = 0, maxLength = 1000, required = false } = options
    
    if (!text && required) return { valid: false, error: 'Field is required' }
    if (!text) return { valid: true, value: '' }
    
    const sanitized = sanitizeInput.text(text)
    
    if (sanitized.length < minLength) {
      return { valid: false, error: `Minimum ${minLength} characters required` }
    }
    if (sanitized.length > maxLength) {
      return { valid: false, error: `Maximum ${maxLength} characters allowed` }
    }
    
    // Check for suspicious content
    if (sanitized !== text) {
      return { valid: false, error: 'Invalid characters detected' }
    }
    
    return { valid: true, value: sanitized }
  },

  // URL validation
  url: (url, options = {}) => {
    const { required = false, allowedDomains = [] } = options
    
    if (!url && required) return { valid: false, error: 'URL is required' }
    if (!url) return { valid: true, value: '' }
    
    const sanitized = sanitizeInput.url(url)
    if (!sanitized) return { valid: false, error: 'Invalid URL format' }
    
    // Check domain whitelist if provided
    if (allowedDomains.length > 0) {
      try {
        const domain = new URL(sanitized).hostname
        if (!allowedDomains.some(allowed => domain.endsWith(allowed))) {
          return { valid: false, error: 'Domain not allowed' }
        }
      } catch {
        return { valid: false, error: 'Invalid URL' }
      }
    }
    
    return { valid: true, value: sanitized }
  }
}

// Rate limiting utilities
export class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = new Map()
  }

  isAllowed(identifier) {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    // Get existing requests for this identifier
    let userRequests = this.requests.get(identifier) || []
    
    // Remove old requests outside the window
    userRequests = userRequests.filter(timestamp => timestamp > windowStart)
    
    // Check if limit exceeded
    if (userRequests.length >= this.maxRequests) {
      return { allowed: false, retryAfter: this.windowMs }
    }
    
    // Add current request
    userRequests.push(now)
    this.requests.set(identifier, userRequests)
    
    return { allowed: true, remaining: this.maxRequests - userRequests.length }
  }

  reset(identifier) {
    this.requests.delete(identifier)
  }

  cleanup() {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart)
      if (validRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, validRequests)
      }
    }
  }
}

// Content Security Policy helpers
export const cspHelpers = {
  // Generate nonce for inline scripts/styles
  generateNonce: () => {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  },

  // Build CSP header value
  buildCSP: (config = {}) => {
    const defaults = {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'", 'https:'],
      'connect-src': ["'self'", 'https:'],
      'frame-src': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'upgrade-insecure-requests': []
    }

    const policy = { ...defaults, ...config }
    
    return Object.entries(policy)
      .filter(([_, values]) => values.length > 0)
      .map(([directive, values]) => `${directive} ${values.join(' ')}`)
      .join('; ')
  }
}

// Secure storage utilities
export const secureStorage = {
  // Encrypt sensitive data before storing
  setSecure: (key, value) => {
    try {
      // In a real app, you'd use proper encryption
      // For now, just base64 encode with timestamp
      const timestamp = Date.now()
      const data = { value, timestamp }
      const encoded = btoa(JSON.stringify(data))
      localStorage.setItem(`secure_${key}`, encoded)
      return true
    } catch (error) {
      console.error('Failed to store secure data:', error)
      return false
    }
  },

  // Decrypt and retrieve sensitive data
  getSecure: (key, maxAge = 3600000) => { // 1 hour default
    try {
      const encoded = localStorage.getItem(`secure_${key}`)
      if (!encoded) return null
      
      const data = JSON.parse(atob(encoded))
      const age = Date.now() - data.timestamp
      
      if (age > maxAge) {
        localStorage.removeItem(`secure_${key}`)
        return null
      }
      
      return data.value
    } catch (error) {
      console.error('Failed to retrieve secure data:', error)
      return null
    }
  },

  // Remove secure data
  removeSecure: (key) => {
    localStorage.removeItem(`secure_${key}`)
  },

  // Clear all secure data
  clearSecure: () => {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key)
      }
    })
  }
}

// Input field security wrapper
export const secureInput = (value, validator, options = {}) => {
  const result = validator(value, options)
  
  if (result.valid) {
    // Log successful validation (for monitoring)
    if (window.gtag && options.trackValidation) {
      window.gtag('event', 'form_validation_success', {
        field_type: options.fieldType || 'unknown'
      })
    }
  } else {
    // Log validation failure (for security monitoring)
    if (window.gtag && options.trackValidation) {
      window.gtag('event', 'form_validation_error', {
        field_type: options.fieldType || 'unknown',
        error_type: result.error
      })
    }
    
    // Rate limit validation attempts
    if (options.rateLimiter && options.identifier) {
      const rateLimitResult = options.rateLimiter.isAllowed(options.identifier)
      if (!rateLimitResult.allowed) {
        return { 
          valid: false, 
          error: 'Too many validation attempts. Please try again later.',
          rateLimited: true 
        }
      }
    }
  }
  
  return result
}

// Initialize rate limiters
export const rateLimiters = {
  login: new RateLimiter(5, 300000), // 5 attempts per 5 minutes
  signup: new RateLimiter(3, 600000), // 3 attempts per 10 minutes  
  password: new RateLimiter(10, 300000), // 10 attempts per 5 minutes
  general: new RateLimiter(50, 60000) // 50 requests per minute
}

// Cleanup rate limiters periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    Object.values(rateLimiters).forEach(limiter => limiter.cleanup())
  }, 60000) // Cleanup every minute
}