import { Link } from 'react-router-dom'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useTheme } from '../contexts/ThemeContext'
import { Crown, Sparkles, ArrowRight, X } from 'lucide-react'
import { useState } from 'react'

const UpgradeBanner = ({ variant = 'default' }) => {
  const { isPaid, loading } = useSubscription()
  const { isDark } = useTheme()
  const [dismissed, setDismissed] = useState(false)

  // Don't show while loading or if user is paid or dismissed
  if (loading || (isPaid && isPaid()) || dismissed) return null

  // Compact variant for sidebar/nav
  if (variant === 'compact') {
    return (
      <Link 
        to="/pricing"
        className={`block p-4 rounded-2xl transition-all hover:scale-[1.02] ${
          isDark 
            ? 'bg-gradient-to-br from-temple-purple/20 to-temple-gold/10 border border-temple-purple/30' 
            : 'bg-gradient-to-br from-temple-purple/10 to-temple-gold/10 border border-temple-purple/20'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-temple-gold/20' : 'bg-temple-gold/10'
          }`}>
            <Crown className="w-5 h-5 text-temple-gold" />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Upgrade
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Unlock all features
            </p>
          </div>
          <ArrowRight className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
      </Link>
    )
  }

  // Full banner variant
  return (
    <div className={`relative rounded-2xl p-6 mb-6 overflow-hidden ${
      isDark 
        ? 'bg-gradient-to-r from-temple-purple/30 to-temple-gold/20 border border-temple-purple/30' 
        : 'bg-gradient-to-r from-temple-purple/20 to-temple-gold/10'
    }`}>
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className={`absolute top-3 right-3 p-1 rounded-lg ${
          isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
        }`}
      >
        <X className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
          isDark ? 'bg-temple-gold/20' : 'bg-temple-gold/10'
        }`}>
          <Crown className="w-7 h-7 text-temple-gold" />
        </div>
        
        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Unlock Your Full Potential
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Upgrade to access unlimited recipes, meal planner, water tracker, and more!
          </p>
        </div>
        
        <Link
          to="/pricing"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Sparkles className="w-5 h-5" />
          Start Free Trial
        </Link>
      </div>
    </div>
  )
}

export default UpgradeBanner