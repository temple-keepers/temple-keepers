import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { 
  getChallengeBySlug, 
  getChallengeDays, 
  getUserChallenge, 
  joinChallenge,
  getDayProgress,
  completeDay,
  completeChallenge,
  calculateCurrentDay
} from '../lib/challenges'
import { incrementUserStat } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { 
  ArrowLeft, 
  Calendar, 
  Trophy, 
  Flame,
  CheckCircle,
  Circle,
  Lock,
  Play,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Check,
  Sparkles,
  Heart,
  AlertTriangle,
  Star,
  Target,
  Clock,
  Users
} from 'lucide-react'

const ChallengeDetail = () => {
  const { slug } = useParams()
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [challenge, setChallenge] = useState(null)
  const [days, setDays] = useState([])
  const [userChallenge, setUserChallenge] = useState(null)
  const [dayProgress, setDayProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [expandedDay, setExpandedDay] = useState(null)
  const [completingDay, setCompletingDay] = useState(null)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [dayTasks, setDayTasks] = useState({})
  const [dayReflection, setDayReflection] = useState('')
  const [dayMood, setDayMood] = useState(null)

  useEffect(() => {
    if (user && slug) {
      loadData()
    }
  }, [user, slug])

  const loadData = async () => {
    setLoading(true)
    const challengeData = await getChallengeBySlug(slug)
    
    if (!challengeData) {
      navigate('/challenges')
      return
    }

    setChallenge(challengeData)
    
    const [daysData, userChallengeData] = await Promise.all([
      getChallengeDays(challengeData.id),
      getUserChallenge(user.id, challengeData.id)
    ])

    setDays(daysData)
    setUserChallenge(userChallengeData)

    if (userChallengeData) {
      const progressData = await getDayProgress(user.id, userChallengeData.id)
      setDayProgress(progressData)
      
      // Auto-expand current day
      const currentDay = calculateCurrentDay(userChallengeData.start_date)
      if (currentDay <= challengeData.duration_days) {
        setExpandedDay(currentDay)
      }
    }

    setLoading(false)
  }

  const handleJoin = async () => {
    setJoining(true)
    try {
      const enrollment = await joinChallenge(user.id, challenge.id, challenge.duration_days)
      setUserChallenge(enrollment)
      setExpandedDay(1)
      toast.success('Challenge joined! Let\'s go! 🔥')
    } catch (error) {
      toast.error('Failed to join challenge')
    } finally {
      setJoining(false)
    }
  }

  const handleCompleteDay = async (day) => {
    if (!userChallenge) return

    setCompletingDay(day.day_number)
    
    try {
      // Get completed tasks for this day
      const completedTasks = dayTasks[day.day_number] || []
      
      await completeDay(
        user.id,
        userChallenge.id,
        day.id,
        day.day_number,
        completedTasks,
        dayReflection,
        dayMood
      )

      // Refresh progress
      const progressData = await getDayProgress(user.id, userChallenge.id)
      setDayProgress(progressData)

      // Calculate daily points earned (25 per day + bonus on completion)
      const currentPoints = (userChallenge.points_earned || 0) + 25
      
      // Update user challenge with daily points
      const { error: pointsError } = await supabase
        .from('user_challenges')
        .update({ points_earned: currentPoints })
        .eq('id', userChallenge.id)
      
      if (pointsError) {
        console.error('Error updating points:', pointsError)
      }

      // Update local user challenge state
      setUserChallenge(prev => ({
        ...prev,
        completed_days: day.day_number,
        current_day: day.day_number + 1,
        points_earned: currentPoints
      }))

      // Add points to user's overall points
      await incrementUserStat(user.id, 'points', 25)

      toast.success(`Day ${day.day_number} completed! +25 points 🎉`)

      // Check if challenge is complete
      if (day.day_number === challenge.duration_days) {
        const finalPoints = currentPoints + challenge.points_reward
        setShowCompleteModal(true)
        await completeChallenge(userChallenge.id, finalPoints)
        await incrementUserStat(user.id, 'points', challenge.points_reward)
        
        // Update local state with final points
        setUserChallenge(prev => ({
          ...prev,
          points_earned: finalPoints,
          status: 'completed'
        }))
      } else {
        // Expand next day
        setExpandedDay(day.day_number + 1)
      }

      // Reset form
      setDayReflection('')
      setDayMood(null)
      setDayTasks(prev => ({ ...prev, [day.day_number]: [] }))
    } catch (error) {
      console.error('Complete day error:', error)
      toast.error('Failed to complete day')
    } finally {
      setCompletingDay(null)
    }
  }

  const toggleTask = (dayNumber, taskIndex) => {
    setDayTasks(prev => {
      const current = prev[dayNumber] || []
      if (current.includes(taskIndex)) {
        return { ...prev, [dayNumber]: current.filter(i => i !== taskIndex) }
      } else {
        return { ...prev, [dayNumber]: [...current, taskIndex] }
      }
    })
  }

  const isDayAccessible = (dayNumber) => {
    if (!userChallenge) return false
    const currentDay = calculateCurrentDay(userChallenge.start_date)
    return dayNumber <= currentDay
  }

  const isDayCompleted = (dayNumber) => {
    return dayProgress.some(p => p.day_number === dayNumber && p.is_completed)
  }

  const moods = [
    { id: 'great', emoji: '😊', label: 'Great' },
    { id: 'good', emoji: '🙂', label: 'Good' },
    { id: 'okay', emoji: '😐', label: 'Okay' },
    { id: 'struggling', emoji: '😔', label: 'Struggling' },
    { id: 'difficult', emoji: '😣', label: 'Difficult' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin" />
      </div>
    )
  }

  if (!challenge) return null

  // Helper to safely parse arrays (handles both JSON strings and native arrays)
  const safeParseArray = (value) => {
    if (!value) return []
    if (Array.isArray(value)) return value
    try {
      return JSON.parse(value)
    } catch {
      return []
    }
  }

  const requirements = safeParseArray(challenge.requirements)
  const benefits = safeParseArray(challenge.benefits)
  const progressPercent = userChallenge 
    ? Math.round((userChallenge.completed_days / challenge.duration_days) * 100)
    : 0

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/challenges')}
        className={`flex items-center gap-2 mb-6 ${
          isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Challenges
      </button>

      {/* Header Card */}
      <div className={`rounded-3xl overflow-hidden mb-8 ${
        isDark ? 'bg-gray-800' : 'bg-white shadow-lg'
      }`}>
        {/* Featured Banner */}
        {challenge.is_featured && (
          <div className="bg-gradient-to-r from-temple-purple to-temple-gold text-white px-6 py-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Featured Challenge</span>
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-temple-purple to-temple-gold flex items-center justify-center flex-shrink-0">
              <Flame className="w-10 h-10 text-white" />
            </div>

            <div className="flex-1">
              <h1 className={`text-3xl font-display font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {challenge.title}
              </h1>
              
              <p className={`text-lg mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {challenge.description}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Calendar className="w-4 h-4" />
                  {challenge.duration_days} days
                </span>
                <span className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Trophy className="w-4 h-4" />
                  {challenge.points_reward} points
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  challenge.difficulty === 'beginner' 
                    ? 'bg-green-500/20 text-green-500'
                    : challenge.difficulty === 'intermediate'
                      ? 'bg-amber-500/20 text-amber-500'
                      : 'bg-red-500/20 text-red-500'
                }`}>
                  {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                </span>
              </div>

              {/* Join/Progress */}
              {!userChallenge ? (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-semibold hover:opacity-90 transition-all flex items-center gap-2"
                >
                  {joining ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Challenge
                    </>
                  )}
                </button>
              ) : userChallenge.status === 'completed' ? (
                <div className="flex items-center gap-3 text-green-500">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-semibold">Challenge Completed!</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Day {Math.min(calculateCurrentDay(userChallenge.start_date), challenge.duration_days)} of {challenge.duration_days}
                    </span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {progressPercent}% complete
                    </span>
                  </div>
                  <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-temple-purple to-temple-gold transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Requirements & Benefits */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Requirements */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <Target className="w-5 h-5 text-temple-purple" />
            Requirements
          </h3>
          <ul className="space-y-3">
            {requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-3">
                <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  isDark ? 'text-amber-400' : 'text-amber-500'
                }`} />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {req}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Benefits */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <Star className="w-5 h-5 text-temple-gold" />
            Benefits
          </h3>
          <ul className="space-y-3">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* About */}
      {challenge.long_description && (
        <div className={`rounded-2xl p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <BookOpen className="w-5 h-5 text-temple-purple" />
            About This Challenge
          </h3>
          <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''}`}>
            <p className={`whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {challenge.long_description}
            </p>
          </div>
        </div>
      )}

      {/* Daily Guide */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
        <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          <Calendar className="w-5 h-5 text-temple-purple" />
          {challenge.duration_days}-Day Guide
        </h3>

        <div className="space-y-3">
          {days.map((day) => {
            const accessible = isDayAccessible(day.day_number)
            const completed = isDayCompleted(day.day_number)
            const isExpanded = expandedDay === day.day_number
            const tasks = safeParseArray(day.tasks)
            const tips = safeParseArray(day.tips)
            const meals = safeParseArray(day.meal_suggestions)
            const completedTasks = dayTasks[day.day_number] || []

            return (
              <div 
                key={day.id}
                className={`rounded-xl overflow-hidden border transition-all ${
                  completed
                    ? isDark ? 'border-green-500/30 bg-green-500/5' : 'border-green-200 bg-green-50/50'
                    : accessible
                      ? isDark ? 'border-gray-700' : 'border-gray-200'
                      : isDark ? 'border-gray-700/50 opacity-60' : 'border-gray-100 opacity-60'
                }`}
              >
                {/* Day Header */}
                <button
                  onClick={() => accessible && setExpandedDay(isExpanded ? null : day.day_number)}
                  disabled={!accessible}
                  className={`w-full px-4 py-4 flex items-center gap-4 text-left ${
                    accessible ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  {/* Status Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    completed
                      ? 'bg-green-500 text-white'
                      : accessible
                        ? isDark ? 'bg-gray-700' : 'bg-gray-100'
                        : isDark ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    {completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : accessible ? (
                      <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {day.day_number}
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* Day Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${
                      completed
                        ? 'text-green-600 dark:text-green-400'
                        : isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Day {day.day_number}: {day.title}
                    </p>
                    <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {day.description}
                    </p>
                  </div>

                  {/* Expand Icon */}
                  {accessible && (
                    isExpanded ? (
                      <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    ) : (
                      <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    )
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && accessible && (
                  <div className={`px-4 pb-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    {/* Scripture */}
                    <div className={`mt-4 p-4 rounded-xl ${
                      isDark ? 'bg-temple-purple/10' : 'bg-temple-purple/5'
                    }`}>
                      <p className={`italic mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        "{day.scripture}"
                      </p>
                      <p className="text-temple-purple text-sm font-medium">
                        — {day.scripture_reference}
                      </p>
                    </div>

                    {/* Reflection */}
                    {day.reflection && (
                      <div className="mt-4">
                        <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          Today's Reflection
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {day.reflection}
                        </p>
                      </div>
                    )}

                    {/* Tasks */}
                    {tasks.length > 0 && (
                      <div className="mt-4">
                        <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          Today's Tasks
                        </h4>
                        <div className="space-y-2">
                          {tasks.map((task, i) => (
                            <button
                              key={i}
                              onClick={() => !completed && toggleTask(day.day_number, i)}
                              disabled={completed}
                              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                                completedTasks.includes(i) || completed
                                  ? isDark ? 'bg-green-500/10' : 'bg-green-50'
                                  : isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                completedTasks.includes(i) || completed
                                  ? 'bg-green-500 text-white'
                                  : isDark ? 'border-2 border-gray-500' : 'border-2 border-gray-300'
                              }`}>
                                {(completedTasks.includes(i) || completed) && <Check className="w-3 h-3" />}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {task}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Meal Suggestions */}
                    {meals.length > 0 && (
                      <div className="mt-4">
                        <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          Meal Suggestions
                        </h4>
                        <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {meals.map((meal, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span>•</span>
                              <span>{meal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tips */}
                    {tips.length > 0 && (
                      <div className={`mt-4 p-4 rounded-xl ${
                        isDark ? 'bg-amber-500/10' : 'bg-amber-50'
                      }`}>
                        <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                          isDark ? 'text-amber-400' : 'text-amber-700'
                        }`}>
                          <Sparkles className="w-4 h-4" />
                          Tips for Today
                        </h4>
                        <ul className={`space-y-1 text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                          {tips.map((tip, i) => (
                            <li key={i}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Complete Day Section */}
                    {!completed && (
                      <div className={`mt-6 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        {/* Mood Check */}
                        <div className="mb-4">
                          <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            How are you feeling today?
                          </h4>
                          <div className="flex gap-2">
                            {moods.map((m) => (
                              <button
                                key={m.id}
                                onClick={() => setDayMood(m.id)}
                                className={`flex-1 py-2 rounded-xl text-center transition-all ${
                                  dayMood === m.id
                                    ? 'bg-temple-purple/20 border-2 border-temple-purple'
                                    : isDark ? 'bg-gray-700 border-2 border-transparent' : 'bg-gray-100 border-2 border-transparent'
                                }`}
                              >
                                <span className="text-xl">{m.emoji}</span>
                                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {m.label}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Reflection Notes */}
                        <div className="mb-4">
                          <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            Reflection Notes (optional)
                          </h4>
                          <textarea
                            value={dayReflection}
                            onChange={(e) => setDayReflection(e.target.value)}
                            placeholder="What did God teach you today? Any breakthroughs or struggles?"
                            rows={3}
                            className={`w-full px-4 py-3 rounded-xl border resize-none ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                            } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
                          />
                        </div>

                        {/* Complete Button */}
                        <button
                          onClick={() => handleCompleteDay(day)}
                          disabled={completingDay === day.day_number}
                          className="w-full py-4 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                          {completingDay === day.day_number ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Completing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              Complete Day {day.day_number}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Challenge Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl p-8 max-w-md w-full text-center ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="text-6xl mb-4">🎉</div>
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              isDark ? 'bg-green-500/20' : 'bg-green-100'
            }`}>
              <Trophy className="w-10 h-10 text-green-500" />
            </div>
            <h2 className={`text-2xl font-display font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Challenge Complete!
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              You've completed the {challenge.title}!
            </p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
              isDark ? 'bg-temple-gold/20 text-temple-gold' : 'bg-temple-gold/10 text-temple-gold'
            }`}>
              <Star className="w-5 h-5" />
              <span className="font-semibold">+{challenge.points_reward} points earned!</span>
            </div>
            <div className="flex gap-3">
              <Link
                to="/challenges"
                className={`flex-1 py-3 rounded-xl font-medium ${
                  isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                View Challenges
              </Link>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChallengeDetail