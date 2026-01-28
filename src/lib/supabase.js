import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    return null
  }
  return data
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
    
    console.log('💾 Sending to database:', JSON.stringify(updateData, null, 2))
    
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
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Error details:', error.details)
      throw error
    }
    
    if (!data) {
      console.error('❌ No data returned from update')
      throw new Error('No data returned from profile update')
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
  console.log('Recipe object:', recipe)
  
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

  console.log('💾 Recipe data to insert:', recipeData)
  console.log('🔄 Calling supabase.from(saved_recipes).insert()...')
  
  const { data, error } = await supabase
    .from('saved_recipes')
    .insert(recipeData)
    .select()
    .single()

  console.log('📦 Supabase response - data:', data)
  console.log('📦 Supabase response - error:', error)

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
  console.log('📤 Saving devotional completion for user:', userId)
  
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
  
  console.log('✅ Devotional saved successfully!')
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
    return null
  }
  return data
}

export const updateUserStats = async (userId, updates) => {
  const { data, error } = await supabase
    .from('user_stats')
    .upsert({
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString()
    })
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
    // Get current stats
    let currentStats = await getUserStats(userId)
    
    // If no stats exist, create initial record
    if (!currentStats) {
      currentStats = {
        user_id: userId,
        streak_days: 0,
        devotionals_completed: 0,
        recipes_saved: 0,
        total_points: 0,
        last_activity_date: new Date().toISOString().split('T')[0]
      }
    }

    // Increment the specified stat and add points
    const updates = {
      [statField]: (currentStats[statField] || 0) + 1,
      total_points: (currentStats.total_points || 0) + pointsToAdd,
      last_activity_date: new Date().toISOString().split('T')[0]
    }

    // Update streak if it's a new day
    const today = new Date().toISOString().split('T')[0]
    if (currentStats.last_activity_date !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      if (currentStats.last_activity_date === yesterday) {
        updates.streak_days = (currentStats.streak_days || 0) + 1
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

export const publishRecipe = async (userId, recipe) => {
  console.log('📤 Publishing recipe to library')
  
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
    status: 'pending' // Will need approval
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
  
  console.log('✅ Recipe published successfully!')
  return data
}

export const getRecipeLibrary = async (sortBy = 'recent') => {
  console.log('📚 Fetching recipe library, sortBy:', sortBy)
  
  try {
    let query = supabase
      .from('recipes')
      .select(`
        *,
        recipe_ratings(rating)
      `)
      .eq('status', 'approved')

    switch (sortBy) {
      case 'popular':
        query = query.order('save_count', { ascending: false })
        break
      case 'topRated':
        query = query.order('view_count', { ascending: false })
        break
      default: // recent
        query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching recipe library:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      throw error
    }

    console.log('✅ Fetched recipes:', data?.length || 0)

    // Calculate average rating for each recipe
    const recipes = (data || []).map(recipe => ({
      ...recipe,
      author_name: recipe.author_name || 'Anonymous',
      average_rating: recipe.recipe_ratings?.length 
        ? (recipe.recipe_ratings.reduce((sum, r) => sum + r.rating, 0) / recipe.recipe_ratings.length).toFixed(1)
        : 0,
      rating_count: recipe.recipe_ratings?.length || 0
    }))
    
    return recipes
  } catch (err) {
    console.error('❌ Exception in getRecipeLibrary:', err)
    throw err
  }
}

export const saveRecipeFromLibrary = async (userId, recipe) => {
  console.log('📤 Saving recipe from library to personal collection')
  console.log('User ID:', userId)
  console.log('Recipe ID:', recipe.id)
  console.log('Recipe title:', recipe.title)
  
  // First, save to saved_recipes
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

  console.log('💾 Inserting into saved_recipes...')
  const { data: savedRecipe, error: saveError } = await supabase
    .from('saved_recipes')
    .insert(recipeData)
    .select()
    .single()

  if (saveError) {
    console.error('❌ Error saving to saved_recipes:', saveError)
    throw saveError
  }
  
  console.log('✅ Saved to saved_recipes:', savedRecipe.id)

  // Track the save in recipe_library_saves
  console.log('📝 Tracking save in recipe_library_saves...')
  const { error: trackError } = await supabase
    .from('recipe_library_saves')
    .insert({
      recipe_id: recipe.id,
      user_id: userId,
      saved_recipe_id: savedRecipe.id
    })

  if (trackError && trackError.code !== '23505') { // Ignore duplicate key error
    console.error('⚠️ Error tracking recipe save:', trackError)
  } else if (!trackError) {
    console.log('✅ Tracked in recipe_library_saves')
  } else {
    console.log('ℹ️ Recipe already saved (duplicate key)')
  }

  console.log('✅ Recipe saved successfully!')
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

export const getWaterLog = async (userId, date = new Date().toISOString().split('T')[0]) => {
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
  const date = new Date().toISOString().split('T')[0]
  
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
    .gte('date', startDate.toISOString().split('T')[0])
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
  const { data, error } = await supabase
    .from('meal_plans')
    .select(`
      *,
      recipe:recipe_id (
        id,
        title,
        description,
        prep_time,
        cook_time,
        servings,
        ingredients
      )
    `)
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching meal plan:', error)
    return []
  }
  return data || []
}

export const addMealToPlan = async (userId, date, mealType, recipeId = null, customMeal = null, notes = null) => {
  const { data, error } = await supabase
    .from('meal_plans')
    .upsert({
      user_id: userId,
      date,
      meal_type: mealType,
      recipe_id: recipeId,
      custom_meal: customMeal,
      notes
    }, { onConflict: 'user_id,date,meal_type' })
    .select(`
      *,
      recipe:recipe_id (
        id,
        title,
        description,
        prep_time,
        cook_time
      )
    `)
    .single()

  if (error) {
    console.error('Error adding meal to plan:', error)
    throw error
  }
  return data
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
  const { data, error } = await supabase
    .from('meal_plans')
    .select(`
      recipe:recipe_id (
        ingredients
      )
    `)
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .not('recipe_id', 'is', null)

  if (error) {
    console.error('Error fetching shopping list:', error)
    return []
  }

  // Flatten all ingredients
  const allIngredients = data
    ?.flatMap(m => m.recipe?.ingredients || [])
    .filter(Boolean) || []

  return allIngredients
}