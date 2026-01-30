/**
 * Progressive Enhancement utilities
 * Ensures app works on all devices and connection speeds
 */

/**
 * Feature detection and progressive enhancement
 */
class FeatureDetector {
  constructor() {
    this.capabilities = this.detectCapabilities()
    this.connectionQuality = 'unknown'
    
    // Monitor connection quality
    this.monitorConnection()
  }

  detectCapabilities() {
    const caps = {
      // Core web technologies
      serviceWorker: 'serviceWorker' in navigator,
      webP: this.supportsWebP(),
      modernCSS: this.supportsModernCSS(),
      es6: this.supportsES6(),
      webGL: this.supportsWebGL(),
      
      // Storage capabilities
      localStorage: this.supportsLocalStorage(),
      indexedDB: this.supportsIndexedDB(),
      cacheAPI: 'caches' in window,
      
      // Network and performance APIs
      intersectionObserver: 'IntersectionObserver' in window,
      performanceObserver: 'PerformanceObserver' in window,
      requestIdleCallback: 'requestIdleCallback' in window,
      connectionAPI: 'connection' in navigator,
      
      // Media capabilities
      webRTC: this.supportsWebRTC(),
      mediaRecorder: 'MediaRecorder' in window,
      fullscreen: this.supportsFullscreen(),
      
      // Input capabilities
      touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      pointerEvents: 'PointerEvent' in window,
      vibration: 'vibrate' in navigator,
      
      // Device capabilities
      geolocation: 'geolocation' in navigator,
      deviceOrientation: 'DeviceOrientationEvent' in window,
      webAssembly: this.supportsWebAssembly(),
      
      // Modern APIs
      webShare: 'share' in navigator,
      clipboard: 'clipboard' in navigator,
      webNotifications: 'Notification' in window,
      wakelock: 'wakeLock' in navigator,
      
      // Payment API
      paymentRequest: 'PaymentRequest' in window,
      
      // Installation prompt
      pwaInstall: 'onbeforeinstallprompt' in window
    }
    
    return caps
  }

  supportsWebP() {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').includes('data:image/webp')
  }

  supportsModernCSS() {
    const element = document.createElement('div')
    return 'grid' in element.style && 'flexbox' in element.style
  }

  supportsES6() {
    try {
      new Function("(a = 0) => a")
      return true
    } catch (err) {
      return false
    }
  }

  supportsLocalStorage() {
    try {
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
      return true
    } catch (e) {
      return false
    }
  }

  supportsWebGL() {
    try {
      const canvas = document.createElement('canvas')
      return !!(window.WebGLRenderingContext && 
                canvas.getContext('webgl'))
    } catch (e) {
      return false
    }
  }

  supportsIndexedDB() {
    return 'indexedDB' in window
  }

  supportsWebRTC() {
    return 'RTCPeerConnection' in window || 
           'webkitRTCPeerConnection' in window || 
           'mozRTCPeerConnection' in window
  }

  supportsFullscreen() {
    const element = document.documentElement
    return !!(element.requestFullscreen || 
              element.webkitRequestFullscreen || 
              element.mozRequestFullScreen || 
              element.msRequestFullscreen)
  }

  supportsWebAssembly() {
    return 'WebAssembly' in window
  }

  monitorConnection() {
    // Initial connection assessment
    this.assessConnectionQuality()

    // Monitor connection changes
    if (this.capabilities.connectionAPI) {
      navigator.connection.addEventListener('change', () => {
        this.assessConnectionQuality()
      })
    }

    // Fallback: Monitor based on request timings
    this.startConnectionMonitoring()
  }

  assessConnectionQuality() {
    if (!this.capabilities.connectionAPI) return

    const connection = navigator.connection
    const effectiveType = connection.effectiveType
    const downlink = connection.downlink
    const rtt = connection.rtt

    // Categorize connection quality
    if (effectiveType === '4g' && downlink > 10) {
      this.connectionQuality = 'excellent'
    } else if (effectiveType === '4g' || downlink > 1.5) {
      this.connectionQuality = 'good'
    } else if (effectiveType === '3g' || downlink > 0.5) {
      this.connectionQuality = 'moderate'
    } else {
      this.connectionQuality = 'poor'
    }

    // Emit connection change event
    document.dispatchEvent(new CustomEvent('connectionchange', {
      detail: {
        quality: this.connectionQuality,
        effectiveType,
        downlink,
        rtt
      }
    }))
  }

