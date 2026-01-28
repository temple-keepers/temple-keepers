import { Link } from 'react-router-dom'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useTheme } from '../contexts/ThemeContext'
import { Lock, Crown, Sparkles, ArrowRight, Check } from 'lucide-react'
import { PLANS } from '../lib/stripe'

const FeatureGate = ({ 
  feature, 
  children, 
  requiredPlan = 'starter',
  showInline = false 
}) => {
  const { hasAccess, getCurrentPlan, loading } = useSubscription()
  const { isDark } = useTheme()

  // Show children while loading to avoid flash
  if (loading) {
    return children
  }

  // If user has access, show content
  if (hasAccess && hasAccess(feature)) {
    return children
  }

  const currentPlan = getCurrentPlan ? getCurrentPlan() : PLANS.free
  const requiredPlanDetails = PLANS[requiredPlan]

  // Inline upgrade prompt (for buttons, small sections)
  if (showInline) {
    return (
      <Link
        to="/pricing"
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
          isDark 
            ? 'bg-temple-purple/20 text-temple-purple hover:bg-temple-purple/30' 
            : 'bg-temple-purple/10 text-temple-purple hover:bg-temple-purple/20'
        } transition-colors`}
      >
        <Lock className="w-4 h-4" />
        Upgrade to unlock
      </Link>
    )
  }

  // Full page upgrade prompt
  return (
    <div className={`min-h-[70vh] flex items-center justify-center px-4 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-lg w-full">
        {/* Main Card */}
        <div className={`rounded-3xl p-8 text-center ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-xl'
        }`}>
          {/* Lock Icon */}
          <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
            isDark ? 'bg-temple-purple/20' : 'bg-temple-purple/10'
          }`}>
            <Lock className="w-10 h-10 text-temple-purple" />
          </div>
          
          {/* Title */}
          <h2 className={`text-2xl font-display font-bold mb-3 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Unlock This Feature
          </h2>
          
          {/* Description */}
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            This feature is available on the <strong className="text-temple-purple">{requiredPlanDetails.name}</strong> plan and above. 
            Upgrade to access all premium features!
          </p>

          {/* Current vs Required Plan */}
          <div className={`rounded-2xl p-4 mb-6 ${
            isDark ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-left">
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Current Plan</p>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentPlan.name}
                </p>
              </div>
              <ArrowRight className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <div className="text-right">
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Recommended</p>
                <p className="font-semibold text-temple-purple">
                  {requiredPlanDetails.name}
                </p>
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Starting at <strong>£{requiredPlanDetails.monthlyPrice}/month</strong>
            </p>
          </div>

          {/* Features Preview */}
          <div className="text-left mb-6">
            <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              What you'll get with {requiredPlanDetails.name}:
            </p>
            <ul className="space-y-2">
              {requiredPlanDetails.features.slice(0, 5).map((feat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {feat}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button */}
          <Link
            to="/pricing"
            className="w-full py-4 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Crown className="w-5 h-5" />
            View Plans & Upgrade
          </Link>

          {/* Trial Note */}
          <p className={`mt-4 text-sm flex items-center justify-center gap-1 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            <Sparkles className="w-4 h-4" />
            7-day free trial included
          </p>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            to="/dashboard"
            className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FeatureGate