import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { 
  getWeeklyReview, 
  createOrUpdateWeeklyReview, 
  getWeeklyStats,
  getWeekLogs,
  getHabits
} from '../lib/habits'
import {
  ArrowLeft,
  Calendar,
  Trophy,
  Flame,
  TrendingUp,
  Target,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Heart,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  BarChart3,
  Award
} from 'lucide-react'

const WeeklyReview = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))
  const [review, setReview] = useState(null)
  const [stats, setStats] = useState(null)
  const [weekLogs, setWeekLogs] = useState([])
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    wins: '',
    obstacles: '',
    learnings: '',
    next_week_focus: '',
    gratitude: '',
    overall_mood: null
  })

  useEffect(() => {
    loadData()
  }, [weekStart])

  function getWeekStart(date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff)).toISOString().split('T')[0]
  }

  const loadData = async () => {
    setLoading(true)
    const [reviewData, statsData, habitsData, logsData] = await Promise.all([
      getWeeklyReview(user.id, weekStart),
      getWeeklyStats(user.id, weekStart),
      getHabits(user.id),
      getWeekLogs(user.id, new Date(weekStart))
    ])
    
    setReview(reviewData)
    setStats(statsData)
    setHabits(habitsData)
    setWeekLogs(logsData)
    
    if (reviewData) {
      setFormData({
        wins: reviewData.wins || '',
        obstacles: reviewData.obstacles || '',
        learnings: reviewData.learnings || '',
        next_week_focus: reviewData.next_week_focus || '',
        gratitude: reviewData.gratitude || '',
        overall_mood: reviewData.overall_mood || null
      })
    } else {
      setFormData({
        wins: '',
        obstacles: '',
        learnings: '',
        next_week_focus: '',
        gratitude: '',
        overall_mood: null
      })
    }
    
    setLoading(false)
  }

  const navigateWeek = (direction) => {
    const current = new Date(weekStart)
    current.setDate(current.getDate() + (direction * 7))
    setWeekStart(current.toISOString().split('T')[0])
    setStep(1)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await createOrUpdateWeeklyReview(user.id, weekStart, {
        ...formData,
        habits_target: stats?.habitsTarget || 0,
        habits_completed: stats?.habitsCompleted || 0,
        completion_rate: stats?.completionRate || 0,
        longest_streak: stats?.longestStreak || 0
      })
      toast.success('Weekly review saved! 🎉')
      navigate('/habits')
    } catch (error) {
      toast.error('Failed to save review')
    } finally {
      setSaving(false)
    }
  }

  const formatWeekRange = () => {
    const start = new Date(weekStart)
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }

  const isCurrentWeek = weekStart === getWeekStart(new Date())
  const isFutureWeek = new Date(weekStart) > new Date()

  // Build heatmap data
  const buildHeatmap = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayLogs = weekLogs.filter(l => l.log_date === dateStr)
      const completed = dayLogs.filter(l => l.is_completed).length
      const total = habits.length
      
      days.push({
        date,
        dateStr,
        dayName: date.toLocaleDateString('en-GB', { weekday: 'short' }),
        completed,
        total,
        rate: total > 0 ? (completed / total) * 100 : 0
      })
    }
    return days
  }

  const heatmapDays = buildHeatmap()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin" />
      </div>
    )
  }

  const totalSteps = 5

  return (
    <div className="max-w-xl mx-auto pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/habits')}
          className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </button>
        <div className="flex-1">
          <h1 className={`text-xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Weekly Review
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Reflect and plan for success
          </p>
        </div>
      </div>

      {/* Week Navigation */}
      <div className={`rounded-2xl p-4 mb-6 flex items-center justify-between ${
        isDark ? 'bg-gray-800' : 'bg-white shadow-sm'
      }`}>
        <button
          onClick={() => navigateWeek(-1)}
          className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatWeekRange()}
          </p>
          {isCurrentWeek && (
            <span className="text-xs text-temple-purple">This Week</span>
          )}
          {review?.is_completed && (
            <span className="text-xs text-green-500 flex items-center justify-center gap-1">
              <Check className="w-3 h-3" /> Reviewed
            </span>
          )}
        </div>
        <button
          onClick={() => navigateWeek(1)}
          disabled={isCurrentWeek}
          className={`p-2 rounded-xl ${
            isCurrentWeek 
              ? 'opacity-30 cursor-not-allowed' 
              : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {isFutureWeek ? (
        <div className={`text-center py-12 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <Calendar className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            This week hasn't happened yet!
          </p>
        </div>
      ) : (
        <>
          {/* Progress indicator */}
          <div className={`h-2 rounded-full mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <div 
              className="h-full rounded-full bg-gradient-to-r from-temple-purple to-temple-gold transition-all"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>

          {/* Step 1: Stats Overview */}
          {step === 1 && (
            <div className="space-y-6">
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  📊 Your Week at a Glance
                </h2>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={`rounded-xl p-4 text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <BarChart3 className="w-6 h-6 text-temple-purple mx-auto mb-1" />
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stats?.completionRate || 0}%
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Completion Rate
                    </p>
                  </div>
                  <div className={`rounded-xl p-4 text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <Target className="w-6 h-6 text-green-500 mx-auto mb-1" />
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stats?.habitsCompleted || 0}/{stats?.habitsTarget || 0}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Habits Completed
                    </p>
                  </div>
                  <div className={`rounded-xl p-4 text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stats?.longestStreak || 0}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Longest Streak
                    </p>
                  </div>
                  <div className={`rounded-xl p-4 text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <Award className="w-6 h-6 text-temple-gold mx-auto mb-1" />
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {habits.length}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Active Habits
                    </p>
                  </div>
                </div>

                {/* Heatmap */}
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Daily Breakdown
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {heatmapDays.map((day, i) => (
                    <div key={i} className="text-center">
                      <p className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {day.dayName}
                      </p>
                      <div 
                        className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                          day.rate >= 80 ? 'bg-green-500 text-white' :
                          day.rate >= 50 ? 'bg-amber-500 text-white' :
                          day.rate > 0 ? 'bg-red-500/50 text-white' :
                          isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {day.completed}/{day.total}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Encouragement */}
              <div className={`rounded-2xl p-4 ${
                stats?.completionRate >= 80
                  ? isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'
                  : stats?.completionRate >= 50
                    ? isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
                    : isDark ? 'bg-temple-purple/10 border border-temple-purple/20' : 'bg-temple-purple/5 border border-temple-purple/10'
              }`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {stats?.completionRate >= 80 
                    ? '🎉 Amazing week! You\'re building strong habits.' 
                    : stats?.completionRate >= 50
                      ? '💪 Good progress! Every step counts.'
                      : '🌱 Remember: progress, not perfection. Let\'s reflect and improve.'}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Wins */}
          {step === 2 && (
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-temple-gold" />
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  🎉 Wins This Week
                </h2>
              </div>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                What went well? What are you proud of? Celebrate your progress!
              </p>
              <textarea
                value={formData.wins}
                onChange={(e) => setFormData({ ...formData, wins: e.target.value })}
                placeholder="I'm proud that I..."
                rows={5}
                className={`w-full px-4 py-3 rounded-xl border resize-none ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
              />
            </div>
          )}

          {/* Step 3: Obstacles */}
          {step === 3 && (
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  🚧 Obstacles & Challenges
                </h2>
              </div>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                What got in the way? What was hard? No judgment - just awareness.
              </p>
              <textarea
                value={formData.obstacles}
                onChange={(e) => setFormData({ ...formData, obstacles: e.target.value })}
                placeholder="The challenges I faced were..."
                rows={5}
                className={`w-full px-4 py-3 rounded-xl border resize-none ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
              />
            </div>
          )}

          {/* Step 4: Learnings & Focus */}
          {step === 4 && (
            <div className="space-y-6">
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-temple-purple" />
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    💡 What I Learned
                  </h2>
                </div>
                <textarea
                  value={formData.learnings}
                  onChange={(e) => setFormData({ ...formData, learnings: e.target.value })}
                  placeholder="I discovered that..."
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border resize-none ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
                />
              </div>

              <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-green-500" />
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    🎯 Next Week's Focus
                  </h2>
                </div>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  What ONE thing will you focus on improving?
                </p>
                <textarea
                  value={formData.next_week_focus}
                  onChange={(e) => setFormData({ ...formData, next_week_focus: e.target.value })}
                  placeholder="Next week I will focus on..."
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border resize-none ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
                />
              </div>
            </div>
          )}

          {/* Step 5: Gratitude & Mood */}
          {step === 5 && (
            <div className="space-y-6">
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-6 h-6 text-pink-500" />
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    🙏 Gratitude
                  </h2>
                </div>
                <textarea
                  value={formData.gratitude}
                  onChange={(e) => setFormData({ ...formData, gratitude: e.target.value })}
                  placeholder="This week I'm grateful for..."
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border resize-none ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
                />
              </div>

              <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  How did you feel overall this week?
                </h2>
                <div className="flex justify-center gap-4">
                  {[
                    { mood: 'great', emoji: '😊', label: 'Great' },
                    { mood: 'good', emoji: '🙂', label: 'Good' },
                    { mood: 'okay', emoji: '😐', label: 'Okay' },
                    { mood: 'struggling', emoji: '😕', label: 'Struggling' },
                    { mood: 'difficult', emoji: '😫', label: 'Difficult' }
                  ].map(({ mood, emoji, label }) => (
                    <button
                      key={mood}
                      onClick={() => setFormData({ ...formData, overall_mood: mood })}
                      className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                        formData.overall_mood === mood
                          ? 'bg-temple-purple text-white ring-2 ring-temple-purple ring-offset-2'
                          : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-2xl mb-1">{emoji}</span>
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className={`rounded-2xl p-4 ${
                isDark ? 'bg-temple-purple/10 border border-temple-purple/20' : 'bg-temple-purple/5 border border-temple-purple/10'
              }`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  ✨ <strong>Well done!</strong> Taking time to reflect is proven to improve your success rate by 2-3x. 
                  Your insights will help you grow stronger each week.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => step === 1 ? navigate('/habits') : setStep(step - 1)}
              className={`flex-1 py-3 rounded-xl font-medium ${
                isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            {step < totalSteps ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                Complete Review
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default WeeklyReview