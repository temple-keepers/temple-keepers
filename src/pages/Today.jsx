import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useDevotional } from '../hooks/useDevotional'
import { useEnrollment } from '../hooks/useEnrollment'
import { BottomNav } from '../components/BottomNav'
import { LiveSessionCard } from '../components/fasting/LiveSessionCard'
import { useNextSession, useCohort } from '../hooks/useFasting'
import { Sun, Moon, BookOpen, Heart, UtensilsCrossed, LogOut, Calendar, ArrowRight, Plus, ChefHat, User, AlertCircle, ClipboardList, Users, Sparkles, X, Megaphone, Award, Utensils, Activity, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { WeeklyThemeCard } from '../components/WeeklyThemeCard'
import { StreakBadge } from '../components/StreakBadge'
import { NotificationBell } from '../components/NotificationBell'
import { notificationService } from '../services/notificationService'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export const Today = () => {
  const { user, profile, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { devotional, weeklyTheme, loading: devotionalLoading } = useDevotional()
  const { getActiveEnrollments } = useEnrollment()
  const [greeting, setGreeting] = useState('')
  const [timeIcon, setTimeIcon] = useState(Sun)
  const [activePrograms, setActivePrograms] = useState([])
  const [dismissedBanner, setDismissedBanner] = useState(false)
  const [activityFeed, setActivityFeed] = useState([])
  const [feedLoading, setFeedLoading] = useState(true)
  const navigate = useNavigate()
  const [showFeatureTour, setShowFeatureTour] = useState(false)
  const [tourSlide, setTourSlide] = useState(0)

  // Detect fasting enrollment and get live session
  const fastingEnrollment = activePrograms.find(e => e.cohort_id)
  const { session: nextSession } = useNextSession(fastingEnrollment?.cohort_id)
  const { cohort } = useCohort(fastingEnrollment?.cohort_id)

  // Load active programs — fire immediately, don't wait for other hooks
  useEffect(() => {
    if (user) {
      getActiveEnrollments().then(({ data }) => {
        if (data) setActivePrograms(data)
      })
    }
  }, [user])

  // Schedule local reminders — defer to not block rendering
  useEffect(() => {
    if (!user) return
    const timers = []

    // Defer reminder scheduling so it doesn't block initial paint
    const raf = requestAnimationFrame(() => {
      if (fastingEnrollment?.fasting_window) {
        const fastTimers = notificationService.scheduleFastingReminders(fastingEnrollment.fasting_window)
        timers.push(...fastTimers)
      }
    })

    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(t => clearTimeout(t))
    }
  }, [user, fastingEnrollment])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting('Good morning')
      setTimeIcon(Sun)
    } else if (hour < 17) {
      setGreeting('Good afternoon')
      setTimeIcon(Sun)
    } else {
      setGreeting('Good evening')
      setTimeIcon(Moon)
    }
  }, [])

  // Fetch activity feed (announcements + new programs + recent recipes + badges)
  useEffect(() => {
    if (!user) return
    const fetchFeed = async () => {
      setFeedLoading(true)
      // Only show today's activity
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayISO = todayStart.toISOString()

      const [announcementsRes, programsRes, recipesRes, badgesRes] = await Promise.all([
        supabase
          .from('announcements')
          .select('id, title, content, type, created_at')
          .eq('is_active', true)
          .gte('created_at', todayISO)
          .order('priority', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('programs')
          .select('id, title, slug, description, category, cover_image_url, created_at')
          .eq('is_published', true)
          .gte('created_at', todayISO)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('recipes')
          .select('id, title, meal_type, cuisine, created_at')
          .eq('created_by', user.id)
          .gte('created_at', todayISO)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('user_badges')
          .select('id, earned_at, badges(name, icon, description)')
          .eq('user_id', user.id)
          .gte('earned_at', todayISO)
          .order('earned_at', { ascending: false })
          .limit(5),
      ])

      const items = []

      // Announcements
      if (announcementsRes.data) {
        announcementsRes.data.forEach(a => items.push({
          id: `ann-${a.id}`,
          type: 'announcement',
          subType: a.type,
          title: a.title,
          description: a.content,
          date: a.created_at,
        }))
      }

      // New programs
      if (programsRes.data) {
        programsRes.data.forEach(p => items.push({
          id: `prog-${p.id}`,
          type: 'new_program',
          title: p.title,
          description: p.description?.slice(0, 100) + (p.description?.length > 100 ? '...' : ''),
          date: p.created_at,
          action: () => navigate(`/programs/${p.slug}`),
        }))
      }

      // Recent recipes
      if (recipesRes.data) {
        recipesRes.data.forEach(r => items.push({
          id: `recipe-${r.id}`,
          type: 'recipe',
          title: r.title,
          description: `${r.cuisine !== 'any' ? r.cuisine + ' ' : ''}${r.meal_type} recipe`,
          date: r.created_at,
          action: () => navigate(`/recipes/${r.id}`),
        }))
      }

      // Earned badges
      if (badgesRes.data) {
        badgesRes.data.forEach(b => items.push({
          id: `badge-${b.id}`,
          type: 'badge',
          title: `Earned: ${b.badges?.name || 'Badge'}`,
          description: b.badges?.description || '',
          date: b.earned_at,
          icon: b.badges?.icon,
          action: () => navigate('/achievements'),
        }))
      }

      // Sort by date descending and limit
      items.sort((a, b) => new Date(b.date) - new Date(a.date))
      setActivityFeed(items.slice(0, 12))
      setFeedLoading(false)
    }
    fetchFeed()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const TimeIcon = timeIcon
  const firstName = profile?.first_name || user?.user_metadata?.first_name || 'Friend'

  // Gentle encouragements (rotate daily)
  const encouragements = [
    'One faithful step is all you need today.',
    'Your temple is worth stewarding well.',
    'Grace meets you right where you are.',
    'Small returns compound into transformation.',
    "You're here. That's already beautiful."
  ]

  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const encouragement = encouragements[dayOfYear % encouragements.length]

  const FEED_STYLES = {
    // Announcement sub-types
    general: { icon: Megaphone, label: 'Announcement', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', iconColor: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
    update: { icon: Sparkles, label: 'Update', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', iconColor: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' },
    event: { icon: Calendar, label: 'Event', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', iconColor: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
    tip: { icon: Heart, label: 'Tip', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', iconColor: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
    // Feed item types
    new_program: { icon: Calendar, label: 'New Program', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', iconColor: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
    recipe: { icon: Utensils, label: 'Recipe Saved', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', iconColor: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
    badge: { icon: Award, label: 'Achievement', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', iconColor: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500' },
  }

  const getFeedStyle = (item) => {
    if (item.type === 'announcement') return FEED_STYLES[item.subType] || FEED_STYLES.general
    return FEED_STYLES[item.type] || FEED_STYLES.general
  }

  const formatFeedDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  // Check if user is enrolled in the Make Room program
  const isEnrolledInMakeRoom = activePrograms.some(
    e => e.programs?.slug === 'make-room-for-the-lord'
  )

  // Check if banner was previously dismissed this session
  const showJoinBanner = !isEnrolledInMakeRoom && !dismissedBanner && activePrograms !== null

  // Feature tour slides
  const TOUR_SLIDES = [
    {
      emoji: '📖',
      title: 'Daily Devotionals',
      description: 'Start each day with AI-personalised scripture, prayer, and reflection — designed to connect your faith with your wellness journey.',
      action: () => navigate('/today'),
      actionLabel: 'View Today\'s Devotional',
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      emoji: '🍽️',
      title: 'AI Recipe Generator',
      description: 'Generate healthy recipes tailored to your dietary needs and preferences. Every recipe includes scripture inspiration, nutrition info, and healthy swaps.',
      action: () => navigate('/recipes'),
      actionLabel: 'Browse Recipes',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      emoji: '📋',
      title: 'Meal Plans & Shopping Lists',
      description: 'Plan your meals for the week, auto-generate shopping lists, and stay on track with your nutrition goals.',
      action: () => navigate('/meal-plans'),
      actionLabel: 'View Meal Plans',
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      emoji: '🙏',
      title: 'Guided Programmes',
      description: 'Join structured programmes like fasting journeys, wellness challenges, and emotional healing courses — each with daily content and progress tracking.',
      action: () => navigate('/programs'),
      actionLabel: 'Explore Programmes',
      gradient: 'from-temple-purple to-purple-700',
    },
    {
      emoji: '💚',
      title: 'Wellness Tracking',
      description: 'Log daily check-ins, track meals with AI nutrition estimates, monitor symptoms and spot patterns, and track your water intake.',
      action: () => navigate('/wellness'),
      actionLabel: 'Go to Wellness Hub',
      gradient: 'from-teal-500 to-cyan-600',
    },
    {
      emoji: '👥',
      title: 'Community & Accountability',
      description: 'Join accountability pods, share your journey with like-minded believers, post prayer requests, and cheer each other on.',
      action: () => navigate('/pods'),
      actionLabel: 'Join a Pod',
      gradient: 'from-blue-500 to-blue-700',
    },
    {
      emoji: '🏆',
      title: 'Achievements & Streaks',
      description: 'Earn badges for completing programmes, maintaining streaks, and hitting wellness milestones. Stay motivated with visible progress!',
      action: () => navigate('/achievements'),
      actionLabel: 'View Achievements',
      gradient: 'from-yellow-500 to-amber-600',
    },
    {
      emoji: '👤',
      title: 'Your Profile',
      description: 'Set your dietary preferences, health goals, and wellness targets. Everything in Temple Keepers personalises to YOU.',
      action: () => navigate('/profile'),
      actionLabel: 'Edit Profile',
      gradient: 'from-pink-500 to-rose-600',
    },
  ]

  // Show banner until end date of the cohort (Feb 22)
  const bannerEndDate = new Date('2026-02-22T23:59:59')
  const showBannerInTime = new Date() <= bannerEndDate

  return (
    <>
    <div className="min-h-screen p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header with Logo and Controls */}
        <div className="flex items-center justify-between mb-6">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <img
              src="/logo.png"
              alt="Temple Keepers"
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
            />
            <span className="font-display text-xl md:text-2xl font-bold gradient-text hidden sm:inline" style={{ WebkitTextFillColor: 'transparent' }}>
              Temple Keepers
            </span>
          </div>

          {/* Navigation and Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Quick Links - Desktop */}
            <button
              onClick={() => navigate('/wellness')}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>Wellness</span>
            </button>

            <button
              onClick={() => navigate('/programs')}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Programs</span>
            </button>

            <button
              onClick={() => navigate('/recipes')}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChefHat className="w-4 h-4" />
              <span>Recipes</span>
            </button>

            <button
              onClick={() => navigate('/meal-plans')}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Meal Plans</span>
            </button>

            <button
              onClick={() => navigate('/pods')}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Community</span>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Theme Toggle - icon only on mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Sign Out - icon only on mobile */}
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Block 1: Welcome Card */}
        <div className="welcome-card animate-fade-in">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 bg-temple-purple/10 dark:bg-temple-gold/10">
              <TimeIcon className="w-4 h-4 text-temple-purple dark:text-temple-gold" />
              <span className="text-sm font-semibold text-temple-purple dark:text-[#E8C49A]">
                {greeting}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-3">
              Welcome back, {firstName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {encouragement}
            </p>
          </div>
        </div>

        {/* Streak Tracker */}
        <StreakBadge />

        {/* Weekly Theme + Daily Devotional (merged) */}
        <WeeklyThemeCard
          devotional={devotional}
          weeklyTheme={weeklyTheme}
          devotionalLoading={devotionalLoading}
        />

        {/* Join the Fast Banner — shows for users not enrolled in Make Room */}
        {showJoinBanner && showBannerInTime && (
          <div className="relative animate-fade-in overflow-hidden rounded-2xl bg-gradient-to-br from-temple-purple via-temple-purple-dark to-purple-900 dark:from-[#2a1854] dark:via-[#1e1145] dark:to-[#120b2e] p-6 md:p-8 shadow-xl">
            {/* Dismiss button */}
            <button
              onClick={() => setDismissedBanner(true)}
              className="absolute top-3 right-3 p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors z-10"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Decorative glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-temple-gold/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm mb-4">
                <Sparkles className="w-4 h-4 text-temple-gold" />
                <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">Starts February 9th</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                Make Room for the Lord
              </h2>
              <p className="text-white/80 mb-1 text-sm md:text-base">
                A 14-day guided fasting journey with daily scripture, prayer, and live community sessions.
              </p>
              <p className="text-white/60 text-xs mb-5">
                Choose your fasting type • Daily devotionals • Live Zoom sessions • Fasting tracker
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/programs/make-room-for-the-lord')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-temple-purple font-semibold hover:bg-white/90 transition-colors shadow-lg"
                >
                  <Calendar className="w-5 h-5" />
                  Join the Fast
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/programs')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors border border-white/20"
                >
                  Browse All Programs
                </button>
              </div>
            </div>
          </div>
        )}



        {/* Block 3: One Small Step (Actions) */}
        <div className="action-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              One Small Step
            </h2>
            <button
              onClick={() => { setTourSlide(0); setShowFeatureTour(true) }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-temple-purple dark:text-temple-gold bg-temple-purple/10 dark:bg-temple-gold/10 hover:bg-temple-purple/20 dark:hover:bg-temple-gold/20 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              What can I do?
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/wellness/check-in')}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5" />
              <span>Quick Check-In</span>
            </button>
            <button
              onClick={() => navigate('/wellness/meals/new')}
              className="btn-gold flex items-center justify-center gap-2"
            >
              <UtensilsCrossed className="w-5 h-5" />
              <span>Log a Meal</span>
            </button>
            <button
              onClick={() => navigate('/recipes')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-colors bg-orange-500 hover:bg-orange-600 text-white shadow-md"
            >
              <ChefHat className="w-5 h-5" />
              <span>Recipes</span>
            </button>
            <button
              onClick={() => navigate('/meal-plans')}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <ClipboardList className="w-5 h-5" />
              <span>Meal Plans</span>
            </button>
            <button
              onClick={() => navigate('/wellness/symptoms/new')}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              <span>Log Symptom</span>
            </button>
            <button
              onClick={() => navigate('/programs')}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Programmes</span>
            </button>
          </div>
        </div>

        {/* Block 4: Activity Feed */}
        <div className="summary-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-temple-purple/10 dark:bg-temple-gold/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-temple-purple dark:text-temple-gold" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Today's Activity
            </h2>
          </div>

          {feedLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="spinner w-6 h-6"></div>
            </div>
          ) : activityFeed.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />

              <div className="space-y-1">
                {activityFeed.map((item) => {
                  const style = getFeedStyle(item)
                  const Icon = style.icon
                  const isClickable = !!item.action

                  return (
                    <div
                      key={item.id}
                      onClick={item.action}
                      className={`relative pl-10 py-3 rounded-xl transition-all ${
                        isClickable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''
                      }`}
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-2.5 top-4.5 w-[11px] h-[11px] rounded-full border-2 border-white dark:border-gray-900 ${style.dot} z-10`} />

                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${style.bg}`}>
                          <Icon className={`w-4 h-4 ${style.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${style.iconColor}`}>
                              {style.label}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">
                              {formatFeedDate(item.date)}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          {isClickable && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-temple-purple dark:text-temple-gold mt-1">
                              View <ArrowRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Nothing yet today. Start your first step! 🙏
            </p>
          )}
        </div>

        {/* Block 4: Active Programs */}
        {activePrograms.length > 0 && (
          <div className="glass-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Programs</h2>
              </div>
              <button
                onClick={() => navigate('/programs')}
                className="text-sm font-medium text-temple-purple dark:text-temple-gold hover:underline flex items-center gap-1"
              >
                Browse All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePrograms.map((enrollment) => {
                // Calculate next uncompleted day for navigation
                const completedDaysSet = new Set(enrollment.completed_days || [])
                const startDate = new Date(enrollment.start_date)
                const today = new Date()
                const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))
                const maxUnlockedDay = Math.min(daysSinceStart + 1, enrollment.programs.duration_days)

                // Find first uncompleted day within unlocked range
                let nextDay = 1
                for (let i = 1; i <= maxUnlockedDay; i++) {
                  if (!completedDaysSet.has(i)) {
                    nextDay = i
                    break
                  }
                }

                // If all unlocked days are complete, show the latest unlocked day
                if (completedDaysSet.has(nextDay) && nextDay < maxUnlockedDay) {
                  nextDay = maxUnlockedDay
                }

                return (
                  <div
                    key={enrollment.id}
                    onClick={() => navigate(`/programs/${enrollment.programs.slug}/day/${nextDay}`)}
                    className="group relative p-6 rounded-xl bg-gradient-to-br from-temple-purple/10 to-temple-purple/5 dark:from-temple-gold/10 dark:to-temple-gold/5 border-2 border-temple-purple/20 dark:border-temple-gold/20 cursor-pointer hover:border-temple-purple dark:hover:border-temple-gold hover:scale-[1.02] transition-all"
                  >
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {enrollment.programs.title}
                          </h3>
                          {enrollment.fasting_type && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-400">
                              <BookOpen className="w-3 h-3" />
                              <span className="capitalize">{enrollment.fasting_type} Fast</span>
                            </div>
                          )}
                        </div>
                        <ArrowRight className="w-5 h-5 text-temple-purple dark:text-temple-gold flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {enrollment.completed_days?.length || 0} of {enrollment.programs.duration_days} days complete
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round(((enrollment.completed_days?.length || 0) / enrollment.programs.duration_days) * 100)}% complete
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 transition-all rounded-full"
                            style={{ width: `${((enrollment.completed_days?.length || 0) / enrollment.programs.duration_days) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-temple-purple/20 dark:border-temple-gold/20">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-temple-purple/20 dark:bg-temple-gold/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-temple-purple dark:text-temple-gold">
                            {nextDay}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Next Step</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {completedDaysSet.has(nextDay) ? `Review Day ${nextDay}` : `Continue Day ${nextDay}`}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-temple-purple dark:text-temple-gold flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <button
                onClick={() => navigate('/programs')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Browse More Programs</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Session Card (for fasting programs) */}
        {fastingEnrollment && nextSession && (
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <LiveSessionCard session={nextSession} cohort={cohort} />
          </div>
        )}

      </div>
    </div>

    {/* Feature Tour Slider */}
    {showFeatureTour && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowFeatureTour(false)}>
        <div
          className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Slide content */}
          <div className={`relative bg-gradient-to-br ${TOUR_SLIDES[tourSlide].gradient} p-8 pb-12 text-center`}>
            {/* Close button */}
            <button
              onClick={() => setShowFeatureTour(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Slide counter */}
            <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
              {tourSlide + 1} / {TOUR_SLIDES.length}
            </div>

            <div className="text-6xl mb-4 mt-4">{TOUR_SLIDES[tourSlide].emoji}</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {TOUR_SLIDES[tourSlide].title}
            </h3>
          </div>

          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed mb-6">
              {TOUR_SLIDES[tourSlide].description}
            </p>

            {/* CTA button */}
            <button
              onClick={() => {
                setShowFeatureTour(false)
                TOUR_SLIDES[tourSlide].action()
              }}
              className={`w-full py-3 px-4 rounded-xl text-white font-semibold bg-gradient-to-r ${TOUR_SLIDES[tourSlide].gradient} hover:opacity-90 transition-opacity mb-4`}
            >
              {TOUR_SLIDES[tourSlide].actionLabel}
            </button>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setTourSlide(Math.max(0, tourSlide - 1))}
                disabled={tourSlide === 0}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {TOUR_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTourSlide(i)}
                    className={`rounded-full transition-all ${
                      i === tourSlide
                        ? 'w-6 h-2 bg-temple-purple dark:bg-temple-gold'
                        : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>

              {tourSlide < TOUR_SLIDES.length - 1 ? (
                <button
                  onClick={() => setTourSlide(tourSlide + 1)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-temple-purple dark:text-temple-gold hover:bg-temple-purple/10 dark:hover:bg-temple-gold/10 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowFeatureTour(false)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  Done ✓
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Mobile Bottom Navigation */}
    <BottomNav />
    </>
  )
}
