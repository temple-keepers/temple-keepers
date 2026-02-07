import { useState, useEffect } from 'react'
import { RefreshCw, X } from 'lucide-react'

export const UpdateBanner = () => {
  const [showBanner, setShowBanner] = useState(false)
  const [registration, setRegistration] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const handleUpdate = (event) => {
      setRegistration(event.detail)
      setShowBanner(true)
    }

    window.addEventListener('sw-update-available', handleUpdate)
    return () => window.removeEventListener('sw-update-available', handleUpdate)
  }, [])

  const handleUpdateClick = () => {
    if (!registration?.waiting) return
    setUpdating(true)
    // Tell the waiting SW to activate — the controllerchange listener in index.html
    // will auto-reload the page once it takes over
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }

  const handleDismiss = () => {
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-50 max-w-md mx-auto animate-in slide-in-from-bottom-4">
      <div className="bg-gradient-to-r from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 rounded-xl shadow-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <RefreshCw className={`w-5 h-5 flex-shrink-0 mt-0.5 ${updating ? 'animate-spin' : ''}`} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">
              {updating ? 'Updating...' : 'New version available ✨'}
            </p>
            <p className="text-xs text-white/80 mt-0.5">
              {updating
                ? 'Refreshing to the latest version'
                : 'Tap update when you\'re ready — your progress is saved.'
              }
            </p>
          </div>
          {!updating && (
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg hover:bg-white/20 flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {!updating && (
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleUpdateClick}
              className="flex-1 py-2 px-4 rounded-lg bg-white text-temple-purple dark:text-yellow-700 font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={handleDismiss}
              className="py-2 px-4 rounded-lg bg-white/20 text-white font-medium text-sm hover:bg-white/30 transition-colors"
            >
              Later
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
