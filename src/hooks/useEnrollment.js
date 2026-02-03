import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useEnrollment = () => {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(false)

  // Get user's enrollments
  const getMyEnrollments = async () => {
    if (!user) return { data: null, error: null }

    setLoading(true)
    
    const { data, error } = await supabase
      .from('program_enrollments')
      .select(`
        *,
        programs (
          id,
          title,
          slug,
          description,
          duration_days,
          program_type,
          includes_fasting,
          cover_image_url
        )
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
        programs (
          id,
          title,
          slug,
          description,
          duration_days,
          program_type,
          includes_fasting,
          cover_image_url
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    return { data, error }
  }

  // Get single enrollment
  const getEnrollment = async (programId) => {
    if (!user) return { data: null, error: null }

    const { data, error } = await supabase
      .from('program_enrollments')
      .select(`
        *,
        programs (*)
      `)
      .eq('user_id', user.id)
      .eq('program_id', programId)
      .eq('status', 'active')
      .single()

    return { data, error }
  }

  // Enroll in program
  const enrollInProgram = async (programId, fastingType = null, startDate = null) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    // Use provided start date or default to today
    const enrollmentStartDate = startDate || new Date().toISOString().split('T')[0]

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('program_enrollments')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('program_id', programId)
      .single()

    if (existing) {
      if (existing.status === 'active') {
        return { data: null, error: new Error('Already enrolled in this program') }
      } else {
        // Reactivate enrollment
        const { data, error } = await supabase
          .from('program_enrollments')
          .update({ 
            status: 'active',
            start_date: enrollmentStartDate,
            current_day: 1,
            fasting_type: fastingType,
            completed_days: []
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (!error) {
          await getMyEnrollments()
        }

        return { data, error }
      }
    }

    // Create new enrollment
    const { data, error } = await supabase
      .from('program_enrollments')
      .insert([{
        user_id: user.id,
        program_id: programId,
        start_date: enrollmentStartDate,
        current_day: 1,
        fasting_type: fastingType,
        status: 'active',
        completed_days: []
      }])
      .select()
      .single()

    if (!error) {
      await getMyEnrollments()
    }

    return { data, error }
  }

  // Update current day
  const updateCurrentDay = async (enrollmentId, dayNumber) => {
    const { data, error } = await supabase
      .from('program_enrollments')
      .update({ current_day: dayNumber })
      .eq('id', enrollmentId)
      .select()
      .single()

    if (!error) {
      await getMyEnrollments()
    }

    return { data, error }
  }

  // Mark day complete
  const markDayComplete = async (enrollmentId, dayNumber, reflectionResponse = {}) => {
    // Get current enrollment
    const { data: enrollment } = await supabase
      .from('program_enrollments')
      .select('completed_days')
      .eq('id', enrollmentId)
      .single()

    if (!enrollment) return { error: new Error('Enrollment not found') }

    // Add day to completed days if not already there
    const completedDays = enrollment.completed_days || []
    if (!completedDays.includes(dayNumber)) {
      completedDays.push(dayNumber)
    }

    // Update enrollment
    const { data: updatedEnrollment, error: enrollmentError } = await supabase
      .from('program_enrollments')
      .update({ completed_days: completedDays })
      .eq('id', enrollmentId)
      .select()
      .single()

    if (enrollmentError) return { error: enrollmentError }

    // Save completion record
    const { data: completion, error: completionError } = await supabase
      .from('program_day_completions')
      .insert([{
        enrollment_id: enrollmentId,
        day_number: dayNumber,
        reflection_response: reflectionResponse,
        action_completed: true
      }])
      .select()
      .single()

    if (!completionError) {
      await getMyEnrollments()
    }

    return { data: completion, error: completionError }
  }

  // Check if day is completed
  const isDayCompleted = async (enrollmentId, dayNumber) => {
    const { data } = await supabase
      .from('program_day_completions')
      .select('id')
      .eq('enrollment_id', enrollmentId)
      .eq('day_number', dayNumber)
      .single()

    return !!data
  }

  // Complete program
  const completeProgram = async (enrollmentId) => {
    const { data, error } = await supabase
      .from('program_enrollments')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', enrollmentId)
      .select()
      .single()

    if (!error) {
      await getMyEnrollments()
    }

    return { data, error }
  }

  // Pause program
  const pauseProgram = async (enrollmentId) => {
    const { data, error } = await supabase
      .from('program_enrollments')
      .update({ status: 'paused' })
      .eq('id', enrollmentId)
      .select()
      .single()

    if (!error) {
      await getMyEnrollments()
    }

    return { data, error }
  }

  // Resume program
  const resumeProgram = async (enrollmentId) => {
    const { data, error } = await supabase
      .from('program_enrollments')
      .update({ status: 'active' })
      .eq('id', enrollmentId)
      .select()
      .single()

    if (!error) {
      await getMyEnrollments()
    }

    return { data, error }
  }

  return {
    enrollments,
    loading,
    getMyEnrollments,
    getActiveEnrollments,
    getEnrollment,
    enrollInProgram,
    updateCurrentDay,
    markDayComplete,
    isDayCompleted,
    completeProgram,
    pauseProgram,
    resumeProgram
  }
}
