import { useState, useEffect } from 'react'
import { getLeaderboard } from '../../lib/community'
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Star,
  User,
  TrendingUp
} from 'lucide-react'

const LeaderboardTab = ({ user, isDark }) => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    setLoading(true)
    const data = await getLeaderboard(50)
    setLeaderboard(data)
    setLoading(false)
  }

  const getMedalColor = (rank) => {
    if (rank === 1) return 'text-yellow-500'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-amber-600'
    return isDark ? 'text-gray-500' : 'text-gray-400'
  }

  const getMedalBg = (rank) => {
    if (rank === 1) return 'bg-yellow-500/20'
    if (rank === 2) return 'bg-gray-400/20'
    if (rank === 3) return 'bg-amber-600/20'
    return isDark ? 'bg-gray-700' : 'bg-gray-100'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin" />
      </div>
    )
  }

  // Find current user's rank
  const userRank = leaderboard.findIndex(l => l.id === user.id) + 1

  return (
    <div className="space-y-4">
      {/* User's Position */}
      {userRank > 0 && (
        <div className={`rounded-2xl p-4 ${
          isDark 
            ? 'bg-gradient-to-r from-temple-purple/20 to-temple-gold/10 border border-temple-purple/30' 
            : 'bg-gradient-to-r from-temple-purple/10 to-temple-gold/10 border border-temple-purple/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getMedalBg(userRank)}`}>
                <span className={`text-lg font-bold ${getMedalColor(userRank)}`}>
                  #{userRank}
                </span>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Your Rank
                </p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {leaderboard[userRank - 1]?.points || 0} points
                </p>
              </div>
            </div>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* 2nd Place */}
          <div className={`rounded-2xl p-4 text-center ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-400/20 flex items-center justify-center">
              <Medal className="w-6 h-6 text-gray-400" />
            </div>
            <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              {leaderboard[1]?.avatar_url ? (
                <img src={leaderboard[1].avatar_url} className="w-10 h-10 rounded-full" />
              ) : (
                <User className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {leaderboard[1]?.full_name || 'Temple Keeper'}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {leaderboard[1]?.points} pts
            </p>
          </div>

          {/* 1st Place */}
          <div className={`rounded-2xl p-4 text-center -mt-4 ${
            isDark ? 'bg-gradient-to-b from-yellow-500/20 to-gray-800' : 'bg-gradient-to-b from-yellow-50 to-white shadow-lg'
          }`}>
            <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className={`w-14 h-14 mx-auto mb-2 rounded-full flex items-center justify-center border-4 border-yellow-500 ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              {leaderboard[0]?.avatar_url ? (
                <img src={leaderboard[0].avatar_url} className="w-12 h-12 rounded-full" />
              ) : (
                <User className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {leaderboard[0]?.full_name || 'Temple Keeper'}
            </p>
            <p className="text-sm text-yellow-500 font-medium">
              {leaderboard[0]?.points} pts
            </p>
          </div>

          {/* 3rd Place */}
          <div className={`rounded-2xl p-4 text-center ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-600/20 flex items-center justify-center">
              <Medal className="w-6 h-6 text-amber-600" />
            </div>
            <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              {leaderboard[2]?.avatar_url ? (
                <img src={leaderboard[2].avatar_url} className="w-10 h-10 rounded-full" />
              ) : (
                <User className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {leaderboard[2]?.full_name || 'Temple Keeper'}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {leaderboard[2]?.points} pts
            </p>
          </div>
        </div>
      )}

      {/* Full List */}
      <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {leaderboard.slice(3).map((member, index) => {
            const rank = index + 4
            const isCurrentUser = member.id === user.id

            return (
              <div 
                key={member.id}
                className={`flex items-center gap-4 px-4 py-3 ${
                  isCurrentUser ? (isDark ? 'bg-temple-purple/10' : 'bg-temple-purple/5') : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {rank}
                  </span>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  {member.avatar_url ? (
                    <img src={member.avatar_url} className="w-10 h-10 rounded-full" />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${
                    isCurrentUser ? 'text-temple-purple' : isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {member.full_name || 'Temple Keeper'}
                    {isCurrentUser && ' (You)'}
                  </p>
                  {member.streak > 0 && (
                    <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Flame className="w-3 h-3 text-orange-500" />
                      {member.streak} day streak
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {member.points}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>points</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {leaderboard.length === 0 && (
        <div className={`text-center py-12 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <Trophy className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No rankings yet
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Start earning points to appear on the leaderboard!
          </p>
        </div>
      )}
    </div>
  )
}

export default LeaderboardTab