import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { getChallenges, getUserChallenges } from '../lib/challenges'
import { 
  Trophy, 
  Clock, 
  Flame, 
  Target,
  ChevronRight,
  Star,
  Users,
  Sparkles,
  CheckCircle,
  Play,
  Calendar,
  Zap
} from 'lucide-react'

const Challenges = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [challenges, setChallenges] = useState([])
  const [userChallenges, setUserChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    const [challengesData, userChallengesData] = await Promise.all([
      getChallenges(),
      getUserChallenges(user.id)
    ])
    setChallenges(challengesData)
    setUserChallenges(userChallengesData)
    setLoading(false)
  }

  const getUserChallengeStatus = (challengeId) => {
    const uc = userChallenges.find(uc => uc.challenge_id === challengeId)
    return uc?.status || null
  }

  const getActiveUserChallenge = (challengeId) => {
    return userChallenges.find(uc => uc.challenge_id === challengeId && uc.status === 'active')
  }

  const categoryIcons = {
    fasting: Flame,
    nutrition: Target,
    hydration: Zap,
    prayer: Sparkles,
    fitness: Trophy,
    mindset: Star
  }

  const categoryColors = {
    fasting: 'orange',
    nutrition: 'green',
    hydration: 'blue',
    prayer: 'purple',
    fitness: 'red',
    mindset: 'amber'
  }

  const difficultyLabels = {
    beginner: { label: 'Beginner', color: 'green' },
    intermediate: { label: 'Intermediate', color: 'amber' },
    advanced: { label: 'Advanced', color: 'red' }
  }

  const activeChallenge = userChallenges.find(uc => uc.status === 'active')

  const filteredChallenges = activeFilter === 'all' 
    ? challenges 
    : challenges.filter(c => c.category === activeFilter)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className={`text-3xl md:text-4xl font-display font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          Challenges
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Transform your life with guided spiritual and wellness challenges
        </p>
      </div>

      {/* Active Challenge Banner */}
      {activeChallenge && (
        <Link 
          to={`/challenges/${activeChallenge.challenge?.slug}`}
          className={`block rounded-3xl p-6 transition-all hover:scale-[1.01] ${
            isDark 
              ? 'bg-gradient-to-r from-temple-purple/30 to-temple-gold/20 border border-temple-purple/30' 
              : 'bg-gradient-to-r from-temple-purple/20 to-temple-gold/10 border border-temple-purple/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                isDark ? 'bg-temple-purple/30' : 'bg-temple-purple/20'
              }`}>
                <Play className="w-7 h-7 text-temple-purple" />
              </div>
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-temple-gold' : 'text-temple-purple'}`}>
                  Currently Active
                </p>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {activeChallenge.challenge?.title}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Day {activeChallenge.current_day} of {activeChallenge.challenge?.duration_days}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Progress Ring */}
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32" cy="32" r="28"
                    stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="32" cy="32" r="28"
                    stroke="url(#progressGradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={175.93}
                    strokeDashoffset={175.93 - (activeChallenge.completed_days / activeChallenge.challenge?.duration_days) * 175.93}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#D4AF37" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {Math.round((activeChallenge.completed_days / activeChallenge.challenge?.duration_days) * 100)}%
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`rounded-2xl p-4 text-center ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {userChallenges.filter(uc => uc.status === 'completed').length}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Completed</p>
        </div>
        <div className={`rounded-2xl p-4 text-center ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {activeChallenge ? activeChallenge.completed_days : 0}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Days Completed</p>
        </div>
        <div className={`rounded-2xl p-4 text-center ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <Star className="w-6 h-6 text-temple-gold mx-auto mb-2" />
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {userChallenges.reduce((sum, uc) => sum + (uc.points_earned || 0), 0)}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Points Earned</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'fasting', 'nutrition', 'prayer', 'hydration', 'fitness'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === filter
                ? 'bg-gradient-to-r from-temple-purple to-temple-gold text-white'
                : isDark 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Challenge Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredChallenges.map((challenge) => {
          const Icon = categoryIcons[challenge.category] || Target
          const color = categoryColors[challenge.category] || 'purple'
          const status = getUserChallengeStatus(challenge.id)
          const difficulty = difficultyLabels[challenge.difficulty]

          return (
            <Link
              key={challenge.id}
              to={`/challenges/${challenge.slug}`}
              className={`group rounded-3xl overflow-hidden transition-all hover:-translate-y-1 ${
                isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:shadow-xl shadow-sm'
              }`}
            >
              {/* Featured Badge */}
              {challenge.is_featured && (
                <div className="bg-gradient-to-r from-temple-purple to-temple-gold text-white text-xs font-medium px-4 py-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Featured Challenge
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-${color}-500/20`}>
                    <Icon className={`w-7 h-7 text-${color}-500`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title & Status */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {challenge.title}
                      </h3>
                      {status === 'completed' && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs">
                          <CheckCircle className="w-3 h-3" />
                          Done
                        </span>
                      )}
                      {status === 'active' && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-500 text-xs">
                          <Play className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {challenge.description}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Calendar className="w-3 h-3" />
                        {challenge.duration_days} days
                      </span>
                      <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Trophy className="w-3 h-3" />
                        {challenge.points_reward} pts
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs bg-${difficulty.color}-500/20 text-${difficulty.color}-500`}>
                        {difficulty.label}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-1 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredChallenges.length === 0 && (
        <div className={`text-center py-12 rounded-3xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <Trophy className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No challenges found
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Check back soon for new challenges!
          </p>
        </div>
      )}
    </div>
  )
}

export default Challenges