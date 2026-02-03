import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Home, Calendar, ChefHat, BookOpen, LogOut, Sun, Moon, ArrowLeft } from 'lucide-react'

export const AppHeader = ({ title, showBackButton = false, backTo = '/today' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, profile } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path)

  const navItems = [
    { path: '/today', icon: Home, label: 'Today' },
    { path: '/programs', icon: Calendar, label: 'Programs' },
    { path: '/recipes', icon: ChefHat, label: 'Recipes' },
  ]

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back button or Logo */}
          <div className="flex items-center gap-4">
            {showBackButton ? (
              <button
                onClick={() => navigate(backTo)}
                className="flex items-center gap-2 text-sm font-medium text-temple-purple dark:text-temple-gold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/today')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img src="/logo.png" alt="Temple Keepers" className="w-8 h-8" />
                <span className="font-display text-lg font-bold gradient-text hidden sm:inline">
                  Temple Keepers
                </span>
              </button>
            )}

            {title && (
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
            )}
          </div>

          {/* Right: Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-temple-purple/10 dark:bg-temple-gold/10 text-temple-purple dark:text-temple-gold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Mobile Navigation */}
            <nav className="flex md:hidden items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`p-2 rounded-lg transition-colors ${
                      active
                        ? 'bg-temple-purple/10 dark:bg-temple-gold/10 text-temple-purple dark:text-temple-gold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                )
              })}
            </nav>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center text-white font-semibold text-sm">
                  {profile?.first_name?.charAt(0) || 'U'}
                </div>
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {profile?.first_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {profile?.email}
                  </p>
                </div>
                
                {profile?.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </button>
                )}
                
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
