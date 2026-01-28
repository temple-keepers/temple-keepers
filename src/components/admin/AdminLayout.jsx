import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAdmin } from '../../contexts/AdminContext'
import { LayoutDashboard, Users, ChefHat, BookOpen, Settings, LogOut, Menu, X, Shield, BarChart3, ArrowLeft, Zap } from 'lucide-react'

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut } = useAuth()
  const { adminData, isSuperAdmin } = useAdmin()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Recipes', href: '/admin/recipes', icon: ChefHat },
    { name: 'Challenges', href: '/admin/challenges', icon: Zap },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ]

  const adminNav = [
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (path) => path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path)

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-semibold text-temple-gold">Admin Panel</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-700">
            {sidebarOpen ? <X className="w-6 h-6 text-gray-300" /> : <Menu className="w-6 h-6 text-gray-300" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 w-64 z-50 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-700">
            <h1 className="font-display text-lg font-semibold text-temple-gold">Temple Keepers</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>

          <div className="px-4 mt-4">
            <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to App</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase mb-2">Management</p>
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.name} to={item.href} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${isActive(item.href) ? 'bg-temple-gold/20 text-temple-gold' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              )
            })}

            {isSuperAdmin && (
              <>
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase mt-6 mb-2">Administration</p>
                {adminNav.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.name} to={item.href} onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${isActive(item.href) ? 'bg-temple-gold/20 text-temple-gold' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </>
            )}
          </nav>

          <div className="p-4 border-t border-gray-700">
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10">
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}

export default AdminLayout