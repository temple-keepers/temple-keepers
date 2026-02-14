import { useState, useEffect } from 'react'
import { Video, Calendar, Clock, ExternalLink } from 'lucide-react'
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns'

export const LiveSessionCard = ({ session, cohort }) => {
  const [timeUntil, setTimeUntil] = useState('')
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    if (!session) return

    const updateCountdown = () => {
      const sessionDate = new Date(session.session_date)
      const now = new Date()
      
      // Check if live (within 30 min before and during session)
      const sessionEnd = new Date(sessionDate.getTime() + (session.duration_minutes * 60000))
      const thirtyMinBefore = new Date(sessionDate.getTime() - (30 * 60000))
      
      if (now >= thirtyMinBefore && now <= sessionEnd) {
        setIsLive(true)
        setTimeUntil('HAPPENING NOW')
      } else if (isFuture(sessionDate)) {
        setIsLive(false)
        setTimeUntil(formatDistanceToNow(sessionDate, { addSuffix: true }))
      } else {
        setIsLive(false)
        setTimeUntil('Session ended')
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [session])

  if (!session) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <Video className="w-5 h-5" />
          <span className="text-sm">No upcoming live sessions</span>
        </div>
      </div>
    )
  }

  const sessionDate = new Date(session.session_date)
  const isPastSession = isPast(sessionDate)

  return (
    <div className={`glass-card overflow-hidden ${
      isLive 
        ? 'ring-2 ring-red-500 dark:ring-red-400' 
        : ''
    }`}>
      {/* Live Badge */}
      {isLive && (
        <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          <span className="font-semibold text-sm uppercase tracking-wide">LIVE NOW</span>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isLive 
                ? 'bg-red-100 dark:bg-red-900/30' 
                : isPastSession
                ? 'bg-gray-100 dark:bg-gray-700'
                : 'bg-temple-purple/10 dark:bg-temple-gold/10'
            }`}>
              <Video className={`w-6 h-6 ${
                isLive 
                  ? 'text-red-600 dark:text-red-400' 
                  : isPastSession
                  ? 'text-gray-600 dark:text-gray-400'
                  : 'text-temple-purple dark:text-temple-gold'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Live Session {session.session_number}
              </h3>
              {cohort && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {cohort.cohort_name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Session Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">
              {format(sessionDate, 'EEEE, MMMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">
              {format(sessionDate, 'h:mm a')} • {session.duration_minutes} minutes
            </span>
          </div>
        </div>

        {/* Countdown/Status */}
        <div className={`mb-4 px-4 py-3 rounded-lg ${
          isLive
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : isPastSession
            ? 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
            : 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
        }`}>
          <p className={`text-sm font-semibold text-center ${
            isLive
              ? 'text-red-700 dark:text-red-300'
              : isPastSession
              ? 'text-gray-600 dark:text-gray-400'
              : 'text-purple-700 dark:text-purple-300'
          }`}>
            {timeUntil}
          </p>
        </div>

        {/* Join Button */}
        {!isPastSession && (
          <a
            href={session.zoom_link}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              isLive
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 animate-pulse'
                : 'bg-temple-purple dark:bg-temple-gold hover:opacity-90 text-white'
            }`}
          >
            <Video className="w-5 h-5" />
            <span>{isLive ? 'Join Now' : 'Join Zoom Meeting'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {/* Recording Link (if past and has recording) */}
        {isPastSession && session.recording_url && (
          <a
            href={session.recording_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium transition-colors"
          >
            <Video className="w-5 h-5" />
            <span>Watch Recording</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {/* Session Notes */}
        {session.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {session.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
