import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead,
  markAsSeen,
  deleteNotification,
  getNotificationPreferences,
  savePushSubscription
} from '../lib/notifications'

const NotificationContext = createContext({})

export const useNotifications = () => useContext(NotificationContext)

// VAPID public key - replace with your own from Supabase or your push service
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [preferences, setPreferences] = useState(null)
  const [pushSupported, setPushSupported] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check push notification support
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window
    setPushSupported(supported)
  }, [])

  // Load notifications and preferences
  useEffect(() => {
    if (user) {
      loadNotifications()
      loadPreferences()
      checkPushStatus()
      
      // Subscribe to realtime notifications
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            setNotifications(prev => [payload.new, ...prev])
            setUnreadCount(prev => prev + 1)
            
            // Show browser notification if enabled
            if (pushEnabled && Notification.permission === 'granted') {
              showBrowserNotification(payload.new)
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } else {
      setNotifications([])
      setUnreadCount(0)
      setPreferences(null)
      setLoading(false)
    }
  }, [user, pushEnabled])

  const loadNotifications = async () => {
    setLoading(true)
    const [notifs, count] = await Promise.all([
      getNotifications(user.id),
      getUnreadCount(user.id)
    ])
    setNotifications(notifs)
    setUnreadCount(count)
    setLoading(false)
  }

  const loadPreferences = async () => {
    const prefs = await getNotificationPreferences(user.id)
    setPreferences(prefs)
  }

  const checkPushStatus = async () => {
    if (!pushSupported) return

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setPushEnabled(!!subscription)
    } catch (error) {
      console.error('Error checking push status:', error)
    }
  }

  // Enable push notifications
  const enablePush = async () => {
    if (!pushSupported) {
      throw new Error('Push notifications not supported')
    }

    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      throw new Error('Notification permission denied')
    }

    // Register service worker if not already
    const registration = await navigator.serviceWorker.ready

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })

    // Save subscription to database
    const browser = navigator.userAgent.includes('Chrome') ? 'Chrome' 
      : navigator.userAgent.includes('Firefox') ? 'Firefox'
      : navigator.userAgent.includes('Safari') ? 'Safari'
      : 'Unknown'

    await savePushSubscription(user.id, subscription.toJSON(), { browser })
    setPushEnabled(true)

    return true
  }

  // Disable push notifications
  const disablePush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
      }
      
      setPushEnabled(false)
      return true
    } catch (error) {
      console.error('Error disabling push:', error)
      throw error
    }
  }

  // Show browser notification
  const showBrowserNotification = (notification) => {
    if (Notification.permission !== 'granted') return

    const iconMap = {
      water_reminder: '💧',
      devotional_ready: '📖',
      challenge_reminder: '🎯',
      challenge_complete: '🎉',
      community_like: '❤️',
      community_comment: '💬',
      prayer_prayed: '🙏',
      pod_message: '👥',
      streak_risk: '⚠️',
      streak_milestone: '🔥'
    }

    new Notification(notification.title, {
      body: notification.message,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: notification.id,
      data: { url: notification.action_url }
    })
  }

  // Mark single notification as read
  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId)
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead(user.id)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  // Delete notification
  const handleDelete = async (notificationId) => {
    await deleteNotification(notificationId)
    const wasUnread = notifications.find(n => n.id === notificationId && !n.is_read)
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  // Mark as seen (when opening notification panel)
  const handleMarkAsSeen = async () => {
    await markAsSeen(user.id)
    setNotifications(prev => prev.map(n => ({ ...n, is_seen: true })))
  }

  const value = {
    notifications,
    unreadCount,
    preferences,
    loading,
    pushSupported,
    pushEnabled,
    enablePush,
    disablePush,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    markAsSeen: handleMarkAsSeen,
    deleteNotification: handleDelete,
    refresh: loadNotifications,
    refreshPreferences: loadPreferences
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Helper function
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default NotificationProvider