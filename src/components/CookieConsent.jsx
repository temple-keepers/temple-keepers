import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, X, ChevronDown, ChevronUp, Check, Settings } from 'lucide-react'

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, can't be disabled
    functional: true,
    analytics: false
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Small delay to prevent flash on page load
      setTimeout(() => setShowBanner(true), 1000)
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent)
        setPreferences(saved.preferences || preferences)
      } catch (e) {
        console.error('Error parsing cookie consent:', e)
      }
    }
  }, [])

  const saveConsent = (acceptAll = false) => {
    const finalPreferences = acceptAll 
      ? { essential: true, functional: true, analytics: true }
      : preferences

    const consentData = {
      timestamp: new Date().toISOString(),
      preferences: finalPreferences,
      version: '1.0'
    }

    localStorage.setItem('cookie-consent', JSON.stringify(consentData))
    setPreferences(finalPreferences)
    setShowBanner(false)

    // Dispatch event for analytics tools to listen to
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { 
      detail: finalPreferences 
    }))
  }

  const handleRejectNonEssential = () => {
    const minimalPreferences = {
      essential: true,
      functional: false,
      analytics: false
    }
    setPreferences(minimalPreferences)
    saveConsent(false)
  }

  const togglePreference = (key) => {
    if (key === 'essential') return // Can't toggle essential
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (!showBanner) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
      
      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[101] p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            
            {/* Main Content */}
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    We value your privacy 🍪
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    We use cookies to enhance your experience, keep you logged in, and remember your preferences. 
                    Some cookies help us understand how you use Temple Keepers so we can improve it.
                    You can choose which cookies to accept.
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                    Read our{' '}
                    <Link to="/cookies" className="text-temple-purple hover:underline">Cookie Policy</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-temple-purple hover:underline">Privacy Policy</Link>
                    {' '}to learn more.
                  </p>
                </div>
              </div>

              {/* Preferences Section */}
              {showPreferences && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Cookie Preferences
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Essential Cookies */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">Essential Cookies</span>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                            Required
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Required for authentication, security, and basic functionality. Cannot be disabled.
                        </p>
                      </div>
                      <div className="ml-4">
                        <div className="w-12 h-7 bg-green-500 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                          <div className="w-5 h-5 bg-white rounded-full shadow flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Functional Cookies */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 dark:text-white">Functional Cookies</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Remember your preferences like dark mode, language, and display settings.
                        </p>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => togglePreference('functional')}
                          className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${
                            preferences.functional 
                              ? 'bg-green-500 justify-end' 
                              : 'bg-gray-300 dark:bg-gray-600 justify-start'
                          }`}
                        >
                          <div className="w-5 h-5 bg-white rounded-full shadow" />
                        </button>
                      </div>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 dark:text-white">Analytics Cookies</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Help us understand how you use the app so we can make improvements. Data is anonymized.
                        </p>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => togglePreference('analytics')}
                          className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${
                            preferences.analytics 
                              ? 'bg-green-500 justify-end' 
                              : 'bg-gray-300 dark:bg-gray-600 justify-start'
                          }`}
                        >
                          <div className="w-5 h-5 bg-white rounded-full shadow" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>{showPreferences ? 'Hide' : 'Customize'}</span>
                  {showPreferences ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={handleRejectNonEssential}
                  className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Essential Only
                </button>
                
                {showPreferences ? (
                  <button
                    onClick={() => saveConsent(false)}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-temple-purple text-white hover:bg-temple-purple-dark transition-colors font-medium"
                  >
                    Save Preferences
                  </button>
                ) : (
                  <button
                    onClick={() => saveConsent(true)}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-temple-purple text-white hover:bg-temple-purple-dark transition-colors font-medium"
                  >
                    Accept All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CookieConsent