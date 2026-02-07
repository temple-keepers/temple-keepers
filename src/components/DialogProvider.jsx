import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { AlertTriangle, Trash2, LogOut, X, Info } from 'lucide-react'

// ─── Context so any component can trigger a dialog ─────────────
const DialogContext = createContext(null)

export const useDialog = () => {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('useDialog must be inside DialogProvider')
  return ctx
}

export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null)

  const confirm = useCallback(({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', icon } = {}) => {
    return new Promise((resolve) => {
      setDialog({
        type: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        variant,
        icon,
        onConfirm: () => { setDialog(null); resolve(true) },
        onCancel: () => { setDialog(null); resolve(false) },
      })
    })
  }, [])

  const alert = useCallback(({ title, message, buttonText = 'OK', variant = 'info' } = {}) => {
    return new Promise((resolve) => {
      setDialog({
        type: 'alert',
        title,
        message,
        buttonText,
        variant,
        onConfirm: () => { setDialog(null); resolve(true) },
        onCancel: () => { setDialog(null); resolve(true) },
      })
    })
  }, [])

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      {dialog && <DialogModal {...dialog} />}
    </DialogContext.Provider>
  )
}

// ─── The actual modal ─────────────────────────────────────────
const VARIANTS = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    confirmBtn: 'btn-primary',
  },
  leave: {
    icon: LogOut,
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    confirmBtn: 'bg-orange-600 hover:bg-orange-700 text-white',
  },
}

const DialogModal = ({
  type, title, message, confirmText, cancelText, buttonText,
  variant = 'danger', icon: CustomIcon, onConfirm, onCancel
}) => {
  const v = VARIANTS[variant] || VARIANTS.info
  const Icon = CustomIcon || v.icon

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4" onClick={onCancel}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Body */}
        <div className="p-6 text-center">
          <div className={`w-14 h-14 rounded-full ${v.iconBg} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-7 h-7 ${v.iconColor}`} />
          </div>

          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
          )}

          {message && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          {type === 'confirm' ? (
            <>
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${v.confirmBtn}`}
                autoFocus
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${v.confirmBtn}`}
              autoFocus
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
