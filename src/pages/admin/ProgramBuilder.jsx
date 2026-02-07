import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePrograms } from '../../hooks/usePrograms'
import { useProgramDays } from '../../hooks/useProgramDays'
import { ArrowLeft, Save, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

export const ProgramBuilder = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProgram, createProgram, updateProgram } = usePrograms()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    duration_days: 14,
    program_type: 'fasting',
    includes_fasting: false,
    fasting_types: [],
    is_published: false
  })

  useEffect(() => {
    if (id) {
      loadProgram()
    }
  }, [id])

  const loadProgram = async () => {
    setLoading(true)
    const { data, error } = await getProgram(id)
    
    if (!error && data) {
      setFormData(data)
    }
    
    setLoading(false)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug from title
    if (field === 'title' && !id) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const toggleFastingType = (type) => {
    setFormData(prev => ({
      ...prev,
      fasting_types: prev.fasting_types.includes(type)
        ? prev.fasting_types.filter(t => t !== type)
        : [...prev.fasting_types, type]
    }))
  }

  const handleSave = async (publish = false) => {
    if (!formData.title || !formData.slug) {
      toast.error('Title and slug are required')
      return
    }

    setSaving(true)

    const dataToSave = {
      ...formData,
      is_published: publish
    }

    if (id) {
      // Update existing
      const { data, error } = await updateProgram(id, dataToSave)
      
      if (!error) {
        navigate(`/admin/programs/${id}/days`)
      }
    } else {
      // Create new
      const { data, error } = await createProgram(dataToSave)
      
      if (!error && data) {
        // Navigate to day editor (days will be created there if needed)
        navigate(`/admin/programs/${data.id}/days`)
      }
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/programs')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
            {id ? 'Edit Program' : 'Create Program'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {id ? 'Update program details' : 'Set up a new wellness program'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        
        {/* Title */}
        <div>
          <label className="form-label">
            Program Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="14-Day Prayer & Fast"
            className="form-input"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label className="form-label">
            URL Slug *
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="14-day-prayer-fast"
            className="form-input"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Used in URL: /programs/{formData.slug}
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="form-label">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Clear space for God's presence through prayer and fasting..."
            className="form-input resize-none"
            rows={3}
          />
        </div>

        {/* Duration */}
        <div>
          <label className="form-label">
            Duration (Days) *
          </label>
          <input
            type="number"
            value={formData.duration_days}
            onChange={(e) => handleChange('duration_days', parseInt(e.target.value))}
            min="1"
            max="365"
            className="form-input"
            required
          />
        </div>

        {/* Program Type */}
        <div>
          <label className="form-label">
            Program Type *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['fasting', 'challenge', 'course'].map(type => (
              <button
                key={type}
                onClick={() => handleChange('program_type', type)}
                className={`
                  p-3 rounded-lg border-2 capitalize transition-all
                  ${formData.program_type === type
                    ? 'border-temple-purple bg-temple-purple/10 dark:border-temple-gold dark:bg-temple-gold/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-temple-purple/50'
                  }
                `}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Includes Fasting */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.includes_fasting}
              onChange={(e) => handleChange('includes_fasting', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-temple-purple focus:ring-temple-purple"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              This program includes fasting
            </span>
          </label>
        </div>

        {/* Fasting Types */}
        {formData.includes_fasting && (
          <div>
            <label className="form-label">
              Fasting Options (users choose one)
            </label>
            <div className="space-y-2">
              {['daylight', 'daniel', 'media'].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.fasting_types.includes(type)}
                    onChange={() => toggleFastingType(type)}
                    className="w-4 h-4 rounded border-gray-300 text-temple-purple focus:ring-temple-purple"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {type} Fast
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/admin/programs')}
          className="btn-secondary flex-1"
          disabled={saving}
        >
          Cancel
        </button>
        
        <button
          onClick={() => handleSave(false)}
          className="btn-secondary flex-1 flex items-center justify-center gap-2"
          disabled={saving}
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save as Draft'}</span>
        </button>
        
        <button
          onClick={() => handleSave(false)}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
          disabled={saving}
        >
          <BookOpen className="w-5 h-5" />
          <span>{id ? 'Save & Edit Days' : 'Create & Add Days'}</span>
        </button>
      </div>
    </div>
  )
}
