import { useState } from 'react'
import { Calendar, X } from 'lucide-react'

export const StartDateModal = ({ isOpen, onClose, onConfirm, programTitle }) => {
  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(today)
  const [startNow, setStartNow] = useState(true)

  const handleConfirm = () => {
    onConfirm(startNow ? today : startDate)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 rounded-full bg-temple-purple/20 dark:bg-temple-gold/20 flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-temple-purple dark:text-temple-gold" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Choose Your Start Date
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            When would you like to begin {programTitle}?
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {/* Start Today Option */}
          <button
            onClick={() => setStartNow(true)}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              startNow
                ? 'border-temple-purple dark:border-temple-gold bg-temple-purple/5 dark:bg-temple-gold/5'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  Start Today
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Begin your journey right now
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                startNow
                  ? 'border-temple-purple dark:border-temple-gold'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {startNow && (
                  <div className="w-3 h-3 rounded-full bg-temple-purple dark:bg-temple-gold" />
                )}
              </div>
            </div>
          </button>

          {/* Choose Date Option */}
          <button
            onClick={() => setStartNow(false)}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              !startNow
                ? 'border-temple-purple dark:border-temple-gold bg-temple-purple/5 dark:bg-temple-gold/5'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  Choose a Date
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Plan ahead and start later
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                !startNow
                  ? 'border-temple-purple dark:border-temple-gold'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {!startNow && (
                  <div className="w-3 h-3 rounded-full bg-temple-purple dark:bg-temple-gold" />
                )}
              </div>
            </div>
            
            {!startNow && (
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                className="form-input mt-2 w-full"
              />
            )}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 btn-primary"
          >
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  )
}
