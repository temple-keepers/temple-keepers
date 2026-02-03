import { useState } from 'react'
import { X, UtensilsCrossed } from 'lucide-react'

const MEAL_TYPES = [
  { value: 'Breakfast', label: 'Breakfast' },
  { value: 'Lunch', label: 'Lunch' },
  { value: 'Dinner', label: 'Dinner' },
  { value: 'Snack', label: 'Snack' }
]

export const MealLogModal = ({ isOpen, onClose, onSave }) => {
  const [mealType, setMealType] = useState('Breakfast')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!description.trim()) {
      return // Require description
    }

    setSaving(true)
    
    // Build entry data
    const entryData = {
      meal_type: mealType,
      description: description.trim()
    }

    await onSave(entryData)
    
    // Reset form
    setMealType('Breakfast')
    setDescription('')
    setSaving(false)
    onClose()
  }

  const handleClose = () => {
    setMealType('Breakfast')
    setDescription('')
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-temple-gold to-temple-gold-dark flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-display font-bold gradient-text-gold dark:gradient-text">
            Log a Meal
          </h2>
        </div>

        {/* Meal type selection */}
        <div className="mb-6">
          <label className="form-label mb-2">Meal Type</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="form-input"
          >
            {MEAL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Meal description */}
        <div className="mb-6">
          <label className="form-label mb-2">
            What did you eat?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input resize-none"
            rows={3}
            placeholder="E.g., Scrambled eggs, whole wheat toast, and orange juice"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            No need to count calories—just notice and acknowledge.
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
            className="btn-gold flex-1"
            disabled={!description.trim() || saving}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
              'Save Meal'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
