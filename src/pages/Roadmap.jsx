import { Check, Clock, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PublicHeader } from '../components/PublicHeader'

export const Roadmap = () => {
  const navigate = useNavigate()

  const roadmapItems = [
    {
      status: 'live',
      title: 'Core Experience',
      items: [
        'Daily scripture devotionals with reflection',
        'Personalised greeting & encouragement on your home screen',
        'Dark mode & light mode toggle',
        'Install as an app on your phone (PWA)',
        'Mobile-friendly design throughout'
      ]
    },
    {
      status: 'live',
      title: 'Fasting Programs',
      items: [
        '14-day "Make Room for the Lord" guided fasting program',
        'Choose your fasting type: No-Food, Time-Based Window, or Daniel Fast',
        'Set your own custom eating window times',
        'Change your fasting type mid-program with grace',
        'Daily scripture, prayer, reflection questions & action steps',
        'Fasting compliance tracker with personal notes',
        'Lifestyle fast commitments (social media, screen time & more)',
        'Live Zoom session schedule & links',
        'Day-by-day progress tracking with completion badges'
      ]
    },
    {
      status: 'live',
      title: 'Recipes & Meal Planning',
      items: [
        'AI recipe generator across 10 cuisines',
        'Daniel Fast compliant recipe options',
        '7-day meal planner with drag-and-drop',
        'Generate up to 5 recipes at once',
        'Auto-generated shopping lists with bulk combined ingredients',
        'Personal pantry tracker — pantry items auto-checked on shopping lists',
        'Choose which week to plan for',
        'Save favourite recipes to your collection',
        'Detailed nutrition info, prep times & servings'
      ]
    },
    {
      status: 'live',
      title: 'Wellness Tracking',
      items: [
        'Daily wellness check-in (energy, sleep, mood, stress)',
        'Meal logging with hunger & satisfaction ratings',
        'Symptom tracker with severity & notes',
        'Recent activity timeline on your profile',
        'Progress stats & streaks'
      ]
    },
    {
      status: 'live',
      title: 'Community & Accountability',
      items: [
        'Community pods (small accountability groups)',
        'Discussion, prayer request, testimony & encouragement posts',
        'Prayer reactions (praying, amen, love)',
        'Anonymous posting option for sensitive requests'
      ]
    },
    {
      status: 'live',
      title: 'Notifications & Reminders',
      items: [
        'In-app notification bell with unread count',
        'Push notifications for reminders (browser & mobile)',
        'Morning devotional reminder at your chosen time',
        'Fasting window open/close alerts',
        'Live session reminders',
        'Customisable notification preferences'
      ]
    },
    {
      status: 'in-progress',
      title: 'Coming Soon',
      items: [
        'Achievement badges & milestone celebrations',
        'Weekly wellness insights & trends',
        'Email digest with your weekly summary',
        'Recipe ratings & reviews from the community',
        'Share your progress with friends'
      ]
    },
    {
      status: 'planned',
      title: 'On the Horizon',
      items: [
        'More guided programs (21-day journeys, seasonal fasts)',
        'Group challenges within pods',
        'Coaching & personalised guidance',
        'Church & group licences',
        'Recipe collections & themed meal plans',
        'Multi-language support'
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
            See what's live and what's coming next. We're building the most grace-filled, 
            faith-integrated wellness platform for Christians — and your feedback shapes what comes next.
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
