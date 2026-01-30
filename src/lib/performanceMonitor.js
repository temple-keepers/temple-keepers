/**
 * Performance monitoring and metrics collection system
 * Tracks key performance indicators and user experience metrics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observers = new Map()
    this.isEnabled = process.env.NODE_ENV === 'development' // Only enable in development
    this.batchQueue = []
    this.batchSize = 5 // Reduced batch size
    this.flushInterval = 60000 // Increased to 60 seconds
    this.lastEventTime = {}
    
    if (this.isEnabled) {
      this.init()
    }
  }

  init() {
    if (!this.isEnabled) return

    // Start batch flush timer
    setInterval(() => this.flushBatch(), this.flushInterval)

    // Only monitor essential metrics in development
    this.observeCoreWebVitals()
    
    // Skip intensive monitoring in production
    if (process.env.NODE_ENV === 'development') {
      this.observeNavigation()
      this.observeResources()
      this.observeLongTasks()
      this.observeMemory()
    }

    // Keep user interactions minimal
    this.observeUserInteractions()
  }

  /**
   * Core Web Vitals monitoring
   */
  observeCoreWebVitals() {
    try {
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          
          this.recordMetric('core_web_vitals', {
            metric: 'lcp',
            value: lastEntry.startTime,
            rating: this.getRating('lcp', lastEntry.startTime),
            timestamp: Date.now()
          })
        })
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.set('lcp', lcpObserver)

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            this.recordMetric('core_web_vitals', {
              metric: 'fid',
              value: entry.processingStart - entry.startTime,
              rating: this.getRating('fid', entry.processingStart - entry.startTime),
              timestamp: Date.now()
            })
          })
        })
        
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.set('fid', fidObserver)

        // Cumulative Layout Shift (CLS)
        let clsScore = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value
            }
          })
          
          this.recordMetric('core_web_vitals', {
            metric: 'cls',
            value: clsScore,
            rating: this.getRating('cls', clsScore),
            timestamp: Date.now()
          })
        })
        
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.set('cls', clsObserver)
      }
    } catch (error) {
      console.warn('Core Web Vitals monitoring failed:', error)
    }
  }

  /**
   * Navigation timing monitoring
   */
  observeNavigation() {
    try {
      if ('PerformanceObserver' in window) {
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            this.recordMetric('navigation', {
              loadTime: entry.loadEventEnd - entry.loadEventStart,
              domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
              firstPaint: this.getFirstPaint(),
              firstContentfulPaint: this.getFirstContentfulPaint(),
              ttfb: entry.responseStart - entry.requestStart,
              timestamp: Date.now(),
              url: entry.name
            })
          })
        })
        
        navObserver.observe({ entryTypes: ['navigation'] })
        this.observers.set('navigation', navObserver)
      }
    } catch (error) {
      console.warn('Navigation timing monitoring failed:', error)
    }
  }

  /**
   * Resource loading monitoring
   */
  observeResources() {
    try {
      if ('PerformanceObserver' in window) {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            // Only track slow resources or errors
            if (entry.duration > 1000 || entry.transferSize === 0) {
              this.recordMetric('resource_performance', {
                name: entry.name,
                type: entry.initiatorType,
                duration: entry.duration,
                size: entry.transferSize,
                rating: entry.duration > 3000 ? 'poor' : entry.duration > 1500 ? 'needs-improvement' : 'good',
                timestamp: Date.now()
              })
            }
          })
        })
        
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.set('resources', resourceObserver)
      }
    } catch (error) {
      console.warn('Resource monitoring failed:', error)
    }
  }

  /**
   * Long tasks monitoring
   */
  observeLongTasks() {
    try {
      if ('PerformanceObserver' in window) {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            this.recordMetric('long_task', {
              duration: entry.duration,
              startTime: entry.startTime,
              attribution: entry.attribution?.[0]?.name || 'unknown',
              timestamp: Date.now()
            })
          })
        })
        
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.set('longtask', longTaskObserver)
      }
    } catch (error) {
      console.warn('Long task monitoring failed:', error)
    }
  }

  /**
   * Memory usage monitoring
   */
  observeMemory() {
    try {
      if ('memory' in performance) {
        setInterval(() => {
          this.recordMetric('memory_usage', {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
            utilization: (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100,
            timestamp: Date.now()
          })
        }, 60000) // Every minute
      }
    } catch (error) {
      console.warn('Memory monitoring failed:', error)
    }
  }

  /**
   * Custom user interaction monitoring
   */
  observeUserInteractions() {
    const trackingEvents = ['click', 'input', 'scroll', 'keydown']
    
    trackingEvents.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        // Throttle events to avoid spam
        if (this.shouldThrottleEvent(eventType)) return

        const target = event.target
        const interaction = {
          type: eventType,
          element: target.tagName?.toLowerCase() || 'unknown',
          className: target.className || '',
          id: target.id || '',
          timestamp: Date.now()
        }

        // Add specific data based on event type
        if (eventType === 'click') {
          interaction.position = { x: event.clientX, y: event.clientY }
        } else if (eventType === 'scroll') {
          interaction.scrollTop = window.pageYOffset
          interaction.scrollHeight = document.documentElement.scrollHeight
        }

        this.recordMetric('user_interaction', interaction)
      }, { passive: true })
    })
  }

  /**
   * Record a performance metric
   */
  recordMetric(category, data) {
    if (!this.isEnabled) return

    const metric = {
      category,
      data,
      timestamp: data.timestamp || Date.now(),
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo()
    }

    // Add to batch queue
    this.batchQueue.push(metric)

    // Store in local metrics map for immediate access
    if (!this.metrics.has(category)) {
      this.metrics.set(category, [])
    }
    this.metrics.get(category).push(metric)

    // Keep only recent metrics to prevent memory issues
    const categoryMetrics = this.metrics.get(category)
    if (categoryMetrics.length > 100) {
      categoryMetrics.splice(0, 50) // Keep only last 50
    }

    // Auto-flush if batch is full
    if (this.batchQueue.length >= this.batchSize) {
      this.flushBatch()
    }
  }

  /**
   * Custom metric recording for application-specific metrics
   */
  recordCustomMetric(name, value, metadata = {}) {
    this.recordMetric('custom', {
      name,
      value,
      metadata,
      timestamp: Date.now()
    })
  }

  /**
   * Time a function execution
   */
  timeFunction(name, fn) {
    const start = performance.now()
    
    const result = fn()
    
    // Handle async functions
    if (result && typeof result.then === 'function') {
      return result.then((asyncResult) => {
        const end = performance.now()
        this.recordCustomMetric(`function_time_${name}`, end - start, {
          type: 'async'
        })
        return asyncResult
      })
    } else {
      const end = performance.now()
      this.recordCustomMetric(`function_time_${name}`, end - start, {
        type: 'sync'
      })
      return result
    }
  }

  // Legacy methods for backward compatibility
  start(label) {
    if (!this.isEnabled) return
    this.startTimes = this.startTimes || new Map()
    this.startTimes.set(label, {
      startTime: performance.now(),
      startMemory: performance.memory?.usedJSHeapSize || 0
    })
  }

  end(label, options = {}) {
    if (!this.isEnabled) return
    this.startTimes = this.startTimes || new Map()
    
    const metric = this.startTimes.get(label)
    if (!metric) {
      console.warn('No start metric found for:', label)
      return
    }

    const duration = performance.now() - metric.startTime
    const memoryDelta = (performance.memory?.usedJSHeapSize || 0) - metric.startMemory

    const result = {
      label,
      duration: Math.round(duration * 100) / 100,
      memory: Math.round(memoryDelta / 1024), // KB
      timestamp: Date.now()
    }

    // Record as custom metric
    this.recordCustomMetric(`legacy_${label}`, duration, { memory: memoryDelta })

    // Log if duration exceeds threshold
    const threshold = options.threshold || 1000 // 1 second default
    if (duration > threshold) {
      console.warn(`⚠️ Slow operation: ${label} took ${result.duration}ms`)
    } else if (options.verbose) {
      console.log(`⏱️ ${label}: ${result.duration}ms`)
    }

    this.startTimes.delete(label)
    return result
  }

  async measure(label, fn) {
    this.start(label)
    try {
      const result = await fn()
      this.end(label)
      return result
    } catch (error) {
      this.end(label)
      throw error
    }
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const summary = {
      timestamp: Date.now(),
      metrics: {}
    }

    for (const [category, metrics] of this.metrics) {
      if (metrics.length > 0) {
        const recent = metrics.slice(-10) // Last 10 metrics
        
        if (category === 'core_web_vitals') {
          const cwv = {}
          recent.forEach(metric => {
            cwv[metric.data.metric] = {
              value: metric.data.value,
              rating: metric.data.rating
            }
          })
          summary.metrics[category] = cwv
        } else if (category === 'custom') {
          const customMetrics = {}
          recent.forEach(metric => {
            if (metric.data.name.startsWith('function_time_')) {
              const functionName = metric.data.name.replace('function_time_', '')
              if (!customMetrics.functionTimes) customMetrics.functionTimes = {}
              customMetrics.functionTimes[functionName] = {
                avgTime: metric.data.value,
                type: metric.data.metadata.type
              }
            }
          })
          summary.metrics[category] = customMetrics
        } else {
          summary.metrics[category] = {
            count: metrics.length,
            recent: recent.length
          }
        }
      }
    }

    return summary
  }

  getCoreWebVitals() {
    return new Promise((resolve) => {
      const vitals = {}
      const metrics = this.metrics.get('core_web_vitals') || []
      
      metrics.forEach(metric => {
        vitals[metric.data.metric.toUpperCase()] = {
          value: metric.data.value,
          rating: metric.data.rating
        }
      })

      // Fallback for older browsers
      const navigation = performance.getEntriesByType('navigation')[0]
      if (navigation && !vitals.TTFB) {
        vitals.TTFB = {
          value: Math.round(navigation.responseStart),
          rating: navigation.responseStart > 600 ? 'poor' : navigation.responseStart > 200 ? 'needs-improvement' : 'good'
        }
        vitals.DOMContentLoaded = Math.round(navigation.domContentLoadedEventEnd)
        vitals.Load = Math.round(navigation.loadEventEnd)
      }

      resolve(vitals)
    })
  }

  logPageLoad() {
    if (!window.performance) return

    const navigation = performance.getEntriesByType('navigation')[0]
    if (!navigation) return

    console.log('📊 Page Load Performance:', {
      'DNS Lookup': `${Math.round(navigation.domainLookupEnd - navigation.domainLookupStart)}ms`,
      'TCP Connection': `${Math.round(navigation.connectEnd - navigation.connectStart)}ms`,
      'Server Response': `${Math.round(navigation.responseEnd - navigation.requestStart)}ms`,
      'DOM Processing': `${Math.round(navigation.domComplete - navigation.domLoading)}ms`,
      'Total Load': `${Math.round(navigation.loadEventEnd - navigation.fetchStart)}ms`
    })
  }

  monitorAPI(url, duration, status) {
    const isSlowAPI = duration > 2000
    const isError = status >= 400

    // Record API performance metric
    this.recordMetric('api_performance', {
      url,
      duration,
      status,
      isSlow: isSlowAPI,
      isError: isError,
      timestamp: Date.now()
    })

    if (isSlowAPI || isError) {
      console.warn(`🌐 API Performance:`, {
        url,
        duration: `${duration}ms`,
        status,
        warning: isSlowAPI ? 'Slow response' : 'Error response'
      })
    }
  }

  getMemoryUsage() {
    if (!performance.memory) return null

    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) // MB
    }
  }

  /**
   * Flush metrics batch
   */
  flushBatch() {
    if (this.batchQueue.length === 0) return

    const batch = [...this.batchQueue]
    this.batchQueue = []

    // In development, log metrics
    if (process.env.NODE_ENV === 'development') {
      console.group('📊 Performance Metrics Batch')
      console.table(batch.map(metric => ({
        category: metric.category,
        data: JSON.stringify(metric.data).substring(0, 100) + '...',
        timestamp: new Date(metric.timestamp).toLocaleTimeString()
      })))
      console.groupEnd()
    }

    // Here you would typically send to analytics service:
    // analytics.send(batch)
  }

  /**
   * Helper functions
   */
  getRating(metric, value) {
    const thresholds = {
      lcp: { good: 2500, needsImprovement: 4000 },
      fid: { good: 100, needsImprovement: 300 },
      cls: { good: 0.1, needsImprovement: 0.25 }
    }

    const threshold = thresholds[metric]
    if (!threshold) return 'unknown'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint')
    const fp = paintEntries.find(entry => entry.name === 'first-paint')
    return fp ? fp.startTime : null
  }

  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint')
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return fcp ? fcp.startTime : null
  }

  getConnectionInfo() {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      }
    }
    return null
  }

  shouldThrottleEvent(eventType) {
    const now = Date.now()
    const lastTime = this.lastEventTime?.[eventType] || 0
    const throttleDelay = {
      scroll: 100,
      mousemove: 100,
      resize: 200,
      input: 300
    }

    if (now - lastTime < (throttleDelay[eventType] || 0)) {
      return true
    }

    if (!this.lastEventTime) this.lastEventTime = {}
    this.lastEventTime[eventType] = now
    return false
  }

  /**
   * Clean up observers
   */
  destroy() {
    this.observers.forEach((observer) => {
      observer.disconnect()
    })
    this.observers.clear()
    this.metrics.clear()
    this.isEnabled = false
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Export individual functions
export const recordMetric = (category, data) => performanceMonitor.recordMetric(category, data)
export const recordCustomMetric = (name, value, metadata) => performanceMonitor.recordCustomMetric(name, value, metadata)
export const timeFunction = (name, fn) => performanceMonitor.timeFunction(name, fn)
export const getPerformanceSummary = () => performanceMonitor.getSummary()

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    recordCustomMetric: performanceMonitor.recordCustomMetric.bind(performanceMonitor),
    timeFunction: performanceMonitor.timeFunction.bind(performanceMonitor),
    getSummary: performanceMonitor.getSummary.bind(performanceMonitor),
    // Legacy methods
    start: performanceMonitor.start.bind(performanceMonitor),
    end: performanceMonitor.end.bind(performanceMonitor),
    measure: performanceMonitor.measure.bind(performanceMonitor)
  }
}

// Log page load when DOM is ready
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => performanceMonitor.logPageLoad(), 100)
  })
}

export default performanceMonitor
