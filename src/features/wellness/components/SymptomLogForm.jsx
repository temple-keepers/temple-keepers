import { useState } from 'react'
import { X, Activity, Clock, Calendar } from 'lucide-react'

export const SymptomLogForm = ({ existingSymptom, onSave, onClose }) => {
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toTimeString().slice(0, 5)
  
  const [formData, setFormData] = useState({
    log_date: existingSymptom?.log_date || today,
    log_time: existingSymptom?.log_time || now,
    symptom: existingSymptom?.symptom || '',
    severity: existingSymptom?.severity || 5,
    notes: existingSymptom?.notes || '',
    duration_minutes: existingSymptom?.duration_minutes || '',
  })

  const [saving, setSaving] = useState(false)

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
        step="1"
        value={formData[field]}
        onChange={(e) => handleChange(field, parseInt(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>Mild</span>
        <span>Moderate</span>
        <span>Severe</span>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
            Log Symptom
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <input
                type="date"
                required
                value={formData.log_date}
                onChange={(e) => handleChange('log_date', e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time
              </label>
              <input
                type="time"
                required
                value={formData.log_time}
                onChange={(e) => handleChange('log_time', e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Symptom Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Headache, Fatigue, Nausea"
              value={formData.symptom}
              onChange={(e) => handleChange('symptom', e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-temple-purple"
            />
          </div>

          <SliderInput 
            label="Severity" 
            field="severity" 
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any additional details..."
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-temple-purple"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 px-4 text-white bg-temple-purple hover:bg-temple-purple-dark disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors shadow-lg shadow-temple-purple/20"
            >
              {saving ? 'Saving...' : 'Save Symptom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
