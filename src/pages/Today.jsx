import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useDevotional } from '../hooks/useDevotional'
import { useEnrollment } from '../hooks/useEnrollment'
import { BottomNav } from '../components/BottomNav'
import { LiveSessionCard } from '../features/fasting/components/LiveSessionCard'
import { useNextSession, useCohort } from '../features/fasting/hooks/useFasting'
import { Sun, Moon, BookOpen, Heart, UtensilsCrossed, LogOut, Calendar, ArrowRight, Plus, ChefHat, User, AlertCircle, ClipboardList, Users, Sparkles, X } from 'lucide-react'
import { WeeklyThemeCard } from '../components/WeeklyThemeCard'
import { StreakBadge } from '../components/StreakBadge'
import { NotificationBell } from '../components/NotificationBell'
import { notificationService } from '../services/notificationService'
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
  const navigate = useNavigate()

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
      const devTimer = notificationService.scheduleMorningReminder()
      if (devTimer) timers.push(devTimer)

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

  // Check if user is enrolled in the Make Room program
  const isEnrolledInMakeRoom = activePrograms.some(
    e => e.programs?.slug === 'make-room-for-the-lord'
  )

  // Check if banner was previously dismissed this session
  const showJoinBanner = !isEnrolledInMakeRoom && !dismissedBanner && activePrograms !== null

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
          <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-2">
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

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-secondary flex items-center gap-2 text-sm"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
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
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            One Small Step
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
          </div>
        </div>

        {/* Block 4: Temple Care Today */}
        <div className="summary-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Temple Care Today
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Review your check-ins, meals, and symptoms in one place.
          </p>
          <button
            onClick={() => navigate('/wellness')}
            className="btn-secondary inline-flex items-center gap-2"
          >
            View Wellness History
          </button>
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

    {/* Mobile Bottom Navigation */}
    <BottomNav />
    </>
  )
}
