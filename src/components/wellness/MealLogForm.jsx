import { useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { estimateNutrition, lookupBarcode, uploadMealPhoto } from '../../lib/mealAI'
import { X, Camera, Sparkles, Search, Droplets, ChevronDown, ChevronUp, AlertCircle, Check } from 'lucide-react'
import toast from 'react-hot-toast'

// Portion size visual guide data
const PORTION_GUIDE = [
  { label: 'Palm', desc: 'Size of your palm', icon: '🤚', example: 'Protein (chicken, fish)', grams: '~85g' },
  { label: 'Fist', desc: 'Size of your fist', icon: '✊', example: 'Carbs (rice, pasta)', grams: '~150g' },
  { label: 'Cupped hand', desc: 'One cupped hand', icon: '🫲', example: 'Fruit, nuts, grains', grams: '~40g' },
  { label: 'Thumb', desc: 'Tip of your thumb', icon: '👍', example: 'Fats (butter, oil)', grams: '~15g' },
  { label: '2 handfuls', desc: 'Both hands cupped', icon: '🙌', example: 'Salad, raw vegetables', grams: '~80g' },
]

// Water presets (ml)
const WATER_PRESETS = [
  { label: '1 glass', ml: 250, icon: '🥛' },
  { label: '1 bottle', ml: 500, icon: '🧴' },
  { label: '1 litre', ml: 1000, icon: '💧' },
  { label: '1.5 litres', ml: 1500, icon: '💧💧' },
]

export const MealLogForm = ({ existingMeal, onSave, onClose, variant = 'modal', showClose = true }) => {
  const { user } = useAuth()
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toTimeString().slice(0, 5)
  const isModal = variant === 'modal'
  const fileInputRef = useRef(null)
  const barcodeInputRef = useRef(null)

  // Core form data
  const [formData, setFormData] = useState({
    meal_date: existingMeal?.meal_date || today,
    meal_time: existingMeal?.meal_time || now,
    meal_type: existingMeal?.meal_type || 'breakfast',
    description: existingMeal?.description || '',
    portion_size: existingMeal?.portion_size || '',
    hunger_before: existingMeal?.hunger_before || 5,
    hunger_after: existingMeal?.hunger_after || 5,
    satisfaction: existingMeal?.satisfaction || 5,
    location: existingMeal?.location || '',
    notes: existingMeal?.notes || '',
    water_ml: existingMeal?.water_ml || 0,
    photo_urls: existingMeal?.photo_urls || [],
    nutrition: existingMeal?.nutrition || null,
    tags: existingMeal?.tags || [],
  })

  // UI state
  const [saving, setSaving] = useState(false)
  const [estimatingNutrition, setEstimatingNutrition] = useState(false)
  const [scanningBarcode, setScanningBarcode] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showPortionGuide, setShowPortionGuide] = useState(false)
  const [showNutritionDetail, setShowNutritionDetail] = useState(false)
  const [barcodeValue, setBarcodeValue] = useState('')
  const [showBarcodeInput, setShowBarcodeInput] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)

  const mealTypeOptions = [
    { value: 'breakfast', label: '🌅 Breakfast', emoji: '🌅' },
    { value: 'lunch', label: '☀️ Lunch', emoji: '☀️' },
    { value: 'dinner', label: '🌙 Dinner', emoji: '🌙' },
    { value: 'snack', label: '🍎 Snack', emoji: '🍎' },
    { value: 'dessert', label: '🍯 Dessert', emoji: '🍯' },
  ]

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // ─── Photo capture ────────────────────────────────────────
  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Show local preview immediately
    const previewUrl = URL.createObjectURL(file)
    setPhotoPreview(previewUrl)
    setUploadingPhoto(true)

    const result = await uploadMealPhoto(user.id, file)
    if (result.success) {
      handleChange('photo_urls', [...formData.photo_urls, result.url])
      toast.success('Photo uploaded!')
    } else {
      toast.error(`Photo upload failed: ${result.error}`)
      setPhotoPreview(null)
    }
    setUploadingPhoto(false)
  }

  // ─── AI nutrition estimation ──────────────────────────────
  const handleEstimateNutrition = async () => {
    if (!formData.description.trim()) {
      toast.error('Describe your meal first')
      return
    }
    setEstimatingNutrition(true)
    toast.loading('Analysing your meal...', { id: 'nutrition-est' })

    const result = await estimateNutrition(
      formData.description,
      formData.portion_size,
      formData.meal_type
    )

    if (result.success) {
      handleChange('nutrition', result.nutrition)
      setShowNutritionDetail(true)
      toast.success('Nutrition estimated!', { id: 'nutrition-est' })
    } else {
      toast.error(`Estimation failed: ${result.error}`, { id: 'nutrition-est' })
    }
    setEstimatingNutrition(false)
  }

  // ─── Barcode scanner ──────────────────────────────────────
  const handleBarcodeLookup = async () => {
    if (!barcodeValue.trim()) {
      toast.error('Enter a barcode number')
      return
    }
    setScanningBarcode(true)
    toast.loading('Looking up product...', { id: 'barcode' })

    const result = await lookupBarcode(barcodeValue.trim())

    if (result.success && result.product?.found) {
      const p = result.product
      // Auto-fill description and nutrition
      const desc = `${p.brand ? p.brand + ' ' : ''}${p.name}`
      handleChange('description', formData.description ? `${formData.description}, ${desc}` : desc)

      if (p.nutrition) {
        handleChange('nutrition', {
          calories: p.nutrition.calories,
          protein_g: p.nutrition.protein_g,
          carbs_g: p.nutrition.carbs_g,
          fat_g: p.nutrition.fat_g,
          fibre_g: p.nutrition.fibre_g,
          sugar_g: p.nutrition.sugar_g,
          sodium_mg: p.nutrition.sodium_mg,
          per: p.nutrition.per || '100g',
          source: 'barcode',
        })
        setShowNutritionDetail(true)
      }
      toast.success(`Found: ${desc}`, { id: 'barcode' })
      setShowBarcodeInput(false)
      setBarcodeValue('')
    } else {
      toast.error(result.product?.message || 'Product not found. Try describing it manually.', { id: 'barcode', duration: 4000 })
    }
    setScanningBarcode(false)
  }

  // ─── Water tracking ───────────────────────────────────────
  const addWater = (ml) => {
    handleChange('water_ml', formData.water_ml + ml)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(formData)
    } finally {
      setSaving(false)
    }
  }

  // ─── Nutrition display card ───────────────────────────────
  const NutritionCard = ({ nutrition }) => {
    if (!nutrition) return null
    const macros = [
      { label: 'Calories', value: nutrition.calories, unit: 'kcal', emoji: '🔥', bg: 'bg-red-50 dark:bg-red-900/20' },
      { label: 'Protein', value: nutrition.protein_g, unit: 'g', emoji: '🥩', bg: 'bg-blue-50 dark:bg-blue-900/20' },
      { label: 'Carbs', value: nutrition.carbs_g, unit: 'g', emoji: '🌾', bg: 'bg-amber-50 dark:bg-amber-900/20' },
      { label: 'Fat', value: nutrition.fat_g, unit: 'g', emoji: '🫒', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
      { label: 'Fibre', value: nutrition.fibre_g, unit: 'g', emoji: '🥬', bg: 'bg-green-50 dark:bg-green-900/20' },
    ]

    return (
      <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-green-600" />
            Nutrition Estimate
          </h4>
          {nutrition.confidence && (
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
              nutrition.confidence === 'high' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' :
              nutrition.confidence === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400' :
              'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
            }`}>
              {nutrition.confidence} confidence
            </span>
          )}
        </div>

        {/* Macro grid */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {macros.map(m => (
            <div key={m.label} className={`${m.bg} rounded-lg p-2 text-center`}>
              <span className="text-base">{m.emoji}</span>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{m.value ?? '—'}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{m.unit}</p>
              <p className="text-[10px] font-medium text-gray-600 dark:text-gray-300">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Health score */}
        {nutrition.healthScore && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Health Score:</span>
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  nutrition.healthScore >= 7 ? 'bg-green-500' :
                  nutrition.healthScore >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${nutrition.healthScore * 10}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white">{nutrition.healthScore}/10</span>
          </div>
        )}

        {/* AI tip */}
        {nutrition.tips && (
          <p className="text-xs text-gray-600 dark:text-gray-400 italic mt-2">
            💡 {nutrition.tips}
          </p>
        )}

        {/* Item breakdown toggle */}
        {nutrition.items && nutrition.items.length > 0 && (
          <button
            type="button"
            onClick={() => setShowNutritionDetail(!showNutritionDetail)}
            className="text-xs font-medium text-green-600 dark:text-green-400 mt-2 flex items-center gap-1"
          >
            {showNutritionDetail ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showNutritionDetail ? 'Hide' : 'Show'} item breakdown
          </button>
        )}

        {showNutritionDetail && nutrition.items && (
          <div className="mt-2 space-y-1">
            {nutrition.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-t border-green-200/50 dark:border-green-800/30">
                <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {item.calories}kcal · P{item.protein_g}g · C{item.carbs_g}g · F{item.fat_g}g
                </span>
              </div>
            ))}
          </div>
        )}

        {nutrition.per && (
          <p className="text-[10px] text-gray-400 mt-2">Values {nutrition.source === 'barcode' ? `per ${nutrition.per}` : 'estimated by AI'}</p>
        )}
      </div>
    )
  }

  const SliderInput = ({ label, field, min = 1, max = 10, emoji }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {emoji && <span className="mr-1">{emoji}</span>}{label}
        </label>
        <span className="text-sm font-bold text-temple-purple dark:text-temple-gold">
          {formData[field]}/10
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={formData[field]}
        onChange={(e) => handleChange(field, parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-temple-purple dark:accent-temple-gold"
      />
    </div>
  )

  const wrapperClass = isModal
    ? 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
    : 'min-h-screen bg-gray-50 dark:bg-gray-900'

  const cardClass = isModal
    ? 'bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'
    : 'max-w-3xl mx-auto px-4 py-8'

  const innerCardClass = isModal ? '' : 'glass-card overflow-hidden'

  return (
    <div className={wrapperClass}>
      <div className={cardClass}>
        <div className={innerCardClass}>
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-br from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {existingMeal ? 'Review Meal Log' : 'Log Meal'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Track your nutrition, hydration, and how food makes you feel
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

            {/* ─── Quick actions bar ─────────────────────────── */}
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <Camera className="w-4 h-4" />
                {uploadingPhoto ? 'Uploading...' : 'Photo'}
              </button>
              <button
                type="button"
                onClick={() => { setShowBarcodeInput(!showBarcodeInput); setTimeout(() => barcodeInputRef.current?.focus(), 100) }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
              >
                <Search className="w-4 h-4" />
                Barcode
              </button>
              <button
                type="button"
                onClick={handleEstimateNutrition}
                disabled={estimatingNutrition || !formData.description.trim()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4" />
                {estimatingNutrition ? 'Analysing...' : 'AI Nutrition'}
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />

            {/* ─── Barcode input (shown on toggle) ──────────── */}
            {showBarcodeInput && (
              <div className="flex gap-2 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  inputMode="numeric"
                  value={barcodeValue}
                  onChange={(e) => setBarcodeValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleBarcodeLookup())}
                  placeholder="Enter barcode number..."
                  className="flex-1 px-3 py-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-sm"
                />
                <button
                  type="button"
                  onClick={handleBarcodeLookup}
                  disabled={scanningBarcode}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                >
                  {scanningBarcode ? '...' : 'Look Up'}
                </button>
              </div>
            )}

            {/* ─── Photo preview ────────────────────────────── */}
            {(photoPreview || formData.photo_urls.length > 0) && (
              <div className="flex gap-2 flex-wrap">
                {formData.photo_urls.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-green-300 dark:border-green-700">
                    <img src={url} alt="Meal" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleChange('photo_urls', formData.photo_urls.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {uploadingPhoto && photoPreview && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <img src={photoPreview} alt="Uploading" className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="spinner w-5 h-5"></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── Date and Time ─────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input
                  type="date"
                  value={formData.meal_date}
                  onChange={(e) => handleChange('meal_date', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                <input
                  type="time"
                  value={formData.meal_time}
                  onChange={(e) => handleChange('meal_time', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* ─── Meal Type ─────────────────────────────────── */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meal Type</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {mealTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('meal_type', option.value)}
                    className={`px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                      formData.meal_type === option.value
                        ? 'bg-green-600 text-white shadow-md scale-[1.02]'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Description ────────────────────────────────── */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                What did you eat? *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
                rows="3"
                placeholder="E.g., Grilled chicken salad with quinoa, olive oil dressing, roasted vegetables, and a handful of almonds"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Be specific for better AI nutrition estimates — include quantities where possible
              </p>
            </div>

            {/* ─── Portion Size with Visual Guide ────────────── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Portion Size</label>
                <button
                  type="button"
                  onClick={() => setShowPortionGuide(!showPortionGuide)}
                  className="text-xs text-temple-purple dark:text-temple-gold font-medium flex items-center gap-1"
                >
                  {showPortionGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  Visual guide
                </button>
              </div>

              {showPortionGuide && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                  {PORTION_GUIDE.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleChange('portion_size', p.label)}
                      className={`text-center p-2 rounded-lg transition-all ${
                        formData.portion_size === p.label
                          ? 'bg-amber-200 dark:bg-amber-800/40 ring-2 ring-amber-400'
                          : 'hover:bg-amber-100 dark:hover:bg-amber-900/20'
                      }`}
                    >
                      <span className="text-2xl">{p.icon}</span>
                      <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">{p.label}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{p.example}</p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{p.grams}</p>
                    </button>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={formData.portion_size}
                onChange={(e) => handleChange('portion_size', e.target.value)}
                placeholder="E.g., 1 plate, 2 cups, palm-sized"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            {/* ─── AI Nutrition Results ───────────────────────── */}
            {formData.nutrition && <NutritionCard nutrition={formData.nutrition} />}

            {/* ─── Manual Nutrition Entry (if no AI estimate) ── */}
            {!formData.nutrition && (
              <div className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-center">
                <Sparkles className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Describe your meal above, then tap <strong>AI Nutrition</strong> for automatic estimates
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Or scan a barcode for packaged foods
                </p>
              </div>
            )}

            {/* ─── Water Tracker ──────────────────────────────── */}
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  Water Intake
                </h3>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formData.water_ml >= 1000
                    ? `${(formData.water_ml / 1000).toFixed(1)}L`
                    : `${formData.water_ml}ml`
                  }
                </span>
              </div>

              {/* Water progress bar (2L daily target) */}
              <div className="relative h-3 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                  style={{ width: `${Math.min((formData.water_ml / 2000) * 100, 100)}%` }}
                />
                <span className="absolute right-2 top-0 text-[9px] font-medium text-blue-800 dark:text-blue-300 leading-3">
                  {Math.round((formData.water_ml / 2000) * 100)}% of 2L
                </span>
              </div>

              <div className="flex gap-2">
                {WATER_PRESETS.map(w => (
                  <button
                    key={w.ml}
                    type="button"
                    onClick={() => addWater(w.ml)}
                    className="flex-1 py-2 px-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-center"
                  >
                    <span className="block text-sm">{w.icon}</span>
                    +{w.label}
                  </button>
                ))}
              </div>

              {formData.water_ml > 0 && (
                <button
                  type="button"
                  onClick={() => handleChange('water_ml', 0)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Reset water
                </button>
              )}
            </div>

            {/* ─── How did you feel? ──────────────────────────── */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">How did you feel?</h3>
              <SliderInput label="Hunger Before" field="hunger_before" emoji="😋" />
              <SliderInput label="Hunger After" field="hunger_after" emoji="😌" />
              <SliderInput label="Satisfaction" field="satisfaction" emoji="⭐" />
            </div>

            {/* ─── Location ──────────────────────────────────── */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {['Home', 'Work', 'Restaurant', 'Takeaway', 'On the go'].map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleChange('location', loc)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      formData.location === loc
                        ? 'bg-temple-purple text-white dark:bg-temple-gold'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Notes ─────────────────────────────────────── */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows="2"
                placeholder="How did this meal make you feel? Any reactions or symptoms?"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              />
            </div>

            {/* ─── Actions ────────────────────────────────────── */}
            <div className="flex gap-3 pt-4">
              {showClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving || !formData.description}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="spinner w-4 h-4 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Save Meal Log
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
