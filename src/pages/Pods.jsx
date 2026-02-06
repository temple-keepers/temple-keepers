import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { podService } from '../features/pods/services/podService'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import { Plus, Users, Lock, Globe, Crown, X, ArrowRight } from 'lucide-react'

export const Pods = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [myPods, setMyPods] = useState([])
  const [allPods, setAllPods] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('my') // 'my' | 'discover'
  const [showCreate, setShowCreate] = useState(false)

  // Create form
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPrivate, setNewPrivate] = useState(false)
  const [newMax, setNewMax] = useState(8)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (user) loadPods()
  }, [user])

  const loadPods = async () => {
    setLoading(true)
    const [myRes, allRes] = await Promise.all([
      podService.getMyPods(user.id),
      podService.getPods(),
    ])
    setMyPods(myRes.data || [])
    setAllPods(allRes.data || [])
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!newName.trim()) return toast.error('Please enter a pod name')
    setCreating(true)
    const { data, error } = await podService.createPod(user.id, {
      name: newName.trim(),
      description: newDesc.trim(),
      isPrivate: newPrivate,
      maxMembers: newMax,
    })
    if (!error && data) {
      toast.success('Pod created! 🙏')
      setShowCreate(false)
      setNewName('')
      setNewDesc('')
      navigate(`/pods/${data.id}`)
    } else {
      toast.error('Failed to create pod')
    }
    setCreating(false)
  }

  const handleJoin = async (podId) => {
    const { error } = await podService.joinPod(podId, user.id)
    if (!error) {
      toast.success('Welcome to the pod! 🎉')
      navigate(`/pods/${podId}`)
    } else {
      toast.error(error?.message || 'Failed to join')
    }
  }

  const myPodIds = new Set(myPods.map(p => p.id))
  const discoverPods = allPods.filter(p => !myPodIds.has(p.id))

  const getMemberCount = (pod) => {
    if (pod.pod_members?.[0]?.count !== undefined) return pod.pod_members[0].count
    if (Array.isArray(pod.pod_members)) return pod.pod_members.length
    return 0
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
      <AppHeader title="Community Pods" />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Small groups for accountability, prayer, and encouragement
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Pod
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('my')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'my'
                ? 'bg-temple-purple dark:bg-temple-gold text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            My Pods ({myPods.length})
          </button>
          <button
            onClick={() => setTab('discover')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'discover'
                ? 'bg-temple-purple dark:bg-temple-gold text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Discover ({discoverPods.length})
          </button>
        </div>

        {/* Pod List */}
        {tab === 'my' && myPods.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Pods Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create a pod or join one to start your accountability journey
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                <Plus className="w-5 h-5 inline mr-2" />Create a Pod
              </button>
              <button onClick={() => setTab('discover')} className="btn-secondary">
                Discover Pods
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {(tab === 'my' ? myPods : discoverPods).map(pod => {
            const memberCount = getMemberCount(pod)
            const isMine = myPodIds.has(pod.id)

            return (
              <div
                key={pod.id}
                className="glass-card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => isMine ? navigate(`/pods/${pod.id}`) : null}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {pod.name}
                      </h3>
                      {pod.is_private ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Globe className="w-4 h-4 text-gray-400" />
                      )}
                      {pod.myRole === 'leader' && (
                        <Crown className="w-4 h-4 text-temple-gold" />
                      )}
                    </div>
                    {pod.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {pod.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {memberCount}/{pod.max_members} members
                      </span>
                      <span>
                        {pod.is_private ? 'Private' : 'Public'} pod
                      </span>
                    </div>
                  </div>

                  {isMine ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/pods/${pod.id}`) }}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-temple-purple/10 dark:bg-temple-gold/10 text-temple-purple dark:text-temple-gold font-medium text-sm"
                    >
                      Open <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleJoin(pod.id) }}
                      disabled={memberCount >= pod.max_members}
                      className="btn-primary text-sm"
                    >
                      {memberCount >= pod.max_members ? 'Full' : 'Join'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
    <BottomNav />

    {/* Create Pod Modal */}
    {showCreate && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create a Pod</h3>
            <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pod Name *</label>
              <input
                type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Faith & Fitness Warriors" className="form-input" autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What is this pod about?" className="form-input" rows={3}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Members</label>
                <select value={newMax} onChange={(e) => setNewMax(Number(e.target.value))} className="form-input">
                  {[4, 6, 8, 10, 12, 15, 20].map(n => (
                    <option key={n} value={n}>{n} members</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visibility</label>
                <button
                  onClick={() => setNewPrivate(!newPrivate)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    newPrivate
                      ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                      : 'border-green-300 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  }`}
                >
                  {newPrivate ? <><Lock className="w-4 h-4" /> Private</> : <><Globe className="w-4 h-4" /> Public</>}
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleCreate} disabled={creating} className="btn-primary w-full">
              {creating ? 'Creating...' : 'Create Pod'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
