import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { updatePassword, supabase } from '../lib/supabase'
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react'

const ResetPassword = () => {
  const { isDark } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [checking, setChecking] = useState(true)

  // Password strength indicators
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const passwordsMatch = password === confirmPassword && password.length > 0
  const isStrongPassword = hasMinLength && hasUppercase && hasLowercase && hasNumber

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Also check URL for recovery token (Supabase redirects with hash params)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const type = hashParams.get('type')

      if (session || (accessToken && type === 'recovery')) {
        setValidSession(true)
      } else {
        toast.error('Invalid or expired reset link. Please request a new one.')
      }
      setChecking(false)
    }

    checkSession()

    // Listen for auth state changes (when user clicks reset link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true)
        setChecking(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [toast])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isStrongPassword) {
      toast.error('Please meet all password requirements')
      return
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await updatePassword(password)
      setSuccess(true)
      toast.success('Password updated successfully!')
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error.message || 'Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (checking) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin mx-auto mb-4" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Verifying reset link...</p>
        </div>
      </div>
    )
  }

  // Invalid session
  if (!validSession && !checking) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center max-w-md">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            isDark ? 'bg-red-500/20' : 'bg-red-100'
          }`}>
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Invalid Reset Link
          </h1>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 px-6 py-3 bg-temple-purple text-white rounded-xl hover:bg-temple-purple-dark transition-colors"
          >
            Request New Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-temple-dark to-gray-900' 
        : 'bg-gradient-to-br from-purple-50 via-white to-amber-50'
    }`}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl ${
          isDark ? 'bg-temple-purple/10' : 'bg-temple-purple/20'
        }`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl ${
          isDark ? 'bg-temple-gold/10' : 'bg-temple-gold/20'
        }`} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className={`rounded-3xl p-8 ${
          isDark 
            ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' 
            : 'bg-white/80 backdrop-blur-xl shadow-xl border border-gray-100'
        }`}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-temple-purple to-temple-gold p-0.5">
              <div className={`w-full h-full rounded-2xl flex items-center justify-center ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}>
                {success ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <ShieldCheck className="w-8 h-8 text-temple-purple" />
                )}
              </div>
            </div>
            <h1 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {success ? 'Password Updated!' : 'Create New Password'}
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {success 
                ? 'Your password has been reset successfully'
                : 'Enter your new password below'
              }
            </p>
          </div>

          {success ? (
            /* Success State */
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isDark ? 'bg-green-500/20' : 'bg-green-100'
              }`}>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                You can now sign in with your new password. Redirecting to dashboard...
              </p>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-temple-purple text-white rounded-xl hover:bg-temple-purple-dark transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  New Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-temple-purple' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-temple-purple'
                    } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    ) : (
                      <Eye className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password Requirements:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <RequirementItem met={hasMinLength} label="8+ characters" isDark={isDark} />
                  <RequirementItem met={hasUppercase} label="Uppercase letter" isDark={isDark} />
                  <RequirementItem met={hasLowercase} label="Lowercase letter" isDark={isDark} />
                  <RequirementItem met={hasNumber} label="Number" isDark={isDark} />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-temple-purple' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-temple-purple'
                    } focus:outline-none focus:ring-2 focus:ring-temple-purple/20 ${
                      confirmPassword && !passwordsMatch ? 'border-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showConfirm ? (
                      <EyeOff className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    ) : (
                      <Eye className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    )}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isStrongPassword || !passwordsMatch}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Update Password
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Bottom decoration */}
        <div className="mt-8 text-center">
          <p className={`text-sm flex items-center justify-center gap-2 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            <Sparkles className="w-4 h-4" />
            Honor your temple, nourish your soul
          </p>
        </div>
      </div>
    </div>
  )
}

// Helper component for password requirements
const RequirementItem = ({ met, label, isDark }) => (
  <div className="flex items-center gap-2">
    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
      met 
        ? 'bg-green-500 text-white' 
        : isDark ? 'bg-gray-600' : 'bg-gray-300'
    }`}>
      {met && <CheckCircle className="w-3 h-3" />}
    </div>
    <span className={`text-xs ${
      met 
        ? isDark ? 'text-green-400' : 'text-green-600'
        : isDark ? 'text-gray-400' : 'text-gray-500'
    }`}>
      {label}
    </span>
  </div>
)

export default ResetPassword