import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Safety check for missing environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'temple-keepers-auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      debug: process.env.NODE_ENV === 'development'
    },
    global: {
      headers: {
        'x-application-name': 'temple-keepers'
      }
      // Removed custom fetch wrapper - was causing AbortError issues
      // Supabase handles timeouts internally
    },
    db: {
      schema: 'public'
    }
  }
)

// ============================================
// PROFILE FUNCTIONS
// ============================================

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching profile:', error)
    return { data: null, error }
  }
  return { data, error: null }
}

export const updateProfile = async (userId, updates) => {
  console.log('📤 Updating profile for user:', userId)
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Profile update error:', error)
      throw error
    }
    
    console.log('✅ Profile updated successfully:', data)
    return data
  } catch (err) {
    console.error('❌ Exception in updateProfile:', err)
    throw err
  }
}

// ============================================
// USER STATS FUNCTIONS
// ============================================

export const getUserStats = async (userId) => {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching stats:', error)
    return { data: null, error }
  }
  return { data, error: null }
}

export const updateUserStats = async (userId, updates) => {
  const { data, error } = await supabase
    .from('user_stats')
    .upsert({
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    console.error('Error updating stats:', error)
    throw error
  }
  return data
}

export default supabase