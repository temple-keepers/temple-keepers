import { useState } from 'react'
import { supabase } from '../lib/supabase'

export const useProgramDays = (programId) => {
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(false)

  // Get all days for a program
  const getDays = async () => {
    if (!programId) return { data: null, error: null }
    
    setLoading(true)
    
    const { data, error } = await supabase
      .from('program_days')
      .select('*')
      .eq('program_id', programId)
      .order('day_number', { ascending: true })

    if (!error && data) {
      setDays(data)
    }
    
    setLoading(false)
    return { data, error }
  }

  // Get single day
  const getDay = async (dayNumber) => {
    const { data, error } = await supabase
      .from('program_days')
      .select('*')
      .eq('program_id', programId)
      .eq('day_number', dayNumber)
      .single()

    return { data, error }
  }

  // Create or update day
  const saveDay = async (dayNumber, dayData) => {
    // Check if day exists
    const { data: existing } = await supabase
      .from('program_days')
      .select('id')
      .eq('program_id', programId)
      .eq('day_number', dayNumber)
      .single()

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('program_days')
        .update(dayData)
        .eq('id', existing.id)
        .select()
        .single()

      if (!error && data) {
        setDays(days.map(d => d.day_number === dayNumber ? data : d))
      }

      return { data, error }
    } else {
      // Create new
      const { data, error } = await supabase
        .from('program_days')
        .insert({
          program_id: programId,
          day_number: dayNumber,
          ...dayData
        })
        .select()
        .single()

      if (!error && data) {
        setDays([...days, data].sort((a, b) => a.day_number - b.day_number))
      }

      return { data, error }
    }
  }

  // Delete day
  const deleteDay = async (dayNumber) => {
    const { error } = await supabase
      .from('program_days')
      .delete()
      .eq('program_id', programId)
      .eq('day_number', dayNumber)

    if (!error) {
      setDays(days.filter(d => d.day_number !== dayNumber))
    }

    return { error }
  }

  // Batch create days (for initializing program)
  const createDays = async (numDays) => {
    const daysToCreate = Array.from({ length: numDays }, (_, i) => ({
      program_id: programId,
      day_number: i + 1,
      title: `Day ${i + 1}`,
      anchor_sentence: '',
      scripture_reference: '',
      scripture_text: '',
      focus_thought: '',
      prayer_text: '',
      fasting_reminder: '',
      reflection_questions: [],
      action_step: '',
      completion_message: ''
    }))

    const { data, error } = await supabase
      .from('program_days')
      .insert(daysToCreate)
      .select()

    if (!error && data) {
      setDays(data)
    }

    return { data, error }
  }

  return {
    days,
    loading,
    getDays,
    getDay,
    saveDay,
    deleteDay,
    createDays
  }
}
