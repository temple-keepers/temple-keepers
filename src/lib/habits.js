import { supabase } from './supabase'
import { notificationTriggers } from './notifications'

// ============================================
// DATA NORMALIZATION HELPERS
// ============================================

// Normalize habit data from DB to UI format
const normalizeHabit = (habit) => {
  if (!habit) return null
  
  return {
    ...habit,
    // Map DB columns to UI expected names (support both old and new)
    cue: habit.cue || habit.cue_trigger || null,
    reward: habit.reward || habit.reward_celebration || null,
    tiny_behavior: habit.tiny_behavior || habit.tiny_behavior_short || null,
    frequency: habit.frequency || habit.frequency_type || 'daily',
    target_days: habit.target_days || habit.specific_days || [1,2,3,4,5,6,7],
    when_time: habit.when_time || habit.preferred_time || habit.reminder_time || null,
    // Parse JSON fields if they're strings
    obstacles: parseJsonField(habit.obstacles, []),
    environment_tips: parseJsonField(habit.environment_tips, []),
    // Ensure defaults for optional fields
    temptation_bundle: habit.temptation_bundle || null,
    where_location: habit.where_location || null,
    is_keystone: habit.is_keystone || false,
    is_archived: habit.is_archived || false,
    current_level: habit.current_level || 1,
    current_streak: habit.current_streak || 0,
    best_streak: habit.best_streak || 0,
    total_completions: habit.total_completions || 0,
    last_completed_date: habit.last_completed_date || null,
    // Category - use text field or extract from category_ref
    category: habit.category || habit.category_ref?.slug || 'spiritual'
  }
}

// Parse JSON fields safely
const parseJsonField = (field, defaultValue) => {
  if (!field) return defaultValue
  if (Array.isArray(field)) return field
  if (typeof field === 'object') return field
  if (typeof field === 'string') {
    try {
      return JSON.parse(field)
    } catch {
      return defaultValue
    }
  }
  return defaultValue
}

// Prepare habit data for DB (map UI names to DB columns)
const prepareHabitForDB = (habitData) => {
  const dbData = { ...habitData }
  
  // Map UI fields to both old and new DB columns for compatibility
  if (habitData.cue !== undefined) {
    dbData.cue = habitData.cue
    dbData.cue_trigger = habitData.cue // Also save to old column
  }
  if (habitData.reward !== undefined) {
    dbData.reward = habitData.reward
    dbData.reward_celebration = habitData.reward // Also save to old column
  }
  if (habitData.frequency !== undefined) {
    dbData.frequency_type = habitData.frequency
    delete dbData.frequency
  }
  if (habitData.target_days !== undefined) {
    dbData.specific_days = habitData.target_days
    delete dbData.target_days
  }
  if (habitData.when_time !== undefined) {
    dbData.when_time = habitData.when_time
    dbData.preferred_time = habitData.when_time // Also save to old column
  }
  
  // Stringify JSON fields
  if (habitData.obstacles !== undefined) {
    dbData.obstacles = typeof habitData.obstacles === 'string' 
      ? habitData.obstacles 
      : JSON.stringify(habitData.obstacles || [])
  }
  if (habitData.environment_tips !== undefined) {
    dbData.environment_tips = typeof habitData.environment_tips === 'string'
      ? habitData.environment_tips
      : JSON.stringify(habitData.environment_tips || [])
  }
  
  return dbData
}

// ============================================
// HABIT TEMPLATES
// ============================================

export const getHabitTemplates = async () => {
  const { data, error } = await supabase
    .from('habit_templates')
    .select(`
      *,
      category:category_id(name, icon, color)
    `)
    .order('is_core', { ascending: false })
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching habit templates:', error)
    return []
  }
  return data || []
}

export const getHabitTemplatesByCategory = async (categoryId) => {
  let query = supabase
    .from('habit_templates')
    .select(`
      *,
      category:category_id(name, icon, color)
    `)
    .order('is_core', { ascending: false })
    .order('sort_order', { ascending: true })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching habit templates:', error)
    return []
  }
  return data || []
}

