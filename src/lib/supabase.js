import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Safety check for missing environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'temple-keepers-auth', // Consistent storage key
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    },
    global: {
      headers: {
        'x-application-name': 'temple-keepers'
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)

// ============================================
// PROFILE FUNCTIONS
// ============================================

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching profile:', error)
    return { data: null, error }
  }
  return { data, error: null }
}

export const updateProfile = async (userId, updates) => {
  console.log('📤 Updating profile for user:', userId)
  console.log('📝 Updates:', JSON.stringify(updates, null, 2))
  
  try {
    // First, check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', checkError)
      throw checkError
    }
    
    const profileExists = !!existingProfile
    console.log(`Profile ${profileExists ? 'exists' : 'does not exist'}`)
    
    // Prepare update data
    const updateData = {
      id: userId,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    // Use upsert to handle both insert and update cases
    const { data, error } = await supabase
      .from('profiles')
      .upsert(updateData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Profile update error:', error)
      throw error
    }
    
    console.log('✅ Profile updated successfully:', data)
    return data
  } catch (err) {
    console.error('❌ Exception in updateProfile:', err)
    throw err
  }
}

// ============================================
// RECIPE FUNCTIONS
// ============================================

export const saveRecipe = async (userId, recipe) => {
  console.log('📤 Saving recipe for user:', userId)
  
  const recipeData = {
    user_id: userId,
    title: recipe.title || 'Untitled Recipe',
    description: recipe.description || '',
    prep_time: recipe.prepTime || '',
    cook_time: recipe.cookTime || '',
    servings: recipe.servings || '',
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    scripture: recipe.scripture || '',
    scripture_reference: recipe.scriptureReference || '',
    meditation: recipe.meditation || '',
    nutrition_info: recipe.nutritionInfo || {},
    is_favorite: false
  }

  const { data, error } = await supabase
    .from('saved_recipes')
    .insert(recipeData)
    .select()
    .single()

  if (error) {
    console.error('❌ Recipe save error:', error)
    throw error
  }
  
  console.log('✅ Recipe saved successfully!')
  return data
}

export const getUserRecipes = async (userId) => {
  const { data, error } = await supabase
    .from('saved_recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching recipes:', error)
    return []
  }
  return data || []
}

export const deleteRecipe = async (recipeId) => {
  const { error } = await supabase
    .from('saved_recipes')
    .delete()
    .eq('id', recipeId)

  if (error) throw error
  return true
}

