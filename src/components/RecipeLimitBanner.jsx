import { Link } from 'react-router-dom'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useTheme } from '../contexts/ThemeContext'
import { ChefHat, AlertTriangle, Crown, Sparkles } from 'lucide-react'

const RecipeLimitBanner = ({ used = 0 }) => {
  const { getRecipeLimit, hasAccess, loading } = useSubscription()
  const { isDark } = useTheme()

  // Don't render while loading
  if (loading || !getRecipeLimit) return null

  const limit = getRecipeLimit()
  const isUnlimited = limit === -1
  const remaining = isUnlimited ? null : limit - used
  const isLow = !isUnlimited && remaining <= 2
  const isExhausted = !isUnlimited && remaining <= 0

  // Don't show for unlimited users
  if (isUnlimited) return null

  return (
    <div className={`rounded-2xl p-4 mb-6 ${
      isExhausted
        ? isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
        : isLow
          ? isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
          : isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isExhausted
              ? isDark ? 'bg-red-500/20' : 'bg-red-100'
              : isLow
                ? isDark ? 'bg-amber-500/20' : 'bg-amber-100'
                : isDark ? 'bg-blue-500/20' : 'bg-blue-100'
          }`}>
            {isExhausted ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <ChefHat className={`w-5 h-5 ${isLow ? 'text-amber-500' : 'text-blue-500'}`} />
            )}
          </div>
          <div>
            <p className={`text-sm font-medium ${
              isExhausted
                ? 'text-red-600 dark:text-red-400'
                : isLow
                  ? 'text-amber-600 dark:text-amber-400'
                  : isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {isExhausted
                ? 'Recipe limit reached!'
                : isLow
                  ? `Only ${remaining} recipe${remaining === 1 ? '' : 's'} left this month`
                  : `${used}/${limit} recipes used this month`
              }
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {isExhausted
                ? 'Upgrade for unlimited recipes'
                : `Resets on the 1st of next month`
              }
            </p>
          </div>
        </div>
        
        {(isExhausted || isLow) && (
          <Link
            to="/pricing"
            className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${
              isExhausted
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gradient-to-r from-temple-purple to-temple-gold text-white hover:opacity-90'
            } transition-all`}
          >
            <Crown className="w-4 h-4" />
            Upgrade
          </Link>
        )}
      </div>

      {/* Progress bar */}
      <div className={`mt-3 h-2 rounded-full overflow-hidden ${
        isDark ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <div 
          className={`h-full rounded-full transition-all ${
            isExhausted
              ? 'bg-red-500'
              : isLow
                ? 'bg-amber-500'
                : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
        />
      </div>
    </div>
  )
}

export default RecipeLimitBanner