export const getHabitCategories = async () => {
  const { data, error } = await supabase
    .from('habit_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching habit categories:', error)
    return []
  }
  return data || []
}

export const createHabitFromTemplate = async (userId, template) => {
  const habitData = {
    user_id: userId,
    title: template.title,
    description: template.description,
    category_id: template.category_id,
    category: template.category?.slug || 'spiritual',
    icon: template.icon,
    color: template.color,
    frequency_type: template.frequency_type || 'daily',
    frequency_value: template.frequency_value || 1,
    specific_days: template.specific_days || [1, 2, 3, 4, 5, 6, 7],
    is_countable: template.is_countable || false,
    target_count: template.target_count || 1,
    count_unit: template.count_unit,
    // Save to both old and new columns
    cue: template.suggested_cue,
    cue_trigger: template.suggested_cue,
    tiny_behavior: template.suggested_tiny,
    reward: template.suggested_reward,
    reward_celebration: template.suggested_reward,
    is_active: true
  }

  const { data, error } = await supabase
    .from('habits')
    .insert(habitData)
    .select()
    .single()

  if (error) {
    console.error('Error creating habit from template:', error)
    throw error
  }
  return normalizeHabit(data)
}

// ============================================
// HABITS CRUD
// ============================================

export const getHabits = async (userId, activeOnly = true) => {
  let query = supabase
    .from('habits')
    .select('*, category_ref:category_id(name, slug, icon, color)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching habits:', error)
    return []
  }
  
  // Normalize and filter archived habits
  return (data || [])
    .filter(h => !h.is_archived)
    .map(normalizeHabit)
}

export const getHabit = async (habitId) => {
  const { data, error } = await supabase
    .from('habits')
    .select('*, category_ref:category_id(name, slug, icon, color)')
    .eq('id', habitId)
    .single()

  if (error) {
    console.error('Error fetching habit:', error)
    return null
  }
  return normalizeHabit(data)
}

export const createHabit = async (userId, habitData) => {
  const dbData = prepareHabitForDB({
    user_id: userId,
    ...habitData,
    is_active: true,
    is_archived: false,
    current_streak: 0,
    best_streak: 0,
    total_completions: 0
  })

  const { data, error } = await supabase
    .from('habits')
    .insert(dbData)
    .select()
    .single()

  if (error) {
    console.error('Error creating habit:', error)
    throw error
  }
  return normalizeHabit(data)
}

export const updateHabit = async (habitId, updates) => {
  console.log('Updating habit:', habitId, updates)
  
  try {
    const dbUpdates = prepareHabitForDB({
      ...updates,
      updated_at: new Date().toISOString()
    })

    const { data, error } = await supabase
      .from('habits')
      .update(dbUpdates)
      .eq('id', habitId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error updating habit:', error)
      throw new Error(error.message || 'Failed to update habit')
    }
    
    if (!data) {
      console.error('No data returned from update')
      throw new Error('No data returned after update')
    }
    
    console.log('Habit updated successfully:', data)
    return normalizeHabit(data)
  } catch (err) {
    console.error('Error in updateHabit:', err)
    throw err
  }
}

export const deleteHabit = async (habitId) => {
  // Soft delete - archive the habit
  const { error } = await supabase
    .from('habits')
    .update({ 
      is_active: false,
      is_archived: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', habitId)

  if (error) throw error
  return true
}

export const hardDeleteHabit = async (habitId) => {
  // Permanent delete - use with caution
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)

  if (error) throw error
  return true
}

// ============================================
// HABIT LOGGING
// ============================================

export const getTodayLogs = async (userId) => {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*, habit:habit_id(*)')
    .eq('user_id', userId)
    .eq('log_date', today)

  if (error) {
    console.error('Error fetching today logs:', error)
    return []
  }
  
  // Normalize the habit data in each log
  return (data || []).map(log => ({
    ...log,
    habit: normalizeHabit(log.habit)
  }))
}

export const getHabitLogs = async (habitId, startDate, endDate) => {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: true })

  if (error) {
    console.error('Error fetching habit logs:', error)
    return []
  }
  return data || []
}

export const getWeekLogs = async (userId, weekStart) => {
  const weekStartStr = typeof weekStart === 'string' 
    ? weekStart 
    : weekStart.toISOString().split('T')[0]
    
  const weekEnd = new Date(weekStartStr)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const { data, error } = await supabase
    .from('habit_logs')
    .select('*, habit:habit_id(title, icon, color)')
    .eq('user_id', userId)
    .gte('log_date', weekStartStr)
    .lte('log_date', weekEnd.toISOString().split('T')[0])
    .order('log_date', { ascending: true })

  if (error) {
    console.error('Error fetching week logs:', error)
    return []
  }
  return data || []
}

export const logHabit = async (userId, habitId, completed, options = {}) => {
  const { value = null, mood = null, notes = null, energyLevel = null } = 
    typeof options === 'object' ? options : { value: options }
  
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('habit_logs')
    .upsert({
      habit_id: habitId,
      user_id: userId,
      log_date: today,
      is_completed: completed,
      value: value,
      mood: mood,
      notes: notes,
      energy_level: energyLevel,
      is_skipped: false,
      completed_at: completed ? new Date().toISOString() : null
    }, { onConflict: 'habit_id,user_id,log_date' })
    .select()
    .single()

  if (error) {
    console.error('Error logging habit:', error)
    throw error
  }

  // Check for streak milestones
  if (completed) {
    try {
      const { data: habit } = await supabase
        .from('habits')
        .select('current_streak, title')
        .eq('id', habitId)
        .single()

      if (habit) {
        const milestones = [7, 14, 21, 30, 50, 66, 100, 150, 200, 365]
        if (milestones.includes(habit.current_streak)) {
          try {
            await notificationTriggers.streakMilestone(userId, habit.title, habit.current_streak)
          } catch (err) {
            console.error('Failed to send streak notification:', err)
          }
        }
      }
    } catch (err) {
      console.error('Error checking streak milestone:', err)
    }
  }

  return data
}

export const skipHabit = async (userId, habitId, reason = null) => {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('habit_logs')
    .upsert({
      habit_id: habitId,
      user_id: userId,
      log_date: today,
      is_completed: false,
      is_skipped: true,
      skip_reason: reason
    }, { onConflict: 'habit_id,user_id,log_date' })
    .select()
    .single()

  if (error) {
    console.error('Error skipping habit:', error)
    throw error
  }
  return data
}

// ============================================
// GOALS
// ============================================

export const getGoals = async (userId, status = 'active') => {
  let query = supabase
    .from('goals')
    .select('*, category_ref:category_id(name, slug, icon, color)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching goals:', error)
    return []
  }
  
  // Normalize goal data
  return (data || []).map(goal => ({
    ...goal,
    category: goal.category || goal.category_ref?.slug || 'health',
    completed_at: goal.completed_at || goal.completed_date
  }))
}

export const getGoal = async (goalId) => {
  const { data, error } = await supabase
    .from('goals')
    .select('*, category_ref:category_id(name, slug, icon, color)')
    .eq('id', goalId)
    .single()

  if (error) {
    console.error('Error fetching goal:', error)
    return null
  }
  
  return {
    ...data,
    category: data.category || data.category_ref?.slug || 'health',
    completed_at: data.completed_at || data.completed_date
  }
}

export const createGoal = async (userId, goalData) => {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: userId,
      title: goalData.title,
      description: goalData.description,
      category: goalData.category || 'health',
      target_value: goalData.target_value,
      current_value: goalData.current_value || 0,
      unit: goalData.unit,
      start_date: goalData.start_date || new Date().toISOString().split('T')[0],
      target_date: goalData.target_date,
      why_important: goalData.why_important,
      scripture_motivation: goalData.scripture_motivation,
      linked_habit_ids: goalData.linked_habit_ids || [],
      status: 'active'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating goal:', error)
    throw error
  }
  return data
}

export const updateGoal = async (goalId, updates) => {
  const dbUpdates = { ...updates }
  
  // Sync completed_at and completed_date
  if (updates.completed_at) {
    dbUpdates.completed_date = updates.completed_at
  }
  
  dbUpdates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('goals')
    .update(dbUpdates)
    .eq('id', goalId)
    .select()
    .single()

  if (error) {
    console.error('Error updating goal:', error)
    throw error
  }
  return data
}

