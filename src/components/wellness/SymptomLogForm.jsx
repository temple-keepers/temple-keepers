import { useState } from 'react'
import { X, Clock, Calendar, Check, ChevronDown, ChevronUp } from 'lucide-react'

// Common symptoms with categories
const SYMPTOM_CATEGORIES = [
  {
    category: 'Head & Brain',
    emoji: '🧠',
    symptoms: ['Headache', 'Migraine', 'Dizziness', 'Brain fog', 'Lightheaded'],
  },
  {
    category: 'Digestive',
    emoji: '🫄',
    symptoms: ['Bloating', 'Nausea', 'Stomach pain', 'Acid reflux', 'Constipation', 'Diarrhoea', 'Gas', 'Cramps'],
  },
  {
    category: 'Energy & Sleep',
    emoji: '😴',
    symptoms: ['Fatigue', 'Insomnia', 'Drowsiness', 'Restlessness', 'Low energy'],
  },
  {
    category: 'Pain & Muscles',
    emoji: '💪',
    symptoms: ['Back pain', 'Joint pain', 'Muscle ache', 'Neck stiffness', 'Chest tightness'],
  },
  {
    category: 'Mood & Mental',
    emoji: '😔',
    symptoms: ['Anxiety', 'Irritability', 'Low mood', 'Stress', 'Difficulty concentrating'],
  },
  {
    category: 'Skin & Allergies',
    emoji: '🤧',
    symptoms: ['Rash', 'Itching', 'Hives', 'Sneezing', 'Congestion', 'Watery eyes'],
  },
  {
    category: 'Other',
    emoji: '🩺',
    symptoms: ['Cough', 'Sore throat', 'Fever', 'Chills', 'Shortness of breath', 'Heart palpitations'],
  },
]

// Body area options
const BODY_AREAS = [
  { label: 'Head', emoji: '🧠' },
  { label: 'Neck', emoji: '🦒' },
  { label: 'Chest', emoji: '🫁' },
  { label: 'Stomach', emoji: '🫄' },
  { label: 'Back', emoji: '🔙' },
  { label: 'Arms', emoji: '💪' },
  { label: 'Legs', emoji: '🦵' },
  { label: 'Joints', emoji: '🦴' },
  { label: 'Skin', emoji: '🖐️' },
  { label: 'Whole body', emoji: '🧍' },
]

// Common triggers
const COMMON_TRIGGERS = [
  'Certain food', 'Stress', 'Poor sleep', 'Dehydration', 'Exercise',
  'Weather change', 'Skipped meal', 'Alcohol', 'Caffeine', 'Screen time',
  'Sitting too long', 'Unknown',
]

// Common relief methods
const COMMON_RELIEF = [
  'Rest', 'Water', 'Prayer/meditation', 'Medication', 'Fresh air',
  'Stretching', 'Heat pad', 'Cold compress', 'Deep breathing', 'Food',
  'Walk', 'Sleep',
]

// Duration presets
const DURATION_PRESETS = [
  { label: '< 15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2+ hours', value: 120 },
  { label: 'All day', value: 480 },
  { label: 'Ongoing', value: 999 },
]

// Parse a stored symptom string back into an array
const parseSymptoms = (val) => {
  if (Array.isArray(val)) return val
  if (typeof val === 'string' && val) return val.split(', ').map(s => s.trim()).filter(Boolean)
  return []
}

