import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext({})

export const useToast = () => useContext(ToastContext)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random()
    
    setToasts(prev => [...prev, { id, message, type }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  }

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

// Individual Toast Component
const Toast = ({ toast, onClose }) => {
  const { message, type } = toast

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  }

  const styles = {
    success: 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20',
    error: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
    warning: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
    info: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
  }

  const textStyles = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    warning: 'text-amber-800 dark:text-amber-200',
    info: 'text-blue-800 dark:text-blue-200',
  }

  return (
    <div 
      className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm
        animate-slide-in-right
        ${styles[type]}
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <p className={`flex-1 text-sm font-medium ${textStyles[type]}`}>
        {message}
      </p>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  )
}