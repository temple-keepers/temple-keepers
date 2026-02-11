import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { 
  Home, 
  Calendar, 
  ChefHat, 
  Heart,
  User, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  ArrowLeft,
  Settings,
  ShoppingBag
} from 'lucide-react'
import { NotificationBell } from './NotificationBell'

export const AppHeader = ({ title, showBackButton = false, backTo = '/today' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, profile } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path)

  const navItems = [
    { path: '/today', icon: Home, label: 'Today' },
    { path: '/programs', icon: Calendar, label: 'Programs' },
    { path: '/recipes', icon: ChefHat, label: 'Recipes' },
    { path: '/wellness', icon: Heart, label: 'Wellness' },
    { path: '/shop', icon: ShoppingBag, label: 'Shop' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  const handleNavigation = (path) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton ? (
                <button onClick={() => navigate(backTo)} className="flex items-center gap-2 text-sm font-medium text-temple-purple dark:text-temple-gold hover:underline">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              ) : (
                <button onClick={() => navigate('/today')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <img src="/logo.png" alt="Temple Keepers" className="w-8 h-8" />
                  <span className="font-display text-lg font-bold gradient-text hidden sm:inline">Temple Keepers</span>
                </button>
              )}
              {title && <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">{title}</h1>}
            </div>

            <div className="flex items-center gap-2">
              <nav className="hidden lg:flex items-center gap-1">
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

              <NotificationBell />

              <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Toggle theme">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Menu">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <div className="hidden lg:block relative group">
                <button className="flex items-center gap-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center text-white font-semibold text-sm">
                    {profile?.first_name?.charAt(0) || 'U'}
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{profile?.first_name || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{profile?.email}</p>
                  </div>
                  {profile?.role === 'admin' && (
                    <button onClick={() => navigate('/admin')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </button>
                  )}
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-[65px] right-0 bottom-0 w-72 bg-white dark:bg-gray-800 shadow-xl z-50 lg:hidden overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-temple-purple/5 to-temple-purple/10 dark:from-temple-gold/5 dark:to-temple-gold/10">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center text-white font-semibold text-xl shadow-lg">
                  {profile?.first_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-gray-900 dark:text-white truncate">{profile?.first_name || 'User'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{profile?.email}</p>
                </div>
              </div>
            </div>
            <nav className="p-3">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Navigation</p>
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all ${
                      active
                        ? 'bg-temple-purple dark:bg-temple-gold text-white shadow-md font-semibold scale-105'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-base">{item.label}</span>
                  </button>
                )
              })}
            </nav>
            {profile?.role === 'admin' && (
              <div className="px-3 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin</p>
                <button onClick={() => handleNavigation('/admin')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  <span className="text-base">Admin Panel</span>
                </button>
              </div>
            )}
            <div className="px-3 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Settings</p>
              <button onClick={() => handleNavigation('/notification-settings')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                <span className="w-5 h-5 flex-shrink-0">🔔</span>
                <span className="text-base">Notifications</span>
              </button>
            </div>

            <div className="px-3 pb-4 border-t border-gray-200 dark:border-gray-700 mt-3 pt-3">
              <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium">
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="text-base">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
