import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext-minimal'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { 
  getHabits, 
  getTodayLogs, 
  logHabit,
  getIdentityStatement,
  getHabitTemplates,
  createHabitFromTemplate
} from '../lib/habits'
import {
  Plus,
  Check,
  Flame,
  Target,
  Droplets,
  BookOpen,
  Dumbbell,
  Moon,
  Heart,
  Brain,
  Sparkles,
  ChevronRight,
  Calendar,
  BarChart3,
  Award,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Quote,
  X,
  Zap
} from 'lucide-react'

const Habits = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const [habits, setHabits] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [identity, setIdentity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showMoodModal, setShowMoodModal] = useState(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [templates, setTemplates] = useState([])
  const [loadingTemplate, setLoadingTemplate] = useState(null)

  useEffect(() => {
    if (user) {
      loadData()
      loadTemplates()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    const [habitsData, logsData, identityData] = await Promise.all([
      getHabits(user.id),
      getTodayLogs(user.id),
      getIdentityStatement(user.id)
    ])
    setHabits(habitsData)
    setTodayLogs(logsData)
    setIdentity(identityData)
    setLoading(false)
  }

  const loadTemplates = async () => {
    const templatesData = await getHabitTemplates()
    setTemplates(templatesData)
  }

  const handleUseTemplate = async (template) => {
    setLoadingTemplate(template.id)
    try {
      await createHabitFromTemplate(user.id, template)
      toast.success(`${template.title} added to your habits! 🎉`)
      setShowTemplates(false)
      loadData()
    } catch (error) {
      toast.error('Failed to add habit')
    } finally {
      setLoadingTemplate(null)
    }
  }

  const handleToggleHabit = async (habit) => {
    const existingLog = todayLogs.find(l => l.habit_id === habit.id)
    const newCompleted = !existingLog?.is_completed

    // If completing, show mood modal
    if (newCompleted) {
      setShowMoodModal(habit)
    } else {
      // If uncompleting, just toggle
      try {
        await logHabit(user.id, habit.id, false)
        loadData()
      } catch (error) {
        toast.error('Failed to update habit')
      }
    }
  }

  const handleCompleteWithMood = async (habit, mood) => {
    try {
      await logHabit(user.id, habit.id, true, null, mood)
      setShowMoodModal(null)
      loadData()
      
      // Celebration message
      const messages = [
        '🎉 Amazing!',
        '💪 Great job!',
        '⭐ You\'re crushing it!',
        '🙌 Keep going!',
        '✨ Wonderful!'
      ]
      toast.success(messages[Math.floor(Math.random() * messages.length)])
    } catch (error) {
      toast.error('Failed to complete habit')
    }
  }

  const categoryIcons = {
    spiritual: BookOpen,
    nutrition: Target,
    hydration: Droplets,
    fitness: Dumbbell,
    rest: Moon,
    mindset: Brain,
    relationships: Heart
  }

  const todayComplete = todayLogs.filter(l => l.is_completed).length
  const todayTotal = habits.length
  const completionPercent = todayTotal > 0 ? Math.round((todayComplete / todayTotal) * 100) : 0

  const getDayName = () => {
    return new Date().toLocaleDateString('en-GB', { weekday: 'long' })
  }

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
        <div>
          <h1 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Habits
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {getDayName()} • {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Sparkles className="w-5 h-5" />
            <span className="hidden sm:inline">Browse Templates</span>
          </button>
          <Link
            to="/habits/new"
            className="p-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Identity Statement */}
      {identity && (
        <div className={`rounded-2xl p-4 mb-6 ${
          isDark 
            ? 'bg-gradient-to-r from-temple-purple/20 to-temple-gold/10 border border-temple-purple/30' 
            : 'bg-gradient-to-r from-temple-purple/10 to-temple-gold/10 border border-temple-purple/20'
        }`}>
          <div className="flex items-start gap-3">
            <Quote className="w-5 h-5 text-temple-purple flex-shrink-0 mt-1" />
            <div>
              <p className={`text-sm italic ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                "{identity}"
              </p>
              <Link 
                to="/habits/identity"
                className="text-xs text-temple-purple hover:underline mt-1 inline-block"
              >
                Edit identity statement
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Progress Ring */}
      <div className={`rounded-2xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
        <div className="flex items-center gap-6">
          {/* Ring */}
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke={isDark ? '#374151' : '#e5e7eb'}
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${completionPercent * 2.51} 251`}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#D4AF37" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {completionPercent}%
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1">
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Today's Progress
            </h3>
            <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {todayComplete} of {todayTotal} habits completed
            </p>
            <div className="flex gap-4">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Longest Streak</p>
                <p className={`font-semibold flex items-center gap-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Flame className="w-4 h-4 text-orange-500" />
                  {Math.max(...habits.map(h => h.current_streak || 0), 0)} days
                </p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Active Habits</p>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {habits.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-6">
        <Link
          to="/habits/review"
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl ${
            isDark ? 'bg-gray-800 text-gray-300' : 'bg-white shadow-sm text-gray-600'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm font-medium">Weekly Review</span>
        </Link>
        <Link
          to="/goals"
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl ${
            isDark ? 'bg-gray-800 text-gray-300' : 'bg-white shadow-sm text-gray-600'
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="text-sm font-medium">Goals</span>
        </Link>
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className={`text-center py-12 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <Sparkles className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No habits yet
          </h3>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Start with just one small habit
          </p>
          <Link
            to="/habits/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-temple-purple text-white text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Your First Habit
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const Icon = categoryIcons[habit.category] || Target
            const log = todayLogs.find(l => l.habit_id === habit.id)
            const isCompleted = log?.is_completed

            return (
              <div
                key={habit.id}
                className={`rounded-2xl p-4 transition-all ${
                  isCompleted
                    ? isDark 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-green-50 border border-green-200'
                    : isDark ? 'bg-gray-800' : 'bg-white shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleHabit(habit)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    style={{ 
                      backgroundColor: isCompleted ? undefined : habit.color + '20',
                      borderColor: habit.color
                    }}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" style={{ color: habit.color }} />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${
                        isCompleted 
                          ? 'line-through text-green-600' 
                          : isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {habit.title}
                      </h3>
                      {habit.is_keystone && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-temple-gold/20 text-temple-gold">
                          Key
                        </span>
                      )}
                    </div>
                    
                    {habit.cue && (
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        After: {habit.cue}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-1">
                      {habit.current_streak > 0 && (
                        <span className="flex items-center gap-1 text-xs text-orange-500">
                          <Flame className="w-3 h-3" />
                          {habit.current_streak} day streak
                        </span>
                      )}
                      {habit.when_time && (
                        <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <Clock className="w-3 h-3" />
                          {habit.when_time}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <Link
                    to={`/habits/${habit.id}`}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Habit Prompt (if < 3 habits) */}
      {habits.length > 0 && habits.length < 3 && (
        <div className={`mt-6 rounded-2xl p-4 border-2 border-dashed ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Plus className={`w-6 h-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1">
              <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Room for {3 - habits.length} more habit{3 - habits.length > 1 ? 's' : ''}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Research shows 1-3 habits is optimal for success
              </p>
            </div>
            <Link
              to="/habits/new"
              className="px-4 py-2 rounded-xl bg-temple-purple text-white text-sm font-medium"
            >
              Add
            </Link>
          </div>
        </div>
      )}

      {/* Habit Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl p-6 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Habit Templates
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Choose a pre-made habit to get started quickly
                </p>
              </div>
              <button
                onClick={() => setShowTemplates(false)}
                className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            <div className="space-y-3">
              {templates.map((template) => {
                const iconMap = {
                  'HandHeart': Heart,
                  'BookOpen': BookOpen,
                  'Droplets': Droplets,
                  'Footprints': Dumbbell,
                  'Salad': Target,
                  'Moon': Moon,
                  'Brain': Brain,
                  'Heart': Heart,
                  'Target': Target,
                  'Dumbbell': Dumbbell
                }
                const Icon = iconMap[template.icon] || Sparkles

                return (
                  <div
                    key={template.id}
                    className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: template.color + '20' }}
                      >
                        <Icon className="w-6 h-6" style={{ color: template.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {template.title}
                          </h4>
                          {template.is_core && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-temple-gold/20 text-temple-gold flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              Core
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {template.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          {template.frequency_type === 'daily' && (
                            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                              Daily
                            </span>
                          )}
                          {template.suggested_cue && (
                            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                              After: {template.suggested_cue}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUseTemplate(template)}
                        disabled={loadingTemplate === template.id}
                        className="px-4 py-2 rounded-xl bg-temple-purple text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0"
                      >
                        {loadingTemplate === template.id ? 'Adding...' : 'Use'}
                      </button>
                    </div>
                  </div>
                )
              })}

              {templates.length === 0 && (
                <div className="text-center py-12">
                  <Sparkles className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    No templates available
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <Link
                to="/habits/new"
                onClick={() => setShowTemplates(false)}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed ${
                  isDark ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-300 text-gray-500 hover:border-gray-400'
                }`}
              >
                <Plus className="w-5 h-5" />
                Create Custom Habit
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mood Selection Modal */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              🎉 Nice work!
            </h3>
            <p className={`text-center text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              How are you feeling after completing this habit?
            </p>
            <div className="flex justify-center gap-4 mb-6">
              {[
                { mood: 'great', emoji: '😊', label: 'Great' },
                { mood: 'good', emoji: '🙂', label: 'Good' },
                { mood: 'okay', emoji: '😐', label: 'Okay' },
                { mood: 'struggling', emoji: '😕', label: 'Meh' },
                { mood: 'difficult', emoji: '😫', label: 'Hard' }
              ].map(({ mood, emoji, label }) => (
                <button
                  key={mood}
                  onClick={() => handleCompleteWithMood(showMoodModal, mood)}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl mb-1">{emoji}</span>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => handleCompleteWithMood(showMoodModal, null)}
              className={`w-full py-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Habits