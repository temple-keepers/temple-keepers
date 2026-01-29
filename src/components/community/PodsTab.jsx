import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { 
  getPublicPods, 
  getMyPods, 
  createPod, 
  joinPod,
  joinPodByCode 
} from '../../lib/community'
import {
  Users,
  Plus,
  X,
  Search,
  Lock,
  Globe,
  ChevronRight,
  UserPlus,
  Crown,
  Flame,
  Target,
  Droplets,
  Sparkles,
  Dumbbell,
  Brain,
  Check,
  Camera,
  Upload,
  Loader2
} from 'lucide-react'

const PodsTab = ({ user, isDark, toast, isAdmin = false }) => {
  const navigate = useNavigate()
  const [publicPods, setPublicPods] = useState([])
  const [myPods, setMyPods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [viewMode, setViewMode] = useState('mine')

  useEffect(() => {
    loadPods()
  }, [])

  const loadPods = async () => {
    setLoading(true)
    const [publicData, myData] = await Promise.all([
      getPublicPods(),
      getMyPods(user.id)
    ])
    setPublicPods(publicData)
    setMyPods(myData)
    setLoading(false)
  }

  const handleJoin = async (podId) => {
    try {
      await joinPod(podId, user.id)
      toast.success('Joined pod! 🎉')
      loadPods()
    } catch (error) {
      toast.error(error.message || 'Failed to join pod')
    }
  }

  const focusIcons = {
    general: Users,
    fasting: Flame,
    weight_loss: Target,
    prayer: Sparkles,
    fitness: Dumbbell,
    nutrition: Brain
  }

  const focusLabels = {
    general: 'General',
    fasting: 'Fasting',
    weight_loss: 'Weight Loss',
    prayer: 'Prayer',
    fitness: 'Fitness',
    nutrition: 'Nutrition'
  }

  const displayPods = viewMode === 'mine' ? myPods : publicPods

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
          <button
            onClick={() => setViewMode('mine')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              viewMode === 'mine'
                ? 'bg-temple-purple text-white'
                : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}
          >
            My Pods ({myPods.length})
          </button>
          <button
            onClick={() => setViewMode('discover')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              viewMode === 'discover'
                ? 'bg-temple-purple text-white'
                : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Discover
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowJoinModal(true)}
            className={`p-2 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
            title="Join with code"
          >
            <UserPlus className="w-5 h-5" />
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 rounded-xl bg-temple-purple text-white"
              title="Create Pod (Admin only)"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Pods List */}
      {displayPods.length === 0 ? (
        <div className={`text-center py-12 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <Users className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {viewMode === 'mine' ? 'No pods yet' : 'No public pods available'}
          </h3>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {viewMode === 'mine' 
              ? 'Join a pod to connect with others!'
              : 'No public pods available yet'}
          </p>
          {isAdmin ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-temple-purple text-white text-sm"
            >
              Create Pod
            </button>
          ) : (
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 rounded-xl bg-temple-purple text-white text-sm"
            >
              Join with Code
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayPods.map((pod) => {
            const Icon = focusIcons[pod.focus] || Users
            const memberCount = pod.members?.[0]?.count || pod.members?.length || 0
            const isMember = myPods.some(p => p.id === pod.id)

            return (
              <div
                key={pod.id}
                className={`rounded-2xl p-5 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <Icon className="w-7 h-7 text-temple-purple" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {pod.name}
                      </h3>
                      {pod.is_private ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Globe className="w-4 h-4 text-gray-400" />
                      )}
                      {pod.my_role === 'admin' && (
                        <Crown className="w-4 h-4 text-temple-gold" />
                      )}
                    </div>
                    {pod.description && (
                      <p className={`text-sm mb-2 line-clamp-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {pod.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Users className="w-3 h-3 inline mr-1" />
                        {memberCount}/{pod.max_members} members
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {focusLabels[pod.focus]}
                      </span>
                    </div>
                  </div>
                  {isMember ? (
                    <Link
                      to={`/community/pods/${pod.id}`}
                      className="p-2 rounded-xl bg-temple-purple text-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleJoin(pod.id)}
                      disabled={memberCount >= pod.max_members}
                      className={`px-4 py-2 rounded-xl text-sm font-medium ${
                        memberCount >= pod.max_members
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-temple-purple text-white'
                      }`}
                    >
                      {memberCount >= pod.max_members ? 'Full' : 'Join'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Pod Modal */}
      {showCreateModal && (
        <CreatePodModal
          user={user}
          isDark={isDark}
          toast={toast}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            loadPods()
          }}
        />
      )}

      {/* Join by Code Modal */}
      {showJoinModal && (
        <JoinPodModal
          user={user}
          isDark={isDark}
          toast={toast}
          onClose={() => setShowJoinModal(false)}
          onJoined={() => {
            setShowJoinModal(false)
            loadPods()
          }}
        />
      )}
    </div>
  )
}

// Create Pod Modal
const CreatePodModal = ({ user, isDark, toast, onClose, onCreated }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [focus, setFocus] = useState('general')
  const [isPrivate, setIsPrivate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  const focuses = [
    { id: 'general', label: 'General' },
    { id: 'fasting', label: 'Fasting' },
    { id: 'weight_loss', label: 'Weight Loss' },
    { id: 'prayer', label: 'Prayer' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'nutrition', label: 'Nutrition' }
  ]

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `pods/${fileName}`

      const { data, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      setImageUrl(publicUrl)
      toast.success('Image uploaded!')
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a pod name')
      return
    }
    setCreating(true)
    try {
      console.log('🟢 Starting pod creation from frontend')
      const podId = await createPod(user.id, name, description, focus, isPrivate, imageUrl)
      toast.success('Pod created! 🎉')
      onCreated()
    } catch (error) {
      console.error('🔴 Pod creation failed in frontend:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        full: error
      })
      toast.error(error.message || 'Failed to create pod')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Create Accountability Pod
          </h3>
          <button onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pod Image Upload */}
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Pod Image (optional)
          </label>
          <div className="flex items-center gap-4">
            {imageUrl && (
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-temple-purple to-temple-gold p-0.5">
                <img src={imageUrl} alt="Pod" className="w-full h-full object-cover rounded-xl" />
              </div>
            )}
            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-colors ${
              isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}>
              {uploadingImage ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="w-4 h-4" /> {imageUrl ? 'Change Image' : 'Upload Image'}</>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden" 
              />
            </label>
          </div>
        </div>

        {/* Name */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Pod name..."
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
          placeholder="What's this pod about? (optional)"
          rows={2}
          className={`w-full px-4 py-3 rounded-xl border resize-none mb-4 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-gray-50 border-gray-200 text-gray-900'
          } focus:outline-none`}
        />

        {/* Focus */}
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Focus Area
          </label>
          <div className="flex flex-wrap gap-2">
            {focuses.map((f) => (
              <button
                key={f.id}
                onClick={() => setFocus(f.id)}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  focus === f.id
                    ? 'bg-temple-purple text-white'
                    : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Private Toggle */}
        <label className={`flex items-center gap-3 mb-4 cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm">Private pod (invite only)</span>
        </label>

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
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Pod'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Join Pod by Code Modal
const JoinPodModal = ({ user, isDark, toast, onClose, onJoined }) => {
  const [code, setCode] = useState('')
  const [joining, setJoining] = useState(false)

  const handleJoin = async () => {
    if (!code.trim()) {
      toast.error('Please enter an invite code')
      return
    }
    setJoining(true)
    try {
      await joinPodByCode(code, user.id)
      toast.success('Joined pod! 🎉')
      onJoined()
    } catch (error) {
      toast.error(error.message || 'Invalid invite code')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-sm rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Join Pod with Code
        </h3>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter invite code..."
          maxLength={6}
          className={`w-full px-4 py-3 rounded-xl border text-center text-lg font-mono tracking-widest mb-4 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-gray-50 border-gray-200 text-gray-900'
          } focus:outline-none`}
        />
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
            onClick={handleJoin}
            disabled={joining || code.length < 6}
            className="flex-1 py-3 rounded-xl bg-temple-purple text-white font-medium disabled:opacity-50"
          >
            {joining ? 'Joining...' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PodsTab