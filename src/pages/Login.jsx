import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Heart } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
  isDark 
    ? 'bg-gradient-to-br from-temple-dark via-temple-dark-surface to-[#251a30]' 
    : 'bg-gradient-to-br from-purple-100 via-white to-amber-50'
}`}>
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
        <div className="text-center mb-8 animate-fade-in">
          <img 
            src="/logo.png" 
            alt="Temple Keepers" 
            className="w-24 h-24 mx-auto mb-4 object-contain"
          />
          <h1 className="font-display text-3xl font-bold text-temple-purple">
            Temple Keepers
          </h1>
          <p className="text-gray-600 mt-2">
            Honor your body, nurture your soul
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card-strong rounded-3xl p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 mb-6">
            Sign in to continue your wellness journey
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="Enter your password"
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="spinner w-5 h-5 border-2 border-white/30 border-t-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-temple-purple font-medium hover:text-temple-purple-dark">
                Create one
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
  By signing in, you agree to our{' '}
  <Link to="/terms" className="text-temple-purple hover:underline">Terms of Service</Link>
  {' '}and{' '}
  <Link to="/privacy" className="text-temple-purple hover:underline">Privacy Policy</Link>
</div>

export default Login
