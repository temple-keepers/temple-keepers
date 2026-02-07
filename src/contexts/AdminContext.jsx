import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

const AdminContext = createContext()

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}

export const AdminProvider = ({ children }) => {
  const { user, profile } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminStatus()
  }, [profile])

  const checkAdminStatus = async () => {
    if (!profile) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    // Check if user has admin role
    const adminStatus = profile.role === 'admin'
    setIsAdmin(adminStatus)
    setLoading(false)
  }

  // Get all users (admin only)
  const getUsers = async ({ search = '', limit = 50, offset = 0 } = {}) => {
    // Direct DB check to avoid stale closure issues
    if (!user?.id) return { data: null, error: new Error('Not authenticated') }
    
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (currentProfile?.role !== 'admin') {
      return { data: null, error: new Error('Unauthorized') }
    }

    let query = supabase
      .from('profiles')
      .select('id, first_name, last_name, email, role, tier, phone, birth_year, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error } = await query

    return { data, error }
  }

  // Get user stats
  const getUserStats = async () => {
    const isAuthorized = isAdmin || profile?.role === 'admin'
    if (!isAuthorized) {
      return { data: null, error: new Error('Unauthorized') }
    }

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const { count: activeEnrollments } = await supabase
      .from('program_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const { count: totalRecipes } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)

    const { count: totalPods } = await supabase
      .from('pods')
      .select('*', { count: 'exact', head: true })

    return {
      data: {
        totalUsers: totalUsers || 0,
        activeEnrollments: activeEnrollments || 0,
        totalRecipes: totalRecipes || 0,
        totalPods: totalPods || 0
      },
      error: null
    }
  }

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    const isAuthorized = isAdmin || profile?.role === 'admin'
    if (!isAuthorized) {
      return { data: null, error: new Error('Unauthorized') }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  }

  // Update user tier
  const updateUserTier = async (userId, newTier) => {
    const isAuthorized = isAdmin || profile?.role === 'admin'
    if (!isAuthorized) {
      return { data: null, error: new Error('Unauthorized') }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ tier: newTier })
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  }

  const value = {
    isAdmin,
    loading,
    getUsers,
    getUserStats,
    updateUserRole,
    updateUserTier
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}
