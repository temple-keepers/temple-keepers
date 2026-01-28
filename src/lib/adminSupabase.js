import { supabase } from './supabase'

// ============================================
// ADMIN AUTHENTICATION - NEW AUTH METADATA SYSTEM
// No more admin_users table = No more RLS recursion!
// ============================================

export const checkIsAdmin = async (userId) => {
  console.log('🔍 Checking admin status for user:', userId)
  
  try {
    // Get the current user's session which includes metadata
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('❌ Error getting user:', error)
      return false
    }
    
    if (!user) {
      console.warn('⚠️ No user found')
      return false
    }
    
    // Check if user has admin role in their metadata
    const userRole = user.app_metadata?.role || user.user_metadata?.role
    const isAdmin = userRole === 'admin' || userRole === 'super_admin'
    
    console.log('📊 User metadata:', {
      userId: user.id,
      role: userRole,
      isAdmin,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata
    })
    
    if (isAdmin) {
      // Return admin data in the same format as before
      return {
        id: user.id,
        user_id: user.id,
        role: userRole,
        permissions: user.app_metadata?.permissions || {}
      }
    }
    
    console.warn('⚠️ User is not an admin')
    return false
  } catch (err) {
    console.error('❌ Exception checking admin status:', err)
    return false
  }
}

// ============================================
// DASHBOARD STATS
// ============================================

export const getAdminStats = async () => {
  try {
    const { data: userStats } = await supabase
      .from('profiles')
      .select('id, created_at', { count: 'exact' })
    
    const totalUsers = userStats?.length || 0
    const newUsersWeek = userStats?.filter(u => 
      new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length || 0
    const newUsersMonth = userStats?.filter(u => 
      new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length || 0

    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, created_at')
    
    const totalRecipes = recipes?.length || 0
    const recipesWeek = recipes?.filter(r => 
      new Date(r.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length || 0

    const { data: devotionals } = await supabase
      .from('devotional_completions')
      .select('id, completed_at')
    
    const totalDevotionals = devotionals?.length || 0
    const devotionalsWeek = devotionals?.filter(d => 
      new Date(d.completed_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length || 0

    const { data: stats } = await supabase
      .from('user_stats')
      .select('total_points, streak_days')
    
    const totalPoints = stats?.reduce((sum, s) => sum + (s.total_points || 0), 0) || 0
    const avgStreak = stats?.length 
      ? (stats.reduce((sum, s) => sum + (s.streak_days || 0), 0) / stats.length).toFixed(1)
      : 0
    const maxStreak = Math.max(...(stats?.map(s => s.streak_days || 0) || [0]))

    return {
      users: { total: totalUsers, newWeek: newUsersWeek, newMonth: newUsersMonth },
      recipes: { total: totalRecipes, week: recipesWeek },
      devotionals: { total: totalDevotionals, week: devotionalsWeek },
      engagement: { totalPoints, avgStreak, maxStreak }
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return null
  }
}

// ============================================
// USER MANAGEMENT
// ============================================

export const getAllUsers = async (page = 1, limit = 20, search = '') => {
  console.log('🔍 getAllUsers called:', { page, limit, search })
  
  let query = supabase
    .from('profiles')
    .select(`*`, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data, error, count } = await query
  
  console.log('📊 getAllUsers result:', { data, error, count })
  
  if (error) {
    console.error('❌ getAllUsers error:', error)
    return { users: [], total: 0 }
  }
  
  return { users: data || [], total: count || 0 }
}

export const getUserDetails = async (userId) => {
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()
  const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', userId).single()
  const { data: recipes } = await supabase.from('recipes').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10)
  const { data: devotionals } = await supabase.from('devotional_completions').select('*').eq('user_id', userId).order('completed_at', { ascending: false }).limit(10)

  return { profile, stats, recipes: recipes || [], devotionals: devotionals || [] }
}

// ============================================
// CONTENT MANAGEMENT
// ============================================

export const getAllRecipes = async (page = 1, limit = 20, search = '') => {
  console.log('🔍 getAllRecipes called:', { page, limit, search })
  
  let query = supabase
    .from('recipes')
    .select(`*`, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  const { data, error, count } = await query
  
  console.log('📊 getAllRecipes result:', { data, error, count })
  
  if (error) {
    console.error('❌ getAllRecipes error:', error)
    return { recipes: [], total: 0 }
  }
  
  return { recipes: data || [], total: count || 0 }
}

export const deleteRecipeAdmin = async (recipeId) => {
  const { error } = await supabase.from('recipes').delete().eq('id', recipeId)
  if (error) throw error
  return { success: true }
}

export const getAllDevotionals = async (page = 1, limit = 20) => {
  const { data, error, count } = await supabase
    .from('devotional_progress')
    .select(`*`, { count: 'exact' })
    .order('completed_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (error) return { devotionals: [], total: 0 }
  return { devotionals: data || [], total: count || 0 }
}

// ============================================
// ADMIN MANAGEMENT - NEW METADATA-BASED SYSTEM
// ============================================

export const getAdminUsers = async () => {
  // Query auth.users for users with admin role in metadata
  // Note: This requires a database function since we can't directly query auth.users from the client
  // For now, we'll use a workaround by checking profiles that match known admin IDs
  
  try {
    // Get all users and check their metadata via getUser
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) return []
    
    // If current user is admin, return admin list from profiles
    const userRole = user.app_metadata?.role
    if (userRole === 'super_admin' || userRole === 'admin') {
      // Fetch profiles for known admin user IDs
      // In production, you'd have a database function to list admins
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('id', ['908e99eb-53dd-4497-b0c4-af8d9e642681', '7cef535b-9b0a-47af-ae88-a0358e04db36'])
      
      return (data || []).map(profile => ({
        id: profile.id,
        user_id: profile.id,
        role: 'super_admin',
        full_name: profile.full_name,
        email: profile.email
      }))
    }
    
    return []
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return []
  }
}

export const removeAdminUser = async (userId) => {
  // To remove admin, you'd need to update auth metadata via a secure function
  // For now, this is disabled for safety
  console.warn('Remove admin user requires database function - not implemented yet')
  throw new Error('This operation requires a database admin function')
}

export const getActivityLog = async (limit = 50) => {
  // Placeholder - returns empty for now
  return []
}