export const toggleFavorite = async (recipeId, isFavorite) => {
  const { data, error } = await supabase
    .from('saved_recipes')
    .update({ is_favorite: isFavorite })
    .eq('id', recipeId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// DEVOTIONAL FUNCTIONS
// ============================================

export const saveDevotionalCompletion = async (userId, devotional) => {
  const { data, error } = await supabase
    .from('devotional_progress')
    .insert({
      user_id: userId,
      completed_at: new Date().toISOString(),
      notes: devotional.title || ''
    })
    .select()
    .single()

  if (error) {
    console.error('❌ Devotional save error:', error)
    throw error
  }
  
  return data
}

export const getUserDevotionals = async (userId) => {
  const { data, error } = await supabase
    .from('devotional_progress')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (error) {
    console.error('Error fetching devotionals:', error)
    return []
  }
  return data || []
}

// ============================================
// USER STATS FUNCTIONS
// ============================================

export const getUserStats = async (userId) => {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching stats:', error)
    return { data: null, error }
  }
  return { data, error: null }
}

export const updateUserStats = async (userId, updates) => {
  const { data, error } = await supabase
    .from('user_stats')
    .upsert({
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    console.error('Error updating stats:', error)
    throw error
  }
  return data
}

export const incrementUserStat = async (userId, statField, pointsToAdd = 0) => {
  try {
    let currentStats = await getUserStats(userId)
    
    if (!currentStats?.data) {
      currentStats = {
        data: {
          user_id: userId,
          streak_days: 0,
          devotionals_completed: 0,
          recipes_saved: 0,
          total_points: 0,
          last_activity_date: new Date().toISOString().split('T')[0]
        }
      }
    }

    const updates = {
      [statField]: (currentStats.data[statField] || 0) + 1,
      total_points: (currentStats.data.total_points || 0) + pointsToAdd,
      last_activity_date: new Date().toISOString().split('T')[0]
    }

    const today = new Date().toISOString().split('T')[0]
    if (currentStats.data.last_activity_date !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      if (currentStats.data.last_activity_date === yesterday) {
        updates.streak_days = (currentStats.data.streak_days || 0) + 1
      } else {
        updates.streak_days = 1
      }
    }

    return await updateUserStats(userId, updates)
  } catch (error) {
    console.error('Error incrementing stat:', error)
    return null
  }
}

// ============================================
// RECIPE LIBRARY FUNCTIONS
// ============================================

export const publishRecipe = async (userId, recipe, isAIGenerated = true) => {
  const recipeData = {
    user_id: userId,
    author_name: recipe.author_name || 'Anonymous',
    title: recipe.title || 'Untitled Recipe',
    description: recipe.description || '',
    prep_time: recipe.prepTime || recipe.prep_time || '',
    cook_time: recipe.cookTime || recipe.cook_time || '',
    servings: recipe.servings || '',
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    scripture: recipe.scripture || '',
    scripture_reference: recipe.scriptureReference || recipe.scripture_reference || '',
    meditation: recipe.meditation || '',
    nutrition_info: recipe.nutritionInfo || recipe.nutrition_info || {},
    cuisine: recipe.cuisine || '',
    meal_type: recipe.mealType || recipe.meal_type || '',
    dietary_tags: recipe.dietaryTags || recipe.dietary_tags || [],
    status: isAIGenerated ? 'approved' : 'pending'
  }

  const { data, error } = await supabase
    .from('recipes')
    .insert(recipeData)
    .select()
    .single()

  if (error) {
    console.error('❌ Recipe publish error:', error)
    throw error
  }
  
  return data
}

export const getRecipeLibrary = async (sortBy = 'recent') => {
  try {
    let query = supabase
      .from('recipes')
      .select('*')
      .eq('status', 'approved')

    switch (sortBy) {
      case 'popular':
        query = query.order('save_count', { ascending: false, nullsFirst: false })
        break
      case 'topRated':
        query = query.order('view_count', { ascending: false, nullsFirst: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching recipe library:', error)
      throw error
    }

    return (data || []).map(recipe => ({
      ...recipe,
      author_name: recipe.author_name || 'Anonymous',
      average_rating: 0,
      rating_count: 0
    }))
  } catch (err) {
    console.error('❌ Exception in getRecipeLibrary:', err)
    return []
  }
}

export const saveRecipeFromLibrary = async (userId, recipe) => {
  const recipeData = {
    user_id: userId,
    title: recipe.title,
    description: recipe.description,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    scripture: recipe.scripture,
    scripture_reference: recipe.scripture_reference,
    meditation: recipe.meditation,
    prep_time: recipe.prep_time,
    cook_time: recipe.cook_time,
    servings: recipe.servings,
    nutrition_info: recipe.nutrition_info,
    cuisine: recipe.cuisine,
    meal_type: recipe.meal_type,
    dietary_tags: recipe.dietary_tags,
    is_favorite: false
  }

  const { data: savedRecipe, error: saveError } = await supabase
    .from('saved_recipes')
    .insert(recipeData)
    .select()
    .single()

  if (saveError) {
    console.error('❌ Error saving to saved_recipes:', saveError)
    throw saveError
  }

  // Track the save
  const { error: trackError } = await supabase
    .from('recipe_library_saves')
    .insert({
      recipe_id: recipe.id,
      user_id: userId,
      saved_recipe_id: savedRecipe.id
    })

  if (trackError && trackError.code !== '23505') {
    console.error('⚠️ Error tracking recipe save:', trackError)
  }

  return savedRecipe
}

export const rateRecipe = async (userId, recipeId, rating) => {
  const { data, error } = await supabase
    .from('recipe_ratings')
    .upsert({
      recipe_id: recipeId,
      user_id: userId,
      rating,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getUserRecipeRating = async (userId, recipeId) => {
  const { data, error } = await supabase
    .from('recipe_ratings')
    .select('rating')
    .eq('recipe_id', recipeId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user rating:', error)
  }
  return data?.rating || 0
}

export const addRecipeComment = async (userId, recipeId, comment) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single()

  const { data, error } = await supabase
    .from('recipe_comments')
    .insert({
      recipe_id: recipeId,
      user_id: userId,
      user_name: profile?.full_name || 'Anonymous',
      comment
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getRecipeComments = async (recipeId) => {
  const { data, error } = await supabase
    .from('recipe_comments')
    .select('*')
    .eq('recipe_id', recipeId)
    .eq('is_flagged', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }
  return data || []
}

export const getUserPublishedRecipes = async (userId) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user recipes:', error)
    return []
  }
  return data || []
}

// ============================================
// WATER TRACKER FUNCTIONS
// ============================================

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getWaterLog = async (userId, date = getLocalDateString()) => {
  const { data, error } = await supabase
    .from('water_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching water log:', error)
  }
  return data || null
}

export const updateWaterLog = async (userId, glasses, goal = 8) => {
  const date = getLocalDateString()
  
  const { data, error } = await supabase
    .from('water_logs')
    .upsert({
      user_id: userId,
      date,
      glasses,
      goal,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,date' })
    .select()
    .single()

  if (error) {
    console.error('Error updating water log:', error)
    throw error
  }
  return data
}

export const getWaterHistory = async (userId, days = 7) => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await supabase
    .from('water_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', getLocalDateString(startDate))
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching water history:', error)
    return []
  }
  return data || []
}

// ============================================
// MEAL PLANNER FUNCTIONS
// ============================================

export const getMealPlan = async (userId, startDate, endDate) => {
  const { data: mealData, error: mealError } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (mealError) {
    console.error('Error fetching meal plan:', mealError)
    return []
  }

  if (!mealData || mealData.length === 0) {
    return []
  }

  const libraryRecipeIds = [...new Set(mealData.filter(m => m.recipe_id).map(m => m.recipe_id))]

  let libraryRecipes = {}
  if (libraryRecipeIds.length > 0) {
    const { data: libData } = await supabase
      .from('recipes')
      .select('id, title, description, prep_time, cook_time, servings, ingredients')
      .in('id', libraryRecipeIds)
    
    if (libData) {
      libData.forEach(r => { libraryRecipes[r.id] = r })
    }
  }

  return mealData.map(meal => {
    let recipe = null
    
    if (meal.recipe_id && libraryRecipes[meal.recipe_id]) {
      recipe = libraryRecipes[meal.recipe_id]
    } else if (meal.custom_meal) {
      try {
        recipe = JSON.parse(meal.custom_meal)
      } catch {
        recipe = { title: meal.custom_meal }
      }
    }
    
    return { ...meal, recipe }
  })
}

export const addMealToPlan = async (userId, date, mealType, recipeId, recipeSource = 'saved', recipeData = null) => {
  let insertData = {
    user_id: userId,
    date,
    meal_type: mealType,
    recipe_id: null,
    custom_meal: null
  }

  if (recipeSource === 'library') {
    insertData.recipe_id = recipeId
  } else if (recipeSource === 'saved' && recipeData) {
    insertData.custom_meal = JSON.stringify({
      id: recipeData.id,
      title: recipeData.title,
      description: recipeData.description,
      prep_time: recipeData.prep_time,
      cook_time: recipeData.cook_time,
      ingredients: recipeData.ingredients
    })
  }
  
  const { data, error } = await supabase
    .from('meal_plans')
    .upsert(insertData, { onConflict: 'user_id,date,meal_type' })
    .select('*')
    .single()

  if (error) {
    console.error('Error adding meal to plan:', error)
    throw error
  }
  
  let recipe = null
  if (insertData.recipe_id) {
    const { data: recipeResult } = await supabase
      .from('recipes')
      .select('id, title, description, prep_time, cook_time')
      .eq('id', insertData.recipe_id)
      .single()
    recipe = recipeResult
  } else if (insertData.custom_meal) {
    try {
      recipe = JSON.parse(insertData.custom_meal)
    } catch {
      recipe = { title: insertData.custom_meal }
    }
  }

  return { ...data, recipe }
}

export const removeMealFromPlan = async (mealPlanId) => {
  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('id', mealPlanId)

  if (error) {
    console.error('Error removing meal from plan:', error)
    throw error
  }
  return true
}

export const getShoppingList = async (userId, startDate, endDate) => {
  const { data: mealData, error: mealError } = await supabase
    .from('meal_plans')
    .select('recipe_id, custom_meal')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)

  if (mealError) {
    console.error('Error fetching shopping list:', mealError)
    return []
  }

  if (!mealData || mealData.length === 0) {
    return []
  }

  const libraryRecipeIds = [...new Set(mealData.filter(m => m.recipe_id).map(m => m.recipe_id))]

  let allIngredients = []

  if (libraryRecipeIds.length > 0) {
    const { data: libData } = await supabase
      .from('recipes')
      .select('ingredients')
      .in('id', libraryRecipeIds)
    
    if (libData) {
      libData.forEach(r => {
        if (r.ingredients) allIngredients.push(...r.ingredients)
      })
    }
  }

  mealData.forEach(meal => {
    if (meal.custom_meal) {
      try {
        const parsed = JSON.parse(meal.custom_meal)
        if (parsed.ingredients && Array.isArray(parsed.ingredients)) {
          allIngredients.push(...parsed.ingredients)
        }
      } catch {
        // Not JSON, ignore
      }
    }
  })

  const uniqueIngredients = [...new Map(
    allIngredients.filter(Boolean).map(item => [item.toLowerCase().trim(), item])
  ).values()]

  return uniqueIngredients
}

// ============================================
// PASSWORD RESET FUNCTIONS
// ============================================

export const sendPasswordResetEmail = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) {
    console.error('Error sending reset email:', error)
    throw error
  }

  return data
}

export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    console.error('Error updating password:', error)
    throw error
  }

  return data
}

// ============================================
// EMAIL VERIFICATION FUNCTIONS
// ============================================

export const resendVerificationEmail = async (email) => {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  })

  if (error) {
    console.error('Error resending verification:', error)
    throw error
  }

  return data
}

