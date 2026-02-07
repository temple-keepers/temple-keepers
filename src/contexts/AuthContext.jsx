import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pinLocked, setPinLocked] = useState(false)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
        setPinLocked(false)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)

      // Check if PIN lock should activate
      const pinEnabled = localStorage.getItem(`tk-pin-enabled-${userId}`)
      const alreadyUnlocked = sessionStorage.getItem(`tk-pin-unlocked-${userId}`)
      if (data.pin_hash && pinEnabled === 'true' && !alreadyUnlocked) {
        setPinLocked(true)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const unlockPin = () => {
    if (user) {
      sessionStorage.setItem(`tk-pin-unlocked-${user.id}`, 'true')
    }
    setPinLocked(false)
  }

  const signUp = async (email, password, firstName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName
        }
      }
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (!error && data?.user) {
      // If signing in with password, skip pin lock for this session
      sessionStorage.setItem(`tk-pin-unlocked-${data.user.id}`, 'true')
      setPinLocked(false)
    }
    return { data, error }
  }

  const signOut = async () => {
    if (user) {
      sessionStorage.removeItem(`tk-pin-unlocked-${user.id}`)
    }
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setProfile(null)
      setPinLocked(false)
    }
    return { error }
  }

  const value = {
    user,
    profile,
    loading,
    pinLocked,
    unlockPin,
    signUp,
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
