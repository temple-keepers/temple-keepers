import { useState } from 'react'
import { X, Heart } from 'lucide-react'

const MOODS = [
  { value: 'low', label: 'Low', emoji: '😔' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'settled', label: 'Settled', emoji: '😌' },
  { value: 'uplifted', label: 'Uplifted', emoji: '😊' }
]

export const CheckInModal = ({ isOpen, onClose, onSave }) => {
  const [selectedMood, setSelectedMood] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!selectedMood) {
      return // Require mood selection
    }

    setSaving(true)
    
    // Build entry data
    const entryData = {
      mood: selectedMood,
      ...(note && { note })
    }

    await onSave(entryData)
    
    // Reset form
    setSelectedMood('')
    setNote('')
    setSaving(false)
    onClose()
  }

  const handleClose = () => {
    setSelectedMood('')
    setNote('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-card p-6 md:p-8 w-full max-w-md relative animate-fade-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-temple-purple to-temple-purple-dark flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-display font-bold gradient-text">
            Quick Check-In
          </h2>
        </div>

        {/* Mood selection */}
        <div className="mb-6">
          <label className="form-label mb-3">How are you feeling?</label>
          <div className="grid grid-cols-2 gap-3">
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200
                  ${selectedMood === mood.value
                    ? 'border-temple-purple dark:border-temple-gold bg-temple-purple/10 dark:bg-temple-gold/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-temple-purple/50 dark:hover:border-temple-gold/50'
                  }
                `}
              >
                <div className="text-2xl mb-1">{mood.emoji}</div>
                <div className={`text-sm font-medium ${
                  selectedMood === mood.value 
                    ? 'text-temple-purple dark:text-temple-gold' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {mood.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Optional note */}
        <div className="mb-6">
          <label className="form-label mb-2">
            Optional note or prayer
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="form-input resize-none"
            rows={3}
            placeholder="What's on your heart today?"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This is just for you. Share as much or as little as you'd like.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="btn-secondary flex-1"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary flex-1"
            disabled={!selectedMood || saving}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
              'Save Check-In'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
