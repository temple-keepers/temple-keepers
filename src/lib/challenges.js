import { supabase } from './supabase'

// Get all active challenges
export const getChallenges = async () => {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching challenges:', error)
    return []
  }
  return data || []
}

// Get single challenge by slug
export const getChallengeBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching challenge:', error)
    return null
  }
  return data
}

// Get challenge days
export const getChallengeDays = async (challengeId) => {
  const { data, error } = await supabase
    .from('challenge_days')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('day_number', { ascending: true })

  if (error) {
    console.error('Error fetching challenge days:', error)
    return []
  }
  return data || []
}

// Get user's challenge enrollment
export const getUserChallenge = async (userId, challengeId) => {
  const { data, error } = await supabase
    .from('user_challenges')
    .select('*')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user challenge:', error)
  }
  return data || null
}

// Get all user's challenges
export const getUserChallenges = async (userId) => {
  const { data, error } = await supabase
    .from('user_challenges')
    .select(`
      *,
      challenge:challenge_id (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user challenges:', error)
    return []
  }
  return data || []
}

// Join a challenge
export const joinChallenge = async (userId, challengeId, durationDays) => {
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + durationDays)

  const { data, error } = await supabase
    .from('user_challenges')
    .insert({
      user_id: userId,
      challenge_id: challengeId,
      status: 'active',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      current_day: 1,
      completed_days: 0
    })
    .select()
    .single()

  if (error) {
    console.error('Error joining challenge:', error)
    throw error
  }
  return data
}

// Leave/abandon challenge
export const leaveChallenge = async (userChallengeId) => {
  const { error } = await supabase
    .from('user_challenges')
    .update({ status: 'abandoned', updated_at: new Date().toISOString() })
    .eq('id', userChallengeId)

  if (error) {
    console.error('Error leaving challenge:', error)
    throw error
  }
  return true
}

// Get day progress
export const getDayProgress = async (userId, userChallengeId) => {
  const { data, error } = await supabase
    .from('challenge_day_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('user_challenge_id', userChallengeId)
    .order('day_number', { ascending: true })

  if (error) {
    console.error('Error fetching day progress:', error)
    return []
  }
  return data || []
}

// Complete a day
export const completeDay = async (userId, userChallengeId, challengeDayId, dayNumber, tasksCompleted, reflectionNotes, mood) => {
  // Insert/update day progress
  const { data: progressData, error: progressError } = await supabase
    .from('challenge_day_progress')
    .upsert({
      user_id: userId,
      user_challenge_id: userChallengeId,
      challenge_day_id: challengeDayId,
      day_number: dayNumber,
      is_completed: true,
      tasks_completed: tasksCompleted,
      reflection_notes: reflectionNotes,
      mood: mood,
      completed_at: new Date().toISOString()
    }, { onConflict: 'user_id,user_challenge_id,day_number' })
    .select()
    .single()

  if (progressError) {
    console.error('Error completing day:', progressError)
    throw progressError
  }

  // Update user challenge
  const { error: updateError } = await supabase
    .from('user_challenges')
    .update({ 
      completed_days: dayNumber,
      current_day: dayNumber + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', userChallengeId)

  if (updateError) {
    console.error('Error updating user challenge:', updateError)
  }

  return progressData
}

// Complete entire challenge
export const completeChallenge = async (userChallengeId, pointsReward) => {
  const { data, error } = await supabase
    .from('user_challenges')
    .update({ 
      status: 'completed',
      points_earned: pointsReward,
      updated_at: new Date().toISOString()
    })
    .eq('id', userChallengeId)
    .select()
    .single()

  if (error) {
    console.error('Error completing challenge:', error)
    throw error
  }
  return data
}

// Calculate current day of challenge
export const calculateCurrentDay = (startDate) => {
  const start = new Date(startDate)
  const today = new Date()
  const diffTime = today - start
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1 // Day 1 is the start date
}