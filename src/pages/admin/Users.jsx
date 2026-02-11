import { useEffect, useState, Fragment } from 'react'
import { useAdmin } from '../../contexts/AdminContext'
import { supabase } from '../../lib/supabase'
import { 
  Search, UserCog, Shield, ChevronDown, ChevronUp, MapPin, Phone, Calendar,
  Heart, Cross, Dumbbell, UtensilsCrossed, BookOpen, Brain, Church, Users,
  X, Mail, Activity
} from 'lucide-react'

const LABEL_MAP = {
  // Faith stages
  exploring: 'Exploring', new_believer: 'New believer', growing: 'Growing',
  established: 'Established', mature: 'Mature', returning: 'Returning',
  // Fasting experience
  never: 'Never fasted', tried_once: 'Tried once', occasional: 'Occasional',
  regular: 'Regular', experienced: 'Experienced',
  // Fitness
  sedentary: 'Sedentary', lightly_active: 'Lightly active', moderately_active: 'Moderately active',
  very_active: 'Very active', athlete: 'Athlete',
  // Gender
  female: 'Female', male: 'Male', prefer_not_to_say: 'Prefer not to say',
  // Marital
  single: 'Single', married: 'Married', engaged: 'Engaged', divorced: 'Divorced', widowed: 'Widowed',
  // Devotional
  short_focused: 'Short & focused', deep_study: 'Deep study',
  reflective: 'Reflective', practical_application: 'Practical application',
  // Years
  less_than_1: '<1 year', '1_to_3': '1–3 years', '3_to_10': '3–10 years',
  '10_to_20': '10–20 years', '20_plus': '20+ years',
}

const label = (val) => {
  if (!val) return '—'
  return LABEL_MAP[val] || val.toString().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const chipList = (arr) => {
  if (!arr || arr.length === 0) return <span className="text-gray-400">None</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {arr.map((item, i) => (
        <span key={i} className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-temple-purple/10 dark:bg-temple-gold/10 text-temple-purple dark:text-temple-gold">
          {label(item)}
        </span>
      ))}
    </div>
  )
}

const InfoRow = ({ icon: Icon, label: l, children }) => (
  <div className="flex items-start gap-3 py-2">
    {Icon && <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />}
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">{l}</p>
      <div className="text-sm text-gray-800 dark:text-gray-200">{children || '—'}</div>
    </div>
  </div>
)

