import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useToast } from '../../contexts/ToastContext'
import {
  getChallengeWithDays,
  createChallenge,
  updateChallenge,
  createChallengeDay,
  updateChallengeDay,
  deleteChallengeDay,
  bulkCreateChallengeDays,
  deleteAllChallengeDays,
  generateChallengeDaysWithAI
} from '../../lib/adminChallenges'
import {
  ArrowLeft,
  Save,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Edit,
  RefreshCw,
  Eye,
  AlertTriangle,
  Check,
  Calendar,
  Trophy,
  FileText
} from 'lucide-react'

const AdminChallengeEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { toast } = useToast()
  const isNew = id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [expandedDay, setExpandedDay] = useState(null)
  const [editingDay, setEditingDay] = useState(null)

  // Challenge form data
  const [challenge, setChallenge] = useState({
    title: '',
    description: '',
    long_description: '',
    duration_days: 7,
    difficulty: 'beginner',
    category: 'nutrition',
    points_reward: 100,
    requirements: [],
    benefits: [],
    is_active: false,
    is_featured: false,
    status: 'draft'
  })

  // Days data
  const [days, setDays] = useState([])

  // AI Direction
  const [aiDirection, setAiDirection] = useState('')

  // Temp fields for requirements/benefits
  const [newRequirement, setNewRequirement] = useState('')
  const [newBenefit, setNewBenefit] = useState('')

  useEffect(() => {
    if (!isNew) {
      loadChallenge()
    }
  }, [id])

  const loadChallenge = async () => {
    setLoading(true)
    const data = await getChallengeWithDays(id)
    if (data) {
      setChallenge({
        ...data,
        requirements: JSON.parse(data.requirements || '[]'),
        benefits: JSON.parse(data.benefits || '[]')
      })
      setDays(data.days || [])
    } else {
      toast.error('Challenge not found')
      navigate('/admin/challenges')
    }
    setLoading(false)
  }

  const handleSaveChallenge = async () => {
    if (!challenge.title || !challenge.description) {
      toast.error('Please fill in title and description')
      return
    }

    setSaving(true)
    try {
      const saveData = {
        ...challenge,
        requirements: JSON.stringify(challenge.requirements),
        benefits: JSON.stringify(challenge.benefits)
      }
      delete saveData.days
      delete saveData.id
      delete saveData.created_at
      delete saveData.updated_at
      delete saveData.slug

      if (isNew) {
        const created = await createChallenge(saveData)
        toast.success('Challenge created!')
        navigate(`/admin/challenges/${created.id}`)
      } else {
        await updateChallenge(id, saveData)
        toast.success('Challenge saved!')
      }
    } catch (error) {
      toast.error('Failed to save challenge')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateDays = async () => {
    if (!challenge.title || !challenge.duration_days) {
      toast.error('Please set title and duration first')
      return
    }

    if (!aiDirection.trim()) {
      toast.error('Please provide AI direction')
      return
    }

    setGenerating(true)
    try {
      // Generate days with AI
      const generatedDays = await generateChallengeDaysWithAI(challenge, aiDirection)

      if (!isNew && days.length > 0) {
        // Delete existing days first
        await deleteAllChallengeDays(id)
      }

      // Format days for database
      const daysToCreate = generatedDays.map(day => ({
        challenge_id: id,
        day_number: day.day_number,
        title: day.title,
        description: day.description,
        scripture: day.scripture,
        scripture_reference: day.scripture_reference,
        reflection: day.reflection,
        tasks: JSON.stringify(day.tasks || []),
        tips: JSON.stringify(day.tips || []),
        meal_suggestions: JSON.stringify(day.meal_suggestions || [])
      }))

      if (!isNew) {
        // Bulk create in database
        await bulkCreateChallengeDays(daysToCreate)
        loadChallenge()
      } else {
        // Just set in state for new challenges
        setDays(generatedDays.map(d => ({
          ...d,
          tasks: d.tasks || [],
          tips: d.tips || [],
          meal_suggestions: d.meal_suggestions || []
        })))
      }

      toast.success(`Generated ${generatedDays.length} days!`)
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate days. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveDay = async (day) => {
    try {
      const dayData = {
        ...day,
        tasks: JSON.stringify(day.tasks || []),
        tips: JSON.stringify(day.tips || []),
        meal_suggestions: JSON.stringify(day.meal_suggestions || [])
      }

      if (day.id) {
        await updateChallengeDay(day.id, dayData)
      } else {
        await createChallengeDay({ ...dayData, challenge_id: id })
      }
      
      toast.success('Day saved!')
      loadChallenge()
      setEditingDay(null)
    } catch (error) {
      toast.error('Failed to save day')
    }
  }

  const handleDeleteDay = async (dayId) => {
    try {
      await deleteChallengeDay(dayId)
      toast.success('Day deleted')
      loadChallenge()
    } catch (error) {
      toast.error('Failed to delete day')
    }
  }

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setChallenge(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }))
      setNewRequirement('')
    }
  }

  const removeRequirement = (index) => {
    setChallenge(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setChallenge(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }))
      setNewBenefit('')
    }
  }

  const removeBenefit = (index) => {
    setChallenge(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/challenges')}
            className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          <div>
            <h1 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isNew ? 'Create Challenge' : 'Edit Challenge'}
            </h1>
            {!isNew && (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {challenge.status === 'draft' ? '📝 Draft' : '✅ Published'}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleSaveChallenge}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isNew ? 'Create' : 'Save'}
        </button>
      </div>

      {/* Basic Info */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Basic Information
        </h2>
        
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Title *
            </label>
            <input
              type="text"
              value={challenge.title}
              onChange={(e) => setChallenge(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., 7-Day Sugar Detox"
              className={`w-full px-4 py-2 rounded-xl border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
            />
          </div>

          {/* Short Description */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Short Description *
            </label>
            <input
              type="text"
              value={challenge.description}
              onChange={(e) => setChallenge(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description (shown in cards)"
              className={`w-full px-4 py-2 rounded-xl border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
            />
          </div>

          {/* Long Description */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Full Description
            </label>
            <textarea
              value={challenge.long_description}
              onChange={(e) => setChallenge(prev => ({ ...prev, long_description: e.target.value }))}
              placeholder="Detailed description shown on challenge page..."
              rows={4}
              className={`w-full px-4 py-2 rounded-xl border resize-none ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
            />
          </div>

          {/* Row: Duration, Category, Difficulty */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Duration (days)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={challenge.duration_days}
                onChange={(e) => setChallenge(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 1 }))}
                className={`w-full px-4 py-2 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Category
              </label>
              <select
                value={challenge.category}
                onChange={(e) => setChallenge(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full px-4 py-2 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
              >
                <option value="fasting">Fasting</option>
                <option value="nutrition">Nutrition</option>
                <option value="hydration">Hydration</option>
                <option value="prayer">Prayer</option>
                <option value="fitness">Fitness</option>
                <option value="mindset">Mindset</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Difficulty
              </label>
              <select
                value={challenge.difficulty}
                onChange={(e) => setChallenge(prev => ({ ...prev, difficulty: e.target.value }))}
                className={`w-full px-4 py-2 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Points */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Points Reward
            </label>
            <input
              type="number"
              min="0"
              value={challenge.points_reward}
              onChange={(e) => setChallenge(prev => ({ ...prev, points_reward: parseInt(e.target.value) || 0 }))}
              className={`w-full px-4 py-2 rounded-xl border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
            />
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Requirements
        </h2>
        <div className="space-y-3">
          {challenge.requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className={`flex-1 px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {req}
              </span>
              <button
                onClick={() => removeRequirement(index)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
              placeholder="Add requirement..."
              className={`flex-1 px-4 py-2 rounded-xl border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
            />
            <button
              onClick={addRequirement}
              className="px-4 py-2 rounded-xl bg-temple-purple text-white"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Benefits
        </h2>
        <div className="space-y-3">
          {challenge.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className={`flex-1 px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {benefit}
              </span>
              <button
                onClick={() => removeBenefit(index)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
              placeholder="Add benefit..."
              className={`flex-1 px-4 py-2 rounded-xl border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
            />
            <button
              onClick={addBenefit}
              className="px-4 py-2 rounded-xl bg-temple-purple text-white"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Day Generation */}
      <div className={`rounded-2xl p-6 border-2 border-dashed ${
        isDark ? 'bg-gray-800/50 border-temple-purple/30' : 'bg-purple-50/50 border-temple-purple/30'
      }`}>
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-temple-purple/20' : 'bg-temple-purple/10'
          }`}>
            <Sparkles className="w-6 h-6 text-temple-purple" />
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              AI Content Generator
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Provide direction and let AI generate all {challenge.duration_days} days of content
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              AI Direction *
            </label>
            <textarea
              value={aiDirection}
              onChange={(e) => setAiDirection(e.target.value)}
              placeholder={`Guide the AI with specifics:
- What topics should each day cover?
- Any specific scriptures or themes to include?
- Particular focus areas or restrictions?
- Tone and style preferences?

Example: "Focus on breaking emotional eating patterns. Include scriptures about self-control and finding comfort in God. Days 1-3 should address identifying triggers, days 4-5 on healthy coping, days 6-7 on maintaining progress. Include practical tips for social situations."`}
              rows={6}
              className={`w-full px-4 py-3 rounded-xl border resize-none ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
            />
          </div>

          {days.length > 0 && (
            <div className={`p-3 rounded-xl ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
              <p className={`text-sm flex items-center gap-2 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                <AlertTriangle className="w-4 h-4" />
                Generating will replace all existing {days.length} days
              </p>
            </div>
          )}

          <button
            onClick={handleGenerateDays}
            disabled={generating || !aiDirection.trim() || isNew}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
              generating || !aiDirection.trim() || isNew
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-temple-purple to-temple-gold text-white hover:opacity-90'
            }`}
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating {challenge.duration_days} days...
              </>
            ) : isNew ? (
              <>
                <AlertTriangle className="w-5 h-5" />
                Save challenge first to generate days
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate All Days with AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Days List */}
      {!isNew && (
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Daily Content ({days.length}/{challenge.duration_days} days)
            </h2>
            <button
              onClick={() => setEditingDay({ day_number: days.length + 1, title: '', description: '', scripture: '', scripture_reference: '', reflection: '', tasks: [], tips: [], meal_suggestions: [] })}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Day
            </button>
          </div>

          {days.length === 0 ? (
            <div className={`text-center py-8 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <Calendar className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No days created yet. Use AI to generate content!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {days.map((day) => {
                const isExpanded = expandedDay === day.day_number
                const tasks = typeof day.tasks === 'string' ? JSON.parse(day.tasks) : day.tasks || []
                
                return (
                  <div 
                    key={day.id || day.day_number}
                    className={`rounded-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    {/* Day Header */}
                    <button
                      onClick={() => setExpandedDay(isExpanded ? null : day.day_number)}
                      className={`w-full px-4 py-3 flex items-center justify-between text-left ${
                        isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      } rounded-xl`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                        }`}>
                          {day.day_number}
                        </div>
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {day.title || `Day ${day.day_number}`}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {tasks.length} tasks • {day.scripture_reference || 'No scripture'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingDay({
                              ...day,
                              tasks: typeof day.tasks === 'string' ? JSON.parse(day.tasks) : day.tasks || [],
                              tips: typeof day.tips === 'string' ? JSON.parse(day.tips) : day.tips || [],
                              meal_suggestions: typeof day.meal_suggestions === 'string' ? JSON.parse(day.meal_suggestions) : day.meal_suggestions || []
                            })
                          }}
                          className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className={`px-4 pb-4 pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className={`p-3 rounded-lg mb-3 ${isDark ? 'bg-temple-purple/10' : 'bg-temple-purple/5'}`}>
                          <p className={`text-sm italic ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            "{day.scripture}"
                          </p>
                          <p className="text-xs text-temple-purple mt-1">— {day.scripture_reference}</p>
                        </div>
                        <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {day.description}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <strong>Reflection:</strong> {day.reflection}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Day Editor Modal */}
      {editingDay && (
        <DayEditorModal
          day={editingDay}
          isDark={isDark}
          onSave={handleSaveDay}
          onClose={() => setEditingDay(null)}
          onDelete={editingDay.id ? () => handleDeleteDay(editingDay.id) : null}
        />
      )}
    </div>
  )
}

// Day Editor Modal Component
const DayEditorModal = ({ day, isDark, onSave, onClose, onDelete }) => {
  const [formData, setFormData] = useState(day)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave(formData)
    setSaving(false)
  }

  const updateTask = (index, value) => {
    const newTasks = [...formData.tasks]
    newTasks[index] = value
    setFormData(prev => ({ ...prev, tasks: newTasks }))
  }

  const addTask = () => {
    setFormData(prev => ({ ...prev, tasks: [...prev.tasks, ''] }))
  }

  const removeTask = (index) => {
    setFormData(prev => ({ ...prev, tasks: prev.tasks.filter((_, i) => i !== index) }))
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className={`rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Edit Day {formData.day_number}
        </h3>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className={`w-full px-4 py-2 rounded-xl border resize-none ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
              }`}
            />
          </div>

          {/* Scripture */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Scripture
              </label>
              <textarea
                value={formData.scripture}
                onChange={(e) => setFormData(prev => ({ ...prev, scripture: e.target.value }))}
                rows={2}
                className={`w-full px-4 py-2 rounded-xl border resize-none ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Reference
              </label>
              <input
                type="text"
                value={formData.scripture_reference}
                onChange={(e) => setFormData(prev => ({ ...prev, scripture_reference: e.target.value }))}
                placeholder="e.g., John 3:16"
                className={`w-full px-4 py-2 rounded-xl border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                }`}
              />
            </div>
          </div>

          {/* Reflection */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Reflection
            </label>
            <textarea
              value={formData.reflection}
              onChange={(e) => setFormData(prev => ({ ...prev, reflection: e.target.value }))}
              rows={3}
              className={`w-full px-4 py-2 rounded-xl border resize-none ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
              }`}
            />
          </div>

          {/* Tasks */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Tasks
            </label>
            <div className="space-y-2">
              {formData.tasks.map((task, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => updateTask(index, e.target.value)}
                    className={`flex-1 px-4 py-2 rounded-xl border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                    }`}
                  />
                  <button
                    onClick={() => removeTask(index)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addTask}
                className={`w-full py-2 rounded-xl border-2 border-dashed text-sm ${
                  isDark ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
                }`}
              >
                + Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 rounded-xl text-red-500 hover:bg-red-500/10"
            >
              Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-temple-purple text-white flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminChallengeEditor