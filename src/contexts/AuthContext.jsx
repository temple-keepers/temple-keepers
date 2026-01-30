import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase, getProfile, getUserStats } from '../lib/supabase-simple'

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
  
  // Track initialization to prevent race conditions
  const initialized = useRef(false)
  const fetchingData = useRef(false)
  const currentUserId = useRef(null)

  // Fetch user profile and stats
  const fetchUserData = useCallback(async (userId) => {
    // Prevent duplicate fetches for same user
    if (fetchingData.current || currentUserId.current === userId) return
    fetchingData.current = true
    currentUserId.current = userId
    
    try {
      console.log('📊 Fetching user data for:', userId)
      const [profileResult, statsResult] = await Promise.all([
        getProfile(userId),
        getUserStats(userId)
      ])

      if (profileResult?.data) {
        setProfile(profileResult.data)
      }
      if (statsResult?.data) {
        setStats(statsResult.data)
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
    } finally {
      fetchingData.current = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    
    // Get initial session
    const getInitialSession = async () => {
      // Prevent re-initialization
      if (initialized.current) return
      
      try {
        console.log('🔐 Getting initial session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError)
          throw sessionError
        }
        
        if (mounted && session?.user) {
          console.log('✅ Initial session found for:', session.user.email)
          setUser(session.user)
          await fetchUserData(session.user.id)
        } else {
          console.log('ℹ️ No active session found')
        }
      } catch (err) {
        console.error('Error getting initial session:', err)
        if (mounted) {
          // Handle specific error types
          if (err.name === 'AbortError') {
            console.warn('⚠️ Session request was aborted - likely due to timeout')
            setError('Connection timed out. Please refresh the page.')
          } else {
            setError(err.message || 'Failed to load session')
          }
        }
      } finally {
        if (mounted) {
          setLoading(false)
          initialized.current = true
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth event:', event, session?.user?.email)
        
        if (!mounted) return
        
        // Handle different auth events
        switch (event) {
          case 'INITIAL_SESSION':
            // Already handled by getInitialSession - DO NOTHING to prevent double-load
            console.log('⏭️ Skipping INITIAL_SESSION (already handled)')
            break
            
          case 'SIGNED_IN':
            if (session?.user) {
              console.log('✅ SIGNED_IN:', session.user.email)
              setUser(session.user)
              setError(null)
              // Only fetch if not the same user we already loaded
              if (currentUserId.current !== session.user.id) {
                currentUserId.current = null // Reset to allow fetch
                await fetchUserData(session.user.id)
              }
            }
            setLoading(false)
            break
            
          case 'SIGNED_OUT':
            console.log('👋 SIGNED_OUT')
            setUser(null)
            setProfile(null)
            setStats(null)
            setError(null)
            currentUserId.current = null
            setLoading(false)
            break
            
          case 'TOKEN_REFRESHED':
            // Token refreshed - just update user object, don't refetch data
            console.log('🔄 TOKEN_REFRESHED')
            if (session?.user) {
              setUser(session.user)
            }
            break
            
          case 'USER_UPDATED':
            // User metadata was updated
            console.log('📝 USER_UPDATED')
            if (session?.user) {
              setUser(session.user)
              currentUserId.current = null // Reset to allow fetch
              await fetchUserData(session.user.id)
            }
            break
            
          case 'PASSWORD_RECOVERY':
            console.log('🔑 PASSWORD_RECOVERY event')
            break
            
          default:
            console.log('❓ Unknown auth event:', event)
            break
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserData]) // fetchUserData is stable due to useCallback with empty deps

  // Sign up
  const signUp = async (email, password, fullName) => {
    setLoading(true)
    setError(null)
    try {
      console.log('📝 Signing up:', email)
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
        console.log('👤 Creating profile for:', data.user.id)
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          created_at: new Date().toISOString()
        }, { onConflict: 'id' })

        // Create initial stats
        await supabase.from('user_stats').upsert({
          user_id: data.user.id,
          streak_days: 0,
          devotionals_completed: 0,
          recipes_saved: 0,
          total_points: 0
        }, { onConflict: 'user_id' })
      }

      return { data, error: null }
    } catch (err) {
      console.error('❌ Sign up error:', err)
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
      console.log('🔐 Signing in:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      
      console.log('✅ Sign in successful:', data.user?.email)
      
      // Set user immediately (onAuthStateChange will also fire)
      if (data.user) {
        setUser(data.user)
        currentUserId.current = null // Reset to allow fetch
        await fetchUserData(data.user.id)
      }
      
      return { data, error: null }
    } catch (err) {
      console.error('❌ Sign in error:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    console.log('🚪 Signing out...')
    setLoading(true)
    try {
      // Clear state FIRST to prevent UI flash
      setUser(null)
      setProfile(null)
      setStats(null)
      setError(null)
      currentUserId.current = null
      initialized.current = false
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ Sign out error:', error)
        throw error
      }
      
      console.log('✅ Signed out successfully')
    } catch (err) {
      console.error('❌ Sign out exception:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Update profile
  const updateUserProfile = async (updates) => {
    if (!user) return { error: 'No user logged in' }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return { data, error: null }
    } catch (err) {
      console.error('❌ Update profile error:', err)
      return { data: null, error: err.message }
    }
  }

  // Refresh user data
  const refreshUserData = useCallback(async () => {
    if (user) {
      currentUserId.current = null // Reset to allow fetch
      await fetchUserData(user.id)
    }
  }, [user, fetchUserData])

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