import { useState } from 'react'
import { RefreshCw, X, AlertTriangle } from 'lucide-react'
import { FastingTypeSelector } from './FastingTypeSelector'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export const ChangeFastingType = ({ enrollment, onChanged }) => {
  const [showSelector, setShowSelector] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingSelection, setPendingSelection] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSelect = (selection) => {
    // If same type, close selector
    if (selection.fasting_type === enrollment.fasting_type && 
        selection.fasting_window === enrollment.fasting_window) {
      setShowSelector(false)
      toast('You\'re already on this fasting type', { icon: '👍' })
      return
    }

    setPendingSelection(selection)
    setShowSelector(false)
    setShowConfirm(true)
  }

  const handleConfirmChange = async () => {
    setSaving(true)
    try {
      const updateData = {
        fasting_type: pendingSelection.fasting_type,
        fasting_window: pendingSelection.fasting_window,
        lifestyle_commitments: pendingSelection.lifestyle_commitments
      }

      const { error } = await supabase
        .from('program_enrollments')
        .update(updateData)
        .eq('id', enrollment.id)

      if (error) throw error

      toast.success('Fasting type updated! Grace abounds. 🙏')

      setShowConfirm(false)
      setPendingSelection(null)

      if (onChanged) {
        onChanged({
          ...enrollment,
          ...updateData
        })
      }
    } catch (err) {
      console.error('Failed to update fasting type:', err)
      toast.error('Failed to update. Please try again.')
    }
    setSaving(false)
  }

  const typeNames = {
    no_food: 'No-Food Fast',
    time_window: 'Time-Based Window',
    daniel_fast: 'Daniel Fast'
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setShowSelector(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Change Fasting Type
      </button>

      {/* Fasting Type Selector Modal */}
      {showSelector && (
        <FastingTypeSelector
          onSelect={handleSelect}
          onClose={() => setShowSelector(false)}
          selectedType={enrollment.fasting_type}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirm && pendingSelection && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Change Your Fast?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  There's no condemnation in adjusting your fast. The Lord looks at the heart.
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Current:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {typeNames[enrollment.fasting_type] || 'None'}
                  {enrollment.fasting_type === 'time_window' && enrollment.fasting_window && (
                    <span className="text-xs text-gray-500 ml-1">({enrollment.fasting_window})</span>
                  )}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">New:</span>
                <span className="font-medium text-temple-purple dark:text-temple-gold">
                  {typeNames[pendingSelection.fasting_type]}
                  {pendingSelection.fasting_type === 'time_window' && pendingSelection.fasting_window && (
                    <span className="text-xs text-gray-500 ml-1">({pendingSelection.fasting_window})</span>
                  )}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-4">
              "A bruised reed He will not break." — Isaiah 42:3 (KJV)
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirm(false); setPendingSelection(null) }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Keep Current
              </button>
              <button
                onClick={handleConfirmChange}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-temple-purple dark:bg-temple-gold text-white font-medium hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
