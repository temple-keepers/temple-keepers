import { useState, useEffect } from 'react'
import { getAdminStats } from '../../lib/adminSupabase'
import { Users, ChefHat, BookOpen, Trophy, Flame, TrendingUp } from 'lucide-react'

const AdminAnalytics = () => {
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
    return <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-temple-gold/30 border-t-temple-gold rounded-full animate-spin" />
    </div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-white mb-1">Analytics Dashboard</h1>
        <p className="text-gray-400">Track your platform's growth</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <Users className="w-8 h-8 text-blue-500 mb-4" />
          <p className="text-3xl font-bold text-white">{stats?.users?.total || 0}</p>
          <p className="text-gray-400">Total Users</p>
          <p className="text-green-400 text-sm mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" />+{stats?.users?.newWeek || 0} this week</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <ChefHat className="w-8 h-8 text-green-500 mb-4" />
          <p className="text-3xl font-bold text-white">{stats?.recipes?.total || 0}</p>
          <p className="text-gray-400">Recipes Created</p>
          <p className="text-green-400 text-sm mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" />+{stats?.recipes?.week || 0} this week</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <BookOpen className="w-8 h-8 text-purple-500 mb-4" />
          <p className="text-3xl font-bold text-white">{stats?.devotionals?.total || 0}</p>
          <p className="text-gray-400">Devotionals</p>
          <p className="text-green-400 text-sm mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" />+{stats?.devotionals?.week || 0} this week</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 text-center">
          <Trophy className="w-10 h-10 text-temple-gold mx-auto mb-3" />
          <p className="text-3xl font-bold text-white">{stats?.engagement?.totalPoints?.toLocaleString() || 0}</p>
          <p className="text-gray-400">Total Points Earned</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 text-center">
          <Flame className="w-10 h-10 text-orange-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-white">{stats?.engagement?.avgStreak || 0}</p>
          <p className="text-gray-400">Avg Streak (days)</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 text-center">
          <Flame className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-white">{stats?.engagement?.maxStreak || 0}</p>
          <p className="text-gray-400">Max Streak (days)</p>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics