import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext-minimal'
import { useTheme } from '../contexts/ThemeContext'
import UpgradeBanner from '../components/UpgradeBanner'
import { getUserChallenges } from '../lib/challenges'
import { 
  Flame, 
  BookOpen, 
  ChefHat, 
  Trophy,
  Sun,
  Moon,
  ArrowRight,
  Quote,
  Target,
  TrendingUp,
  Leaf,
  Sparkles,
  Play,
  ChevronRight
} from 'lucide-react'

const Dashboard = () => {
  const { user, profile, stats } = useAuth()
  const [greeting, setGreeting] = useState('')
  const [timeIcon, setTimeIcon] = useState(Sun)
  const [activeChallenge, setActiveChallenge] = useState(null)
  const { isDark } = useTheme()
  const navigate = useNavigate()

  // Daily scripture - rotates based on day
  const dailyScriptures = [
    {
      verse: "Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God?",
      reference: "1 Corinthians 6:19 (NKJV)"
    },
    {
      verse: "Therefore, whether you eat or drink, or whatever you do, do all to the glory of God.",
      reference: "1 Corinthians 10:31 (NKJV)"
    },
    {
      verse: "Beloved, I pray that you may prosper in all things and be in health, just as your soul prospers.",
      reference: "3 John 1:2 (NKJV)"
    },
    {
      verse: "He gives power to the weak, and to those who have no might He increases strength.",
      reference: "Isaiah 40:29 (NKJV)"
    },
    {
      verse: "I can do all things through Christ who strengthens me.",
      reference: "Philippians 4:13 (NKJV)"
    },
    {
      verse: "For God has not given us a spirit of fear, but of power and of love and of a sound mind.",
      reference: "2 Timothy 1:7 (NKJV)"
    },
    {
      verse: "But those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles.",
      reference: "Isaiah 40:31 (NKJV)"
    }
  ]

  const todayScripture = dailyScriptures[new Date().getDay()]

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting('Good Morning')
      setTimeIcon(Sun)
    } else if (hour < 17) {
      setGreeting('Good Afternoon')
      setTimeIcon(Sun)
    } else {
      setGreeting('Good Evening')
      setTimeIcon(Moon)
    }
  }, [])

  useEffect(() => {
    if (user) {
      loadActiveChallenge()
    }
  }, [user])

  const loadActiveChallenge = async () => {
    try {
      const challenges = await getUserChallenges(user.id)
      const active = challenges?.find(c => c.status === 'active')
      setActiveChallenge(active || null)
    } catch (err) {
      console.error('Error loading active challenge:', err)
      setActiveChallenge(null)
    }
  }

  useEffect(() => {
    // Check if user needs onboarding (no health goals set = hasn't completed onboarding)
    // But respect if user has skipped onboarding
    const skipped = localStorage.getItem('onboarding_skipped')
    if (profile && (!profile.health_goals || profile.health_goals.length === 0) && !skipped) {
      navigate('/onboarding')
    }
  }, [profile, navigate])

  const userStats = [
  {
    label: 'Day Streak',
    value: stats?.streak_days || 0,
    icon: Flame,
    iconColor: 'text-orange-500',
    containerClass: 'icon-container-orange',
    link: '/challenges'
  },
  {
    label: 'Devotionals',
    value: stats?.devotionals_completed || 0,
    icon: BookOpen,
    iconColor: isDark ? 'text-temple-gold' : 'text-temple-purple',
    containerClass: 'icon-container-purple',
    link: '/devotionals'
  },
  {
    label: 'Recipes Saved',
    value: stats?.recipes_saved || 0,
    icon: ChefHat,
    iconColor: 'text-green-500',
    containerClass: 'icon-container-green',
    link: '/recipes'
  },
  {
    label: 'Total Points',
    value: stats?.total_points || 0,
    icon: Trophy,
    iconColor: 'text-temple-gold',
    containerClass: 'icon-container-gold',
    link: '/challenges'
  }
]

  const quickActions = [
    {
      title: "Today's Devotional",
      description: "Start your day with scripture",
      icon: BookOpen,
      link: '/devotionals',
      color: 'from-temple-purple to-temple-purple-dark'
    },
    {
      title: 'AI Recipe Generator',
      description: 'Create a faith-inspired meal',
      icon: ChefHat,
      link: '/recipes',
      color: 'from-temple-gold to-temple-gold-dark'
    }
  ]

  const TimeIcon = timeIcon

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 lg:pb-8">
      {/* Upgrade Banner */}
      <UpgradeBanner />
      
      {/* Welcome Section */}
      <div className="welcome-card animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 ${
              isDark 
                ? 'bg-temple-gold/10 text-temple-gold' 
                : 'bg-temple-purple/10 text-temple-purple'
            }`}>
              <TimeIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{greeting}</span>
            </div>
      <h1 className={`text-3xl md:text-4xl font-display font-bold mb-2 ${
        isDark ? 'gradient-text-gold' : 'gradient-text'
      }`}>
        Welcome back, {profile?.full_name?.split(' ')[0] || 'Friend'}!
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Continue honoring your temple today. You're doing amazing! 💜
      </p>
    </div>
    <div className="flex-shrink-0">
      <div className={`relative ${isDark ? 'animate-glow' : ''}`}>
        <img 
          src="/logo.png" 
          alt="Temple Keepers" 
          className="w-24 h-24 object-contain animate-float"
        />
      </div>
    </div>
  </div>
</div>

           {/* Stats Grid */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
  {userStats.map((stat, index) => {
    const Icon = stat.icon
    return (
      <Link
        key={index}
        to={stat.link}
        className="stat-card group text-center cursor-pointer hover:scale-105 transition-transform"
      >
        <div className={`icon-container ${stat.containerClass} mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto`}>
          <Icon className={`w-6 h-6 ${stat.iconColor}`} />
        </div>
        <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
          {stat.value}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {stat.label}
        </p>
      </Link>
    )
  })}
</div>

     {/* Daily Scripture */}
<div className="scripture-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
  <div className="flex items-start gap-5 relative z-10">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
      isDark 
        ? 'bg-gradient-to-br from-temple-purple to-temple-purple-dark shadow-lg shadow-temple-purple/30' 
        : 'bg-gradient-to-br from-temple-purple to-temple-purple-dark'
    }`}>
      <Quote className="w-7 h-7 text-white" />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-temple-gold" />
        <h3 className="text-sm font-semibold text-temple-gold uppercase tracking-wider">
          Today's Scripture
        </h3>
      </div>
      <p className="devotional-verse mb-4">
        "{todayScripture.verse}"
      </p>
      <p className="devotional-reference">
        — {todayScripture.reference}
      </p>
    </div>
  </div>
