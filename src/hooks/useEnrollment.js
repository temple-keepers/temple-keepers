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
      .select('*, programs(id, title, slug, description, duration_days, program_type, includes_fasting, cover_image_url)')
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
      .select('*, programs(id, title, slug, description, duration_days, program_type, includes_fasting, cover_image_url)')
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
      .select('*, programs(*)')
      .eq('user_id', user.id)
      .eq('program_id', programId)
      .eq('status', 'active')
      .maybeSingle()

    return { data, error }
  }

  // Enroll in program
  const enrollInProgram = async (enrollmentData) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    // Support both old format (programId, fastingType, startDate) and new format (enrollmentData object)
    let programId, startDate, fastingType, fastingWindow, cohortId
    
    if (typeof enrollmentData === 'object' && enrollmentData.program_id) {
      // New format: object with all data
      programId = enrollmentData.program_id
      startDate = enrollmentData.start_date
      fastingType = enrollmentData.fasting_type
      fastingWindow = enrollmentData.fasting_window
      cohortId = enrollmentData.cohort_id
    } else {
      // Old format: separate parameters (backwards compatibility)
      programId = arguments[0]
      fastingType = arguments[1]
      startDate = arguments[2]
    }

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
        const updateData = { 
          status: 'active',
          start_date: enrollmentStartDate,
          current_day: 1,
          completed_days: []
        }
        
        // Add fasting data if provided
        if (fastingType) updateData.fasting_type = fastingType
        if (fastingWindow) updateData.fasting_window = fastingWindow
        if (cohortId) updateData.cohort_id = cohortId
        
        const { data, error } = await supabase
          .from('program_enrollments')
          .update(updateData)
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
    const insertData = {
      user_id: user.id,
      program_id: programId,
      start_date: enrollmentStartDate,
      current_day: 1,
      status: 'active',
      completed_days: [],
      enrollment_round: 1
    }
    
    // Add fasting data if provided
    if (fastingType) insertData.fasting_type = fastingType
    if (fastingWindow) insertData.fasting_window = fastingWindow
    if (cohortId) insertData.cohort_id = cohortId
    
    const { data, error } = await supabase
      .from('program_enrollments')
      .insert([insertData])
      .select('*, programs(title, slug)')
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
    // Get current enrollment with program info
    const { data: enrollment } = await supabase
      .from('program_enrollments')
      .select('completed_days, programs(duration_days)')
      .eq('id', enrollmentId)
      .single()

    if (!enrollment) return { error: new Error('Enrollment not found') }

    // Add ONLY this day to completed days if not already there
    const completedDays = [...(enrollment.completed_days || [])]
    if (!completedDays.includes(dayNumber)) {
      completedDays.push(dayNumber)
    }

    // Calculate completion percentage
    const totalDays = enrollment.programs?.duration_days || 1
    const completionPercentage = Math.round((completedDays.length / totalDays) * 100)

    // Update enrollment — only update completed_days, current_day, and percentage
    const { data: updatedEnrollment, error: enrollmentError } = await supabase
      .from('program_enrollments')
      .update({ 
        completed_days: completedDays,
        current_day: dayNumber + 1,
        completion_percentage: completionPercentage
      })
      .eq('id', enrollmentId)
      .select()
      .single()

    if (enrollmentError) return { error: enrollmentError }

    // Save completion record (upsert to avoid duplicates)
    const { data: completion, error: completionError } = await supabase
      .from('program_day_completions')
      .upsert([{
        enrollment_id: enrollmentId,
        day_number: dayNumber,
        reflection_response: reflectionResponse,
        action_completed: true
      }], { onConflict: 'enrollment_id,day_number', ignoreDuplicates: false })
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
      .select('*, programs(title, slug)')
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
