import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { gamificationService } from '../services/gamificationService'
import { Flame, Award } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export const StreakBadge = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [streak, setStreak] = useState(0)
  const [last7, setLast7] = useState([])
  const [totalDays, setTotalDays] = useState(0)
  const [levelInfo, setLevelInfo] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (user) loadStreak()
  }, [user])

  const loadStreak = async () => {
    try {
      const [{ data, error }, { data: profile }] = await Promise.all([
        supabase.rpc('get_user_streak', { p_user_id: user.id }),
        supabase.from('profiles').select('total_points, current_level').eq('id', user.id).single()
      ])
      if (error) throw error
      setStreak(data.streak)
      setLast7(data.last_7_days || [])
      setTotalDays(data.total_active_days)
      if (profile) setLevelInfo(gamificationService.getLevel(profile.total_points || 0))
    } catch (err) {
      console.error('Failed to load streak:', err)
    } finally {
      setLoaded(true)
    }
  }

  if (!loaded || profile?.role === 'admin') return null

  // Milestone messages
  const getMessage = () => {
    if (streak === 0) return "Start your streak today!"
    if (streak === 1) return "You've started something beautiful."
    if (streak < 4) return "Building momentum — keep going!"
    if (streak < 7) return "Consistency is your superpower."
    if (streak === 7) return "A full week! Incredible discipline."
    if (streak < 14) return "Your temple thanks you."
    if (streak < 21) return "Habits are forming — stay faithful."
    if (streak < 30) return "Nearly a month of faithfulness!"
    return `${streak} days of stewarding your temple well.`
  }

  // Flame colour intensifies with streak
  const getFlameColour = () => {
    if (streak === 0) return 'text-gray-300 dark:text-gray-600'
    if (streak < 3) return 'text-orange-400'
    if (streak < 7) return 'text-orange-500'
    if (streak < 14) return 'text-orange-600'
    return 'text-red-500'
  }

  return (
    <div className="glass-card p-5 animate-fade-in">
      <div className="flex items-center gap-4">
        {/* Flame + number */}
        <div className="relative flex-shrink-0">
          <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${
            streak > 0 
              ? 'bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/20' 
              : 'bg-gray-100 dark:bg-gray-800'
          }`}>
            <Flame className={`w-7 h-7 ${getFlameColour()} ${streak > 0 ? 'drop-shadow-sm' : ''}`} />
          </div>
          {streak > 0 && (
            <div className="absolute -top-1 -right-1 min-w-[22px] h-[22px] rounded-full bg-temple-purple dark:bg-temple-gold flex items-center justify-center px-1">
              <span className="text-xs font-bold text-white">{streak}</span>
            </div>
          )}
        </div>

        {/* Message + dots */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {streak > 0 ? `${streak}-day streak` : 'No active streak'}
          </p>

          {/* Last 7 days dots */}
          <div className="flex items-center gap-1.5">
            {last7.map((day, i) => {
              const date = new Date(day.date)
              const dayLabel = DAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1]
              const isToday = date.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)

              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      day.active
                        ? 'bg-temple-purple dark:bg-temple-gold text-white shadow-sm'
                        : isToday
                          ? 'border-2 border-dashed border-temple-purple/40 dark:border-temple-gold/40 text-gray-400 dark:text-gray-500'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                    }`}
                    title={date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  >
                    {day.active ? '✓' : dayLabel}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Level + Encouragement row */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 pl-1">
          {getMessage()}
        </p>
        {levelInfo && (
          <button
            onClick={() => navigate('/achievements')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-temple-purple/10 dark:bg-temple-gold/10 hover:bg-temple-purple/20 dark:hover:bg-temple-gold/20 transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-temple-purple dark:text-temple-gold" />
            <span className="text-xs font-semibold text-temple-purple dark:text-temple-gold">
              Lv.{levelInfo.level} {levelInfo.name}
            </span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {levelInfo.totalPoints} pts
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
