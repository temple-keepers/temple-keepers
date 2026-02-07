import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Calendar, Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react'
import { useConfirm } from '../../components/ConfirmModal'

const FOCUS_OPTIONS = [
  'foundation', 'perseverance', 'nutrition', 'rest', 'movement',
  'gratitude', 'community', 'healing', 'discipline', 'energy', 'peace', 'patience',
  'prayer', 'fasting', 'worship', 'faith', 'joy', 'hope', 'love', 'forgiveness'
]

const ICON_OPTIONS = [
  'Heart', 'Church', 'Mountain', 'Apple', 'Moon', 'Footprints',
  'Users', 'Sparkles', 'Shield', 'Zap', 'Leaf', 'Clock'
]

export const AdminThemes = () => {
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // theme id or 'new'
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const confirm = useConfirm()

  useEffect(() => {
    loadThemes()
  }, [])

  const loadThemes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('weekly_themes')
      .select('*')
      .order('week_start', { ascending: false })

    if (data) setThemes(data)
    if (error) toast.error('Failed to load themes')
    setLoading(false)
  }

  const startNew = () => {
    // Default to next Monday
    const next = new Date()
    next.setDate(next.getDate() + ((1 + 7 - next.getDay()) % 7 || 7))
    const start = next.toISOString().slice(0, 10)
    const end = new Date(next.getTime() + 6 * 86400000).toISOString().slice(0, 10)

    setForm({
      title: '',
      scripture: '',
      scripture_reference: '',
      focus_area: 'foundation',
      icon: 'Heart',
      week_start: start,
      week_end: end,
      wellness_tip: '',
      daily_action: '',
      is_active: true
    })
    setEditing('new')
  }

  const startEdit = (theme) => {
    setForm({
      title: theme.title || '',
      scripture: theme.scripture || '',
      scripture_reference: theme.scripture_reference || '',
      focus_area: theme.focus_area || '',
      icon: theme.icon || 'Heart',
      week_start: theme.week_start || '',
      week_end: theme.week_end || '',
      wellness_tip: theme.wellness_tip || '',
      daily_action: theme.daily_action || '',
      is_active: theme.is_active ?? true
    })
    setEditing(theme.id)
  }

  const handleSave = async () => {
    if (!form.title || !form.week_start || !form.week_end) {
      toast.error('Title and dates are required')
      return
    }
    setSaving(true)

    try {
      if (editing === 'new') {
        const { error } = await supabase
          .from('weekly_themes')
          .insert([form])
        if (error) throw error
        toast.success('Theme created!')
      } else {
        const { error } = await supabase
          .from('weekly_themes')
          .update(form)
          .eq('id', editing)
        if (error) throw error
        toast.success('Theme updated!')
      }
      setEditing(null)
      loadThemes()
    } catch (err) {
      toast.error('Failed to save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (theme) => {
    const yes = await confirm({
      title: 'Delete Theme',
      message: `Delete "${theme.title}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (!yes) return

    const { error } = await supabase
      .from('weekly_themes')
      .delete()
      .eq('id', theme.id)

    if (error) {
      toast.error('Failed to delete')
    } else {
      toast.success('Theme deleted')
      loadThemes()
    }
  }

  const toggleActive = async (theme) => {
    const { error } = await supabase
      .from('weekly_themes')
      .update({ is_active: !theme.is_active })
      .eq('id', theme.id)

    if (!error) {
      setThemes(prev => prev.map(t => t.id === theme.id ? { ...t, is_active: !t.is_active } : t))
    }
  }

  const isCurrentWeek = (theme) => {
    const today = new Date().toISOString().slice(0, 10)
    return theme.week_start <= today && theme.week_end >= today
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
            Weekly Themes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {themes.length} themes · Shown on the Today page each week
          </p>
        </div>
        <button onClick={startNew} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>New Theme</span>
        </button>
      </div>

      {/* Editor */}
      {editing && (
        <div className="glass-card p-6 border-2 border-temple-purple dark:border-temple-gold">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editing === 'new' ? 'Create Theme' : 'Edit Theme'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="form-label">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="form-input w-full"
                placeholder="e.g. Preparing the Temple"
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Scripture</label>
              <textarea
                value={form.scripture}
                onChange={(e) => setForm({ ...form, scripture: e.target.value })}
                className="form-input w-full h-20 resize-none"
                placeholder="The full scripture text..."
              />
            </div>

            <div>
              <label className="form-label">Scripture Reference</label>
              <input
                type="text"
                value={form.scripture_reference}
                onChange={(e) => setForm({ ...form, scripture_reference: e.target.value })}
                className="form-input w-full"
                placeholder="e.g. 1 Corinthians 6:19 (KJV)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Focus Area</label>
                <select
                  value={form.focus_area}
                  onChange={(e) => setForm({ ...form, focus_area: e.target.value })}
                  className="form-input w-full"
                >
                  {FOCUS_OPTIONS.map(f => (
                    <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Icon</label>
                <select
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="form-input w-full"
                >
                  {ICON_OPTIONS.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Week Start</label>
              <input
                type="date"
                value={form.week_start}
                onChange={(e) => setForm({ ...form, week_start: e.target.value })}
                className="form-input w-full"
              />
            </div>

            <div>
              <label className="form-label">Week End</label>
              <input
                type="date"
                value={form.week_end}
                onChange={(e) => setForm({ ...form, week_end: e.target.value })}
                className="form-input w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Wellness Tip</label>
              <textarea
                value={form.wellness_tip}
                onChange={(e) => setForm({ ...form, wellness_tip: e.target.value })}
                className="form-input w-full h-16 resize-none"
                placeholder="A practical wellness insight for the week..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Daily Action</label>
              <textarea
                value={form.daily_action}
                onChange={(e) => setForm({ ...form, daily_action: e.target.value })}
                className="form-input w-full h-16 resize-none"
                placeholder="One small action users can take each day this week..."
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
              {saving ? 'Saving...' : 'Save Theme'}
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

      {/* Theme list */}
      <div className="space-y-3">
        {themes.map(theme => (
          <div
            key={theme.id}
            className={`glass-card p-5 transition-all ${
              isCurrentWeek(theme) ? 'border-2 border-temple-purple dark:border-temple-gold' : ''
            } ${!theme.is_active ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {isCurrentWeek(theme) && (
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-temple-purple/10 dark:bg-temple-gold/10 text-temple-purple dark:text-temple-gold">
                      This Week
                    </span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(theme.week_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {new Date(theme.week_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {theme.focus_area && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">
                      {theme.focus_area}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{theme.title}</h3>
                {theme.scripture_reference && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{theme.scripture_reference}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(theme)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  title={theme.is_active ? 'Deactivate' : 'Activate'}
                >
                  {theme.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => startEdit(theme)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(theme)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {themes.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No themes yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first weekly theme to inspire your community
            </p>
            <button onClick={startNew} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Create Theme</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