  startConnectionMonitoring() {
    // Ping test for connection quality assessment
    setInterval(() => {
      this.performPingTest()
    }, 30000) // Check every 30 seconds
  }

  performPingTest() {
    const start = performance.now()
    
    fetch('/api/ping', { 
      method: 'HEAD',
      cache: 'no-cache'
    })
    .then(() => {
      const latency = performance.now() - start
      
      if (latency < 100) {
        this.connectionQuality = 'excellent'
      } else if (latency < 300) {
        this.connectionQuality = 'good'
      } else if (latency < 1000) {
        this.connectionQuality = 'moderate'
      } else {
        this.connectionQuality = 'poor'
      }
    })
    .catch(() => {
      this.connectionQuality = 'offline'
    })
  }

  getOptimalImageFormat() {
    if (this.capabilities.webP) return 'webp'
    return 'jpeg'
  }

  shouldLoadHighQualityAssets() {
    return this.connectionQuality === 'excellent' && 
           !this.isSlowDevice()
  }

  isSlowDevice() {
    // Check device memory (if available)
    if ('deviceMemory' in navigator) {
      return navigator.deviceMemory < 4
    }
    
    // Check hardware concurrency
    if ('hardwareConcurrency' in navigator) {
      return navigator.hardwareConcurrency < 4
    }
    
    // Fallback: assume medium-speed device
    return false
  }

  getPreferredVideoQuality() {
    const deviceFactor = this.isSlowDevice() ? 0.5 : 1
    
    switch (this.connectionQuality) {
      case 'excellent':
        return `${Math.floor(1080 * deviceFactor)}p`
      case 'good':
        return `${Math.floor(720 * deviceFactor)}p`
      case 'moderate':
        return `${Math.floor(480 * deviceFactor)}p`
      default:
        return '360p'
    }
  }

  adaptiveTimeout(baseTimeout = 5000) {
    const multiplier = {
      'excellent': 1,
      'good': 1.5,
      'moderate': 2.5,
      'poor': 4,
      'offline': 10
    }
    
    return baseTimeout * (multiplier[this.connectionQuality] || 2)
  }

  shouldEnableAdvancedFeatures() {
    return !this.isSlowDevice() && 
           this.connectionQuality !== 'poor' &&
           this.capabilities.es6 &&
           this.capabilities.serviceWorker
  }
}

/**
 * Adaptive loading strategies
 */
class AdaptiveLoader {
  constructor(detector) {
    this.detector = detector
    this.loadQueue = []
    this.priorityQueue = []
    this.isLoading = false
  }

  queueResource(resource, priority = 'normal') {
    const resourceObj = {
      ...resource,
      priority,
      timestamp: Date.now()
    }
    
    if (priority === 'high') {
      this.priorityQueue.push(resourceObj)
    } else {
      this.loadQueue.push(resourceObj)
    }
    
    this.processQueue()
  }

  processQueue() {
    if (this.isLoading) return
    
    const queue = this.priorityQueue.length > 0 ? 
                  this.priorityQueue : this.loadQueue
    
    if (queue.length === 0) return
    
    this.isLoading = true
    const resource = queue.shift()
    
    this.loadResource(resource).finally(() => {
      this.isLoading = false
      this.processQueue()
    })
  }

  async loadResource(resource) {
    try {
      switch (resource.type) {
        case 'script':
          return this.loadScript(resource)
        case 'style':
          return this.loadStyle(resource)
        case 'image':
          return this.loadImage(resource)
        case 'module':
          return this.loadModule(resource)
        default:
          throw new Error(`Unknown resource type: ${resource.type}`)
      }
    } catch (error) {
      console.error('Failed to load resource:', resource, error)
      throw error
    }
  }

