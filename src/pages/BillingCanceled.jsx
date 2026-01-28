import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

const BillingCanceled = () => {
  const { isDark } = useTheme()

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="text-center max-w-md">
        <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
          isDark ? 'bg-amber-500/20' : 'bg-amber-100'
        }`}>
          <XCircle className="w-12 h-12 text-amber-500" />
        </div>

        <h1 className={`text-3xl font-display font-bold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Checkout Canceled
        </h1>

        <p className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          No worries! You weren't charged. Try again when you're ready.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-temple-purple text-white font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </Link>
          <Link
            to="/dashboard"
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl ${
              isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BillingCanceled