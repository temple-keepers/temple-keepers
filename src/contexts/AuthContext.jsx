import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getUserStats } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user profile and stats
  const fetchUserData = async (userId) => {
    try {
      const [profileResult, statsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        getUserStats(userId)
      ])

      if (profileResult.data) {
        setProfile(profileResult.data)
      } else if (profileResult.error) {
        console.warn('Profile fetch error:', profileResult.error)
      }
      
      if (statsResult) {
        setStats(statsResult)
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
    }
  }

  useEffect(() => {
    let mounted = true
    let loadingTimeout
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && mounted) {
          setUser(session.user)
          await fetchUserData(session.user.id)
        }
      } catch (err) {
        console.error('Error getting session:', err)
        if (mounted) {
          setError(err.message)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Fallback timeout to ensure loading state is cleared
    loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth initialization timeout - forcing loading to false')
        setLoading(false)
      }
    }, 5000)

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user && mounted) {
          setUser(session.user)
          fetchUserData(session.user.id).catch(err => {
            console.error('Error fetching user data after sign in:', err)
          })
        } else if (event === 'SIGNED_OUT' && mounted) {
          setUser(null)
          setProfile(null)
          setStats(null)
        }
        if (mounted) {
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [])

  // Sign up
  const signUp = async (email, password, fullName) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      })

      if (error) throw error

      // Create initial profile
      if (data.user) {
        console.log('Creating profile for user:', data.user.id, 'with name:', fullName)
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (profileError) {
          console.error('Error creating profile:', profileError)
        } else {
          console.log('Profile created successfully:', profileData)
        }

        // Create initial stats
        const { error: statsError } = await supabase
          .from('user_stats')
          .insert({
            user_id: data.user.id,
            streak_days: 0,
            devotionals_completed: 0,
            recipes_saved: 0,
            total_points: 0
          })

        if (statsError) {
          console.error('Error creating stats:', statsError)
        }
      }

      return { data, error: null }
    } catch (err) {
      console.error('SignUp error:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Sign in
  const signIn = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
      setStats(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Update profile
  const updateUserProfile = async (updates) => {
    if (!user) {
      console.error('No user logged in')
      return { data: null, error: 'No user logged in' }
    }

    try {
      console.log('Updating profile for user:', user.id)
      console.log('Updates being sent:', JSON.stringify(updates, null, 2))
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      console.log('Full update payload:', JSON.stringify(updateData, null, 2))
      
      const result = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()

      console.log('Raw Supabase result:', result)
      console.log('Result.data:', result.data)
      console.log('Result.error:', result.error)

      if (result.error) {
        console.error('!!! Supabase returned error:', result.error)
        console.error('Error message:', result.error.message)
        console.error('Error code:', result.error.code)
        console.error('Error details:', result.error.details)
        return { data: null, error: result.error.message || 'Unknown database error' }
      }
      
      if (!result.data) {
        console.error('!!! No data returned from update')
        return { data: null, error: 'No data returned from database' }
      }
      
      console.log('✅ Profile updated successfully!')
      console.log('Updated profile data:', result.data)
      setProfile(result.data)
      return { data: result.data, error: null }
    } catch (err) {
      console.error('!!! Exception in updateUserProfile:', err)
      console.error('Exception message:', err.message)
      console.error('Exception stack:', err.stack)
      return { data: null, error: err.message || 'Unknown error occurred' }
    }
  }

  // Refresh user data
  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.id)
    }
  }

  const value = {
    user,
    profile,
    stats,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    refreshUserData,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
