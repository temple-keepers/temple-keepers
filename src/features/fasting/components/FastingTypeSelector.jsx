import { useState } from 'react'
import { X, Info, Clock, Apple, Book } from 'lucide-react'
import toast from 'react-hot-toast'

const FASTING_TYPES = {
  no_food: {
    name: 'No-Food Fast',
    icon: Book,
    shortDesc: 'No solid food during your chosen fast period',
    description: 'This option heightens spiritual alertness and dependence on God. Water encouraged. Best suited to those already familiar with fasting.',
    examples: ['Full-day fasts', 'Repeated daily fast windows', 'Specific set days'],
    difficulty: 'Advanced',
    color: 'purple'
  },
  time_window: {
    name: 'Time-Based Eating Window',
    icon: Clock,
    shortDesc: 'Eat only within a set daily window',
    description: 'Hunger becomes a reminder to turn your heart toward the Lord, building discipline without strain.',
    examples: ['8-hour window (12pm-8pm)', '10-hour window (10am-8pm)', '12-hour window (8am-8pm)'],
    difficulty: 'Moderate',
    color: 'blue'
  },
  daniel_fast: {
    name: 'Daniel Fast',
    icon: Apple,
    shortDesc: 'Plant-based, simple foods only',
    description: 'Simplicity reduces distraction and supports prayer and clarity. The minimum standard for this fast.',
    examples: ['Vegetables, fruits, whole grains', 'Beans, lentils, nuts, seeds', 'Water and herbal teas'],
    difficulty: 'Beginner-Friendly',
    color: 'green'
  }
}

export const FastingTypeSelector = ({ onSelect, onClose, selectedType = null }) => {
  const [selected, setSelected] = useState(selectedType)
  const [showDetails, setShowDetails] = useState(null)
  const [windowStart, setWindowStart] = useState('12:00')
  const [windowEnd, setWindowEnd] = useState('20:00')

  const lifestyleOptions = [
    { key: 'socialMedia', title: 'Social media' },
    { key: 'newsConsumption', title: 'News consumption' },
    { key: 'streaming', title: 'Streaming / binge-watching' },
    { key: 'notifications', title: 'Non-essential notifications' },
    { key: 'lateNightPhone', title: 'Late-night phone use' },
    { key: 'backgroundNoise', title: 'Background noise (music, radio, podcasts)' },
    { key: 'onlineShopping', title: 'Online shopping / browsing' },
    { key: 'complaining', title: 'Complaining or grumbling' },
    { key: 'negativeSelfTalk', title: 'Negative self-talk' },
    { key: 'peoplePleasing', title: 'People-pleasing' },
    { key: 'emotionalEating', title: 'Emotional eating (awareness fast)' },
    { key: 'overworking', title: 'Overworking' },
    { key: 'multitasking', title: 'Multitasking' },
    { key: 'arguments', title: 'Unnecessary arguments' },
    { key: 'gossip', title: 'Gossip or unedifying talk' }
  ]

  const [lifestyleCommitments, setLifestyleCommitments] = useState(() =>
    Object.fromEntries(lifestyleOptions.map(option => [option.key, false]))
  )

  const handleConfirm = () => {
    if (!selected) {
      toast.error('Please select a fasting type')
      return
    }

    const hasLifestyleSelection = Object.values(lifestyleCommitments).some(Boolean)
    if (!hasLifestyleSelection) {
      toast.error('Please select at least one lifestyle fast')
      return
    }

    const result = {
      fasting_type: selected,
      fasting_window: selected === 'time_window' ? `${windowStart}-${windowEnd}` : null,
      lifestyle_commitments: { ...lifestyleCommitments }
    }

    onSelect(result)
  }

  const colorClasses = {
    purple: {
      card: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
      iconWrap: 'bg-purple-100 dark:bg-purple-900/30',
      icon: 'text-purple-600 dark:text-purple-400'
    },
    blue: {
      card: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
      iconWrap: 'bg-blue-100 dark:bg-blue-900/30',
      icon: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      card: 'border-green-500 bg-green-50 dark:bg-green-900/20',
      iconWrap: 'bg-green-100 dark:bg-green-900/30',
      icon: 'text-green-600 dark:text-green-400'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto shadow-xl my-6">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Choose Your Fasting Type
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Prayerfully select ONE food-related fast for the 14 days
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="p-5 space-y-4">
          {Object.entries(FASTING_TYPES).map(([key, type]) => {
            const Icon = type.icon
            const isSelected = selected === key
            const isShowingDetails = showDetails === key
            const colorStyle = colorClasses[type.color]

            return (
              <div key={key} className="space-y-2">
                {/* Option Card */}
                <button
                  onClick={() => setSelected(key)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? colorStyle.card
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? colorStyle.iconWrap
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isSelected
                          ? colorStyle.icon
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {type.name}
                        </h3>
                        <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs font-medium rounded-full">
                          {type.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {type.shortDesc}
                      </p>
                    </div>

                    {/* Info Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDetails(isShowingDetails ? null : key)
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Info className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Time Window Picker (for time_window type) */}
                  {isSelected && key === 'time_window' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Set Your Eating Window
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Start eating</label>
                          <input
                            type="time"
                            value={windowStart}
                            onChange={(e) => setWindowStart(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                          />
                        </div>
                        <span className="text-gray-400 dark:text-gray-500 font-medium pt-5">to</span>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Stop eating</label>
                          <input
                            type="time"
                            value={windowEnd}
                            onChange={(e) => setWindowEnd(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                          />
                        </div>
                      </div>
                      {(() => {
                        const [sh, sm] = windowStart.split(':').map(Number)
                        const [eh, em] = windowEnd.split(':').map(Number)
                        const hours = eh - sh + (em - sm) / 60
                        if (hours > 0 && hours <= 24) {
                          return (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                              {hours === Math.floor(hours) ? hours : hours.toFixed(1)}-hour eating window · Fasting {24 - hours === Math.floor(24 - hours) ? 24 - hours : (24 - hours).toFixed(1)} hours
                            </p>
                          )
                        }
                        return null
                      })()}
                    </div>
                  )}
                </button>

                {/* Details Panel */}
                {isShowingDetails && (
                  <div className="ml-12 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {type.description}
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        Examples:
                      </p>
                      {type.examples.map((example, idx) => (
                        <p key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                          - {example}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Lifestyle Commitments */}
        <div className="px-5 pb-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-lg space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Lifestyle Fast Options (non-food)
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Select any that apply.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLifestyleCommitments(prev => (
                    Object.fromEntries(Object.keys(prev).map(key => [key, true]))
                  ))}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setLifestyleCommitments(prev => (
                    Object.fromEntries(Object.keys(prev).map(key => [key, false]))
                  ))}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lifestyleOptions.map((option) => {
                const checked = lifestyleCommitments[option.key]
                return (
                  <label
                    key={option.key}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      checked
                        ? 'border-temple-purple bg-temple-purple/5 dark:bg-temple-gold/10'
                        : 'border-gray-200 dark:border-gray-600 bg-white/60 dark:bg-gray-800/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setLifestyleCommitments(prev => ({ ...prev, [option.key]: e.target.checked }))}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-temple-purple focus:ring-temple-purple"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {option.title}
                      </p>
                      {option.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-5">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selected || !Object.values(lifestyleCommitments).some(Boolean)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-temple-purple dark:bg-temple-gold text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
