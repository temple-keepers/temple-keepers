import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook to monitor session health and detect anomalies
 */
export const useSessionMonitor = (user) => {
  const [sessionHealth, setSessionHealth] = useState({
    isValid: true,
    lastCheck: Date.now(),
    warningCount: 0
  })
  const lastUserIdRef = useRef(null)
  const checkIntervalRef = useRef(null)

  useEffect(() => {
    if (!user) {
      lastUserIdRef.current = null
      setSessionHealth({
        isValid: true,
        lastCheck: Date.now(),
        warningCount: 0
      })
      return
    }

    // Detect user ID changes (security issue)
    if (lastUserIdRef.current && lastUserIdRef.current !== user.id) {
      console.error('🚨 SECURITY: User ID changed without sign-out!', {
        previous: lastUserIdRef.current,
        current: user.id
      })
      
      // Add small delay to prevent race conditions with auth state changes
      setTimeout(async () => {
        try {
          await supabase.auth.signOut()
        } catch (e) {
          // Force cleanup if signOut fails
          localStorage.clear()
          window.location.reload()
        }
      }, 100)
      return
    }

    lastUserIdRef.current = user.id

    // Less frequent session validation (every 5 minutes instead of every minute)
    const validateSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('Session validation error:', error)
          setSessionHealth(prev => ({
            isValid: false,
            lastCheck: Date.now(),
            warningCount: prev.warningCount + 1
          }))
          return
        }

        if (!session || !session.user) {
          console.warn('Session lost during validation')
          setSessionHealth(prev => ({
            isValid: false,
            lastCheck: Date.now(),
            warningCount: prev.warningCount + 1
          }))
          
          // If we think we have a user but session is gone, sign out
          if (user) {
            await supabase.auth.signOut()
          }
          return
        }

        // Verify user ID hasn't changed
        if (session.user.id !== user.id) {
          console.error('🚨 User ID mismatch in session validation')
          // Use timeout to prevent race condition
          setTimeout(async () => {
            try {
              await supabase.auth.signOut()
            } catch (e) {
              localStorage.clear()
              window.location.reload()
            }
          }, 100)
          return
        }

        // Check token expiry
        const expiresAt = session.expires_at
        if (expiresAt) {
          const expiryTime = new Date(expiresAt * 1000)
          const timeUntilExpiry = expiryTime - Date.now()
          
          // Warn if token expires in less than 5 minutes
          if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
            console.log('⏰ Session expiring soon, will auto-refresh')
          }
        }

        setSessionHealth({
          isValid: true,
          lastCheck: Date.now(),
          warningCount: 0
        })

      } catch (err) {
        console.error('Session validation exception:', err)
        setSessionHealth(prev => ({
          isValid: false,
          lastCheck: Date.now(),
          warningCount: prev.warningCount + 1
        }))
      }
    }

    // Initial validation
    validateSession()

    // Check if mobile for interval timing
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
    const checkInterval = isMobile ? 3 * 60 * 1000 : 5 * 60 * 1000 // 3 min mobile, 5 min desktop
    
    // Validate periodically
    checkIntervalRef.current = setInterval(validateSession, checkInterval)

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [user])

  // Auto sign-out if too many warnings
  useEffect(() => {
    if (sessionHealth.warningCount >= 3) {
      console.error('🚨 Too many session warnings - forcing sign out')
      // Use proper cleanup instead of hard redirect
      supabase.auth.signOut().catch(() => {
        // Force cleanup even if signOut fails
        localStorage.clear()
        window.location.reload()
      })
    }
  }, [sessionHealth.warningCount])

  return sessionHealth
}
