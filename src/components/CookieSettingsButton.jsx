import { useState } from 'react'
import { Cookie, Check, Settings } from 'lucide-react'

const CookieSettingsButton = () => {
  const [showModal, setShowModal] = useState(false)
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('cookie-consent')
      if (saved) {
        return JSON.parse(saved).preferences
      }
    } catch (e) {
      console.error('Error loading cookie preferences:', e)
    }
    return { essential: true, functional: true, analytics: false }
  })

  const togglePreference = (key) => {
    if (key === 'essential') return
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const savePreferences = () => {
    const consentData = {
      timestamp: new Date().toISOString(),
      preferences,
      version: '1.0'
    }
    localStorage.setItem('cookie-consent', JSON.stringify(consentData))
    setShowModal(false)
    
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { 
      detail: preferences 
    }))
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-3 w-full p-4 rounded-xl bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
          <Cookie className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">Cookie Preferences</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your cookie settings</p>
        </div>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Cookie className="w-6 h-6 text-amber-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cookie Settings</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Essential */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">Essential</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                      Required
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Authentication & security</p>
                </div>
                <div className="w-12 h-7 bg-green-500 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                  <div className="w-5 h-5 bg-white rounded-full shadow flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Functional */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Functional</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Preferences & settings</p>
                </div>
                <button
                  onClick={() => togglePreference('functional')}
                  className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${
                    preferences.functional ? 'bg-green-500 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow" />
                </button>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Analytics</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Usage & improvements</p>
                </div>
                <button
                  onClick={() => togglePreference('analytics')}
                  className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${
                    preferences.analytics ? 'bg-green-500 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow" />
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={savePreferences}
                className="flex-1 px-4 py-3 rounded-xl bg-temple-purple text-white font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CookieSettingsButton