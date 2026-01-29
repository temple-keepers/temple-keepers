import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useToast } from '../../contexts/ToastContext'
import { getAllChallengesAdmin, updateChallenge, deleteChallenge } from '../../lib/adminChallenges'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star,
  StarOff,
  Calendar,
  Trophy,
  Search,
  Filter,
  MoreVertical,
  Flame,
  Target,
  Droplets,
  Sparkles,
  Dumbbell,
  Brain,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Archive
} from 'lucide-react'

const AdminChallenges = () => {
  const { isDark } = useTheme()
  const { toast } = useToast()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showDeleteModal, setShowDeleteModal] = useState(null)

  useEffect(() => {
    loadChallenges()
  }, [])

  const loadChallenges = async () => {
    setLoading(true)
    const data = await getAllChallengesAdmin()
    setChallenges(data)
    setLoading(false)
  }

  const handleToggleActive = async (challenge) => {
    try {
      await updateChallenge(challenge.id, { is_active: !challenge.is_active })
      toast.success(`Challenge ${challenge.is_active ? 'deactivated' : 'activated'}`)
      loadChallenges()
    } catch (error) {
      toast.error('Failed to update challenge')
    }
  }

  const handleToggleFeatured = async (challenge) => {
    try {
      await updateChallenge(challenge.id, { is_featured: !challenge.is_featured })
      toast.success(`Challenge ${challenge.is_featured ? 'unfeatured' : 'featured'}`)
      loadChallenges()
    } catch (error) {
      toast.error('Failed to update challenge')
    }
  }

  const handlePublish = async (challenge) => {
    try {
      await updateChallenge(challenge.id, { status: 'published' })
      toast.success('Challenge published!')
      loadChallenges()
    } catch (error) {
      toast.error('Failed to publish challenge')
    }
  }

  const handleDelete = async (challengeId) => {
    try {
      await deleteChallenge(challengeId)
      toast.success('Challenge deleted')
      setShowDeleteModal(null)
      loadChallenges()
    } catch (error) {
      toast.error('Failed to delete challenge')
    }
  }

  const categoryIcons = {
    fasting: Flame,
    nutrition: Target,
    hydration: Droplets,
    prayer: Sparkles,
    fitness: Dumbbell,
    mindset: Brain
  }

  const statusColors = {
    draft: 'bg-amber-500/20 text-amber-500',
    published: 'bg-green-500/20 text-green-500',
    archived: 'bg-gray-500/20 text-gray-500'
  }

  const filteredChallenges = challenges.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className={`text-xl sm:text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Challenge Manager
          </h1>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Create and manage wellness challenges
          </p>
        </div>
        <Link
          to="/admin/challenges/new"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Create Challenge</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mb-1 sm:mb-2" />
          <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {challenges.length}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Challenges</p>
        </div>
        <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mb-1 sm:mb-2" />
          <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {challenges.filter(c => c.status === 'published').length}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Published</p>
        </div>
        <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 mb-1 sm:mb-2" />
          <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {challenges.filter(c => c.status === 'draft').length}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Drafts</p>
        </div>
        <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-temple-gold mb-1 sm:mb-2" />
          <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {challenges.filter(c => c.is_featured).length}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Featured</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search challenges..."
              className={`w-full pl-9 sm:pl-10 pr-4 py-2 rounded-lg sm:rounded-xl border text-sm sm:text-base ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {['all', 'published', 'draft', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  filterStatus === status
                    ? 'bg-temple-purple text-white'
                    : isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Challenge List */}
      <div className="space-y-4">
        {filteredChallenges.map((challenge) => {
          const Icon = categoryIcons[challenge.category] || Target
          
          return (
            <div 
              key={challenge.id}
              className={`rounded-xl sm:rounded-2xl p-3 sm:p-5 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-temple-purple" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-bold text-base sm:text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {challenge.title}
                          </h3>
                          {challenge.is_featured && (
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-temple-gold fill-temple-gold flex-shrink-0" />
                          )}
                        </div>
                        <p className={`text-xs sm:text-sm mb-2 sm:mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'} line-clamp-2`}>
                          {challenge.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[challenge.status]}`}>
                            {challenge.status}
                          </span>
                          <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Calendar className="w-3 h-3" />
                            {challenge.duration_days}d
                          </span>
                          <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Trophy className="w-3 h-3" />
                            {challenge.points_reward}
                          </span>
                          <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <FileText className="w-3 h-3" />
                            {challenge.challenge_days?.[0]?.count || 0}
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions - Desktop */}
                      <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                        {challenge.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(challenge)}
                            className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleFeatured(challenge)}
                          className={`p-2 rounded-lg ${
                            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                          title={challenge.is_featured ? 'Remove from featured' : 'Add to featured'}
                        >
                          {challenge.is_featured ? (
                            <StarOff className="w-5 h-5 text-temple-gold" />
                          ) : (
                            <Star className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleActive(challenge)}
                          className={`p-2 rounded-lg ${
                            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                          title={challenge.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {challenge.is_active ? (
                            <Eye className="w-5 h-5 text-green-500" />
                          ) : (
                            <EyeOff className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          )}
                        </button>
                        <Link
                          to={`/admin/challenges/${challenge.id}`}
                          className={`p-2 rounded-lg ${
                            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Edit className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        </Link>
                        <button
                          onClick={() => setShowDeleteModal(challenge)}
                          className={`p-2 rounded-lg ${
                            isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Actions - Mobile */}
                    <div className="flex sm:hidden items-center gap-1.5 pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}">
                      {challenge.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(challenge)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600"
                        >
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleFeatured(challenge)}
                        className={`p-2 rounded-lg ${
                          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                        title={challenge.is_featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        {challenge.is_featured ? (
                          <StarOff className="w-4 h-4 text-temple-gold" />
                        ) : (
                          <Star className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        )}
                      </button>
                      <button
                        onClick={() => handleToggleActive(challenge)}
                        className={`p-2 rounded-lg ${
                          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                        title={challenge.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {challenge.is_active ? (
                          <Eye className="w-4 h-4 text-green-500" />
                        ) : (
                          <EyeOff className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        )}
                      </button>
                      <Link
                        to={`/admin/challenges/${challenge.id}`}
                        className={`p-2 rounded-lg ${
                          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        <Edit className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      </Link>
                      <button
                        onClick={() => setShowDeleteModal(challenge)}
                        className={`p-2 rounded-lg ${
                          isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-50'
                        }`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Empty State */}
        {filteredChallenges.length === 0 && (
          <div className={`text-center py-8 sm:py-12 rounded-xl sm:rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
            <Trophy className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <h3 className={`text-base sm:text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No challenges found
            </h3>
            <p className={`text-xs sm:text-sm mb-4 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first challenge to get started'}
            </p>
            <Link
              to="/admin/challenges/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg sm:rounded-xl bg-temple-purple text-white text-sm font-medium"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Create Challenge
            </Link>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-base sm:text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Delete Challenge?
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete "{showDeleteModal.title}"? This will also delete all daily content and cannot be undone.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className={`flex-1 py-2 rounded-lg sm:rounded-xl text-sm font-medium ${
                  isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal.id)}
                className="flex-1 py-2 rounded-lg sm:rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminChallenges