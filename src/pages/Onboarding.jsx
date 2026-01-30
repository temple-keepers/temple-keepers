import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { updateProfile } from '../lib/supabase'
import { 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  Utensils, 
  Sparkles,
  Check,
  Heart,
  Flame,
  Scale,
  Brain,
  Moon,
  Zap
} from 'lucide-react'

const Onboarding = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    full_name: '',
    health_goals: [],
    dietary_preferences: []
  })

  const totalSteps = 3

  const healthGoals = [
    { id: 'weight_loss', label: 'Lose Weight', icon: Scale, color: 'green' },
    { id: 'energy', label: 'More Energy', icon: Zap, color: 'amber' },
    { id: 'mental_clarity', label: 'Mental Clarity', icon: Brain, color: 'purple' },
    { id: 'better_sleep', label: 'Better Sleep', icon: Moon, color: 'blue' },
    { id: 'spiritual_growth', label: 'Spiritual Growth', icon: Heart, color: 'pink' },
    { id: 'fitness', label: 'Get Fit', icon: Flame, color: 'orange' }
  ]

  const dietaryOptions = [
    { id: 'no_restrictions', label: 'No Restrictions' },
    { id: 'daniel_diet', label: 'Daniel Diet' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'pescatarian', label: 'Pescatarian' },
    { id: 'gluten_free', label: 'Gluten-Free' },
    { id: 'dairy_free', label: 'Dairy-Free' },
    { id: 'low_carb', label: 'Low-Carb' },
    { id: 'keto', label: 'Keto' },
    { id: 'paleo', label: 'Paleo' },
    { id: 'whole30', label: 'Whole30' },
    { id: 'low_fodmap', label: 'Low-FODMAP' },
    { id: 'sugar_free', label: 'Sugar-Free' },
    { id: 'high_protein', label: 'High-Protein' },
    { id: 'nut_free', label: 'Nut-Free' },
    { id: 'halal', label: 'Halal' },
    { id: 'kosher', label: 'Kosher' }
  ]

  const toggleGoal = (goalId) => {
    setData(prev => ({
      ...prev,
      health_goals: prev.health_goals.includes(goalId)
        ? prev.health_goals.filter(g => g !== goalId)
        : [...prev.health_goals, goalId]
    }))
  }

  const toggleDiet = (dietId) => {
    setData(prev => ({
      ...prev,
      dietary_preferences: prev.dietary_preferences.includes(dietId)
        ? prev.dietary_preferences.filter(d => d !== dietId)
        : [...prev.dietary_preferences, dietId]
    }))
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      await updateProfile(user.id, {
        full_name: data.full_name,
        health_goals: data.health_goals,
        dietary_preferences: data.dietary_preferences
      })
      toast.success('Welcome to Temple Keepers! 🎉')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.full_name.trim().length >= 2
      case 2:
        return data.health_goals.length > 0
      case 3:
        return true // Dietary preferences are optional
      default:
        return false
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-temple-dark to-gray-900' 
        : 'bg-gradient-to-br from-purple-50 via-white to-amber-50'
    }`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl ${
          isDark ? 'bg-temple-purple/10' : 'bg-temple-purple/20'
        }`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl ${
          isDark ? 'bg-temple-gold/10' : 'bg-temple-gold/20'
        }`} />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Step {step} of {totalSteps}
            </span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {Math.round((step / totalSteps) * 100)}%
            </span>
          </div>
          <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className="h-full rounded-full bg-gradient-to-r from-temple-purple to-temple-gold transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className={`rounded-3xl p-8 ${
          isDark 
            ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' 
            : 'bg-white/80 backdrop-blur-xl shadow-xl border border-gray-100'
        }`}>
          
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                  isDark ? 'bg-temple-purple/20' : 'bg-temple-purple/10'
                }`}>
                  <Sparkles className="w-8 h-8 text-temple-purple" />
                </div>
                <h1 className={`text-2xl font-display font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Welcome to Temple Keepers!
                </h1>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Let's personalize your experience. What should we call you?
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={data.full_name}
                  onChange={(e) => setData({ ...data, full_name: e.target.value })}
                  placeholder="Enter your name"
                  autoFocus
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    isDark 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-temple-purple' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-temple-purple'
                  } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
                />
              </div>
            </div>
          )}

          {/* Step 2: Health Goals */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                  isDark ? 'bg-green-500/20' : 'bg-green-100'
                }`}>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
                <h1 className={`text-2xl font-display font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  What are your goals?
                </h1>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Select all that apply. We'll personalize content for you.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {healthGoals.map((goal) => {
                  const Icon = goal.icon
                  const isSelected = data.health_goals.includes(goal.id)
                  return (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-temple-purple bg-temple-purple/10'
                          : isDark 
                            ? 'border-gray-700 hover:border-gray-600 bg-gray-700/30' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected 
                            ? 'bg-temple-purple/20' 
                            : isDark ? 'bg-gray-600' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isSelected ? 'text-temple-purple' : isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        </div>
                        <span className={`text-sm font-medium ${
                          isSelected 
                            ? 'text-temple-purple' 
                            : isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {goal.label}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-4 h-4 text-temple-purple" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Dietary Preferences */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                  isDark ? 'bg-amber-500/20' : 'bg-amber-100'
                }`}>
                  <Utensils className="w-8 h-8 text-amber-500" />
                </div>
                <h1 className={`text-2xl font-display font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Dietary Preferences
                </h1>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Any dietary requirements? This helps us suggest better recipes.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((diet) => {
                  const isSelected = data.dietary_preferences.includes(diet.id)
                  return (
                    <button
                      key={diet.id}
                      onClick={() => toggleDiet(diet.id)}
                      className={`px-4 py-2 rounded-full border transition-all ${
                        isSelected
                          ? 'border-temple-purple bg-temple-purple/10 text-temple-purple'
                          : isDark 
                            ? 'border-gray-600 text-gray-300 hover:border-gray-500' 
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 inline mr-1" />}
                      {diet.label}
                    </button>
                  )
                })}
              </div>

              <p className={`text-sm mt-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                You can always update these later in your profile settings.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                } transition-colors`}
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium disabled:opacity-50 hover:opacity-90 transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Skip */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              // Mark onboarding as skipped in localStorage
              localStorage.setItem('onboarding_skipped', 'true')
              navigate('/dashboard')
            }}
            className={`text-sm ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-500'}`}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}

export default Onboarding