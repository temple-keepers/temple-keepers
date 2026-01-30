import { describe, it, expect, vi } from 'vitest'
import { FeatureDetector, AdaptiveLoader, OfflineManager } from '../lib/progressiveEnhancement'

// Mock DOM APIs
const mockCanvas = {
  toDataURL: vi.fn(() => 'data:image/webp;base64,test'),
  getContext: vi.fn(() => ({}))
}

const mockElement = {
  style: { grid: '', flexbox: '' },
  requestFullscreen: vi.fn(),
  webkitRequestFullscreen: vi.fn(),
  mozRequestFullScreen: vi.fn(),
  msRequestFullscreen: vi.fn()
}

global.document = {
  ...global.document,
  createElement: vi.fn((tag) => {
    if (tag === 'canvas') return mockCanvas
    if (tag === 'div') return mockElement
    return mockElement
  }),
  documentElement: mockElement,
  getElementById: vi.fn(),
  body: { appendChild: vi.fn(), classList: { toggle: vi.fn() } },
  dispatchEvent: vi.fn()
}

describe('FeatureDetector', () => {
  let detector

  beforeEach(() => {
    vi.clearAllMocks()
    detector = new FeatureDetector()
  })

  describe('detectCapabilities', () => {
    it('should detect basic web technologies', () => {
      const caps = detector.capabilities
      
      expect(caps).toHaveProperty('serviceWorker')
      expect(caps).toHaveProperty('webP')
      expect(caps).toHaveProperty('modernCSS')
      expect(caps).toHaveProperty('es6')
      expect(caps).toHaveProperty('webGL')
    })

    it('should detect storage capabilities', () => {
      const caps = detector.capabilities
      
      expect(caps).toHaveProperty('localStorage')
      expect(caps).toHaveProperty('indexedDB')
      expect(caps).toHaveProperty('cacheAPI')
    })

    it('should detect media capabilities', () => {
      const caps = detector.capabilities
      
      expect(caps).toHaveProperty('webRTC')
      expect(caps).toHaveProperty('mediaRecorder')
      expect(caps).toHaveProperty('fullscreen')
    })
  })

  describe('supportsWebP', () => {
    it('should return true for WebP support', () => {
      mockCanvas.toDataURL.mockReturnValue('data:image/webp;base64,test')
      const result = detector.supportsWebP()
      expect(result).toBe(true)
    })

    it('should return false for no WebP support', () => {
      mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,test')
      const result = detector.supportsWebP()
      expect(result).toBe(false)
    })
  })

  describe('supportsES6', () => {
    it('should return true for ES6 support', () => {
      const result = detector.supportsES6()
      expect(result).toBe(true) // Modern test environment supports ES6
    })
  })

  describe('supportsLocalStorage', () => {
    it('should return true when localStorage works', () => {
      const result = detector.supportsLocalStorage()
      expect(result).toBe(true)
    })

    it('should return false when localStorage throws', () => {
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage disabled')
      })
      
      const result = detector.supportsLocalStorage()
      expect(result).toBe(false)
      
      localStorage.setItem = originalSetItem
    })
  })

  describe('connection quality assessment', () => {
    it('should assess excellent connection', () => {
      global.navigator.connection = {
        effectiveType: '4g',
        downlink: 15,
        rtt: 50
      }
      
      detector.assessConnectionQuality()
      expect(detector.connectionQuality).toBe('excellent')
    })

    it('should assess poor connection', () => {
      global.navigator.connection = {
        effectiveType: '2g',
        downlink: 0.3,
        rtt: 2000
      }
      
      detector.assessConnectionQuality()
      expect(detector.connectionQuality).toBe('poor')
    })

    it('should handle missing connection API', () => {
      delete global.navigator.connection
      detector.capabilities.connectionAPI = false
      
      detector.assessConnectionQuality()
      // Should not throw and should handle gracefully
      expect(detector.connectionQuality).toBeTruthy()
    })
  })

  describe('device detection', () => {
    it('should detect slow device based on memory', () => {
      global.navigator.deviceMemory = 2
      const result = detector.isSlowDevice()
      expect(result).toBe(true)
    })

    it('should detect fast device based on memory', () => {
      global.navigator.deviceMemory = 8
      const result = detector.isSlowDevice()
      expect(result).toBe(false)
    })

    it('should fallback when device memory unavailable', () => {
      delete global.navigator.deviceMemory
      global.navigator.hardwareConcurrency = 2
      const result = detector.isSlowDevice()
      expect(result).toBe(true)
    })
  })

  describe('adaptive features', () => {
    it('should recommend high quality assets for excellent connection', () => {
      detector.connectionQuality = 'excellent'
      vi.spyOn(detector, 'isSlowDevice').mockReturnValue(false)
      
      const result = detector.shouldLoadHighQualityAssets()
      expect(result).toBe(true)
    })

    it('should not recommend high quality assets for slow device', () => {
      detector.connectionQuality = 'excellent'
      vi.spyOn(detector, 'isSlowDevice').mockReturnValue(true)
      
      const result = detector.shouldLoadHighQualityAssets()
      expect(result).toBe(false)
    })

    it('should adapt timeout based on connection quality', () => {
      detector.connectionQuality = 'excellent'
      expect(detector.adaptiveTimeout(1000)).toBe(1000)
      
      detector.connectionQuality = 'poor'
      expect(detector.adaptiveTimeout(1000)).toBe(4000)
      
      detector.connectionQuality = 'offline'
      expect(detector.adaptiveTimeout(1000)).toBe(10000)
    })

    it('should recommend video quality based on connection and device', () => {
      vi.spyOn(detector, 'isSlowDevice').mockReturnValue(false)
      
      detector.connectionQuality = 'excellent'
      expect(detector.getPreferredVideoQuality()).toBe('1080p')
      
      detector.connectionQuality = 'good'
      expect(detector.getPreferredVideoQuality()).toBe('720p')
      
      detector.connectionQuality = 'poor'
      expect(detector.getPreferredVideoQuality()).toBe('360p')
    })
  })
})

