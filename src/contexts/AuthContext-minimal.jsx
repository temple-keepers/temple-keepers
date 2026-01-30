import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [initializing, setInitializing] = useState(true)

  // Simple fetch user data function
  const fetchUserData = async (userId) => {
    try {
      console.log('Fetching user data for:', userId)
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.warn('Profile fetch error:', profileError)
        // Set a basic profile if fetch fails
        setProfile({
          id: userId,
          full_name: 'User',
          email: user?.email || ''
        })
      } else if (profileData) {
        setProfile(profileData)
        console.log('✅ Profile loaded:', profileData.full_name)
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
      // Set a fallback profile
      setProfile({
        id: userId,
        full_name: 'User',
        email: user?.email || ''
      })
    }
  }

  useEffect(() => {
    console.log('🔧 Initializing minimal auth context...')
    let mounted = true
    let completed = false
    
    // Safety timeout - ensure we never get stuck on loading
    const safetyTimeout = setTimeout(() => {
      if (mounted && !completed) {
        console.warn('⚠️ Auth initialization timeout - forcing completion')
        setLoading(false)
        setInitializing(false)
        completed = true
      }
    }, 3000) // 3 second safety timeout
    
    // Get initial session with retry logic
    const getInitialSession = async () => {
      try {
        console.log('🔍 Checking for existing session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted || completed) return
        
        if (error) {
          console.error('Session error:', error)
          setError(error.message)
        } else if (session?.user) {
          console.log('✅ Found existing session:', session.user.email)
          setUser(session.user)
          await fetchUserData(session.user.id)
        } else {
          console.log('ℹ️ No active session found')
        }
      } catch (err) {
        console.error('Error getting initial session:', err)
        if (mounted && !completed) setError(err.message)
      } finally {
        if (mounted && !completed) {
          console.log('✅ Auth initialization complete')
          setLoading(false)
          setInitializing(false)
          completed = true
          clearTimeout(safetyTimeout)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes with better session handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, 'Session exists:', !!session)
        
        if (!mounted) return
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in:', session.user.email)
          setUser(session.user)
          setError(null)
          setLoading(true) // Set loading while fetching profile
          await fetchUserData(session.user.id)
          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out')
          setUser(null)
          setProfile(null)
          setError(null)
          // Clear the correct storage key (matches supabase.js config)
          try {
            localStorage.removeItem('temple-keepers-auth')
            sessionStorage.removeItem('temple-keepers-auth')
            // Also clear any legacy keys that might exist
            localStorage.removeItem('sb-jdcrzdmbwfkozuhsoqbl-auth-token')
            sessionStorage.removeItem('sb-jdcrzdmbwfkozuhsoqbl-auth-token')
          } catch (e) {
            console.warn('Failed to clear auth storage:', e)
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed for:', session.user.email)
          // Only update if it's the same user (prevent user switching)
          setUser(prevUser => {
            if (prevUser && prevUser.id !== session.user.id) {
              console.warn('⚠️ Token refresh returned different user, ignoring')
              return prevUser
            }
            return session.user
          })
        } else if (event === 'INITIAL_SESSION') {
          if (session?.user) {
            console.log('🔍 Initial session found:', session.user.email)
            setUser(session.user)
            await fetchUserData(session.user.id)
          } else {
            console.log('ℹ️ No initial session')
          }
          setInitializing(false)
        }
        
        if (mounted && event !== 'SIGNED_IN') setLoading(false)
      }
    )

    return () => {
      mounted = false
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [])

  // Enhanced sign in function
  const signIn = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔐 Attempting sign in for:', email)
      
      // First, sign out any existing session to prevent user mixing
      await supabase.auth.signOut({ scope: 'local' })
      
      // Clear any stale session data
      try {
        localStorage.removeItem('temple-keepers-auth')
        localStorage.removeItem('sb-jdcrzdmbwfkozuhsoqbl-auth-token')
      } catch (e) {
        console.warn('Failed to clear stale auth:', e)
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ Sign in error:', error)
        throw error
      }
      
      if (data.user && data.session) {
        console.log('✅ Sign in successful:', data.user.email)
        // Manually set user state to prevent race conditions
        setUser(data.user)
        // Wait for profile to load before returning
        await fetchUserData(data.user.id)
        return { data, error: null }
      } else {
        throw new Error('No user or session returned from sign in')
      }
    } catch (err) {
      console.error('❌ Sign in error:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Simple sign out function
  const signOut = async () => {
    console.log('🚪 Signing out...')
    setLoading(true)
    try {
      // Use global scope to sign out from all devices/tabs
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      setError(null)
      
      // Clear all auth storage to prevent stale sessions
      try {
        localStorage.removeItem('temple-keepers-auth')
        localStorage.removeItem('sb-jdcrzdmbwfkozuhsoqbl-auth-token')
        sessionStorage.removeItem('temple-keepers-auth')
        sessionStorage.removeItem('sb-jdcrzdmbwfkozuhsoqbl-auth-token')
      } catch (e) {
        console.warn('Failed to clear auth storage:', e)
      }
    } catch (err) {
      console.error('Sign out error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Simple sign up function
  const signUp = async (email, password, fullName) => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔐 Signing up user:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      })

      if (error) throw error
      
      console.log('✅ Sign up successful')
      return { data, error: null }
    } catch (err) {
      console.error('❌ Sign up error:', err)
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    profile,
    loading: loading || initializing,
    error,
    signIn,
    signOut,
    signUp
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext