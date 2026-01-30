import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../hooks/useAuth'
import { AuthProvider } from '../contexts/AuthContext-minimal'
import { mockSupabaseClient, mockUser } from '../test/utils'

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: mockSupabaseClient
}))

const wrapper = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide initial auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('should sign up a new user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.signUp('test@example.com', 'password123', 'Test User')
    })
    
    expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    })
  })

  it('should sign in existing user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.signIn('test@example.com', 'password123')
    })
    
    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('should sign out user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.signOut()
    })
    
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
  })

  it('should reset password', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.resetPassword('test@example.com')
    })
    
    expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com'
    )
  })

  it('should update user profile', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    const updates = { full_name: 'Updated Name' }
    
    await act(async () => {
      await result.current.updateProfile(updates)
    })
    
    expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
      data: updates
    })
  })

  it('should handle authentication errors', async () => {
    const errorMessage = 'Invalid credentials'
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: new Error(errorMessage)
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      try {
        await result.current.signIn('test@example.com', 'wrongpassword')
      } catch (error) {
        expect(error.message).toBe(errorMessage)
      }
    })
    
    expect(result.current.error).toBe(errorMessage)
  })

  it('should clear errors', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    // Simulate an error
    await act(async () => {
      result.current.setError('Some error')
    })
    
    expect(result.current.error).toBe('Some error')
    
    // Clear the error
    await act(async () => {
      result.current.clearError()
    })
    
    expect(result.current.error).toBeNull()
  })

  it('should manage loading state during async operations', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    const signInPromise = act(async () => {
      await result.current.signIn('test@example.com', 'password123')
    })
    
    // Should be loading during the operation
    expect(result.current.loading).toBe(true)
    
    await signInPromise
    
    // Should not be loading after completion
    expect(result.current.loading).toBe(false)
  })
})