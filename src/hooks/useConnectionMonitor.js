import { useState, useEffect } from 'react'
import { getNetworkStatus, onNetworkChange } from '../lib/apiHelpers'

export const useConnectionMonitor = () => {
  const [isOnline, setIsOnline] = useState(getNetworkStatus())
  const [connectionQuality, setConnectionQuality] = useState('good')

  useEffect(() => {
    // Monitor online/offline status
    const unsubscribe = onNetworkChange((online) => {
      setIsOnline(online)
    })

    // Monitor connection quality using Network Information API
    if ('connection' in navigator) {
      const connection = navigator.connection

      const updateConnectionQuality = () => {
        const effectiveType = connection.effectiveType
        
        if (effectiveType === '4g') {
          setConnectionQuality('good')
        } else if (effectiveType === '3g') {
          setConnectionQuality('fair')
        } else {
          setConnectionQuality('poor')
        }
      }

      updateConnectionQuality()
      connection.addEventListener('change', updateConnectionQuality)

      return () => {
        unsubscribe()
        connection.removeEventListener('change', updateConnectionQuality)
      }
    }

    return unsubscribe
  }, [])

  return {
    isOnline,
    connectionQuality,
    isSlow: connectionQuality === 'poor' || connectionQuality === 'fair'
  }
}
