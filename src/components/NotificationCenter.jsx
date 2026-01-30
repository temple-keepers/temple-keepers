import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../contexts/NotificationContext'
import { useTheme } from '../contexts/ThemeContext'
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Settings,
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
  BarChart,
  Clock,
  ChevronRight
} from 'lucide-react'

const NotificationCenter = () => {
  const { 
    notifications, 
    unreadCount, 
    loading,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    markAsSeen 
  } = useNotifications()
  const { isDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      markAsSeen() // Mark as seen when opening
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, markAsSeen])

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
    pod_joined: Users,
    streak_risk: AlertTriangle,
    streak_milestone: Flame,
    subscription_trial_ending: Clock,
    subscription_renewed: CreditCard,
    subscription_failed: AlertTriangle,
    achievement_unlocked: Trophy,
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
    pod_joined: 'text-indigo-500 bg-indigo-500/10',
    streak_risk: 'text-amber-500 bg-amber-500/10',
    streak_milestone: 'text-orange-500 bg-orange-500/10',
    subscription_trial_ending: 'text-amber-500 bg-amber-500/10',
    subscription_renewed: 'text-green-500 bg-green-500/10',
    subscription_failed: 'text-red-500 bg-red-500/10',
    achievement_unlocked: 'text-yellow-500 bg-yellow-500/10',
    weekly_summary: 'text-blue-500 bg-blue-500/10'
  }

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

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all ${
          isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
        }`}
      >
        <Bell className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-96 max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden z-50 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`p-1.5 rounded-lg text-sm flex items-center gap-1 ${
                    isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <Link
                to="/settings/notifications"
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
                title="Notification settings"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Bell className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  No notifications yet
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  We'll let you know when something happens
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => {
                  const Icon = iconMap[notification.type] || Bell
                  const colorClass = iconColorMap[notification.type] || 'text-gray-500 bg-gray-500/10'

                  return (
                    <div
                      key={notification.id}
                      className={`relative group ${
                        !notification.is_read 
                          ? isDark ? 'bg-temple-purple/5' : 'bg-temple-purple/5'
                          : ''
                      }`}
                    >
                      <Link
                        to={notification.action_url || '#'}
                        onClick={() => {
                          markAsRead(notification.id)
                          if (notification.action_url) setIsOpen(false)
                        }}
                        className={`flex items-start gap-3 px-4 py-3 ${
                          isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {notification.message}
                          </p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatTime(notification.created_at)}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-temple-purple flex-shrink-0 mt-2" />
                        )}

                        {/* Action arrow */}
                        {notification.action_url && (
                          <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-2 ${
                            isDark ? 'text-gray-500' : 'text-gray-400'
                          }`} />
                        )}
                      </Link>

                      {/* Delete button (on hover) */}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className={`absolute right-2 top-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                          isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                        }`}
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={`px-4 py-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className={`text-sm text-center block ${
                  isDark ? 'text-temple-purple hover:text-temple-gold' : 'text-temple-purple hover:text-temple-gold'
                }`}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationCenter