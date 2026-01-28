import { useEffect, useState } from 'react'

export const useServiceWorker = () => {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [updateSW, setUpdateSW] = useState(null)

  useEffect(() => {
    const initSW = async () => {
      try {
        // Dynamic import to avoid issues if module not available
        const { registerSW } = await import('virtual:pwa-register')
        
        const update = registerSW({
          onNeedRefresh() {
            setNeedRefresh(true)
          },
          onOfflineReady() {
            setOfflineReady(true)
            console.log('✅ App ready to work offline')
          },
          onRegisteredSW(swUrl, r) {
            console.log('✅ Service Worker registered:', swUrl)
            // Check for updates every hour
            if (r) {
              setInterval(() => {
                r.update()
              }, 60 * 60 * 1000)
            }
          },
          onRegisterError(error) {
            console.error('❌ Service Worker registration error:', error)
          }
        })

        setUpdateSW(() => update)
      } catch (err) {
        // PWA not available (dev mode or build without PWA)
        console.log('PWA not available:', err.message)
      }
    }

    initSW()
  }, [])

  const updateApp = () => {
    if (updateSW) {
      updateSW(true)
    }
  }

  const closePrompt = () => {
    setNeedRefresh(false)
    setOfflineReady(false)
  }

  return {
    needRefresh,
    offlineReady,
    updateApp,
    closePrompt
  }
}
