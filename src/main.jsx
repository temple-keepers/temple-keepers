import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initMobileOptimizations } from './lib/mobileOptimizations'

// Initialize mobile optimizations immediately
initMobileOptimizations()

// Register service worker with better error handling and recovery
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    let retries = 0
    const maxRetries = 3

    const registerSW = async () => {
      try {
        // Only unregister if we have a specific reason (e.g., version mismatch)
        // Don't unregister on every load as it disrupts caching
        
        // Register the service worker
        const registration = await navigator.serviceWorker.register('/sw.js', { 
          updateViaCache: 'none',
          scope: '/'
        })
        
        console.log('✅ Service Worker registered:', registration.scope)
        
        // Check for updates every hour
        setInterval(() => {
          registration.update().catch(err => 
            console.log('SW update check failed:', err)
          )
        }, 60 * 60 * 1000)
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 New version available - reload to update')
              }
            })
          }
        })
        
      } catch (error) {
        console.error('❌ SW registration failed:', error)
        
        // Retry with exponential backoff
        if (retries < maxRetries) {
          retries++
          const delay = Math.pow(2, retries) * 1000
          console.log(`Retrying SW registration in ${delay}ms (attempt ${retries}/${maxRetries})`)
          setTimeout(registerSW, delay)
        }
      }
    }

    await registerSW()
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)