import { supabase } from '../lib/supabase'

/**
 * Emergency authentication debugging and fix utilities
 */
export class AuthDebugger {
  static async debugCurrentSession() {
    console.log('🔍 === AUTH SESSION DEBUG ===')
    
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('📊 Current Session:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        expiresAt: session?.expires_at ? new Date(session.expires_at * 1000) : null,
        accessToken: session?.access_token ? session.access_token.substring(0, 20) + '...' : null,
        refreshToken: session?.refresh_token ? session.refresh_token.substring(0, 20) + '...' : null
      })

      if (error) {
        console.error('❌ Session Error:', error)
      }

      // Check localStorage
      console.log('💾 LocalStorage Keys:', Object.keys(localStorage).filter(k => 
        k.startsWith('sb-') || k.includes('auth') || k.includes('supabase')
      ))

      // Test user endpoint
      if (session?.access_token) {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          }
        })
        
        if (response.ok) {
          const userData = await response.json()
          console.log('👤 API User Data:', {
            id: userData.id,
            email: userData.email,
            lastSignIn: userData.last_sign_in_at
          })
        } else {
          console.error('❌ User API Error:', response.status, await response.text())
        }
      }

    } catch (err) {
      console.error('❌ Debug Error:', err)
    }
    
    console.log('🔍 === END DEBUG ===')
  }

  static async forceSignOut() {
    console.log('🚪 Force signing out...')
    
    try {
      // Sign out with global scope
      await supabase.auth.signOut({ scope: 'global' })
      
      // Clear ALL auth-related storage
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('sb-') || 
            key.includes('auth') || 
            key.includes('supabase') ||
            key.includes('token')) {
          try {
            localStorage.removeItem(key)
            console.log(`🗑️ Removed: ${key}`)
          } catch (e) {
            console.error(`Failed to remove ${key}:`, e)
          }
        }
      })

      // Clear sessionStorage too
      const sessionKeys = Object.keys(sessionStorage)
      sessionKeys.forEach(key => {
        if (key.startsWith('sb-') || 
            key.includes('auth') || 
            key.includes('supabase') ||
            key.includes('token')) {
          try {
            sessionStorage.removeItem(key)
            console.log(`🗑️ Removed from session: ${key}`)
          } catch (e) {
            console.error(`Failed to remove session ${key}:`, e)
          }
        }
      })

      console.log('✅ Force sign out complete')
      
      // Reload page to ensure clean state
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (err) {
      console.error('❌ Force signout error:', err)
      // Still try to reload
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  static async validateUserConsistency() {
    console.log('🔍 Validating user consistency...')
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        console.log('ℹ️ No session to validate')
        return
      }

      // Get user from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      console.log('🔍 Consistency Check:', {
        sessionUserId: session.user.id,
        sessionUserEmail: session.user.email,
        profileUserId: profile?.id,
        profileEmail: profile?.email,
        match: session.user.id === profile?.id && session.user.email === profile?.email
      })

      if (!profile || session.user.id !== profile.id) {
        console.error('🚨 USER MISMATCH DETECTED!')
        console.error('Session user:', session.user.id, session.user.email)
        console.error('Profile user:', profile?.id, profile?.email)
        
        // Force clean signout
        await this.forceSignOut()
      }

    } catch (err) {
      console.error('❌ Validation error:', err)
    }
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.AuthDebugger = AuthDebugger
}