  loadScript(resource) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = resource.url
      script.async = true
      
      if (resource.integrity) {
        script.integrity = resource.integrity
        script.crossOrigin = 'anonymous'
      }
      
      script.onload = resolve
      script.onerror = reject
      
      document.head.appendChild(script)
    })
  }

  loadStyle(resource) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = resource.url
      
      if (resource.media) {
        link.media = resource.media
      }
      
      link.onload = resolve
      link.onerror = reject
      
      document.head.appendChild(link)
    })
  }

  loadImage(resource) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => resolve(img)
      img.onerror = reject
      
      // Use appropriate format based on browser support
      const format = this.detector.getOptimalImageFormat()
      img.src = resource.url.replace(/\.(jpg|jpeg|png)$/i, `.${format}`)
    })
  }

  async loadModule(resource) {
    return import(resource.url)
  }

  preloadCriticalResources() {
    // Preload based on connection quality and device capabilities
    if (this.detector.shouldLoadHighQualityAssets()) {
      this.queueResource({
        type: 'style',
        url: '/assets/critical.css',
        priority: 'high'
      })
      
      this.queueResource({
        type: 'script',
        url: '/assets/critical.js',
        priority: 'high'
      })
    }
  }
}

/**
 * Offline functionality manager
 */
class OfflineManager {
  constructor(detector) {
    this.detector = detector
    this.isOnline = navigator.onLine
    this.setupEventListeners()
    this.setupServiceWorker()
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.handleOnline()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
      this.handleOffline()
    })
  }

  async setupServiceWorker() {
    if (!this.detector.capabilities.serviceWorker) return
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('ServiceWorker registered:', registration)
      
      // Listen for SW updates
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing
        
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Show update available notification
              this.showUpdateAvailable()
            }
          }
        })
      })
    } catch (error) {
      console.error('ServiceWorker registration failed:', error)
    }
  }

  handleOnline() {
    document.dispatchEvent(new CustomEvent('appOnline'))
    
    // Sync pending data
    this.syncPendingData()
    
    // Update UI
    this.updateOnlineStatus(true)
  }

  handleOffline() {
    document.dispatchEvent(new CustomEvent('appOffline'))
    
    // Update UI
    this.updateOnlineStatus(false)
    
    // Cache critical data
    this.cacheEssentialData()
  }

  updateOnlineStatus(isOnline) {
    document.body.classList.toggle('offline', !isOnline)
    
    // Show/hide offline indicator
    const indicator = document.getElementById('offline-indicator')
    if (indicator) {
      indicator.style.display = isOnline ? 'none' : 'block'
    }
  }

  async syncPendingData() {
    // Implement data synchronization logic
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register('background-sync')
      } catch (error) {
        console.error('Background sync registration failed:', error)
      }
    }
  }

  async cacheEssentialData() {
    if (!this.detector.capabilities.cacheAPI) return
    
    try {
      const cache = await caches.open('essential-v1')
      const essentialUrls = [
        '/',
        '/offline.html',
        '/assets/critical.css',
        '/assets/critical.js'
      ]
      
      await cache.addAll(essentialUrls)
    } catch (error) {
      console.error('Failed to cache essential data:', error)
    }
  }

  showUpdateAvailable() {
    // Show update notification to user
    const updateBanner = document.createElement('div')
    updateBanner.className = 'update-banner'
    updateBanner.innerHTML = `
      <p>A new version is available!</p>
      <button onclick="location.reload()">Update</button>
      <button onclick="this.parentElement.remove()">Later</button>
    `
    
    document.body.appendChild(updateBanner)
  }
}

// Initialize progressive enhancement
const featureDetector = new FeatureDetector()
const adaptiveLoader = new AdaptiveLoader(featureDetector)
const offlineManager = new OfflineManager(featureDetector)

// Export for use in other modules
export { 
  FeatureDetector, 
  AdaptiveLoader, 
  OfflineManager,
  featureDetector,
  adaptiveLoader,
  offlineManager
}