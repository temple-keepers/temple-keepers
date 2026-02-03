import { Check, Clock, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PublicHeader } from '../components/PublicHeader'

export const Roadmap = () => {
  const navigate = useNavigate()

  const roadmapItems = [
    {
      status: 'live',
      title: 'Core Platform',
      items: [
        'Daily scripture devotionals',
        'AI-powered program creation',
        'Grace-based day locking',
        'Daily check-ins & meal logging',
        'AI recipe generator (10 cuisines)',
        'Recipe portion adjustment',
        'Dark mode',
        'Mobile responsive'
      ]
    },
    {
      status: 'in-progress',
      title: 'Q1 2026 - Community & Engagement',
      items: [
        'My Favorites page',
        'Shopping list generator',
        'Print recipe feature',
        'Email notifications',
        'Recent activity dashboard',
        'Progress insights'
      ]
    },
    {
      status: 'planned',
      title: 'Q2 2026 - Advanced Features',
      items: [
        '7-day AI meal planner',
        'Community pods (small groups)',
        'Achievement badges',
        'Share progress to social',
        'Recipe collections',
        'Cooking timer mode'
      ]
    },
    {
      status: 'planned',
      title: 'Q3 2026 - Mobile & Premium',
      items: [
        'Progressive Web App (PWA)',
        'Premium membership tiers',
        'Camera meal logging',
        'Voice commands',
        'Offline mode',
        'Push notifications'
      ]
    },
    {
      status: 'future',
      title: 'Q4 2026 & Beyond',
      items: [
        'Coaching marketplace',
        'Church/group licenses',
        'Recipe ratings & reviews',
        'Weekly challenges',
        'Multi-language support',
        'Custom program builder'
      ]
    }
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
            <Check className="w-4 h-4" />
            Live Now
          </span>
        )
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium">
            <Clock className="w-4 h-4" />
            In Progress
          </span>
        )
      case 'planned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Planned
          </span>
        )
      case 'future':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Future
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <PublicHeader />

      {/* Page Title */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-4">
            Product Roadmap
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
            See what we're building for you. Our mission is to create the most grace-filled, 
            faith-integrated wellness platform for Christians.
          </p>
        </div>
      </div>

      {/* Roadmap */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {roadmapItems.map((section, index) => (
            <div key={index} className="glass-card p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {section.title}
                  </h2>
                </div>
                {getStatusBadge(section.status)}
              </div>

              <ul className="space-y-3">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      section.status === 'live'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400'
                    }`} />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Feedback CTA */}
        <div className="mt-12 glass-card p-8 text-center bg-gradient-to-br from-temple-purple/5 to-temple-gold/5">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Have a Feature Request?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We'd love to hear what features would be most valuable to you
          </p>
          <button
            onClick={() => window.location.href = 'mailto:hello@templekeepers.com'}
            className="btn-primary"
          >
            Send Us Feedback
          </button>
        </div>
      </div>
    </div>
  )
}
