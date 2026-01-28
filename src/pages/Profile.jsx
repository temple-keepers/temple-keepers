import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { updateProfile } from '../lib/supabase'
import { 
  User, 
  Mail, 
  Heart,
  Save,
  Loader2,
  CheckCircle,
  Bell,
  Shield,
  Target,
  Leaf
} from 'lucide-react'

const Profile = () => {
  const { user, profile, refreshUserData } = useAuth()
  const { isDark } = useTheme()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    health_goals: [],
    dietary_preferences: [],
    notification_preferences: {
      daily_devotional: true,
      weekly_summary: true,
      recipe_suggestions: true
    }
  })

  const healthGoalOptions = [
    'Weight Loss',
    'Weight Gain',
    'Muscle Building',
    'Better Sleep',
    'More Energy',
    'Reduce Inflammation',
    'Heart Health',
    'Gut Health',
    'Mental Clarity',
    'Stress Management'
  ]

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Low-Carb',
    'Keto',
    'Whole30',
    'Nut-Free',
    'Halal',
    'Kosher'
  ]

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        health_goals: profile.health_goals || [],
        dietary_preferences: profile.dietary_preferences || [],
        notification_preferences: profile.notification_preferences || {
          daily_devotional: true,
          weekly_summary: true,
          recipe_suggestions: true
        }
      })
    }
  }, [profile])

  const handleHealthGoalToggle = (goal) => {
    setFormData(prev => ({
      ...prev,
      health_goals: prev.health_goals.includes(goal)
        ? prev.health_goals.filter(g => g !== goal)
        : [...prev.health_goals, goal]
    }))
    setSaved(false)
  }

  const handleDietaryToggle = (pref) => {
    setFormData(prev => ({
      ...prev,
      dietary_preferences: prev.dietary_preferences.includes(pref)
        ? prev.dietary_preferences.filter(p => p !== pref)
        : [...prev.dietary_preferences, pref]
    }))
    setSaved(false)
  }

  const handleNotificationToggle = (key) => {
    setFormData(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [key]: !prev.notification_preferences[key]
      }
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!user) {
      console.error('No user found')
      alert('You must be logged in to save changes.')
      return
    }

    setSaving(true)
    setSaved(false)
    
    try {
      console.log('Starting profile save...')
      console.log('User ID:', user.id)
      console.log('Form data:', formData)
      
      const result = await updateProfile(user.id, formData)
      console.log('Profile update result:', result)
      
      setSaved(true)
      
      // Refresh the profile data
      if (refreshUserData) {
        console.log('Refreshing user data...')
        await refreshUserData()
      }
      
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('❌ Failed to save profile:', error)
      console.error('Error message:', error.message)
      console.error('Error details:', error)
      alert(`Failed to save profile: ${error.message || 'Unknown error'}. Please try again.`)
      setSaved(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className={`text-3xl md:text-4xl font-display font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          Your Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your wellness journey
        </p>
      </div>

      {/* Profile Info */}
      <div className="glass-card-strong rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          <User className={`w-5 h-5 ${isDark ? 'text-temple-gold' : 'text-temple-purple'}`} />
          Personal Information
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, full_name: e.target.value }))
                setSaved(false)
              }}
              className="glass-input w-full"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="form-label">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="glass-input w-full pl-12 opacity-60 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className="form-label">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, bio: e.target.value }))
                setSaved(false)
              }}
              className="glass-input w-full h-24 resize-none"
              placeholder="Tell us about yourself and your wellness journey..."
            />
          </div>
        </div>
      </div>

      {/* Health Goals */}
      <div className="glass-card-strong rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          <Target className="w-5 h-5 text-green-500" />
          Health Goals
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          Select your wellness goals to personalize your experience
        </p>
        <div className="flex flex-wrap gap-2">
          {healthGoalOptions.map((goal) => (
            <button
              key={goal}
              onClick={() => handleHealthGoalToggle(goal)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                formData.health_goals.includes(goal)
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                  : isDark
                    ? 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                    : 'bg-white/50 text-gray-600 hover:bg-white border border-gray-200'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Dietary Preferences */}
      <div className="glass-card-strong rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          <Leaf className={`w-5 h-5 ${isDark ? 'text-temple-gold' : 'text-temple-purple'}`} />
          Dietary Preferences
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          Help us create recipes that match your dietary needs
        </p>
        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map((pref) => (
            <button
              key={pref}
              onClick={() => handleDietaryToggle(pref)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                formData.dietary_preferences.includes(pref)
                  ? isDark
                    ? 'bg-gradient-to-r from-temple-purple to-temple-gold text-white shadow-lg'
                    : 'bg-gradient-to-r from-temple-purple to-temple-purple-dark text-white shadow-lg'
                  : isDark
                    ? 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                    : 'bg-white/50 text-gray-600 hover:bg-white border border-gray-200'
              }`}
            >
              {pref}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="glass-card-strong rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          <Bell className={`w-5 h-5 ${isDark ? 'text-temple-gold' : 'text-temple-purple'}`} />
          Notification Preferences
        </h2>
        
        <div className="space-y-4">
          {[
            { key: 'daily_devotional', label: 'Daily Devotional Reminders', description: 'Get reminded to complete your daily devotional' },
            { key: 'weekly_summary', label: 'Weekly Progress Summary', description: 'Receive a summary of your wellness journey' },
            { key: 'recipe_suggestions', label: 'Recipe Suggestions', description: 'Get personalized healthy recipe ideas' }
          ].map((item) => (
            <div 
              key={item.key}
              className={`flex items-center justify-between p-4 rounded-xl ${
                isDark ? 'bg-white/5 border border-white/10' : 'bg-white/50'
              }`}
            >
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {item.label}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle(item.key)}
                className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                  formData.notification_preferences[item.key]
                    ? 'bg-gradient-to-r from-temple-purple to-temple-gold'
                    : isDark ? 'bg-white/20' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                  formData.notification_preferences[item.key] ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
            saved
              ? isDark
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-green-100 text-green-700'
              : 'btn-primary'
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : saved ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default Profile