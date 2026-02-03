import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useRecipes = () => {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)

  // Get all recipes (with filters)
  const getRecipes = async (filters = {}) => {
    setLoading(true)
    
    let query = supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.mealType) {
      query = query.eq('meal_type', filters.mealType)
    }
    
    if (filters.cuisine) {
      query = query.eq('cuisine', filters.cuisine)
    }
    
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }
    
    if (filters.maxTime) {
      query = query.lte('total_time', filters.maxTime)
    }
    
    if (filters.dietaryTags && filters.dietaryTags.length > 0) {
      query = query.contains('dietary_tags', filters.dietaryTags)
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    
    if (!error && data) {
      setRecipes(data)
    }
    
    setLoading(false)
    return { data, error }
  }

  // Get single recipe
  const getRecipe = async (id) => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  }

  // Create recipe
  const createRecipe = async (recipeData) => {
    const { data, error } = await supabase
      .from('recipes')
      .insert([{
        ...recipeData,
        created_by: user?.id
      }])
      .select()
      .single()

    if (!error) {
      await getRecipes()
    }

    return { data, error }
  }

  // Update recipe
  const updateRecipe = async (id, updates) => {
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!error) {
      await getRecipes()
    }

    return { data, error }
  }

  // Delete recipe
  const deleteRecipe = async (id) => {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)

    if (!error) {
      await getRecipes()
    }

    return { error }
  }

  // Get user's favorite recipes
  const getFavorites = async () => {
    if (!user) return { data: null, error: null }

    const { data, error } = await supabase
      .from('user_favorite_recipes')
      .select(`
        *,
        recipes (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return { data, error }
  }

  // Add recipe to favorites
  const addToFavorites = async (recipeId) => {
    if (!user) return { error: new Error('Not authenticated') }

    const { data, error } = await supabase
      .from('user_favorite_recipes')
      .insert([{
        user_id: user.id,
        recipe_id: recipeId
      }])
      .select()
      .single()

    return { data, error }
  }

  // Remove recipe from favorites
  const removeFromFavorites = async (recipeId) => {
    if (!user) return { error: new Error('Not authenticated') }

    const { error } = await supabase
      .from('user_favorite_recipes')
      .delete()
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)

    return { error }
  }

  // Check if recipe is favorited
  const isFavorited = async (recipeId) => {
    if (!user) return { favorited: false }

    const { data, error } = await supabase
      .from('user_favorite_recipes')
      .select('id')
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)
      .maybeSingle()

    return { favorited: !!data, error }
  }

  // Get recipes for a specific program day
  const getDayRecipes = async (programId, dayNumber) => {
    const { data, error } = await supabase
      .from('program_days')
      .select(`
        linked_recipes,
        recipes:linked_recipes (*)
      `)
      .eq('program_id', programId)
      .eq('day_number', dayNumber)
      .single()

    return { data: data?.recipes || [], error }
  }

  return {
    recipes,
    loading,
    getRecipes,
    getRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    getFavorites,
    addToFavorites,
    removeFromFavorites,
    isFavorited,
    getDayRecipes
  }
}
