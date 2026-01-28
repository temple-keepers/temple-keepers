import { supabase } from './supabase'

// ============================================
// ADMIN CHALLENGE FUNCTIONS
// ============================================

// Get all challenges (including drafts)
export const getAllChallengesAdmin = async () => {
  const { data, error } = await supabase
    .from('challenges')
    .select('*, challenge_days(count)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching challenges:', error)
    return []
  }
  return data || []
}

// Get single challenge with all days
export const getChallengeWithDays = async (challengeId) => {
  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .single()

  if (challengeError) {
    console.error('Error fetching challenge:', challengeError)
    return null
  }

  const { data: days, error: daysError } = await supabase
    .from('challenge_days')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('day_number', { ascending: true })

  if (daysError) {
    console.error('Error fetching days:', daysError)
  }

  return { ...challenge, days: days || [] }
}

// Create new challenge
export const createChallenge = async (challengeData) => {
  const slug = challengeData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const { data, error } = await supabase
    .from('challenges')
    .insert({
      ...challengeData,
      slug,
      status: 'draft'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating challenge:', error)
    throw error
  }
  return data
}

// Update challenge
export const updateChallenge = async (challengeId, updates) => {
  const { data, error } = await supabase
    .from('challenges')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', challengeId)
    .select()
    .single()

  if (error) {
    console.error('Error updating challenge:', error)
    throw error
  }
  return data
}

// Delete challenge
export const deleteChallenge = async (challengeId) => {
  const { error } = await supabase
    .from('challenges')
    .delete()
    .eq('id', challengeId)

  if (error) {
    console.error('Error deleting challenge:', error)
    throw error
  }
  return true
}

// Create challenge day
export const createChallengeDay = async (dayData) => {
  const { data, error } = await supabase
    .from('challenge_days')
    .insert(dayData)
    .select()
    .single()

  if (error) {
    console.error('Error creating day:', error)
    throw error
  }
  return data
}

// Update challenge day
export const updateChallengeDay = async (dayId, updates) => {
  const { data, error } = await supabase
    .from('challenge_days')
    .update(updates)
    .eq('id', dayId)
    .select()
    .single()

  if (error) {
    console.error('Error updating day:', error)
    throw error
  }
  return data
}

// Delete challenge day
export const deleteChallengeDay = async (dayId) => {
  const { error } = await supabase
    .from('challenge_days')
    .delete()
    .eq('id', dayId)

  if (error) {
    console.error('Error deleting day:', error)
    throw error
  }
  return true
}

// Bulk create days
export const bulkCreateChallengeDays = async (days) => {
  const { data, error } = await supabase
    .from('challenge_days')
    .insert(days)
    .select()

  if (error) {
    console.error('Error bulk creating days:', error)
    throw error
  }
  return data
}

// Delete all days for a challenge (for regeneration)
export const deleteAllChallengeDays = async (challengeId) => {
  const { error } = await supabase
    .from('challenge_days')
    .delete()
    .eq('challenge_id', challengeId)

  if (error) {
    console.error('Error deleting days:', error)
    throw error
  }
  return true
}

// ============================================
// AI GENERATION FUNCTION
// ============================================

export const generateChallengeDaysWithAI = async (challenge, aiDirection) => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
  
  const prompt = `You are creating content for a Christian faith-based wellness app called "Temple Keepers". 

Generate a complete ${challenge.duration_days}-day challenge called "${challenge.title}".

Category: ${challenge.category}
Difficulty: ${challenge.difficulty}
Description: ${challenge.description}

DIRECTION FROM CREATOR:
${aiDirection}

For EACH day (1 to ${challenge.duration_days}), generate:
1. title - A compelling title for the day (max 50 chars)
2. description - Brief description of the day's focus (max 200 chars)
3. scripture - A relevant Bible verse (full text)
4. scripture_reference - The verse reference (e.g., "John 3:16")
5. reflection - A thoughtful reflection/meditation prompt (2-3 sentences)
6. tasks - Array of 4-5 actionable tasks for the day
7. tips - Array of 2-3 practical tips
8. meal_suggestions - Array of 4 meal ideas (breakfast, lunch, dinner, snack) if relevant to the challenge, otherwise empty array

IMPORTANT:
- Make the journey progressive (building from day 1 to final day)
- Day 1 should be about beginning/preparation
- Middle days should build momentum and address challenges
- Final day should be about completion, celebration, and maintaining progress
- Include variety in scriptures (Old & New Testament)
- Tasks should be specific and achievable
- Keep the Christian faith central but practical

Respond ONLY with valid JSON in this exact format:
{
  "days": [
    {
      "day_number": 1,
      "title": "...",
      "description": "...",
      "scripture": "...",
      "scripture_reference": "...",
      "reflection": "...",
      "tasks": ["task1", "task2", "task3", "task4"],
      "tips": ["tip1", "tip2", "tip3"],
      "meal_suggestions": ["Breakfast: ...", "Lunch: ...", "Dinner: ...", "Snack: ..."]
    }
  ]
}`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      }
    )

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message)
    }

    const text = data.candidates[0].content.parts[0].text
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.days
  } catch (error) {
    console.error('AI generation error:', error)
    throw error
  }
}