/**
 * Performance optimization configuration
 * Centralized settings to improve app load times
 */

// Supabase performance optimizations
export const supabasePerformanceConfig = {
  auth: {
    // Reduce lock timeout to prevent long waits
    lockTimeout: 3000, // 3 seconds instead of default 10
    
    // Optimize token refresh
    tokenRefreshMargin: 60, // 60 seconds before expiry (default 10)
    
    // Reduce debug output in production
    enableDebug: process.env.NODE_ENV === 'development'
  },
  
  realtime: {
    // Reduce realtime events for better performance
    eventsPerSecond: 5,
    
    // Disable in production for most users
    enabled: process.env.NODE_ENV === 'development'
  }
}

// Performance monitoring configuration
export const monitoringConfig = {
  // Only enable full monitoring in development
  enabledInProduction: false,
  
  // Batch settings for reduced overhead
  batchSize: 5,
  flushInterval: 60000, // 1 minute
  
  // Core Web Vitals only in production
  productionMetrics: ['lcp', 'fid', 'cls'],
  
  // Full monitoring in development
  developmentMetrics: ['lcp', 'fid', 'cls', 'navigation', 'resources', 'memory']
}

// Auth validation settings
export const authConfig = {
  // Reduce session validation frequency
  sessionCheckInterval: {
    desktop: 5 * 60 * 1000,    // 5 minutes
    mobile: 3 * 60 * 1000      // 3 minutes
  },
  
  // Auth timeout settings
  initTimeout: 4000, // 4 seconds instead of 8
  
  // Retry configuration
  retryConfig: {
    maxRetries: 1,
    delayMs: 250
  }
}

export default {
  supabase: supabasePerformanceConfig,
  monitoring: monitoringConfig,
  auth: authConfig
}