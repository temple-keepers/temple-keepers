import { supabase } from './supabase'
import { notificationTriggers } from './notifications'

// ============================================
// STREAK TRACKING
// ============================================

export const checkAndUpdateStreak = async (userId, habitType) => {
  // Get user profile with streak info
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak, last_activity_date')
    .eq('id', userId)
    .single()

  if (!profile) return

  const today = new Date().toISOString().split('T')[0]
  const lastActivity = profile.last_activity_date

  let newStreak = profile.streak || 0

  if (lastActivity === today) {
    // Already logged today, no change
    return { streak: newStreak, isNew: false }
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (lastActivity === yesterdayStr) {
    // Consecutive day - increment streak
    newStreak += 1
  } else {
    // Streak broken - reset to 1
    newStreak = 1
  }

  // Update profile
  await supabase
    .from('profiles')
    .update({
      streak: newStreak,
      last_activity_date: today
    })
    .eq('id', userId)

  // Check for milestones and send notifications
  const milestones = [7, 14, 21, 30, 50, 66, 100, 150, 200, 365]
  if (milestones.includes(newStreak)) {
    try {
      await notificationTriggers.streakMilestone(userId, habitType, newStreak)
    } catch (err) {
      console.error('Failed to send streak milestone notification:', err)
    }
  }

  return { streak: newStreak, isNew: true }
}

// Check if streak is at risk (called by scheduled job)
export const checkStreakAtRisk = async (userId) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak, last_activity_date')
    .eq('id', userId)
    .single()

  if (!profile || !profile.streak || profile.streak < 3) return false

  const today = new Date().toISOString().split('T')[0]
  const lastActivity = profile.last_activity_date

  // If last activity was yesterday and they haven't logged today, streak is at risk
  if (lastActivity !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastActivity === yesterdayStr) {
      return true // Streak is at risk
    }
  }

  return false
}

// Notify users with streaks at risk (for scheduled cron job)
export const notifyUsersStreakAtRisk = async () => {
  // Get all users with active streaks >= 3 days
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, streak, last_activity_date')
    .gte('streak', 3)

  if (!profiles) return

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  for (const profile of profiles) {
    // If last activity was yesterday and they haven't logged today
    if (profile.last_activity_date === yesterdayStr) {
      try {
        await notificationTriggers.streakRisk(profile.id, 'activity', profile.streak)
      } catch (err) {
        console.error('Failed to send streak risk notification:', err)
      }
    }
  }
}
