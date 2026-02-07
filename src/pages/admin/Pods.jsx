import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useConfirm } from '../../components/ConfirmModal'
import toast from 'react-hot-toast'
import {
  Users, Plus, Edit2, Trash2, Save, X, Lock, Globe,
  MessageSquare, UserMinus, Search
} from 'lucide-react'

export const AdminPods = () => {
  const confirm = useConfirm()
  const [pods, setPods] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingPod, setEditingPod] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', is_private: false })
  const [expandedPod, setExpandedPod] = useState(null)
  const [podMembers, setPodMembers] = useState({})
  const [podPostCounts, setPodPostCounts] = useState({})
  const [creating, setCreating] = useState(false)
  const [newPod, setNewPod] = useState({ name: '', description: '', is_private: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPods()
  }, [])

  const loadPods = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('pods')
      .select('*, profiles!pods_created_by_fkey(first_name, email)')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPods(data)
      // Load member counts and post counts
      const podIds = data.map(p => p.id)
      if (podIds.length > 0) {
        const [membersResult, postsResult] = await Promise.all([
          supabase.from('pod_members').select('pod_id').in('pod_id', podIds),
          supabase.from('pod_posts').select('pod_id').in('pod_id', podIds)
        ])

        const memberCounts = {}
        const postCounts = {}
        membersResult.data?.forEach(m => {
          memberCounts[m.pod_id] = (memberCounts[m.pod_id] || 0) + 1
        })
        postsResult.data?.forEach(p => {
          postCounts[p.pod_id] = (postCounts[p.pod_id] || 0) + 1
        })
        setPodPostCounts(postCounts)
        setPodMembers(prev => {
          const counts = {}
          podIds.forEach(id => { counts[id] = { count: memberCounts[id] || 0 } })
          return { ...prev, ...counts }
        })
      }
    }
    setLoading(false)
  }

  const loadPodMembers = async (podId) => {
    const { data } = await supabase
      .from('pod_members')
      .select('id, user_id, role, joined_at, profiles(first_name, email)')
      .eq('pod_id', podId)
      .order('joined_at', { ascending: true })

    setPodMembers(prev => ({
      ...prev,
      [podId]: { ...prev[podId], members: data || [] }
    }))
  }

  const handleExpand = async (podId) => {
    if (expandedPod === podId) {
      setExpandedPod(null)
      return
    }
    setExpandedPod(podId)
    await loadPodMembers(podId)
  }

  const handleEdit = (pod) => {
    setEditingPod(pod.id)
    setEditForm({
      name: pod.name,
      description: pod.description || '',
      is_private: pod.is_private || false
    })
  }

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      toast.error('Pod name is required')
      return
    }
    setSaving(true)
    const { error } = await supabase
      .from('pods')
      .update({
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        is_private: editForm.is_private
      })
      .eq('id', editingPod)

    if (!error) {
      toast.success('Pod updated')
      setEditingPod(null)
      loadPods()
    } else {
      toast.error('Failed to update pod')
    }
    setSaving(false)
  }

  const handleDelete = async (pod) => {
    const ok = await confirm({
      title: 'Delete Pod',
      message: `Are you sure you want to delete "${pod.name}"? This will remove all members and posts. This cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger'
    })

    if (!ok) return

    // Delete posts, members, then pod
    await supabase.from('pod_posts').delete().eq('pod_id', pod.id)
    await supabase.from('pod_members').delete().eq('pod_id', pod.id)
    const { error } = await supabase.from('pods').delete().eq('id', pod.id)

    if (!error) {
      toast.success('Pod deleted')
      loadPods()
    } else {
      toast.error('Failed to delete pod: ' + error.message)
    }
  }

  const handleRemoveMember = async (podId, memberId, memberName) => {
    const ok = await confirm({
      title: 'Remove Member',
      message: `Remove ${memberName} from this pod?`,
      confirmText: 'Remove',
      variant: 'danger'
    })

    if (!ok) return

    const { error } = await supabase
      .from('pod_members')
      .delete()
      .eq('id', memberId)

    if (!error) {
      toast.success('Member removed')
      loadPodMembers(podId)
      loadPods()
    } else {
      toast.error('Failed to remove member')
    }
  }

  const handleCreatePod = async () => {
    if (!newPod.name.trim()) {
      toast.error('Pod name is required')
      return
    }
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('pods')
      .insert({
        name: newPod.name.trim(),
        description: newPod.description.trim(),
        is_private: newPod.is_private,
        created_by: user.id
      })

    if (!error) {
      toast.success('Pod created')
      setCreating(false)
      setNewPod({ name: '', description: '', is_private: false })
      loadPods()
    } else {
      toast.error('Failed to create pod: ' + error.message)
    }
    setSaving(false)
  }

  const filteredPods = pods.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
            Community Pods
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage community pods, members, and posts
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          New Pod
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Pods</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{pods.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Members</p>
          <p className="text-2xl font-bold text-temple-purple dark:text-temple-gold">
            {Object.values(podMembers).reduce((sum, p) => sum + (p.count || 0), 0)}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Posts</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Object.values(podPostCounts).reduce((sum, c) => sum + c, 0)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pods..."
            className="form-input pl-10 w-full"
          />
        </div>
      </div>

      {/* Create New Pod Form */}
      {creating && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Pod</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={newPod.name}
                onChange={(e) => setNewPod({ ...newPod, name: e.target.value })}
                className="form-input w-full"
                placeholder="e.g., Prayer Warriors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={newPod.description}
                onChange={(e) => setNewPod({ ...newPod, description: e.target.value })}
                className="form-input w-full"
                rows={3}
                placeholder="What is this pod about?"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newPod.is_private}
                onChange={(e) => setNewPod({ ...newPod, is_private: e.target.checked })}
                className="rounded border-gray-300 text-temple-purple focus:ring-temple-purple"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Private (invite only)</span>
            </label>
            <div className="flex gap-2">
              <button onClick={handleCreatePod} disabled={saving} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Creating...' : 'Create Pod'}
              </button>
              <button
                onClick={() => { setCreating(false); setNewPod({ name: '', description: '', is_private: false }) }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pods List */}
      {loading ? (
        <div className="glass-card p-8 text-center">
          <div className="spinner mx-auto"></div>
        </div>
      ) : filteredPods.length === 0 ? (
        <div className="glass-card p-8 text-center text-gray-500 dark:text-gray-400">
          {search ? 'No pods match your search' : 'No pods created yet'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPods.map(pod => (
            <div key={pod.id} className="glass-card overflow-hidden">
              {/* Pod Header */}
              <div className="p-5">
                {editingPod === pod.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="form-input w-full text-lg font-semibold"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="form-input w-full"
                      rows={2}
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.is_private}
                        onChange={(e) => setEditForm({ ...editForm, is_private: e.target.checked })}
                        className="rounded border-gray-300 text-temple-purple focus:ring-temple-purple"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Private</span>
                    </label>
                    <div className="flex gap-2">
                      <button onClick={handleSaveEdit} disabled={saving} className="btn-primary text-sm flex items-center gap-1">
                        <Save className="w-3.5 h-3.5" />
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingPod(null)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {pod.name}
                        </h3>
                        {pod.is_private ? (
                          <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <Globe className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      {pod.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {pod.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {podMembers[pod.id]?.count || 0} members
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {podPostCounts[pod.id] || 0} posts
                        </span>
                        <span>
                          Created by {pod.profiles?.first_name || pod.profiles?.email || 'Unknown'}
                        </span>
                        <span>
                          {new Date(pod.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleExpand(pod.id)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="View members"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(pod)}
                        className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Edit pod"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pod)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete pod"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded Members */}
              {expandedPod === pod.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-5">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Members</h4>
                  {!podMembers[pod.id]?.members ? (
                    <div className="spinner mx-auto"></div>
                  ) : podMembers[pod.id].members.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No members yet</p>
                  ) : (
                    <div className="space-y-2">
                      {podMembers[pod.id].members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.profiles?.first_name || 'Unnamed'}
                              {member.role === 'admin' && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-temple-purple/10 text-temple-purple dark:bg-temple-gold/10 dark:text-temple-gold">
                                  admin
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {member.profiles?.email} · Joined {new Date(member.joined_at).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveMember(pod.id, member.id, member.profiles?.first_name || 'this member')}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Remove member"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