describe('AdaptiveLoader', () => {
  let detector, loader

  beforeEach(() => {
    detector = new FeatureDetector()
    loader = new AdaptiveLoader(detector)
  })

  describe('resource queuing', () => {
    it('should queue normal priority resources', () => {
      const resource = { type: 'script', url: '/test.js' }
      loader.queueResource(resource)
      
      expect(loader.loadQueue).toHaveLength(1)
      expect(loader.priorityQueue).toHaveLength(0)
    })

    it('should queue high priority resources separately', () => {
      const resource = { type: 'script', url: '/important.js' }
      loader.queueResource(resource, 'high')
      
      expect(loader.loadQueue).toHaveLength(0)
      expect(loader.priorityQueue).toHaveLength(1)
    })

    it('should process priority queue first', () => {
      const normalResource = { type: 'script', url: '/normal.js' }
      const highResource = { type: 'script', url: '/important.js' }
      
      loader.queueResource(normalResource)
      loader.queueResource(highResource, 'high')
      
      // Mock loadResource to track order
      const loadedUrls = []
      vi.spyOn(loader, 'loadResource').mockImplementation((resource) => {
        loadedUrls.push(resource.url)
        return Promise.resolve()
      })
      
      loader.processQueue()
      
      // High priority should be processed first
      expect(loadedUrls[0]).toBe('/important.js')
    })
  })

  describe('resource loading', () => {
    it('should handle unknown resource type', async () => {
      const resource = { type: 'unknown', url: '/test' }
      
      await expect(loader.loadResource(resource)).rejects.toThrow('Unknown resource type: unknown')
    })

    it('should load scripts', () => {
      const resource = { type: 'script', url: '/test.js' }
      
      // Mock createElement to return a script element
      const mockScript = {
        set src(value) { this._src = value },
        get src() { return this._src },
        set async(value) { this._async = value },
        get async() { return this._async },
        addEventListener: vi.fn(),
        onload: null,
        onerror: null
      }
      
      document.createElement = vi.fn(() => mockScript)
      document.head = { appendChild: vi.fn() }
      
      const promise = loader.loadScript(resource)
      
      expect(mockScript.src).toBe('/test.js')
      expect(mockScript.async).toBe(true)
      
      // Simulate successful load
      mockScript.onload()
      
      return expect(promise).resolves.toBeUndefined()
    })
  })
})

