/**
 * Mobile-specific utilities and fixes
 */

// Detect iOS
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

// Detect Android
export const isAndroid = () => {
  return /Android/.test(navigator.userAgent)
}

// Detect if running as PWA
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true
}

// Fix iOS viewport height issues (100vh problem)
export const fixIOSViewportHeight = () => {
  if (!isIOS()) return

  const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }

  setViewportHeight()
  window.addEventListener('resize', setViewportHeight)
  window.addEventListener('orientationchange', () => {
    setTimeout(setViewportHeight, 100)
  })
}

// Prevent iOS bounce/overscroll
export const preventIOSBounce = () => {
  if (!isIOS()) return

  document.body.addEventListener('touchmove', (e) => {
    if (e.target === document.body) {
      e.preventDefault()
    }
  }, { passive: false })
}

// Fix iOS input zoom
export const preventIOSInputZoom = () => {
  if (!isIOS()) return

  const viewportMeta = document.querySelector('meta[name="viewport"]')
  if (viewportMeta) {
    const content = viewportMeta.getAttribute('content')
    if (!content.includes('maximum-scale')) {
      viewportMeta.setAttribute('content', content + ', maximum-scale=1.0')
    }
  }
}

// Handle app lifecycle (visibility changes)
export const onAppVisibilityChange = (callback) => {
  const handleVisibilityChange = () => {
    callback(document.hidden)
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // iOS-specific events
  if (isIOS()) {
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        callback(false) // App came back from cache
      }
    })
    window.addEventListener('pagehide', () => callback(true))
  }

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}

// Detect low memory situations
export const detectLowMemory = () => {
  if (!performance.memory) return false

  const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory
  const memoryUsagePercent = (usedJSHeapSize / jsHeapSizeLimit) * 100

  return memoryUsagePercent > 90
}

// Clear memory-heavy items when low on memory
export const handleLowMemory = () => {
  if (!detectLowMemory()) return

  console.warn('⚠️ Low memory detected - clearing caches')

  // Clear image caches
  const images = document.querySelectorAll('img')
  images.forEach(img => {
    if (!img.getBoundingClientRect().top < window.innerHeight) {
      img.src = '' // Unload off-screen images
    }
  })

  // Clear request cache
  if (window.caches) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('images') || name.includes('fonts')) {
          caches.delete(name)
        }
      })
    })
  }
}

// Improved touch event handling
export const addTouchFeedback = (element) => {
  if (!element) return

  let touchStartTime = 0
  let touchMoved = false

  element.addEventListener('touchstart', () => {
    touchStartTime = Date.now()
    touchMoved = false
    element.style.opacity = '0.7'
  }, { passive: true })

  element.addEventListener('touchmove', () => {
    touchMoved = true
  }, { passive: true })

  element.addEventListener('touchend', () => {
    element.style.opacity = '1'
    
    // If touch was very quick and didn't move, it's a tap
    if (!touchMoved && Date.now() - touchStartTime < 200) {
      element.dispatchEvent(new Event('tap'))
    }
  }, { passive: true })

  element.addEventListener('touchcancel', () => {
    element.style.opacity = '1'
  }, { passive: true })
}

// Debounced scroll handler for mobile
export const addMobileScrollHandler = (callback, delay = 150) => {
  let timeout
  let isScrolling = false

  const scrollHandler = () => {
    if (!isScrolling) {
      isScrolling = true
      document.body.classList.add('is-scrolling')
    }

    clearTimeout(timeout)
    timeout = setTimeout(() => {
      isScrolling = false
      document.body.classList.remove('is-scrolling')
      callback()
    }, delay)
  }

  window.addEventListener('scroll', scrollHandler, { passive: true })

  return () => {
    clearTimeout(timeout)
    window.removeEventListener('scroll', scrollHandler)
  }
}

// Handle safe area insets (notch, etc.)
export const applySafeAreaInsets = () => {
  const root = document.documentElement

  // iOS safe area support
  if (isIOS() && isPWA()) {
    root.style.paddingTop = 'env(safe-area-inset-top)'
    root.style.paddingBottom = 'env(safe-area-inset-bottom)'
    root.style.paddingLeft = 'env(safe-area-inset-left)'
    root.style.paddingRight = 'env(safe-area-inset-right)'
  }
}

// Optimize animations for mobile
export const optimizeAnimationsForMobile = () => {
  // Reduce motion if user prefers
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduce-motion')
  }

  // Disable complex animations on low-end devices
  if (navigator.hardwareConcurrency <= 4) {
    document.documentElement.classList.add('low-performance')
  }
}

// Network quality detection
export const getNetworkQuality = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

  if (!connection) return 'unknown'

  const effectiveType = connection.effectiveType
  const saveData = connection.saveData

  if (saveData) return 'save-data'
  
  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return 'poor'
    case '3g':
      return 'moderate'
    case '4g':
      return 'good'
    default:
      return 'unknown'
  }
}

// Adaptive loading based on network
export const shouldLoadHeavyContent = () => {
  const quality = getNetworkQuality()
  return quality === 'good' || quality === 'unknown'
}

// Initialize all mobile optimizations
export const initMobileOptimizations = () => {
  console.log('🔧 Initializing mobile optimizations')

  fixIOSViewportHeight()
  preventIOSBounce()
  applySafeAreaInsets()
  optimizeAnimationsForMobile()

  // Monitor memory (less frequently to avoid performance impact)
  if (performance.memory) {
    setInterval(() => {
      if (detectLowMemory()) {
        handleLowMemory()
      }
    }, 60000) // Check every 60 seconds instead of 30
  }

  // Handle app visibility
  onAppVisibilityChange((hidden) => {
    if (hidden) {
      console.log('📱 App backgrounded')
      // Pause heavy operations
    } else {
      console.log('📱 App foregrounded')
      // Resume operations
      // Re-validate session
      window.dispatchEvent(new Event('app-foreground'))
    }
  })

  console.log('✅ Mobile optimizations initialized')
}
