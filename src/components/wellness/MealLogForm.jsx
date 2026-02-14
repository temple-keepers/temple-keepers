import { useState } from 'react'
import { X, Camera } from 'lucide-react'

export const MealLogForm = ({ existingMeal, onSave, onClose, variant = 'modal', showClose = true }) => {
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toTimeString().slice(0, 5)
  const isModal = variant === 'modal'

  const [formData, setFormData] = useState({
    meal_date: existingMeal?.meal_date || today,
    meal_time: existingMeal?.meal_time || now,
    meal_type: existingMeal?.meal_type || 'breakfast',
    description: existingMeal?.description || '',
    portion_size: existingMeal?.portion_size || '',
    hunger_before: existingMeal?.hunger_before || 5,
    hunger_after: existingMeal?.hunger_after || 5,
    satisfaction: existingMeal?.satisfaction || 5,
    location: existingMeal?.location || '',
    notes: existingMeal?.notes || ''
  })

  const [saving, setSaving] = useState(false)

  const mealTypeOptions = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Healthy Snack' },
    { value: 'dessert', label: 'Healthy Dessert' }
  ]

  const handleChange = (field, value) => {
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

  const SliderInput = ({ label, field, min = 1, max = 10 }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <span className="text-lg font-bold text-temple-purple dark:text-temple-gold">
          {formData[field]}/10
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={formData[field]}
        onChange={(e) => handleChange(field, parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-temple-purple dark:accent-temple-gold"
      />
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
          <div className="sticky top-0 bg-gradient-to-br from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {existingMeal ? 'Review Meal Log' : 'Log Meal'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Track your nutrition and how food makes you feel
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
            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.meal_date}
                  onChange={(e) => handleChange('meal_date', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time
                </label>
                <input
                  type="time"
                  value={formData.meal_time}
                  onChange={(e) => handleChange('meal_time', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Meal Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Meal Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {mealTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('meal_type', option.value)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                      formData.meal_type === option.value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                What did you eat? *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
                rows="3"
                placeholder="E.g., Grilled chicken salad with quinoa, olive oil dressing, and roasted vegetables"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              />
            </div>

            {/* Portion Size and Location */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Portion Size
                </label>
                <input
                  type="text"
                  value={formData.portion_size}
                  onChange={(e) => handleChange('portion_size', e.target.value)}
                  placeholder="E.g., 1 plate, 2 cups"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="E.g., Home, Restaurant"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Hunger and Satisfaction */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">How did you feel?</h3>

              <SliderInput label="Hunger Before Eating" field="hunger_before" />
              <SliderInput label="Hunger After Eating" field="hunger_after" />
              <SliderInput label="Meal Satisfaction" field="satisfaction" />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows="2"
                placeholder="How did this meal make you feel? Any symptoms or reactions?"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              />
            </div>

            {/* Photo Upload Placeholder */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Photo (Coming Soon)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Photo upload coming in next update
                </p>
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
                disabled={saving || !formData.description}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Meal Log'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
