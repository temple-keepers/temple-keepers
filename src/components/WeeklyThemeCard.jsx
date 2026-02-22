import { useState, useEffect } from 'react'
import {
  Heart, Church, Mountain, Apple, Moon, Footprints,
  Users, Sparkles, Shield, Zap, Leaf, Clock,
  BookOpen, CheckCircle2, RefreshCw
} from 'lucide-react'
import { useGamification } from '../hooks/useGamification'

const iconMap = {
  Heart, Church, Mountain, Apple, Moon, Footprints,
  Users, Sparkles, Shield, Zap, Leaf, Clock
}

export const WeeklyThemeCard = ({ devotional, weeklyTheme, devotionalLoading, onRegenerate }) => {
  const [actionDone, setActionDone] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const { trackAction } = useGamification()

  useEffect(() => {
    if (weeklyTheme) {
      const key = `tk-action-${weeklyTheme.id}-${new Date().toISOString().slice(0, 10)}`
      setActionDone(localStorage.getItem(key) === 'true')
    }
  }, [weeklyTheme])

  const markActionDone = () => {
    if (!weeklyTheme) return
    const key = `tk-action-${weeklyTheme.id}-${new Date().toISOString().slice(0, 10)}`
    localStorage.setItem(key, 'true')
    setActionDone(true)
    trackAction('daily_action', 'theme_action', weeklyTheme.id)
  }

  // Calculate day within theme week
  const dayOfWeek = weeklyTheme
    ? Math.floor((new Date() - new Date(weeklyTheme.week_start)) / 86400000) + 1
    : null

  const Icon = weeklyTheme ? (iconMap[weeklyTheme.icon] || Heart) : BookOpen

  return (
    <div className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>

      {/* ── Header: Theme or "Daily Bread" fallback ── */}
      <div className="relative px-6 pt-6 pb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-temple-purple/5 dark:bg-temple-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              {weeklyTheme ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-temple-purple dark:text-temple-gold">
                      This Week's Focus
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Day {dayOfWeek} of 7
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white">
                    {weeklyTheme.title}
                  </h3>
                </>
              ) : (
                <>
                  <span className="text-xs font-semibold uppercase tracking-wider text-temple-purple dark:text-temple-gold">
                    Daily Bread
                  </span>
                  <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white">
                    Today's Devotional
                  </h3>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scripture + Devotional Reflection ── */}
      <div className="px-6 pb-4">
        {devotionalLoading ? (
          <div className="text-center py-6">
            <div className="spinner mx-auto mb-3"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Preparing today's devotional...
            </p>
          </div>
        ) : devotional ? (
          <>
            {/* Scripture verse */}
            <div className="pl-1 border-l-3 border-temple-purple/30 dark:border-temple-gold/30" style={{ borderLeftWidth: '3px' }}>
              <p className="text-sm italic text-gray-700 dark:text-gray-300 leading-relaxed pl-4">
                "{devotional.verse}"
              </p>
              <p className="text-xs font-medium text-temple-purple dark:text-temple-gold mt-1 pl-4">
                — {devotional.reference}
              </p>
            </div>

            {/* AI-generated reflection — collapsed by default */}
            {(() => {
              const paragraphs = devotional.reflection.split('\n').filter(p => p.trim())
              const firstParagraph = paragraphs[0]?.trim() || ''
              // Show a truncated preview: first ~120 chars of the first paragraph
              const previewText = firstParagraph.length > 120
                ? firstParagraph.slice(0, 120).replace(/\s+\S*$/, '') + '…'
                : firstParagraph
              const hasMore = paragraphs.length > 1 || firstParagraph.length > 120

              return (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {expanded ? (
                    <div className="space-y-3">
                      {paragraphs.map((paragraph, i) => (
                        <p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {paragraph.trim()}
                        </p>
                      ))}
                      <button
                        onClick={() => setExpanded(false)}
                        className="text-xs font-semibold text-temple-purple dark:text-temple-gold hover:underline mt-1"
                      >
                        Show less
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {previewText}
                      </p>
                      {hasMore && (
                        <button
                          onClick={() => setExpanded(true)}
                          className="text-xs font-semibold text-temple-purple dark:text-temple-gold hover:underline mt-2 inline-flex items-center gap-1"
                        >
                          Read full devotional ↓
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}
          </>
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <p className="text-sm">Unable to load today's devotional.</p>
          </div>
        )}
      </div>

      {/* ── Wellness Tip (theme only) ── */}
      {weeklyTheme?.wellness_tip && (
        <div className="px-6 py-3 bg-temple-purple/5 dark:bg-temple-gold/5 border-t border-temple-purple/10 dark:border-temple-gold/10">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            💡 <span className="font-medium">Wellness Insight:</span> {weeklyTheme.wellness_tip}
          </p>
        </div>
      )}

      {/* ── Daily Action (theme only) ── */}
      {weeklyTheme?.daily_action && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700/50">
          <div className="flex items-start gap-3">
            <button
              onClick={markActionDone}
              disabled={actionDone}
              className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                actionDone
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:border-temple-purple dark:hover:border-temple-gold'
              }`}
            >
              {actionDone && <CheckCircle2 className="w-4 h-4" />}
            </button>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Today's Action
              </p>
              <p className={`text-sm leading-relaxed ${
                actionDone
                  ? 'text-gray-400 dark:text-gray-500 line-through'
                  : 'text-gray-800 dark:text-gray-200'
              }`}>
                {weeklyTheme.daily_action}
              </p>
              {actionDone && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                  ✨ Well done! Every small step honours your temple.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
