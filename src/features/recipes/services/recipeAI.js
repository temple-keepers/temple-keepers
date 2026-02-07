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
  includeScripture = true
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

    const prompt = `
Create a healthy, delicious ${mealType} recipe with the following parameters:
- Cuisine: ${cuisine}
- Dietary restrictions: ${dietaryText}
- Must include: ${includeText}
- Avoid: ${excludeText}
- Cooking time: ~${cookingTime} minutes
- Servings: ${servings}

${includeScripture ? `
IMPORTANT: Include a relevant NKJV Scripture verse that connects faith and body stewardship.
The scripture should relate to gratitude, provision, or caring for the body as God's temple.
` : ''}

Format as JSON with this structure:
{
  "title": "Recipe name",
  "description": "Brief description (2-3 sentences)",
  "prepTime": number (minutes),
  "cookTime": number (minutes),
  "totalTime": number (minutes),
  "servings": number,
  "difficulty": "Easy|Medium|Hard",
  "cuisine": "cuisine type",
  "dietaryTags": ["tag1", "tag2"],
  "ingredients": [
    {
      "item": "ingredient name",
      "amount": "quantity",
      "unit": "measurement"
    }
  ],
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
  ${includeScripture ? `
  "scripture": {
    "reference": "Book Chapter:Verse (NKJV)",
    "text": "Full verse text",
    "reflection": "1-2 sentences connecting the verse to nourishing the body"
  },
  ` : ''}
  "tips": ["tip1", "tip2"],
  "notes": "Any special notes or variations"
}

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
- Faith-based wellness approach

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
  "prepTips": ["tip1", "tip2"],
  "scripture": {
    "reference": "NKJV verse reference",
    "text": "Verse text",
    "theme": "Weekly theme (e.g., 'Gratitude & Provision')"
  }
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
