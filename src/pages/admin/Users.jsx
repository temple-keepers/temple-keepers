import { useEffect, useState, useMemo } from 'react'
import { useAdmin } from '../../contexts/AdminContext'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  Search, Shield, MapPin, Phone, Calendar, Heart, Cross, Dumbbell, 
  UtensilsCrossed, BookOpen, Brain, Church, Users, X, Mail, Activity,
  Tag, StickyNote, Plus, Trash2, Filter, ChevronDown, Send, Clock,
  TrendingUp, TrendingDown, UserCheck, UserX, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Labels ───
const LABEL_MAP = {
  exploring: 'Exploring', new_believer: 'New believer', growing: 'Growing',
  established: 'Established', mature: 'Mature', returning: 'Returning',
  never: 'Never fasted', tried_once: 'Tried once', occasional: 'Occasional',
  regular: 'Regular', experienced: 'Experienced',
  sedentary: 'Sedentary', lightly_active: 'Lightly active', moderately_active: 'Moderately active',
  very_active: 'Very active', athlete: 'Athlete',
  female: 'Female', male: 'Male', prefer_not_to_say: 'Prefer not to say',
  single: 'Single', married: 'Married', engaged: 'Engaged', divorced: 'Divorced', widowed: 'Widowed',
  short_focused: 'Short & focused', deep_study: 'Deep study',
  reflective: 'Reflective', practical_application: 'Practical application',
  less_than_1: '<1 year', '1_to_3': '1–3 years', '3_to_10': '3–10 years',
  '10_to_20': '10–20 years', '20_plus': '20+ years',
}
const label = (val) => val ? (LABEL_MAP[val] || val.toString().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())) : '—'

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

// ─── Tag colours ───
const TAG_COLOURS = {
  'Active':            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Active This Week':  'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  'New Signup':        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'In Programme':      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Programme Graduate':'bg-temple-gold/20 text-temple-gold',
  'Repeat Graduate':   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Cooling Off':       'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Inactive 14d+':     'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  'Dormant 30d+':      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Never Engaged':     'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  'Has Fasted':        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Near Completion':   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Halfway There':     'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
}
const getTagColour = (tag) => TAG_COLOURS[tag] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'

// ─── Segment presets ───
const SEGMENTS = [
  { label: 'All', filter: () => true },
  { label: 'Active', filter: (u, tags) => tags.some(t => t === 'Active' || t === 'Active This Week') },
  { label: 'New (7d)', filter: (u, tags) => tags.includes('New Signup') },
  { label: 'In Programme', filter: (u, tags) => tags.includes('In Programme') },
  { label: 'Graduates', filter: (u, tags) => tags.includes('Programme Graduate') },
  { label: 'At Risk', filter: (u, tags) => tags.some(t => t === 'Cooling Off' || t === 'Inactive 14d+') },
  { label: 'Dormant', filter: (u, tags) => tags.includes('Dormant 30d+') || tags.includes('Never Engaged') },
]

