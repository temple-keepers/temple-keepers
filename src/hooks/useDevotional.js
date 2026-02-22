import { useState, useEffect } from 'react'
import { generateDevotional, getFallbackDevotional } from '../lib/devotional'
import { useTodayLog } from './useTodayLog'
import { supabase } from '../lib/supabase'
import { useGamification } from './useGamification'
import { useAuth } from '../contexts/AuthContext'

/**
 * Hook to manage daily devotional content
 * - Loads current weekly theme
 * - Generates themed devotional via Gemini (or general if no theme)
 * - Caches in database (one per day)
 * - Personalises greeting with user's first name
 */
export const useDevotional = () => {
  const { logId, getEntriesByType, addEntry } = useTodayLog()
  const { trackAction } = useGamification()
  const { user, profile } = useAuth()
  const [devotional, setDevotional] = useState(null)
  const [weeklyTheme, setWeeklyTheme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const firstName = profile?.first_name || user?.user_metadata?.first_name || ''

  // Personalise the devotional reflection with the user's name
  const personalise = (devotionalData) => {
    if (!devotionalData?.reflection || !firstName) return devotionalData
    const reflection = devotionalData.reflection
      .replace(/Dear Temple Keepers/gi, `Dear ${firstName}`)
      .replace(/Dear Temple Keeper/gi, `Dear ${firstName}`)
    return { ...devotionalData, reflection }
  }

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
        setDevotional(personalise(existingDevotionals[0].entry_data))
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

      const result = await generateDevotional(themeData, firstName)

      if (result.success) {
        const { data: saved, error: saveError } = await addEntry('devotional', result.data)
        if (saveError) console.error('Error saving devotional:', saveError)
        setDevotional(personalise(result.data))
        trackAction('devotional_read', 'devotional', saved?.id || null)
      } else {
        console.warn('AI generation failed, using fallback')
        const fallback = getFallbackDevotional()
        await addEntry('devotional', fallback)
        setDevotional(personalise(fallback))
      }
    } catch (err) {
      console.error('Error loading devotional:', err)
      setError(err.message)
      const fallback = getFallbackDevotional()
      setDevotional(personalise(fallback))
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

    const result = await generateDevotional(themeData, firstName)
    if (result.success) {
      await addEntry('devotional', result.data)
      setDevotional(personalise(result.data))
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
