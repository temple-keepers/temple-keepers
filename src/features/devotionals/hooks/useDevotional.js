import { useState, useEffect } from 'react'
import { generateDevotional, getFallbackDevotional } from '../lib/devotional'
import { useTodayLog } from './useTodayLog'

/**
 * Hook to manage daily devotional content
 * - Checks if today's devotional exists in database
 * - If not, generates new one with Gemini
 * - Caches in database (one per day)
 * - Returns devotional data for display
 */
export const useDevotional = () => {
  const { logId, getEntriesByType, addEntry } = useTodayLog()
  const [devotional, setDevotional] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (logId) {
      loadOrGenerateDevotional()
    }
  }, [logId])

  /**
   * Load existing devotional or generate new one
   */
  const loadOrGenerateDevotional = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if today's devotional already exists
      const existingDevotionals = getEntriesByType('devotional')
      
      if (existingDevotionals.length > 0) {
        // Use existing devotional
        setDevotional(existingDevotionals[0].entry_data)
        setLoading(false)
        return
      }

      // No devotional exists - generate new one
      console.log('Generating new devotional...')
      const result = await generateDevotional()

      if (result.success) {
        // Save to database
        const { error: saveError } = await addEntry('devotional', result.data)
        
        if (saveError) {
          console.error('Error saving devotional:', saveError)
          // Use it anyway, just don't cache
          setDevotional(result.data)
        } else {
          setDevotional(result.data)
        }
      } else {
        // AI generation failed - use fallback
        console.warn('AI generation failed, using fallback')
        const fallback = getFallbackDevotional()
        
        // Try to save fallback
        await addEntry('devotional', fallback)
        setDevotional(fallback)
      }
    } catch (err) {
      console.error('Error loading devotional:', err)
      setError(err.message)
      
      // Use fallback on any error
      const fallback = getFallbackDevotional()
      setDevotional(fallback)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Force regenerate devotional (for testing or if user wants a new one)
   */
  const regenerate = async () => {
    setLoading(true)
    const result = await generateDevotional()
    
    if (result.success) {
      await addEntry('devotional', result.data)
      setDevotional(result.data)
    }
    
    setLoading(false)
  }

  return {
    devotional,
    loading,
    error,
    regenerate
  }
}
