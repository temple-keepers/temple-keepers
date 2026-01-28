import { useState, useEffect } from 'react'

export const useCookieConsent = () => {
  const [consent, setConsent] = useState(null)

  useEffect(() => {
    // Load initial consent
    const loadConsent = () => {
      try {
        const saved = localStorage.getItem('cookie-consent')
        if (saved) {
          setConsent(JSON.parse(saved))
        }
      } catch (e) {
        console.error('Error loading cookie consent:', e)
      }
    }

    loadConsent()

    // Listen for updates
    const handleUpdate = (e) => {
      setConsent({
        timestamp: new Date().toISOString(),
        preferences: e.detail,
        version: '1.0'
      })
    }

    window.addEventListener('cookie-consent-updated', handleUpdate)
    return () => window.removeEventListener('cookie-consent-updated', handleUpdate)
  }, [])

  const hasConsent = (type) => {
    if (!consent) return false
    return consent.preferences?.[type] === true
  }

  const hasAnyConsent = () => consent !== null

  return {
    consent,
    hasConsent,
    hasAnyConsent,
    hasFunctional: () => hasConsent('functional'),
    hasAnalytics: () => hasConsent('analytics'),
  }
}