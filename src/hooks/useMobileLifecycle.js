import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { isIOS, isAndroid, isPWA } from '../lib/mobileOptimizations'

/**
 * Hook for mobile-specific app lifecycle management
 */
export const useMobileLifecycle = () => {
  const [isAppActive, setIsAppActive] = useState(!document.hidden)
  const [isMobile] = useState(() => /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent))
  const [platform] = useState(() => {
    if (isIOS()) return 'ios'
    if (isAndroid()) return 'android'
    return 'desktop'
  })

  useEffect(() => {
    if (!isMobile) return

    let backgroundTime = null
    let sessionValidationTimeout = null

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // App went to background
        backgroundTime = Date.now()
        setIsAppActive(false)
        console.log('📱 App backgrounded')

        // Cancel pending operations
        if (sessionValidationTimeout) {
          clearTimeout(sessionValidationTimeout)
        }
      } else {
        // App came back to foreground
        setIsAppActive(true)
        const timeInBackground = backgroundTime ? Date.now() - backgroundTime : 0
        console.log(`📱 App foregrounded (was in background for ${Math.round(timeInBackground / 1000)}s)`)

        // If app was in background for more than 5 minutes, let session monitor handle validation
        if (timeInBackground > 5 * 60 * 1000) {
          console.log('⏰ App was backgrounded for long time - session monitor will validate')
        }

        backgroundTime = null
      }
    }

    // Handle iOS-specific events
    const handlePageShow = (e) => {
      if (e.persisted) {
        // Page was loaded from cache (back-forward cache)
        console.log('📱 Page restored from cache')
        handleVisibilityChange()
      }
    }

    const handleFocus = () => {
      if (!document.hidden) {
        handleVisibilityChange()
      }
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    if (platform === 'ios') {
      window.addEventListener('pageshow', handlePageShow)
    }

    // Initial check
    handleVisibilityChange()

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      if (platform === 'ios') {
        window.removeEventListener('pageshow', handlePageShow)
      }
      if (sessionValidationTimeout) {
        clearTimeout(sessionValidationTimeout)
      }
    }
  }, [isMobile, platform])

  return {
    isAppActive,
    isMobile,
    platform,
    isPWA: isPWA()
  }
}
