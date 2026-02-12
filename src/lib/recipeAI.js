import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export const generateRecipe = async ({
  mealType = 'dinner',
  dietaryRestrictions = [],
  cuisine = 'any',
  cookingTime = 30,
  servings = 4,
  includeIngredients = [],
  excludeIngredients = [],
  previousRecipeTitles = []
}) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const dietaryText = dietaryRestrictions.length > 0
      ? dietaryRestrictions.join(', ')
      : 'no restrictions'

    const includeText = includeIngredients.length > 0
      ? includeIngredients.join(', ')
      : 'none specified'

    const excludeText = excludeIngredients.length > 0
      ? excludeIngredients.join(', ')
      : 'none specified'

    const avoidDuplicatesText = previousRecipeTitles.length > 0
      ? `\n\nIMPORTANT: Do NOT create any of these recipes (already generated): ${previousRecipeTitles.map(t => `"${t}"`).join(', ')}. Create something COMPLETELY DIFFERENT with a different name, different main ingredients, and a different cooking style.\n`
      : ''

    const prompt = `
Create a healthy, delicious ${mealType} recipe with the following parameters:${avoidDuplicatesText}
- Cuisine: ${cuisine}
- Dietary restrictions: ${dietaryText}
- Must include: ${includeText}
- Avoid: ${excludeText}
- Cooking time: ~${cookingTime} minutes
- Servings: ${servings}

CRITICAL HEALTH REQUIREMENTS:
- This recipe MUST be genuinely healthy and nutritious. No junk food, no heavily processed ingredients.
- Use whole, unprocessed ingredients wherever possible.
- Minimise or eliminate: refined sugar, white flour, artificial additives, trans fats, processed seed oils, excessive sodium.
- Prioritise: vegetables, leafy greens, quality proteins, healthy fats (olive oil, avocado, coconut oil, nuts), whole grains, herbs and spices.
- Aim for nutrient density — every ingredient should contribute vitamins, minerals, fibre, or quality macronutrients.
- If the meal type is "dessert" or "snack", use natural sweetness from fruits, dates, or raw honey only — no refined sugar.

Format as JSON with this structure:
{
  "title": "Recipe name",
  "description": "Brief description (2-3 sentences)",
  "prepTime": number (minutes),
  "cookTime": number (minutes),
  "totalTime": number (minutes),
  "servings": number,
  "difficulty": "Easy" or "Medium" or "Hard" (use exact casing),
  "cuisine": "cuisine type",
  "dietaryTags": ["tag1", "tag2"],
  "ingredients": [
    {
      "item": "ingredient name (JUST the ingredient, no prep instructions like 'diced' or 'cut into cubes')",
      "amount": number (MUST be a plain number like 2 or 0.5, NEVER text like '2-3' or '1/2' or '3 lbs'),
      "unit": "measurement (e.g. g, kg, ml, l, tsp, tbsp, cup, lb, oz, piece, clove, can)"
    }
  ],

  CRITICAL INGREDIENT RULES:
  - "item" must be ONLY the ingredient name. NO prep instructions (chopped, diced, sliced, minced, cut into cubes, etc). NO size descriptions (medium, large). NO weight conversions (about 680g). Put prep details in the recipe instructions instead.
  - "amount" MUST be a plain number (e.g. 2, 0.5, 250). NEVER a string, NEVER a range like "2-3", NEVER include units in the amount.
  - "unit" must be a standard unit. Use "piece" for whole items like eggs or onions.
  - GOOD: {"item": "chicken breast", "amount": 680, "unit": "g"}
  - BAD:  {"item": "Boneless, skinless chicken breasts, cut into 1-inch cubes", "amount": "3 lbs (about 680g)", "unit": ""}

  "instructions": [
    {
      "step": 1,
      "instruction": "Step description"
    }
  ],
  "nutrition": {
    "calories": number,
    "protein": "Xg",
    "carbs": "Xg",
    "fat": "Xg",
    "fiber": "Xg"
  },
  "tips": ["tip1", "tip2"],
  "notes": "Any special notes or variations",
  "healthySwaps": [
    {
      "commonIngredient": "Name of a common unhealthy ingredient people typically use in this type of dish",
      "healthyAlternative": "The healthy alternative used or recommended",
      "reason": "Brief explanation of why the swap is healthier (1 sentence)"
    }
  ]
}

For "healthySwaps", include 2-4 practical swaps that are relevant to this recipe. Examples:
- White rice → Cauliflower rice (lower carb, more nutrients)
- Sour cream → Greek yoghurt (more protein, probiotics)
- Vegetable oil → Extra virgin olive oil (heart-healthy fats)
- White pasta → Courgette noodles (more fibre, fewer carbs)
- Sugar → Dates or raw honey (natural sweetness with minerals)
- White flour → Almond flour or coconut flour (lower glycaemic, more nutrients)
These should be relevant to the type of dish, not random.

Return ONLY valid JSON, no markdown formatting, no explanations.
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // Clean response
    let cleanedResponse = response.trim()
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '')
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '')
    cleanedResponse = cleanedResponse.trim()

    const recipe = JSON.parse(cleanedResponse)

    return { success: true, recipe }
  } catch (error) {
    console.error('Recipe generation error:', error)
    return {
      success: false,
      error: error.message || 'Failed to generate recipe'
    }
  }
}

export const generateMealPlan = async ({
  days = 7,
  mealsPerDay = ['breakfast', 'lunch', 'dinner'],
  dietaryRestrictions = [],
  preferences = {}
}) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const dietaryText = dietaryRestrictions.length > 0
      ? dietaryRestrictions.join(', ')
      : 'no restrictions'

    const prompt = `
Create a ${days}-day meal plan with ${mealsPerDay.join(', ')}.

