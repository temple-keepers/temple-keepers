import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase-simple'

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
    
    // Get initial session with retry logic
    const getInitialSession = async () => {
      try {
        console.log('🔍 Checking for existing session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (error) {
          console.error('Session error:', error)
          setError(error.message)
        } else if (session?.user) {
          console.log('✅ Found existing session:', session.user.email)
          setUser(session.user)
          await fetchUserData(session.user.id)
        } else {
          console.log('ℹ️ No active session found')
          // Check if we have session data in storage as backup
          const storedSession = localStorage.getItem('sb-jdcrzdmbwfkozuhsoqbl-auth-token')
          if (storedSession) {
            console.log('🔄 Found stored session, attempting recovery...')
            try {
              const parsed = JSON.parse(storedSession)
              if (parsed.user && parsed.access_token) {
                console.log('✅ Recovered session for:', parsed.user.email)
                setUser(parsed.user)
                await fetchUserData(parsed.user.id)
              }
            } catch (parseErr) {
              console.warn('Failed to parse stored session:', parseErr)
            }
          }
        }
      } catch (err) {
        console.error('Error getting initial session:', err)
        if (mounted) setError(err.message)
      } finally {
        if (mounted) {
          setLoading(false)
          setInitializing(false)
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
          // Clear all storage
          try {
            localStorage.removeItem('sb-jdcrzdmbwfkozuhsoqbl-auth-token')
            sessionStorage.removeItem('sb-jdcrzdmbwfkozuhsoqbl-auth-token')
          } catch (e) {
            console.warn('Failed to clear auth storage:', e)
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed for:', session.user.email)
          setUser(session.user)
        } else if (event === 'INITIAL_SESSION') {
          if (!session) {
            console.log('ℹ️ No initial session')
          }
          setInitializing(false)
        }
        
        if (mounted && event !== 'SIGNED_IN') setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Enhanced sign in function
  const signIn = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔐 Attempting sign in for:', email)
      
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
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      setError(null)
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