describe('OfflineManager', () => {
  let detector, manager

  beforeEach(() => {
    detector = new FeatureDetector()
    manager = new OfflineManager(detector)
    
    // Reset DOM mocks
    document.body.classList.toggle = vi.fn()
    document.getElementById = vi.fn()
  })

  describe('online/offline handling', () => {
    it('should handle going online', () => {
      vi.spyOn(manager, 'syncPendingData').mockImplementation(() => {})
      vi.spyOn(manager, 'updateOnlineStatus').mockImplementation(() => {})
      
      manager.handleOnline()
      
      expect(manager.isOnline).toBe(true)
      expect(manager.syncPendingData).toHaveBeenCalled()
      expect(manager.updateOnlineStatus).toHaveBeenCalledWith(true)
    })

    it('should handle going offline', () => {
      vi.spyOn(manager, 'cacheEssentialData').mockImplementation(() => {})
      vi.spyOn(manager, 'updateOnlineStatus').mockImplementation(() => {})
      
      manager.handleOffline()
      
      expect(manager.isOnline).toBe(false)
      expect(manager.cacheEssentialData).toHaveBeenCalled()
      expect(manager.updateOnlineStatus).toHaveBeenCalledWith(false)
    })

    it('should update UI for online status', () => {
      const mockIndicator = { style: { display: '' } }
      document.getElementById.mockReturnValue(mockIndicator)
      
      manager.updateOnlineStatus(true)
      
      expect(document.body.classList.toggle).toHaveBeenCalledWith('offline', false)
      expect(mockIndicator.style.display).toBe('none')
    })

    it('should update UI for offline status', () => {
      const mockIndicator = { style: { display: '' } }
      document.getElementById.mockReturnValue(mockIndicator)
      
      manager.updateOnlineStatus(false)
      
      expect(document.body.classList.toggle).toHaveBeenCalledWith('offline', true)
      expect(mockIndicator.style.display).toBe('block')
    })
  })

  describe('service worker management', () => {
    it('should skip setup if service worker not supported', async () => {
      detector.capabilities.serviceWorker = false
      
      await manager.setupServiceWorker()
      
      // Should not attempt to register
      expect(global.navigator.serviceWorker?.register).not.toHaveBeenCalled()
    })

    it('should register service worker when supported', async () => {
      detector.capabilities.serviceWorker = true
      global.navigator.serviceWorker = {
        register: vi.fn(() => Promise.resolve({ addEventListener: vi.fn() }))
      }
      
      await manager.setupServiceWorker()
      
      expect(global.navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js')
    })
  })

  describe('caching', () => {
    it('should skip caching if Cache API not supported', async () => {
      detector.capabilities.cacheAPI = false
      
      await manager.cacheEssentialData()
      
      // Should not attempt to cache
      expect(global.caches?.open).not.toHaveBeenCalled()
    })

    it('should cache essential data when supported', async () => {
      detector.capabilities.cacheAPI = true
      const mockCache = { addAll: vi.fn(() => Promise.resolve()) }
      global.caches = { open: vi.fn(() => Promise.resolve(mockCache)) }
      
      await manager.cacheEssentialData()
      
      expect(global.caches.open).toHaveBeenCalledWith('essential-v1')
      expect(mockCache.addAll).toHaveBeenCalledWith([
        '/',
        '/offline.html',
        '/assets/critical.css',
        '/assets/critical.js'
      ])
    })
  })
})