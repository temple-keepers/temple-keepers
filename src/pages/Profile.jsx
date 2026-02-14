import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import {
  User, Mail, Calendar, Award, BookOpen, ChefHat,
  Heart, CheckCircle, Edit2, Save, X, TrendingUp,
  Activity, Target, Flame, UtensilsCrossed, AlertCircle,
  Camera, Phone, Bell, MapPin, Church, Shield, Dumbbell,
  Brain, Cross, Eye, EyeOff,
  Share2, Copy, Users2, Check
} from 'lucide-react'
import { PinSetup } from '../components/PinSetup'
import { useNavigate } from 'react-router-dom'
import { referralService } from '../services/referralService'

const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const MARITAL_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'engaged', label: 'Engaged' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const FITNESS_LEVELS = [
  { value: 'sedentary', label: 'Sedentary — mostly sitting' },
  { value: 'lightly_active', label: 'Lightly active — light walks, occasional movement' },
  { value: 'moderately_active', label: 'Moderately active — exercise 3–4× per week' },
  { value: 'very_active', label: 'Very active — exercise 5+ times per week' },
  { value: 'athlete', label: 'Athlete — intense daily training' },
]

const EXERCISE_TYPES = [
  'Walking', 'Running', 'Gym / Weights', 'Yoga / Pilates', 'Swimming',
  'Cycling', 'Home workouts', 'Sports', 'Dancing', 'None currently'
]

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut allergy',
  'Halal', 'Kosher', 'Pescatarian', 'Keto / Low carb', 'Low sodium', 'Diabetic-friendly'
]

const HEALTH_CONDITIONS = [
  'Diabetes', 'High blood pressure', 'Thyroid condition', 'PCOS',
  'IBS / Digestive issues', 'Anxiety', 'Depression', 'Chronic fatigue',
  'Autoimmune condition', 'Heart disease', 'Asthma', 'None'
]

const FAITH_STAGES = [
  { value: 'exploring', label: 'Exploring — curious about faith' },
  { value: 'new_believer', label: 'New believer — recently came to Christ' },
  { value: 'growing', label: 'Growing — actively learning and developing' },
  { value: 'established', label: 'Established — solid foundation, serving' },
  { value: 'mature', label: 'Mature — deep walk, mentoring others' },
  { value: 'returning', label: 'Returning — coming back to faith' },
]

const FASTING_EXPERIENCE = [
  { value: 'never', label: 'Never fasted before' },
  { value: 'tried_once', label: 'Tried once or twice' },
  { value: 'occasional', label: 'Occasional — a few times a year' },
  { value: 'regular', label: 'Regular — monthly or seasonal' },
  { value: 'experienced', label: 'Experienced — frequent, extended fasts' },
]

const PRAYER_STYLES = [
  'Structured / liturgical', 'Conversational', 'Contemplative / meditative',
  'Worship-led', 'Journaling', 'Silence & listening', 'Intercessory', 'Praying in tongues'
]

const BIBLE_BOOKS = [
  'Genesis', 'Psalms', 'Proverbs', 'Isaiah', 'Jeremiah', 'Matthew', 'Mark',
  'Luke', 'John', 'Acts', 'Romans', 'Corinthians', 'Ephesians', 'Philippians',
  'Colossians', 'Hebrews', 'James', 'Revelation'
]

const COUNTRIES = [
  'United Kingdom', 'United States', 'Canada', 'Nigeria', 'Ghana', 'Jamaica',
  'Barbados', 'Trinidad & Tobago', 'South Africa', 'Kenya', 'Australia',
  'Germany', 'France', 'Netherlands', 'Ireland', 'Other'
]

