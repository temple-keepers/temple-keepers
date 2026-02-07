import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

/**
 * Single-call hook that fetches everything for the Today dashboard.
 * Replaces the waterfall of: useTodayLog → useDevotional → useEnrollment → useFasting
 * One DB round-trip instead of 5-7.
 */
export const useTodayDashboard = () => {
  const { user } = useAuth()
  const [logId, setLogId] = useState(null)
  const [entries, setEntries] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (user?.id && !fetchedRef.current) {
      fetchedRef.current = true
      loadDashboard()
    }
  }, [user?.id])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: rpcError } = await supabase
        .rpc('get_today_dashboard', { p_user_id: user.id })

      if (rpcError) throw rpcError

      if (data) {
        setLogId(data.log_id)
        setEntries(data.entries || [])
        setEnrollments(data.enrollments || [])
      }
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper: get entries by type
  const getEntriesByType = (type) => {
    return entries.filter(entry => entry.entry_type === type)
  }

  // Helper: get devotional from entries
  const getDevotional = () => {
    const devEntries = getEntriesByType('devotional')
    return devEntries.length > 0 ? devEntries[0].entry_data : null
  }

  // Helper: add entry to today's log
  const addEntry = async (type, data) => {
    try {
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
      setEntries(prev => [...prev, newEntry])
      return { data: newEntry, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  // Helper: detect fasting enrollment
  const fastingEnrollment = enrollments.find(e => e.cohort_id) || null

  return {
    logId,
    entries,
    enrollments,
    fastingEnrollment,
    loading,
    error,
    getEntriesByType,
    getDevotional,
    addEntry,
    refresh: () => { fetchedRef.current = false; loadDashboard() }
  }
}
