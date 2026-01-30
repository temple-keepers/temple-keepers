// Network quality detection
export const getConnectionQuality = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  
  if (!connection) {
    return 'unknown'
  }
  
  const { effectiveType, downlink, rtt, saveData } = connection
  
  if (saveData) return 'slow'
  
  // Use multiple indicators for better detection
  if (rtt > 2000 || downlink < 0.5) return 'slow'
  if (rtt > 1000 || downlink < 1.5) return 'moderate'
  if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow'
  if (effectiveType === '3g') return 'moderate'
  
  return 'fast'
}

// Smart retry with connection-aware delays
export const getSmartRetryDelay = (attempt, connectionQuality = 'unknown') => {
  const baseDelay = 1000
  const multipliers = {
    fast: 1,
    moderate: 1.5,
    slow: 2,
    unknown: 1.2
  }
  
  return baseDelay * Math.pow(2, attempt) * (multipliers[connectionQuality] || 1)
}

// API retry logic with exponential backoff
export const withRetry = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    delayMs = null, // Will use smart delay if null
    backoff = 2,
    onRetry = null,
    respectConnection = true
  } = options

  let lastError
  const connectionQuality = respectConnection ? getConnectionQuality() : 'unknown'
  
  // Reduce retries on slow connections to avoid long waits
  const adjustedMaxRetries = connectionQuality === 'slow' ? Math.max(1, maxRetries - 1) : maxRetries
  
  for (let attempt = 0; attempt <= adjustedMaxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error
      }
      
      // Don't retry on auth errors
      if (error.message?.includes('JWT') || error.message?.includes('auth')) {
        throw error
      }
      
      // Don't retry on network errors if offline
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your connection and try again.')
      }
      
      if (attempt < adjustedMaxRetries) {
        const delay = delayMs || getSmartRetryDelay(attempt, connectionQuality)
        console.log(`Retry attempt ${attempt + 1}/${adjustedMaxRetries} after ${delay}ms (connection: ${connectionQuality})`)
        
        if (onRetry) {
          onRetry(attempt + 1, delay, error)
        }
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

// Debounce function calls
export const debounce = (fn, ms = 300) => {
  let timeoutId
  return function(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  }
}

// Request deduplication cache
const requestCache = new Map()

export const withDeduplication = async (key, fn, ttl = 5000) => {
  const now = Date.now()
  
  // Check if request is in flight or cached
  if (requestCache.has(key)) {
    const cached = requestCache.get(key)
    
    // If request is a promise (in flight), return it
    if (cached instanceof Promise) {
      return cached
    }
    
    // If cached result is still fresh, return it
    if (now - cached.timestamp < ttl) {
      return cached.data
    }
  }
  
  // Create new request
  const promise = fn()
  requestCache.set(key, promise)
  
  try {
    const data = await promise
    // Cache the result
    requestCache.set(key, { data, timestamp: now })
    return data
  } catch (error) {
    // Remove failed request from cache
    requestCache.delete(key)
    throw error
  }
}

// Clear cache for a specific key or all keys
export const clearCache = (key = null) => {
  if (key) {
    requestCache.delete(key)
  } else {
    requestCache.clear()
  }
}

// Network status monitoring
let isOnline = navigator.onLine
let onlineListeners = []

window.addEventListener('online', () => {
  isOnline = true
  onlineListeners.forEach(fn => fn(true))
})

window.addEventListener('offline', () => {
  isOnline = false
  onlineListeners.forEach(fn => fn(false))
})

export const getNetworkStatus = () => isOnline

export const onNetworkChange = (callback) => {
  onlineListeners.push(callback)
  return () => {
    onlineListeners = onlineListeners.filter(fn => fn !== callback)
  }
}

// Safe JSON parse
export const safeJsonParse = (str, fallback = null) => {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

// Batch multiple requests
export const batchRequests = async (requests, { concurrency = 5 } = {}) => {
  const results = []
  const queue = [...requests]
  
  const executeNext = async () => {
    if (queue.length === 0) return
    
    const request = queue.shift()
    try {
      const result = await request()
      results.push({ success: true, data: result })
    } catch (error) {
      results.push({ success: false, error })
    }
    
    await executeNext()
  }
  
  // Start concurrent requests
  await Promise.all(
    Array(Math.min(concurrency, requests.length))
      .fill(null)
      .map(() => executeNext())
  )
  
  return results
}
