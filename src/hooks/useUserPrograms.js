import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useUserPrograms = () => {
  const { user } = useAuth()
  const [programs, setPrograms] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(false)

  // Get all published programs (for browsing)
  const getPublishedPrograms = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPrograms(data)
    }

    setLoading(false)
    return { data, error }
  }

  // Get single program (for detail page)
  const getProgram = async (slug) => {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    return { data, error }
  }

  // Get user's enrollments
  const getUserEnrollments = async () => {
    if (!user) return { data: null, error: null }

    setLoading(true)
    const { data, error } = await supabase
      .from('program_enrollments')
      .select(`
        *,
        programs (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setEnrollments(data)
    }

    setLoading(false)
    return { data, error }
  }

  // Get active enrollments only
  const getActiveEnrollments = async () => {
    if (!user) return { data: null, error: null }

    const { data, error } = await supabase
      .from('program_enrollments')
      .select(`
        *,
        programs (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    return { data, error }
  }

  // Check if user is enrolled in a program
  const isEnrolled = async (programId) => {
    if (!user) return { enrolled: false, enrollment: null }

    const { data, error } = await supabase
      .from('program_enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('program_id', programId)
      .eq('status', 'active')
      .maybeSingle()

    return { 
      enrolled: !!data, 
      enrollment: data,
      error 
    }
  }

  // Enroll in program
  const enrollInProgram = async (programId, fastingType = null) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    // Check if already enrolled
    const { enrolled } = await isEnrolled(programId)
    if (enrolled) {
      return { data: null, error: new Error('Already enrolled in this program') }
    }

    const { data, error } = await supabase
      .from('program_enrollments')
      .insert([{
        user_id: user.id,
        program_id: programId,
        start_date: new Date().toISOString().split('T')[0],
        current_day: 1,
        fasting_type: fastingType,
        status: 'active'
      }])
      .select()
      .single()

    if (!error) {
      await getUserEnrollments() // Refresh enrollments
    }

    return { data, error }
  }

  // Get current day for enrollment
  const getCurrentDay = (enrollment) => {
    if (!enrollment) return 1

    const startDate = new Date(enrollment.start_date)
    const today = new Date()
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))
    
    return Math.min(daysSinceStart + 1, enrollment.programs?.duration_days || 14)
  }

  // Get program day content
  const getProgramDay = async (programId, dayNumber) => {
    const { data, error } = await supabase
      .from('program_days')
      .select('*')
      .eq('program_id', programId)
      .eq('day_number', dayNumber)
      .single()

    return { data, error }
  }

  // Get all days for a program
  const getProgramDays = async (programId) => {
    const { data, error } = await supabase
      .from('program_days')
      .select('*')
      .eq('program_id', programId)
      .order('day_number', { ascending: true })

    return { data, error }
  }

  // Mark day as complete
  const completeProgramDay = async (enrollmentId, dayNumber, reflectionResponse = {}) => {
    // Check if already completed
    const { data: existing } = await supabase
      .from('program_day_completions')
      .select('id')
      .eq('enrollment_id', enrollmentId)
      .eq('day_number', dayNumber)
      .maybeSingle()

    if (existing) {
      // Update existing completion
      const { data, error } = await supabase
        .from('program_day_completions')
        .update({
          reflection_response: reflectionResponse,
          completed_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      return { data, error }
    } else {
      // Create new completion
      const { data, error } = await supabase
        .from('program_day_completions')
        .insert([{
          enrollment_id: enrollmentId,
          day_number: dayNumber,
          reflection_response: reflectionResponse,
          action_completed: true,
          completed_at: new Date().toISOString()
        }])
        .select()
        .single()

      return { data, error }
    }
  }

  // Check if day is completed
  const isDayCompleted = async (enrollmentId, dayNumber) => {
    const { data, error } = await supabase
      .from('program_day_completions')
      .select('*')
      .eq('enrollment_id', enrollmentId)
      .eq('day_number', dayNumber)
      .maybeSingle()

    return { 
      completed: !!data, 
      completion: data,
      error 
    }
  }

  // Get completion for a day
  const getDayCompletion = async (enrollmentId, dayNumber) => {
    const { data, error } = await supabase
      .from('program_day_completions')
      .select('*')
      .eq('enrollment_id', enrollmentId)
      .eq('day_number', dayNumber)
      .maybeSingle()

    return { data, error }
  }

  return {
    programs,
    enrollments,
    loading,
    getPublishedPrograms,
    getProgram,
    getUserEnrollments,
    getActiveEnrollments,
    isEnrolled,
    enrollInProgram,
    getCurrentDay,
    getProgramDay,
    getProgramDays,
    completeProgramDay,
    isDayCompleted,
    getDayCompletion
  }
}
