import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Home } from 'lucide-react'

export const PublicHeader = ({ showBackButton = false }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Brand */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.png" alt="Temple Keepers" className="w-10 h-10" />
            <span className="font-display text-xl sm:text-2xl font-bold gradient-text">
              Temple Keepers
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className={`text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-temple-purple dark:text-temple-gold'
                  : 'text-gray-700 dark:text-gray-300 hover:text-temple-purple dark:hover:text-temple-gold'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('/about-denise')}
              className={`text-sm font-medium transition-colors ${
                isActive('/about-denise')
                  ? 'text-temple-purple dark:text-temple-gold'
                  : 'text-gray-700 dark:text-gray-300 hover:text-temple-purple dark:hover:text-temple-gold'
              }`}
            >
              About
            </button>
            <button
              onClick={() => navigate('/roadmap')}
              className={`text-sm font-medium transition-colors ${
                isActive('/roadmap')
                  ? 'text-temple-purple dark:text-temple-gold'
                  : 'text-gray-700 dark:text-gray-300 hover:text-temple-purple dark:hover:text-temple-gold'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-temple-purple dark:hover:text-temple-gold transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary text-sm px-4 py-2"
            >
              Get Started
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <nav className="space-y-2">
              <button
                onClick={() => {
                  navigate('/')
                  setMobileMenuOpen(false)
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-temple-purple/10 dark:bg-temple-gold/10 text-temple-purple dark:text-temple-gold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  navigate('/about-denise')
                  setMobileMenuOpen(false)
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/about-denise')
                    ? 'bg-temple-purple/10 dark:bg-temple-gold/10 text-temple-purple dark:text-temple-gold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                About
              </button>
              <button
                onClick={() => {
                  navigate('/roadmap')
                  setMobileMenuOpen(false)
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/roadmap')
                    ? 'bg-temple-purple/10 dark:bg-temple-gold/10 text-temple-purple dark:text-temple-gold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Roadmap
              </button>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2 space-y-2">
                <button
                  onClick={() => {
                    navigate('/login')
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate('/signup')
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full btn-primary text-sm"
                >
                  Get Started
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
