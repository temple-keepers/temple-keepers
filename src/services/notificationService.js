import { supabase } from '../lib/supabase'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const notificationService = {
  // Check if push notifications are supported
  isSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
  },

  // Get current permission status
  getPermission() {
    if (!('Notification' in window)) return 'unsupported'
    return Notification.permission
  },

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported()) return 'unsupported'
    const permission = await Notification.requestPermission()
    return permission
  },

  // Subscribe to push notifications (stores subscription in DB)
  async subscribeToPush(userId) {
    if (!this.isSupported()) return null
    
    const permission = await this.requestPermission()
    if (permission !== 'granted') return null

    try {
      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Save to Supabase
        const subJson = subscription.toJSON()
        await supabase.from('push_subscriptions').upsert({
          user_id: userId,
          endpoint: subJson.endpoint,
          keys: subJson.keys
        }, { onConflict: 'user_id,endpoint' })
      }

      return subscription
    } catch (error) {
      console.error('Push subscription failed:', error)
      return null
    }
  },

  // Unsubscribe from push
  async unsubscribeFromPush(userId) {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', userId)
          .eq('endpoint', subscription.endpoint)
      }
    } catch (error) {
      console.error('Push unsubscribe failed:', error)
    }
  },

  // Send a local notification (browser Notification API)
  sendLocalNotification(title, body, options = {}) {
    if (Notification.permission !== 'granted') return null

    const notification = new Notification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: options.tag || 'temple-keepers',
      ...options
    })

    if (options.onClick) {
      notification.onclick = options.onClick
    }

    return notification
  },

  // Schedule a local reminder with setTimeout
  scheduleReminder(title, body, delayMs, options = {}) {
    if (delayMs <= 0) return null
    return setTimeout(() => {
      this.sendLocalNotification(title, body, options)
    }, delayMs)
  },

  // === IN-APP NOTIFICATIONS ===

  async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('in_app_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    
    if (error) return 0
    return count || 0
  },

  async getNotifications(userId, limit = 20) {
    const { data, error } = await supabase
      .from('in_app_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) return []
    return data
  },

  async markAsRead(notificationId) {
    await supabase
      .from('in_app_notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
  },

  async markAllAsRead(userId) {
    await supabase
      .from('in_app_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
  },

  async createNotification(userId, title, body, type = 'general', link = null) {
    const { data, error } = await supabase
      .from('in_app_notifications')
      .insert([{ user_id: userId, title, body, type, link }])
      .select()
      .single()
    
    if (error) console.error('Create notification failed:', error)
    return data
  },

  // === NOTIFICATION PREFERENCES ===

  async getPreferences(userId) {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error?.code === 'PGRST116') {
      const { data: newData } = await supabase
        .from('notification_preferences')
        .insert([{ user_id: userId }])
        .select()
        .single()
      return newData
    }
    
    return data
  },

  async updatePreferences(userId, prefs) {
    const { data, error } = await supabase
      .from('notification_preferences')
      .update({ ...prefs, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // === FASTING WINDOW REMINDERS ===

  scheduleFastingReminders(fastingWindow) {
    if (!fastingWindow) return []
    
    const [start, end] = fastingWindow.split('-')
    const now = new Date()
    const timers = []

    const parseTime = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number)
      const d = new Date()
      d.setHours(h, m, 0, 0)
      return d
    }

    const startTime = parseTime(start)
    const endTime = parseTime(end)

    // 15min before eating window opens
    const preStart = new Date(startTime.getTime() - 15 * 60 * 1000)
    if (preStart > now) {
      timers.push(this.scheduleReminder(
        '🍽️ Eating window opens soon',
        `Your eating window starts at ${start}. Prepare something nourishing!`,
        preStart.getTime() - now.getTime(),
        { tag: 'fasting-start' }
      ))
    }

    // 30min before eating window closes
    const preEnd = new Date(endTime.getTime() - 30 * 60 * 1000)
    if (preEnd > now) {
      timers.push(this.scheduleReminder(
        '⏰ Eating window closing soon',
        `Your eating window ends at ${end}. Last chance for a meal!`,
        preEnd.getTime() - now.getTime(),
        { tag: 'fasting-end' }
      ))
    }

    return timers
  },

  // Schedule morning devotional reminder
  scheduleMorningReminder(reminderTime = '07:00') {
    const [h, m] = reminderTime.split(':').map(Number)
    const now = new Date()
    const target = new Date()
    target.setHours(h, m, 0, 0)
    
    if (target <= now) return null // Already passed today
    
    return this.scheduleReminder(
      '📖 Your Daily Bread is ready',
      'Start your day with today\'s devotional and scripture.',
      target.getTime() - now.getTime(),
      { tag: 'devotional' }
    )
  }
}
