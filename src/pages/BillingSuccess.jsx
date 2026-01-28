import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

const BillingSuccess = () => {
  const { isDark } = useTheme()
  const { refreshSubscription, getCurrentPlan } = useSubscription()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const refresh = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await refreshSubscription()
      setLoading(false)
    }
    refresh()
  }, [])

  const plan = getCurrentPlan()

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="text-center max-w-md">
        {loading ? (
          <>
            <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-6" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Activating your subscription...
            </p>
          </>
        ) : (
          <>
            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
              isDark ? 'bg-green-500/20' : 'bg-green-100'
            }`}>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>

            <div className="text-6xl mb-4">🎉</div>

            <h1 className={`text-3xl font-display font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome to {plan.name}!
            </h1>

            <p className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Your subscription is now active. Enjoy all your new features!
            </p>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-semibold"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default BillingSuccess