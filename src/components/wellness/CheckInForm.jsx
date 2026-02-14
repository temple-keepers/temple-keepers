import { useState, useEffect } from 'react'
import { X, Heart, Brain, Sparkles, Moon, Droplet, Dumbbell } from 'lucide-react'

export const CheckInForm = ({ existingCheckIn, onSave, onClose, variant = 'modal', showClose = true }) => {
  const today = new Date().toISOString().split('T')[0]
  const isModal = variant === 'modal'

  const buildInitialState = (checkIn) => ({
    check_in_date: checkIn?.check_in_date || today,
    // Physical
    energy_level: checkIn?.energy_level || 5,
    sleep_quality: checkIn?.sleep_quality || 5,
    sleep_hours: checkIn?.sleep_hours || 7,
    water_intake: checkIn?.water_intake || 8,
    exercise_minutes: checkIn?.exercise_minutes || 0,
    // Mental/Emotional
    mood: checkIn?.mood || 5,
    stress_level: checkIn?.stress_level || 5,
    // Spiritual
    prayer_time: checkIn?.prayer_time || 0,
    bible_reading: checkIn?.bible_reading || false,
    devotional_completed: checkIn?.devotional_completed || false,
    // Notes
    gratitude: checkIn?.gratitude || '',
    challenges: checkIn?.challenges || '',
    prayer_requests: checkIn?.prayer_requests || '',
    notes: checkIn?.notes || ''
  })

  const [formData, setFormData] = useState(buildInitialState(existingCheckIn))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFormData(buildInitialState(existingCheckIn))
  }, [existingCheckIn])

  const handleSliderChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: parseInt(value) }))
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(formData)
    } finally {
      setSaving(false)
    }
  }

  const SliderInput = ({ label, field, icon: Icon, min = 1, max = 10, unit = '' }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Icon className="w-4 h-4" />
          {label}
        </label>
        <span className="text-lg font-bold text-temple-purple dark:text-temple-gold">
          {formData[field]}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={unit === 'hrs' ? 0.5 : 1}
        value={formData[field]}
        onChange={(e) => handleSliderChange(field, e.target.value)}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-temple-purple dark:accent-temple-gold"
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  )

  const wrapperClass = isModal
    ? 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
    : 'min-h-screen bg-gray-50 dark:bg-gray-900'

  const cardClass = isModal
    ? 'bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'
    : 'max-w-3xl mx-auto px-4 py-8'

  const innerCardClass = isModal ? '' : 'glass-card overflow-hidden'

  return (
    <div className={wrapperClass}>
      <div className={cardClass}>
        <div className={innerCardClass}>
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {existingCheckIn ? 'Review Check-In' : 'Daily Check-In'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {new Date(formData.check_in_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              {showClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Physical Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Physical Wellness
              </h3>

              <SliderInput label="Energy Level" field="energy_level" icon={Sparkles} />
              <SliderInput label="Sleep Quality" field="sleep_quality" icon={Moon} />
              <SliderInput label="Sleep Hours" field="sleep_hours" icon={Moon} min={0} max={12} unit="hrs" />
              <SliderInput label="Water Intake" field="water_intake" icon={Droplet} min={0} max={20} unit=" cups" />
              <SliderInput label="Exercise" field="exercise_minutes" icon={Dumbbell} min={0} max={120} unit=" min" />
            </div>

            {/* Mental/Emotional Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Mental and Emotional
              </h3>

              <SliderInput label="Mood" field="mood" icon={Heart} />
              <SliderInput label="Stress Level" field="stress_level" icon={Brain} />
            </div>

            {/* Spiritual Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Spiritual Practices
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prayer Time (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.prayer_time}
                  onChange={(e) => handleInputChange('prayer_time', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.bible_reading}
                    onChange={(e) => handleInputChange('bible_reading', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-temple-purple focus:ring-temple-purple dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Bible Reading</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.devotional_completed}
                    onChange={(e) => handleInputChange('devotional_completed', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-temple-purple focus:ring-temple-purple dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Devotional</span>
                </label>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reflections</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  What are you grateful for today?
                </label>
                <textarea
                  value={formData.gratitude}
                  onChange={(e) => handleInputChange('gratitude', e.target.value)}
                  rows="2"
                  placeholder="I'm grateful for..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Any challenges or struggles?
                </label>
                <textarea
                  value={formData.challenges}
                  onChange={(e) => handleInputChange('challenges', e.target.value)}
                  rows="2"
                  placeholder="Today's challenges..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prayer Requests
                </label>
                <textarea
                  value={formData.prayer_requests}
                  onChange={(e) => handleInputChange('prayer_requests', e.target.value)}
                  rows="2"
                  placeholder="Please pray for..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows="3"
                  placeholder="Any other thoughts..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {showClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-temple-purple dark:bg-temple-gold text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Check-In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
