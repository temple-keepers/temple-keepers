import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

/**
 * Custom hook to manage today's daily log and its entries
 * Optimized: single RPC call that returns both log ID and entries
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
   * Get or create today's log, then load entries in parallel
   */
  const loadTodayLog = async () => {
    try {
      setLoading(true)
      setError(null)

      // Step 1: Get or create log ID
      const { data: logData, error: rpcError } = await supabase
        .rpc('get_or_create_today_log', { p_user_id: user.id })

      if (rpcError) throw rpcError

      setLogId(logData)

      // Step 2: Load entries (now that we have the log ID)
      const { data: entriesData, error: entriesError } = await supabase
        .from('daily_log_entries')
        .select('*')
        .eq('log_id', logData)
        .order('created_at', { ascending: true })

      if (entriesError) throw entriesError

      setEntries(entriesData || [])
    } catch (err) {
      console.error('Error loading today log:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Add a new entry to today's log
   */
  const addEntry = async (type, data) => {
    try {
      let currentLogId = logId
      if (!currentLogId) {
        const { data: newLogId, error: rpcError } = await supabase
          .rpc('get_or_create_today_log', { p_user_id: user.id })
        if (rpcError) throw rpcError
        currentLogId = newLogId
        setLogId(currentLogId)
      }

      const { data: newEntry, error: insertError } = await supabase
        .from('daily_log_entries')
        .insert({
          log_id: currentLogId,
          entry_type: type,
          entry_data: data
        })
        .select()
        .single()

      if (insertError) throw insertError

      setEntries(prev => [...prev, newEntry])
      return { data: newEntry, error: null }
    } catch (err) {
      console.error('Error adding entry:', err)
      return { data: null, error: err.message }
    }
  }

  /**
   * Get entries by type
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
