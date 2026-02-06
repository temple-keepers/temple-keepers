import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Calendar, UtensilsCrossed, Heart, User } from 'lucide-react'

export const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [keyboardOpen, setKeyboardOpen] = useState(false)

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const handleViewportChange = () => {
      const heightDiff = window.innerHeight - viewport.height
      setKeyboardOpen(heightDiff > 150)
    }

    handleViewportChange()
    viewport.addEventListener('resize', handleViewportChange)
    viewport.addEventListener('scroll', handleViewportChange)

    return () => {
      viewport.removeEventListener('resize', handleViewportChange)
      viewport.removeEventListener('scroll', handleViewportChange)
    }
  }, [])

  const navItems = [
    { path: '/today', icon: Home, label: 'Today' },
    { path: '/programs', icon: Calendar, label: 'Programs' },
    { path: '/recipes', icon: UtensilsCrossed, label: 'Recipes' },
    { path: '/wellness', icon: Heart, label: 'Wellness' },
    { path: '/profile', icon: User, label: 'Profile' }
  ]

  const isActive = (path) => {
    if (path === '/today') {
      return location.pathname === '/today'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom z-50 transition-transform duration-200 ${
        keyboardOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px] ${
                active
                  ? 'text-temple-purple dark:text-temple-gold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-2' : ''}`} />
              <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
