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
      model: 'gemini-2.0-flash',
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
    const feelLikeEating = preferences.feelLikeEating || ''
    const excludeIngredients = preferences.excludeIngredients || ''
    const prepTimeRange = preferences.prepTimeRange || ''
    
    // Add randomness factor to ensure unique recipes each time
    const randomSeed = Math.random().toString(36).substring(7)
    const timeStamp = Date.now()
    
    let promptDetails = `Create a UNIQUE and ORIGINAL healthy ${mealType} recipe.`
    
    if (feelLikeEating) {
      promptDetails += ` The user is in the mood for: ${feelLikeEating}.`
    }
    
    if (cuisine) {
      promptDetails += ` The cuisine style should be ${cuisine}.`
    }
    
    if (dietary) {
      promptDetails += ` The recipe MUST be: ${dietary}.`
    }
    
    if (ingredients) {
      promptDetails += ` Try to incorporate these ingredients: ${ingredients}.`
    }
    
    if (excludeIngredients) {
      promptDetails += ` IMPORTANT: Do NOT use any of these ingredients: ${excludeIngredients}.`
    }
    
    if (prepTimeRange) {
      const timeRanges = {
        'quick': 'under 20 minutes total time (prep + cook)',
        'medium': 'between 20-40 minutes total time',
        'relaxed': 'between 40-60 minutes total time',
        'long': 'over 60 minutes total time'
      }
      promptDetails += ` The recipe should take ${timeRanges[prepTimeRange] || 'any amount of time'}.`
    }
    
    if (healthGoals) {
      promptDetails += ` The recipe should support these health goals: ${healthGoals}.`
    }
    
    promptDetails += ` Be creative and generate something different from common recipes. Unique ID for this request: ${randomSeed}-${timeStamp}.`

    const prompt = `${promptDetails}

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{"title":"Creative Recipe Name","description":"Appetizing description of the dish","prepTime":"X min","cookTime":"X min","servings":"X","ingredients":["quantity ingredient","quantity ingredient"],"instructions":["Detailed step 1","Detailed step 2"],"benefits":["Specific health benefit 1","Specific health benefit 2","Specific health benefit 3"],"nutritionInfo":{"calories":"XXX","protein":"XXg","carbs":"XXg","fiber":"Xg"},"micronutrients":{"vitamin_a":"X% DV","vitamin_c":"X% DV","iron":"X% DV","potassium":"X% DV","calcium":"X% DV"}}`

    console.log('🍳 Generating recipe with preferences:', { mealType, dietary, cuisine, ingredients, healthGoals, feelLikeEating, excludeIngredients, prepTimeRange })
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    console.log('📝 Got response:', text.substring(0, 150))
    
    const recipe = parseGeminiJSON(text)
    console.log('✅ Recipe parsed:', recipe.title)
    return { recipe, error: null }
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message)
    console.error('Full error:', error)
    
    // Return error instead of silent fallback so user knows there's an issue
    return { 
      recipe: null, 
      error: `Recipe generation failed: ${error.message}. Please check that the Gemini API key is valid and try again.`
    }
  }
}

export const generateDevotional = async (theme = 'general wellness') => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash'
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

export const generateInspiration = async (type, data) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.9,
      }
    })

    let prompt = ''
    
    if (type === 'goal') {
      prompt = `You are creating inspirational content for a Christian wellness app called Temple Keepers. 
      
A user has set a goal: "${data.title}"${data.description ? ` - ${data.description}` : ''}
Target: ${data.target_value} ${data.metric || ''}
Current Progress: ${data.current_value || 0}/${data.target_value}

Generate an uplifting, faith-based inspirational message to motivate them. Include:
- A relevant Bible verse
- Encouragement specific to their goal
- Practical wisdom

Keep it warm, personal, and faith-centered. Return ONLY valid JSON:
{"message":"2-3 sentences of encouragement","scripture":"A relevant Bible verse (full text)","scriptureReference":"Book 1:1","wisdom":"One practical tip or insight"}`
    } else if (type === 'habit') {
      prompt = `You are creating inspirational content for a Christian wellness app called Temple Keepers.

A user is building a habit: "${data.title}"
${data.tiny_behavior ? `They will: ${data.tiny_behavior}` : ''}
${data.cue ? `After: ${data.cue}` : ''}
${data.reward ? `Celebrating with: ${data.reward}` : ''}
Current Streak: ${data.current_streak || 0} days

Generate an uplifting, faith-based inspirational message to encourage them. Include:
- A relevant Bible verse
- Encouragement specific to habit building
- Practical wisdom about consistency

Keep it warm, personal, and faith-centered. Return ONLY valid JSON:
{"message":"2-3 sentences of encouragement","scripture":"A relevant Bible verse (full text)","scriptureReference":"Book 1:1","wisdom":"One practical tip about habit formation"}`
    }

    console.log(`✨ Generating ${type} inspiration...`)
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    
    const inspiration = parseGeminiJSON(text)
    console.log(`✅ Inspiration generated: ${inspiration.message.substring(0, 50)}...`)
    return { inspiration, error: null }
    
  } catch (error) {
    console.error('❌ Inspiration generation failed:', error.message)
    
    const fallbackInspiration = {
      message: type === 'goal' 
        ? "Your journey matters to God. Every step forward is a testament to your commitment to honor Him with your body, His temple. Keep moving forward with faith!"
        : "Small, consistent steps lead to lasting transformation. God sees your faithfulness in the little things. Keep building this habit one day at a time!",
      scripture: type === 'goal'
        ? "Let us run with perseverance the race marked out for us, fixing our eyes on Jesus."
        : "Whatever you do, work at it with all your heart, as working for the Lord.",
      scriptureReference: type === 'goal' ? "Hebrews 12:1-2" : "Colossians 3:23",
      wisdom: type === 'goal'
        ? "Celebrate small wins along the way - progress, not perfection, is what matters."
        : "Stack this habit with something you already do daily to make it automatic."
    }
    
    console.log('📋 Using fallback inspiration')
    return { inspiration: fallbackInspiration, error: null }
  }
}
