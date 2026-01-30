import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { useNotifications } from '../contexts/NotificationContext'
import { 
  getNotificationPreferences, 
  updateNotificationPreferences 
} from '../lib/notifications'
import {
  Bell,
  BellOff,
  Smartphone,
  Mail,
  Droplets,
  BookOpen,
  Trophy,
  Utensils,
  Users,
  HandHeart,
  Flame,
  CreditCard,
  Moon,
  Save,
  Loader2,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Clock,
  Check
} from 'lucide-react'

const NotificationSettings = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { toast } = useToast()
  const { pushSupported, pushEnabled, enablePush, disablePush, refreshPreferences } = useNotifications()
  
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [enablingPush, setEnablingPush] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [user])

  const loadPreferences = async () => {
    setLoading(true)
    const prefs = await getNotificationPreferences(user.id)
    setPreferences(prefs)
    setLoading(false)
  }

  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleTimeChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateNotificationPreferences(user.id, preferences)
      refreshPreferences()
      toast.success('Preferences saved!')
    } catch (error) {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleEnablePush = async () => {
    setEnablingPush(true)
    try {
      await enablePush()
      toast.success('Push notifications enabled! 🔔')
    } catch (error) {
      toast.error(error.message || 'Failed to enable push notifications')
    } finally {
      setEnablingPush(false)
    }
  }

  const handleDisablePush = async () => {
    try {
      await disablePush()
      toast.success('Push notifications disabled')
    } catch (error) {
      toast.error('Failed to disable push notifications')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin" />
      </div>
    )
  }

  const Toggle = ({ enabled, onToggle, disabled = false }) => (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        enabled ? 'bg-temple-purple' : isDark ? 'bg-gray-600' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  )

  const Section = ({ title, icon: Icon, children }) => (
    <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isDark ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <Icon className="w-5 h-5 text-temple-purple" />
        </div>
        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )

  const SettingRow = ({ label, description, enabled, onToggle, disabled = false, children }) => (
    <div className={`flex items-center justify-between py-2 ${
      disabled ? 'opacity-50' : ''
    }`}>
      <div className="flex-1">
        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {label}
        </p>
        {description && (
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {description}
          </p>
        )}
        {children}
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} disabled={disabled} />
    </div>
  )

  const TimeInput = ({ value, onChange, disabled = false }) => (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`mt-2 px-3 py-1.5 rounded-lg border text-sm ${
        isDark 
          ? 'bg-gray-700 border-gray-600 text-white' 
          : 'bg-gray-50 border-gray-200 text-gray-900'
      } ${disabled ? 'opacity-50' : ''}`}
    />
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-display font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Notification Settings
        </h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Choose how and when you want to be notified
        </p>
      </div>

      {/* Push Notifications */}
      <div className={`rounded-2xl p-6 ${
        isDark 
          ? 'bg-gradient-to-r from-temple-purple/20 to-temple-gold/10 border border-temple-purple/30' 
          : 'bg-gradient-to-r from-temple-purple/10 to-temple-gold/10 border border-temple-purple/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-temple-purple/20' : 'bg-temple-purple/10'
            }`}>
              {pushEnabled ? (
                <Bell className="w-7 h-7 text-temple-purple" />
              ) : (
                <BellOff className="w-7 h-7 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Push Notifications
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {pushEnabled 
                  ? 'Receiving notifications on this device' 
                  : 'Enable to receive real-time notifications'}
              </p>
            </div>
          </div>
          {pushSupported ? (
            pushEnabled ? (
              <button
                onClick={handleDisablePush}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${
                  isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Disable
              </button>
            ) : (
              <button
                onClick={handleEnablePush}
                disabled={enablingPush}
                className="px-4 py-2 rounded-xl bg-temple-purple text-white text-sm font-medium flex items-center gap-2"
              >
                {enablingPush ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                Enable
              </button>
            )
          ) : (
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Not supported
            </span>
          )}
        </div>
      </div>

      {/* Master Toggles */}
      <Section title="Notification Channels" icon={Smartphone}>
        <SettingRow
          label="Push Notifications"
          description="Show notifications on your device"
          enabled={preferences.push_enabled}
          onToggle={() => handleToggle('push_enabled')}
        />
        <SettingRow
          label="Email Notifications"
          description="Receive notifications via email"
          enabled={preferences.email_enabled}
          onToggle={() => handleToggle('email_enabled')}
        />
      </Section>

      {/* Feature Reminders */}
      <Section title="Daily Reminders" icon={Clock}>
        <SettingRow
          label="Water Reminders"
          description="Reminders to stay hydrated"
          enabled={preferences.water_reminders}
          onToggle={() => handleToggle('water_reminders')}
        >
          {preferences.water_reminders && (
            <div className="flex flex-wrap gap-2 mt-2">
              {preferences.water_reminder_times?.map((time, index) => (
                <span 
                  key={index}
                  className={`px-2 py-1 rounded-lg text-xs ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {time}
                </span>
              ))}
            </div>
          )}
        </SettingRow>

        <SettingRow
          label="Daily Devotional"
          description="Morning devotional reminder"
          enabled={preferences.devotional_reminder}
          onToggle={() => handleToggle('devotional_reminder')}
        >
          {preferences.devotional_reminder && (
            <TimeInput
              value={preferences.devotional_reminder_time}
              onChange={(v) => handleTimeChange('devotional_reminder_time', v)}
            />
          )}
        </SettingRow>

        <SettingRow
          label="Challenge Reminders"
          description="Daily challenge task reminders"
          enabled={preferences.challenge_reminders}
          onToggle={() => handleToggle('challenge_reminders')}
        >
          {preferences.challenge_reminders && (
            <TimeInput
              value={preferences.challenge_reminder_time}
              onChange={(v) => handleTimeChange('challenge_reminder_time', v)}
            />
          )}
        </SettingRow>

        <SettingRow
          label="Meal Reminders"
          description="Reminders for meal times"
          enabled={preferences.meal_reminders}
          onToggle={() => handleToggle('meal_reminders')}
        />
      </Section>

      {/* Community */}
      <Section title="Community" icon={Users}>
        <SettingRow
          label="Likes"
          description="When someone likes your post"
          enabled={preferences.community_likes}
          onToggle={() => handleToggle('community_likes')}
        />
        <SettingRow
          label="Comments"
          description="When someone comments on your post"
          enabled={preferences.community_comments}
          onToggle={() => handleToggle('community_comments')}
        />
        <SettingRow
          label="Mentions"
          description="When someone mentions you"
          enabled={preferences.community_mentions}
          onToggle={() => handleToggle('community_mentions')}
        />
      </Section>

      {/* Prayer */}
      <Section title="Prayer Wall" icon={HandHeart}>
        <SettingRow
          label="Prayer Support"
          description="When someone prays for your request"
          enabled={preferences.prayer_responses}
          onToggle={() => handleToggle('prayer_responses')}
        />
        <SettingRow
          label="Answered Prayers"
          description="Updates when prayers are answered"
          enabled={preferences.prayer_answered}
          onToggle={() => handleToggle('prayer_answered')}
        />
      </Section>

      {/* Pods */}
      <Section title="Accountability Pods" icon={Users}>
        <SettingRow
          label="Pod Messages"
          description="New messages in your pods"
          enabled={preferences.pod_messages}
          onToggle={() => handleToggle('pod_messages')}
        />
        <SettingRow
          label="Pod Activity"
          description="When members join or complete tasks"
          enabled={preferences.pod_activity}
          onToggle={() => handleToggle('pod_activity')}
        />
      </Section>

      {/* Streaks */}
      <Section title="Streaks & Progress" icon={Flame}>
        <SettingRow
          label="Streak Reminders"
          description="Daily reminder to maintain your streak"
          enabled={preferences.streak_reminders}
          onToggle={() => handleToggle('streak_reminders')}
        />
        <SettingRow
          label="Streak Milestones"
          description="Celebrate streak achievements"
          enabled={preferences.streak_milestones}
          onToggle={() => handleToggle('streak_milestones')}
        />
        <SettingRow
          label="Streak at Risk"
          description="Alert when streak might break"
          enabled={preferences.streak_risk_alert}
          onToggle={() => handleToggle('streak_risk_alert')}
        />
      </Section>

      {/* Subscription */}
      <Section title="Subscription" icon={CreditCard}>
        <SettingRow
          label="Subscription Alerts"
          description="Payment reminders and updates"
          enabled={preferences.subscription_alerts}
          onToggle={() => handleToggle('subscription_alerts')}
        />
      </Section>

      {/* Quiet Hours */}
      <Section title="Quiet Hours" icon={Moon}>
        <SettingRow
          label="Enable Quiet Hours"
          description="Pause notifications during set times"
          enabled={preferences.quiet_hours_enabled}
          onToggle={() => handleToggle('quiet_hours_enabled')}
        />
        {preferences.quiet_hours_enabled && (
          <div className="flex items-center gap-4 mt-2">
            <div>
              <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Start
              </label>
              <TimeInput
                value={preferences.quiet_hours_start}
                onChange={(v) => handleTimeChange('quiet_hours_start', v)}
              />
            </div>
            <div>
              <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                End
              </label>
              <TimeInput
                value={preferences.quiet_hours_end}
                onChange={(v) => handleTimeChange('quiet_hours_end', v)}
              />
            </div>
          </div>
        )}
      </Section>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-semibold flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Preferences
          </>
        )}
      </button>
    </div>
  )
}

export default NotificationSettings