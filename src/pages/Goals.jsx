import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { 
  getGoals, 
  createGoal, 
  updateGoal, 
  updateGoalProgress, 
  deleteGoal,
  getMilestones,
  createMilestone,
  updateMilestone,
  toggleMilestone,
  deleteMilestone
} from '../lib/habits'
import { generateInspiration } from '../lib/gemini'
import {
  Plus,
  Target,
  Trophy,
  Calendar,
  TrendingUp,
  Check,
  Edit,
  Trash2,
  X,
  BookOpen,
  Dumbbell,
  Heart,
  Brain,
  Loader2,
  Pause,
  Play,
  Zap,
  Flame,
  AlertCircle,
  Flag,
  CheckCircle2,
  Circle,
  ListTodo,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react'

const Goals = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { toast } = useToast()

  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [filter, setFilter] = useState('active')

  useEffect(() => {
    if (user) {
      loadGoals()
    }
  }, [filter, user])

  const loadGoals = async () => {
    setLoading(true)
    const data = await getGoals(user.id, filter)
    setGoals(data)
    setLoading(false)
  }

  const handleUpdateProgress = async (goalId, newValue) => {
    try {
      await updateGoalProgress(goalId, newValue)
      loadGoals()
      toast.success('Progress updated! 🎯')
    } catch (error) {
      toast.error('Failed to update progress')
    }
  }

  const handleStatusChange = async (goalId, newStatus) => {
    try {
      await updateGoal(goalId, { status: newStatus })
      loadGoals()
      if (newStatus === 'completed') {
        toast.success('🎉 Goal completed! Amazing work!')
      } else {
        toast.success(`Goal ${newStatus}!`)
      }
    } catch (error) {
      toast.error('Failed to update goal')
    }
  }

  const handleDelete = async (goalId) => {
    if (!confirm('Delete this goal? This cannot be undone.')) return
    try {
      await deleteGoal(goalId)
      loadGoals()
      toast.success('Goal deleted')
    } catch (error) {
      toast.error('Failed to delete goal')
    }
  }

  const categoryConfig = {
    spiritual: { icon: BookOpen, color: '#8B5CF6', label: 'Spiritual' },
    nutrition: { icon: Target, color: '#10B981', label: 'Nutrition' },
    fitness: { icon: Dumbbell, color: '#F59E0B', label: 'Fitness' },
    health: { icon: Heart, color: '#EF4444', label: 'Health' },
    mindset: { icon: Brain, color: '#EC4899', label: 'Mindset' },
    relationships: { icon: Heart, color: '#EF4444', label: 'Relationships' },
    other: { icon: Flag, color: '#6B7280', label: 'Other' }
  }

  const stats = {
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    avgProgress: goals.length > 0
      ? Math.round(goals.reduce((sum, g) => {
          if (g.target_value && g.status !== 'completed') {
            return sum + Math.min(100, (g.current_value / g.target_value) * 100)
          }
          return sum + (g.status === 'completed' ? 100 : 0)
        }, 0) / goals.length)
      : 0
  }

  const statusFilters = [
    { id: 'active', label: 'Active', icon: Play, count: stats.active },
    { id: 'completed', label: 'Completed', icon: Trophy, count: stats.completed },
    { id: 'paused', label: 'Paused', icon: Pause, count: goals.filter(g => g.status === 'paused').length },
    { id: 'all', label: 'All', icon: Target, count: stats.total }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin mx-auto mb-4" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading your goals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 lg:pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-3xl md:text-4xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Goals Dashboard
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Track your journey to becoming who God created you to be
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">New Goal</span>
        </button>
      </div>

      {goals.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`rounded-2xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-temple-purple" />
              <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.total}
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Goals</p>
          </div>

          <div className={`rounded-2xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-8 h-8 text-orange-500" />
              <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.active}
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</p>
          </div>

          <div className={`rounded-2xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-green-500" />
              <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.completed}
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
          </div>

          <div className={`rounded-2xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.avgProgress}%
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Progress</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
        {statusFilters.map((f) => {
          const Icon = f.icon
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
                filter === f.id
                  ? 'bg-gradient-to-r from-temple-purple to-temple-gold text-white shadow-lg'
                  : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white shadow text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {f.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === f.id ? 'bg-white/20' : isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {f.count}
              </span>
            </button>
          )
        })}
      </div>

      {goals.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-temple-purple/20 to-temple-gold/20 flex items-center justify-center mx-auto mb-4">
            <Target className={`w-10 h-10 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {filter === 'all' ? 'No goals yet' : `No ${filter} goals`}
          </h3>
          <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Set an outcome goal to work towards. Break down your dreams into achievable milestones.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              categoryConfig={categoryConfig}
              isDark={isDark}
              onEdit={() => setEditingGoal(goal)}
              onUpdateProgress={handleUpdateProgress}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              user={user}
              toast={toast}
            />
          ))}
        </div>
      )}

      {(showCreateModal || editingGoal) && (
        <GoalModal
          goal={editingGoal}
          isDark={isDark}
          categoryConfig={categoryConfig}
          onClose={() => { setShowCreateModal(false); setEditingGoal(null) }}
          onSave={async (goalData) => {
            try {
              if (editingGoal) {
                await updateGoal(editingGoal.id, goalData)
                toast.success('Goal updated! 🎯')
              } else {
                await createGoal(user.id, goalData)
                toast.success('Goal created! Let\'s make it happen! 🚀')
              }
              setShowCreateModal(false)
              setEditingGoal(null)
              loadGoals()
            } catch (error) {
              toast.error('Failed to save goal')
            }
          }}
        />
      )}
    </div>
  )
}

const GoalCard = ({ goal, categoryConfig, isDark, onEdit, onUpdateProgress, onStatusChange, onDelete, user, toast }) => {
  const [showMilestones, setShowMilestones] = useState(false)
  const [milestones, setMilestones] = useState([])
  const [loadingMilestones, setLoadingMilestones] = useState(false)
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', due_date: '' })
  const [inspiration, setInspiration] = useState(null)
  const [loadingInspiration, setLoadingInspiration] = useState(false)
  const [showInspiration, setShowInspiration] = useState(false)
  
  const config = categoryConfig[goal.category] || categoryConfig.other
  const Icon = config.icon
  const color = config.color
  
  const progress = goal.target_value 
    ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
    : 0
  
  const daysLeft = goal.target_date 
    ? Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  const isOverdue = daysLeft !== null && daysLeft < 0 && goal.status === 'active'
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && goal.status === 'active'

  const loadMilestones = async () => {
    if (loadingMilestones) return
    setLoadingMilestones(true)
    try {
      const data = await getMilestones(goal.id)
      setMilestones(data)
    } catch (error) {
      console.error('Error loading milestones:', error)
    } finally {
      setLoadingMilestones(false)
    }
  }

  const handleToggleMilestones = async () => {
    if (!showMilestones && milestones.length === 0) {
      await loadMilestones()
    }
    setShowMilestones(!showMilestones)
  }

  const handleAddMilestone = async () => {
    if (!newMilestone.title) return
    try {
      await createMilestone(goal.id, user.id, {
        ...newMilestone,
        sort_order: milestones.length
      })
      await loadMilestones()
      setNewMilestone({ title: '', description: '', due_date: '' })
      setShowAddMilestone(false)
      toast.success('Milestone added!')
    } catch (error) {
      toast.error('Failed to add milestone')
    }
  }

  const handleToggleMilestone = async (milestoneId, isCompleted) => {
    try {
      await toggleMilestone(milestoneId, !isCompleted)
      await loadMilestones()
      toast.success(isCompleted ? 'Milestone reopened' : 'Milestone completed! 🎉')
    } catch (error) {
      toast.error('Failed to update milestone')
    }
  }

  const handleDeleteMilestone = async (milestoneId) => {
    if (!confirm('Delete this milestone?')) return
    try {
      await deleteMilestone(milestoneId)
      await loadMilestones()
      toast.success('Milestone deleted')
    } catch (error) {
      toast.error('Failed to delete milestone')
    }
  }

  const completedMilestones = milestones.filter(m => m.is_completed).length
  const totalMilestones = milestones.length

  const handleGenerateInspiration = async () => {
    setLoadingInspiration(true)
    try {
      const result = await generateInspiration('goal', goal)
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

  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all hover:scale-[1.01] ${
        goal.status === 'completed'
          ? isDark ? 'bg-green-500/10 border-2 border-green-500/30' : 'bg-green-50 border-2 border-green-200'
          : isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg border border-gray-100'
      }`}
    >
      <div 
        className="p-6 relative overflow-hidden"
        style={{ 
          background: goal.status === 'completed' 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)'
            : `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`
        }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg relative"
            style={{ 
              backgroundColor: goal.status === 'completed' ? '#10B981' : color
            }}
          >
            {goal.status === 'completed' ? (
              <Trophy className="w-8 h-8 text-white" />
            ) : (
              <Icon className="w-8 h-8 text-white" />
            )}
            {progress >= 75 && progress < 100 && goal.status === 'active' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {goal.title}
                  </h3>
                  <span 
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: color + '20',
                      color: color
                    }}
                  >
                    {config.label}
                  </span>
                </div>
                {goal.description && (
                  <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {goal.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1">
                {goal.status === 'active' && (
                  <>
                    <button
                      onClick={onEdit}
                      className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/5 text-gray-600'}`}
                      title="Edit Goal"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onStatusChange(goal.id, 'paused')}
                      className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-amber-500/20 text-amber-400' : 'hover:bg-amber-50 text-amber-600'}`}
                      title="Pause Goal"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  </>
                )}
                {goal.status === 'paused' && (
                  <button
                    onClick={() => onStatusChange(goal.id, 'active')}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-green-500/20 text-green-400' : 'hover:bg-green-50 text-green-600'}`}
                    title="Resume Goal"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(goal.id)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                  title="Delete Goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {goal.target_value && goal.status !== 'completed' && (
        <div className="p-6">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {goal.current_value}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Current</div>
            </div>
            <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {Math.max(0, goal.target_value - goal.current_value)}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Remaining</div>
            </div>
            <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {goal.target_value}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Target</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {goal.current_value} / {goal.target_value} {goal.unit}
              </span>
              <span 
                className="text-lg font-bold"
                style={{ color: progress === 100 ? '#10B981' : color }}
              >
                {progress}%
              </span>
            </div>
            
            <div className={`h-3 rounded-full relative overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className="h-full rounded-full transition-all duration-500 relative overflow-hidden"
                style={{ 
                  width: `${progress}%`,
                  background: progress >= 100
                    ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                    : `linear-gradient(90deg, ${color} 0%, ${color}DD 100%)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>

            {progress < 100 && (
              <div className="flex justify-between mt-1.5 px-0.5">
                {[25, 50, 75].map(milestone => (
                  <div key={milestone} className="relative">
                    <div className={`w-0.5 h-2 ${progress >= milestone ? 'bg-green-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
                    {progress < milestone && milestone - progress <= 10 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-amber-500 whitespace-nowrap">
                        {milestone}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
            <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Quick Update Progress
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={goal.current_value}
                min="0"
                max={goal.target_value}
                step="0.1"
                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium ${
                  isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                onBlur={(e) => {
                  const val = parseFloat(e.target.value)
                  if (!isNaN(val) && val !== goal.current_value) {
                    onUpdateProgress(goal.id, val)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = parseFloat(e.target.value)
                    if (!isNaN(val) && val !== goal.current_value) {
                      onUpdateProgress(goal.id, val)
                      e.target.blur()
                    }
                  }
                }}
              />
              <span className={`text-sm font-medium px-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {goal.unit}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={`px-6 pb-6 ${goal.target_value && goal.status !== 'completed' ? 'pt-0' : 'pt-6'}`}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {daysLeft !== null && goal.status === 'active' && (
            <div 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                isOverdue ? 'bg-red-500/10 text-red-500' :
                isUrgent ? 'bg-amber-500/10 text-amber-500' :
                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {isOverdue ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  {Math.abs(daysLeft)} days overdue
                </>
              ) : daysLeft === 0 ? (
                <>
                  <Zap className="w-4 h-4" />
                  Due today!
                </>
              ) : daysLeft <= 7 ? (
                <>
                  <Flame className="w-4 h-4" />
                  {daysLeft} days left
                </>
              ) : (
                `${daysLeft} days left`
              )}
            </div>
          )}
          
          {goal.status === 'completed' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-sm font-medium">
              <Trophy className="w-4 h-4" />
              Completed {new Date(goal.completed_at).toLocaleDateString()}
            </div>
          )}
          
          {goal.status === 'paused' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 text-sm font-medium">
              <Pause className="w-4 h-4" />
              Paused
            </div>
          )}
        </div>

        {goal.why_important && (
          <div className={`p-3 rounded-xl mb-3 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-rose-500" />
              <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Why This Matters
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {goal.why_important}
            </p>
          </div>
        )}

        {goal.scripture_motivation && (
          <div className={`p-3 rounded-xl border-l-4 border-purple-500 mb-3 ${
            isDark ? 'bg-purple-500/10 text-gray-300' : 'bg-purple-50 text-gray-700'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-purple-500" />
              <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                Scripture Inspiration
              </span>
            </div>
            <p className="text-sm italic">
              "{goal.scripture_motivation}"
            </p>
          </div>
        )}

        {/* Milestones Section */}
        {goal.status !== 'completed' && (
          <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
            <button
              onClick={handleToggleMilestones}
              className="w-full p-3 flex items-center justify-between hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-blue-500" />
                <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Milestones
                </span>
                {totalMilestones > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    completedMilestones === totalMilestones
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-blue-500/20 text-blue-500'
                  }`}>
                    {completedMilestones}/{totalMilestones}
                  </span>
                )}
              </div>
              {showMilestones ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {showMilestones && (
              <div className="px-3 pb-3 space-y-2">
                {loadingMilestones ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                  </div>
                ) : milestones.length === 0 && !showAddMilestone ? (
                  <div className="text-center py-4">
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      No milestones yet
                    </p>
                    <button
                      onClick={() => setShowAddMilestone(true)}
                      className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                    >
                      + Add First Milestone
                    </button>
                  </div>
                ) : (
                  <>
                    {milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className={`flex items-start gap-3 p-2 rounded-lg ${
                          milestone.is_completed
                            ? isDark ? 'bg-green-500/10' : 'bg-green-50'
                            : isDark ? 'bg-gray-600/30' : 'bg-white'
                        }`}
                      >
                        <button
                          onClick={() => handleToggleMilestone(milestone.id, milestone.is_completed)}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {milestone.is_completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${
                            milestone.is_completed
                              ? 'line-through text-gray-500'
                              : isDark ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {milestone.title}
                          </div>
                          {milestone.description && (
                            <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {milestone.description}
                            </div>
                          )}
                          {milestone.due_date && (
                            <div className={`text-xs mt-1 flex items-center gap-1 ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              <Calendar className="w-3 h-3" />
                              {new Date(milestone.due_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteMilestone(milestone.id)}
                          className={`p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-500`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {!showAddMilestone && (
                      <button
                        onClick={() => setShowAddMilestone(true)}
                        className="w-full py-2 text-sm text-blue-500 hover:text-blue-600 font-medium text-center"
                      >
                        + Add Milestone
                      </button>
                    )}
                  </>
                )}

                {showAddMilestone && (
                  <div className={`p-3 rounded-lg border-2 border-dashed ${
                    isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}>
                    <input
                      type="text"
                      placeholder="Milestone title *"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border text-sm mb-2 ${
                        isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border text-sm mb-2 ${
                        isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                      }`}
                    />
                    <input
                      type="date"
                      value={newMilestone.due_date}
                      onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border text-sm mb-3 ${
                        isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowAddMilestone(false)
                          setNewMilestone({ title: '', description: '', due_date: '' })
                        }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                          isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddMilestone}
                        disabled={!newMilestone.title}
                        className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Milestone
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Inspiration Section */}
      <div className="px-6 pb-4">
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
          <div className={`rounded-xl p-4 border-2 ${
            isDark 
              ? 'bg-gradient-to-br from-temple-purple/10 to-temple-gold/10 border-temple-purple/30' 
              : 'bg-gradient-to-br from-temple-purple/5 to-temple-gold/5 border-temple-purple/20'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-temple-purple" />
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Inspiration for Your Journey
                </h4>
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

            <div className={`p-3 rounded-lg border-l-4 border-temple-purple mb-2 ${
              isDark ? 'bg-purple-500/10' : 'bg-purple-50'
            }`}>
              <p className={`text-sm italic mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                "{inspiration.scripture}"
              </p>
              <p className="text-xs text-temple-purple font-medium">
                — {inspiration.scriptureReference}
              </p>
            </div>

            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                💡 <strong>Wisdom:</strong> {inspiration.wisdom}
              </p>
            </div>

            <button
              onClick={handleGenerateInspiration}
              disabled={loadingInspiration}
              className={`w-full mt-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
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

      {goal.status === 'active' && progress >= 100 && (
        <div className="px-6 pb-6">
          <button
            onClick={() => onStatusChange(goal.id, 'completed')}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
          >
            <Trophy className="w-6 h-6" />
            Mark as Complete!
          </button>
        </div>
      )}
    </div>
  )
}

const GoalModal = ({ goal, isDark, categoryConfig, onClose, onSave }) => {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    category: goal?.category || 'health',
    target_value: goal?.target_value || '',
    current_value: goal?.current_value || 0,
    unit: goal?.unit || '',
    target_date: goal?.target_date || '',
    why_important: goal?.why_important || '',
    scripture_motivation: goal?.scripture_motivation || ''
  })

  const handleSave = async () => {
    if (!formData.title) {
      return
    }
    setSaving(true)
    await onSave({
      ...formData,
      target_value: formData.target_value ? parseFloat(formData.target_value) : null,
      current_value: parseFloat(formData.current_value) || 0
    })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-2xl p-6 my-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {goal ? 'Edit Goal' : 'Create New Goal'}
            </h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Set a specific, measurable outcome to work towards
            </p>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Goal Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Lose 20 pounds, Read 52 books, Run a 5K..."
              className={`w-full px-4 py-3 rounded-xl border text-lg ${
                isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-temple-purple/30`}
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does success look like? Be specific..."
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border resize-none ${
                isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-temple-purple/30`}
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(categoryConfig).map(([id, config]) => {
                const Icon = config.icon
                const isSelected = formData.category === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: id })}
                    className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      isSelected
                        ? 'ring-2 ring-temple-purple shadow-lg scale-105'
                        : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    style={isSelected ? { backgroundColor: config.color + '20' } : undefined}
                  >
                    <Icon className="w-6 h-6" style={{ color: isSelected ? config.color : undefined }} />
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {config.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Target Value
              </label>
              <input
                type="number"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                placeholder="e.g., 20"
                step="0.1"
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-temple-purple/30`}
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., lbs, books, km"
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-temple-purple/30`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Target Completion Date
            </label>
            <input
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-temple-purple/30`}
            />
          </div>

          <div>
            <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Heart className="w-4 h-4 text-rose-500" />
              Why is this important to you?
            </label>
            <textarea
              value={formData.why_important}
              onChange={(e) => setFormData({ ...formData, why_important: e.target.value })}
              placeholder="Connect to your deeper motivation and purpose..."
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border resize-none ${
                isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-temple-purple/30`}
            />
          </div>

          <div>
            <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <BookOpen className="w-4 h-4 text-purple-500" />
              Scripture Motivation
            </label>
            <input
              type="text"
              value={formData.scripture_motivation}
              onChange={(e) => setFormData({ ...formData, scripture_motivation: e.target.value })}
              placeholder="A verse that inspires this goal..."
              className={`w-full px-4 py-3 rounded-xl border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-temple-purple/30`}
            />
          </div>
        </div>

        <div className={`flex gap-3 mt-6 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-semibold ${
              isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.title}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                {goal ? 'Update Goal' : 'Create Goal'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Goals
