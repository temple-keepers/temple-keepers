import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext-minimal'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { getHabit, updateHabit, deleteHabit, getHabitLogs } from '../lib/habits'
import { generateInspiration } from '../lib/gemini'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Flame,
  Calendar,
  Clock,
  MapPin,
  Target,
  Gift,
  AlertTriangle,
  Lightbulb,
  Link as LinkIcon,
  TrendingUp,
  Award,
  BarChart3,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  StarOff,
  Pause,
  Play,
  MoreVertical,
  Save,
  Loader2,
  Sparkles
} from 'lucide-react'

const HabitDetail = () => {
  const { habitId } = useParams()
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [habit, setHabit] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [inspiration, setInspiration] = useState(null)
  const [loadingInspiration, setLoadingInspiration] = useState(false)
  const [showInspiration, setShowInspiration] = useState(false)

  useEffect(() => {
    loadHabit()
  }, [habitId])

  const loadHabit = async () => {
    setLoading(true)
    const habitData = await getHabit(habitId)
    if (!habitData) {
      toast.error('Habit not found')
      navigate('/habits')
      return
    }
    setHabit(habitData)
    setEditData(habitData)

    // Load last 90 days of logs
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 90)
    const logsData = await getHabitLogs(habitId, startDate.toISOString().split('T')[0], endDate)
    setLogs(logsData)
    
    setLoading(false)
  }

  const handleSave = async () => {
    console.log('Saving habit changes:', editData)
    setSaving(true)
    try {
      const updated = await updateHabit(habitId, {
        title: editData.title,
        description: editData.description,
        cue: editData.cue,
        tiny_behavior: editData.tiny_behavior,
        reward: editData.reward,
        when_time: editData.when_time,
        where_location: editData.where_location,
        temptation_bundle: editData.temptation_bundle
      })
      console.log('Habit save successful:', updated)
      setHabit({ ...habit, ...editData })
      setIsEditing(false)
      toast.success('Habit updated successfully!')
    } catch (error) {
      console.error('Failed to save habit:', error)
      toast.error(`Failed to update habit: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async () => {
    try {
      await updateHabit(habitId, { is_active: !habit.is_active })
      setHabit({ ...habit, is_active: !habit.is_active })
      toast.success(habit.is_active ? 'Habit paused' : 'Habit resumed')
    } catch (error) {
      toast.error('Failed to update habit')
    }
  }

  const handleToggleKeystone = async () => {
    try {
      await updateHabit(habitId, { is_keystone: !habit.is_keystone })
      setHabit({ ...habit, is_keystone: !habit.is_keystone })
      toast.success(habit.is_keystone ? 'Removed from keystone' : 'Marked as keystone habit!')
    } catch (error) {
      toast.error('Failed to update habit')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteHabit(habitId)
      toast.success('Habit archived')
      navigate('/habits')
    } catch (error) {
      toast.error('Failed to delete habit')
    }
  }

  const handleGenerateInspiration = async () => {
    setLoadingInspiration(true)
    try {
      const result = await generateInspiration('habit', habit)
      if (result.inspiration) {
        setInspiration(result.inspiration)
        setShowInspiration(true)
        toast.success('✨ Inspiration generated!')
      } else {
        toast.error('Failed to generate inspiration')
      }
    } catch (error) {
      console.error('Error generating inspiration:', error)
      toast.error('Failed to generate inspiration')
    } finally {
      setLoadingInspiration(false)
    }
  }

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    // Add empty days for alignment
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }
    
    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const getLogForDate = (date) => {
    if (!date) return null
    const dateStr = date.toISOString().split('T')[0]
    return logs.find(l => l.log_date === dateStr)
  }

  const navigateMonth = (direction) => {
    const newMonth = new Date(calendarMonth)
    newMonth.setMonth(newMonth.getMonth() + direction)
    setCalendarMonth(newMonth)
  }

  // Stats calculation
  const calculateStats = () => {
    const last30Days = logs.filter(l => {
      const logDate = new Date(l.log_date)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return logDate >= thirtyDaysAgo
    })
    
    const completed = last30Days.filter(l => l.is_completed).length
    const total = 30
    const rate = Math.round((completed / total) * 100)
    
    return { completed, total, rate }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin" />
      </div>
    )
  }

  const stats = calculateStats()
  const obstacles = typeof habit.obstacles === 'string' ? JSON.parse(habit.obstacles) : habit.obstacles || []
  const environmentTips = typeof habit.environment_tips === 'string' ? JSON.parse(habit.environment_tips) : habit.environment_tips || []

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/habits')}
            className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {habit.title}
              </h1>
              {habit.is_keystone && (
                <Star className="w-5 h-5 text-temple-gold fill-temple-gold" />
              )}
            </div>
            {!habit.is_active && (
              <span className="text-sm text-amber-500">Paused</span>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <MoreVertical className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>

          {showMenu && (
            <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg z-10 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <button
                onClick={() => { setIsEditing(true); setShowMenu(false) }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-left ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                <Edit className="w-4 h-4" />
                Edit Habit
              </button>
              <button
                onClick={() => { handleToggleKeystone(); setShowMenu(false) }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-left ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                {habit.is_keystone ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                {habit.is_keystone ? 'Remove Keystone' : 'Mark as Keystone'}
              </button>
              <button
                onClick={() => { handleToggleActive(); setShowMenu(false) }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-left ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                {habit.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {habit.is_active ? 'Pause Habit' : 'Resume Habit'}
              </button>
              <button
                onClick={() => { setShowDeleteModal(true); setShowMenu(false) }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-left text-red-500 ${
                  isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                Delete Habit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className={`rounded-2xl p-4 text-center ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {habit.current_streak}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Current Streak</p>
        </div>
        <div className={`rounded-2xl p-4 text-center ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <Award className="w-6 h-6 text-temple-gold mx-auto mb-1" />
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {habit.best_streak}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Best Streak</p>
        </div>
        <div className={`rounded-2xl p-4 text-center ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {stats.rate}%
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Last 30 Days</p>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className={`rounded-2xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {calendarMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className={`text-center text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth(calendarMonth).map((date, i) => {
            if (!date) {
              return <div key={i} className="w-8 h-8" />
            }

            const log = getLogForDate(date)
            const isToday = date.toDateString() === new Date().toDateString()
            const isFuture = date > new Date()

            return (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                  isFuture
                    ? isDark ? 'text-gray-600' : 'text-gray-300'
                    : log?.is_completed
                      ? 'bg-green-500 text-white'
                      : log?.is_skipped
                        ? 'bg-amber-500/20 text-amber-500'
                        : isToday
                          ? 'ring-2 ring-temple-purple'
                          : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                }`}
                title={log?.is_completed ? 'Completed' : log?.is_skipped ? 'Skipped' : ''}
              >
                {date.getDate()}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Complete</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500/50" />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Skipped</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Missed</span>
          </div>
        </div>
      </div>

      {/* Habit Recipe */}
      {(habit.cue || habit.tiny_behavior || habit.reward) && (
        <div className={`rounded-2xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Habit Recipe
          </h2>
          <div className={`p-4 rounded-xl ${
            isDark ? 'bg-temple-purple/10 border border-temple-purple/20' : 'bg-temple-purple/5 border border-temple-purple/10'
          }`}>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              {habit.cue && <>After I <span className="text-temple-purple font-medium">{habit.cue}</span>,<br /></>}
              {habit.tiny_behavior && <>I will <span className="text-temple-purple font-medium">{habit.tiny_behavior}</span></>}
              {!habit.tiny_behavior && <>I will <span className="text-temple-purple font-medium">{habit.title}</span></>}
              {habit.reward && <>,<br />and celebrate by <span className="text-temple-purple font-medium">{habit.reward}</span></>}
            </p>
          </div>
        </div>
      )}

      {/* When & Where */}
      {(habit.when_time || habit.where_location) && (
        <div className={`rounded-2xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            When & Where
          </h2>
          <div className="space-y-3">
            {habit.when_time && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-temple-purple" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{habit.when_time}</span>
              </div>
            )}
            {habit.where_location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-temple-purple" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{habit.where_location}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Temptation Bundle */}
      {habit.temptation_bundle && (
        <div className={`rounded-2xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <div className="flex items-center gap-3 mb-3">
            <LinkIcon className="w-5 h-5 text-temple-purple" />
            <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Temptation Bundle
            </h2>
          </div>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            {habit.temptation_bundle}
          </p>
        </div>
      )}

      {/* Obstacles */}
      {obstacles.length > 0 && obstacles.some(o => o.obstacle) && (
        <div className={`rounded-2xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Obstacle Plans
            </h2>
          </div>
          <div className="space-y-3">
            {obstacles.filter(o => o.obstacle).map((obs, index) => (
              <div key={index} className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  If: <span className={isDark ? 'text-white' : 'text-gray-900'}>{obs.obstacle}</span>
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Then: <span className="text-temple-purple">{obs.solution}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Environment Tips */}
      {environmentTips.length > 0 && environmentTips.some(t => t) && (
        <div className={`rounded-2xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-5 h-5 text-temple-gold" />
            <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Environment Design
            </h2>
          </div>
          <ul className="space-y-2">
            {environmentTips.filter(t => t).map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Inspiration Section */}
      <div className={`rounded-2xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
        {!showInspiration ? (
          <button
            onClick={handleGenerateInspiration}
            disabled={loadingInspiration}
            className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
              isDark 
                ? 'bg-gradient-to-r from-temple-purple/20 to-temple-gold/20 hover:from-temple-purple/30 hover:to-temple-gold/30 text-white border border-temple-purple/30' 
                : 'bg-gradient-to-r from-temple-purple/10 to-temple-gold/10 hover:from-temple-purple/15 hover:to-temple-gold/15 text-temple-purple border border-temple-purple/20'
            }`}
          >
            {loadingInspiration ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating inspiration...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate AI Inspiration
              </>
            )}
          </button>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-temple-purple" />
                <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Inspiration for Your Habit
                </h2>
              </div>
              <button
                onClick={() => setShowInspiration(false)}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {inspiration.message}
            </p>

            <div className={`p-3 rounded-lg border-l-4 border-temple-purple mb-3 ${
              isDark ? 'bg-purple-500/10' : 'bg-purple-50'
            }`}>
              <p className={`text-sm italic mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                "{inspiration.scripture}"
              </p>
              <p className="text-xs text-temple-purple font-medium">
                — {inspiration.scriptureReference}
              </p>
            </div>

            <div className={`p-3 rounded-lg mb-3 ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                💡 <strong>Habit Tip:</strong> {inspiration.wisdom}
              </p>
            </div>

            <button
              onClick={handleGenerateInspiration}
              disabled={loadingInspiration}
              className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                isDark 
                  ? 'bg-temple-purple/20 hover:bg-temple-purple/30 text-temple-purple' 
                  : 'bg-temple-purple/10 hover:bg-temple-purple/15 text-temple-purple'
              }`}
            >
              {loadingInspiration ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate New Inspiration
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-lg rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Edit Habit
              </h3>
              <button onClick={() => setIsEditing(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Star className="w-4 h-4 inline mr-1" />
                  Habit Title
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  placeholder="e.g., Stay Hydrated, Morning Prayer, Exercise..."
                  className={`w-full px-4 py-2 rounded-xl border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                  }`}
                />
              </div>

              {/* Habit Recipe Section */}
              <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  📝 Habit Recipe
                </h4>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Clock className="w-4 h-4 inline mr-1" />
                  Cue (After I...)
                </label>
                <input
                  type="text"
                  value={editData.cue || ''}
                  onChange={(e) => setEditData({ ...editData, cue: e.target.value })}
                  placeholder="e.g., pour my morning coffee, brush my teeth, finish breakfast, sit down at my desk..."
                  className={`w-full px-4 py-2 rounded-xl border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Link to an existing routine that happens daily
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Target className="w-4 h-4 inline mr-1" />
                  Tiny Behavior
                </label>
                <input
                  type="text"
                  value={editData.tiny_behavior || ''}
                  onChange={(e) => setEditData({ ...editData, tiny_behavior: e.target.value })}
                  placeholder="e.g., drink one glass of water, pray for 1 minute, read one Bible verse, do 2 pushups..."
                  className={`w-full px-4 py-2 rounded-xl border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Make it so easy you can't say no (under 2 minutes)
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Gift className="w-4 h-4 inline mr-1" />
                  Celebration
                </label>
                <input
                  type="text"
                  value={editData.reward || ''}
                  onChange={(e) => setEditData({ ...editData, reward: e.target.value })}
                  placeholder="e.g., say 'I'm honoring my temple!', smile and take a deep breath, fist pump, say 'Victory!'..."
                  className={`w-full px-4 py-2 rounded-xl border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Celebrate immediately after completing the behavior
                </p>
              </div>
              </div>

              {/* Context Section */}
              <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  📍 When & Where
                </h4>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time
                </label>
                <input
                  type="time"
                  value={editData.when_time || ''}
                  onChange={(e) => setEditData({ ...editData, when_time: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  When will you do this habit? (Being specific makes you 2-3x more likely to follow through)
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={editData.where_location || ''}
                  onChange={(e) => setEditData({ ...editData, where_location: e.target.value })}
                  placeholder="e.g., Kitchen, Living room, Bedroom, Park, Gym, Prayer closet, Office..."
                  className={`w-full px-4 py-2 rounded-xl border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Where will you perform this habit?
                </p>
              </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  Temptation Bundle
                </label>
                <input
                  type="text"
                  value={editData.temptation_bundle || ''}
                  onChange={(e) => setEditData({ ...editData, temptation_bundle: e.target.value })}
                  placeholder="e.g., I can only listen to my favorite podcast while exercising, I can only watch my show while meal prepping..."
                  className={`w-full px-4 py-2 rounded-xl border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Pair this habit with something you enjoy to make it more appealing
                </p>
              </div>

              {/* Live Preview */}
              {(editData.cue || editData.tiny_behavior || editData.reward) && (
                <div className={`rounded-xl p-4 ${isDark ? 'bg-temple-purple/10 border border-temple-purple/20' : 'bg-temple-purple/5 border border-temple-purple/10'}`}>
                  <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    ✨ Your Habit Recipe Preview
                  </h4>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {editData.cue && (
                      <>After I <span className="text-temple-purple font-semibold">{editData.cue}</span>,<br /></>
                    )}
                    {editData.tiny_behavior && (
                      <>I will <span className="text-temple-purple font-semibold">{editData.tiny_behavior}</span>,<br /></>
                    )}
                    {editData.reward && (
                      <>and celebrate by <span className="text-temple-purple font-semibold">{editData.reward}</span>.</>  
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-temple-purple text-white font-medium flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Delete Habit?
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              This will archive "{habit.title}" and all its history. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`flex-1 py-2 rounded-xl font-medium ${
                  isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HabitDetail