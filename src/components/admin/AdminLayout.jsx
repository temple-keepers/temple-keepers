import { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { 
  LayoutDashboard, 
  BookOpen, 
  UtensilsCrossed, 
  Users, 
  Calendar,
  Settings,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  MessageCircle,
  ShoppingBag,
  Megaphone,
  ArrowLeft,
  Palette
} from 'lucide-react'

export const AdminLayout = () => {
  const { signOut, profile } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/programs', label: 'Programs', icon: BookOpen },
    { path: '/admin/enrollments', label: 'Enrollments', icon: Calendar },
    { path: '/admin/recipes', label: 'Recipes', icon: UtensilsCrossed },
    { path: '/admin/themes', label: 'Weekly Themes', icon: Calendar },
    { path: '/admin/users', label: 'CRM', icon: Users },
    { path: '/admin/pods', label: 'Community Pods', icon: MessageCircle },
    { path: '/admin/shop', label: 'Shop', icon: ShoppingBag },
    { path: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
    { path: '/admin/marketing', label: 'Marketing Studio', icon: Palette }
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <img 
                src="/logo.png" 
                alt="Temple Keepers" 
                className="w-10 h-10"
              />
              <div>
                <h1 className="font-display text-xl font-bold gradient-text">
                  Temple Keepers
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin Panel
                </p>
              </div>
            </div>
          </div>

          {/* Return to App */}
          <div className="px-4 pt-4">
            <button
              onClick={() => navigate('/today')}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                bg-temple-purple/10 dark:bg-temple-gold/10 text-temple-purple dark:text-temple-gold
                hover:bg-temple-purple/20 dark:hover:bg-temple-gold/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to App
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path)
                    setSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    text-sm font-medium transition-colors
                    ${active
                      ? 'bg-temple-purple text-white dark:bg-temple-gold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Footer - User Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {profile?.first_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {profile?.email}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded bg-temple-purple/10 text-temple-purple dark:bg-temple-gold/10 dark:text-temple-gold">
                Admin
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm
                         border border-gray-200 dark:border-gray-700
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm
                         border border-gray-200 dark:border-gray-700
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="font-display text-lg font-bold gradient-text">
              Admin Panel
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
