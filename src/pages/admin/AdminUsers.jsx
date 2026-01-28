import { useState, useEffect } from 'react'
import { getAllUsers, getUserDetails, updateUserSubscription, deleteUser } from '../../lib/adminSupabase'
import { supabase } from '../../lib/supabase'
import { useAdmin } from '../../contexts/AdminContext'
import { Users, Search, ChevronLeft, ChevronRight, Eye, Trophy, Flame, X, RefreshCw, Crown, Edit, Trash2, Save, AlertTriangle } from 'lucide-react'

const PLAN_COLORS = {
  free: 'bg-gray-600 text-gray-200',
  starter: 'bg-blue-600 text-white',
  growth: 'bg-purple-600 text-white',
  premium: 'bg-temple-gold text-gray-900'
}

const STATUS_COLORS = {
  active: 'bg-green-600 text-white',
  cancelled: 'bg-red-600 text-white',
  past_due: 'bg-yellow-600 text-gray-900',
  trialing: 'bg-blue-500 text-white'
}

const AdminUsers = () => {
  const { adminData, isSuperAdmin } = useAdmin()
  
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [editingSubscription, setEditingSubscription] = useState(false)
  const [newPlan, setNewPlan] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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
    setEditingSubscription(false)
    setShowDeleteConfirm(false)
    const details = await getUserDetails(user.id)
    setUserDetails(details)
    setNewPlan(details.subscription?.plan_name || details.subscription?.plan || 'free')
    setNewStatus(details.subscription?.status || 'active')
  }

  const handleSaveSubscription = async () => {
    if (!selectedUser) return
    setSaving(true)
    console.log('💾 Saving subscription:', selectedUser.id, newPlan, newStatus)
    const result = await updateUserSubscription(selectedUser.id, newPlan, newStatus)
    console.log('💾 Save result:', result)
    if (result.success) {
      setEditingSubscription(false)
      loadUsers()
      // Refresh user details
      const details = await getUserDetails(selectedUser.id)
      setUserDetails(details)
      alert('Subscription updated successfully!')
    } else {
      alert('Failed to update subscription: ' + (result.error?.message || 'Unknown error'))
    }
    setSaving(false)
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    setSaving(true)
    const result = await deleteUser(selectedUser.id)
    if (result.success) {
      setSelectedUser(null)
      setUserDetails(null)
      setShowDeleteConfirm(false)
      loadUsers()
    }
    setSaving(false)
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
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Plan</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Joined</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Streak</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Points</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const subscription = user.subscriptions?.[0] || user.subscriptions
                  const plan = subscription?.plan_name || subscription?.plan || 'free'
                  const status = subscription?.status || 'active'
                  const stats = user.user_stats?.[0] || user.user_stats
                  
                  return (
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
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${PLAN_COLORS[plan] || PLAN_COLORS.free}`}>
                          {plan === 'premium' && <Crown className="w-3 h-3 inline mr-1" />}
                          {plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[status] || STATUS_COLORS.active}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{new Date(user.created_at).toLocaleDateString('en-GB')}</td>
                      <td className="px-6 py-4"><div className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-orange-500" /><span className="text-gray-300">{stats?.streak_days || 0}</span></div></td>
                      <td className="px-6 py-4"><div className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-temple-gold" /><span className="text-gray-300">{stats?.total_points || 0}</span></div></td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => viewUser(user)} className="p-2 rounded-lg hover:bg-gray-600 text-gray-400 hover:text-white"><Eye className="w-5 h-5" /></button>
                      </td>
                    </tr>
                  )
                })}
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
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">{selectedUser.full_name || 'User Details'}</h2>
              <button onClick={() => { setSelectedUser(null); setUserDetails(null); setShowDeleteConfirm(false) }} className="p-2 rounded-lg hover:bg-gray-700"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-gray-400 mb-4">{selectedUser.email}</p>
            
            {userDetails && (
              <>
                {/* Subscription Section */}
                <div className="mb-6 p-4 bg-gray-700/50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-temple-gold" />
                      Subscription
                    </h3>
                    {isSuperAdmin && !editingSubscription && (
                      <button onClick={() => setEditingSubscription(true)} className="p-1.5 rounded-lg hover:bg-gray-600 text-gray-400 hover:text-white">
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {editingSubscription ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Plan</label>
                        <select 
                          value={newPlan} 
                          onChange={(e) => setNewPlan(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-temple-gold focus:outline-none"
                        >
                          <option value="free">Free</option>
                          <option value="starter">Starter</option>
                          <option value="growth">Growth</option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Status</label>
                        <select 
                          value={newStatus} 
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-temple-gold focus:outline-none"
                        >
                          <option value="active">Active</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="past_due">Past Due</option>
                          <option value="trialing">Trialing</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleSaveSubscription} 
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-temple-purple text-white rounded-lg hover:bg-temple-purple-dark disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                          onClick={() => setEditingSubscription(false)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${PLAN_COLORS[userDetails.subscription?.plan] || PLAN_COLORS.free}`}>
                        {userDetails.subscription?.plan || 'free'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${STATUS_COLORS[userDetails.subscription?.status] || STATUS_COLORS.active}`}>
                        {userDetails.subscription?.status || 'active'}
                      </span>
                    </div>
                  )}
                  
                  {userDetails.subscription?.current_period_end && (
                    <p className="text-xs text-gray-400 mt-2">
                      Period ends: {new Date(userDetails.subscription.current_period_end).toLocaleDateString('en-GB')}
                    </p>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
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

                {/* User Info */}
                <div className="space-y-2 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Joined</span>
                    <span className="text-white">{new Date(selectedUser.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Onboarding</span>
                    <span className={selectedUser.onboarding_completed ? 'text-green-400' : 'text-yellow-400'}>
                      {selectedUser.onboarding_completed ? 'Completed' : 'Incomplete'}
                    </span>
                  </div>
                  {selectedUser.health_goals?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Health Goals</span>
                      <span className="text-white text-right">{selectedUser.health_goals.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Delete User (SuperAdmin only) */}
                {isSuperAdmin && (
                  <div className="border-t border-gray-700 pt-4">
                    {showDeleteConfirm ? (
                      <div className="bg-red-900/30 border border-red-700 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-red-400 mb-3">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="font-medium">Confirm Delete</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-4">
                          This will permanently delete this user and all their data. This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <button 
                            onClick={handleDeleteUser}
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            {saving ? 'Deleting...' : 'Delete User'}
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 border border-red-600/50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete User
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers