import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Cookie } from 'lucide-react'

const CONSENT_KEY = 'tk_cookie_consent'

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ 
      essential: true, 
      analytics: true, 
      accepted_at: new Date().toISOString() 
    }))
    setVisible(false)
  }

  const handleEssentialOnly = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ 
      essential: true, 
      analytics: false, 
      accepted_at: new Date().toISOString() 
    }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-slide-up">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Cookie className="w-5 h-5 text-temple-gold flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
              We use essential cookies to keep you logged in and optional cookies to understand how you use Temple Keepers.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Read our{' '}
              <Link to="/cookies" className="text-temple-purple dark:text-temple-gold underline">
                Cookie Policy
              </Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-temple-purple dark:text-temple-gold underline">
                Privacy Policy
              </Link>
              {' '}for details.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAccept}
                className="px-4 py-2 rounded-lg bg-temple-purple dark:bg-temple-gold text-white dark:text-gray-900 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Accept All
              </button>
              <button
                onClick={handleEssentialOnly}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Essential Only
              </button>
            </div>
          </div>
          <button
            onClick={handleEssentialOnly}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
