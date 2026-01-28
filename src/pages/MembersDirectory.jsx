import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { supabase } from '../lib/supabase'
import {
  Users,
  Search,
  MapPin,
  Calendar,
  Trophy,
  Flame,
  Crown,
  Lock,
  User,
  Mail,
  Filter,
  ChevronDown
} from 'lucide-react'

const MembersDirectory = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { isPaid, loading: subLoading } = useSubscription()
  
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name') // name, points, streak, joined

  useEffect(() => {
    if (isPaid) {
      loadMembers()
    }
  }, [isPaid])

  const loadMembers = async () => {
    setLoading(true)
    try {
      // Get profiles that have opted in to be visible in community
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          bio,
          location,
          created_at,
          community_visible
        `)
        .eq('community_visible', true)
        .order('full_name', { ascending: true })

      if (error) throw error

      // Get user stats for each profile
      const { data: stats } = await supabase
        .from('user_stats')
        .select('user_id, total_points, streak_days')

      // Merge stats with profiles
      const membersWithStats = (profiles || []).map(profile => {
        const userStats = stats?.find(s => s.user_id === profile.id) || {}
        return {
          ...profile,
          points: userStats.total_points || 0,
          streak: userStats.streak_days || 0
        }
      })

      setMembers(membersWithStats)
    } catch (error) {
      console.error('Error loading members:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort members
  const filteredMembers = members
    .filter(member => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        member.full_name?.toLowerCase().includes(query) ||
        member.location?.toLowerCase().includes(query) ||
        member.bio?.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'points':
          return b.points - a.points
        case 'streak':
          return b.streak - a.streak
        case 'joined':
          return new Date(b.created_at) - new Date(a.created_at)
        default:
          return (a.full_name || '').localeCompare(b.full_name || '')
      }
    })

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    })
  }

  // Show loading while checking subscription
  if (subLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin" />
      </div>
    )
  }

  // Show upgrade prompt for non-paid members
  if (!isPaid) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className={`rounded-3xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-temple-purple/20 to-temple-gold/20 flex items-center justify-center">
            <Lock className="w-10 h-10 text-temple-gold" />
          </div>
          <h1 className={`text-2xl font-display font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Members Directory
          </h1>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Connect with fellow Temple Keepers! The Members Directory is an exclusive feature for our paid members.
          </p>
          <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              What you'll get:
            </h3>
            <ul className={`text-sm space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4 text-temple-purple" />
                Browse all community members
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-temple-purple" />
                Find members in your area
              </li>
              <li className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-temple-purple" />
                See member achievements & stats
              </li>
            </ul>
          </div>
          <a
            href="/profile#subscription"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium"
          >
            <Crown className="w-5 h-5" />
            Upgrade to Access
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Members Directory
        </h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Connect with {members.length} Temple Keepers in our community
        </p>
      </div>

      {/* Search & Filters */}
      <div className={`rounded-2xl p-4 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, location, or bio..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
            >
              <option value="name">Sort by Name</option>
              <option value="points">Sort by Points</option>
              <option value="streak">Sort by Streak</option>
              <option value="joined">Recently Joined</option>
            </select>
            <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className={`text-center py-12 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <Users className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {searchQuery ? 'No members found' : 'No visible members yet'}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchQuery ? 'Try a different search term' : 'Members can opt in via their profile settings'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className={`rounded-2xl p-5 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'} hover:scale-[1.02] transition-transform`}
            >
              {/* Avatar & Name */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {member.full_name || 'Temple Keeper'}
                  </h3>
                  {member.location && (
                    <p className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <MapPin className="w-3.5 h-3.5" />
                      {member.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio */}
              {member.bio && (
                <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {member.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 pt-3 border-t border-dashed ${isDark ? 'border-gray-700' : 'border-gray-200'}">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-temple-gold" />
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {member.points.toLocaleString()}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>pts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {member.streak}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>day streak</span>
                </div>
              </div>

              {/* Join Date */}
              <div className={`flex items-center gap-1.5 mt-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Calendar className="w-3.5 h-3.5" />
                Joined {formatDate(member.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MembersDirectory
