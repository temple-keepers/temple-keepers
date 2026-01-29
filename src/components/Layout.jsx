import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import { Sparkles } from 'lucide-react'
import { useAdmin } from '../contexts/AdminContext'
import { Shield, Lock } from 'lucide-react'
import { Droplets, CalendarDays } from 'lucide-react'
import { useSubscription } from '../contexts/SubscriptionContext'
import UpgradeBanner from './UpgradeBanner'
import { Trophy } from 'lucide-react'
import { 
  Home, 
  BookOpen, 
  ChefHat, 
  User, 
  LogOut, 
  Menu, 
  X,
  Heart,
  Library,
  Users
} from 'lucide-react'

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const { isAdmin } = useAdmin()
  const { hasAccess, isPaid, loading } = useSubscription()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, locked: false },
    { name: 'Devotionals', href: '/devotionals', icon: BookOpen, locked: false },
    { name: 'AI Recipes', href: '/recipes', icon: ChefHat, locked: false },
    { name: 'Challenges', href: '/challenges', icon: Trophy, locked: false },
    { name: 'Community', href: '/community', icon: Users, locked: false },
    { name: 'Members', href: '/members', icon: User, locked: hasAccess ? !hasAccess('members_directory') : true },
    { name: 'Meal Planner', href: '/meal-planner', icon: CalendarDays, locked: hasAccess ? !hasAccess('meal_planner') : true },
    { name: 'Water Tracker', href: '/water', icon: Droplets, locked: hasAccess ? !hasAccess('water_tracker') : true },
    { name: 'Profile', href: '/profile', icon: User, locked: false },
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-2 rounded-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 shadow-lg'}`}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isDark ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'}
      `}>
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 mb-8">
            <img src="/logo.png" alt="Temple Keepers" className="w-10 h-10 object-contain" />
            <span className={`font-display text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Temple Keepers
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-temple-purple/20 to-temple-gold/10 text-temple-purple' 
                    : item.locked
                      ? isDark ? 'text-gray-500' : 'text-gray-400'
                      : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {item.locked && (
                  <Lock className="w-4 h-4 ml-auto text-gray-400" />
                )}
              </NavLink>
            ))}

            {/* Admin Link */}
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-temple-purple/20 to-temple-gold/10 text-temple-purple' 
                    : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">Admin Panel</span>
              </NavLink>
            )}
          </nav>

          {/* Upgrade Banner for Free Users */}
          {!loading && isPaid && !isPaid() && (
            <div className="mb-4">
              <UpgradeBanner variant="compact" />
            </div>
          )}

          {/* Bottom Section */}
          <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen p-4 lg:p-8">
        {children}
      </main>
    </div>
  )
}

export default Layout
