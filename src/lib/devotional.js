import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

/**
 * Generate a daily devotional using Gemini AI
 * Returns: { verse, reference, reflection }
 */
export const generateDevotional = async (theme = null) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = theme 
      ? createThemedPrompt(theme)
      : createGeneralPrompt()

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the response (expecting JSON format)
    const devotional = parseDevotionalResponse(text)
    
    return {
      success: true,
      data: devotional
    }
  } catch (error) {
    console.error('Error generating devotional:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Create a themed prompt (for weekly themes)
 */
const createThemedPrompt = (theme) => {
  // Use day-of-week to get variety across the week
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const today = dayNames[new Date().getDay()]
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)

  return `You are a pastoral, Christ-centered devotional writer for Temple Keepers, a Christian wellness app.

THEME FOR THIS WEEK: "${theme.title}"
WEEKLY SCRIPTURE: ${theme.scripture} (${theme.reference})
TODAY IS: ${today} (day seed: ${dayOfYear})

Generate a FRESH daily devotional that:
1. Is inspired by the weekly theme but offers a UNIQUE angle for today
2. Uses the weekly scripture as the verse, but the reflection must feel fresh and specific to this day
3. Is 2-3 sentences of gentle, encouraging reflection
4. Connects spiritual truth to physical wellness (nutrition, rest, movement, or self-care)
5. Uses pastoral, trauma-aware, shame-resistant language

IMPORTANT: The reflection should NOT simply restate the scripture. It should offer a practical, personal insight that helps someone apply the theme to their body and health TODAY.

Return ONLY valid JSON in this exact format:
{
  "verse": "${theme.scripture}",
  "reference": "${theme.reference}",
  "reflection": "Your 2-3 sentence reflection here..."
}

TONE GUIDELINES:
- Warm, not preachy
- Grace-centered, not performance-based
- "Consider" not "You must"
- "Gentle invitation" not "command"
- Christ-honoring without being heavy-handed

Generate the devotional now:`
}

/**
 * Create a general prompt (when no theme is active)
 */
const createGeneralPrompt = () => {
  const scriptures = [
    {
      verse: "Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God?",
      reference: "1 Corinthians 6:19 (NKJV)"
    },
    {
      verse: "Therefore, whether you eat or drink, or whatever you do, do all to the glory of God.",
      reference: "1 Corinthians 10:31 (NKJV)"
    },
    {
      verse: "Beloved, I pray that you may prosper in all things and be in health, just as your soul prospers.",
      reference: "3 John 1:2 (NKJV)"
    },
    {
      verse: "He gives power to the weak, and to those who have no might He increases strength.",
      reference: "Isaiah 40:29 (NKJV)"
    },
    {
      verse: "I can do all things through Christ who strengthens me.",
      reference: "Philippians 4:13 (NKJV)"
    },
    {
      verse: "For God has not given us a spirit of fear, but of power and of love and of a sound mind.",
      reference: "2 Timothy 1:7 (NKJV)"
    },
    {
      verse: "But those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles.",
      reference: "Isaiah 40:31 (NKJV)"
    }
  ]

  // Rotate through scriptures based on day of year
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const scripture = scriptures[dayOfYear % scriptures.length]

  return `You are a pastoral, Christ-centered devotional writer for Temple Keepers, a Christian wellness app.

TODAY'S SCRIPTURE:
"${scripture.verse}"
— ${scripture.reference}

Generate a daily devotional that:
1. Reflects on this Scripture in the context of stewarding the body as God's temple
2. Is 2-3 sentences of gentle, encouraging reflection
3. Connects spiritual truth to physical wellness
4. Uses pastoral, trauma-aware, shame-resistant language
5. Honors the user's journey without demanding perfection

Return ONLY valid JSON in this exact format:
{
  "verse": "${scripture.verse}",
  "reference": "${scripture.reference}",
  "reflection": "Your 2-3 sentence reflection here..."
}

TONE GUIDELINES:
- Warm and compassionate, not preachy
- Grace-centered: "You are loved as you are"
- Invitational: "Consider..." not "You must..."
- Acknowledges difficulty: "This isn't easy, but..."
- Christ-honoring without being heavy-handed
- Gentle even on hard days

FORBIDDEN LANGUAGE:
❌ "You should..."
❌ "You need to..."
❌ "Try harder..."
❌ "Just..." (minimizing)
❌ Shame or guilt

ENCOURAGED LANGUAGE:
✅ "You might consider..."
✅ "Today, if you're able..."
✅ "Grace meets you here..."
✅ "One gentle step..."
✅ "Your body is worth caring for..."

Generate the devotional now:`
}

/**
 * Parse Gemini response and extract devotional data
 */
const parseDevotionalResponse = (text) => {
  try {
    // Remove markdown code fences if present
    let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    // Parse JSON
    const devotional = JSON.parse(cleanText)
    
    // Validate structure
    if (!devotional.verse || !devotional.reference || !devotional.reflection) {
      throw new Error('Invalid devotional structure')
    }
    
    return devotional
  } catch (error) {
    console.error('Error parsing devotional:', error)
    // Return fallback
    return getFallbackDevotional()
  }
}

/**
 * Fallback devotional if AI fails
 */
const getFallbackDevotional = () => {
  return {
    verse: "Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God?",
    reference: "1 Corinthians 6:19 (NKJV)",
    reflection: "Your body is a sacred gift, entrusted to you by the Creator. Today, consider one gentle way to honor this temple—not through perfection, but through faithful presence."
  }
}

/**
 * Get fallback devotional (exported for use elsewhere)
 */
export { getFallbackDevotional }
