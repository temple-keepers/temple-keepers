import { useState, useEffect } from 'react'
import { 
  getPrayerRequests, 
  getMyPrayerRequests,
  createPrayerRequest, 
  prayForRequest, 
  checkUserPrayed,
  markPrayerAnswered,
  deletePrayerRequest
} from '../../lib/community'
import {
  HandHeart,
  Plus,
  X,
  Check,
  Trash2,
  User,
  Heart,
  Sparkles,
  Filter,
  Clock,
  CheckCircle
} from 'lucide-react'

const PrayerWallTab = ({ user, isDark, toast }) => {
  const [prayers, setPrayers] = useState([])
  const [myPrayers, setMyPrayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewMode, setViewMode] = useState('all') // all, mine, answered
  const [prayedFor, setPrayedFor] = useState({})
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    loadPrayers()
  }, [selectedCategory])

  const loadPrayers = async () => {
    setLoading(true)
    const [allPrayers, mine] = await Promise.all([
      getPrayerRequests(50, 0, selectedCategory),
      getMyPrayerRequests(user.id)
    ])
    setPrayers(allPrayers)
    setMyPrayers(mine)

    // Check which prayers user has prayed for
    const prayed = {}
    for (const prayer of allPrayers) {
      prayed[prayer.id] = await checkUserPrayed(prayer.id, user.id)
    }
    setPrayedFor(prayed)
    setLoading(false)
  }

  const handlePray = async (prayerId) => {
    try {
      const result = await prayForRequest(prayerId, user.id)
      if (result) {
        setPrayedFor(prev => ({ ...prev, [prayerId]: true }))
        toast.success('🙏 Prayed!')
        loadPrayers()
      } else {
        toast.info('You\'ve already prayed for this request')
      }
    } catch (error) {
      toast.error('Failed to record prayer')
    }
  }

  const handleMarkAnswered = async (prayerId) => {
    try {
      await markPrayerAnswered(prayerId)
      toast.success('Praise God! 🙌')
      loadPrayers()
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (prayerId) => {
    if (!confirm('Delete this prayer request?')) return
    try {
      await deletePrayerRequest(prayerId)
      toast.success('Deleted')
      loadPrayers()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const categories = [
    { id: null, label: 'All' },
    { id: 'health', label: '🏥 Health' },
    { id: 'family', label: '👨‍👩‍👧‍👦 Family' },
    { id: 'work', label: '💼 Work' },
    { id: 'spiritual', label: '✝️ Spiritual' },
    { id: 'relationships', label: '💑 Relationships' },
    { id: 'finances', label: '💰 Finances' },
    { id: 'other', label: '📝 Other' }
  ]

  const displayPrayers = viewMode === 'mine' 
    ? myPrayers 
    : viewMode === 'answered'
      ? prayers.filter(p => p.is_answered)
      : prayers.filter(p => !p.is_answered)

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffDays < 1) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'mine', 'answered'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === mode
                  ? 'bg-temple-purple text-white'
                  : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {mode === 'all' ? 'All Requests' : mode === 'mine' ? 'My Prayers' : 'Answered'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-2 rounded-xl bg-temple-purple text-white"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id || 'all'}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-temple-gold/20 text-temple-gold border border-temple-gold/30'
                : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Prayer List */}
      {displayPrayers.length === 0 ? (
        <div className={`text-center py-12 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <HandHeart className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {viewMode === 'mine' ? 'No prayer requests yet' : 'No prayers in this category'}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Share your prayer needs with the community
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayPrayers.map((prayer) => {
            const profile = prayer.user?.profiles
            const isOwner = prayer.user_id === user.id
            const hasPrayed = prayedFor[prayer.id]

            return (
              <div 
                key={prayer.id}
                className={`rounded-2xl p-5 ${
                  prayer.is_answered
                    ? isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'
                    : isDark ? 'bg-gray-800' : 'bg-white shadow-sm'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {prayer.is_anonymous ? 'Anonymous' : (profile?.full_name || 'Temple Keeper')}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatTime(prayer.created_at)}
                      </p>
                    </div>
                  </div>
                  {prayer.is_answered && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Answered
                    </span>
                  )}
                </div>

                {/* Content */}
                <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {prayer.title}
                </h4>
                {prayer.description && (
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {prayer.description}
                  </p>
                )}

                {/* Testimony */}
                {prayer.is_answered && prayer.answered_testimony && (
                  <div className={`p-3 rounded-xl mb-3 ${
                    isDark ? 'bg-green-500/10' : 'bg-green-50'
                  }`}>
                    <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      {prayer.answered_testimony}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {!prayer.is_answered && (
                      <button
                        onClick={() => handlePray(prayer.id)}
                        disabled={hasPrayed}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          hasPrayed
                            ? 'bg-temple-purple/20 text-temple-purple border border-temple-purple/30'
                            : 'bg-gradient-to-r from-temple-purple to-temple-gold text-white hover:opacity-90'
                        }`}
                      >
                        <HandHeart className={`w-5 h-5 ${hasPrayed ? '' : 'animate-pulse'}`} />
                        <span>{hasPrayed ? `Prayed (${prayer.prayers_count})` : `🙏 I Prayed (${prayer.prayers_count})`}</span>
                      </button>
                    )}
                  </div>
                  
                  {isOwner && (
                    <div className="flex items-center gap-2">
                      {!prayer.is_answered && (
                        <button
                          onClick={() => handleMarkAnswered(prayer.id)}
                          className="p-2 rounded-lg text-green-500 hover:bg-green-500/10"
                          title="Mark as answered"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(prayer.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Prayer Modal */}
      {showCreateModal && (
        <CreatePrayerModal
          user={user}
          isDark={isDark}
          toast={toast}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            loadPrayers()
          }}
        />
      )}
    </div>
  )
}

// Create Prayer Modal
const CreatePrayerModal = ({ user, isDark, toast, onClose, onCreated }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('other')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [posting, setPosting] = useState(false)

  const categories = [
    { id: 'health', label: 'Health' },
    { id: 'family', label: 'Family' },
    { id: 'work', label: 'Work' },
    { id: 'spiritual', label: 'Spiritual' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'finances', label: 'Finances' },
    { id: 'other', label: 'Other' }
  ]

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please add a title')
      return
    }
    setPosting(true)
    try {
      await createPrayerRequest(user.id, title, description, category, isAnonymous, isPrivate)
      toast.success('Prayer request shared 🙏')
      onCreated()
    } catch (error) {
      toast.error('Failed to create prayer request')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Share Prayer Request
          </h3>
          <button onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Prayer request title..."
          className={`w-full px-4 py-3 rounded-xl border mb-4 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-gray-50 border-gray-200 text-gray-900'
          } focus:outline-none`}
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Share more details (optional)..."
          rows={3}
          className={`w-full px-4 py-3 rounded-xl border resize-none mb-4 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-gray-50 border-gray-200 text-gray-900'
          } focus:outline-none`}
        />

        {/* Category */}
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  category === cat.id
                    ? 'bg-temple-purple text-white'
                    : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Post anonymously</span>
          </label>
          <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Keep private (only you can see)</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-medium ${
              isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={posting || !title.trim()}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium disabled:opacity-50"
          >
            {posting ? 'Sharing...' : 'Share Request'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrayerWallTab