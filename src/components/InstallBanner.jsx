import { useState, useEffect } from 'react'
import { Download, X, Share } from 'lucide-react'

export const InstallBanner = () => {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // Don't show if already installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true
    if (isStandalone) return

    // Don't show if dismissed recently (7 days)
    const dismissed = localStorage.getItem('tk-install-dismissed')
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return
    }

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(ios)

    if (ios) {
      // Show banner on iOS after short delay
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }

    // Android/Desktop: listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShow(true), 2000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true)
      return
    }

    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShow(false)
    setShowIOSGuide(false)
    localStorage.setItem('tk-install-dismissed', Date.now().toString())
  }

  if (!show) return null

  return (
    <>
      {/* Main Banner */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 px-3 pb-3 md:pb-4 animate-slide-up">
        <div className="max-w-lg mx-auto bg-gradient-to-r from-purple-700 to-purple-900 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-gold-400/10 rounded-2xl" />
          
          <div className="relative p-4">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              {/* App Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-white/10 p-0.5">
                <img
                  src="/logo.png"
                  alt="Temple Keepers"
                  className="w-full h-full rounded-[10px] object-cover"
                />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 pr-6">
                <p className="text-white font-semibold text-sm">
                  Get the Temple Keepers App
                </p>
                <p className="text-purple-200 text-xs mt-0.5 leading-snug">
                  Install for quick access, offline support & a full-screen experience
                </p>
              </div>
            </div>

            {/* Install Button */}
            <button
              onClick={handleInstall}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-white text-purple-800 font-semibold text-sm py-2.5 rounded-xl hover:bg-purple-50 active:scale-[0.98] transition-all"
            >
              {isIOS ? (
                <>
                  <Share className="w-4 h-4" />
                  How to Install
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Install App
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl p-6 pb-10 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Install Temple Keepers
              </h3>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-purple-700 dark:text-purple-300 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Tap the Share button
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    The square icon with an arrow at the bottom of Safari
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-purple-700 dark:text-purple-300 font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Scroll down and tap "Add to Home Screen"
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    You may need to scroll down in the share menu
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-purple-700 dark:text-purple-300 font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Tap "Add" to confirm
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Temple Keepers will appear on your home screen
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="mt-6 w-full bg-purple-700 text-white font-semibold py-3 rounded-xl hover:bg-purple-800 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
