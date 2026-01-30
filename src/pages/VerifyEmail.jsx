import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext-minimal'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { resendVerificationEmail } from '../lib/supabase'
import { Mail, RefreshCw, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

const VerifyEmail = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // If user is verified, redirect to dashboard
  useEffect(() => {
    if (user?.email_confirmed_at) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResend = async () => {
    if (countdown > 0 || !user?.email) return

    setResending(true)
    try {
      await resendVerificationEmail(user.email)
      toast.success('Verification email sent!')
      setCountdown(60) // 60 second cooldown
    } catch (error) {
      toast.error('Failed to send email. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-temple-dark to-gray-900' 
        : 'bg-gradient-to-br from-purple-50 via-white to-amber-50'
    }`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl ${
          isDark ? 'bg-temple-purple/10' : 'bg-temple-purple/20'
        }`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl ${
          isDark ? 'bg-temple-gold/10' : 'bg-temple-gold/20'
        }`} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className={`rounded-3xl p-8 ${
          isDark 
            ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' 
            : 'bg-white/80 backdrop-blur-xl shadow-xl border border-gray-100'
        }`}>
          {/* Icon */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
              isDark ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <Mail className="w-10 h-10 text-blue-500" />
            </div>
            
            <h1 className={`text-2xl font-display font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Check Your Email
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              We've sent a verification link to:
            </p>
            <p className={`font-medium mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {user?.email || 'your email'}
            </p>
          </div>

          {/* Instructions */}
          <div className={`rounded-xl p-4 mb-6 ${
            isDark ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <h3 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Next steps:
            </h3>
            <ol className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-temple-purple text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                Open your email inbox
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-temple-purple text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                Find the email from Temple Keepers
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-temple-purple text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                Click the verification link
              </li>
            </ol>
          </div>

          {/* Tips */}
          <div className={`rounded-xl p-4 mb-6 ${
            isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
          }`}>
            <p className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
              💡 <strong>Can't find it?</strong> Check your spam or junk folder. 
              The email may take a few minutes to arrive.
            </p>
          </div>

          {/* Resend Button */}
          <button
            onClick={handleResend}
            disabled={resending || countdown > 0}
            className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
              countdown > 0
                ? isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                : isDark 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {resending ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : countdown > 0 ? (
              <>
                Resend in {countdown}s
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Resend Verification Email
              </>
            )}
          </button>

          {/* Continue to Dashboard (skip verification for now) */}
          <div className="mt-6 text-center">
            <Link 
              to="/dashboard"
              className={`text-sm inline-flex items-center gap-1 ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Continue to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              (Some features may be limited)
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

export default VerifyEmail