import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserPlus } from 'lucide-react'
import { ghlService } from '../services/ghlService'
import { emailService } from '../services/emailService'
import { referralService } from '../services/referralService'

export const Signup = () => {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const refCode = searchParams.get('ref')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue')
      setLoading(false)
      return
    }

    const { data, error } = await signUp(email, password, firstName)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Track signup in GHL (non-blocking)
      ghlService.userSignup({ email, firstName })

      // Send welcome email via Resend (non-blocking)
      emailService.welcome({ email, firstName })

      // Record referral if signup came via a referral link (non-blocking)
      if (refCode && data?.user?.id) {
        referralService.lookupReferrer(refCode).then(referrerId => {
          if (referrerId) {
            referralService.recordReferral(referrerId, data.user.id, refCode)
          }
        })
      }

      const redirect = searchParams.get('redirect')
      navigate(redirect || '/today')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 md:p-12 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 animate-float">
            <img 
              src="/logo.png" 
              alt="Temple Keepers" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">
            Begin Your Journey
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Faithful stewardship starts today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="form-input"
              placeholder="Your first name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={8}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              At least 8 characters — avoid common or easily guessed passwords
            </p>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 rounded border-gray-300 text-temple-purple focus:ring-temple-purple dark:border-gray-600"
              disabled={loading}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              I agree to the{' '}
              <Link to="/terms" className="text-temple-purple dark:text-temple-gold underline" target="_blank">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-temple-purple dark:text-temple-gold underline" target="_blank">Privacy Policy</Link>.
              I confirm I am at least 18 years old.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !agreedToTerms}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-temple-purple dark:text-temple-gold font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
