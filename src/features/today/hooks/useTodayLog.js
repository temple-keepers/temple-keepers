import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

/**
 * Custom hook to manage today's daily log and its entries
 * Handles lazy creation of daily log (only created when first needed)
 * Returns log ID, entries, and helper functions
 */
export const useTodayLog = () => {
  const { user } = useAuth()
  const [logId, setLogId] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load today's log when component mounts
  useEffect(() => {
    if (user?.id) {
      loadTodayLog()
    }
  }, [user?.id])

  /**
   * Get or create today's log using the database function
   */
  const loadTodayLog = async () => {
    try {
      setLoading(true)
      setError(null)

      // Call the database function to get or create today's log
      const { data, error: rpcError } = await supabase
        .rpc('get_or_create_today_log', { p_user_id: user.id })

      if (rpcError) throw rpcError

      setLogId(data)
      
      // Load entries for this log
      await loadEntries(data)
    } catch (err) {
      console.error('Error loading today log:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load all entries for a given log
   */
  const loadEntries = async (id) => {
    try {
      const { data, error: entriesError } = await supabase
        .from('daily_log_entries')
        .select('*')
        .eq('log_id', id)
        .order('created_at', { ascending: true })

      if (entriesError) throw entriesError

      setEntries(data || [])
    } catch (err) {
      console.error('Error loading entries:', err)
      setError(err.message)
    }
  }

  /**
   * Add a new entry to today's log
   * @param {string} type - Entry type: 'mood', 'note', 'meal', 'devotional'
   * @param {object} data - Entry data (flexible JSONB)
   */
  const addEntry = async (type, data) => {
    try {
      // Ensure we have a log ID
      if (!logId) {
        await loadTodayLog()
      }

      const { data: newEntry, error: insertError } = await supabase
        .from('daily_log_entries')
        .insert({
          log_id: logId,
          entry_type: type,
          entry_data: data
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Add to local state
      setEntries(prev => [...prev, newEntry])
      
      return { data: newEntry, error: null }
    } catch (err) {
      console.error('Error adding entry:', err)
      return { data: null, error: err.message }
    }
  }

  /**
   * Get entries by type
   * @param {string} type - Entry type to filter by
   */
  const getEntriesByType = (type) => {
    return entries.filter(entry => entry.entry_type === type)
  }

  /**
   * Get today's summary data
   */
  const getSummary = () => {
    const checkIns = getEntriesByType('mood')
    const notes = getEntriesByType('note')
    const meals = getEntriesByType('meal')
    const devotionals = getEntriesByType('devotional')

    return {
      checkInCount: checkIns.length,
      noteCount: notes.length,
      mealCount: meals.length,
      meals: meals.map(m => ({
        type: m.entry_data.meal_type,
        description: m.entry_data.description,
        time: m.created_at
      })),
      lastMood: checkIns.length > 0 
        ? checkIns[checkIns.length - 1].entry_data.mood 
        : null,
      hasDevotional: devotionals.length > 0,
      devotional: devotionals.length > 0 ? devotionals[0].entry_data : null
    }
  }

  return {
    logId,
    entries,
    loading,
    error,
    addEntry,
    getEntriesByType,
    getSummary,
    refresh: loadTodayLog
  }
}