Requirements:
- Dietary restrictions: ${dietaryText}
- Variety across days (no repeated meals)
- Balanced nutrition
- Realistic preparation (max 45 minutes per meal)
- Healthy, whole-food focused approach

Format as JSON:
{
  "mealPlan": [
    {
      "day": 1,
      "meals": {
        "breakfast": {
          "name": "Recipe name",
          "prepTime": 15,
          "calories": 400,
          "tags": ["quick", "protein-rich"]
        },
        "lunch": {...},
        "dinner": {...}
      }
    }
  ],
  "shoppingList": [
    {
      "category": "Proteins",
      "items": ["chicken breast (2 lbs)", "eggs (1 dozen)"]
    }
  ],
  "prepTips": ["tip1", "tip2"]
}

Return ONLY valid JSON.
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    let cleanedResponse = response.trim()
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '')
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '')
    cleanedResponse = cleanedResponse.trim()

    const mealPlan = JSON.parse(cleanedResponse)

    return { success: true, mealPlan }
  } catch (error) {
    console.error('Meal plan generation error:', error)
    return {
      success: false,
      error: error.message || 'Failed to generate meal plan'
    }
  }
}

export const generateRecipeImage = async (recipeId, title, description, mealType, cuisine) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) {
      return { success: false, error: 'Gemini API key not configured' }
    }

    const { supabase } = await import('./supabase')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Build a food photography prompt
    const imagePrompt = [
      `Professional food photography of ${title}.`,
      description || '',
      mealType ? `This is a ${mealType} dish.` : '',
      cuisine && cuisine !== 'any' ? `${cuisine} cuisine.` : '',
      'Shot from a 45-degree angle on a beautiful ceramic plate,',
      'natural soft lighting, shallow depth of field,',
      'garnished beautifully, warm inviting tones,',
      'clean modern food styling, no text, no watermarks, photorealistic.'
    ].filter(Boolean).join(' ')

    // Call Imagen API directly (client-side)
    const imagenResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          instances: [{ prompt: imagePrompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '4:3',
          },
        }),
      }
    )

    if (!imagenResponse.ok) {
      const errorText = await imagenResponse.text()
      console.error('Imagen API error:', imagenResponse.status, errorText)
      return { success: false, error: `Image API error: ${imagenResponse.status}` }
    }

    const imagenData = await imagenResponse.json()

    if (!imagenData.predictions || imagenData.predictions.length === 0) {
      return { success: false, error: 'No image generated' }
    }

    // Decode base64 image
    const base64Image = imagenData.predictions[0].bytesBase64Encoded
    const mimeType = imagenData.predictions[0].mimeType || 'image/png'
    const binaryStr = atob(base64Image)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }

    // Upload to Supabase Storage
    const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png'
    const filePath = `${recipeId}/hero.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(filePath, bytes, { contentType: mimeType, upsert: true })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return { success: false, error: `Upload failed: ${uploadError.message}` }
    }

    // Get public URL and update recipe
    const { data: urlData } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(filePath)

    const imageUrl = urlData.publicUrl

    const { error: updateError } = await supabase
      .from('recipes')
      .update({ image_urls: [imageUrl] })
      .eq('id', recipeId)

    if (updateError) {
      console.error('Recipe update error:', updateError)
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `
You are a professional chef. Adjust these recipe ingredients from ${originalServings} servings to ${targetServings} servings.

Rules:
- Use practical, real-world cooking amounts that a home cook would actually measure.
- Countable items (cloves, eggs, cans, onions, peppers) must be whole numbers. Round to the nearest sensible whole number (minimum 1).
- For measurable amounts (teaspoons, tablespoons, cups, pounds, ounces, grams, ml), use common kitchen-friendly quantities: ¼, ⅓, ½, ⅔, ¾, or whole numbers.
- If the original uses 1 can and the target is fewer servings, keep 1 can — don't use "0.5 can".
- "or to taste" items (salt, pepper, spices) should stay the same or adjust minimally — cooks will season to taste anyway.
- Keep the same unit system as the original (don't convert pounds to grams, etc).

Original ingredients (${originalServings} servings):
${JSON.stringify(ingredients)}

Return ONLY a valid JSON array with the same structure:
[{"item":"...","amount":"...","unit":"..."}]

The "amount" field should be a display-ready string like "½", "1 ½", "¼", "2", etc.
Return ONLY valid JSON, no markdown formatting, no explanations.
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    let cleaned = response.trim()
    cleaned = cleaned.replace(/```json\s*/g, '')
    cleaned = cleaned.replace(/```\s*/g, '')
    cleaned = cleaned.trim()

    const scaled = JSON.parse(cleaned)

    if (!Array.isArray(scaled) || scaled.length === 0) return null
    return scaled
  } catch (error) {
    console.error('Ingredient scaling error:', error)
    return null
  }
}

export const adjustRecipeForDiet = async (recipe, newDietaryRestrictions) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `
Adjust this recipe to meet these dietary restrictions: ${newDietaryRestrictions.join(', ')}

Original Recipe:
${JSON.stringify(recipe, null, 2)}

Provide the adjusted recipe with:
- Substitute ingredients that violate restrictions
- Adjust cooking methods if needed
- Maintain similar flavor profile
- Keep prep/cook times similar

Return ONLY valid JSON in the same format as the original recipe.
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    let cleanedResponse = response.trim()
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '')
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '')
    cleanedResponse = cleanedResponse.trim()

    const adjustedRecipe = JSON.parse(cleanedResponse)

    return { success: true, recipe: adjustedRecipe }
  } catch (error) {
    console.error('Recipe adjustment error:', error)
    return {
      success: false,
      error: error.message || 'Failed to adjust recipe'
    }
  }
}
