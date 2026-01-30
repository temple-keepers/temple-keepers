/**
 * Security configuration for production deployment
 */

// Content Security Policy configuration
export const cspConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Needed for Vite in development
    "'unsafe-eval'", // Needed for Vite in development
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://js.stripe.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Needed for CSS-in-JS and Tailwind
    'https://fonts.googleapis.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com'
  ],
  'img-src': [
    "'self'",
    'data:', // For base64 images
    'https:', // Allow all HTTPS images
    'blob:' // For generated images
  ],
  'connect-src': [
    "'self'",
    'https://*.supabase.co', // Supabase API
    'https://api.stripe.com',
    'https://www.google-analytics.com',
    'wss://*.supabase.co' // Supabase realtime
  ],
  'frame-src': [
    'https://js.stripe.com',
    'https://hooks.stripe.com'
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
}

// Security headers configuration
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': Object.entries(cspConfig)
    .filter(([_, values]) => values.length > 0)
    .map(([directive, values]) => `${directive} ${values.join(' ')}`)
    .join('; '),

  // Prevent XSS attacks
  'X-XSS-Protection': '1; mode=block',

  // Prevent content type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'payment=(self)',
    'fullscreen=(self)'
  ].join(', ')
}

// Rate limiting configuration
export const rateLimitConfig = {
  // API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // requests per window
    message: 'Too many API requests'
  },

  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // requests per window
    message: 'Too many authentication attempts'
  },

  // General requests
  general: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60, // requests per window
    message: 'Too many requests'
  }
}

// Input validation patterns
export const validationPatterns = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
    minLength: 5
  },

  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false // Optional for better UX
  },

  name: {
    pattern: /^[a-zA-Z\s'-]+$/,
    maxLength: 50,
    minLength: 1
  },

  url: {
    pattern: /^https?:\/\/.+/,
    maxLength: 2048
  },

  phone: {
    pattern: /^\+?[1-9]\d{1,14}$/, // E.164 format
    maxLength: 17
  }
}

// Sensitive data patterns to detect and prevent logging
export const sensitiveDataPatterns = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /auth/i,
  /session/i,
  /cookie/i
]

// Environment-specific security settings
export const getSecurityConfig = () => {
  const isDevelopment = import.meta.env.DEV
  const isProduction = import.meta.env.PROD

  return {
    // Disable some security features in development
    csp: isDevelopment ? {
      ...cspConfig,
      'script-src': [...cspConfig['script-src'], "'unsafe-eval'"],
      'style-src': [...cspConfig['style-src'], "'unsafe-inline'"]
    } : cspConfig,

    // More relaxed rate limiting in development
    rateLimit: isDevelopment ? {
      ...rateLimitConfig,
      api: { ...rateLimitConfig.api, maxRequests: 1000 },
      auth: { ...rateLimitConfig.auth, maxRequests: 100 }
    } : rateLimitConfig,

    // Enhanced logging in production
    enableSecurityLogging: isProduction,

    // HTTPS enforcement
    enforceHttps: isProduction,

    // Session security
    sessionConfig: {
      secure: isProduction, // HTTPS only in production
      httpOnly: true,
      sameSite: 'strict',
      maxAge: isProduction ? 3600000 : 86400000 // 1 hour prod, 24 hours dev
    }
  }
}

// Security event types for monitoring
export const securityEvents = {
  INVALID_INPUT: 'security_invalid_input',
  RATE_LIMIT_EXCEEDED: 'security_rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY: 'security_suspicious_activity',
  XSS_ATTEMPT: 'security_xss_attempt',
  CSRF_ATTEMPT: 'security_csrf_attempt',
  BRUTE_FORCE: 'security_brute_force',
  UNAUTHORIZED_ACCESS: 'security_unauthorized_access'
}

// Security monitoring functions
export const logSecurityEvent = (eventType, data = {}) => {
  const securityEvent = {
    timestamp: new Date().toISOString(),
    type: eventType,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    ...data
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.warn('🛡️ Security Event:', securityEvent)
  }

  // Send to analytics in production
  if (import.meta.env.PROD && window.gtag) {
    window.gtag('event', 'security_event', {
      event_category: 'Security',
      event_label: eventType,
      custom_data: JSON.stringify(data)
    })
  }

  // Send to external security service (placeholder)
  // In a real app, you'd send to a security monitoring service
  if (import.meta.env.PROD) {
    // fetch('/api/security/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(securityEvent)
    // }).catch(console.error)
  }
}