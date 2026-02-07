import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { gamificationService } from '../services/gamificationService'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import {
  Award, Flame, Heart, HeartPulse, Shield, Star, Crown, Trophy, Medal,
  Footprints, Apple, UtensilsCrossed, Moon, Sparkles, MessageCircle,
  Users, ChefHat, BookMarked, Library, Sunrise, Swords, Zap
} from 'lucide-react'

const iconMap = {
  Award, Flame, Heart, HeartPulse, Shield, Star, Crown, Trophy, Medal,
  Footprints, Apple, UtensilsCrossed, Moon, Sparkles, MessageCircle,
  Users, ChefHat, BookMarked, Library, Sunrise, Swords, Zap
}

const CATEGORY_LABELS = {
  first_steps: 'First Steps',
  streaks: 'Streak Milestones',
  wellness: 'Wellness',
  nutrition: 'Nutrition',
  programs: 'Programs',
  fasting: 'Fasting',
  community: 'Community',
  milestones: 'Point Milestones'
}

export const Achievements = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    const result = await gamificationService.getUserProfile(user.id)
    setData(result)
    setLoading(false)
  }

  if (loading) {
    return (
      <>
        <AppHeader title="Achievements" showBackButton backTo="/profile" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner"></div>
        </div>
        <BottomNav />
      </>
    )
  }

  const { badges, earned, levelInfo } = data
  const categories = [...new Set(badges.map(b => b.category))]

  const filteredBadges = selectedCategory === 'all'
    ? badges
    : badges.filter(b => b.category === selectedCategory)

  // Group by category for display
  const grouped = {}
  filteredBadges.forEach(b => {
    if (!grouped[b.category]) grouped[b.category] = []
    grouped[b.category].push(b)
  })

  return (
    <>
      <AppHeader title="Achievements" showBackButton backTo="/profile" />
      <div className="min-h-screen p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Level Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-temple-purple via-temple-purple-dark to-purple-900 dark:from-[#2a1854] dark:via-[#1e1145] dark:to-[#120b2e] p-6 shadow-xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-temple-gold/15 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <span className="text-3xl font-bold text-white">{levelInfo.level}</span>
                </div>
                <div>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Level {levelInfo.level}</p>
                  <h2 className="text-2xl font-display font-bold text-white">{levelInfo.name}</h2>
                </div>
              </div>

              {/* Points */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-temple-gold">{levelInfo.totalPoints.toLocaleString()}</span>
                <span className="text-white/60 text-sm">total points</span>
              </div>

              {/* XP bar */}
              {levelInfo.nextLevel && (
                <div>
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>Level {levelInfo.level}</span>
                    <span>{levelInfo.pointsToNext} points to Level {levelInfo.nextLevel.level}</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-temple-gold to-yellow-400 rounded-full transition-all duration-700"
                      style={{ width: `${levelInfo.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-1">Next: {levelInfo.nextLevel.name}</p>
                </div>
              )}

              {/* Stats row */}
              <div className="flex gap-6 mt-5 pt-4 border-t border-white/10">
                <div>
                  <p className="text-2xl font-bold text-white">{earned.length}</p>
                  <p className="text-xs text-white/50">Badges Earned</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{badges.length - earned.length}</p>
                  <p className="text-xs text-white/50">To Unlock</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-temple-purple dark:bg-temple-gold text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All ({badges.length})
            </button>
            {categories.map(cat => {
              const count = badges.filter(b => b.category === cat).length
              const earnedCount = badges.filter(b => b.category === cat && b.earned).length
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-temple-purple dark:bg-temple-gold text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {CATEGORY_LABELS[cat] || cat} ({earnedCount}/{count})
                </button>
              )
            })}
          </div>

          {/* Badge Grid */}
          {Object.entries(grouped).map(([category, categoryBadges]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                {CATEGORY_LABELS[category] || category}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {categoryBadges.map(badge => {
                  const Icon = iconMap[badge.icon] || Award
                  return (
                    <div
                      key={badge.id}
                      className={`relative flex flex-col items-center p-4 rounded-xl border transition-all ${
                        badge.earned
                          ? 'bg-white dark:bg-gray-800 border-temple-purple/30 dark:border-temple-gold/30 shadow-sm'
                          : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-40'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
                        badge.earned
                          ? 'bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <Icon className={`w-6 h-6 ${badge.earned ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                      </div>
                      <p className={`text-xs font-semibold text-center leading-tight ${
                        badge.earned ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
                      }`}>
                        {badge.name}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-1 leading-tight">
                        {badge.description}
                      </p>
                      {badge.earned && badge.points_reward > 0 && (
                        <span className="text-[10px] font-bold text-temple-purple dark:text-temple-gold mt-1">
                          +{badge.points_reward} pts
                        </span>
                      )}
                      {badge.earned && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Points breakdown */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              How to Earn Points
            </h3>
            <div className="space-y-2">
              {[
                ['Daily devotional', gamificationService.POINTS_TABLE.devotional_read],
                ['Wellness check-in', gamificationService.POINTS_TABLE.wellness_checkin],
                ['Log a meal', gamificationService.POINTS_TABLE.meal_logged],
                ['Complete daily action', gamificationService.POINTS_TABLE.daily_action],
                ['Fasting day logged', gamificationService.POINTS_TABLE.fasting_day],
                ['Program day completed', gamificationService.POINTS_TABLE.program_day],
                ['Program completed', gamificationService.POINTS_TABLE.program_complete],
                ['Community post', gamificationService.POINTS_TABLE.community_post],
                ['Save a recipe', gamificationService.POINTS_TABLE.recipe_saved],
              ].map(([label, pts]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{label}</span>
                  <span className="font-semibold text-temple-purple dark:text-temple-gold">+{pts} pts</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <BottomNav />
    </>
  )
}
