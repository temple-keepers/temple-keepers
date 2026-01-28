import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAdminStats } from '../../lib/adminSupabase'
import { Users, ChefHat, BookOpen, Trophy, TrendingUp, Flame, ArrowRight, Zap } from 'lucide-react'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const data = await getAdminStats()
      setStats(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-temple-gold/30 border-t-temple-gold rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Users', value: stats?.users?.total || 0, change: `+${stats?.users?.newWeek || 0} this week`, icon: Users, color: 'blue', link: '/admin/users' },
    { label: 'Recipes Created', value: stats?.recipes?.total || 0, change: `+${stats?.recipes?.week || 0} this week`, icon: ChefHat, color: 'green', link: '/admin/recipes' },
    { label: 'Devotionals Completed', value: stats?.devotionals?.total || 0, change: `+${stats?.devotionals?.week || 0} this week`, icon: BookOpen, color: 'purple', link: '/admin/analytics' },
    { label: 'Total Points', value: stats?.engagement?.totalPoints?.toLocaleString() || 0, change: `Avg streak: ${stats?.engagement?.avgStreak || 0} days`, icon: Trophy, color: 'gold', link: '/admin/analytics' },
    { label: 'Challenges', value: 'Manage', change: 'Create & edit challenges', icon: Zap, color: 'orange', link: '/admin/challenges' }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's an overview of Temple Keepers.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Link key={i} to={stat.link} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                  <Icon className="w-6 h-6" style={{ color: stat.color === 'blue' ? '#3b82f6' : stat.color === 'green' ? '#22c55e' : stat.color === 'purple' ? '#a855f7' : stat.color === 'orange' ? '#f97316' : '#d4a574' }} />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-temple-gold transition-all" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />{stat.change}
              </p>
            </Link>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Engagement Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-700/50">
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-gray-300">Average Streak</span>
              </div>
              <span className="text-white font-semibold">{stats?.engagement?.avgStreak || 0} days</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-700/50">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-temple-gold" />
                <span className="text-gray-300">Highest Streak</span>
              </div>
              <span className="text-white font-semibold">{stats?.engagement?.maxStreak || 0} days</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats?.users?.newMonth || 0}</p>
              <p className="text-xs text-gray-400">New Users (30d)</p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{(stats?.recipes?.week || 0) + (stats?.devotionals?.week || 0)}</p>
              <p className="text-xs text-gray-400">Content (7d)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard