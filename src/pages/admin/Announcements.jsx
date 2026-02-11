import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Megaphone, Plus, Edit2, Trash2, Save, X, Eye, EyeOff } from 'lucide-react'
import { useConfirm } from '../../components/ConfirmModal'

const TYPE_OPTIONS = [
  { value: 'general', label: 'General', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'update', label: 'Update', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'event', label: 'Event', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'tip', label: 'Tip', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
]

export const AdminAnnouncements = () => {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | 'new' | announcement.id
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const confirm = useConfirm()

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setAnnouncements(data)
    if (error) toast.error('Failed to load announcements')
    setLoading(false)
  }

  const startNew = () => {
    setForm({
      title: '',
      content: '',
      type: 'general',
      priority: 0,
      is_active: true,
      expires_at: ''
    })
    setEditing('new')
  }

  const startEdit = (item) => {
    setForm({
      title: item.title || '',
      content: item.content || '',
      type: item.type || 'general',
      priority: item.priority || 0,
      is_active: item.is_active ?? true,
      expires_at: item.expires_at ? item.expires_at.slice(0, 16) : ''
    })
    setEditing(item.id)
  }

  const handleSave = async () => {
    if (!form.title || !form.content) {
      toast.error('Title and content are required')
      return
    }
    setSaving(true)

    const payload = {
      title: form.title,
      content: form.content,
      type: form.type,
      priority: parseInt(form.priority) || 0,
      is_active: form.is_active,
      expires_at: form.expires_at || null,
    }

    try {
      if (editing === 'new') {
        const { error } = await supabase
          .from('announcements')
          .insert([{ ...payload, created_by: user?.id }])
        if (error) throw error
        toast.success('Announcement created!')
      } else {
        const { error } = await supabase
          .from('announcements')
          .update(payload)
          .eq('id', editing)
        if (error) throw error
        toast.success('Announcement updated!')
      }
      setEditing(null)
      loadAnnouncements()
    } catch (err) {
      toast.error('Failed to save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    const yes = await confirm({
      title: 'Delete Announcement',
      message: `Delete "${item.title}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (!yes) return

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', item.id)

    if (error) {
      toast.error('Failed to delete')
    } else {
      toast.success('Announcement deleted')
      loadAnnouncements()
    }
  }

  const toggleActive = async (item) => {
    const { error } = await supabase
      .from('announcements')
      .update({ is_active: !item.is_active })
      .eq('id', item.id)

    if (!error) {
      setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, is_active: !a.is_active } : a))
    }
  }

  const getTypeStyle = (type) => {
    return TYPE_OPTIONS.find(t => t.value === type) || TYPE_OPTIONS[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
            Announcements
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {announcements.length} announcement{announcements.length !== 1 ? 's' : ''} · Shown on the Today page
          </p>
        </div>
        <button onClick={startNew} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Editor */}
      {editing && (
        <div className="glass-card p-6 border-2 border-temple-purple dark:border-temple-gold">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editing === 'new' ? 'Create Announcement' : 'Edit Announcement'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="form-label">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="form-input w-full"
                placeholder="e.g. New Feature Available!"
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="form-input w-full h-24 resize-none"
                placeholder="The announcement message..."
              />
            </div>

            <div>
              <label className="form-label">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="form-input w-full"
              >
                {TYPE_OPTIONS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Priority</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="form-input w-full"
                placeholder="0 = normal, higher = shown first"
              />
            </div>

            <div>
              <label className="form-label">Expires At (optional)</label>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="form-input w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-temple-purple focus:ring-temple-purple"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">Active (visible to users)</label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Announcement'}
            </button>
            <button
              onClick={() => setEditing(null)}
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Announcement list */}
      <div className="space-y-3">
        {announcements.map(item => {
          const typeStyle = getTypeStyle(item.type)
          return (
            <div
              key={item.id}
              className={`glass-card p-5 transition-all ${!item.is_active ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeStyle.color}`}>
                      {typeStyle.label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {item.priority > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Priority: {item.priority}
                      </span>
                    )}
                    {item.expires_at && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Expires: {new Date(item.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{item.content}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(item)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    title={item.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => startEdit(item)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {announcements.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No announcements yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first announcement to keep your community informed
            </p>
            <button onClick={startNew} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Create Announcement</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