export const updateGoalProgress = async (goalId, newValue) => {
  const { data: goal } = await supabase
    .from('goals')
    .select('target_value')
    .eq('id', goalId)
    .single()

  const updates = {
    current_value: newValue,
    updated_at: new Date().toISOString()
  }

  // Auto-complete if target reached
  if (goal && goal.target_value && newValue >= goal.target_value) {
    updates.status = 'completed'
    updates.completed_at = new Date().toISOString()
    updates.completed_date = new Date().toISOString().split('T')[0]
  }

  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteGoal = async (goalId) => {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)

  if (error) throw error
  return true
}

// ============================================
// GOAL MILESTONES
// ============================================

export const getMilestones = async (goalId) => {
  const { data, error } = await supabase
    .from('goal_milestones')
    .select('*')
    .eq('goal_id', goalId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching milestones:', error)
    return []
  }
  return data || []
}

export const getGoalMilestones = getMilestones // Alias for compatibility

export const createMilestone = async (goalId, userId, milestoneData) => {
  const { data, error } = await supabase
    .from('goal_milestones')
    .insert({
      goal_id: goalId,
      user_id: userId,
      ...milestoneData
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating milestone:', error)
    throw error
  }
  return data
}

export const updateMilestone = async (milestoneId, updates) => {
  const { data, error } = await supabase
    .from('goal_milestones')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', milestoneId)
    .select()
    .single()

  if (error) {
    console.error('Error updating milestone:', error)
    throw error
  }
  return data
}

export const toggleMilestone = async (milestoneId, isCompleted) => {
  const updates = {
    is_completed: isCompleted,
    updated_at: new Date().toISOString()
  }
  
  if (isCompleted) {
    updates.completed_at = new Date().toISOString()
  } else {
    updates.completed_at = null
  }

  return await updateMilestone(milestoneId, updates)
}

export const deleteMilestone = async (milestoneId) => {
  const { error } = await supabase
    .from('goal_milestones')
    .delete()
    .eq('id', milestoneId)

  if (error) throw error
  return true
}

// ============================================
// GOAL LOGS (Progress History)
// ============================================

export const logGoalProgress = async (goalId, userId, value, notes = null) => {
  const { data, error } = await supabase
    .from('goal_logs')
    .insert({
      goal_id: goalId,
      user_id: userId,
      value: value,
      notes: notes
    })
    .select()
    .single()

  if (error) throw error
  
  // Also update the goal's current_value
  await updateGoalProgress(goalId, value)
  
  return data
}

export const getGoalLogs = async (goalId, limit = 30) => {
  const { data, error } = await supabase
    .from('goal_logs')
    .select('*')
    .eq('goal_id', goalId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching goal logs:', error)
    return []
  }
  return data || []
}

// ============================================
// WEEKLY REVIEWS
// ============================================

export const getWeeklyReview = async (userId, weekStart) => {
  const weekStartStr = typeof weekStart === 'string'
    ? weekStart
    : weekStart.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('weekly_reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStartStr)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching weekly review:', error)
  }
  
  if (!data) return null
  
  // Normalize field names (support both old and new columns)
  return {
    ...data,
    habits_target: data.habits_target || data.habits_total || 0,
    completion_rate: data.completion_rate || data.completion_percentage || 0,
    overall_mood: data.overall_mood || getMoodFromRating(data.overall_rating)
  }
}

// Helper to convert old numeric rating to mood string
const getMoodFromRating = (rating) => {
  if (!rating) return null
  if (rating >= 5) return 'great'
  if (rating >= 4) return 'good'
  if (rating >= 3) return 'okay'
  if (rating >= 2) return 'struggling'
  return 'difficult'
}

// Helper to convert mood string to numeric rating
const getMoodRating = (mood) => {
  const ratings = { 'great': 5, 'good': 4, 'okay': 3, 'struggling': 2, 'difficult': 1 }
  return ratings[mood] || null
}

