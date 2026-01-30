import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Heart, CheckCircle } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { useFormValidation } from '../hooks/useFormValidation'
import { useErrorRecovery } from '../hooks/useErrorRecovery'
import LoadingSpinner from '../components/LoadingSpinner'

const Signup = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Form validation
  const { validateInput, getFieldError } = useFormValidation()
  
  // Error recovery for sign up
  const { execute: executeSignUp, isLoading: signUpLoading } = useErrorRecovery({
    onError: (error) => {
      console.error('🚨 Signup form error:', error)
      const errorMessage = error?.message || 'Failed to create account'
      toast.error(errorMessage)
      setError(errorMessage)
      setLoading(false)
    }
  })
  
  const passwordRequirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Contains a number', met: /\d/.test(password) },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
  ]

  const isPasswordStrong = passwordRequirements.every(req => req.met)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('🔐 Starting signup process...')

      // Validate form fields
      const nameError = validateInput(fullName, { 
        required: true, 
        minLength: 2, 
        maxLength: 100,
        pattern: /^[a-zA-Z\s'-]+$/
      }, 'Full name')
      
      const emailError = validateInput(email, { required: true, type: 'email' }, 'Email')
      
      const passwordError = validateInput(password, { 
        required: true, 
        minLength: 8,
        passwordStrength: true 
      }, 'Password')
      
      const confirmError = validateInput(confirmPassword, { 
        required: true, 
        confirmPassword: password 
      }, 'Confirm password')

      // Check for validation errors
      if (nameError || emailError || passwordError || confirmError) {
        const errorMsg = nameError || emailError || passwordError || confirmError
        setError(errorMsg)
        setLoading(false)
        return
      }

      await executeSignUp(async () => {
        const { error } = await signUp(email, password, fullName)
        
        if (error) {
          throw new Error(error)
        }

        setSuccess(true)
        toast.success('Account created successfully! 🎉')
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      })
    } catch (err) {
      console.error('❌ Form submission error:', err)
      const errorMessage = err?.message || 'An unexpected error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-temple-dark via-temple-dark-surface to-[#251a30]' 
          : 'bg-gradient-to-br from-purple-100 via-white to-amber-50'
      }`}>
        <div className="glass-card-strong rounded-3xl p-8 text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome to Temple Keepers!
          </h2>
          <p className="text-gray-600 mb-4">
            Your account has been created successfully. Redirecting you to your dashboard...
          </p>
          <div className="spinner mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-amber-50 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-temple-purple rounded-full opacity-10 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-temple-gold rounded-full opacity-10 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <button
  onClick={toggleTheme}
  className="absolute top-4 right-4 theme-toggle z-20"
  aria-label="Toggle dark mode"
>
  {isDark ? <Sun className="w-5 h-5 text-temple-gold" /> : <Moon className="w-5 h-5 text-temple-purple" />}
</button>
        {/* Logo */}
        <div className="text-center mb-6 animate-fade-in">
          <img 
            src="/logo.png" 
            alt="Temple Keepers" 
            className="w-20 h-20 mx-auto mb-3 object-contain"
          />
          <h1 className="font-display text-2xl font-bold text-temple-purple">
            Temple Keepers
          </h1>
        </div>

        {/* Signup Card */}
        <div className="glass-card-strong rounded-3xl p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Begin Your Journey
          </h2>
          <p className="text-gray-600 mb-6">
            Create your account to start honoring your temple
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input pl-12"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-12"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-12 pr-12"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password requirements */}
              {password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        req.met ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <CheckCircle className="w-3 h-3" />
                      </div>
                      <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input pl-12"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={signUpLoading || !isPasswordStrong || password !== confirmPassword}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {signUpLoading ? (
                <LoadingSpinner variant="minimal" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-temple-purple font-medium hover:text-temple-purple-dark">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500 flex items-center justify-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Heart className="w-4 h-4 text-temple-gold" />
          <span>Created with faith & love by Denise</span>
        </div>
      </div>
    </div>
  )
}

{/* Legal Links */}
<div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
  By creating an account, you agree to our{' '}
  <Link to="/terms" className="text-temple-purple hover:underline">Terms of Service</Link>
  ,{' '}
  <Link to="/privacy" className="text-temple-purple hover:underline">Privacy Policy</Link>
  , and{' '}
  <Link to="/disclaimer" className="text-temple-purple hover:underline">Health Disclaimer</Link>
</div>

export default Signup
