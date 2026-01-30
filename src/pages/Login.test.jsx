import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockUser } from '../test/utils'
import Login from '../pages/Login'

// Mock the useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    loading: false,
    error: null,
    clearError: vi.fn()
  })
}))

describe('Login Component', () => {
  it('should render login form', () => {
    renderWithProviders(<Login />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('should validate email format', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    })
  })

  it('should call signIn with form data on valid submission', async () => {
    const mockSignIn = vi.fn()
    vi.mocked(require('../hooks/useAuth').useAuth).mockReturnValue({
      signIn: mockSignIn,
      loading: false,
      error: null,
      clearError: vi.fn()
    })
    
    const user = userEvent.setup()
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should show loading state during authentication', () => {
    vi.mocked(require('../hooks/useAuth').useAuth).mockReturnValue({
      signIn: vi.fn(),
      loading: true,
      error: null,
      clearError: vi.fn()
    })
    
    renderWithProviders(<Login />)
    
    const submitButton = screen.getByRole('button', { name: /signing in/i })
    expect(submitButton).toBeDisabled()
  })

  it('should display authentication errors', () => {
    const errorMessage = 'Invalid email or password'
    vi.mocked(require('../hooks/useAuth').useAuth).mockReturnValue({
      signIn: vi.fn(),
      loading: false,
      error: errorMessage,
      clearError: vi.fn()
    })
    
    renderWithProviders(<Login />)
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('should clear errors when form is modified', async () => {
    const mockClearError = vi.fn()
    vi.mocked(require('../hooks/useAuth').useAuth).mockReturnValue({
      signIn: vi.fn(),
      loading: false,
      error: 'Some error',
      clearError: mockClearError
    })
    
    const user = userEvent.setup()
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')
    
    expect(mockClearError).toHaveBeenCalled()
  })

  it('should have proper accessibility attributes', () => {
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('required')
  })
})