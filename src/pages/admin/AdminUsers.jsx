import { useState, useEffect } from 'react'
import { getAllUsers, getUserDetails } from '../../lib/adminSupabase'
import { supabase } from '../../lib/supabase'
import { Users, Search, ChevronLeft, ChevronRight, Eye, Trophy, Flame, X, RefreshCw } from 'lucide-react'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const limit = 20

  useEffect(() => {
    loadUsers()
  }, [page])

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('admin-users-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('📡 Profile change detected:', payload)
          loadUsers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [page, search])

  const loadUsers = async () => {
    setLoading(true)
    const { users: data, total: count } = await getAllUsers(page, limit, search)
    setUsers(data)
    setTotal(count)
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    loadUsers()
  }

  const viewUser = async (user) => {
    setSelectedUser(user)
    const details = await getUserDetails(user.id)
    setUserDetails(details)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">User Management</h1>
          <p className="text-gray-400">{total} total users</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadUsers} className="p-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600" title="Refresh">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-temple-gold focus:outline-none w-64" />
            </div>
            <button type="submit" className="px-4 py-2 bg-temple-purple text-white rounded-xl hover:bg-temple-purple-dark">Search</button>
          </form>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-temple-gold/30 border-t-temple-gold rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">User</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Joined</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Streak</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Points</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-temple-purple to-temple-gold flex items-center justify-center text-white font-medium">
                          {user.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.full_name || 'No name'}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4"><div className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-orange-500" /><span className="text-gray-300">{user.user_stats?.[0]?.streak_days || 0}</span></div></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-temple-gold" /><span className="text-gray-300">{user.user_stats?.[0]?.total_points || 0}</span></div></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => viewUser(user)} className="p-2 rounded-lg hover:bg-gray-600 text-gray-400 hover:text-white"><Eye className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"><ChevronLeft className="w-5 h-5 text-gray-400" /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"><ChevronRight className="w-5 h-5 text-gray-400" /></button>
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">{selectedUser.full_name || 'User Details'}</h2>
              <button onClick={() => { setSelectedUser(null); setUserDetails(null) }} className="p-2 rounded-lg hover:bg-gray-700"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-gray-400 mb-4">{selectedUser.email}</p>
            {userDetails && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{userDetails.stats?.streak_days || 0}</p>
                  <p className="text-xs text-gray-400">Streak</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{userDetails.stats?.total_points || 0}</p>
                  <p className="text-xs text-gray-400">Points</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{userDetails.stats?.recipes_saved || 0}</p>
                  <p className="text-xs text-gray-400">Recipes</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{userDetails.stats?.devotionals_completed || 0}</p>
                  <p className="text-xs text-gray-400">Devotionals</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers