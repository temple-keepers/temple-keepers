/**
 * Offline queue system for API calls
 * Stores failed requests and retries when connection is restored
 */
import { useState, useEffect } from 'react'

const QUEUE_KEY = 'tk-offline-queue'
const MAX_QUEUE_SIZE = 50

class OfflineQueue {
  constructor() {
    this.queue = this.loadQueue()
    this.isProcessing = false
    this.listeners = []
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.processQueue())
  }

  loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('Error loading offline queue:', e)
      return []
    }
  }

  saveQueue() {
    try {
      // Limit queue size
      const limitedQueue = this.queue.slice(-MAX_QUEUE_SIZE)
      localStorage.setItem(QUEUE_KEY, JSON.stringify(limitedQueue))
      this.notifyListeners()
    } catch (e) {
      console.error('Error saving offline queue:', e)
    }
  }

  /**
   * Add a request to the queue
   */
  add(request) {
    const queueItem = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      request,
      retries: 0,
      maxRetries: 3
    }
    
    this.queue.push(queueItem)
    this.saveQueue()
    
    console.log('📥 Added to offline queue:', queueItem.id)
    
    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue()
    }
    
    return queueItem.id
  }

  /**
   * Process all queued requests
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0 || !navigator.onLine) {
      return
    }

    this.isProcessing = true
    console.log('📤 Processing offline queue:', this.queue.length, 'items')

    const remainingQueue = []

    for (const item of this.queue) {
      try {
        // Execute the queued request
        if (typeof item.request === 'function') {
          await item.request()
          console.log('✅ Offline queue item processed:', item.id)
        } else {
          console.warn('Invalid queue item:', item.id)
        }
      } catch (error) {
        console.error('❌ Offline queue item failed:', item.id, error)
        
        // Increment retry count
        item.retries++
        
        // Re-queue if under max retries
        if (item.retries < item.maxRetries) {
          remainingQueue.push(item)
        } else {
          console.warn('⚠️ Max retries reached for queue item:', item.id)
        }
      }
    }

    this.queue = remainingQueue
    this.saveQueue()
    this.isProcessing = false
    
    if (remainingQueue.length > 0) {
      console.log('📋 Remaining queue items:', remainingQueue.length)
    }
  }

  /**
   * Clear the entire queue
   */
  clear() {
    this.queue = []
    this.saveQueue()
    console.log('🗑️ Offline queue cleared')
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      size: this.queue.length,
      oldestItem: this.queue[0]?.timestamp || null,
      isProcessing: this.isProcessing
    }
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback)
    }
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.getStatus())
      } catch (e) {
        console.error('Queue listener error:', e)
      }
    })
  }
}

// Singleton instance
export const offlineQueue = new OfflineQueue()

// Export hook for React components
export const useOfflineQueue = () => {
  const [status, setStatus] = useState(offlineQueue.getStatus())

  useEffect(() => {
    const unsubscribe = offlineQueue.subscribe(setStatus)
    return unsubscribe
  }, [])

  return {
    ...status,
    add: offlineQueue.add.bind(offlineQueue),
    clear: offlineQueue.clear.bind(offlineQueue),
    process: offlineQueue.processQueue.bind(offlineQueue)
  }
}
