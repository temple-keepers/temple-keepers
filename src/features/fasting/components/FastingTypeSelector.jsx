import { useState } from 'react'
import { X, Info, Clock, Apple, Book } from 'lucide-react'

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
  const [timeWindow, setTimeWindow] = useState('12:00-20:00') // Default 12pm-8pm

  const handleConfirm = () => {
    if (!selected) {
      alert('Please select a fasting type')
      return
    }

    const result = {
      fasting_type: selected,
      fasting_window: selected === 'time_window' ? timeWindow : null
    }

    onSelect(result)
  }

  const colorClasses = {
    purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
    blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    green: 'border-green-500 bg-green-50 dark:bg-green-900/20'
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Choose Your Fasting Type
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
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
        <div className="p-6 space-y-4">
          {Object.entries(FASTING_TYPES).map(([key, type]) => {
            const Icon = type.icon
            const isSelected = selected === key
            const isShowingDetails = showDetails === key

            return (
              <div key={key} className="space-y-2">
                {/* Option Card */}
                <button
                  onClick={() => setSelected(key)}
                  className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? `${colorClasses[type.color]} border-${type.color}-500`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-750'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isSelected 
                        ? `bg-${type.color}-100 dark:bg-${type.color}-900/30` 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isSelected 
                          ? `text-${type.color}-600 dark:text-${type.color}-400` 
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Eating Window
                      </label>
                      <select
                        value={timeWindow}
                        onChange={(e) => setTimeWindow(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="08:00-16:00">8am - 4pm (8 hours)</option>
                        <option value="10:00-18:00">10am - 6pm (8 hours)</option>
                        <option value="12:00-20:00">12pm - 8pm (8 hours)</option>
                        <option value="08:00-18:00">8am - 6pm (10 hours)</option>
                        <option value="10:00-20:00">10am - 8pm (10 hours)</option>
                        <option value="08:00-20:00">8am - 8pm (12 hours)</option>
                      </select>
                    </div>
                  )}
                </button>

                {/* Details Panel */}
                {isShowingDetails && (
                  <div className="ml-16 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {type.description}
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        Examples:
                      </p>
                      {type.examples.map((example, idx) => (
                        <p key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                          • {example}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Important Note */}
        <div className="px-6 pb-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> Everyone also participates in the Media & Noise Fast and Convenience & Comfort Fast. 
              Your choice here is for your ONE food-related fast.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className="flex-1 px-6 py-3 rounded-xl bg-temple-purple dark:bg-temple-gold text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue with {selected ? FASTING_TYPES[selected].name : 'Selection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