// ============================================
// DAILY LOGS FUNCTIONS
// ============================================

export const getMealLogs = async (userId, date = getLocalDateString()) => {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('time', { ascending: true })

  if (error) {
    console.error('Error fetching meal logs:', error)
    return []
  }
  return data || []
}

export const createMealLog = async (userId, mealData) => {
  const { data, error } = await supabase
    .from('meal_logs')
    .insert({
      user_id: userId,
      date: mealData.date || getLocalDateString(),
      meal_type: mealData.meal_type,
      meal_name: mealData.meal_name,
      description: mealData.description,
      calories: mealData.calories,
      portion_size: mealData.portion_size,
      ingredients: mealData.ingredients,
      notes: mealData.notes,
      time: mealData.time || new Date().toTimeString().slice(0, 5),
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating meal log:', error)
    throw error
  }
  return data
}

export const updateMealLog = async (id, updates) => {
  const { data, error } = await supabase
    .from('meal_logs')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating meal log:', error)
    throw error
  }
  return data
}

export const deleteMealLog = async (id) => {
  const { error } = await supabase
    .from('meal_logs')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting meal log:', error)
    throw error
  }
}

export const getMoodLogs = async (userId, date = getLocalDateString()) => {
  const { data, error } = await supabase
    .from('mood_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('time', { ascending: false })

  if (error) {
    console.error('Error fetching mood logs:', error)
    return []
  }
  return data || []
}

export const createMoodLog = async (userId, moodData) => {
  const { data, error } = await supabase
    .from('mood_logs')
    .insert({
      user_id: userId,
      date: moodData.date || getLocalDateString(),
      time: moodData.time || new Date().toTimeString().slice(0, 5),
      mood: moodData.mood,
      energy_level: moodData.energy_level,
      stress_level: moodData.stress_level,
      sleep_quality: moodData.sleep_quality,
      notes: moodData.notes,
      activities: moodData.activities,
      triggers: moodData.triggers,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating mood log:', error)
    throw error
  }
  return data
}

export const updateMoodLog = async (id, updates) => {
  const { data, error } = await supabase
    .from('mood_logs')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating mood log:', error)
    throw error
  }
  return data
}

export const deleteMoodLog = async (id) => {
  const { error } = await supabase
    .from('mood_logs')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting mood log:', error)
    throw error
  }
}

