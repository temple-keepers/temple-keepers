import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import { 
  User, Mail, Calendar, Award, BookOpen, ChefHat, 
  Heart, CheckCircle, Edit2, Save, X, TrendingUp,
  Activity, Target, Flame, UtensilsCrossed, AlertCircle, Camera, Phone, Bell
} from 'lucide-react'
import { PinSetup } from '../components/PinSetup'
import { useNavigate } from 'react-router-dom'

export const Profile = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    programsEnrolled: 0,
    programsCompleted: 0,
    totalDaysCompleted: 0,
    currentStreak: 0,
    recipesGenerated: 0,
    recipesSaved: 0,
    checkIns: 0,
    mealsLogged: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const fileInputRef = useRef(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    first_name: '',
    email: '',
    phone: '',
    birth_year: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      loadDashboard()
    }
  }, [user])

  useEffect(() => {
    if (profile) {
      setEditedProfile({
        first_name: profile.first_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        birth_year: profile.birth_year || ''
      })
      setAvatarUrl(profile.avatar_url || '')
    }
  }, [profile])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadStats(),
        loadRecentActivity()
      ])
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })


  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      event.target.value = ''
      return
    }

    const maxSizeBytes = 2 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      toast.error('Please use an image under 2MB.')
      event.target.value = ''
      return
    }

    setUploadingAvatar(true)
    try {
      const bucketName = import.meta.env.VITE_SUPABASE_AVATAR_BUCKET || 'avatars'
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase
        .storage
        .from(bucketName)
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        const message = uploadError.message || ''
        if (message.toLowerCase().includes('bucket not found')) {
          const dataUrl = await fileToDataUrl(file)
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: dataUrl })
            .eq('id', user.id)

          if (updateError) throw updateError

          setAvatarUrl(dataUrl)
          toast.success('Profile image saved!')
          return
        }

        throw uploadError
      }

      const { data } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(filePath)

      const avatarUrl = data?.publicUrl
      if (!avatarUrl) throw new Error('Failed to get avatar URL')

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(avatarUrl)
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error('Failed to upload image. Please try again.')
    } finally {
      setUploadingAvatar(false)
      event.target.value = ''
    }
  }


  const loadStats = async () => {
    // Each query is independent — one failing shouldn't zero out the others
    const safe = (promise) => promise.then(
      result => {
        if (result.error) console.warn('Stats query error:', result.error)
        return result
      },
      err => {
        console.warn('Stats query failed:', err)
        return { data: null, count: 0, error: err }
      }
    )

    const [enrollResult, recipesResult, savedResult, checkInsResult, mealsResult, streakResult] = await Promise.all([
      safe(supabase.from('program_enrollments').select('id, status, completed_days').eq('user_id', user.id)),
      safe(supabase.from('recipes').select('id', { count: 'exact', head: true }).eq('created_by', user.id)),
      safe(supabase.from('saved_recipes').select('id', { count: 'exact', head: true }).eq('user_id', user.id)),
      safe(supabase.from('wellness_check_ins').select('id', { count: 'exact', head: true }).eq('user_id', user.id)),
      safe(supabase.from('meal_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id)),
      safe(supabase.rpc('get_user_streak', { p_user_id: user.id }))
    ])

    const enrollments = enrollResult.data || []
    const totalDays = enrollments.reduce((sum, e) => sum + (e.completed_days?.length || 0), 0)

    console.log('Profile stats loaded:', { enrollments: enrollments.length, streak: streakResult.data })

    setStats({
      programsEnrolled: enrollments.length,
      programsCompleted: enrollments.filter(e => e.status === 'completed').length,
      totalDaysCompleted: totalDays,
      currentStreak: streakResult.data?.streak || 0,
      recipesGenerated: recipesResult.count || 0,
      recipesSaved: savedResult.count || 0,
      checkIns: checkInsResult.count || 0,
      mealsLogged: mealsResult.count || 0
    })
  }

  const loadRecentActivity = async () => {
    try {
      const activities = []

      const formatLabel = (value) => {
        if (!value) return 'Activity'
        return value
          .toString()
          .split(/\s+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }

      // Run all queries in parallel for speed
      const [enrollResult, completionResult, recipesResult, checkInsResult, mealResult, symptomResult] = await Promise.all([
        supabase.from('program_enrollments').select('created_at, programs(title)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('program_enrollments').select('id, programs(title), program_day_completions(day_number, completed_at)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('recipes').select('title, created_at').eq('created_by', user.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('wellness_check_ins').select('id, check_in_date, created_at').eq('user_id', user.id).order('check_in_date', { ascending: false }).limit(3),
        supabase.from('meal_logs').select('id, meal_date, meal_time, description, meal_type, created_at').eq('user_id', user.id).order('meal_date', { ascending: false }).limit(3),
        supabase.from('symptom_logs').select('id, symptom, log_date, log_time, created_at').eq('user_id', user.id).order('log_date', { ascending: false }).limit(3)
      ])

      enrollResult.data?.forEach(e => {
        activities.push({ type: 'enrollment', title: `Enrolled in ${e.programs?.title || 'a program'}`, date: e.created_at, icon: BookOpen })
      })

      // Flatten completions from enrollments (avoids the problematic join-filter)
      completionResult.data?.forEach(e => {
        (e.program_day_completions || []).forEach(c => {
          activities.push({ type: 'completion', title: `Completed Day ${c.day_number}`, subtitle: e.programs?.title, date: c.completed_at, icon: CheckCircle })
        })
      })

      recipesResult.data?.forEach(r => {
        activities.push({ type: 'recipe', title: `Created ${r.title}`, date: r.created_at, icon: ChefHat })
      })

      checkInsResult.data?.forEach(c => {
        activities.push({ type: 'checkin', title: 'Daily Check-In', date: c.created_at || c.check_in_date, icon: Heart })
      })

      mealResult.data?.forEach(meal => {
        activities.push({ type: 'meal', title: `Meal logged (${formatLabel(meal.meal_type)})`, subtitle: meal.description, date: meal.created_at || `${meal.meal_date}T${meal.meal_time || '00:00'}`, icon: UtensilsCrossed })
      })

      symptomResult.data?.forEach(s => {
        activities.push({ type: 'symptom', title: `Symptom logged (${formatLabel(s.symptom)})`, date: s.created_at || `${s.log_date}T${s.log_time || '00:00'}`, icon: AlertCircle })
      })

      activities.sort((a, b) => new Date(b.date) - new Date(a.date))
      setRecentActivity(activities.slice(0, 10))
    } catch (err) {
      console.error('Error loading recent activity:', err)
      setRecentActivity([])
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)

    const birthYearValue = editedProfile.birth_year
      ? parseInt(editedProfile.birth_year, 10)
      : null
    const phoneValue = editedProfile.phone ? editedProfile.phone.trim() : null

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: editedProfile.first_name,
        email: editedProfile.email,
        phone: phoneValue,
        birth_year: birthYearValue
      })
      .eq('id', user.id)

    if (!error) {
      setEditing(false)
      // Reload profile - in a real app, this would update the AuthContext
      window.location.reload()
    } else {
      toast.error('Failed to update profile: ' + error.message)
    }

    setSaving(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
      <AppHeader title="My Profile" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="glass-card p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-white dark:border-gray-800"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center text-white font-bold text-4xl">
                    {profile?.first_name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold transition-opacity">
                  <Camera className="w-4 h-4 mr-1" />
                  Change
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/60 text-white text-xs flex items-center justify-center">
                  Uploading...
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-white dark:border-gray-800 flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editedProfile.first_name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, first_name: e.target.value })}
                      className="form-input w-full sm:w-auto"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      className="form-input w-full sm:w-auto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      className="form-input w-full sm:w-auto"
                      placeholder="e.g., +1 555 123 4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Birth Year
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={editedProfile.birth_year}
                      onChange={(e) => setEditedProfile({ ...editedProfile, birth_year: e.target.value })}
                      className="form-input w-full sm:w-auto"
                      placeholder="e.g., 1985"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile?.first_name || 'User'}
                    </h1>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                    <Mail className="w-4 h-4" />
                    <span>{profile?.email}</span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                      <Phone className="w-4 h-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile?.birth_year && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>Birth Year {profile.birth_year}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </>
              )}
            </div>

            {/* Streak Badge */}
            {stats.currentStreak > 0 && (
              <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white px-6 py-4 rounded-xl text-center">
                <div className="text-2xl font-bold">{stats.currentStreak}</div>
                <div className="text-sm font-medium">Day Streak</div>
                <Flame className="w-6 h-6 mx-auto mt-2" />
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Programs Enrolled */}
          <div className="glass-card p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.programsEnrolled}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Programs Enrolled
            </div>
          </div>

          {/* Days Completed */}
          <div className="glass-card p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalDaysCompleted}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Days Completed
            </div>
          </div>

          {/* Recipes */}
          <div className="glass-card p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
              <ChefHat className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.recipesGenerated}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Recipes Created
            </div>
          </div>

          {/* Check-ins */}
          <div className="glass-card p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.checkIns}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Check-ins Logged
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h2>
              </div>

              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Start your journey to see your activity here!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon
                    return (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-temple-purple/10 dark:bg-temple-gold/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activity.title}
                          </p>
                          {activity.subtitle && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {activity.subtitle}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatDate(activity.date)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats & Achievements */}
          <div className="space-y-6">
            {/* Completion Rate */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Progress
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Programs Completed</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats.programsCompleted}/{stats.programsEnrolled}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600"
                      style={{ width: `${stats.programsEnrolled > 0 ? (stats.programsCompleted / stats.programsEnrolled) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Saved Recipes</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats.recipesSaved}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Meals Logged</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats.mealsLogged}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PIN Login */}
            <PinSetup />

            {/* Notification Settings Link */}
            <button
              onClick={() => navigate('/notification-settings')}
              className="w-full glass-card p-5 flex items-center gap-4 hover:border-temple-purple dark:hover:border-temple-gold transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Notification Settings</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage reminders, push notifications & alerts</p>
              </div>
              <span className="text-gray-400 dark:text-gray-500 text-xl">›</span>
            </button>

            {/* Achievements & Level */}
            <button
              onClick={() => navigate('/achievements')}
              className="w-full glass-card p-5 flex items-center gap-4 hover:border-temple-purple dark:hover:border-temple-gold transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Achievements & Level</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Level {profile?.current_level || 1} · {profile?.total_points || 0} points · View badges
                </p>
              </div>
              <span className="text-gray-400 dark:text-gray-500 text-xl">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <BottomNav />
    </>
  )
}