// ─── Main Component ───
export const AdminUsers = () => {
  const { getUsers, updateUserRole, updateUserTier, isAdmin: adminReady } = useAdmin()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [lastActivityMap, setLastActivityMap] = useState({})
  const [userTagsMap, setUserTagsMap] = useState({}) // { userId: ['tag1', 'tag2'] }
  const [activeSegment, setActiveSegment] = useState(0)
  const [filterTag, setFilterTag] = useState('')

  // Detail drawer
  const [selectedUser, setSelectedUser] = useState(null)
  const [expandedHealth, setExpandedHealth] = useState({})
  const [expandedSpiritual, setExpandedSpiritual] = useState({})
  const [healthLoading, setHealthLoading] = useState({})
  const [spiritualLoading, setSpiritualLoading] = useState({})
  const [userNotes, setUserNotes] = useState([])
  const [notesLoading, setNotesLoading] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [newManualTag, setNewManualTag] = useState('')
  const [userEnrollments, setUserEnrollments] = useState([])
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false)

  useEffect(() => {
    if (adminReady) loadUsers()
  }, [search, adminReady])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await getUsers({ search })
      if (!error && data) {
        setUsers(data)
        loadLastActivity(data)
        loadAllTags(data)
      } else {
        setUsers([])
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
  }

  const loadAllTags = async (userList) => {
    const userIds = (userList || []).map(u => u.id)
    if (userIds.length === 0) return
    const { data } = await supabase.from('user_tags').select('user_id, tag, source').in('user_id', userIds)
    const map = {}
    data?.forEach(t => {
      if (!map[t.user_id]) map[t.user_id] = []
      map[t.user_id].push(t)
    })
    setUserTagsMap(map)
  }

  const loadUserDetails = async (user) => {
    setSelectedUser(user)
    loadHealthForUser(user.id)
    loadSpiritualForUser(user.id)
    loadNotesForUser(user.id)
    loadEnrollmentsForUser(user.id)
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

  const loadNotesForUser = async (userId) => {
    setNotesLoading(true)
    const { data } = await supabase.from('admin_notes')
      .select('id, content, created_at, author_id, profiles!admin_notes_author_id_fkey(first_name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    setUserNotes(data || [])
    setNotesLoading(false)
  }

  const loadEnrollmentsForUser = async (userId) => {
    setEnrollmentsLoading(true)
    const { data } = await supabase.from('program_enrollments')
      .select('id, status, start_date, fasting_type, completed_days, programs(title, duration_days)')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
    setUserEnrollments(data || [])
    setEnrollmentsLoading(false)
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedUser) return
    setSavingNote(true)
    const { error } = await supabase.from('admin_notes').insert({
      user_id: selectedUser.id,
      author_id: currentUser.id,
      content: newNote.trim()
    })
    if (!error) {
      setNewNote('')
      loadNotesForUser(selectedUser.id)
      toast.success('Note added')
    } else {
      toast.error('Failed to add note')
    }
    setSavingNote(false)
  }

  const handleDeleteNote = async (noteId) => {
    const { error } = await supabase.from('admin_notes').delete().eq('id', noteId)
    if (!error) {
      setUserNotes(prev => prev.filter(n => n.id !== noteId))
      toast.success('Note deleted')
    }
  }

  const handleAddManualTag = async () => {
    if (!newManualTag.trim() || !selectedUser) return
    const { error } = await supabase.from('user_tags').upsert({
      user_id: selectedUser.id,
      tag: newManualTag.trim(),
      source: 'manual'
    }, { onConflict: 'user_id,tag' })
    if (!error) {
      setNewManualTag('')
      // Update local state
      setUserTagsMap(prev => ({
        ...prev,
        [selectedUser.id]: [...(prev[selectedUser.id] || []), { user_id: selectedUser.id, tag: newManualTag.trim(), source: 'manual' }]
      }))
      toast.success('Tag added')
    }
  }

  const handleRemoveTag = async (userId, tag) => {
    const { error } = await supabase.from('user_tags').delete().eq('user_id', userId).eq('tag', tag)
    if (!error) {
      setUserTagsMap(prev => ({
        ...prev,
        [userId]: (prev[userId] || []).filter(t => t.tag !== tag)
      }))
      toast.success('Tag removed')
    }
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

  // ─── Filtering & Segment ───
  const filteredUsers = useMemo(() => {
    const segment = SEGMENTS[activeSegment]
    return users.filter(u => {
      const tags = (userTagsMap[u.id] || []).map(t => t.tag)
      if (!segment.filter(u, tags)) return false
      if (filterTag && !tags.includes(filterTag)) return false
      return true
    })
  }, [users, userTagsMap, activeSegment, filterTag])

  // All unique tags for filter dropdown
  const allTags = useMemo(() => {
    const set = new Set()
    Object.values(userTagsMap).forEach(tags => tags.forEach(t => set.add(t.tag)))
    return [...set].sort()
  }, [userTagsMap])

  // ─── Helpers ───
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

  // Stats
  const activeCount = users.filter(u => {
    const tags = (userTagsMap[u.id] || []).map(t => t.tag)
    return tags.includes('Active') || tags.includes('Active This Week')
  }).length

  const atRiskCount = users.filter(u => {
    const tags = (userTagsMap[u.id] || []).map(t => t.tag)
    return tags.includes('Cooling Off') || tags.includes('Inactive 14d+')
  }).length

  const health = selectedUser ? expandedHealth[selectedUser.id] : null
  const spiritual = selectedUser ? expandedSpiritual[selectedUser.id] : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">CRM Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage users, track engagement, add tags and notes</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCount}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400">At Risk</p>
          </div>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{atRiskCount}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-4 h-4 text-temple-purple dark:text-temple-gold" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Premium</p>
          </div>
          <p className="text-2xl font-bold text-temple-purple dark:text-temple-gold">{users.filter(u => u.tier === 'premium').length}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400">New (7d)</p>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {users.filter(u => (Date.now() - new Date(u.created_at).getTime()) < 7 * 86400000).length}
          </p>
        </div>
      </div>

      {/* Segment Tabs + Search + Filter */}
      <div className="glass-card p-4 space-y-3">
        {/* Segment pills */}
        <div className="flex flex-wrap gap-2">
          {SEGMENTS.map((seg, i) => (
            <button
              key={seg.label}
              onClick={() => setActiveSegment(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeSegment === i
                  ? 'bg-temple-purple text-white dark:bg-temple-gold'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {seg.label}
              <span className="ml-1 opacity-70">
                ({users.filter(u => seg.filter(u, (userTagsMap[u.id] || []).map(t => t.tag))).length})
              </span>
            </button>
          ))}
        </div>

        {/* Search + tag filter row */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="form-input pl-10 w-full text-sm" />
          </div>
          <div className="relative">
            <select
              value={filterTag}
              onChange={e => setFilterTag(e.target.value)}
              className="form-input text-sm pr-8 appearance-none"
            >
              <option value="">All tags</option>
              {allTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Tags</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tier</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Activity</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center"><div className="spinner mx-auto"></div></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No users found in this segment</td></tr>
              ) : (
                filteredUsers.map((user) => {
                  const displayName = user.first_name || 'Unnamed'
                  const tags = (userTagsMap[user.id] || []).map(t => t.tag)
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
                      <td className="p-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {tags.slice(0, 3).map(t => (
                            <span key={t} className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${getTagColour(t)}`}>
                              {t}
                            </span>
                          ))}
                          {tags.length > 3 && (
                            <span className="text-[10px] text-gray-400 self-center">+{tags.length - 3}</span>
                          )}
                        </div>
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
                      <td className="p-4 hidden md:table-cell">
                        <p className="text-xs text-gray-500">{formatActivityDate(lastAct)}</p>
                      </td>
                      <td className="p-4">
                        <button onClick={() => loadUserDetails(user)} className="text-sm font-medium text-temple-purple dark:text-temple-gold hover:underline">
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

      {/* ====== DETAIL DRAWER ====== */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedUser(null)} />
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

              {/* Tags Section */}
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Tags
                </h3>
                <div className="glass-card p-4">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(userTagsMap[selectedUser.id] || []).map(t => (
                      <span key={t.tag} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getTagColour(t.tag)}`}>
                        {t.tag}
                        {t.source === 'manual' && (
                          <button onClick={() => handleRemoveTag(selectedUser.id, t.tag)} className="ml-0.5 hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                    {(!userTagsMap[selectedUser.id] || userTagsMap[selectedUser.id].length === 0) && (
                      <span className="text-xs text-gray-400">No tags yet</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newManualTag}
                      onChange={e => setNewManualTag(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddManualTag()}
                      placeholder="Add manual tag..."
                      className="form-input text-xs flex-1"
                    />
                    <button onClick={handleAddManualTag} disabled={!newManualTag.trim()} className="px-3 py-1.5 rounded-lg bg-temple-purple dark:bg-temple-gold text-white text-xs font-medium disabled:opacity-40">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Programme History */}
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Programme History
                </h3>
                {enrollmentsLoading ? (
                  <div className="glass-card p-6 text-center"><div className="spinner mx-auto"></div></div>
                ) : userEnrollments.length === 0 ? (
                  <div className="glass-card p-4 text-center text-sm text-gray-400">No programmes yet</div>
                ) : (
                  <div className="glass-card divide-y divide-gray-100 dark:divide-gray-800">
                    {userEnrollments.map(enr => {
                      const prog = enr.programs
                      const completed = enr.completed_days?.length || 0
                      const total = prog?.duration_days || 14
                      const pct = Math.round((completed / total) * 100)
                      return (
                        <div key={enr.id} className="p-4">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{prog?.title || 'Unknown'}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              enr.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              enr.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {enr.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>Started {new Date(enr.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                            {enr.fasting_type && <span>• {label(enr.fasting_type)} fast</span>}
                            <span>• {completed}/{total} days ({pct}%)</span>
                          </div>
                          <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-temple-purple dark:bg-temple-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Notes Section */}
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-2">
                  <StickyNote className="w-4 h-4" /> Notes
                </h3>
                <div className="glass-card p-4 space-y-3">
                  {/* Add note */}
                  <div className="flex gap-2">
                    <textarea
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Add a note about this user..."
                      className="form-input text-sm flex-1 resize-none"
                      rows={2}
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || savingNote}
                      className="self-end px-3 py-2 rounded-lg bg-temple-purple dark:bg-temple-gold text-white text-xs font-medium disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Notes list */}
                  {notesLoading ? (
                    <div className="text-center py-3"><div className="spinner mx-auto"></div></div>
                  ) : userNotes.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">No notes yet</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {userNotes.map(note => (
                        <div key={note.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-xs text-gray-400">
                              {note.profiles?.first_name || 'Admin'} • {new Date(note.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                            </p>
                            <button onClick={() => handleDeleteNote(note.id)} className="text-gray-300 hover:text-red-500 flex-shrink-0">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

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
                  <InfoRow icon={Church} label="Church">{selectedUser.church_denomination || '—'}</InfoRow>
                  <InfoRow icon={Clock} label="Timezone">{selectedUser.timezone || '—'}</InfoRow>
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
                    {health.medications_notes && <InfoRow icon={Heart} label="Medications">{health.medications_notes}</InfoRow>}
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
