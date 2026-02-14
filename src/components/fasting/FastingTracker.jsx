import { useState, useEffect } from 'react'
import { Check, X, Apple, Volume2, Smartphone, Save } from 'lucide-react'
import { fastingService } from '../../services/fastingService'
import toast from 'react-hot-toast'

const FASTING_TYPE_NAMES = {
  no_food: 'No-Food Fast',
  time_window: 'Time-Based Window',
  daniel_fast: 'Daniel Fast'
}

export const FastingTracker = ({ userId, enrollmentId, fastingType, fastingWindow, date, onSave }) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    food_fast_compliant: null,
    food_fast_notes: '',
    media_fast_compliant: null,
    media_fast_notes: '',
    comfort_fast_compliant: null,
    comfort_fast_notes: '',
    overall_notes: ''
  })

  // Load existing log
  useEffect(() => {
    loadExistingLog()
  }, [userId, enrollmentId, date])

  const loadExistingLog = async () => {
    try {
      setLoading(true)
      const existingLog = await fastingService.getFastingLog(userId, enrollmentId, date)
      
      if (existingLog) {
        setFormData({
          food_fast_compliant: existingLog.food_fast_compliant,
          food_fast_notes: existingLog.food_fast_notes || '',
          media_fast_compliant: existingLog.media_fast_compliant,
          media_fast_notes: existingLog.media_fast_notes || '',
          comfort_fast_compliant: existingLog.comfort_fast_compliant,
          comfort_fast_notes: existingLog.comfort_fast_notes || '',
          overall_notes: existingLog.overall_notes || ''
        })
      }
    } catch (error) {
      console.error('Error loading fasting log:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      await fastingService.saveFastingLog(userId, enrollmentId, {
        log_date: date,
        ...formData
      })

      if (onSave) {
        onSave()
      }

      toast.success('Fasting log saved! ✅')
    } catch (error) {
      console.error('Error saving fasting log:', error)
      toast.error('Failed to save fasting log. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateCompliance = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateNotes = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-temple-purple dark:border-temple-gold mx-auto"></div>
        </div>
      </div>
    )
  }

  const ComplianceButton = ({ value, onClick, label }) => (
    <button
      onClick={() => onClick()}
      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
        value === true
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-500'
          : value === false
          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-2 border-red-500'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Today's Fasting Status
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Track your compliance with each aspect of the fast
        </p>
      </div>

      <div className="space-y-6">
        {/* Food Fast */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Apple className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Food Fast: {FASTING_TYPE_NAMES[fastingType]}
              </h4>
              {fastingType === 'time_window' && fastingWindow && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Eating window: {fastingWindow.split('-').map(t => {
                    const [h, m] = t.split(':')
                    const hour = parseInt(h)
                    const ampm = hour >= 12 ? 'pm' : 'am'
                    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
                    return m === '00' ? `${h12}${ampm}` : `${h12}:${m}${ampm}`
                  }).join(' – ')}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <ComplianceButton
              value={formData.food_fast_compliant === true ? true : null}
              onClick={() => updateCompliance('food_fast_compliant', true)}
              label="✓ Compliant"
            />
            <ComplianceButton
              value={formData.food_fast_compliant === false ? false : null}
              onClick={() => updateCompliance('food_fast_compliant', false)}
              label="✗ Not Today"
            />
          </div>

          <textarea
            value={formData.food_fast_notes}
            onChange={(e) => updateNotes('food_fast_notes', e.target.value)}
            placeholder="Notes about your food fast today..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Media & Noise Fast */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Media & Noise Fast
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Avoided social media, news, entertainment
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <ComplianceButton
              value={formData.media_fast_compliant === true ? true : null}
              onClick={() => updateCompliance('media_fast_compliant', true)}
              label="✓ Compliant"
            />
            <ComplianceButton
              value={formData.media_fast_compliant === false ? false : null}
              onClick={() => updateCompliance('media_fast_compliant', false)}
              label="✗ Not Today"
            />
          </div>

          <textarea
            value={formData.media_fast_notes}
            onChange={(e) => updateNotes('media_fast_notes', e.target.value)}
            placeholder="Notes about your media fast today..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Convenience & Comfort Fast */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Convenience & Comfort Fast
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Protected prayer time, resisted distractions
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <ComplianceButton
              value={formData.comfort_fast_compliant === true ? true : null}
              onClick={() => updateCompliance('comfort_fast_compliant', true)}
              label="✓ Compliant"
            />
            <ComplianceButton
              value={formData.comfort_fast_compliant === false ? false : null}
              onClick={() => updateCompliance('comfort_fast_compliant', false)}
              label="✗ Not Today"
            />
          </div>

          <textarea
            value={formData.comfort_fast_notes}
            onChange={(e) => updateNotes('comfort_fast_notes', e.target.value)}
            placeholder="Notes about your comfort fast today..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Overall Notes */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Overall Reflections
          </h4>
          <textarea
            value={formData.overall_notes}
            onChange={(e) => updateNotes('overall_notes', e.target.value)}
            placeholder="How is the Lord meeting you in this fast? Any insights, struggles, or victories to note?"
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-temple-purple dark:bg-temple-gold text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save Fasting Log'}</span>
        </button>

        {/* Grace Note */}
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-xs text-purple-700 dark:text-purple-300 italic">
            "A bruised reed He will not break." (Isaiah 42:3) — If you missed today, extend grace to yourself and return tomorrow.
          </p>
        </div>
      </div>
    </div>
  )
}
