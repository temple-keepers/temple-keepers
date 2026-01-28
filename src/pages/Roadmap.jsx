import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Calendar,
  ArrowLeft,
  ChefHat,
  BookOpen,
  Droplets,
  CalendarDays,
  CreditCard,
  Shield,
  Users,
  Bell,
  MessageCircle,
  Heart,
  Target,
  Zap,
  Share2,
  Smartphone,
  Globe,
  Brain,
  Trophy,
  Flame,
  BookHeart,
  Moon,
  Music,
  Camera,
  ShoppingCart,
  Dumbbell,
  ThumbsUp,
  Send
} from 'lucide-react'

const Roadmap = () => {
  const { isDark } = useTheme()
  const [activeFilter, setActiveFilter] = useState('all')
  const [featureRequest, setFeatureRequest] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const statuses = {
    completed: { label: 'Completed', color: 'green', icon: CheckCircle },
    in_progress: { label: 'In Progress', color: 'blue', icon: Clock },
    planned: { label: 'Planned', color: 'purple', icon: Calendar },
    considering: { label: 'Considering', color: 'amber', icon: Sparkles }
  }

  const roadmapItems = [
    // Completed
    {
      id: 1,
      title: 'User Authentication',
      description: 'Secure login, signup, and password reset functionality',
      status: 'completed',
      icon: Shield,
      category: 'core',
      completedDate: 'January 2026'
    },
    {
      id: 2,
      title: 'AI Recipe Generator',
      description: 'Generate healthy recipes with scripture-based reflections using AI',
      status: 'completed',
      icon: ChefHat,
      category: 'feature',
      completedDate: 'January 2026'
    },
    {
      id: 3,
      title: 'Daily Devotionals',
      description: 'Faith-centered wellness devotionals with multiple themes',
      status: 'completed',
      icon: BookOpen,
      category: 'feature',
      completedDate: 'January 2026'
    },
    {
      id: 4,
      title: 'Water Tracker',
      description: 'Track daily water intake with visual progress and streaks',
      status: 'completed',
      icon: Droplets,
      category: 'feature',
      completedDate: 'January 2026'
    },
    {
      id: 5,
      title: 'Meal Planner',
      description: 'Weekly meal planning with saved recipes and shopping lists',
      status: 'completed',
      icon: CalendarDays,
      category: 'feature',
      completedDate: 'January 2026'
    },
    {
      id: 6,
      title: 'Subscription & Payments',
      description: 'Stripe integration for premium subscriptions',
      status: 'completed',
      icon: CreditCard,
      category: 'core',
      completedDate: 'January 2026'
    },
    {
      id: 7,
      title: 'Admin Dashboard',
      description: 'Backend for managing users, content, and analytics',
      status: 'completed',
      icon: Users,
      category: 'admin',
      completedDate: 'January 2026'
    },
    {
      id: 8,
      title: 'Dark Mode',
      description: 'Beautiful dark theme for comfortable nighttime use',
      status: 'completed',
      icon: Moon,
      category: 'ux',
      completedDate: 'January 2026'
    },

    // In Progress
    {
      id: 9,
      title: 'Weekly Challenges',
      description: 'Gamified weekly wellness challenges with rewards',
      status: 'in_progress',
      icon: Trophy,
      category: 'feature',
      eta: 'February 2026'
    },
    {
      id: 10,
      title: 'Prayer Journal',
      description: 'Private space to record prayers, gratitude, and reflections',
      status: 'in_progress',
      icon: BookHeart,
      category: 'feature',
      eta: 'February 2026'
    },

    // Planned
    {
      id: 11,
      title: 'Push Notifications',
      description: 'Reminders for water, meals, devotionals, and challenges',
      status: 'planned',
      icon: Bell,
      category: 'feature',
      eta: 'Q1 2026'
    },
    {
      id: 12,
      title: 'Community Features',
      description: 'Connect with other temple keepers, share recipes and encouragement',
      status: 'planned',
      icon: Users,
      category: 'feature',
      eta: 'Q1 2026'
    },
    {
      id: 13,
      title: 'Progress Analytics',
      description: 'Detailed charts and insights on your wellness journey',
      status: 'planned',
      icon: Target,
      category: 'feature',
      eta: 'Q1 2026'
    },
    {
      id: 14,
      title: 'Recipe Collections',
      description: 'Curated recipe collections by theme, season, or goal',
      status: 'planned',
      icon: ChefHat,
      category: 'feature',
      eta: 'Q2 2026'
    },
    {
      id: 15,
      title: 'Fasting Tracker',
      description: 'Track intermittent fasting and Daniel Fast journeys',
      status: 'planned',
      icon: Flame,
      category: 'feature',
      eta: 'Q2 2026'
    },
    {
      id: 16,
      title: 'Mobile App (iOS & Android)',
      description: 'Native mobile apps for a seamless on-the-go experience',
      status: 'planned',
      icon: Smartphone,
      category: 'platform',
      eta: 'Q2 2026'
    },

    // Considering
    {
      id: 17,
      title: 'Workout Library',
      description: 'Faith-based exercise routines and movement guides',
      status: 'considering',
      icon: Dumbbell,
      category: 'feature'
    },
    {
      id: 18,
      title: 'Sleep Tracker',
      description: 'Log and improve your sleep quality with biblical principles',
      status: 'considering',
      icon: Moon,
      category: 'feature'
    },
    {
      id: 19,
      title: 'Worship Playlists',
      description: 'Curated worship music for cooking, exercise, and meditation',
      status: 'considering',
      icon: Music,
      category: 'feature'
    },
    {
      id: 20,
      title: 'Food Photo Journal',
      description: 'Snap and log your meals with automatic nutritional insights',
      status: 'considering',
      icon: Camera,
      category: 'feature'
    },
    {
      id: 21,
      title: 'Grocery Delivery Integration',
      description: 'Order ingredients directly from your meal plan',
      status: 'considering',
      icon: ShoppingCart,
      category: 'integration'
    },
    {
      id: 22,
      title: 'AI Health Coach',
      description: 'Personalized AI-powered wellness coaching and advice',
      status: 'considering',
      icon: Brain,
      category: 'feature'
    },
    {
      id: 23,
      title: 'Social Sharing',
      description: 'Share your achievements and recipes on social media',
      status: 'considering',
      icon: Share2,
      category: 'feature'
    },
    {
      id: 24,
      title: 'Multi-language Support',
      description: 'Temple Keepers in Spanish, French, and more',
      status: 'considering',
      icon: Globe,
      category: 'platform'
    }
  ]

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'completed', label: 'Completed' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'planned', label: 'Planned' },
    { id: 'considering', label: 'Considering' }
  ]

  const filteredItems = activeFilter === 'all' 
    ? roadmapItems 
    : roadmapItems.filter(item => item.status === activeFilter)

  const groupedItems = {
    completed: filteredItems.filter(i => i.status === 'completed'),
    in_progress: filteredItems.filter(i => i.status === 'in_progress'),
    planned: filteredItems.filter(i => i.status === 'planned'),
    considering: filteredItems.filter(i => i.status === 'considering')
  }

  const handleSubmitRequest = (e) => {
    e.preventDefault()
    if (!featureRequest.trim()) return
    
    // In production, send this to your backend or email
    console.log('Feature request:', featureRequest)
    setSubmitted(true)
    setFeatureRequest('')
    
    setTimeout(() => setSubmitted(false), 3000)
  }

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-500',
      in_progress: 'bg-blue-500',
      planned: 'bg-purple-500',
      considering: 'bg-amber-500'
    }
    return colors[status]
  }

  const getStatusBg = (status) => {
    const colors = {
      completed: isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200',
      in_progress: isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200',
      planned: isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200',
      considering: isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'
    }
    return colors[status]
  }

  const getStatusText = (status) => {
    const colors = {
      completed: 'text-green-500',
      in_progress: 'text-blue-500',
      planned: 'text-purple-500',
      considering: 'text-amber-500'
    }
    return colors[status]
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`border-b ${isDark ? 'border-gray-800 bg-gray-900/80' : 'border-gray-200 bg-white/80'} backdrop-blur-xl sticky top-0 z-10`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link 
            to="/"
            className={`inline-flex items-center gap-2 text-sm ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
            isDark ? 'bg-temple-purple/20 text-temple-purple' : 'bg-temple-purple/10 text-temple-purple'
          }`}>
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Product Roadmap</span>
          </div>
          
          <h1 className={`text-4xl md:text-5xl font-display font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            What We're{' '}
            <span className="bg-gradient-to-r from-temple-purple to-temple-gold bg-clip-text text-transparent">
              Building
            </span>
          </h1>
          
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            See what's completed, in progress, and coming soon to Temple Keepers. 
            Your feedback shapes our journey!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {Object.entries(statuses).map(([key, status]) => {
            const count = roadmapItems.filter(i => i.status === key).length
            const Icon = status.icon
            return (
              <div 
                key={key}
                className={`p-4 rounded-2xl text-center ${
                  isDark ? 'bg-gray-800' : 'bg-white shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                  getStatusBg(key)
                }`}>
                  <Icon className={`w-5 h-5 ${getStatusText(key)}`} />
                </div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {count}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {status.label}
                </p>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-temple-purple to-temple-gold text-white'
                  : isDark 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {filter.label}
              {filter.id !== 'all' && (
                <span className="ml-2 opacity-60">
                  ({roadmapItems.filter(i => i.status === filter.id).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Roadmap Content */}
        <div className="space-y-12">
          {activeFilter === 'all' ? (
            // Show grouped by status
            Object.entries(groupedItems).map(([status, items]) => {
              if (items.length === 0) return null
              const statusInfo = statuses[status]
              const StatusIcon = statusInfo.icon
              
              return (
                <div key={status}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusBg(status)}`}>
                      <StatusIcon className={`w-5 h-5 ${getStatusText(status)}`} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {statusInfo.label}
                      </h2>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {items.length} {items.length === 1 ? 'feature' : 'features'}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => {
                      const Icon = item.icon
                      return (
                        <div 
                          key={item.id}
                          className={`p-5 rounded-2xl border transition-all hover:-translate-y-1 ${
                            isDark 
                              ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                              : 'bg-white border-gray-200 hover:shadow-lg'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              getStatusBg(item.status)
                            }`}>
                              <Icon className={`w-6 h-6 ${getStatusText(item.status)}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {item.title}
                                </h3>
                              </div>
                              <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {item.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusBg(item.status)} ${getStatusText(item.status)}`}>
                                  {statusInfo.label}
                                </span>
                                {(item.completedDate || item.eta) && (
                                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {item.completedDate || `ETA: ${item.eta}`}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          ) : (
            // Show filtered items
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const Icon = item.icon
                const statusInfo = statuses[item.status]
                return (
                  <div 
                    key={item.id}
                    className={`p-5 rounded-2xl border transition-all hover:-translate-y-1 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                        : 'bg-white border-gray-200 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        getStatusBg(item.status)
                      }`}>
                        <Icon className={`w-6 h-6 ${getStatusText(item.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.title}
                        </h3>
                        <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                        {(item.completedDate || item.eta) && (
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {item.completedDate || `ETA: ${item.eta}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Feature Request Section */}
        <div className={`mt-16 rounded-3xl p-8 ${
          isDark 
            ? 'bg-gradient-to-br from-temple-purple/20 to-temple-gold/10 border border-temple-purple/20' 
            : 'bg-gradient-to-br from-temple-purple/10 to-temple-gold/10'
        }`}>
          <div className="max-w-2xl mx-auto text-center">
            <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
              isDark ? 'bg-temple-gold/20' : 'bg-temple-gold/10'
            }`}>
              <MessageCircle className="w-8 h-8 text-temple-gold" />
            </div>
            
            <h2 className={`text-2xl font-display font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Have a Feature Idea?
            </h2>
            
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              We'd love to hear your suggestions! Your feedback helps shape the future of Temple Keepers.
            </p>

            {submitted ? (
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  <ThumbsUp className="w-5 h-5" />
                  <span>Thank you! We've received your suggestion.</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={featureRequest}
                  onChange={(e) => setFeatureRequest(e.target.value)}
                  placeholder="Describe your feature idea..."
                  className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-temple-purple' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-temple-purple'
                  } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
                />
                <button
                  type="submit"
                  disabled={!featureRequest.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className={`mt-12 p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Status Legend
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(statuses).map(([key, status]) => {
              const Icon = status.icon
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusBg(key)}`}>
                    <Icon className={`w-4 h-4 ${getStatusText(key)}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {status.label}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {key === 'completed' && 'Released & available'}
                      {key === 'in_progress' && 'Currently building'}
                      {key === 'planned' && 'Coming soon'}
                      {key === 'considering' && 'Under consideration'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-semibold hover:opacity-90 transition-all"
          >
            <Heart className="w-5 h-5" />
            Join Temple Keepers Today
          </Link>
          <p className={`mt-3 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Start your 7-day free trial
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} py-8 mt-12`}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Last updated: January 2026 • Roadmap subject to change based on user feedback and priorities
          </p>
        </div>
      </div>
    </div>
  )
}

export default Roadmap