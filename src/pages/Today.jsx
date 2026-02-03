import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useTodayLog } from '../hooks/useTodayLog'
import { useDevotional } from '../hooks/useDevotional'
import { useEnrollment } from '../hooks/useEnrollment'
import { CheckInModal } from '../components/CheckInModal'
import { MealLogModal } from '../components/MealLogModal'
import { Sun, Moon, BookOpen, Heart, UtensilsCrossed, LogOut, Calendar, ArrowRight, Plus, ChefHat } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const Today = () => {
  const { user, profile, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { loading: logLoading, getSummary, addEntry, refresh } = useTodayLog()
  const { devotional, loading: devotionalLoading } = useDevotional()
  const { getActiveEnrollments } = useEnrollment()
  const [greeting, setGreeting] = useState('')
  const [timeIcon, setTimeIcon] = useState(Sun)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showMealModal, setShowMealModal] = useState(false)
  const [activePrograms, setActivePrograms] = useState([])
  const navigate = useNavigate()

  // Get today's summary
  const summary = getSummary()

  // Load active programs
  useEffect(() => {
    if (user) {
      loadActivePrograms()
    }
  }, [user])

  const loadActivePrograms = async () => {
    const { data } = await getActiveEnrollments()
    if (data) {
      setActivePrograms(data)
    }
  }

  // Handle check-in save
  const handleCheckInSave = async (entryData) => {
    const { error } = await addEntry('mood', entryData)
    if (!error) {
      await refresh() // Refresh to update summary
    }
  }

  // Handle meal save
  const handleMealSave = async (entryData) => {
    const { error } = await addEntry('meal', entryData)
    if (!error) {
      await refresh() // Refresh to update summary
    }
  }

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
    "One faithful step is all you need today.",
    "Your temple is worth stewarding well.",
    "Grace meets you right where you are.",
    "Small returns compound into transformation.",
    "You're here. That's already beautiful.",
  ]
  
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const encouragement = encouragements[dayOfYear % encouragements.length]

  return (
    <div className="min-h-screen p-4 md:p-8">
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
            <span className="font-display text-xl md:text-2xl font-bold gradient-text hidden sm:inline">
              Temple Keepers
            </span>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-2">
            {/* Quick Links */}
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
              <span className="text-sm font-medium text-temple-purple dark:text-temple-gold">
                {greeting}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-3">
              Welcome back, {firstName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {encouragement}
            </p>
          </div>
        </div>

        {/* Block 2: Daily Bread (Devotional) */}
        <div className="scripture-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-temple-purple to-temple-purple-dark flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-temple-gold">Daily Bread</h2>
            </div>
            
            {devotionalLoading ? (
              <div className="text-center py-8">
                <div className="spinner mx-auto mb-3"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Preparing today's devotional...
                </p>
              </div>
            ) : devotional ? (
              <>
                <p className="devotional-verse mb-4">
                  "{devotional.verse}"
                </p>
                <p className="devotional-reference">
                  — {devotional.reference}
                </p>
                
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {devotional.reflection}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">Unable to load today's devotional.</p>
              </div>
            )}
          </div>
        </div>

        {/* Block 3: One Small Step (Actions) */}
        <div className="action-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            One Small Step
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button 
              onClick={() => setShowCheckInModal(true)}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5" />
              <span>Quick Check-In</span>
            </button>
            <button 
              onClick={() => setShowMealModal(true)}
              className="btn-gold flex items-center justify-center gap-2"
            >
              <UtensilsCrossed className="w-5 h-5" />
              <span>Log a Meal</span>
            </button>
          </div>
        </div>

        {/* Block 4: Temple Care Today */}
        <div className="summary-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Temple Care Today
          </h2>
          
          {logLoading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto"></div>
            </div>
          ) : summary.checkInCount === 0 && summary.mealCount === 0 ? (
            /* Empty state */
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No check-ins or meals logged yet today.</p>
              <p className="text-xs mt-2">Start by taking a small step above! ✨</p>
            </div>
          ) : (
            /* Active state with data */
            <div className="space-y-4">
              {/* Check-ins */}
              {summary.checkInCount > 0 && (
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Heart className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                  <span>
                    Checked in {summary.checkInCount} {summary.checkInCount === 1 ? 'time' : 'times'} today
                  </span>
                </div>
              )}

              {/* Meals */}
              {summary.mealCount > 0 && (
                <div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 mb-2">
                    <UtensilsCrossed className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                    <span className="font-medium">
                      Meals logged: {summary.mealCount}
                    </span>
                  </div>
                  <div className="ml-8 space-y-1">
                    {summary.meals.map((meal, idx) => (
                      <div key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-temple-purple dark:text-temple-gold">
                          {meal.type}:
                        </span>{' '}
                        {meal.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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

      </div>

      {/* Modals */}
      <CheckInModal 
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onSave={handleCheckInSave}
      />
      
      <MealLogModal 
        isOpen={showMealModal}
        onClose={() => setShowMealModal(false)}
        onSave={handleMealSave}
      />
    </div>
  )
}
