import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../contexts/AdminContext'
import { supabase } from '../../lib/supabase'
import { Users, BookOpen, UtensilsCrossed, UsersRound, RefreshCw } from 'lucide-react'

export const AdminDashboard = () => {
  const navigate = useNavigate()
  const { getUserStats, isAdmin, loading: adminLoading } = useAdmin()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activity, setActivity] = useState([])
  const [activityLoading, setActivityLoading] = useState(true)

  useEffect(() => {
    if (adminLoading) return
    if (!isAdmin) return

    const loadAll = async () => {
      await Promise.all([loadStats(), loadActivity()])
    }

    loadAll()
    const interval = setInterval(loadAll, 30000)
    return () => clearInterval(interval)
  }, [adminLoading, isAdmin])

  const loadStats = async () => {
    setLoading(true)
    const { data, error } = await getUserStats()

    if (!error && data) {
      setStats(data)
    }

    setLoading(false)
  }

  const loadActivity = async () => {
    setActivityLoading(true)
    try {
      const [usersResult, enrollmentsResult, recipesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, first_name, email, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('program_enrollments')
          .select('id, created_at, profiles:user_id(first_name, last_name), programs:program_id(title)')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('recipes')
          .select('id, title, created_at')
          .order('created_at', { ascending: false })
          .limit(5)
      ])

      const items = []

      usersResult.data?.forEach((user) => {
        items.push({
          id: `user-${user.id}`,
          title: 'New user signed up',
          subtitle: `${user.first_name || 'User'}${user.email ? ` (${user.email})` : ''}`,
          date: user.created_at,
          color: 'purple'
        })
      })

      enrollmentsResult.data?.forEach((enrollment) => {
        const name = [enrollment.profiles?.first_name, enrollment.profiles?.last_name]
          .filter(Boolean)
          .join(' ')
        const programTitle = enrollment.programs?.title
        items.push({
          id: `enrollment-${enrollment.id}`,
          title: 'Program enrollment',
          subtitle: `${name || 'User'}${programTitle ? ` -> ${programTitle}` : ''}`,
          date: enrollment.created_at,
          color: 'gold'
        })
      })

      recipesResult.data?.forEach((recipe) => {
        items.push({
          id: `recipe-${recipe.id}`,
          title: 'Recipe published',
          subtitle: recipe.title || 'Untitled recipe',
          date: recipe.created_at,
          color: 'green'
        })
      })

      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setActivity(items.slice(0, 8))
    } catch (error) {
      console.error('Error loading activity:', error)
    } finally {
      setActivityLoading(false)
    }
  }

  const formatActivityDate = (value) => {
    if (!value) return ''
    return new Date(value).toLocaleString()
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'purple'
    },
    {
      label: 'Active Enrollments',
      value: stats?.activeEnrollments || 0,
      icon: BookOpen,
      color: 'blue'
    },
    {
      label: 'Published Recipes',
      value: stats?.totalRecipes || 0,
      icon: UtensilsCrossed,
      color: 'green'
    },
    {
      label: 'Community Pods',
      value: stats?.totalPods || 0,
      icon: UsersRound,
      color: 'gold'
    }
  ]

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of your Temple Keepers platform
          </p>
        </div>
        <button
          onClick={() => {
            loadStats()
            loadActivity()
          }}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
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
          <button
            className="btn-primary flex items-center justify-center gap-2"
            onClick={() => navigate('/admin/programs/new')}
          >
            <BookOpen className="w-5 h-5" />
            <span>Create Program</span>
          </button>

          <button
            className="btn-gold flex items-center justify-center gap-2"
            onClick={() => navigate('/admin/recipes')}
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span>Add Recipe</span>
          </button>

          <button
            className="btn-secondary flex items-center justify-center gap-2"
            onClick={() => navigate('/admin/users')}
          >
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

        {activityLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="spinner"></div>
          </div>
        ) : activity.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No recent activity found.
          </p>
        ) : (
          <div className="space-y-3">
            {activity.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div className={`w-2 h-2 rounded-full ${
                  item.color === 'purple' ? 'bg-temple-purple' :
                  item.color === 'gold' ? 'bg-temple-gold' :
                  'bg-green-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatActivityDate(item.date)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
