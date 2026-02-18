import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

// Points awarded per action
const POINTS_TABLE = {
  devotional_read: 5,
  wellness_checkin: 10,
  meal_logged: 5,
  symptom_logged: 5,
  fasting_day: 15,
  program_day: 20,
  program_complete: 100,
  community_post: 5,
  recipe_saved: 5,
  daily_action: 10,
  streak_bonus_7: 50,
  streak_bonus_14: 75,
  streak_bonus_30: 150,
  referral_signup: 25,
}

// Level thresholds
const LEVELS = [
  { level: 1, name: 'Seedling', min: 0 },
  { level: 2, name: 'Sprout', min: 50 },
  { level: 3, name: 'Sapling', min: 150 },
  { level: 4, name: 'Growing', min: 300 },
  { level: 5, name: 'Rooted', min: 500 },
  { level: 6, name: 'Flourishing', min: 800 },
  { level: 7, name: 'Fruitful', min: 1200 },
  { level: 8, name: 'Mighty Oak', min: 1800 },
  { level: 9, name: 'Temple Guardian', min: 2500 },
  { level: 10, name: 'Temple Keeper', min: 3500 },
]

export const gamificationService = {
  /**
   * Get level info for a given point total
   */
  getLevel(totalPoints) {
    let current = LEVELS[0]
    let next = LEVELS[1]

    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalPoints >= LEVELS[i].min) {
        current = LEVELS[i]
        next = LEVELS[i + 1] || null
        break
      }
    }

    const progress = next
      ? ((totalPoints - current.min) / (next.min - current.min)) * 100
      : 100

    return {
      level: current.level,
      name: current.name,
      totalPoints,
      nextLevel: next,
      progress: Math.min(progress, 100),
      pointsToNext: next ? next.min - totalPoints : 0
    }
  },

  /**
   * Award points for an action (prevents duplicate awards per source)
   */
  async awardPoints(userId, reason, sourceType, sourceId = null, customPoints = null) {
    const points = customPoints || POINTS_TABLE[reason] || 0
    if (points === 0) return null

    try {
      // Exclude admin users from gamification
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      if (profile?.role === 'admin') return null
      // Prevent duplicate points for same source
      if (sourceId) {
        const { data: existing } = await supabase
          .from('user_points')
          .select('id')
          .eq('user_id', userId)
          .eq('source_type', sourceType)
          .eq('source_id', sourceId)
          .maybeSingle()

        if (existing) return null // Already awarded
      }

      // Insert point record
      const { error } = await supabase
        .from('user_points')
        .insert({
          user_id: userId,
          points,
          reason,
          source_type: sourceType,
          source_id: sourceId
        })

      if (error) throw error

      // Update cached total
      const { data: totalData } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', userId)

      const newTotal = (totalData || []).reduce((sum, r) => sum + r.points, 0)
      const newLevel = this.getLevel(newTotal).level

      await supabase
        .from('profiles')
        .update({ total_points: newTotal, current_level: newLevel })
        .eq('id', userId)

      return { points, newTotal, newLevel }
    } catch (err) {
      console.error('Failed to award points:', err)
      return null
    }
  },

  /**
   * Check and award any newly earned badges
   */
  async checkBadges(userId) {
    try {
      // Exclude admin users from gamification
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      if (profile?.role === 'admin') return []

      // Get all badges and which ones user already has
      const [{ data: allBadges }, { data: earnedBadges }, stats] = await Promise.all([
        supabase.from('badges').select('*').order('sort_order'),
        supabase.from('user_badges').select('badge_id').eq('user_id', userId),
        this._getUserStats(userId)
      ])

      if (!allBadges) return []

      const earnedIds = new Set((earnedBadges || []).map(b => b.badge_id))
      const newBadges = []

      for (const badge of allBadges) {
        if (earnedIds.has(badge.id)) continue // Already earned

        const earned = this._checkRequirement(badge, stats)
        if (earned) {
          // Award badge
          const { error } = await supabase
            .from('user_badges')
            .insert({ user_id: userId, badge_id: badge.id })

          if (!error) {
            newBadges.push(badge)

            // Award bonus points for badge (if any)
            if (badge.points_reward > 0) {
              await this.awardPoints(userId, `Badge: ${badge.name}`, 'badge', badge.id, badge.points_reward)
            }
          }
        }
      }

      // Show toast for new badges
      if (newBadges.length > 0) {
        for (const badge of newBadges) {
          toast(`🏆 Badge Earned: ${badge.name}!`, {
            icon: '✨',
            duration: 4000,
            style: {
              background: '#1e1145',
              color: '#fff',
              border: '1px solid rgba(196, 167, 125, 0.3)'
            }
          })
        }
      }

      return newBadges
    } catch (err) {
      console.error('Failed to check badges:', err)
      return []
    }
  },

  /**
   * Get user stats for badge checking
   */
  async _getUserStats(userId) {
    try {
      const { data } = await supabase.rpc('get_user_streak', { p_user_id: userId })
      
      const [checkins, meals, fastingDays, completions, posts, recipes, points] = await Promise.all([
        supabase.from('wellness_check_ins').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('meal_logs').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('fasting_logs').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('program_enrollments').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed'),
        supabase.from('pod_posts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('recipes').select('id', { count: 'exact', head: true }).eq('created_by', userId),
        supabase.from('user_points').select('points').eq('user_id', userId)
      ])

      const totalPoints = (points.data || []).reduce((sum, r) => sum + r.points, 0)

      return {
        streak: data?.streak || 0,
        totalCheckins: checkins.count || 0,
        totalMeals: meals.count || 0,
        fastingDays: fastingDays.count || 0,
        programsCompleted: completions.count || 0,
        communityPosts: posts.count || 0,
        recipesSaved: recipes.count || 0,
        totalPoints,
        // First-action flags (count > 0)
        hasDevotional: true, // If they're here, they've seen one
        hasCheckin: (checkins.count || 0) > 0,
        hasMeal: (meals.count || 0) > 0,
        hasPost: (posts.count || 0) > 0,
        hasRecipe: (recipes.count || 0) > 0,
      }
    } catch (err) {
      console.error('Failed to get user stats:', err)
      return {}
    }
  },

  /**
   * Check if a badge requirement is met
   */
  _checkRequirement(badge, stats) {
    switch (badge.requirement_type) {
      case 'streak':
        return stats.streak >= badge.requirement_value
      case 'total_checkins':
        return stats.totalCheckins >= badge.requirement_value
      case 'total_meals':
        return stats.totalMeals >= badge.requirement_value
      case 'program_complete':
        return stats.programsCompleted >= badge.requirement_value
      case 'community_posts':
        return stats.communityPosts >= badge.requirement_value
      case 'fasting_days':
        return stats.fastingDays >= badge.requirement_value
      case 'total_points':
        return stats.totalPoints >= badge.requirement_value
      case 'recipes_saved':
        return stats.recipesSaved >= badge.requirement_value
      case 'first_action':
        // Check by slug for specific first actions
        if (badge.slug === 'first-light') return true // devotional
        if (badge.slug === 'first-step') return stats.hasCheckin
        if (badge.slug === 'temple-nourished') return stats.hasMeal
        if (badge.slug === 'community-heart') return stats.hasPost
        if (badge.slug === 'recipe-explorer') return stats.hasRecipe
        return false
      default:
        return false
    }
  },

  /**
   * Get user's badges and points summary for display
   */
  async getUserProfile(userId) {
    const [{ data: earnedBadges }, { data: allBadges }, { data: profile }] = await Promise.all([
      supabase
        .from('user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false }),
      supabase
        .from('badges')
        .select('*')
        .order('sort_order'),
      supabase
        .from('profiles')
        .select('total_points, current_level')
        .eq('id', userId)
        .single()
    ])

    const earnedIds = new Set((earnedBadges || []).map(b => b.badge_id))
    const earnedMap = {}
    ;(earnedBadges || []).forEach(b => { earnedMap[b.badge_id] = b.earned_at })

    const badges = (allBadges || []).map(b => ({
      ...b,
      earned: earnedIds.has(b.id),
      earned_at: earnedMap[b.id] || null
    }))

    const totalPoints = profile?.total_points || 0
    const levelInfo = this.getLevel(totalPoints)

    return {
      badges,
      earned: badges.filter(b => b.earned),
      locked: badges.filter(b => !b.earned),
      totalPoints,
      levelInfo
    }
  },

  POINTS_TABLE,
  LEVELS,
}
