import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { updateProfile, supabase } from '../lib/supabase'
import CookieSettingsButton from '../components/CookieSettingsButton'
import { useToast } from '../contexts/ToastContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { Crown, CreditCard, ExternalLink } from 'lucide-react'

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
  Leaf,
  Camera,
  Upload,
  MapPin,
  Globe,
  Calendar
} from 'lucide-react'

const Profile = () => {
  const { user, profile, refreshUserData } = useAuth()
  const { isDark } = useTheme()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: '',
    bio: '',
    date_of_birth: '',
    city: '',
    country: '',
    timezone: '',
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

  const { toast } = useToast()

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
        bio: profile.bio || '',
        date_of_birth: profile.date_of_birth || '',
        city: profile.city || '',
        country: profile.country || '',
        timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
      setSaved(false)
      toast.success('Avatar uploaded! Click Save to update your profile.')
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
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
  const { subscription, getCurrentPlan, isPaid } = useSubscription()
const currentPlan = getCurrentPlan()

const handleManageBilling = async () => {
  if (!subscription?.stripe_customer_id) return
  
  try {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { customerId: subscription.stripe_customer_id }
    })
    if (error) throw error
    window.location.href = data.url
  } catch (error) {
    toast.error('Failed to open billing portal')
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
        
        <div className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-temple-purple to-temple-gold p-1">
                <div className={`w-full h-full rounded-full overflow-hidden ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}>
                  {formData.avatar_url ? (
                    <img 
                      src={formData.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              <label className="absolute bottom-0 right-0 p-2 rounded-full bg-temple-purple text-white cursor-pointer hover:bg-temple-purple-dark transition-colors shadow-lg">
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden" 
                />
              </label>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className={`font-semibold mb-1 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                Profile Photo
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click the camera icon to upload a new photo (max 5MB)
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
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
              <label className="form-label">
                Date of Birth
                <span className="ml-2 text-xs text-gray-400">(Private - not shown publicly)</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))
                    setSaved(false)
                  }}
                  className="glass-input w-full pl-12"
                />
              </div>
            </div>
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">City</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, city: e.target.value }))
                    setSaved(false)
                  }}
                  className="glass-input w-full pl-12"
                  placeholder="Your city"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Country</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, country: e.target.value }))
                    setSaved(false)
                  }}
                  className="glass-input w-full pl-12"
                  placeholder="Your country"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Helps identify your timezone for community features
              </p>
            </div>
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

      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
    isDark ? 'text-white' : 'text-gray-900'
  }`}>
    <Crown className="w-5 h-5 text-temple-gold" />
    Subscription
  </h3>
  
  <div className="flex items-center justify-between mb-4">
    <div>
      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {currentPlan.name} Plan
      </p>
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {isPaid() ? `£${currentPlan.monthlyPrice}/month` : 'Free forever'}
      </p>
    </div>
    <div className={`px-3 py-1 rounded-full text-sm ${
      isPaid() 
        ? 'bg-green-500/20 text-green-500' 
        : 'bg-gray-500/20 text-gray-500'
    }`}>
      {subscription?.status || 'active'}
    </div>
  </div>

  <div className="flex gap-3">
    {isPaid() ? (
      <button
        onClick={handleManageBilling}
        className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
          isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'
        }`}
      >
        <CreditCard className="w-5 h-5" />
        Manage Billing
        <ExternalLink className="w-4 h-4" />
      </button>
    ) : (
      <Link
        to="/pricing"
        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium flex items-center justify-center gap-2"
      >
        <Crown className="w-5 h-5" />
        Upgrade Plan
      </Link>
    )}
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