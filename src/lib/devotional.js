import { supabase } from './supabase'

/**
 * Call the server-side Gemini AI edge function for devotionals.
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
 * Generate a daily devotional using server-side Gemini AI
 * Returns: { verse, reference, reflection }
 */
export const generateDevotional = async (theme = null) => {
  try {
    const devotional = await callAI('generate-devotional', { theme })

    // Validate structure
    if (!devotional.verse || !devotional.reference || !devotional.reflection) {
      throw new Error('Invalid devotional structure')
    }

    return {
      success: true,
      data: devotional
    }
  } catch (error) {
    console.error('Error generating devotional:', error)
    return {
      success: false,
      error: error.message,
      data: getFallbackDevotional()
    }
  }
}

/**
 * Fallback devotional if AI fails
 */
const getFallbackDevotional = () => {
  return {
    verse: "Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God?",
    reference: "1 Corinthians 6:19 (NKJV)",
    reflection: "Your body is a sacred gift, entrusted to you by the Creator. Today, consider one gentle way to honour this temple — not through perfection, but through faithful presence."
  }
}

/**
 * Get fallback devotional (exported for use elsewhere)
 */
export { getFallbackDevotional }
