import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { mealPlanService } from '../features/mealplans/services/mealPlanService'
import { supabase } from '../lib/supabase'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import { 
  Plus, X, Sparkles, ShoppingCart, GripVertical, Search,
  Coffee, Sandwich, UtensilsCrossed, Apple, Clock, Trash2
} from 'lucide-react'

const DAYS = mealPlanService.DAYS
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

const MEAL_ICONS = {
  breakfast: Coffee,
  lunch: Sandwich,
  dinner: UtensilsCrossed,
  snack: Apple,
}

const MEAL_COLORS = {
  breakfast: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  lunch: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  dinner: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  snack: 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400',
}

export const MealPlanBuilder = () => {
  const { id: planId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Recipe picker
  const [showPicker, setShowPicker] = useState(false)
  const [pickerDay, setPickerDay] = useState(null)
  const [pickerMealType, setPickerMealType] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [recipeSearch, setRecipeSearch] = useState('')
  const [recipesLoading, setRecipesLoading] = useState(false)

  // Drag and drop
  const dragItem = useRef(null)
  const dragOverSlot = useRef(null)

  useEffect(() => {
    loadPlan()
  }, [planId])

  const loadPlan = async () => {
    setLoading(true)
    const { data, error } = await mealPlanService.getMealPlan(planId)
    if (error || !data) {
      toast.error('Plan not found')
      navigate('/meal-plans')
      return
    }
    setPlan(data)
    setLoading(false)
  }

  const loadRecipes = async () => {
    setRecipesLoading(true)
    const { data } = await supabase
      .from('recipes')
      .select('id, title, meal_type, prep_time, total_time, dietary_tags')
      .or(`created_by.eq.${user.id},is_published.eq.true`)
      .order('title')

    setRecipes(data || [])
    setRecipesLoading(false)
  }

  const openPicker = (dayOfWeek, mealType) => {
    setPickerDay(dayOfWeek)
    setPickerMealType(mealType)
    setRecipeSearch('')
    setShowPicker(true)
    if (recipes.length === 0) loadRecipes()
  }

  const handleAddRecipe = async (recipeId) => {
    const { data, error } = await mealPlanService.addMealToDay(
      planId, pickerDay, pickerMealType, recipeId
    )
    if (!error) {
      await loadPlan()
      setShowPicker(false)
      toast.success('Recipe added!')
    } else {
      toast.error('Failed to add recipe')
    }
  }

  const handleAddCustomMeal = async (name) => {
    if (!name.trim()) return
    const { error } = await mealPlanService.addMealToDay(
      planId, pickerDay, pickerMealType, null, name.trim()
    )
    if (!error) {
      await loadPlan()
      setShowPicker(false)
      toast.success('Meal added!')
    }
  }

  const handleRemoveMeal = async (mealDayId) => {
    const { error } = await mealPlanService.removeMealFromDay(mealDayId)
    if (!error) {
      await loadPlan()
    }
  }

  const handleAutoGenerate = async () => {
    setGenerating(true)
    const { data, error } = await mealPlanService.autoGeneratePlan(user.id, planId, {
      mealsPerDay: ['breakfast', 'lunch', 'dinner'],
    })
    if (!error) {
      await loadPlan()
      toast.success('Meal plan generated! ✨')
    } else {
      toast.error(error?.message || 'Failed to generate plan')
    }
    setGenerating(false)
  }

  const handleGenerateShoppingList = async () => {
    const { data, error } = await mealPlanService.generateShoppingList(user.id, planId)
    if (!error && data) {
      toast.success('Shopping list ready!')
      navigate(`/shopping-list/${planId}`)
    } else {
      toast.error('Failed to generate shopping list')
    }
  }

  // ─── Drag & Drop ───────────────────────────────────────

  const handleDragStart = (e, mealDayId) => {
    dragItem.current = mealDayId
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, dayOfWeek, mealType) => {
    e.preventDefault()
    dragOverSlot.current = { dayOfWeek, mealType }
  }

  const handleDrop = async (e, dayOfWeek, mealType) => {
    e.preventDefault()
    if (!dragItem.current) return

    const { error } = await mealPlanService.moveMeal(dragItem.current, dayOfWeek, mealType)
    if (!error) {
      await loadPlan()
    }
    dragItem.current = null
    dragOverSlot.current = null
  }

  // ─── Helpers ───────────────────────────────────────────

  const getMealsForSlot = (dayOfWeek, mealType) => {
    return (plan?.meal_plan_days || []).filter(
      d => d.day_of_week === dayOfWeek && d.meal_type === mealType
    )
  }

  const filteredRecipes = recipes.filter(r => {
    const matchSearch = !recipeSearch || r.title.toLowerCase().includes(recipeSearch.toLowerCase())
    const matchType = !pickerMealType || r.meal_type === pickerMealType || !r.meal_type
    return matchSearch
  })

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
      <AppHeader title={plan?.title || 'Meal Plan'} showBackButton={true} backTo="/meal-plans" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={handleAutoGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 text-white font-medium hover:shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? 'Generating...' : 'Auto-Generate'}
          </button>
          <button
            onClick={handleGenerateShoppingList}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Shopping List
          </button>
        </div>

        {/* Weekly Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="glass-card p-3 min-h-[200px]">
              {/* Day Header */}
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 text-center border-b border-gray-200 dark:border-gray-700 pb-2">
                {day}
              </h3>

              {/* Meal Slots */}
              <div className="space-y-2">
                {MEAL_TYPES.map(mealType => {
                  const meals = getMealsForSlot(dayIndex, mealType)
                  const Icon = MEAL_ICONS[mealType]

                  return (
                    <div
                      key={mealType}
                      onDragOver={(e) => handleDragOver(e, dayIndex, mealType)}
                      onDrop={(e) => handleDrop(e, dayIndex, mealType)}
                      className="min-h-[40px]"
                    >
                      {/* Meal type label */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <Icon className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">
                            {mealType}
                          </span>
                        </div>
                        <button
                          onClick={() => openPicker(dayIndex, mealType)}
                          className="p-0.5 rounded text-gray-400 hover:text-temple-purple dark:hover:text-temple-gold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Meal Cards */}
                      {meals.map(meal => (
                        <div
                          key={meal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, meal.id)}
                          className={`group flex items-center gap-1.5 p-1.5 rounded-lg text-xs cursor-grab active:cursor-grabbing ${MEAL_COLORS[mealType]} mb-1`}
                        >
                          <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-50 flex-shrink-0" />
                          <span className="flex-1 truncate font-medium">
                            {meal.recipes?.title || meal.custom_meal_name || 'Untitled'}
                          </span>
                          <button
                            onClick={() => handleRemoveMeal(meal.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {meals.length === 0 && (
                        <button
                          onClick={() => openPicker(dayIndex, mealType)}
                          className="w-full p-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-xs text-gray-400 hover:border-temple-purple dark:hover:border-temple-gold hover:text-temple-purple dark:hover:text-temple-gold transition-colors"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <BottomNav />

    {/* Recipe Picker Modal */}
    {showPicker && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add {pickerMealType} — {DAYS[pickerDay]}
            </h3>
            <button onClick={() => setShowPicker(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={recipeSearch}
                onChange={(e) => setRecipeSearch(e.target.value)}
                placeholder="Search recipes..."
                className="form-input pl-10"
                autoFocus
              />
            </div>
          </div>

          {/* Recipe List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Custom meal option */}
            <button
              onClick={() => {
                const name = prompt('Enter meal name:')
                if (name) handleAddCustomMeal(name)
              }}
              className="w-full p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-temple-purple dark:hover:border-temple-gold hover:text-temple-purple dark:hover:text-temple-gold transition-colors text-left text-sm"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add custom meal (not from recipes)
            </button>

            {recipesLoading ? (
              <div className="text-center py-8">
                <div className="spinner mx-auto"></div>
              </div>
            ) : filteredRecipes.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                No recipes found. Create some recipes first!
              </p>
            ) : (
              filteredRecipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => handleAddRecipe(recipe.id)}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {recipe.title}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {recipe.total_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {recipe.total_time} min
                      </span>
                    )}
                    {recipe.meal_type && (
                      <span className="capitalize">{recipe.meal_type}</span>
                    )}
                    {recipe.dietary_tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 capitalize">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    )}
    </>
  )
}
