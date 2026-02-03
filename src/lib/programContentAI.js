import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

/**
 * Generate Scripture suggestions based on day theme
 */
export const generateScriptureSuggestions = async ({ dayNumber, title, theme, programType }) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })

    const prompt = `You are a pastoral content assistant for Temple Keepers, a Christian wellness platform.

PROGRAM TYPE: ${programType}
DAY ${dayNumber}: ${title}
THEME: ${theme || 'General spiritual wellness'}

Suggest 2-3 NKJV Scripture passages (1-3 verses each) that:
1. Align with today's theme
2. Are pastoral and encouraging
3. Connect faith to daily life and body stewardship
4. Avoid shame or condemnation

Return ONLY valid JSON (no markdown, no backticks):
{
  "suggestions": [
    {
      "reference": "2 Corinthians 10:5",
      "text": "Full NKJV text here...",
      "why": "Brief explanation of why this fits"
    }
  ]
}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Clean and parse response
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleanText)
    
    return {
      success: true,
      data: parsed.suggestions
    }
  } catch (error) {
    console.error('Error generating scripture:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Generate Focus Thought (2-4 lines explaining why today matters)
 */
export const generateFocusThought = async ({ scripture, title, theme }) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })

    const prompt = `Generate a 2-4 line "Focus Thought" for a Christian wellness program day.

THEME: ${title}
SCRIPTURE: ${scripture}

Guidelines:
- Plain, pastoral language (warm shepherd, not preachy teacher)
- Explains why today matters
- Connects Scripture to real life and body stewardship
- Grace-centered, not performance-based
- 2-4 sentences maximum

Return ONLY the focus thought text (no JSON, no formatting).`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()
    
    return {
      success: true,
      data: text
    }
  } catch (error) {
    console.error('Error generating focus thought:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Generate Prayer Prompt
 */
export const generatePrayer = async ({ scripture, title, theme }) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })

    const prompt = `Write a sincere, conversational prayer (4-6 lines) for a Christian wellness program day.

THEME: ${title}
SCRIPTURE: ${scripture}

Guidelines:
- Written prayer users can pray aloud
- Honest and accessible (not flowery or overly religious)
- Addresses God directly ("Father," "Lord," "Jesus")
- Connects to today's theme
- Removes hesitation for people who don't know how to pray

Return ONLY the prayer text (no JSON, no formatting).`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()
    
    return {
      success: true,
      data: text
    }
  } catch (error) {
    console.error('Error generating prayer:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Generate Reflection Questions (1-2 heart-level questions)
 */
export const generateReflectionQuestions = async ({ scripture, title, theme, actionStep }) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })

    const prompt = `Create 1-2 heart-level reflection questions for a Christian wellness program day.

THEME: ${title}
SCRIPTURE: ${scripture}
ACTION STEP: ${actionStep || 'Not specified yet'}

Guidelines:
- Questions that require introspection (not yes/no)
- Safe to answer honestly
- Connect Scripture to personal life
- Transformation-focused, not just information
- Examples:
  GOOD: "What lie have you believed that God wants to replace with truth?"
  BAD: "Do you believe God's promises?" (too surface, yes/no)

Return ONLY valid JSON array (no markdown, no backticks):
["Question 1 here", "Question 2 here"]`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Clean and parse response
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleanText)
    
    return {
      success: true,
      data: Array.isArray(parsed) ? parsed : [parsed]
    }
  } catch (error) {
    console.error('Error generating reflection questions:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Generate Action Step
 */
export const generateActionStep = async ({ scripture, title, theme }) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })

    const prompt = `Suggest one small, doable action step for a Christian wellness program day.

THEME: ${title}
SCRIPTURE: ${scripture}

Guidelines:
- Clear and specific (not vague)
- Completable in 5-15 minutes
- Connects spiritual truth to daily life
- Not overwhelming
- Actionable today

Examples:
GOOD: "Write down one lie you've believed and replace it with God's truth"
BAD: "Spend time with God today" (too vague)

Return ONLY the action step text (no JSON, no formatting).`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()
    
    return {
      success: true,
      data: text
    }
  } catch (error) {
    console.error('Error generating action step:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Generate Completion Message
 */
export const generateCompletionMessage = async ({ title }) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })

    const prompt = `Write a warm, encouraging completion message (1-2 sentences) for someone who just finished a day in a Christian wellness program.

DAY THEME: ${title}

Guidelines:
- Warm and affirming
- Grace-based (not performance-based)
- Acknowledges their obedience
- Points to God's faithfulness
- 1-2 sentences

Return ONLY the message text (no JSON, no formatting).`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()
    
    return {
      success: true,
      data: text
    }
  } catch (error) {
    console.error('Error generating completion message:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Generate entire day content at once (optional batch generation)
 */
export const generateFullDayContent = async ({ dayNumber, title, theme, programType, includesFasting }) => {
  try {
    // Generate scripture first
    const scriptureResult = await generateScriptureSuggestions({ dayNumber, title, theme, programType })
    
    if (!scriptureResult.success || !scriptureResult.data.length) {
      throw new Error('Failed to generate scripture')
    }

    const scripture = scriptureResult.data[0] // Use first suggestion
    
    // Generate other sections in parallel
    const [focusThought, prayer, reflectionQuestions, actionStep, completionMessage] = await Promise.all([
      generateFocusThought({ scripture: scripture.text, title, theme }),
      generatePrayer({ scripture: scripture.text, title, theme }),
      generateReflectionQuestions({ scripture: scripture.text, title, theme }),
      generateActionStep({ scripture: scripture.text, title, theme }),
      generateCompletionMessage({ title })
    ])

    return {
      success: true,
      data: {
        scripture_reference: scripture.reference,
        scripture_text: scripture.text,
        focus_thought: focusThought.success ? focusThought.data : '',
        prayer_text: prayer.success ? prayer.data : '',
        reflection_questions: reflectionQuestions.success ? reflectionQuestions.data : [],
        action_step: actionStep.success ? actionStep.data : '',
        completion_message: completionMessage.success ? completionMessage.data : '',
        fasting_reminder: includesFasting ? 'Remember your fast today. Stay hydrated and trust in God\'s strength.' : ''
      }
    }
  } catch (error) {
    console.error('Error generating full day content:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
