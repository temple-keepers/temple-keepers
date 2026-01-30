import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../contexts/NotificationContext'
import { useTheme } from '../contexts/ThemeContext'
import {
  Bell,
  Settings,
  CheckCheck,
  Trash2,
  Filter,
  ChevronRight,
  Droplets,
  BookOpen,
  Trophy,
  Heart,
  MessageCircle,
  HandHeart,
  Users,
  Flame,
  AlertTriangle,
  CreditCard,
  BarChart
} from 'lucide-react'

const AllNotifications = () => {
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications()
  const { isDark } = useTheme()
  const [filter, setFilter] = useState('all')

  const iconMap = {
    water_reminder: Droplets,
    devotional_ready: BookOpen,
    challenge_reminder: Trophy,
    challenge_complete: Trophy,
    community_like: Heart,
    community_comment: MessageCircle,
    prayer_prayed: HandHeart,
    prayer_answered: HandHeart,
    pod_message: Users,
    streak_risk: AlertTriangle,
    streak_milestone: Flame,
    subscription_trial_ending: AlertTriangle,
    subscription_failed: AlertTriangle,
    weekly_summary: BarChart
  }

  const iconColorMap = {
    water_reminder: 'text-blue-500 bg-blue-500/10',
    devotional_ready: 'text-purple-500 bg-purple-500/10',
    challenge_reminder: 'text-orange-500 bg-orange-500/10',
    challenge_complete: 'text-green-500 bg-green-500/10',
    community_like: 'text-red-500 bg-red-500/10',
    community_comment: 'text-blue-500 bg-blue-500/10',
    prayer_prayed: 'text-purple-500 bg-purple-500/10',
    prayer_answered: 'text-green-500 bg-green-500/10',
    pod_message: 'text-indigo-500 bg-indigo-500/10',
    streak_risk: 'text-amber-500 bg-amber-500/10',
    streak_milestone: 'text-orange-500 bg-orange-500/10',
    subscription_trial_ending: 'text-amber-500 bg-amber-500/10',
    subscription_failed: 'text-red-500 bg-red-500/10',
    weekly_summary: 'text-blue-500 bg-blue-500/10'
  }

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'community', label: 'Community' },
    { id: 'reminders', label: 'Reminders' }
  ]

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read
    if (filter === 'community') return ['community_like', 'community_comment', 'prayer_prayed', 'pod_message'].includes(n.type)
    if (filter === 'reminders') return ['water_reminder', 'devotional_ready', 'challenge_reminder', 'meal_reminder'].includes(n.type)
    return true
  })

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const groupByDate = (notifications) => {
    const groups = {}
    notifications.forEach(n => {
      const date = new Date(n.created_at)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let key
      if (date.toDateString() === today.toDateString()) {
        key = 'Today'
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Yesterday'
      } else {
        key = date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
      }

      if (!groups[key]) groups[key] = []
      groups[key].push(n)
    })
    return groups
  }

  const grouped = groupByDate(filteredNotifications)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Notifications
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            title="Mark all as read"
          >
            <CheckCheck className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          <Link
            to="/settings/notifications"
            className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <Settings className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.id
                ? 'bg-temple-purple text-white'
                : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {f.label}
            {f.id === 'unread' && notifications.filter(n => !n.is_read).length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs">
                {notifications.filter(n => !n.is_read).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications */}
      {Object.keys(grouped).length === 0 ? (
        <div className={`text-center py-12 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <Bell className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No notifications
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {filter === 'unread' ? 'You\'re all caught up!' : 'Nothing here yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, notifs]) => (
            <div key={date}>
              <h2 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {date}
              </h2>
              <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                {notifs.map((notification, index) => {
                  const Icon = iconMap[notification.type] || Bell
                  const colorClass = iconColorMap[notification.type] || 'text-gray-500 bg-gray-500/10'

                  return (
                    <div
                      key={notification.id}
                      className={`relative group ${
                        index > 0 ? `border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}` : ''
                      } ${!notification.is_read ? (isDark ? 'bg-temple-purple/5' : 'bg-temple-purple/5') : ''}`}
                    >
                      <Link
                        to={notification.action_url || '#'}
                        onClick={() => markAsRead(notification.id)}
                        className={`flex items-start gap-4 p-4 ${
                          isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {notification.message}
                          </p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-temple-purple flex-shrink-0 mt-2" />
                        )}
                        {notification.action_url && (
                          <ChevronRight className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        )}
                      </Link>
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className={`absolute right-4 top-4 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                          isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                        }`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AllNotifications