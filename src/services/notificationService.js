import { supabase } from '../lib/supabase'

// VAPID public key for push subscriptions
const VAPID_PUBLIC_KEY = 'BBhSRp-tbrs4o2Fb_xEMaeemW_05uq_wxGEm8fd1_KPAxofh-UqJKu3_QXvdtI0Qjzxxke4Q5zGNW4PKvw-zY2U'

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

  // Subscribe to push notifications
  async subscribeToPush(userId) {
    if (!this.isSupported()) return null

    const permission = await this.requestPermission()
    if (permission !== 'granted') return null

    try {
      const registration = await navigator.serviceWorker.ready

      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription()

      // If no subscription exists, create one with VAPID key
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        })
      }

      // Save to Supabase
      const subJson = subscription.toJSON()
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        endpoint: subJson.endpoint,
        keys: subJson.keys,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id,endpoint' })

      if (error) {
        console.error('Failed to save push subscription:', error)
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

  // Send a local notification (browser Notification API — for immediate use while app is open)
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

  _defaults(userId) {
    return {
      user_id: userId,
      push_enabled: true,
      devotional_reminder: true,
      fasting_reminder: true,
      live_session_reminder: true,
      community_notifications: true,
      morning_enabled: true,
      morning_time: '07:00:00',
      evening_enabled: true,
      evening_time: '19:00:00',
      reminder_time: '07:00:00'
    }
  },

  async getPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (data) return data

      const { data: newData, error: upsertErr } = await supabase
        .from('notification_preferences')
        .upsert({ user_id: userId }, { onConflict: 'user_id' })
        .select()
        .single()

      if (upsertErr || !newData) {
        console.error('Failed to create notification prefs:', upsertErr)
        return this._defaults(userId)
      }
      return newData
    } catch (err) {
      console.error('getPreferences error:', err)
      return this._defaults(userId)
    }
  },

  async updatePreferences(userId, prefs) {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert(
        { user_id: userId, ...prefs, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) throw error
    return data
  },

  // === FASTING WINDOW REMINDERS (local, while app is open) ===

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
      timers.push(setTimeout(() => {
        this.sendLocalNotification(
          '🍽️ Eating window opens soon',
          `Your eating window starts at ${start}. Prepare something nourishing!`,
          { tag: 'fasting-start' }
        )
      }, preStart.getTime() - now.getTime()))
    }

    // 30min before eating window closes
    const preEnd = new Date(endTime.getTime() - 30 * 60 * 1000)
    if (preEnd > now) {
      timers.push(setTimeout(() => {
        this.sendLocalNotification(
          '⏰ Eating window closing soon',
          `Your eating window ends at ${end}. Last chance for a meal!`,
          { tag: 'fasting-end' }
        )
      }, preEnd.getTime() - now.getTime()))
    }

    return timers
  }
}