</div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <Link
              key={index}
              to={action.link}
              className="glass-card rounded-2xl p-6 group hover:shadow-glass-lg transition-all duration-300 animate-fade-in border-2 border-white/50 dark:border-gray-700 hover:border-temple-purple/50"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{action.title}</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{action.description}</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-temple-gold group-hover:text-temple-purple group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Wellness Tips */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 animate-fade-in border-2 border-white/50 dark:border-gray-700" style={{ animationDelay: '0.5s' }}>
          <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-4 shadow-md">
            <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-base">Daily Goal</h4>
          <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
            Aim for 8 glasses of water today. Your body is a temple worth hydrating!
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 animate-fade-in border-2 border-white/50 dark:border-gray-700" style={{ animationDelay: '0.6s' }}>
          <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-4 shadow-md">
            <Leaf className="w-6 h-6 text-temple-purple dark:text-temple-purple-light" />
          </div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-base">Self-Care Reminder</h4>
          <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
            Take a moment to breathe deeply and thank God for this day.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 animate-fade-in border-2 border-white/50 dark:border-gray-700" style={{ animationDelay: '0.7s' }}>
          <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mb-4 shadow-md">
            <TrendingUp className="w-6 h-6 text-temple-gold dark:text-temple-gold-light" />
          </div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-base">Progress Insight</h4>
          <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
            Every small step honors God. Keep moving forward in faith!
          </p>
        </div>
      </div>

      {/* Active Challenge Card */}
      {activeChallenge && (
        <Link 
          to={`/challenges/${activeChallenge.challenge?.slug}`}
          className={`block rounded-2xl p-5 transition-all hover:-translate-y-1 ${
            isDark 
              ? 'bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/20' 
              : 'bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className={`text-xs font-medium ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                  Active Challenge
                </p>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {activeChallenge.challenge?.title}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Day {activeChallenge.current_day} of {activeChallenge.challenge?.duration_days}
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
        </Link>
      )}
    </div>
  )
}

export default Dashboard
