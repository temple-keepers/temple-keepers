import { useEffect, useState } from 'react'
import { useAdmin } from '../../contexts/AdminContext'
import { Users, BookOpen, UtensilsCrossed, UsersRound, TrendingUp } from 'lucide-react'

export const AdminDashboard = () => {
  const { getUserStats } = useAdmin()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    const { data, error } = await getUserStats()
    
    if (!error && data) {
      setStats(data)
    }
    
    setLoading(false)
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'purple',
      change: '+12%'
    },
    {
      label: 'Active Enrollments',
      value: stats?.activeEnrollments || 0,
      icon: BookOpen,
      color: 'blue',
      change: '+8%'
    },
    {
      label: 'Published Recipes',
      value: stats?.totalRecipes || 0,
      icon: UtensilsCrossed,
      color: 'green',
      change: '+15%'
    },
    {
      label: 'Community Pods',
      value: stats?.totalPods || 0,
      icon: UsersRound,
      color: 'gold',
      change: '+5%'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your Temple Keepers platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          
          return (
            <div
              key={stat.label}
              className="glass-card p-6 hover:scale-105 transition-transform"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center
                  ${stat.color === 'purple' ? 'bg-temple-purple/10 text-temple-purple' : ''}
                  ${stat.color === 'blue' ? 'bg-blue-500/10 text-blue-500' : ''}
                  ${stat.color === 'green' ? 'bg-green-500/10 text-green-500' : ''}
                  ${stat.color === 'gold' ? 'bg-temple-gold/10 text-temple-gold' : ''}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span>Create Program</span>
          </button>
          
          <button className="btn-gold flex items-center justify-center gap-2">
            <UtensilsCrossed className="w-5 h-5" />
            <span>Add Recipe</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center gap-2">
            <Users className="w-5 h-5" />
            <span>Manage Users</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="w-2 h-2 rounded-full bg-temple-purple"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                New user signed up
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                2 minutes ago
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="w-2 h-2 rounded-full bg-temple-gold"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Program enrollment completed
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                15 minutes ago
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                New recipe published
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                1 hour ago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
