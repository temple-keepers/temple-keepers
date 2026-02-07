import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { AlertTriangle, Trash2, LogOut, X } from 'lucide-react'

const ConfirmContext = createContext(null)

// ─── Provider (wrap around app once) ─────────────────────────
export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'danger',  // 'danger' | 'warning' | 'info'
    icon: null,
    onConfirm: null,
  })

  const confirm = useCallback(({ title, message, confirmLabel, cancelLabel, variant, icon }) => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: title || 'Are you sure?',
        message: message || '',
        confirmLabel: confirmLabel || 'Confirm',
        cancelLabel: cancelLabel || 'Cancel',
        variant: variant || 'danger',
        icon: icon || null,
        onConfirm: resolve,
      })
    })
  }, [])

  const handleConfirm = () => {
    state.onConfirm?.(true)
    setState(s => ({ ...s, open: false }))
  }

  const handleCancel = () => {
    state.onConfirm?.(false)
    setState(s => ({ ...s, open: false }))
  }

  // Close on Escape
  useEffect(() => {
    if (!state.open) return
    const handler = (e) => { if (e.key === 'Escape') handleCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.open])

  const VARIANTS = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    info: {
      icon: LogOut,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  }

  const v = VARIANTS[state.variant] || VARIANTS.danger
  const IconComponent = state.icon || v.icon

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {/* Modal */}
      {state.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" onClick={handleCancel}>
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              {/* Icon */}
              <div className={`w-14 h-14 rounded-full ${v.iconBg} flex items-center justify-center mx-auto mb-4`}>
                <IconComponent className={`w-7 h-7 ${v.iconColor}`} />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {state.title}
              </h3>

              {/* Message */}
              {state.message && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {state.message}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {state.cancelLabel}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-colors ${v.buttonClass}`}
                autoFocus
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────
export const useConfirm = () => {
  const confirm = useContext(ConfirmContext)
  if (!confirm) throw new Error('useConfirm must be used within ConfirmProvider')
  return confirm
}
