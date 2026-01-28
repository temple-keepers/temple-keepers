import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import { Sparkles } from 'lucide-react'
import { useAdmin } from '../contexts/AdminContext'
import { Shield } from 'lucide-react'
import { Droplets, CalendarDays } from 'lucide-react'
import { 
  Home, 
  BookOpen, 
  ChefHat, 
  User, 
  LogOut, 
  Menu, 
  X,
  Heart,
  Library
} from 'lucide-react'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const { isAdmin } = useAdmin()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Devotionals', href: '/devotionals', icon: BookOpen },
    { name: 'AI Recipes', href: '/recipes', icon: ChefHat },
    { name: 'Recipe Library', href: '/recipe-library', icon: Library },
      { name: 'Meal Planner', href: '/meal-planner', icon: CalendarDays },
  { name: 'Water Tracker', href: '/water', icon: Droplets },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  // Add admin link if user is admin
if (isAdmin) {
  navigation.push({ name: 'Admin Panel', href: '/admin', icon: Shield })
}
  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
  isDark 
    ? 'bg-gradient-to-br from-temple-dark via-temple-dark-surface to-[#251a30]' 
    : 'bg-gradient-to-br from-purple-50 via-white to-amber-50/30'
}`}>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-card-strong px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Temple Keepers" className="w-10 h-10 object-contain" />
            <div className="flex items-center gap-2">
  <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle dark mode">
    {isDark ? <Sun className="w-5 h-5 text-temple-gold" /> : <Moon className="w-5 h-5 text-temple-purple" />}
  </button>
  {/* existing menu button */}
</div>
            <span className="font-display text-xl font-semibold text-temple-purple">
              Temple Keepers
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-temple-purple/10 transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
  fixed top-0 left-0 bottom-0 w-72 z-50
  transform transition-transform duration-300 ease-out
  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  lg:translate-x-0
  sidebar-premium
`}>
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 mb-8">
            <img 
              src="/logo.png" 
              alt="Temple Keepers" 
              className="w-14 h-14 object-contain"
            />
            <div>
              <h1 className="font-display text-xl font-semibold text-temple-purple">
                Temple Keepers
              </h1>
              <p className="text-xs text-temple-gold">Honor Your Temple</p>
            </div>
          </Link>

          {/* User greeting */}
          <div className="glass-card rounded-xl p-4 mb-6 gold-accent">
            <p className="text-sm text-gray-500">Welcome back,</p>
            <p className="font-semibold text-gray-800 truncate">
              {profile?.full_name || user?.email?.split('@')[0] || 'Friend'}
            </p>
          </div>
{/* Theme Toggle */}
<button
  onClick={toggleTheme}
  className="hidden lg:flex items-center gap-3 px-4 py-3 mb-4 rounded-xl glass-card hover:shadow-glass transition-all duration-300"
>
  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
    isDark ? 'bg-temple-gold/20' : 'bg-temple-purple/10'
  }`}>
    {isDark ? <Sun className="w-5 h-5 text-temple-gold" /> : <Moon className="w-5 h-5 text-temple-purple" />}
  </div>
  <div className="flex-1 text-left">
    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-400">
      {isDark ? 'Switch to light' : 'Switch to dark'}
    </p>
  </div>
</button>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="pt-6 border-t border-gray-200/50">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Heart className="w-4 h-4 text-temple-gold" />
              <span>Made with faith & love</span>
            </div>
            <button
              onClick={handleSignOut}
              className="nav-link w-full text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden mobile-nav">
        <div className="flex justify-around items-center">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'text-temple-purple'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default Layout
