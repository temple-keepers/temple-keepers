import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { SecurityProvider } from '../contexts/SecurityContext'

// Test utilities for rendering components with providers
export function renderWithProviders(
  ui,
  {
    initialEntries = ['/'],
    user = null,
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <SecurityProvider>
          <AuthProvider initialUser={user}>
            {children}
          </AuthProvider>
        </SecurityProvider>
      </BrowserRouter>
    )
  }

  return {
    user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  }
}

// Mock user data
export const mockUser = {
  id: '123',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
    avatar_url: null
  },
  app_metadata: {
    provider: 'email',
    providers: ['email']
  }
}

export const mockAdminUser = {
  ...mockUser,
  id: 'admin-123',
  email: 'admin@example.com',
  user_metadata: {
    ...mockUser.user_metadata,
    full_name: 'Admin User',
    role: 'admin'
  }
}

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    signUp: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    resetPasswordForEmail: vi.fn(() => Promise.resolve({ error: null })),
    updateUser: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    then: vi.fn((callback) => callback({ data: [], error: null }))
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      download: vi.fn(() => Promise.resolve({ data: new Blob(), error: null })),
      remove: vi.fn(() => Promise.resolve({ data: {}, error: null }))
    }))
  },
  realtime: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn()
    }))
  }
}

// Mock form data
export const mockFormData = {
  email: 'test@example.com',
  password: 'password123',
  fullName: 'Test User'
}

// Mock habit data
export const mockHabit = {
  id: 1,
  name: 'Daily Prayer',
  description: 'Morning prayer and meditation',
  category: 'spiritual',
  frequency: 'daily',
  target_count: 1,
  created_at: '2026-01-01T00:00:00Z',
  user_id: '123'
}

// Mock recipe data  
export const mockRecipe = {
  id: 1,
  title: 'Healthy Breakfast Bowl',
  description: 'Nutritious start to the day',
  ingredients: ['oats', 'berries', 'nuts'],
  instructions: ['Mix ingredients', 'Serve'],
  prep_time: 10,
  cook_time: 5,
  servings: 1,
  category: 'breakfast',
  is_vegetarian: true,
  nutrition: {
    calories: 300,
    protein: 10,
    carbs: 45,
    fat: 8
  }
}

// Wait utilities
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0))

// Custom matchers
export const customMatchers = {
  toBeAccessible: (received) => {
    // Basic accessibility checks
    const hasAltText = received.querySelectorAll('img:not([alt])').length === 0
    const hasLabels = received.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').length === 0
    
    return {
      message: () => `Expected element to be accessible`,
      pass: hasAltText && hasLabels
    }
  }
}