export const createOrUpdateWeeklyReview = async (userId, weekStart, reviewData) => {
  const weekStartStr = typeof weekStart === 'string'
    ? weekStart
    : weekStart.toISOString().split('T')[0]
  
  // Calculate week_end (6 days after start)
  const weekEnd = new Date(weekStartStr)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const { data, error } = await supabase
    .from('weekly_reviews')
    .upsert({
      user_id: userId,
      week_start: weekStartStr,
      week_end: weekEnd.toISOString().split('T')[0],
      // New columns
      habits_target: reviewData.habits_target,
      completion_rate: reviewData.completion_rate,
      longest_streak: reviewData.longest_streak,
      overall_mood: reviewData.overall_mood,
      // Old columns (for backwards compatibility)
      habits_total: reviewData.habits_target,
      habits_completed: reviewData.habits_completed,
      completion_percentage: reviewData.completion_rate,
      overall_rating: getMoodRating(reviewData.overall_mood),
      points_earned: reviewData.points_earned || 0,
      // Reflection fields
      wins: reviewData.wins,
      obstacles: reviewData.obstacles,
      learnings: reviewData.learnings,
      next_week_focus: reviewData.next_week_focus,
      gratitude: reviewData.gratitude,
      // Completion
      is_completed: true,
      completed_at: new Date().toISOString()
    }, { onConflict: 'user_id,week_start' })
    .select()
    .single()

  if (error) {
    console.error('Error saving weekly review:', error)
    throw error
  }
  return data
}

export const getWeeklyStats = async (userId, weekStart) => {
  const weekStartStr = typeof weekStart === 'string' 
    ? weekStart 
    : weekStart.toISOString().split('T')[0]
  
  const weekEnd = new Date(weekStartStr)
  weekEnd.setDate(weekEnd.getDate() + 6)

  // Get all habit logs for the week
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('is_completed')
    .eq('user_id', userId)
    .gte('log_date', weekStartStr)
    .lte('log_date', weekEnd.toISOString().split('T')[0])

  // Get habits count
  const { data: habits } = await supabase
    .from('habits')
    .select('id, specific_days, target_days')
    .eq('user_id', userId)
    .eq('is_active', true)

  // Calculate stats
  let habitsTarget = 0
  if (habits) {
    habits.forEach(h => {
      const days = h.target_days || h.specific_days || [1,2,3,4,5,6,7]
      habitsTarget += Array.isArray(days) ? days.length : 7
    })
  }

  const habitsCompleted = logs?.filter(l => l.is_completed).length || 0
  const completionRate = habitsTarget > 0 ? (habitsCompleted / habitsTarget) * 100 : 0

  // Get longest streak
  const { data: habitStreaks } = await supabase
    .from('habits')
    .select('current_streak')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('current_streak', { ascending: false })
    .limit(1)

  return {
    habitsTarget,
    habitsCompleted,
    completionRate: Math.round(completionRate),
    longestStreak: habitStreaks?.[0]?.current_streak || 0
  }
}

// ============================================
// IDENTITY STATEMENT
// ============================================

export const getIdentityStatement = async (userId) => {
  const { data } = await supabase
    .from('profiles')
    .select('identity_statement')
    .eq('id', userId)
    .single()

  return data?.identity_statement || null
}

export const updateIdentityStatement = async (userId, statement) => {
  const { error } = await supabase
    .from('profiles')
    .update({ 
      identity_statement: statement,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) throw error
  return true
}

// ============================================
// HABIT INSIGHTS
// ============================================

export const getHabitInsights = async (userId, habitId = null) => {
  let query = supabase
    .from('habit_insights')
    .select('*')
    .eq('user_id', userId)
    .eq('is_dismissed', false)
    .order('created_at', { ascending: false })

  if (habitId) {
    query = query.eq('habit_id', habitId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching insights:', error)
    return []
  }
  return data || []
}

export const dismissInsight = async (insightId) => {
  const { error } = await supabase
    .from('habit_insights')
    .update({ is_dismissed: true })
    .eq('id', insightId)

  if (error) throw error
  return true
}