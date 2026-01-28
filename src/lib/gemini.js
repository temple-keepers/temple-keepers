import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

const parseGeminiJSON = (text) => {
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim()
  
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    cleaned = jsonMatch[0]
  }
  
  try {
    return JSON.parse(cleaned)
  } catch (e) {
    console.error('JSON parse failed:', e)
    throw new Error('Invalid JSON response')
  }
}

export const generateRecipe = async (preferences) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 1.0, // Higher temperature for more variety
      }
    })

    // Build a detailed prompt using all user preferences
    const mealType = preferences.mealType || 'dinner'
    const dietary = preferences.dietary?.length ? preferences.dietary.join(', ') : ''
    const cuisine = preferences.cuisine || ''
    const ingredients = preferences.ingredients || ''
    const healthGoals = preferences.healthGoals || ''
    
    // Add randomness factor to ensure unique recipes each time
    const randomSeed = Math.random().toString(36).substring(7)
    const timeStamp = Date.now()
    
    let promptDetails = `Create a UNIQUE and ORIGINAL healthy ${mealType} recipe.`
    
    if (cuisine) {
      promptDetails += ` The cuisine style should be ${cuisine}.`
    }
    
    if (dietary) {
      promptDetails += ` The recipe MUST be: ${dietary}.`
    }
    
    if (ingredients) {
      promptDetails += ` Try to incorporate these ingredients: ${ingredients}.`
    }
    
    if (healthGoals) {
      promptDetails += ` The recipe should support these health goals: ${healthGoals}.`
    }
    
    promptDetails += ` Be creative and generate something different from common recipes. Unique ID for this request: ${randomSeed}-${timeStamp}.`

    const prompt = `${promptDetails}

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{"title":"Creative Recipe Name","description":"Appetizing description of the dish","prepTime":"X min","cookTime":"X min","servings":"X","ingredients":["quantity ingredient","quantity ingredient"],"instructions":["Detailed step 1","Detailed step 2"],"benefits":["Specific health benefit 1","Specific health benefit 2","Specific health benefit 3"],"nutritionInfo":{"calories":"XXX","protein":"XXg","carbs":"XXg","fiber":"Xg"},"micronutrients":{"vitamin_a":"X% DV","vitamin_c":"X% DV","iron":"X% DV","potassium":"X% DV","calcium":"X% DV"}}`

    console.log('🍳 Generating recipe with preferences:', { mealType, dietary, cuisine, ingredients, healthGoals })
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    console.log('📝 Got response:', text.substring(0, 150))
    
    const recipe = parseGeminiJSON(text)
    console.log('✅ Recipe parsed:', recipe.title)
    return { recipe, error: null }
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message)
    
    // Fallback recipe so app still works
    const fallbackRecipe = {
      title: "Mediterranean Quinoa Bowl",
      description: "A nourishing bowl with protein and vegetables",
      prepTime: "15 min",
      cookTime: "20 min",
      servings: "4",
      ingredients: [
        "1 cup quinoa, rinsed",
        "2 cups vegetable broth",
        "1 cucumber, diced",
        "1 cup cherry tomatoes, halved",
        "1/2 red onion, diced",
        "1/2 cup kalamata olives, halved",
        "1/2 cup feta cheese, crumbled",
        "2 tablespoons olive oil",
        "Juice of 1 lemon",
        "Fresh parsley and mint",
        "Salt and pepper to taste"
      ],
      instructions: [
        "Bring vegetable broth to a boil and add quinoa",
        "Reduce heat, cover, and simmer for 15 minutes until liquid is absorbed",
        "Fluff quinoa with a fork and let cool for 5 minutes",
        "In a large bowl, combine cucumber, tomatoes, onion, and olives",
        "Add the cooled quinoa to the vegetables",
        "Drizzle with olive oil and lemon juice, toss well",
        "Top with crumbled feta cheese and fresh herbs",
        "Season with salt and pepper to taste and serve"
      ],
      benefits: [
        "Rich in plant-based protein and all essential amino acids from quinoa",
        "High in heart-healthy monounsaturated fats from olive oil",
        "Excellent source of antioxidants from fresh vegetables and herbs",
        "Supports digestive health with fiber from quinoa and vegetables"
      ],
      nutritionInfo: {
        calories: "320",
        protein: "12g",
        carbs: "45g",
        fiber: "6g"
      },
      micronutrients: {
        vitamin_a: "15% DV",
        vitamin_c: "35% DV",
        vitamin_k: "45% DV",
        iron: "20% DV",
        potassium: "12% DV",
        calcium: "10% DV"
      }
    }
    
    console.log('📋 Using fallback recipe')
    return { recipe: fallbackRecipe, error: null }
  }
}

export const generateDevotional = async (theme = 'general wellness') => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash'
    })

    const prompt = `Create a brief Christian devotional about ${theme}. Return ONLY valid JSON:
{"title":"Title","scripture":"Complete verse","scriptureReference":"Book 1:1","reflection":"2 paragraphs","prayer":"Short prayer","actionStep":"One action","affirmation":"Positive statement"}`

    console.log('📖 Generating devotional...')
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    
    const devotional = parseGeminiJSON(text)
    console.log('✅ Devotional parsed:', devotional.title)
    return { devotional, error: null }
    
  } catch (error) {
    console.error('❌ Devotional generation failed:', error.message)
    
    const fallbackDevotional = {
      title: "Strength for Today",
      scripture: "I can do all things through Christ who strengthens me.",
      scriptureReference: "Philippians 4:13",
      reflection: "In our wellness journey, we often face challenges that seem insurmountable. But we are reminded that our strength comes not from our own willpower, but from Christ within us.\n\nToday, as you make choices about your health, remember that you are not alone. God's strength is available to you in every decision, every meal, and every step forward.",
      prayer: "Lord, give me Your strength today. Help me make choices that honor You and care for the body You've given me. Amen.",
      actionStep: "Choose one healthy habit today and do it in God's strength, not your own.",
      affirmation: "I am strong in Christ, and He empowers me to make healthy choices."
    }
    
    console.log('📋 Using fallback devotional')
    return { devotional: fallbackDevotional, error: null }
  }
}
