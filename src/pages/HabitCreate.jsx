import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { createHabit } from '../lib/habits'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Target,
  Droplets,
  BookOpen,
  Dumbbell,
  Moon,
  Heart,
  Brain,
  Sparkles,
  Clock,
  MapPin,
  Gift,
  AlertTriangle,
  Lightbulb,
  Link as LinkIcon,
  Loader2
} from 'lucide-react'

const HabitCreate = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Form state
  const [habit, setHabit] = useState({
    title: '',
    description: '',
    category: 'spiritual',
    color: '#8B5CF6',
    frequency: 'daily',
    target_days: [1, 2, 3, 4, 5, 6, 7],
    target_count: 1,
    cue: '',
    tiny_behavior: '',
    reward: '',
    when_time: '',
    where_location: '',
    obstacles: [{ obstacle: '', solution: '' }],
    environment_tips: [''],
    temptation_bundle: ''
  })

  const categories = [
    { id: 'spiritual', label: 'Spiritual', icon: BookOpen, color: '#8B5CF6' },
    { id: 'nutrition', label: 'Nutrition', icon: Target, color: '#10B981' },
    { id: 'hydration', label: 'Hydration', icon: Droplets, color: '#3B82F6' },
    { id: 'fitness', label: 'Fitness', icon: Dumbbell, color: '#F59E0B' },
    { id: 'rest', label: 'Rest', icon: Moon, color: '#6366F1' },
    { id: 'mindset', label: 'Mindset', icon: Brain, color: '#EC4899' },
    { id: 'relationships', label: 'Relationships', icon: Heart, color: '#EF4444' }
  ]

  const days = [
    { id: 1, label: 'M' },
    { id: 2, label: 'T' },
    { id: 3, label: 'W' },
    { id: 4, label: 'T' },
    { id: 5, label: 'F' },
    { id: 6, label: 'S' },
    { id: 7, label: 'S' }
  ]

  const handleNext = () => {
    if (step === 1 && !habit.title) {
      toast.error('Please enter a habit name')
      return
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    if (step === 1) {
      navigate('/habits')
    } else {
      setStep(step - 1)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await createHabit(user.id, {
        ...habit,
        obstacles: habit.obstacles.filter(o => o.obstacle && o.solution),
        environment_tips: habit.environment_tips.filter(t => t)
      })
      toast.success('Habit created! 🎉')
      navigate('/habits')
    } catch (error) {
      toast.error('Failed to create habit')
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = (dayId) => {
    setHabit(prev => ({
      ...prev,
      target_days: prev.target_days.includes(dayId)
        ? prev.target_days.filter(d => d !== dayId)
        : [...prev.target_days, dayId].sort()
    }))
  }

  const addObstacle = () => {
    setHabit(prev => ({
      ...prev,
      obstacles: [...prev.obstacles, { obstacle: '', solution: '' }]
    }))
  }

  const updateObstacle = (index, field, value) => {
    setHabit(prev => ({
      ...prev,
      obstacles: prev.obstacles.map((o, i) => 
        i === index ? { ...o, [field]: value } : o
      )
    }))
  }

  const addEnvironmentTip = () => {
    setHabit(prev => ({
      ...prev,
      environment_tips: [...prev.environment_tips, '']
    }))
  }

  const updateEnvironmentTip = (index, value) => {
    setHabit(prev => ({
      ...prev,
      environment_tips: prev.environment_tips.map((t, i) => i === index ? value : t)
    }))
  }

  const totalSteps = 5

  return (
    <div className="max-w-xl mx-auto pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </button>
        <div className="flex-1">
          <h1 className={`text-xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Create Habit
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Step {step} of {totalSteps}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`h-2 rounded-full mb-8 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
        <div 
          className="h-full rounded-full bg-gradient-to-r from-temple-purple to-temple-gold transition-all"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-6">
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              What habit do you want to build?
            </h2>

            {/* Title */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Habit Name *
              </label>
              <input
                type="text"
                value={habit.title}
                onChange={(e) => setHabit({ ...habit, title: e.target.value })}
                placeholder="e.g., Morning prayer, Drink water, Walk..."
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Description (optional)
              </label>
              <textarea
                value={habit.description}
                onChange={(e) => setHabit({ ...habit, description: e.target.value })}
                placeholder="Why is this habit important to you?"
                rows={2}
                className={`w-full px-4 py-3 rounded-xl border resize-none ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
              />
            </div>

            {/* Category */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Category
              </label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  const isSelected = habit.category === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setHabit({ ...habit, category: cat.id, color: cat.color })}
                      className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                        isSelected
                          ? 'ring-2 ring-temple-purple'
                          : isDark ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                      style={{ backgroundColor: isSelected ? cat.color + '20' : undefined }}
                    >
                      <Icon className="w-5 h-5 mb-1" style={{ color: cat.color }} />
                      <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {cat.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Frequency */}
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              How often?
            </h2>

            <div className="flex gap-2 mb-4">
              {['daily', 'specific_days'].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setHabit({ ...habit, frequency: freq })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                    habit.frequency === freq
                      ? 'bg-temple-purple text-white'
                      : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {freq === 'daily' ? 'Every Day' : 'Specific Days'}
                </button>
              ))}
            </div>

            {habit.frequency === 'specific_days' && (
              <div className="flex justify-between">
                {days.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={`w-10 h-10 rounded-full text-sm font-medium ${
                      habit.target_days.includes(day.id)
                        ? 'bg-temple-purple text-white'
                        : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Habit Recipe (BJ Fogg) */}
      {step === 2 && (
        <div className="space-y-6">
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-temple-purple/20' : 'bg-temple-purple/10'
              }`}>
                <Sparkles className="w-5 h-5 text-temple-purple" />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Habit Recipe
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Based on BJ Fogg's Tiny Habits method
                </p>
              </div>
            </div>

            {/* Cue */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Clock className="w-4 h-4 inline mr-1" />
                After I... (existing routine)
              </label>
              <input
                type="text"
                value={habit.cue}
                onChange={(e) => setHabit({ ...habit, cue: e.target.value })}
                placeholder="e.g., pour my morning coffee, finish breakfast..."
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
              />
            </div>

            {/* Tiny Behavior */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Target className="w-4 h-4 inline mr-1" />
                I will... (tiny version)
              </label>
              <input
                type="text"
                value={habit.tiny_behavior}
                onChange={(e) => setHabit({ ...habit, tiny_behavior: e.target.value })}
                placeholder="e.g., drink one glass of water, pray for 1 minute..."
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Make it so easy you can't say no (under 2 minutes)
              </p>
            </div>

            {/* Reward */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Gift className="w-4 h-4 inline mr-1" />
                And celebrate by... (reward)
              </label>
              <input
                type="text"
                value={habit.reward}
                onChange={(e) => setHabit({ ...habit, reward: e.target.value })}
                placeholder="e.g., say 'I'm honoring my temple!', smile, fist pump..."
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
              />
            </div>
          </div>

          {/* Preview */}
          <div className={`rounded-2xl p-4 ${
            isDark ? 'bg-temple-purple/10 border border-temple-purple/20' : 'bg-temple-purple/5 border border-temple-purple/10'
          }`}>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Your Habit Recipe:</strong>
              <br />
              After I <span className="text-temple-purple">{habit.cue || '___'}</span>,
              <br />
              I will <span className="text-temple-purple">{habit.tiny_behavior || '___'}</span>,
              <br />
              and celebrate by <span className="text-temple-purple">{habit.reward || '___'}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Step 3: When & Where */}
      {step === 3 && (
        <div className="space-y-6">
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              When & Where
            </h2>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Being specific makes you 2-3x more likely to follow through
            </p>

            {/* Time */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Clock className="w-4 h-4 inline mr-1" />
                Preferred Time
              </label>
              <input
                type="time"
                value={habit.when_time}
                onChange={(e) => setHabit({ ...habit, when_time: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
              />
            </div>

            {/* Location */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                value={habit.where_location}
                onChange={(e) => setHabit({ ...habit, where_location: e.target.value })}
                placeholder="e.g., Kitchen, Living room, Park..."
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
              />
            </div>
          </div>

          {/* Temptation Bundling */}
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-4">
              <LinkIcon className="w-5 h-5 text-temple-purple" />
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Temptation Bundling
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Pair this habit with something you enjoy
                </p>
              </div>
            </div>

            <input
              type="text"
              value={habit.temptation_bundle}
              onChange={(e) => setHabit({ ...habit, temptation_bundle: e.target.value })}
              placeholder="e.g., I can only listen to my favorite podcast while walking"
              className={`w-full px-4 py-3 rounded-xl border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
            />
          </div>
        </div>
      )}

      {/* Step 4: Environment & Obstacles */}
      {step === 4 && (
        <div className="space-y-6">
          {/* Environment Design */}
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-5 h-5 text-temple-gold" />
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Environment Design
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  How will you make this habit easy?
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {habit.environment_tips.map((tip, index) => (
                <input
                  key={index}
                  type="text"
                  value={tip}
                  onChange={(e) => updateEnvironmentTip(index, e.target.value)}
                  placeholder="e.g., Keep water bottle on my desk"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:outline-none`}
                />
              ))}
              <button
                onClick={addEnvironmentTip}
                className={`w-full py-2 rounded-xl border-2 border-dashed text-sm ${
                  isDark ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
                }`}
              >
                + Add another tip
              </button>
            </div>
          </div>

          {/* Obstacle Planning */}
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Obstacle Planning
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  If-Then plans make you 3x more likely to succeed
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {habit.obstacles.map((obs, index) => (
                <div key={index} className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="mb-2">
                    <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      If this happens...
                    </label>
                    <input
                      type="text"
                      value={obs.obstacle}
                      onChange={(e) => updateObstacle(index, 'obstacle', e.target.value)}
                      placeholder="e.g., I'm too tired"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-200'
                      } focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Then I will...
                    </label>
                    <input
                      type="text"
                      value={obs.solution}
                      onChange={(e) => updateObstacle(index, 'solution', e.target.value)}
                      placeholder="e.g., Do the tiny 2-minute version"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-200'
                      } focus:outline-none`}
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addObstacle}
                className={`w-full py-2 rounded-xl border-2 border-dashed text-sm ${
                  isDark ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
                }`}
              >
                + Add another obstacle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div className="space-y-6">
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Review Your Habit
            </h2>

            <div className="space-y-4">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>HABIT</p>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {habit.title}
                </p>
              </div>

              <div>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>FREQUENCY</p>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {habit.frequency === 'daily' 
                    ? 'Every day' 
                    : `${habit.target_days.length} days per week`}
                </p>
              </div>

              {habit.cue && (
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>HABIT RECIPE</p>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    After <span className="text-temple-purple">{habit.cue}</span>, I will{' '}
                    <span className="text-temple-purple">{habit.tiny_behavior || habit.title}</span>
                    {habit.reward && (
                      <>, and celebrate by <span className="text-temple-purple">{habit.reward}</span></>
                    )}
                  </p>
                </div>
              )}

              {habit.when_time && (
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>TIME</p>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{habit.when_time}</p>
                </div>
              )}

              {habit.obstacles.filter(o => o.obstacle).length > 0 && (
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>OBSTACLES PLANNED</p>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {habit.obstacles.filter(o => o.obstacle).length} if-then plans
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className={`rounded-2xl p-4 ${
            isDark ? 'bg-temple-purple/10 border border-temple-purple/20' : 'bg-temple-purple/5 border border-temple-purple/10'
          }`}>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              💡 <strong>Remember:</strong> Start with the tiny version. Consistency beats intensity. 
              You can always level up once the habit is automatic!
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={handleBack}
          className={`flex-1 py-3 rounded-xl font-medium ${
            isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        {step < totalSteps ? (
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium flex items-center justify-center gap-2"
          >
            Next
            <ArrowRight className="w-5 h-5" />
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
            Create Habit
          </button>
        )}
      </div>
    </div>
  )
}

export default HabitCreate