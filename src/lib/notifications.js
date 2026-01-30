import { supabase } from './supabase'

// ============================================
// NOTIFICATION MANAGEMENT
// ============================================

// Get all notifications for user
export const getNotifications = async (userId, limit = 50, unreadOnly = false) => {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
  return data || []
}

// Get unread count
export const getUnreadCount = async (userId) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }
  return count || 0
}

// Mark notification as read
export const markAsRead = async (notificationId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
  return true
}

// Mark all as read
export const markAllAsRead = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) throw error
  return true
}

// Mark as seen (for badge count)
export const markAsSeen = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_seen: true })
    .eq('user_id', userId)
    .eq('is_seen', false)

  if (error) throw error
  return true
}

// Delete notification
export const deleteNotification = async (notificationId) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) throw error
  return true
}

// Clear all notifications
export const clearAllNotifications = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
  return true
}

// Create notification (internal use)
export const createNotification = async (userId, type, title, message, options = {}) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      icon: options.icon || 'bell',
      action_url: options.actionUrl || null,
      action_label: options.actionLabel || null,
      data: options.data || {}
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    throw error
  }
  return data
}

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

// Get user preferences
export const getNotificationPreferences = async (userId) => {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching preferences:', error)
  }

  // Return defaults if no preferences exist
  if (!data) {
    return {
      push_enabled: true,
      email_enabled: true,
      water_reminders: true,
      water_reminder_times: ['08:00', '12:00', '15:00', '18:00'],
      devotional_reminder: true,
      devotional_reminder_time: '07:00',
      challenge_reminders: true,
      challenge_reminder_time: '09:00',
      meal_reminders: true,
      meal_reminder_times: { breakfast: '07:30', lunch: '12:00', dinner: '18:00' },
      community_likes: true,
      community_comments: true,
      community_mentions: true,
      prayer_responses: true,
      prayer_answered: true,
      pod_messages: true,
      pod_activity: true,
      streak_reminders: true,
      streak_milestones: true,
      streak_risk_alert: true,
      subscription_alerts: true,
      quiet_hours_enabled: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '07:00'
    }
  }

  return data
}

// Update preferences
export const updateNotificationPreferences = async (userId, updates) => {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    console.error('Error updating preferences:', error)
    throw error
  }
  return data
}

// ============================================
// PUSH SUBSCRIPTIONS
// ============================================

// Save push subscription
export const savePushSubscription = async (userId, subscription, deviceInfo = {}) => {
  const { endpoint, keys } = subscription

  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      device_name: deviceInfo.deviceName || null,
      browser: deviceInfo.browser || null,
      last_used_at: new Date().toISOString()
    }, { onConflict: 'endpoint' })
    .select()
    .single()

  if (error) {
    console.error('Error saving push subscription:', error)
    throw error
  }
  return data
}

// Remove push subscription
export const removePushSubscription = async (endpoint) => {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)

  if (error) throw error
  return true
}

// Get user's push subscriptions
export const getPushSubscriptions = async (userId) => {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching push subscriptions:', error)
    return []
  }
  return data || []
}

// ============================================
// NOTIFICATION TRIGGERS (for features to call)
// ============================================

export const notificationTriggers = {
  // Water reminder
  waterReminder: async (userId) => {
    return createNotification(
      userId,
      'water_reminder',
      '💧 Hydration Check',
      'Time to drink a glass of water! Stay hydrated.',
      {
        icon: 'droplets',
        actionUrl: '/water',
        actionLabel: 'Log Water'
      }
    )
  },

  // Devotional ready
  devotionalReady: async (userId, devotionalTitle) => {
    return createNotification(
      userId,
      'devotional_ready',
      '📖 Daily Devotional',
      `Today's devotional is ready: "${devotionalTitle}"`,
      {
        icon: 'book-open',
        actionUrl: '/devotionals',
        actionLabel: 'Read Now'
      }
    )
  },

  // Challenge reminder
  challengeReminder: async (userId, challengeTitle, dayNumber) => {
    return createNotification(
      userId,
      'challenge_reminder',
      '🎯 Challenge Day ' + dayNumber,
      `Don't forget today's tasks for "${challengeTitle}"`,
      {
        icon: 'trophy',
        actionUrl: '/challenges',
        actionLabel: 'View Tasks',
        data: { dayNumber }
      }
    )
  },

  // Challenge day completed
  challengeDayComplete: async (userId, dayNumber, points) => {
    return createNotification(
      userId,
      'challenge_complete',
      '🎉 Day ' + dayNumber + ' Complete!',
      `Great work! You earned ${points} points.`,
      {
        icon: 'check-circle',
        actionUrl: '/challenges'
      }
    )
  },

  // Community like
  communityLike: async (userId, likerName, postPreview) => {
    return createNotification(
      userId,
      'community_like',
      '❤️ New Like',
      `${likerName} liked your post: "${postPreview.substring(0, 50)}..."`,
      {
        icon: 'heart',
        actionUrl: '/community'
      }
    )
  },

  // Community comment
  communityComment: async (userId, commenterName, commentPreview) => {
    return createNotification(
      userId,
      'community_comment',
      '💬 New Comment',
      `${commenterName}: "${commentPreview.substring(0, 50)}..."`,
      {
        icon: 'message-circle',
        actionUrl: '/community'
      }
    )
  },

  // Someone prayed for you
  prayerReceived: async (userId, prayerCount) => {
    return createNotification(
      userId,
      'prayer_prayed',
      '🙏 Prayer Support',
      `Someone prayed for your request! (${prayerCount} total prayers)`,
      {
        icon: 'hand-heart',
        actionUrl: '/community'
      }
    )
  },

  // Pod message
  podMessage: async (userId, podName, senderName, preview) => {
    return createNotification(
      userId,
      'pod_message',
      `💬 ${podName}`,
      `${senderName}: "${preview.substring(0, 50)}..."`,
      {
        icon: 'users',
        actionUrl: '/community'
      }
    )
  },

  // Streak at risk
  streakRisk: async (userId, habitName, currentStreak) => {
    return createNotification(
      userId,
      'streak_risk',
      '⚠️ Streak at Risk!',
      `Your ${currentStreak}-day ${habitName} streak is at risk! Complete it today.`,
      {
        icon: 'flame',
        actionUrl: '/dashboard'
      }
    )
  },

  // Streak milestone
  streakMilestone: async (userId, habitName, streakDays) => {
    return createNotification(
      userId,
      'streak_milestone',
      '🔥 Streak Milestone!',
      `Amazing! ${streakDays} days of ${habitName}!`,
      {
        icon: 'flame',
        actionUrl: '/dashboard'
      }
    )
  },

  // Subscription trial ending
  trialEnding: async (userId, daysLeft) => {
    return createNotification(
      userId,
      'subscription_trial_ending',
      '⏰ Trial Ending Soon',
      `Your free trial ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Subscribe to keep your progress!`,
      {
        icon: 'clock',
        actionUrl: '/pricing',
        actionLabel: 'Subscribe Now'
      }
    )
  },

  // Payment failed
  paymentFailed: async (userId) => {
    return createNotification(
      userId,
      'subscription_failed',
      '❌ Payment Failed',
      'We couldn\'t process your payment. Please update your payment method.',
      {
        icon: 'alert-triangle',
        actionUrl: '/profile',
        actionLabel: 'Update Payment'
      }
    )
  },

  // Weekly summary
  weeklySummary: async (userId, stats) => {
    return createNotification(
      userId,
      'weekly_summary',
      '📊 Your Week in Review',
      `You completed ${stats.habitsCompleted} habits and earned ${stats.points} points!`,
      {
        icon: 'bar-chart',
        actionUrl: '/dashboard',
        data: stats
      }
    )
  }
}