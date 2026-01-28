import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { sendPasswordResetEmail } from '../lib/supabase'
import { Mail, ArrowLeft, Send, CheckCircle, Sparkles } from 'lucide-react'

const ForgotPassword = () => {
  const { isDark } = useTheme()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    setLoading(true)

    try {
      await sendPasswordResetEmail(email)
      setSent(true)
      toast.success('Password reset email sent!')
    } catch (error) {
      console.error('Reset error:', error)
      // Don't reveal if email exists or not for security
      toast.error('If an account exists with this email, you will receive a reset link.')
    } finally {
      setLoading(false)
    }
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
        {/* Back to Login */}
        <Link 
          to="/login"
          className={`inline-flex items-center gap-2 mb-8 text-sm ${
            isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          } transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

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
                <img src="/logo.png" alt="Temple Keepers" className="w-10 h-10 object-contain" />
              </div>
            </div>
            <h1 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {sent ? 'Check Your Email' : 'Reset Password'}
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {sent 
                ? "We've sent you a password reset link"
                : "Enter your email and we'll send you a reset link"
              }
            </p>
          </div>

          {sent ? (
            /* Success State */
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isDark ? 'bg-green-500/20' : 'bg-green-100'
              }`}>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                We've sent a password reset link to:
              </p>
              
              <p className={`font-medium mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {email}
              </p>

              <div className={`p-4 rounded-xl mb-6 ${
                isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
              }`}>
                <p className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                  💡 Don't see the email? Check your spam folder. The link expires in 1 hour.
                </p>
              </div>

              <button
                onClick={() => { setSent(false); setEmail('') }}
                className={`w-full py-3 rounded-xl font-medium transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Try Different Email
              </button>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-temple-purple' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-temple-purple'
                    } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Remember your password?{' '}
              <Link to="/login" className="text-temple-purple hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
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

export default ForgotPassword