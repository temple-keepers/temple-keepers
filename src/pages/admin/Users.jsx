import { useEffect, useState, Fragment } from 'react'
import { useAdmin } from '../../contexts/AdminContext'
import { supabase } from '../../lib/supabase'
import { Search, UserCog, Shield } from 'lucide-react'

export const AdminUsers = () => {
  const { getUsers, updateUserRole, updateUserTier, isAdmin: adminReady } = useAdmin()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [lastActivityMap, setLastActivityMap] = useState({})
  const [lastActivityLoading, setLastActivityLoading] = useState(false)
  const [expandedUserId, setExpandedUserId] = useState(null)

  useEffect(() => {
    if (adminReady) loadUsers()
  }, [search, adminReady])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await getUsers({ search })

      if (!error && data) {
        setUsers(data)
        // Load activity in background — don't block user list
        loadLastActivity(data).catch(err => console.error('Activity load failed:', err))
      } else {
        console.warn('getUsers returned error or no data:', error)
        setUsers([])
        setLastActivityMap({})
      }
    } catch (err) {
      console.error('loadUsers failed:', err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const loadLastActivity = async (userList) => {
    const userIds = (userList || []).map(user => user.id).filter(Boolean)
    if (userIds.length === 0) {
      setLastActivityMap({})
      return
    }

    setLastActivityLoading(true)
    try {
      const [checkInsResult, mealsResult, symptomsResult, enrollmentsResult] = await Promise.all([
        supabase
          .from('wellness_check_ins')
          .select('user_id, created_at')
          .in('user_id', userIds),
        supabase
          .from('meal_logs')
          .select('user_id, created_at')
          .in('user_id', userIds),
        supabase
          .from('symptom_logs')
          .select('user_id, created_at')
          .in('user_id', userIds),
        supabase
          .from('program_enrollments')
          .select('user_id, created_at')
          .in('user_id', userIds)
      ])

      const latest = {}

      const updateLatest = (userId, dateValue) => {
        if (!userId || !dateValue) return
        const timestamp = new Date(dateValue).getTime()
        if (!latest[userId] || timestamp > latest[userId].timestamp) {
          latest[userId] = { timestamp, date: dateValue }
        }
      }

      checkInsResult.data?.forEach(row => updateLatest(row.user_id, row.created_at))
      mealsResult.data?.forEach(row => updateLatest(row.user_id, row.created_at))
      symptomsResult.data?.forEach(row => updateLatest(row.user_id, row.created_at))
      enrollmentsResult.data?.forEach(row => updateLatest(row.user_id, row.created_at))

      const map = {}
      Object.keys(latest).forEach((userId) => {
        map[userId] = latest[userId].date
      })
      setLastActivityMap(map)
    } catch (error) {
      console.error('Error loading last activity:', error)
    } finally {
      setLastActivityLoading(false)
    }
  }

  const formatActivityDate = (value) => {
    if (!value) return 'No activity'
    return new Date(value).toLocaleString()
  }

  const handleRoleChange = async (userId, newRole) => {
    const { data, error } = await updateUserRole(userId, newRole)

    if (!error) {
      // Update local state
      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ))
      setEditingUser(null)
    }
  }

  const handleTierChange = async (userId, newTier) => {
    const { data, error} = await updateUserTier(userId, newTier)

    if (!error) {
      // Update local state
      setUsers(users.map(u =>
        u.id === userId ? { ...u, tier: newTier } : u
      ))
    }
  }

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return Shield
      case 'coach': return UserCog
      default: return null
    }
  }

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'coach': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getTierBadgeColor = (tier) => {
    switch(tier) {
      case 'pro': return 'bg-temple-gold/20 text-temple-gold'
      case 'premium': return 'bg-temple-purple/20 text-temple-purple'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
          User Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage users, roles, and tiers
        </p>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="form-input pl-10 w-full"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Users
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.length}
          </p>
        </div>

        <div className="glass-card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Premium Users
          </p>
          <p className="text-2xl font-bold text-temple-purple dark:text-temple-gold">
            {users.filter(u => u.tier === 'premium').length}
          </p>
        </div>

        <div className="glass-card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Pro Users
          </p>
          <p className="text-2xl font-bold text-temple-gold">
            {users.filter(u => u.tier === 'pro').length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  User
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Role
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tier
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Joined
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Last Activity
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <div className="spinner mx-auto"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const RoleIcon = getRoleIcon(user.role)
                  const lastActivity = lastActivityMap[user.id]
                  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unnamed user'

                  return (
                    <Fragment key={user.id}>
                      <tr
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {displayName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </td>

                        <td className="p-4">
                          {editingUser === user.id ? (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="form-input text-sm py-1 px-2"
                              onBlur={() => setEditingUser(null)}
                              autoFocus
                            >
                              <option value="user">User</option>
                              <option value="coach">Coach</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <button
                              onClick={() => setEditingUser(user.id)}
                              className={`
                                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                                ${getRoleBadgeColor(user.role)}
                                hover:opacity-80 transition-opacity
                              `}
                            >
                              {RoleIcon && <RoleIcon className="w-3 h-3" />}
                              {user.role}
                            </button>
                          )}
                        </td>

                        <td className="p-4">
                          <select
                            value={user.tier}
                            onChange={(e) => handleTierChange(user.id, e.target.value)}
                            className={`
                              px-2.5 py-1 rounded-full text-xs font-medium border-0
                              ${getTierBadgeColor(user.tier)}
                            `}
                          >
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                            <option value="pro">Pro</option>
                          </select>
                        </td>

                        <td className="p-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </td>

                        <td className="p-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {lastActivityLoading ? 'Loading...' : formatActivityDate(lastActivity)}
                          </p>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                            className="text-sm text-temple-purple dark:text-temple-gold hover:underline"
                          >
                            {expandedUserId === user.id ? 'Hide Details' : 'View Details'}
                          </button>
                        </td>
                      </tr>
                      {expandedUserId === user.id && (
                        <tr className="bg-gray-50 dark:bg-gray-800/40">
                          <td colSpan="6" className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
                              <div>
                                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Phone</p>
                                <p>{user.phone || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Birth Year</p>
                                <p>{user.birth_year || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Last Activity</p>
                                <p>{formatActivityDate(lastActivity)}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