export const AdminUsers = () => {
  const { getUsers, updateUserRole, updateUserTier, isAdmin: adminReady } = useAdmin()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [lastActivityMap, setLastActivityMap] = useState({})
  const [lastActivityLoading, setLastActivityLoading] = useState(false)
  const [expandedUserId, setExpandedUserId] = useState(null)
  const [expandedHealth, setExpandedHealth] = useState({})
  const [expandedSpiritual, setExpandedSpiritual] = useState({})
  const [healthLoading, setHealthLoading] = useState({})
  const [spiritualLoading, setSpiritualLoading] = useState({})
  const [selectedUser, setSelectedUser] = useState(null) // full detail drawer

  useEffect(() => {
    if (adminReady) loadUsers()
  }, [search, adminReady])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await getUsers({ search })
      if (!error && data) {
        setUsers(data)
        loadLastActivity(data).catch(console.error)
      } else {
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
    const userIds = (userList || []).map(u => u.id).filter(Boolean)
    if (userIds.length === 0) { setLastActivityMap({}); return }
    setLastActivityLoading(true)
    try {
      const [a, b, c, d] = await Promise.all([
        supabase.from('wellness_check_ins').select('user_id, created_at').in('user_id', userIds),
        supabase.from('meal_logs').select('user_id, created_at').in('user_id', userIds),
        supabase.from('symptom_logs').select('user_id, created_at').in('user_id', userIds),
        supabase.from('program_enrollments').select('user_id, created_at').in('user_id', userIds),
      ])
      const latest = {}
      const update = (uid, dt) => { if (!uid || !dt) return; const t = new Date(dt).getTime(); if (!latest[uid] || t > latest[uid]) latest[uid] = t }
      a.data?.forEach(r => update(r.user_id, r.created_at))
      b.data?.forEach(r => update(r.user_id, r.created_at))
      c.data?.forEach(r => update(r.user_id, r.created_at))
      d.data?.forEach(r => update(r.user_id, r.created_at))
      const map = {}
      Object.entries(latest).forEach(([uid, t]) => { map[uid] = new Date(t).toISOString() })
      setLastActivityMap(map)
    } catch (e) { console.error(e) }
    finally { setLastActivityLoading(false) }
  }

  const loadHealthForUser = async (userId) => {
    if (expandedHealth[userId]) return
    setHealthLoading(p => ({ ...p, [userId]: true }))
    const { data } = await supabase.from('user_health_profiles').select('*').eq('user_id', userId).single()
    setExpandedHealth(p => ({ ...p, [userId]: data || {} }))
    setHealthLoading(p => ({ ...p, [userId]: false }))
  }

  const loadSpiritualForUser = async (userId) => {
    if (expandedSpiritual[userId]) return
    setSpiritualLoading(p => ({ ...p, [userId]: true }))
    const { data } = await supabase.from('user_spiritual_profiles').select('*').eq('user_id', userId).single()
    setExpandedSpiritual(p => ({ ...p, [userId]: data || {} }))
    setSpiritualLoading(p => ({ ...p, [userId]: false }))
  }

  const openUserDetail = async (user) => {
    setSelectedUser(user)
    await Promise.all([loadHealthForUser(user.id), loadSpiritualForUser(user.id)])
  }

  const formatActivityDate = (value) => {
    if (!value) return 'No activity'
    const d = new Date(value)
    const now = new Date()
    const diffH = Math.floor((now - d) / 3600000)
    if (diffH < 1) return 'Just now'
    if (diffH < 24) return `${diffH}h ago`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 7) return `${diffD}d ago`
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const handleRoleChange = async (userId, newRole) => {
    const { error } = await updateUserRole(userId, newRole)
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      setEditingUser(null)
    }
  }

  const handleTierChange = async (userId, newTier) => {
    const { error } = await updateUserTier(userId, newTier)
    if (!error) setUsers(users.map(u => u.id === userId ? { ...u, tier: newTier } : u))
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'coach': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getTierBadgeColor = (tier) => {
    switch (tier) {
      case 'pro': return 'bg-temple-gold/20 text-temple-gold'
      case 'premium': return 'bg-temple-purple/20 text-temple-purple'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const health = selectedUser ? expandedHealth[selectedUser.id] : null
  const spiritual = selectedUser ? expandedSpiritual[selectedUser.id] : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">User Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage users, roles, tiers, and view member profiles</p>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="form-input pl-10 w-full" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Premium</p>
          <p className="text-2xl font-bold text-temple-purple dark:text-temple-gold">{users.filter(u => u.tier === 'premium').length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pro</p>
          <p className="text-2xl font-bold text-temple-gold">{users.filter(u => u.tier === 'pro').length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active (7d)</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Object.values(lastActivityMap).filter(d => (Date.now() - new Date(d).getTime()) < 7 * 86400000).length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">User</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Location</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Tier</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">Joined</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">Activity</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center"><div className="spinner mx-auto"></div></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No users found</td></tr>
              ) : (
                users.map((user) => {
                  const displayName = user.first_name || 'Unnamed'
                  const location = [user.city, user.country].filter(Boolean).join(', ')
                  const lastAct = lastActivityMap[user.id]

                  return (
                    <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {displayName.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{displayName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{location || '—'}</p>
                      </td>
                      <td className="p-4">
                        {editingUser === user.id ? (
                          <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value)} className="form-input text-xs py-1 px-2" onBlur={() => setEditingUser(null)} autoFocus>
                            <option value="user">User</option>
                            <option value="coach">Coach</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <button onClick={() => setEditingUser(user.id)} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)} hover:opacity-80`}>
                            {user.role === 'admin' && <Shield className="w-3 h-3" />}
                            {user.role}
                          </button>
                        )}
                      </td>
                      <td className="p-4">
                        <select value={user.tier} onChange={e => handleTierChange(user.id, e.target.value)} className={`px-2 py-0.5 rounded-full text-xs font-medium border-0 ${getTierBadgeColor(user.tier)}`}>
                          <option value="free">Free</option>
                          <option value="premium">Premium</option>
                          <option value="pro">Pro</option>
                        </select>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <p className="text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <p className="text-sm text-gray-500">{lastActivityLoading ? '...' : formatActivityDate(lastAct)}</p>
                      </td>
                      <td className="p-4">
                        <button onClick={() => openUserDetail(user)} className="text-sm font-medium text-temple-purple dark:text-temple-gold hover:underline">
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====== DETAIL DRAWER / MODAL ====== */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedUser(null)} />
          
          {/* Drawer */}
          <div className="relative w-full max-w-lg h-full bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4 z-10">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {selectedUser.avatar_url ? (
                  <img src={selectedUser.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {(selectedUser.first_name || 'U').charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{selectedUser.first_name || 'Unnamed'}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-6">

              {/* Personal Info */}
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Personal
                </h3>
                <div className="glass-card p-4 space-y-1">
                  <InfoRow icon={Mail} label="Email">{selectedUser.email}</InfoRow>
                  <InfoRow icon={Phone} label="Phone">{selectedUser.phone || '—'}</InfoRow>
                  <InfoRow icon={Calendar} label="Birth Year">{selectedUser.birth_year || '—'}</InfoRow>
                  <InfoRow icon={Users} label="Gender">{label(selectedUser.gender)}</InfoRow>
                  <InfoRow icon={Heart} label="Marital Status">{label(selectedUser.marital_status)}</InfoRow>
                  <InfoRow icon={MapPin} label="Location">{[selectedUser.city, selectedUser.country].filter(Boolean).join(', ') || '—'}</InfoRow>
                  <InfoRow icon={Church} label="Church / Denomination">{selectedUser.church_denomination || '—'}</InfoRow>
                  <InfoRow icon={Activity} label="Timezone">{selectedUser.timezone || '—'}</InfoRow>
                  <InfoRow icon={Calendar} label="Joined">{new Date(selectedUser.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</InfoRow>
                  <InfoRow icon={Activity} label="Last Activity">{formatActivityDate(lastActivityMap[selectedUser.id])}</InfoRow>
                </div>
              </section>

              {/* Health Profile */}
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" /> Health Profile
                </h3>
                {healthLoading[selectedUser.id] ? (
                  <div className="glass-card p-6 text-center"><div className="spinner mx-auto"></div></div>
                ) : !health || Object.keys(health).length === 0 ? (
                  <div className="glass-card p-4 text-center text-sm text-gray-400">Not completed yet</div>
                ) : (
                  <div className="glass-card p-4 space-y-1">
                    <InfoRow icon={Dumbbell} label="Height">{health.height_cm ? `${health.height_cm} cm` : '—'}</InfoRow>
                    <InfoRow icon={Dumbbell} label="Current Weight">{health.current_weight_kg ? `${health.current_weight_kg} kg` : '—'}</InfoRow>
                    <InfoRow icon={Dumbbell} label="Target Weight">{health.target_weight_kg ? `${health.target_weight_kg} kg` : '—'}</InfoRow>
                    <InfoRow icon={Activity} label="Fitness Level">{label(health.fitness_level)}</InfoRow>
                    <InfoRow icon={Activity} label="Exercise Types">{chipList(health.exercise_types)}</InfoRow>
                    <InfoRow icon={UtensilsCrossed} label="Dietary Restrictions">{chipList(health.dietary_restrictions)}</InfoRow>
                    <InfoRow icon={UtensilsCrossed} label="Allergies">{chipList(health.allergies)}</InfoRow>
                    <InfoRow icon={UtensilsCrossed} label="Intolerances">{chipList(health.food_intolerances)}</InfoRow>
                    <InfoRow icon={Heart} label="Health Conditions">{chipList(health.health_conditions)}</InfoRow>
                    {health.health_concerns && <InfoRow icon={Heart} label="Concerns">{health.health_concerns}</InfoRow>}
                    {health.medications_notes && <InfoRow icon={Heart} label="Medication Notes">{health.medications_notes}</InfoRow>}
                  </div>
                )}
              </section>

              {/* Spiritual Profile */}
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-2">
                  <Cross className="w-4 h-4" /> Spiritual Profile
                </h3>
                {spiritualLoading[selectedUser.id] ? (
                  <div className="glass-card p-6 text-center"><div className="spinner mx-auto"></div></div>
                ) : !spiritual || Object.keys(spiritual).length === 0 ? (
                  <div className="glass-card p-4 text-center text-sm text-gray-400">Not completed yet</div>
                ) : (
                  <div className="glass-card p-4 space-y-1">
                    <InfoRow icon={Cross} label="Faith Journey">{label(spiritual.faith_journey_stage)}</InfoRow>
                    <InfoRow icon={Calendar} label="Years as Believer">{label(spiritual.years_as_believer)}</InfoRow>
                    <InfoRow icon={UtensilsCrossed} label="Fasting Experience">{label(spiritual.fasting_experience)}</InfoRow>
                    <InfoRow icon={Heart} label="Prayer Styles">{chipList(spiritual.prayer_style)}</InfoRow>
                    <InfoRow icon={BookOpen} label="Devotional Preference">{label(spiritual.devotional_preference)}</InfoRow>
                    <InfoRow icon={BookOpen} label="Bible Version">{spiritual.bible_version_preference || '—'}</InfoRow>
                    <InfoRow icon={BookOpen} label="Favourite Books">{chipList(spiritual.favourite_bible_books)}</InfoRow>
                  </div>
                )}
              </section>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