// Reusable chip selector
const ChipSelect = ({ options, selected = [], onChange, columns = 3 }) => (
  <div className={`grid grid-cols-2 ${columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2`}>
    {options.map(opt => {
      const value = typeof opt === 'string' ? opt.toLowerCase().replace(/[\s\/&]+/g, '_') : opt
      const label = typeof opt === 'string' ? opt : opt
      const isSelected = selected.includes(value)
      return (
        <button
          key={value}
          type="button"
          onClick={() => {
            if (isSelected) {
              onChange(selected.filter(s => s !== value))
            } else {
              onChange([...selected, value])
            }
          }}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
            isSelected
              ? 'bg-temple-purple/10 dark:bg-temple-gold/10 border-temple-purple dark:border-temple-gold text-temple-purple dark:text-temple-gold'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          {label}
        </button>
      )
    })}
  </div>
)

export const Profile = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    programsEnrolled: 0, programsCompleted: 0, totalDaysCompleted: 0,
    currentStreak: 0, recipesGenerated: 0, recipesSaved: 0, checkIns: 0, mealsLogged: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const fileInputRef = useRef(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [saving, setSaving] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [referralCount, setReferralCount] = useState(0)
  const [copied, setCopied] = useState(false)

  // Personal info
  const [personalInfo, setPersonalInfo] = useState({
    first_name: '', email: '', phone: '', birth_year: '',
    gender: '', marital_status: '', city: '', country: '', church_denomination: '', timezone: ''
  })

  // Health profile
  const [healthProfile, setHealthProfile] = useState({
    height_cm: '', current_weight_kg: '', target_weight_kg: '',
    fitness_level: '', exercise_frequency: '', exercise_types: [],
    dietary_restrictions: [], allergies: [], food_intolerances: [],
    health_conditions: [], health_concerns: '', medications_notes: ''
  })

  // Spiritual profile
  const [spiritualProfile, setSpiritualProfile] = useState({
    faith_journey_stage: '', years_as_believer: '',
    fasting_experience: '', prayer_style: [],
    devotional_preference: '', favourite_bible_books: [],
    bible_version_preference: ''
  })

  const [healthLoaded, setHealthLoaded] = useState(false)
  const [spiritualLoaded, setSpiritualLoaded] = useState(false)

  useEffect(() => {
    if (user) loadDashboard()
  }, [user])

  useEffect(() => {
    if (user) {
      referralService.getReferralCode(user.id).then(code => {
        if (code) setReferralCode(code)
      })
      referralService.getReferralCount(user.id).then(count => {
        setReferralCount(count)
      })
    }
  }, [user])

  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        first_name: profile.first_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        birth_year: profile.birth_year || '',
        gender: profile.gender || '',
        marital_status: profile.marital_status || '',
        city: profile.city || '',
        country: profile.country || '',
        church_denomination: profile.church_denomination || '',
        timezone: profile.timezone || ''
      })
      setAvatarUrl(profile.avatar_url || '')
    }
  }, [profile])

  // Load health + spiritual when those tabs are first opened
  useEffect(() => {
    if (activeTab === 'health' && !healthLoaded && user) loadHealthProfile()
    if (activeTab === 'spiritual' && !spiritualLoaded && user) loadSpiritualProfile()
  }, [activeTab, user])

  const loadHealthProfile = async () => {
    const { data } = await supabase
      .from('user_health_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (data) {
      setHealthProfile({
        height_cm: data.height_cm || '',
        current_weight_kg: data.current_weight_kg || '',
        target_weight_kg: data.target_weight_kg || '',
        fitness_level: data.fitness_level || '',
        exercise_frequency: data.exercise_frequency || '',
        exercise_types: data.exercise_types || [],
        dietary_restrictions: data.dietary_restrictions || [],
        allergies: data.allergies || [],
        food_intolerances: data.food_intolerances || [],
        health_conditions: data.health_conditions || [],
        health_concerns: data.health_concerns || '',
        medications_notes: data.medications_notes || ''
      })
    }
    setHealthLoaded(true)
  }

  const loadSpiritualProfile = async () => {
    const { data } = await supabase
      .from('user_spiritual_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (data) {
      setSpiritualProfile({
        faith_journey_stage: data.faith_journey_stage || '',
        years_as_believer: data.years_as_believer || '',
        fasting_experience: data.fasting_experience || '',
        prayer_style: data.prayer_style || [],
        devotional_preference: data.devotional_preference || '',
        favourite_bible_books: data.favourite_bible_books || [],
        bible_version_preference: data.bible_version_preference || ''
      })
    }
    setSpiritualLoaded(true)
  }

  const loadDashboard = async () => {
    setLoading(true)
    try {
      await Promise.all([loadStats(), loadRecentActivity()])
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
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); event.target.value = ''; return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Please use an image under 2MB.'); event.target.value = ''; return }

    setUploadingAvatar(true)
    try {
      const bucketName = import.meta.env.VITE_SUPABASE_AVATAR_BUCKET || 'avatars'
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file, { upsert: true })

      if (uploadError) {
        if (uploadError.message?.toLowerCase().includes('bucket not found')) {
          const dataUrl = await fileToDataUrl(file)
          await supabase.from('profiles').update({ avatar_url: dataUrl }).eq('id', user.id)
          setAvatarUrl(dataUrl)
          toast.success('Profile image saved!')
          return
        }
        throw uploadError
      }

      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)
      const url = data?.publicUrl
      if (!url) throw new Error('Failed to get avatar URL')

      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
      setAvatarUrl(url)
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error('Failed to upload image.')
    } finally {
      setUploadingAvatar(false)
      event.target.value = ''
    }
  }

  const loadStats = async () => {
    const safe = (promise) => promise.then(r => { if (r.error) console.warn('Stats error:', r.error); return r }, err => ({ data: null, count: 0, error: err }))

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
      const formatLabel = (v) => v ? v.toString().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Activity'

      // Calculate start of current week (Monday 00:00)
      const now = new Date()
      const dayOfWeek = now.getDay()
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - mondayOffset)
      weekStart.setHours(0, 0, 0, 0)
      const weekStartISO = weekStart.toISOString()

      const [enrollResult, completionResult, recipesResult, checkInsResult, mealResult, symptomResult] = await Promise.all([
        supabase.from('program_enrollments').select('created_at, programs(title)').eq('user_id', user.id).gte('created_at', weekStartISO).order('created_at', { ascending: false }).limit(5),
        supabase.from('program_enrollments').select('id, programs(title), program_day_completions(day_number, completed_at)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('recipes').select('title, created_at').eq('created_by', user.id).gte('created_at', weekStartISO).order('created_at', { ascending: false }).limit(5),
        supabase.from('wellness_check_ins').select('id, check_in_date, created_at').eq('user_id', user.id).gte('created_at', weekStartISO).order('check_in_date', { ascending: false }).limit(5),
        supabase.from('meal_logs').select('id, meal_date, meal_time, description, meal_type, created_at').eq('user_id', user.id).gte('created_at', weekStartISO).order('meal_date', { ascending: false }).limit(5),
        supabase.from('symptom_logs').select('id, symptom, log_date, log_time, created_at').eq('user_id', user.id).gte('created_at', weekStartISO).order('log_date', { ascending: false }).limit(5)
      ])

      enrollResult.data?.forEach(e => activities.push({ type: 'enrollment', title: `Enrolled in ${e.programs?.title || 'a program'}`, date: e.created_at, icon: BookOpen }))
      // Filter completions to this week client-side (nested relation can't be filtered server-side)
      completionResult.data?.forEach(e => (e.program_day_completions || []).filter(c => c.completed_at >= weekStartISO).forEach(c => activities.push({ type: 'completion', title: `Completed Day ${c.day_number}`, subtitle: e.programs?.title, date: c.completed_at, icon: CheckCircle })))
      recipesResult.data?.forEach(r => activities.push({ type: 'recipe', title: `Created ${r.title}`, date: r.created_at, icon: ChefHat }))
      checkInsResult.data?.forEach(c => activities.push({ type: 'checkin', title: 'Daily Check-In', date: c.created_at || c.check_in_date, icon: Heart }))
      mealResult.data?.forEach(m => activities.push({ type: 'meal', title: `Meal logged (${formatLabel(m.meal_type)})`, subtitle: m.description, date: m.created_at || `${m.meal_date}T${m.meal_time || '00:00'}`, icon: UtensilsCrossed }))
      symptomResult.data?.forEach(s => activities.push({ type: 'symptom', title: `Symptom logged (${formatLabel(s.symptom)})`, date: s.created_at || `${s.log_date}T${s.log_time || '00:00'}`, icon: AlertCircle }))

      activities.sort((a, b) => new Date(b.date) - new Date(a.date))
      setRecentActivity(activities.slice(0, 10))
    } catch (err) {
      console.error('Error loading activity:', err)
      setRecentActivity([])
    }
  }

  // Auto-detect timezone on first load
  useEffect(() => {
    if (profile && !profile.timezone && user) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (tz) {
        supabase.from('profiles').update({ timezone: tz }).eq('id', user.id)
        setPersonalInfo(prev => ({ ...prev, timezone: tz }))
      }
    }
  }, [profile, user])

  const handleSavePersonal = async () => {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      first_name: personalInfo.first_name,
      email: personalInfo.email,
      phone: personalInfo.phone || null,
      birth_year: personalInfo.birth_year ? parseInt(personalInfo.birth_year) : null,
      gender: personalInfo.gender || null,
      marital_status: personalInfo.marital_status || null,
      city: personalInfo.city || null,
      country: personalInfo.country || null,
      church_denomination: personalInfo.church_denomination || null,
      timezone: personalInfo.timezone || null,
    }).eq('id', user.id)

    if (!error) {
      toast.success('Profile updated!')
      setEditing(false)
      window.location.reload()
    } else {
      toast.error('Failed to save: ' + error.message)
    }
    setSaving(false)
  }

  const handleSaveHealth = async () => {
    setSaving(true)
    const payload = {
      user_id: user.id,
      height_cm: healthProfile.height_cm ? parseFloat(healthProfile.height_cm) : null,
      current_weight_kg: healthProfile.current_weight_kg ? parseFloat(healthProfile.current_weight_kg) : null,
      target_weight_kg: healthProfile.target_weight_kg ? parseFloat(healthProfile.target_weight_kg) : null,
      fitness_level: healthProfile.fitness_level || null,
      exercise_frequency: healthProfile.exercise_frequency || null,
      exercise_types: healthProfile.exercise_types,
      dietary_restrictions: healthProfile.dietary_restrictions,
      allergies: healthProfile.allergies,
      food_intolerances: healthProfile.food_intolerances,
      health_conditions: healthProfile.health_conditions,
      health_concerns: healthProfile.health_concerns || null,
      medications_notes: healthProfile.medications_notes || null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('user_health_profiles').upsert(payload, { onConflict: 'user_id' })
    if (!error) toast.success('Health profile saved!')
    else toast.error('Failed to save: ' + error.message)
    setSaving(false)
  }

  const handleSaveSpiritual = async () => {
    setSaving(true)
    const payload = {
      user_id: user.id,
      faith_journey_stage: spiritualProfile.faith_journey_stage || null,
      years_as_believer: spiritualProfile.years_as_believer || null,
      fasting_experience: spiritualProfile.fasting_experience || null,
      prayer_style: spiritualProfile.prayer_style,
      devotional_preference: spiritualProfile.devotional_preference || null,
      favourite_bible_books: spiritualProfile.favourite_bible_books,
      bible_version_preference: spiritualProfile.bible_version_preference || null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('user_spiritual_profiles').upsert(payload, { onConflict: 'user_id' })
    if (!error) toast.success('Spiritual profile saved!')
    else toast.error('Failed to save: ' + error.message)
    setSaving(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div></div>
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal', icon: Shield },
    { id: 'health', label: 'Health', icon: Heart },
    { id: 'spiritual', label: 'Spiritual', icon: Cross },
  ]

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
      <AppHeader title="My Profile" />

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Profile Header - Compact */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="group relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-gray-800" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center text-white font-bold text-3xl">
                    {profile?.first_name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs transition-opacity">
                  <Camera className="w-4 h-4" />
                </div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              {uploadingAvatar && <div className="absolute inset-0 rounded-full bg-black/60 text-white text-xs flex items-center justify-center">Uploading...</div>}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{profile?.first_name || 'User'}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
              {(profile?.city || profile?.country) && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />{[profile?.city, profile?.country].filter(Boolean).join(', ')}
                </p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Joined {new Date(profile?.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            {stats.currentStreak > 0 && (
              <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white px-4 py-3 rounded-xl text-center flex-shrink-0">
                <div className="text-xl font-bold">{stats.currentStreak}</div>
                <div className="text-xs">Streak</div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-temple-purple text-white dark:bg-temple-gold dark:text-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* ====== OVERVIEW TAB ====== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: BookOpen, color: 'purple', value: stats.programsEnrolled, label: 'Programmes' },
                { icon: CheckCircle, color: 'green', value: stats.totalDaysCompleted, label: 'Days Done' },
                { icon: ChefHat, color: 'blue', value: stats.recipesGenerated, label: 'Recipes' },
                { icon: Heart, color: 'pink', value: stats.checkIns, label: 'Check-ins' },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-4 text-center">
                  <div className={`w-10 h-10 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center mx-auto mb-2`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <PinSetup />
              <button onClick={() => navigate('/notification-settings')} className="w-full glass-card p-4 flex items-center gap-4 hover:border-temple-purple dark:hover:border-temple-gold transition-colors text-left">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notification Settings</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Manage reminders & alerts</p>
                </div>
                <span className="text-gray-400 text-lg">›</span>
              </button>
              <button onClick={() => navigate('/achievements')} className="w-full glass-card p-4 flex items-center gap-4 hover:border-temple-purple dark:hover:border-temple-gold transition-colors text-left">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Achievements & Level</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Level {profile?.current_level || 1} · {profile?.total_points || 0} points</p>
                </div>
                <span className="text-gray-400 text-lg">›</span>
              </button>

              <button onClick={() => navigate('/guide')} className="w-full glass-card p-4 flex items-center gap-4 hover:border-temple-purple dark:hover:border-temple-gold transition-colors text-left">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">User Guide</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Learn how to use Temple Keepers</p>
                </div>
                <span className="text-gray-400 text-lg">›</span>
              </button>

              {/* WhatsApp Community */}
              <div className="glass-card p-4 space-y-3 border-[#25D366]/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">WhatsApp Community</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Join our community for daily encouragement</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open('https://chat.whatsapp.com/BxAoHjS6XYdL56wbE3uBpv', '_blank')}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-[#25D366]/10 text-[#25D366] text-xs font-semibold hover:bg-[#25D366]/20 transition-colors text-center"
                  >
                    💬 Founding Members Group
                  </button>
                  <button
                    onClick={() => window.open('https://whatsapp.com/channel/0029VbCYTT00rGiDdshHkL3Z', '_blank')}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-[#25D366]/10 text-[#25D366] text-xs font-semibold hover:bg-[#25D366]/20 transition-colors text-center"
                  >
                    📢 Updates Channel
                  </button>
                </div>
              </div>

              {/* Invite Friends */}
              <div className="glass-card p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Invite Friends</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Share Temple Keepers &middot; Earn 25 points per signup
                    </p>
                  </div>
                  {referralCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-temple-purple dark:text-temple-gold font-medium">
                      <Users2 className="w-3.5 h-3.5" />
                      {referralCount}
                    </div>
                  )}
                </div>

                {referralCode && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={referralService.getShareUrl(referralCode)}
                      className="form-input text-xs flex-1 bg-gray-50 dark:bg-gray-800"
                      onFocus={(e) => e.target.select()}
                    />
                    <button
                      onClick={() => {
                        const url = referralService.getShareUrl(referralCode)
                        navigator.clipboard.writeText(url).then(() => {
                          setCopied(true)
                          toast.success('Link copied!')
                          setTimeout(() => setCopied(false), 2000)
                        })
                      }}
                      className="px-3 py-2 rounded-lg bg-temple-purple/10 dark:bg-temple-gold/10 text-temple-purple dark:text-temple-gold text-xs font-medium hover:bg-temple-purple/20 dark:hover:bg-temple-gold/20 transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    {typeof navigator.share === 'function' && (
                      <button
                        onClick={() => {
                          navigator.share({
                            title: 'Join Temple Keepers',
                            text: `${profile?.first_name || 'A friend'} invites you to Temple Keepers \u2014 a Christian wellness companion for mind, body & spirit.`,
                            url: referralService.getShareUrl(referralCode),
                          }).catch(() => {})
                        }}
                        className="px-3 py-2 rounded-lg bg-temple-purple text-white dark:bg-temple-gold dark:text-gray-900 text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1 flex-shrink-0"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                      </button>
                    )}
                  </div>
                )}

                {/* WhatsApp Invite Button */}
                <button
                  onClick={() => {
                    const msg = `Hey! I've been using Temple Keepers - a faith-based wellness app with daily scripture, healthy recipes, and community support.\n\nI thought you might enjoy it!\n\n- Daily devotionals\n- AI-powered healthy recipes\n- Guided programmes & challenges\n- Community accountability pods\n\nJoin free: ${referralCode ? referralService.getShareUrl(referralCode) : 'https://templekeepers.app/signup'}`
                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-semibold transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Invite via WhatsApp
                </button>
              </div>
            </div>

            {/* This Week's Activity */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">This Week's Activity</h2>
              </div>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No activity this week yet. Start your journey!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((a, i) => {
                    const Icon = a.icon
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-temple-purple/10 dark:bg-temple-gold/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-temple-purple dark:text-temple-gold" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{a.title}</p>
                          {a.subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{a.subtitle}</p>}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(a.date)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====== PERSONAL TAB ====== */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <EyeOff className="w-3.5 h-3.5" /> Private
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">First Name</label>
                  <input type="text" value={personalInfo.first_name} onChange={e => setPersonalInfo({ ...personalInfo, first_name: e.target.value })} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" value={personalInfo.email} onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Mobile Number</label>
                  <input type="tel" value={personalInfo.phone} onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })} className="form-input" placeholder="+44 7700 900000" />
                </div>
                <div>
                  <label className="form-label">Birth Year</label>
                  <input type="number" min="1920" max={new Date().getFullYear()} value={personalInfo.birth_year} onChange={e => setPersonalInfo({ ...personalInfo, birth_year: e.target.value })} className="form-input" placeholder="e.g. 1985" />
                </div>
                <div>
                  <label className="form-label">Gender</label>
                  <select value={personalInfo.gender} onChange={e => setPersonalInfo({ ...personalInfo, gender: e.target.value })} className="form-input">
                    <option value="">Select...</option>
                    {GENDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Marital Status</label>
                  <select value={personalInfo.marital_status} onChange={e => setPersonalInfo({ ...personalInfo, marital_status: e.target.value })} className="form-input">
                    <option value="">Select...</option>
                    {MARITAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">City / Town</label>
                  <input type="text" value={personalInfo.city} onChange={e => setPersonalInfo({ ...personalInfo, city: e.target.value })} className="form-input" placeholder="e.g. Basildon" />
                </div>
                <div>
                  <label className="form-label">Country</label>
                  <select value={personalInfo.country} onChange={e => setPersonalInfo({ ...personalInfo, country: e.target.value })} className="form-input">
                    <option value="">Select...</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Church / Denomination</label>
                  <input type="text" value={personalInfo.church_denomination} onChange={e => setPersonalInfo({ ...personalInfo, church_denomination: e.target.value })} className="form-input" placeholder="e.g. Pentecostal, Baptist, Non-denominational..." />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={handleSavePersonal} disabled={saving} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="glass-card p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <EyeOff className="w-4 h-4 flex-shrink-0" />
                This information is private. Only your first name, avatar, bio, and city are visible to other community members.
              </p>
            </div>
          </div>
        )}

        {/* ====== HEALTH TAB ====== */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            {!healthLoaded ? (
              <div className="flex items-center justify-center py-12"><div className="spinner"></div></div>
            ) : (
              <>
                {/* Body Metrics */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Body & Fitness</h2>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400"><EyeOff className="w-3.5 h-3.5" /> Private</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="form-label">Height (cm)</label>
                      <input type="number" value={healthProfile.height_cm} onChange={e => setHealthProfile({ ...healthProfile, height_cm: e.target.value })} className="form-input" placeholder="e.g. 165" />
                    </div>
                    <div>
                      <label className="form-label">Current Weight (kg)</label>
                      <input type="number" step="0.1" value={healthProfile.current_weight_kg} onChange={e => setHealthProfile({ ...healthProfile, current_weight_kg: e.target.value })} className="form-input" placeholder="e.g. 72" />
                    </div>
                    <div>
                      <label className="form-label">Target Weight (kg)</label>
                      <input type="number" step="0.1" value={healthProfile.target_weight_kg} onChange={e => setHealthProfile({ ...healthProfile, target_weight_kg: e.target.value })} className="form-input" placeholder="e.g. 65" />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="form-label">Fitness Level</label>
                    <select value={healthProfile.fitness_level} onChange={e => setHealthProfile({ ...healthProfile, fitness_level: e.target.value })} className="form-input">
                      <option value="">Select...</option>
                      {FITNESS_LEVELS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="form-label mb-3">Exercise Types (select all that apply)</label>
                    <ChipSelect
                      options={EXERCISE_TYPES}
                      selected={healthProfile.exercise_types}
                      onChange={v => setHealthProfile({ ...healthProfile, exercise_types: v })}
                    />
                  </div>
                </div>

                {/* Dietary */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <UtensilsCrossed className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dietary & Allergies</h2>
                  </div>

                  <div className="mb-6">
                    <label className="form-label mb-3">Dietary Requirements (select all that apply)</label>
                    <ChipSelect
                      options={DIETARY_OPTIONS}
                      selected={healthProfile.dietary_restrictions}
                      onChange={v => setHealthProfile({ ...healthProfile, dietary_restrictions: v })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Allergies</label>
                      <input type="text" value={healthProfile.allergies?.join(', ') || ''} onChange={e => setHealthProfile({ ...healthProfile, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="form-input" placeholder="e.g. peanuts, shellfish (comma-separated)" />
                    </div>
                    <div>
                      <label className="form-label">Food Intolerances</label>
                      <input type="text" value={healthProfile.food_intolerances?.join(', ') || ''} onChange={e => setHealthProfile({ ...healthProfile, food_intolerances: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="form-input" placeholder="e.g. lactose, gluten (comma-separated)" />
                    </div>
                  </div>
                </div>

                {/* Health Conditions */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Heart className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Health Conditions</h2>
                  </div>

                  <div className="mb-6">
                    <label className="form-label mb-3">Do any of these apply to you? (select all that apply)</label>
                    <ChipSelect
                      options={HEALTH_CONDITIONS}
                      selected={healthProfile.health_conditions}
                      onChange={v => setHealthProfile({ ...healthProfile, health_conditions: v })}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="form-label">Other Health Concerns</label>
                      <textarea value={healthProfile.health_concerns} onChange={e => setHealthProfile({ ...healthProfile, health_concerns: e.target.value })} className="form-input resize-none" rows={2} placeholder="Anything else we should know about your health..." />
                    </div>
                    <div>
                      <label className="form-label">Medication Notes (optional)</label>
                      <textarea value={healthProfile.medications_notes} onChange={e => setHealthProfile({ ...healthProfile, medications_notes: e.target.value })} className="form-input resize-none" rows={2} placeholder="General notes about medications that may affect diet or fasting..." />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={handleSaveHealth} disabled={saving} className="btn-primary flex items-center gap-2">
                    <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Health Profile'}
                  </button>
                </div>

                <div className="glass-card p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <EyeOff className="w-4 h-4 flex-shrink-0" />
                    Your health information is completely private. It's used to personalise recipes, meal plans, and AI suggestions — never shared publicly.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* ====== SPIRITUAL TAB ====== */}
        {activeTab === 'spiritual' && (
          <div className="space-y-6">
            {!spiritualLoaded ? (
              <div className="flex items-center justify-center py-12"><div className="spinner"></div></div>
            ) : (
              <>
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Cross className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Faith Journey</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="form-label">Where are you in your faith journey?</label>
                      <select value={spiritualProfile.faith_journey_stage} onChange={e => setSpiritualProfile({ ...spiritualProfile, faith_journey_stage: e.target.value })} className="form-input">
                        <option value="">Select...</option>
                        {FAITH_STAGES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Years as a believer</label>
                      <select value={spiritualProfile.years_as_believer} onChange={e => setSpiritualProfile({ ...spiritualProfile, years_as_believer: e.target.value })} className="form-input">
                        <option value="">Select...</option>
                        <option value="less_than_1">Less than 1 year</option>
                        <option value="1_to_3">1–3 years</option>
                        <option value="3_to_10">3–10 years</option>
                        <option value="10_to_20">10–20 years</option>
                        <option value="20_plus">20+ years</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="form-label">Fasting Experience</label>
                    <select value={spiritualProfile.fasting_experience} onChange={e => setSpiritualProfile({ ...spiritualProfile, fasting_experience: e.target.value })} className="form-input">
                      <option value="">Select...</option>
                      {FASTING_EXPERIENCE.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <BookOpen className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Prayer & Devotion</h2>
                  </div>

                  <div className="mb-6">
                    <label className="form-label mb-3">How do you like to pray? (select all that apply)</label>
                    <ChipSelect
                      options={PRAYER_STYLES}
                      selected={spiritualProfile.prayer_style}
                      onChange={v => setSpiritualProfile({ ...spiritualProfile, prayer_style: v })}
                      columns={2}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="form-label">Devotional Style Preference</label>
                    <select value={spiritualProfile.devotional_preference} onChange={e => setSpiritualProfile({ ...spiritualProfile, devotional_preference: e.target.value })} className="form-input">
                      <option value="">Select...</option>
                      <option value="short_focused">Short & focused (5–10 min)</option>
                      <option value="deep_study">Deep study (20+ min)</option>
                      <option value="reflective">Reflective & contemplative</option>
                      <option value="practical_application">Practical application</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="form-label">Preferred Bible Version</label>
                    <select value={spiritualProfile.bible_version_preference} onChange={e => setSpiritualProfile({ ...spiritualProfile, bible_version_preference: e.target.value })} className="form-input">
                      <option value="">Select...</option>
                      <option value="NKJV">NKJV (New King James Version)</option>
                      <option value="NIV">NIV (New International Version)</option>
                      <option value="ESV">ESV (English Standard Version)</option>
                      <option value="KJV">KJV (King James Version)</option>
                      <option value="NLT">NLT (New Living Translation)</option>
                      <option value="AMP">AMP (Amplified Bible)</option>
                      <option value="MSG">MSG (The Message)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label mb-3">Favourite Bible Books (select your top picks)</label>
                    <ChipSelect
                      options={BIBLE_BOOKS}
                      selected={spiritualProfile.favourite_bible_books}
                      onChange={v => setSpiritualProfile({ ...spiritualProfile, favourite_bible_books: v })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={handleSaveSpiritual} disabled={saving} className="btn-primary flex items-center gap-2">
                    <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Spiritual Profile'}
                  </button>
                </div>

                <div className="glass-card p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <EyeOff className="w-4 h-4 flex-shrink-0" />
                    Your spiritual profile helps us personalise devotionals, scripture selections, and prayer prompts for your journey.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
    <BottomNav />
    </>
  )
}
