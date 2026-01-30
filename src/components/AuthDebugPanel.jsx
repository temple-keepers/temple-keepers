import React from 'react'
import { AuthDebugger } from '../utils/authDebugger'
import { supabase } from '../lib/supabase'

/**
 * Temporary debugging component to help diagnose auth issues
 * Add this to your main app temporarily: <AuthDebugPanel />
 */
const AuthDebugPanel = () => {
  const handleDebugSession = () => {
    AuthDebugger.debugCurrentSession()
  }

  const handleForceSignOut = () => {
    AuthDebugger.forceSignOut()
  }

  const handleValidateConsistency = () => {
    AuthDebugger.validateUserConsistency()
  }

  const handleCheckAllSessions = async () => {
    console.log('🔍 Checking all active sessions...')
    
    // This will show what Supabase thinks the current session is
    const { data, error } = await supabase.auth.getSession()
    console.log('Current session:', data.session?.user?.id, data.session?.user?.email)
    
    // Check localStorage directly
    const authToken = localStorage.getItem('sb-auth-token')
    if (authToken) {
      try {
        const parsed = JSON.parse(authToken)
        console.log('LocalStorage user:', parsed.user?.id, parsed.user?.email)
        console.log('Token expires:', new Date(parsed.expires_at * 1000))
      } catch (e) {
        console.error('Failed to parse stored token:', e)
      }
    }
  }

  const handleClearEverything = async () => {
    console.log('🧨 NUCLEAR OPTION: Clearing everything...')
    
    // Sign out
    await supabase.auth.signOut()
    
    // Clear all storage
    localStorage.clear()
    sessionStorage.clear()
    
    // Clear any cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=")
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
    })
    
    console.log('💥 Everything cleared, reloading...')
    setTimeout(() => window.location.reload(), 1000)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      zIndex: 9999,
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#ff6b6b' }}>🚨 AUTH DEBUG PANEL</h4>
      
      <button onClick={handleDebugSession} style={{
        display: 'block', width: '100%', margin: '5px 0', 
        padding: '5px', background: '#4ECDC4', border: 'none', borderRadius: '4px'
      }}>
        🔍 Debug Current Session
      </button>
      
      <button onClick={handleCheckAllSessions} style={{
        display: 'block', width: '100%', margin: '5px 0',
        padding: '5px', background: '#45B7D1', border: 'none', borderRadius: '4px'
      }}>
        📊 Check All Sessions
      </button>
      
      <button onClick={handleValidateConsistency} style={{
        display: 'block', width: '100%', margin: '5px 0',
        padding: '5px', background: '#F7DC6F', color: 'black', border: 'none', borderRadius: '4px'
      }}>
        ✅ Validate Consistency
      </button>
      
      <button onClick={handleForceSignOut} style={{
        display: 'block', width: '100%', margin: '5px 0',
        padding: '5px', background: '#FF6B6B', border: 'none', borderRadius: '4px'
      }}>
        🚪 Force Sign Out
      </button>
      
      <button onClick={handleClearEverything} style={{
        display: 'block', width: '100%', margin: '5px 0',
        padding: '5px', background: '#E74C3C', border: 'none', borderRadius: '4px'
      }}>
        💥 NUCLEAR CLEAR ALL
      </button>
      
      <p style={{ fontSize: '10px', margin: '10px 0 0 0', opacity: 0.8 }}>
        Open DevTools Console for detailed logs
      </p>
    </div>
  )
}

export default AuthDebugPanel