export const SymptomLogForm = ({ existingSymptom, onSave, onClose, variant = 'modal', showClose = true }) => {
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toTimeString().slice(0, 5)
  const isModal = variant === 'modal'

  const [formData, setFormData] = useState({
    log_date: existingSymptom?.log_date || today,
    log_time: existingSymptom?.log_time || now,
    symptoms: parseSymptoms(existingSymptom?.symptom),
    severity: existingSymptom?.severity || 5,
    notes: existingSymptom?.notes || '',
    duration_minutes: existingSymptom?.duration_minutes || '',
    body_area: existingSymptom?.body_area || '',
    triggered_by: existingSymptom?.triggered_by || '',
    relieved_by: existingSymptom?.relieved_by || '',
    is_recurring: existingSymptom?.is_recurring || false,
    mood_impact: existingSymptom?.mood_impact || 5,
    interfered_with: existingSymptom?.interfered_with || '',
  })

  const [saving, setSaving] = useState(false)
  const [showSymptomPicker, setShowSymptomPicker] = useState(formData.symptoms.length === 0)
  const [customSymptom, setCustomSymptom] = useState('')
  const [showTriggers, setShowTriggers] = useState(false)
  const [showRelief, setShowRelief] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Toggle a symptom in the multi-select array
  const toggleSymptom = (symptom) => {
    setFormData(prev => {
      const current = prev.symptoms
      if (current.includes(symptom)) {
        return { ...prev, symptoms: current.filter(s => s !== symptom) }
      }
      return { ...prev, symptoms: [...current, symptom] }
    })
  }

  // Add a custom typed symptom
  const addCustomSymptom = () => {
    const trimmed = customSymptom.trim()
    if (trimmed && !formData.symptoms.includes(trimmed)) {
      setFormData(prev => ({ ...prev, symptoms: [...prev.symptoms, trimmed] }))
    }
    setCustomSymptom('')
  }

  // Remove a symptom chip
  const removeSymptom = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s !== symptom),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.symptoms.length === 0) return
    setSaving(true)
    try {
      // Join symptoms into comma-separated string for DB storage
      await onSave({
        ...formData,
        symptom: formData.symptoms.join(', '),
      })
    } finally {
      setSaving(false)
    }
  }

  // Severity labels and colours
  const getSeverityInfo = (val) => {
    if (val <= 2) return { label: 'Very mild', colour: 'text-green-600 dark:text-green-400' }
    if (val <= 4) return { label: 'Mild', colour: 'text-lime-600 dark:text-lime-400' }
    if (val <= 6) return { label: 'Moderate', colour: 'text-yellow-600 dark:text-yellow-400' }
    if (val <= 8) return { label: 'Severe', colour: 'text-orange-600 dark:text-orange-400' }
    return { label: 'Very severe', colour: 'text-red-600 dark:text-red-400' }
  }

  const severityInfo = getSeverityInfo(formData.severity)

  const wrapperClass = isModal
    ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
    : 'min-h-screen bg-gray-50 dark:bg-gray-900'

  const cardClass = isModal
    ? 'w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto'
    : 'max-w-2xl mx-auto px-4 py-8'

  const innerCardClass = isModal ? '' : 'glass-card overflow-hidden'

  return (
    <div className={wrapperClass}>
      <div className={cardClass}>
        <div className={innerCardClass}>
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-br from-red-500 to-orange-600 dark:from-red-600 dark:to-orange-700 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {existingSymptom ? 'Edit Symptom' : 'Log Symptoms'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Select one or more — track patterns and triggers
                </p>
              </div>
              {showClose && (
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* ─── Date and Time ──────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.log_date}
                  onChange={(e) => handleChange('log_date', e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.log_time}
                  onChange={(e) => handleChange('log_time', e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* ─── Symptom Multi-Select ──────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  What are you experiencing? *
                </label>
                <button
                  type="button"
                  onClick={() => setShowSymptomPicker(!showSymptomPicker)}
                  className="text-xs text-temple-purple dark:text-temple-gold font-medium flex items-center gap-1"
                >
                  {showSymptomPicker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showSymptomPicker ? 'Hide picker' : 'Browse symptoms'}
                </button>
              </div>

              {/* Selected chips */}
              {formData.symptoms.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.symptoms.map(s => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSymptom(s)}
                        className="hover:bg-red-200 dark:hover:bg-red-800 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Category picker */}
              {showSymptomPicker && (
                <div className="space-y-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                  {SYMPTOM_CATEGORIES.map(cat => (
                    <div key={cat.category}>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
                        {cat.emoji} {cat.category}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.symptoms.map(s => {
                          const selected = formData.symptoms.includes(s)
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => toggleSymptom(s)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                                selected
                                  ? 'bg-red-500 text-white'
                                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-600'
                              }`}
                            >
                              {selected && <Check className="w-3 h-3" />}
                              {s}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom symptom input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a custom symptom..."
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSymptom() } }}
                  className="flex-1 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addCustomSymptom}
                  disabled={!customSymptom.trim()}
                  className="px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>

              {formData.symptoms.length === 0 && (
                <p className="text-xs text-gray-400">Select from the picker above or type your own</p>
              )}
            </div>

            {/* ─── Body Area ─────────────────────────────────── */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Where do you feel it?</label>
              <div className="flex flex-wrap gap-2">
                {BODY_AREAS.map(area => (
                  <button
                    key={area.label}
                    type="button"
                    onClick={() => handleChange('body_area', formData.body_area === area.label ? '' : area.label)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      formData.body_area === area.label
                        ? 'bg-temple-purple dark:bg-temple-gold text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {area.emoji} {area.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Severity ──────────────────────────────────── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Severity</label>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${severityInfo.colour}`}>{severityInfo.label}</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{formData.severity}/10</span>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step="1"
                value={formData.severity}
                onChange={(e) => handleChange('severity', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
                <span>Barely there</span>
                <span>Moderate</span>
                <span>Unbearable</span>
              </div>
            </div>

            {/* ─── Duration ──────────────────────────────────── */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">How long has it lasted?</label>
              <div className="flex flex-wrap gap-2">
                {DURATION_PRESETS.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => handleChange('duration_minutes', formData.duration_minutes === d.value ? '' : d.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      formData.duration_minutes === d.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Triggers ──────────────────────────────────── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  What might have triggered it?
                </label>
                <button
                  type="button"
                  onClick={() => setShowTriggers(!showTriggers)}
                  className="text-xs text-temple-purple dark:text-temple-gold font-medium"
                >
                  {showTriggers ? 'Hide' : 'Show'} suggestions
                </button>
              </div>

              {showTriggers && (
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800">
                  {COMMON_TRIGGERS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleChange('triggered_by', formData.triggered_by === t ? '' : t)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        formData.triggered_by === t
                          ? 'bg-orange-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={formData.triggered_by}
                onChange={(e) => handleChange('triggered_by', e.target.value)}
                placeholder="E.g., Ate dairy, stressful meeting..."
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
              />
            </div>

            {/* ─── Relief ────────────────────────────────────── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  What helped (or didn't)?
                </label>
                <button
                  type="button"
                  onClick={() => setShowRelief(!showRelief)}
                  className="text-xs text-temple-purple dark:text-temple-gold font-medium"
                >
                  {showRelief ? 'Hide' : 'Show'} suggestions
                </button>
              </div>

              {showRelief && (
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                  {COMMON_RELIEF.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleChange('relieved_by', formData.relieved_by === r ? '' : r)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        formData.relieved_by === r
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={formData.relieved_by}
                onChange={(e) => handleChange('relieved_by', e.target.value)}
                placeholder="E.g., Paracetamol, rest, water..."
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
              />
            </div>

            {/* ─── Mood Impact ───────────────────────────────── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  How much is this affecting your mood?
                </label>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{formData.mood_impact}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={formData.mood_impact}
                onChange={(e) => handleChange('mood_impact', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-temple-purple dark:accent-temple-gold"
              />
              <div className="flex justify-between text-[10px] text-gray-400 px-1">
                <span>Not at all</span>
                <span>Somewhat</span>
                <span>Completely</span>
              </div>
            </div>

            {/* ─── Interfered with ───────────────────────────── */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Did it interfere with anything?</label>
              <div className="flex flex-wrap gap-2">
                {['Work', 'Sleep', 'Exercise', 'Eating', 'Social plans', 'Prayer time', 'Nothing'].map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleChange('interfered_with', formData.interfered_with === item ? '' : item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      formData.interfered_with === item
                        ? 'bg-temple-purple dark:bg-temple-gold text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Recurring toggle ──────────────────────────── */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Is this a recurring symptom?</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Have you experienced this before?</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('is_recurring', !formData.is_recurring)}
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                  formData.is_recurring ? 'bg-temple-purple dark:bg-temple-gold' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  formData.is_recurring ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* ─── Notes ─────────────────────────────────────── */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any other details — what were you doing when it started? How are you feeling now?"
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white resize-none"
              />
            </div>

            {/* ─── Actions ────────────────────────────────────── */}
            <div className="flex gap-3 pt-4">
              {showClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving || formData.symptoms.length === 0}
                className="flex-1 py-3 px-4 text-white bg-gradient-to-r from-red-500 to-orange-600 hover:opacity-90 disabled:opacity-50 rounded-xl font-medium transition-opacity shadow-lg flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="spinner w-4 h-4 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    {existingSymptom ? 'Update Symptoms' : `Save ${formData.symptoms.length > 1 ? formData.symptoms.length + ' Symptoms' : 'Symptom'}`}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
