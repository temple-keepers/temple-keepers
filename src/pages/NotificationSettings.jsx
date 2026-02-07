import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { notificationService } from '../services/notificationService'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import { Bell, BellOff, Clock, BookOpen, UtensilsCrossed, Video, Users, Save, Smartphone, AlertTriangle } from 'lucide-react'

export const NotificationSettings = () => {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pushStatus, setPushStatus] = useState('default') // default, granted, denied, unsupported

  useEffect(() => {
    if (user) loadPrefs()
    setPushStatus(notificationService.getPermission())
  }, [user])

  const loadPrefs = async () => {
    setLoading(true)
    const data = await notificationService.getPreferences(user.id)
    setPrefs(data)
    setLoading(false)
  }

  const handleToggle = (field) => {
    setPrefs(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleTimeChange = (field, value) => {
    setPrefs(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await notificationService.updatePreferences(user.id, {
        push_enabled: prefs.push_enabled,
        devotional_reminder: prefs.devotional_reminder,
        fasting_reminder: prefs.fasting_reminder,
        live_session_reminder: prefs.live_session_reminder,
        community_notifications: prefs.community_notifications,
        morning_enabled: prefs.morning_enabled,
        morning_time: prefs.morning_time,
        evening_enabled: prefs.evening_enabled,
        evening_time: prefs.evening_time,
        reminder_time: prefs.reminder_time
      })
      toast.success('Notification preferences saved!')
    } catch (err) {
      toast.error('Failed to save preferences')
    }
    setSaving(false)
  }

  const handleEnablePush = async () => {
    const permission = await notificationService.requestPermission()
    setPushStatus(permission)
    if (permission === 'granted') {
      await notificationService.subscribeToPush(user.id)
      setPrefs(prev => ({ ...prev, push_enabled: true }))
      toast.success('Push notifications enabled!')
    } else if (permission === 'denied') {
      toast.error('Notifications blocked. Please enable in your browser settings.')
    }
  }

  const handleDisablePush = async () => {
    await notificationService.unsubscribeFromPush(user.id)
    setPrefs(prev => ({ ...prev, push_enabled: false }))
    toast.success('Push notifications disabled')
  }

  const ToggleSwitch = ({ enabled, onChange, label, description, icon: Icon }) => (
    <div className="flex items-start gap-3 py-3">
      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
          enabled
            ? 'bg-temple-purple dark:bg-temple-gold'
            : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )

  if (loading) {
    return (
      <>
        <AppHeader title="Notifications" showBackButton backTo="/profile" />
        <div className="min-h-screen p-4 pb-24 flex items-center justify-center">
          <div className="spinner"></div>
        </div>
        <BottomNav />
      </>
    )
  }

  return (
    <>
      <AppHeader title="Notifications" showBackButton backTo="/profile" />
      <div className="min-h-screen p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Push Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Push Notifications</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Receive reminders even when the app isn't open
            </p>

            {pushStatus === 'unsupported' ? (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Push notifications aren't supported in this browser. Try installing the app for the best experience.
                </p>
              </div>
            ) : pushStatus === 'denied' ? (
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <BellOff className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Notifications blocked</p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    To enable, go to your browser settings and allow notifications for this site.
                  </p>
                </div>
              </div>
            ) : pushStatus === 'granted' && prefs?.push_enabled ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <Bell className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">Push notifications are active</p>
                </div>
                <button
                  onClick={handleDisablePush}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Disable push notifications
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnablePush}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-temple-purple dark:bg-temple-gold text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Smartphone className="w-5 h-5" />
                Enable Push Notifications
              </button>
            )}
          </div>

          {/* Reminder Types */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Reminder Types</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Choose which reminders you'd like to receive
            </p>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <ToggleSwitch
                icon={BookOpen}
                label="Daily Devotional"
                description="Morning reminder to read your Daily Bread"
                enabled={prefs?.devotional_reminder}
                onChange={() => handleToggle('devotional_reminder')}
              />
              <ToggleSwitch
                icon={UtensilsCrossed}
                label="Fasting Reminders"
                description="Eating window open/close alerts"
                enabled={prefs?.fasting_reminder}
                onChange={() => handleToggle('fasting_reminder')}
              />
              <ToggleSwitch
                icon={Video}
                label="Live Session Alerts"
                description="Reminders before scheduled Zoom sessions"
                enabled={prefs?.live_session_reminder}
                onChange={() => handleToggle('live_session_reminder')}
              />
              <ToggleSwitch
                icon={Users}
                label="Community Activity"
                description="Pod messages, prayer requests, and reactions"
                enabled={prefs?.community_notifications}
                onChange={() => handleToggle('community_notifications')}
              />
            </div>
          </div>

          {/* Reminder Time */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Reminder Time</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              When would you like your daily devotional reminder?
            </p>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <input
                type="time"
                value={prefs?.reminder_time?.substring(0, 5) || '07:00'}
                onChange={(e) => handleTimeChange('reminder_time', e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-temple-purple dark:bg-temple-gold text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
      <BottomNav />
    </>
  )
}
