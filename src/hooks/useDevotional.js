import { useState, useEffect } from 'react'
import { generateDevotional, getFallbackDevotional } from '../lib/devotional'
import { useTodayLog } from './useTodayLog'
import { supabase } from '../lib/supabase'
import { useGamification } from './useGamification'

/**
 * Hook to manage daily devotional content
 * - Loads current weekly theme
 * - Generates themed devotional via Gemini (or general if no theme)
 * - Caches in database (one per day)
 */
export const useDevotional = () => {
  const { logId, getEntriesByType, addEntry } = useTodayLog()
  const { trackAction } = useGamification()
  const [devotional, setDevotional] = useState(null)
  const [weeklyTheme, setWeeklyTheme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load weekly theme on mount
  useEffect(() => {
    loadWeeklyTheme()
  }, [])

  // Generate devotional once we have logId (and optionally a theme)
  useEffect(() => {
    if (logId) {
      loadOrGenerateDevotional()
    }
  }, [logId, weeklyTheme])

  const loadWeeklyTheme = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const { data } = await supabase
        .from('weekly_themes')
        .select('*')
        .lte('week_start', today)
        .gte('week_end', today)
        .eq('is_active', true)
        .maybeSingle()

      if (data) setWeeklyTheme(data)
    } catch (err) {
      console.error('Failed to load weekly theme:', err)
    }
  }

  const loadOrGenerateDevotional = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if today's devotional already exists
      const existingDevotionals = getEntriesByType('devotional')
      
      if (existingDevotionals.length > 0) {
        setDevotional(existingDevotionals[0].entry_data)
        setLoading(false)
        return
      }

      // Generate new one — pass theme if available
      console.log('Generating new devotional...')
      const themeData = weeklyTheme ? {
        title: weeklyTheme.title,
        scripture: weeklyTheme.scripture,
        reference: weeklyTheme.scripture_reference
      } : null

      const result = await generateDevotional(themeData)

      if (result.success) {
        const { data: saved, error: saveError } = await addEntry('devotional', result.data)
        if (saveError) console.error('Error saving devotional:', saveError)
        setDevotional(result.data)
        trackAction('devotional_read', 'devotional', saved?.id || null)
      } else {
        console.warn('AI generation failed, using fallback')
        const fallback = getFallbackDevotional()
        await addEntry('devotional', fallback)
        setDevotional(fallback)
      }
    } catch (err) {
      console.error('Error loading devotional:', err)
      setError(err.message)
      const fallback = getFallbackDevotional()
      setDevotional(fallback)
    } finally {
      setLoading(false)
    }
  }

  const regenerate = async () => {
    setLoading(true)
    const themeData = weeklyTheme ? {
      title: weeklyTheme.title,
      scripture: weeklyTheme.scripture,
      reference: weeklyTheme.scripture_reference
    } : null

    const result = await generateDevotional(themeData)
    if (result.success) {
      await addEntry('devotional', result.data)
      setDevotional(result.data)
    }
    setLoading(false)
  }

  return {
    devotional,
    weeklyTheme,
    loading,
    error,
    regenerate
  }
}
