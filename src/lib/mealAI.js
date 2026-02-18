import { supabase } from './supabase'

/**
 * Call the server-side Gemini AI edge function.
 */
async function callAI(action, params) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')

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
  if (!result.success) throw new Error(result.error || 'AI request failed')
  return result.data
}

/**
 * Estimate nutrition from a food description using AI
 */
export const estimateNutrition = async (description, portionSize = '', mealType = '') => {
  try {
    const data = await callAI('estimate-nutrition', { description, portionSize, mealType })
    return { success: true, nutrition: data }
  } catch (error) {
    console.error('Nutrition estimation error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Look up a product by barcode (Open Food Facts + AI fallback)
 */
export const lookupBarcode = async (barcode) => {
  try {
    const data = await callAI('lookup-barcode', { barcode })
    return { success: true, product: data }
  } catch (error) {
    console.error('Barcode lookup error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Upload a meal photo to Supabase Storage
 */
export const uploadMealPhoto = async (userId, file) => {
  try {
    const ext = file.type === 'image/png' ? 'png' : 'jpg'
    const filePath = `${userId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('meal-photos')
      .upload(filePath, file, { contentType: file.type, upsert: false })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('meal-photos')
      .getPublicUrl(filePath)

    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error('Photo upload error:', error)
    return { success: false, error: error.message }
  }
}
