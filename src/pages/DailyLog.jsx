import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import {
  getDailyLog,
  updateWaterLog,
  createMealLog,
  deleteMealLog,
  // ✅ Add these in ../lib/supabase (see note at bottom)
  updateMealLog,
  createMoodLog,
  deleteMoodLog,
  createSymptomLog,
  deleteSymptomLog,
  // ✅ Add these in ../lib/supabase (see note at bottom)
  updateSymptomLog
} from '../lib/supabase'
import {
  Droplets,
  Plus,
  Minus,
  UtensilsCrossed,
  Smile,
  Frown,
  Meh,
  Heart,
  AlertCircle,
  X,
  Edit,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

/**
 * DailyLog improvements:
 * - Safe defaults (no crashes on empty days)
 * - Meals: tags + hunger/fullness + edit (upsert) + time sorting
 * - Symptoms: category + impact + link to a meal (trigger_meal_id) + edit (upsert) + time sorting
 */

const normaliseDailyLog = (log, goalFallback = 8) => ({
  water: {
    glasses: log?.water?.glasses ?? 0,
    goal: log?.water?.goal ?? goalFallback
  },
  meals: Array.isArray(log?.meals) ? log.meals : [],
  moods: Array.isArray(log?.moods) ? log.moods : [],
  symptoms: Array.isArray(log?.symptoms) ? log.symptoms : []
})

const toTimeKey = (t) => (t && typeof t === 'string' ? t : '99:99')

const DailyLog = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [dailyLog, setDailyLog] = useState(null)
  const [waterGoal, setWaterGoal] = useState(8)

  // Modal states (support edit + add)
  const [mealModalState, setMealModalState] = useState({ open: false, initial: null })
  const [moodModalState, setMoodModalState] = useState({ open: false, initial: null }) // kept for consistency
  const [symptomModalState, setSymptomModalState] = useState({ open: false, initial: null })

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState({
    water: true,
    meals: true,
    mood: true,
    symptoms: true
  })

  useEffect(() => {
    if (user) loadDailyLog()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedDate])

  const loadDailyLog = async () => {
    setLoading(true)
    try {
      const log = await getDailyLog(user.id, selectedDate)
      const safe = normaliseDailyLog(log, waterGoal)
      setDailyLog(safe)
      if (safe.water?.goal) setWaterGoal(safe.water.goal)
    } catch (error) {
      console.error('Failed to load daily log:', error)
      toast({ title: 'Failed to load log', variant: 'error' })
      setDailyLog(normaliseDailyLog(null, waterGoal))
    }
    setLoading(false)
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Derived helpers
  const mealsSorted = useMemo(() => {
    const list = dailyLog?.meals ?? []
    return [...list].sort((a, b) => toTimeKey(a.time).localeCompare(toTimeKey(b.time)))
  }, [dailyLog])

  const symptomsSorted = useMemo(() => {
    const list = dailyLog?.symptoms ?? []
    return [...list].sort((a, b) => toTimeKey(a.time).localeCompare(toTimeKey(b.time)))
  }, [dailyLog])

  const mealById = useMemo(() => {
    const map = new Map()
    for (const m of mealsSorted) map.set(m.id, m)
    return map
  }, [mealsSorted])

  const getMealLabel = (meal) => {
    if (!meal) return 'Meal'
    const time = meal.time ? `${meal.time} • ` : ''
    const name = meal.meal_name || 'Meal'
    const type = meal.meal_type ? ` (${meal.meal_type})` : ''
    return `${time}${name}${type}`
  }

  // Water
  const updateWater = async (newGlasses) => {
    if (newGlasses < 0) return
    try {
      await updateWaterLog(user.id, newGlasses, waterGoal)
      setDailyLog((prev) => {
        const safe = normaliseDailyLog(prev, waterGoal)
        return { ...safe, water: { glasses: newGlasses, goal: waterGoal } }
      })
    } catch (error) {
      console.error('Failed to update water:', error)
      toast({ title: 'Failed to update water intake', variant: 'error' })
    }
  }

  // Meals (Upsert)
  const handleSaveMeal = async (mealData) => {
    try {
      const payload = { ...mealData, date: selectedDate }
      // Ensure number types where appropriate
      if (payload.calories === '') payload.calories = null
      if (typeof payload.calories === 'string') payload.calories = Number(payload.calories)

      const saved = mealData?.id
        ? await updateMealLog(mealData.id, payload)
        : await createMealLog(user.id, payload)

      setDailyLog((prev) => {
        const safe = normaliseDailyLog(prev, waterGoal)
        const nextMeals = mealData?.id
          ? safe.meals.map((m) => (m.id === saved.id ? saved : m))
          : [...safe.meals, saved]
        return { ...safe, meals: nextMeals }
      })

      setMealModalState({ open: false, initial: null })
      toast({ title: mealData?.id ? 'Meal updated' : 'Meal logged successfully!' })
    } catch (error) {
      console.error('Failed to save meal:', error)
      toast({ title: 'Failed to save meal', variant: 'error' })
    }
  }

  const handleDeleteMeal = async (id) => {
    try {
      await deleteMealLog(id)
      setDailyLog((prev) => {
        const safe = normaliseDailyLog(prev, waterGoal)
        return { ...safe, meals: safe.meals.filter((m) => m.id !== id) }
      })
      toast({ title: 'Meal deleted' })
    } catch (error) {
      console.error('Failed to delete meal:', error)
      toast({ title: 'Failed to delete meal', variant: 'error' })
    }
  }

  // Mood (kept as create/delete, but safe updates)
  const handleAddMood = async (moodData) => {
    try {
      const newMood = await createMoodLog(user.id, { ...moodData, date: selectedDate })
      setDailyLog((prev) => {
        const safe = normaliseDailyLog(prev, waterGoal)
        return { ...safe, moods: [newMood, ...safe.moods] }
      })
      setMoodModalState({ open: false, initial: null })
      toast({ title: 'Mood logged successfully!' })
    } catch (error) {
      console.error('Failed to add mood:', error)
      toast({ title: 'Failed to log mood', variant: 'error' })
    }
  }

  const handleDeleteMood = async (id) => {
    try {
      await deleteMoodLog(id)
      setDailyLog((prev) => {
        const safe = normaliseDailyLog(prev, waterGoal)
        return { ...safe, moods: safe.moods.filter((m) => m.id !== id) }
      })
      toast({ title: 'Mood deleted' })
    } catch (error) {
      console.error('Failed to delete mood:', error)
      toast({ title: 'Failed to delete mood', variant: 'error' })
    }
  }

  // Symptoms (Upsert)
  const handleSaveSymptom = async (symptomData) => {
    try {
      const payload = { ...symptomData, date: selectedDate }
      const saved = symptomData?.id
        ? await updateSymptomLog(symptomData.id, payload)
        : await createSymptomLog(user.id, payload)

      setDailyLog((prev) => {
        const safe = normaliseDailyLog(prev, waterGoal)
        const nextSymptoms = symptomData?.id
          ? safe.symptoms.map((s) => (s.id === saved.id ? saved : s))
          : [saved, ...safe.symptoms]
        return { ...safe, symptoms: nextSymptoms }
      })

      setSymptomModalState({ open: false, initial: null })
      toast({ title: symptomData?.id ? 'Symptom updated' : 'Symptom logged successfully!' })
    } catch (error) {
      console.error('Failed to save symptom:', error)
      toast({ title: 'Failed to save symptom', variant: 'error' })
    }
  }

  const handleDeleteSymptom = async (id) => {
    try {
      await deleteSymptomLog(id)
      setDailyLog((prev) => {
        const safe = normaliseDailyLog(prev, waterGoal)
        return { ...safe, symptoms: safe.symptoms.filter((s) => s.id !== id) }
      })
      toast({ title: 'Symptom deleted' })
    } catch (error) {
      console.error('Failed to delete symptom:', error)
      toast({ title: 'Failed to delete symptom', variant: 'error' })
    }
  }

  if (loading || !dailyLog) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    )
  }

  const waterGlasses = dailyLog?.water?.glasses ?? 0
  const waterTarget = dailyLog?.water?.goal ?? waterGoal
  const waterPercentage = Math.min((waterGlasses / (waterTarget || 1)) * 100, 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={`text-3xl md:text-4xl font-display font-bold ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}
          >
            Daily Log
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your wellness journey</p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className={`px-4 py-2 rounded-lg border ${
            isDark ? 'bg-temple-dark-surface border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>

      {/* Water Section */}
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-temple-dark-surface' : 'bg-white'} shadow-lg`}>
        <button onClick={() => toggleSection('water')} className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Water Intake</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {waterGlasses} / {waterTarget} glasses
              </p>
            </div>
          </div>
          {expandedSections.water ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.water && (
          <div className="space-y-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                style={{ width: `${waterPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => updateWater(waterGlasses - 1)}
                disabled={waterGlasses === 0}
                className={`p-3 rounded-full transition-all ${
                  waterGlasses === 0
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:scale-110'
                }`}
              >
                <Minus className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{waterGlasses}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">glasses</div>
              </div>

              <button
                onClick={() => updateWater(waterGlasses + 1)}
                className="p-3 rounded-full bg-blue-500 text-white hover:scale-110 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Meals Section */}
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-temple-dark-surface' : 'bg-white'} shadow-lg`}>
        <button onClick={() => toggleSection('meals')} className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <UtensilsCrossed className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Meals</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{mealsSorted.length} logged today</p>
            </div>
          </div>
          {expandedSections.meals ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.meals && (
          <div className="space-y-4">
            {mealsSorted.map((meal) => (
              <div
                key={meal.id}
                className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          meal.meal_type === 'breakfast'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                            : meal.meal_type === 'lunch'
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                            : meal.meal_type === 'dinner'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {meal.meal_type}
                      </span>

                      {meal.time && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {meal.time}
                        </span>
                      )}

                      {typeof meal.hunger_before === 'number' && (
                        <span className="text-xs text-gray-500">Hunger: {meal.hunger_before}/5</span>
                      )}
                      {typeof meal.fullness_after === 'number' && (
                        <span className="text-xs text-gray-500">Fullness: {meal.fullness_after}/5</span>
                      )}
                    </div>

                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {meal.meal_name || 'Unnamed Meal'}
                    </h4>

                    {meal.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{meal.description}</p>
                    )}

                    {(meal.tags?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {meal.tags.slice(0, 8).map((tag) => (
                          <span
                            key={tag}
                            className={`text-xs px-2 py-1 rounded-full border ${
                              isDark ? 'border-gray-700 text-gray-200' : 'border-gray-300 text-gray-700'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {meal.calories != null && meal.calories !== '' && (
                      <p className="text-xs text-gray-500 mt-2">{meal.calories} calories</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMealModalState({ open: true, initial: meal })}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => setMealModalState({ open: true, initial: null })}
              className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Log Meal
            </button>
          </div>
        )}
      </div>

      {/* Mood Section */}
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-temple-dark-surface' : 'bg-white'} shadow-lg`}>
        <button onClick={() => toggleSection('mood')} className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Smile className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-left">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Mood & Energy</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{dailyLog.moods.length} check-ins today</p>
            </div>
          </div>
          {expandedSections.mood ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.mood && (
          <div className="space-y-4">
            {dailyLog.moods.map((mood) => (
              <div
                key={mood.id}
                className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {mood.mood === 'excellent' && <Sparkles className="w-5 h-5 text-green-500" />}
                      {mood.mood === 'good' && <Smile className="w-5 h-5 text-blue-500" />}
                      {mood.mood === 'neutral' && <Meh className="w-5 h-5 text-yellow-500" />}
                      {mood.mood === 'low' && <Frown className="w-5 h-5 text-orange-500" />}
                      {mood.mood === 'poor' && <AlertCircle className="w-5 h-5 text-red-500" />}
                      <span className={`font-semibold capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {mood.mood}
                      </span>
                      {mood.time && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {mood.time}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                      {mood.energy_level && (
                        <div>
                          <span className="text-gray-500">Energy:</span>{' '}
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>{mood.energy_level}/5</span>
                        </div>
                      )}
                      {mood.stress_level && (
                        <div>
                          <span className="text-gray-500">Stress:</span>{' '}
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>{mood.stress_level}/5</span>
                        </div>
                      )}
                      {mood.sleep_quality && (
                        <div>
                          <span className="text-gray-500">Sleep:</span>{' '}
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>{mood.sleep_quality}/5</span>
                        </div>
                      )}
                    </div>

                    {mood.notes && <p className="text-sm text-gray-600 dark:text-gray-400">{mood.notes}</p>}
                  </div>

                  <button
                    onClick={() => handleDeleteMood(mood.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => setMoodModalState({ open: true, initial: null })}
              className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Log Mood
            </button>
          </div>
        )}
      </div>

      {/* Symptoms Section */}
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-temple-dark-surface' : 'bg-white'} shadow-lg`}>
        <button onClick={() => toggleSection('symptoms')} className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-left">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Symptoms</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{symptomsSorted.length} logged today</p>
            </div>
          </div>
          {expandedSections.symptoms ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.symptoms && (
          <div className="space-y-4">
            {symptomsSorted.map((symptom) => {
              const triggerMeal = symptom.trigger_meal_id ? mealById.get(symptom.trigger_meal_id) : null
              return (
                <div
                  key={symptom.id}
                  className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className={`font-semibold capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {symptom.symptom_type}
                        </h4>

                        {symptom.category && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${
                              isDark ? 'border-gray-700 text-gray-200' : 'border-gray-300 text-gray-700'
                            }`}
                          >
                            {symptom.category}
                          </span>
                        )}

                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            symptom.severity <= 3
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : symptom.severity <= 6
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}
                        >
                          Severity: {symptom.severity}/10
                        </span>

                        {typeof symptom.impact === 'number' && (
                          <span className="text-xs text-gray-500">Impact: {symptom.impact}/5</span>
                        )}

                        {symptom.time && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {symptom.time}
                          </span>
                        )}
                      </div>

                      {triggerMeal && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Possible trigger: <span className="font-medium">{getMealLabel(triggerMeal)}</span>
                        </p>
                      )}

                      {symptom.location && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">Location: {symptom.location}</p>
                      )}
                      {symptom.duration && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">Duration: {symptom.duration}</p>
                      )}
                      {symptom.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{symptom.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSymptomModalState({ open: true, initial: symptom })}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSymptom(symptom.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            <button
              onClick={() => setSymptomModalState({ open: true, initial: null })}
              className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Log Symptom
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {mealModalState.open && (
        <MealModal
          onClose={() => setMealModalState({ open: false, initial: null })}
          onSave={handleSaveMeal}
          isDark={isDark}
          initialData={mealModalState.initial}
        />
      )}

      {moodModalState.open && (
        <MoodModal onClose={() => setMoodModalState({ open: false, initial: null })} onSave={handleAddMood} isDark={isDark} />
      )}

      {symptomModalState.open && (
        <SymptomModal
          onClose={() => setSymptomModalState({ open: false, initial: null })}
          onSave={handleSaveSymptom}
          isDark={isDark}
          meals={mealsSorted}
          initialData={symptomModalState.initial}
        />
      )}
    </div>
  )
}

/* ------------------------------ Meal Modal ------------------------------ */

const MealModal = ({ onClose, onSave, isDark, initialData }) => {
  const commonTags = ['dairy', 'gluten', 'sugar', 'caffeine', 'fried', 'spicy', 'processed', 'late-night']

  const [formData, setFormData] = useState({
    id: null,
    meal_type: 'breakfast',
    meal_name: '',
    description: '',
    calories: '',
    time: new Date().toTimeString().slice(0, 5),

    // NEW
    tags: [],
    hunger_before: 3, // 1-5
    fullness_after: 3 // 1-5
  })

  useEffect(() => {
    if (!initialData) return
    setFormData({
      id: initialData.id ?? null,
      meal_type: initialData.meal_type ?? 'breakfast',
      meal_name: initialData.meal_name ?? '',
      description: initialData.description ?? '',
      calories: initialData.calories ?? '',
      time: initialData.time ?? new Date().toTimeString().slice(0, 5),
      tags: Array.isArray(initialData.tags) ? initialData.tags : [],
      hunger_before: typeof initialData.hunger_before === 'number' ? initialData.hunger_before : 3,
      fullness_after: typeof initialData.fullness_after === 'number' ? initialData.fullness_after : 3
    })
  }, [initialData])

  const toggleTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-md w-full p-6 rounded-2xl ${isDark ? 'bg-temple-dark-surface' : 'bg-white'}`}>
        <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {formData.id ? 'Edit Meal' : 'Log Meal'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Meal Type</label>
            <select
              value={formData.meal_type}
              onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Meal Name</label>
            <input
              type="text"
              value={formData.meal_name}
              onChange={(e) => setFormData({ ...formData, meal_name: e.target.value })}
              placeholder="e.g., Oatmeal with berries"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Any additional details..."
              rows={2}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>

          {/* NEW: Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags (helps spot patterns)</label>
            <div className="flex flex-wrap gap-2">
              {commonTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm border transition-all ${
                    formData.tags.includes(tag)
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* NEW: Hunger/Fullness */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Hunger before: {formData.hunger_before}/5</label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.hunger_before}
                onChange={(e) => setFormData({ ...formData, hunger_before: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fullness after: {formData.fullness_after}/5</label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.fullness_after}
                onChange={(e) => setFormData({ ...formData, fullness_after: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Calories (Optional)</label>
              <input
                type="number"
                value={formData.calories ?? ''}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                placeholder="300"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ------------------------------ Mood Modal ------------------------------ */

const MoodModal = ({ onClose, onSave, isDark }) => {
  const [formData, setFormData] = useState({
    mood: 'good',
    energy_level: 3,
    stress_level: 3,
    sleep_quality: 3,
    notes: '',
    time: new Date().toTimeString().slice(0, 5)
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-md w-full p-6 rounded-2xl ${isDark ? 'bg-temple-dark-surface' : 'bg-white'}`}>
        <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Log Mood</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">How are you feeling?</label>
            <div className="grid grid-cols-5 gap-2">
              {['excellent', 'good', 'neutral', 'low', 'poor'].map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setFormData({ ...formData, mood })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.mood === mood ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  {mood === 'excellent' && <Sparkles className="w-6 h-6 mx-auto text-green-500" />}
                  {mood === 'good' && <Smile className="w-6 h-6 mx-auto text-blue-500" />}
                  {mood === 'neutral' && <Meh className="w-6 h-6 mx-auto text-yellow-500" />}
                  {mood === 'low' && <Frown className="w-6 h-6 mx-auto text-orange-500" />}
                  {mood === 'poor' && <AlertCircle className="w-6 h-6 mx-auto text-red-500" />}
                  <span className="text-xs mt-1 block capitalize">{mood}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Energy Level: {formData.energy_level}/5</label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.energy_level}
              onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Stress Level: {formData.stress_level}/5</label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.stress_level}
              onChange={(e) => setFormData({ ...formData, stress_level: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sleep Quality: {formData.sleep_quality}/5</label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.sleep_quality}
              onChange={(e) => setFormData({ ...formData, sleep_quality: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="What's on your mind?"
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ----------------------------- Symptom Modal ---------------------------- */

const SymptomModal = ({ onClose, onSave, isDark, meals, initialData }) => {
  const commonSymptoms = ['Headache', 'Fatigue', 'Nausea', 'Digestive Issues', 'Pain', 'Dizziness', 'Anxiety', 'Other']

  const [formData, setFormData] = useState({
    id: null,
    symptom_type: '',
    severity: 5,
    location: '',
    duration: '',
    notes: '',
    time: new Date().toTimeString().slice(0, 5),

    // NEW
    category: 'digestive',
    trigger_meal_id: null,
    impact: 3 // 1-5
  })

  useEffect(() => {
    if (!initialData) return
    setFormData({
      id: initialData.id ?? null,
      symptom_type: initialData.symptom_type ?? '',
      severity: typeof initialData.severity === 'number' ? initialData.severity : 5,
      location: initialData.location ?? '',
      duration: initialData.duration ?? '',
      notes: initialData.notes ?? '',
      time: initialData.time ?? new Date().toTimeString().slice(0, 5),
      category: initialData.category ?? 'digestive',
      trigger_meal_id: initialData.trigger_meal_id ?? null,
      impact: typeof initialData.impact === 'number' ? initialData.impact : 3
    })
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-md w-full p-6 rounded-2xl ${isDark ? 'bg-temple-dark-surface' : 'bg-white'}`}>
        <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {formData.id ? 'Edit Symptom' : 'Log Symptom'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Common Symptoms</label>
            <div className="grid grid-cols-2 gap-2">
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => setFormData({ ...formData, symptom_type: symptom.toLowerCase() })}
                  className={`p-2 text-sm rounded-lg border transition-all ${
                    formData.symptom_type === symptom.toLowerCase()
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Or specify:</label>
            <input
              type="text"
              value={formData.symptom_type}
              onChange={(e) => setFormData({ ...formData, symptom_type: e.target.value })}
              placeholder="Type symptom name..."
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>

          {/* NEW: Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="digestive">Digestive</option>
              <option value="pain">Pain</option>
              <option value="skin">Skin</option>
              <option value="mood">Mood</option>
              <option value="respiratory">Respiratory</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* NEW: Link to meal */}
          <div>
            <label className="block text-sm font-medium mb-1">Possible trigger meal (optional)</label>
            <select
              value={formData.trigger_meal_id ?? ''}
              onChange={(e) => setFormData({ ...formData, trigger_meal_id: e.target.value || null })}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="">None</option>
              {(meals ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {(m.time ? `${m.time} • ` : '')}{m.meal_name || 'Meal'} ({m.meal_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Severity: {formData.severity}/10</label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Mild</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
          </div>

          {/* NEW: Impact */}
          <div>
            <label className="block text-sm font-medium mb-2">Impact on your day: {formData.impact}/5</label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.impact}
              onChange={(e) => setFormData({ ...formData, impact: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location (Optional)</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Lower back"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (Optional)</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 2 hours"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div className="flex items-end">
              <div className="text-xs text-gray-500 leading-snug">
                No condemnation — we’re gathering wisdom.
                <div className="mt-1">“There is therefore now no condemnation…” (Romans 8:1, NKJV)</div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details..."
              rows={2}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DailyLog

/**
 * ✅ IMPORTANT NOTE (Supabase helpers)
 *
 * This file imports updateMealLog + updateSymptomLog.
 * If you don’t have them yet, add these two functions in ../lib/supabase:
 *
 * export async function updateMealLog(id, patch) {
 *   const { data, error } = await supabase
 *     .from('meal_logs')
 *     .update(patch)
 *     .eq('id', id)
 *     .select()
 *     .single()
 *   if (error) throw error
 *   return data
 * }
 *
 * export async function updateSymptomLog(id, patch) {
 *   const { data, error } = await supabase
 *     .from('symptom_logs')
 *     .update(patch)
 *     .eq('id', id)
 *     .select()
 *     .single()
 *   if (error) throw error
 *   return data
 * }
 */
