import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://')
    
    setIsStandalone(standalone)

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(iOS)

    // Check if user dismissed the banner previously
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    const dismissedTime = dismissed ? parseInt(dismissed) : 0
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)

    // Listen for the beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show banner if not dismissed recently (within 7 days)
      if (daysSinceDismissed > 7 || !dismissed) {
        setTimeout(() => setShowInstallBanner(true), 3000) // Delay 3 seconds
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // For iOS, show the banner after a delay if not installed
    if (iOS && !standalone && (daysSinceDismissed > 7 || !dismissed)) {
      setTimeout(() => setShowInstallBanner(true), 5000)
    }

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setShowInstallBanner(false)
      setDeferredPrompt(null)
      console.log('✅ PWA installed successfully')
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`Install prompt outcome: ${outcome}`)
      setDeferredPrompt(null)
      setShowInstallBanner(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallBanner(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Don't show if already installed
  if (isStandalone || !showInstallBanner) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-temple-purple to-purple-700 rounded-2xl p-4 shadow-2xl border border-purple-500/30">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl">
            <Smartphone className="w-8 h-8 text-temple-gold" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">Install Temple Keepers</h3>
            <p className="text-white/80 text-sm mt-1">
              {isIOS 
                ? 'Tap the share button and "Add to Home Screen" for the best experience'
                : 'Install our app for quick access and offline features'
              }
            </p>
            
            {!isIOS && (
              <button
                onClick={handleInstallClick}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-temple-gold text-gray-900 rounded-xl font-medium hover:bg-yellow-400 transition-colors"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            )}
            
            {isIOS && (
              <div className="mt-3 flex items-center gap-2 text-temple-gold text-sm">
                <span>Tap</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L12 14M12 2L8 6M12 2L16 6M4 14L4 20C4 21.1 4.9 22 6 22L18 22C19.1 22 20 21.1 20 20L20 14" 
                    stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>then "Add to Home Screen"</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstallPWA
