import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext-minimal'
import { useTheme } from '../contexts/ThemeContext'
import { getWaterLog, updateWaterLog, getWaterHistory } from '../lib/supabase'
import FeatureGate from '../components/FeatureGate' 
import { 
  Droplets, 
  Plus, 
  Minus, 
  Target,
  TrendingUp,
  Calendar,
  Sparkles,
  CheckCircle
} from 'lucide-react'

const WaterTracker = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [glasses, setGlasses] = useState(0)
  const [goal, setGoal] = useState(8)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [history, setHistory] = useState([])
  const [showGoalEdit, setShowGoalEdit] = useState(false)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    const [todayLog, historyData] = await Promise.all([
      getWaterLog(user.id),
      getWaterHistory(user.id, 7)
    ])
    
    if (todayLog) {
      setGlasses(todayLog.glasses)
      setGoal(todayLog.goal)
    }
    setHistory(historyData)
    setLoading(false)
  }

  const updateGlasses = async (newGlasses) => {
    if (newGlasses < 0) return
    
    setUpdating(true)
    setGlasses(newGlasses)
    
    try {
      await updateWaterLog(user.id, newGlasses, goal)
    } catch (error) {
      console.error('Failed to update:', error)
    }
    setUpdating(false)
  }

  const updateGoal = async (newGoal) => {
    if (newGoal < 1 || newGoal > 20) return
    
    setGoal(newGoal)
    setShowGoalEdit(false)
    
    try {
      await updateWaterLog(user.id, glasses, newGoal)
    } catch (error) {
      console.error('Failed to update goal:', error)
    }
  }

  const percentage = Math.min((glasses / goal) * 100, 100)
  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Calculate streak
  const streak = history.filter(day => day.glasses >= day.goal).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <FeatureGate feature="water_tracker" requiredPlan="starter">
    <div className="max-w-4xl mx-auto space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className={`text-3xl md:text-4xl font-display font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          Water Tracker
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Stay hydrated, honor your temple 💧
        </p>
      </div>
<div className="max-w-4xl mx-auto space-y-8 pb-20 lg:pb-8"></div>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Main Tracker */}
        <div className="glass-card-strong rounded-3xl p-8 text-center animate-fade-in">
          {/* Progress Ring */}
          <div className="relative w-56 h-56 mx-auto mb-8">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="112"
                cy="112"
                r="90"
                stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                strokeWidth="12"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="112"
                cy="112"
                r="90"
                stroke="url(#waterGradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 ease-out"
              />
              <defs>
                <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Droplets className={`w-10 h-10 mb-2 ${glasses >= goal ? 'text-green-500' : 'text-blue-500'}`} />
              <span className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {glasses}
              </span>
              <span className="text-gray-500">of {goal} glasses</span>
              {glasses >= goal && (
                <div className="flex items-center gap-1 mt-2 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Goal reached!</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => updateGlasses(glasses - 1)}
              disabled={glasses <= 0 || updating}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                glasses <= 0
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-red-100 dark:bg-red-500/20 text-red-500 hover:bg-red-200 dark:hover:bg-red-500/30'
              }`}
            >
              <Minus className="w-8 h-8" />
            </button>
            
            <button
              onClick={() => updateGlasses(glasses + 1)}
              disabled={updating}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-10 h-10" />
            </button>
            
            <button
              onClick={() => setShowGoalEdit(true)}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isDark 
                  ? 'bg-white/10 text-gray-300 hover:bg-white/20' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Target className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Add */}
          <div className="flex justify-center gap-3 mt-6">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => updateGlasses(glasses + num)}
                disabled={updating}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isDark
                    ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                +{num} glass{num > 1 ? 'es' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Stats & History */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card-strong rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{streak}</p>
              <p className="text-sm text-gray-500">Day streak</p>
            </div>
            
            <div className="glass-card-strong rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {history.reduce((sum, day) => sum + day.glasses, 0)}
              </p>
              <p className="text-sm text-gray-500">This week</p>
            </div>
          </div>

          {/* Weekly History */}
          <div className="glass-card-strong rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              <Calendar className="w-5 h-5 text-blue-500" />
              This Week
            </h3>
            <div className="space-y-3">
              {[...Array(7)].map((_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - i)
                // Use local date string format
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                const dateStr = `${year}-${month}-${day}`
                const dayLog = history.find(h => h.date === dateStr)
                const dayGlasses = dayLog?.glasses || 0
                const dayGoal = dayLog?.goal || goal
                const dayPercent = Math.min((dayGlasses / dayGoal) * 100, 100)
                const isToday = i === 0
                
                return (
                  <div key={i} className="flex items-center gap-4">
                    <span className={`w-12 text-sm ${
                      isToday 
                        ? isDark ? 'text-blue-400 font-medium' : 'text-blue-600 font-medium'
                        : 'text-gray-500'
                    }`}>
                      {isToday ? 'Today' : date.toLocaleDateString('en-GB', { weekday: 'short' })}
                    </span>
                    <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          dayPercent >= 100 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                            : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                        }`}
                        style={{ width: `${dayPercent}%` }}
                      />
                    </div>
                    <span className={`w-16 text-right text-sm ${
                      dayPercent >= 100 ? 'text-green-500 font-medium' : 'text-gray-500'
                    }`}>
                      {dayGlasses}/{dayGoal}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tips */}
          <div className={`rounded-2xl p-5 animate-fade-in ${
            isDark 
              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/10 border border-blue-500/20' 
              : 'bg-gradient-to-r from-blue-50 to-cyan-50'
          }`} style={{ animationDelay: '0.4s' }}>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Hydration Tip
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drink a glass of water when you wake up to kickstart your metabolism and hydrate after sleep.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Edit Modal */}
      {showGoalEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl p-6 w-full max-w-sm ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Set Daily Goal
            </h3>
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setGoal(g => Math.max(1, g - 1))}
                className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              >
                <Minus className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
              <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {goal}
              </span>
              <button
                onClick={() => setGoal(g => Math.min(20, g + 1))}
                className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              >
                <Plus className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <p className="text-center text-sm text-gray-500 mb-6">glasses per day</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowGoalEdit(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => updateGoal(goal)}
                className="flex-1 px-4 py-3 rounded-xl bg-blue-500 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </FeatureGate>
  )
}

export default WaterTracker