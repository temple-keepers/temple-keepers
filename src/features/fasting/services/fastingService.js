import { supabase } from '../../../lib/supabase'

export const fastingService = {
  // Get cohort by ID
  async getCohortById(cohortId) {
    const { data, error } = await supabase
      .from('program_cohorts')
      .select('*')
      .eq('id', cohortId)
      .single()
    
    if (error) throw error
    return data
  },

  // Get active cohorts for a program (includes upcoming that have reached start_date)
  async getActiveCohorts(programId) {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('program_cohorts')
      .select('*')
      .eq('program_id', programId)
      .in('status', ['active', 'upcoming'])
      .lte('start_date', now)
      .gte('end_date', now)
      .order('start_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get next live session for a cohort
  async getNextSession(cohortId) {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('live_sessions')
      .select('*')
      .eq('cohort_id', cohortId)
      .gte('session_date', now)
      .order('session_date', { ascending: true })
      .limit(1)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows
      throw error
    }
    return data
  },

  // Get all sessions for a cohort
  async getSessionsForCohort(cohortId) {
    const { data, error } = await supabase
      .from('live_sessions')
      .select('*')
      .eq('cohort_id', cohortId)
      .order('session_date', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Get fasting log for a specific date
  async getFastingLog(userId, enrollmentId, date) {
    const { data, error } = await supabase
      .from('fasting_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('enrollment_id', enrollmentId)
      .eq('log_date', date)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows
      throw error
    }
    return data
  },

  // Save/update fasting log
  async saveFastingLog(userId, enrollmentId, logData) {
    const { log_date, ...fields } = logData
    
    // Check if log exists
    const existing = await this.getFastingLog(userId, enrollmentId, log_date)
    
    if (existing) {
      // Update
      const { data, error } = await supabase
        .from('fasting_logs')
        .update(fields)
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      // Insert
      const { data, error } = await supabase
        .from('fasting_logs')
        .insert([{
          user_id: userId,
          enrollment_id: enrollmentId,
          log_date,
          ...fields
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  // Get fasting stats for an enrollment
  async getFastingStats(userId, enrollmentId) {
    const { data, error } = await supabase
      .from('fasting_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('enrollment_id', enrollmentId)
      .order('log_date', { ascending: true })
    
    if (error) throw error
    
    // Calculate stats
    const totalDays = data.length
    const foodCompliant = data.filter(log => log.food_fast_compliant === true).length
    const mediaCompliant = data.filter(log => log.media_fast_compliant === true).length
    const comfortCompliant = data.filter(log => log.comfort_fast_compliant === true).length
    
    return {
      totalDays,
      foodCompliant,
      mediaCompliant,
      comfortCompliant,
      foodComplianceRate: totalDays > 0 ? (foodCompliant / totalDays) * 100 : 0,
      mediaComplianceRate: totalDays > 0 ? (mediaCompliant / totalDays) * 100 : 0,
      comfortComplianceRate: totalDays > 0 ? (comfortCompliant / totalDays) * 100 : 0,
      logs: data
    }
  },

  // Mark attendance for a session
  async markAttendance(userId, sessionId) {
    const { data, error} = await supabase
      .from('session_attendance')
      .insert([{
        user_id: userId,
        session_id: sessionId,
        attended_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Check if user attended a session
  async checkAttendance(userId, sessionId) {
    const { data, error } = await supabase
      .from('session_attendance')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return false
      throw error
    }
    return !!data
  }
}
