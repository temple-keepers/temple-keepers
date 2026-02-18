import { supabase } from './supabase'

/**
 * Call the server-side Gemini AI edge function.
 * API key is kept server-side — never exposed to the browser.
 */
async function callAI(action, params) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-ai`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ action, params }),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `AI request failed: ${res.status}`)
  }

  const result = await res.json()
  if (!result.success) throw new Error(result.error || 'AI generation failed')
  return result.data
}

/**
 * Normalise AI response to include BOTH camelCase (for preview) and snake_case (for DB).
 * The edge function already normalises instructions, but field names may vary.
 */
function normaliseRecipe(recipe) {
  return {
    ...recipe,
    // Ensure both camelCase and snake_case exist for every field
    prep_time: recipe.prep_time ?? recipe.prepTime ?? 0,
    cook_time: recipe.cook_time ?? recipe.cookTime ?? 0,
    total_time: recipe.total_time ?? recipe.totalTime ?? 0,
    meal_type: recipe.meal_type ?? recipe.mealType ?? '',
    dietary_tags: recipe.dietary_tags ?? recipe.dietaryTags ?? [],
    // camelCase aliases for preview components
    prepTime: recipe.prep_time ?? recipe.prepTime ?? 0,
    cookTime: recipe.cook_time ?? recipe.cookTime ?? 0,
    totalTime: recipe.total_time ?? recipe.totalTime ?? 0,
    mealType: recipe.meal_type ?? recipe.mealType ?? '',
    dietaryTags: recipe.dietary_tags ?? recipe.dietaryTags ?? [],
    // Normalise instructions: ensure "instruction" field exists
    instructions: (recipe.instructions || []).map(inst => ({
      step: inst.step,
      instruction: inst.instruction || inst.text || '',
      time_minutes: inst.time_minutes || null,
    })),
  }
}

export const generateRecipe = async ({
  mealType = 'dinner',
  dietaryRestrictions = [],
  cuisine = 'any',
  cookingTime = 30,
  servings = 4,
  includeIngredients = [],
  excludeIngredients = [],
  previousRecipeTitles = [],
  craving = ''
}) => {
  try {
    const recipe = await callAI('generate-recipe', {
      mealType, dietaryRestrictions, cuisine, cookingTime, servings,
      includeIngredients, excludeIngredients, previousRecipeTitles, craving,
    })
    return { success: true, recipe: normaliseRecipe(recipe) }
  } catch (error) {
    console.error('Recipe generation error:', error)
    return { success: false, error: error.message || 'Failed to generate recipe' }
  }
}

export const generateMealPlan = async ({
  days = 7,
  mealsPerDay = ['breakfast', 'lunch', 'dinner'],
  dietaryRestrictions = [],
  preferences = {}
}) => {
  try {
    const mealPlan = await callAI('generate-meal-plan', {
      days, mealsPerDay, dietaryRestrictions, preferences,
    })
    return { success: true, mealPlan }
  } catch (error) {
    console.error('Meal plan generation error:', error)
    return { success: false, error: error.message || 'Failed to generate meal plan' }
  }
}

export const generateRecipeImage = async (recipeId, title, description, mealType, cuisine) => {
  try {
    const { base64, mimeType } = await callAI('generate-recipe-image', {
      title, description, mealType, cuisine,
    })

    // Decode base64 and upload to Supabase Storage
    const binaryStr = atob(base64)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }

    const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png'
    const filePath = `${recipeId}/hero.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(filePath, bytes, { contentType: mimeType, upsert: true })

    if (uploadError) {
      return { success: false, error: `Upload failed: ${uploadError.message}` }
    }

    const { data: urlData } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(filePath)

    const imageUrl = urlData.publicUrl

    const { error: updateError } = await supabase
      .from('recipes')
      .update({ image_urls: [imageUrl] })
      .eq('id', recipeId)

    if (updateError) {
      return { success: false, error: `Recipe update failed: ${updateError.message}` }
    }

    return { success: true, imageUrl }
  } catch (error) {
    console.error('Image generation error:', error)
    return { success: false, error: error.message }
  }
}

export const scaleIngredients = async (ingredients, originalServings, targetServings) => {
  try {
    const scaled = await callAI('scale-ingredients', {
      ingredients, originalServings, targetServings,
    })
    if (!Array.isArray(scaled) || scaled.length === 0) return null
    return scaled
  } catch (error) {
    console.error('Ingredient scaling error:', error)
    return null
  }
}

export const adjustRecipeForDiet = async (recipe, newDietaryRestrictions) => {
  try {
    const adjustedRecipe = await callAI('adjust-recipe', {
      recipe, dietaryRestrictions: newDietaryRestrictions,
    })
    return { success: true, recipe: adjustedRecipe }
  } catch (error) {
    console.error('Recipe adjustment error:', error)
    return { success: false, error: error.message || 'Failed to adjust recipe' }
  }
}
