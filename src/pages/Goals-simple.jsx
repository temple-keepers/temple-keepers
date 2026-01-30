import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { getGoals, createGoal, updateGoal, updateGoalProgress, deleteGoal } from '../lib/habits'
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
  ChevronRight,
  Flag,
  Sparkles,
  BookOpen,
  Dumbbell,
  Heart,
  Brain,
  MoreVertical,
  Loader2,
  CheckCircle,
  Clock,
  Pause,
  Archive
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
    loadGoals()
  }, [filter])

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
      toast.success('Progress updated!')
    } catch (error) {
      toast.error('Failed to update progress')
    }
  }

  const handleStatusChange = async (goalId, newStatus) => {
    try {
      await updateGoal(goalId, { status: newStatus })
      loadGoals()
      toast.success(`Goal ${newStatus}!`)
    } catch (error) {
      toast.error('Failed to update goal')
    }
  }

  const handleDelete = async (goalId) => {
    if (!confirm('Delete this goal?')) return
    try {
      await deleteGoal(goalId)
      loadGoals()
      toast.success('Goal deleted')
    } catch (error) {
      toast.error('Failed to delete goal')
    }
  }

  const categoryIcons = {
    spiritual: BookOpen,
    nutrition: Target,
    fitness: Dumbbell,
    health: Heart,
    mindset: Brain,
    relationships: Heart,
    other: Flag
  }

  const categoryColors = {
    spiritual: '#8B5CF6',
    nutrition: '#10B981',
    fitness: '#F59E0B',
    health: '#EF4444',
    mindset: '#EC4899',
    relationships: '#EF4444',
    other: '#6B7280'
  }

  const statusFilters = [
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'paused', label: 'Paused' },
    { id: 'all', label: 'All' }
  ]

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
            Goals
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Your outcome goals
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {statusFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
              filter === f.id
                ? 'bg-temple-purple text-white'
                : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className={`text-center py-12 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <Target className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No goals yet
          </h3>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Set an outcome goal to work towards
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-temple-purple text-white text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const Icon = categoryIcons[goal.category] || Target
            const color = categoryColors[goal.category] || '#6B7280'
            const progress = goal.target_value 
              ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
              : 0
            const daysLeft = goal.target_date 
              ? Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24))
              : null

            return (
              <div
                key={goal.id}
                className={`rounded-2xl overflow-hidden ${
                  goal.status === 'completed'
                    ? isDark ? 'bg-green-500/10 border-2 border-green-500/30' : 'bg-green-50 border-2 border-green-200'
                    : isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg border border-gray-100'
                }`}
              >
                {/* Header Section with Gradient */}
                <div 
                  className="p-5 relative"
                  style={{ 
                    background: goal.status === 'completed' 
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)'
                      : `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                      style={{ 
                        backgroundColor: goal.status === 'completed' ? '#10B981' : color,
                        boxShadow: `0 8px 16px ${goal.status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : color + '40'}`
                      }}
                    >
                      {goal.status === 'completed' ? (
                        <Trophy className="w-8 h-8 text-white" />
                      ) : (
                        <Icon className="w-8 h-8 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
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
                              {goal.category}
                            </span>
                          </div>
                          {goal.description && (
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {goal.description}
                            </p>
                          )}
                        </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 ml-2">
                        {goal.status === 'active' && (
                          <>
                            <button
                              onClick={() => setEditingGoal(goal)}
                              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/5 text-gray-600'}`}
                              title="Edit Goal"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(goal.id, 'paused')}
                              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-amber-500/20 text-amber-400' : 'hover:bg-amber-50 text-amber-600'}`}
                              title="Pause Goal"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {goal.status === 'paused' && (
                          <button
                            onClick={() => handleStatusChange(goal.id, 'active')}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-green-500/20 text-green-400' : 'hover:bg-green-50 text-green-600'}`}
                            title="Resume Goal"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                          title="Delete Goal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>{{/* PLACEHOLDER */}}

                {/* Progress Section */}
                <div className="p-5">
                  {goal.target_value && goal.status !== 'completed' && (
                    <div>
                      {/* Progress Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {goal.current_value}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Current</div>
                        </div>
                        <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {goal.target_value - goal.current_value}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Remaining</div>
                        </div>
                        <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {goal.target_value}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Target</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {goal.current_value} / {goal.target_value} {goal.unit}
                          </span>
                          <span 
                            className="font-bold text-lg"
                            style={{ color: progress === 100 ? '#10B981' : color }}
                          >
                            {progress}%
                          </span>
                        </div>
                        <div className={`h-4 rounded-full relative overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className="h-full rounded-full transition-all duration-500 relative"
                            style={{ 
                              width: `${progress}%`,
                              background: progress === 100 
                                ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                                : `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`
                            }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </div>
                        </div>
                        
                        {/* Milestone markers */}
                        {progress < 100 && (
                          <div className="flex justify-between mt-1 px-1">
                            {[25, 50, 75].map(milestone => (
                              <span 
                                key={milestone}
                                className={`text-xs ${
                                  progress >= milestone 
                                    ? 'text-green-500 font-medium'
                                    : isDark ? 'text-gray-600' : 'text-gray-400'
                                }`}
                              >
                                {milestone >= progress && '│'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Quick progress update */}
                      <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Update Progress
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={goal.current_value}
                            min="0"
                            max={goal.target_value}
                            step="0.1"
                            className={`flex-1 px-3 py-2 rounded-lg border font-medium ${
                              isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            onBlur={(e) => {
                              const val = parseFloat(e.target.value)
                              if (!isNaN(val) && val !== goal.current_value) {
                                handleUpdateProgress(goal.id, val)
                              }
                            }}
                          />
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {goal.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Meta Information */}
                  <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex flex-wrap items-center gap-3">
                      {daysLeft !== null && goal.status === 'active' && (
                        <div 
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium ${
                            daysLeft < 0 ? 'bg-red-500/10 text-red-500' :
                            daysLeft < 7 ? 'bg-amber-500/10 text-amber-500' :
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` :
                             daysLeft === 0 ? 'Due today!' :
                             `${daysLeft} days left`}
                          </span>
                        </div>
                      )}
                      {goal.status === 'completed' && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 text-green-500 font-medium">
                          <Trophy className="w-4 h-4" />
                          <span className="text-sm">
                            Completed {new Date(goal.completed_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {goal.status === 'paused' && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-500 font-medium">
                          <Pause className="w-4 h-4" />
                          <span className="text-sm">Paused</span>
                        </div>
                      )}
                    </div>

                    {/* Why Important */}
                    {goal.why_important && (
                      <div className={`mt-3 p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          WHY THIS MATTERS
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {goal.why_important}
                        </p>
                      </div>
                    )}

                    {/* Scripture motivation */}
                    {goal.scripture_motivation && (
                      <div className={`mt-3 p-3 rounded-xl border-l-4 ${
                        isDark ? 'bg-purple-500/10 border-purple-500 text-gray-300' : 'bg-purple-50 border-purple-500 text-gray-700'
                      }`}>
                        <div className={`text-xs font-medium mb-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                          SCRIPTURE INSPIRATION
                        </div>
                        <p className="text-sm italic">
                          "{goal.scripture_motivation}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Complete button */}
                {goal.status === 'active' && progress >= 100 && (
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => handleStatusChange(goal.id, 'completed')}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                    >
                      <Trophy className="w-6 h-6" />
                      Mark as Complete!
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Goal Modal */}
      {(showCreateModal || editingGoal) && (
        <GoalModal
          goal={editingGoal}
          isDark={isDark}
          onClose={() => { setShowCreateModal(false); setEditingGoal(null) }}
          onSave={async (goalData) => {
            try {
              if (editingGoal) {
                await updateGoal(editingGoal.id, goalData)
                toast.success('Goal updated!')
              } else {
                await createGoal(user.id, goalData)
                toast.success('Goal created! 🎯')
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

// Goal Modal Component
const GoalModal = ({ goal, isDark, onClose, onSave }) => {
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

  const categories = [
    { id: 'spiritual', label: 'Spiritual' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'health', label: 'Health' },
    { id: 'mindset', label: 'Mindset' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'other', label: 'Other' }
  ]

  const handleSave = async () => {
    if (!formData.title) return
    setSaving(true)
    await onSave({
      ...formData,
      target_value: formData.target_value ? parseFloat(formData.target_value) : null,
      current_value: parseFloat(formData.current_value) || 0
    })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-lg rounded-2xl p-6 my-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {goal ? 'Edit Goal' : 'Create Goal'}
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Goal Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Lose 20 pounds, Run a 5K..."
              className={`w-full px-4 py-2 rounded-xl border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
              }`}
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does achieving this goal look like?"
              rows={2}
              className={`w-full px-4 py-2 rounded-xl border resize-none ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
              }`}
            />
          </div>

          {/* Category */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full px-4 py-2 rounded-xl border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
              }`}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Target */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Target Value
              </label>
              <input
                type="number"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                placeholder="e.g., 20"
                className={`w-full px-4 py-2 rounded-xl border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., lbs, km, days"
                className={`w-full px-4 py-2 rounded-xl border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                }`}
              />
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Target Date
            </label>
            <input
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className={`w-full px-4 py-2 rounded-xl border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
              }`}
            />
          </div>

          {/* Why Important */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Why is this important to you?
            </label>
            <textarea
              value={formData.why_important}
              onChange={(e) => setFormData({ ...formData, why_important: e.target.value })}
              placeholder="Connect to your deeper motivation..."
              rows={2}
              className={`w-full px-4 py-2 rounded-xl border resize-none ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
              }`}
            />
          </div>

          {/* Scripture */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Scripture Motivation
            </label>
            <input
              type="text"
              value={formData.scripture_motivation}
              onChange={(e) => setFormData({ ...formData, scripture_motivation: e.target.value })}
              placeholder="A verse that inspires this goal..."
              className={`w-full px-4 py-2 rounded-xl border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
              }`}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-medium ${
              isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.title}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            {goal ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Goals