export const getSymptomLogs = async (userId, date = getLocalDateString()) => {
  const { data, error } = await supabase
    .from('symptom_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('time', { ascending: false })

  if (error) {
    console.error('Error fetching symptom logs:', error)
    return []
  }
  return data || []
}

export const createSymptomLog = async (userId, symptomData) => {
  const { data, error } = await supabase
    .from('symptom_logs')
    .insert({
      user_id: userId,
      date: symptomData.date || getLocalDateString(),
      time: symptomData.time || new Date().toTimeString().slice(0, 5),
      symptom_type: symptomData.symptom_type,
      severity: symptomData.severity,
      location: symptomData.location,
      duration: symptomData.duration,
      notes: symptomData.notes,
      triggers: symptomData.triggers,
      relieved_by: symptomData.relieved_by,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating symptom log:', error)
    throw error
  }
  return data
}

export const updateSymptomLog = async (id, updates) => {
  const { data, error} = await supabase
    .from('symptom_logs')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating symptom log:', error)
    throw error
  }
  return data
}

export const deleteSymptomLog = async (id) => {
  const { error } = await supabase
    .from('symptom_logs')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting symptom log:', error)
    throw error
  }
}

export const getDailyLog = async (userId, date = getLocalDateString()) => {
  const [water, meals, moods, symptoms] = await Promise.all([
    getWaterLog(userId, date),
    getMealLogs(userId, date),
    getMoodLogs(userId, date),
    getSymptomLogs(userId, date)
  ])

  return {
    date,
    water: water || { glasses: 0, goal: 8 },
    meals: meals || [],
    moods: moods || [],
    symptoms: symptoms || []
  }
}

export const getDailyLogHistory = async (userId, days = 7) => {
  const dates = []
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(getLocalDateString(date))
  }

  const logs = await Promise.all(
    dates.map(date => getDailyLog(userId, date))
  )

  return logs
}