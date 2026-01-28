import { RefreshCw, X, CheckCircle } from 'lucide-react'
import { useServiceWorker } from '../hooks/useServiceWorker'

const UpdatePrompt = () => {
  const { needRefresh, offlineReady, updateApp, closePrompt } = useServiceWorker()

  if (!needRefresh && !offlineReady) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 animate-slide-up">
      <div className="bg-gray-800 rounded-2xl p-4 shadow-2xl border border-gray-700">
        <button
          onClick={closePrompt}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-start gap-3">
          {needRefresh ? (
            <>
              <div className="p-2 bg-temple-purple/20 rounded-xl">
                <RefreshCw className="w-6 h-6 text-temple-purple" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">Update Available</h3>
                <p className="text-gray-400 text-sm mt-1">
                  A new version is ready. Reload to update.
                </p>
                <button
                  onClick={updateApp}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-temple-purple text-white rounded-xl font-medium hover:bg-temple-purple-dark transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="p-2 bg-green-500/20 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">Ready Offline</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Temple Keepers is now available offline!
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default UpdatePrompt
