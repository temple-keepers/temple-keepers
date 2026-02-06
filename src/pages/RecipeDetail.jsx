import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useRecipes } from '../hooks/useRecipes'
import { mealPlanService } from '../features/mealplans/services/mealPlanService'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import { ArrowLeft, Clock, Users, Heart, BookOpen, ChefHat, CalendarPlus, X, Plus } from 'lucide-react'

const DAYS = mealPlanService.DAYS
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

export const RecipeDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getRecipe, addToFavorites, removeFromFavorites, isFavorited } = useRecipes()
  
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [favorited, setFavorited] = useState(false)
  const [servings, setServings] = useState(4)
  const [originalServings, setOriginalServings] = useState(4)

  // Add to meal plan state
  const [showMealPlanModal, setShowMealPlanModal] = useState(false)
  const [mealPlans, setMealPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedMealType, setSelectedMealType] = useState('dinner')
  const [addingToPlan, setAddingToPlan] = useState(false)

  useEffect(() => {
    loadRecipe()
  }, [id])

  const loadRecipe = async () => {
    setLoading(true)
    
    const { data, error } = await getRecipe(id)
    if (data) {
      setRecipe(data)
      setServings(data.servings)
      setOriginalServings(data.servings)
      
      // Check if favorited
      const { favorited: isFav } = await isFavorited(id)
      setFavorited(isFav)
    } else {
      navigate('/recipes')
    }
    
    setLoading(false)
  }

  const handleToggleFavorite = async () => {
    if (favorited) {
      await removeFromFavorites(id)
      setFavorited(false)
    } else {
      await addToFavorites(id)
      setFavorited(true)
    }
  }

  const openMealPlanModal = async () => {
    const { data } = await mealPlanService.getMealPlans(user.id)
    setMealPlans(data || [])
    if (data?.length > 0) setSelectedPlan(data[0].id)
    // Default meal type based on recipe type
    if (recipe?.meal_type) setSelectedMealType(recipe.meal_type)
    setShowMealPlanModal(true)
  }

  const handleAddToMealPlan = async () => {
    if (!selectedPlan) {
      toast.error('Please select a meal plan')
      return
    }
    setAddingToPlan(true)
    const { error } = await mealPlanService.addMealToDay(
      selectedPlan, selectedDay, selectedMealType, id
    )
    if (!error) {
      toast.success(`Added to ${DAYS[selectedDay]} ${selectedMealType}! 🍽️`)
      setShowMealPlanModal(false)
    } else {
      toast.error('Failed to add to meal plan')
    }
    setAddingToPlan(false)
  }

  const handleCreatePlanAndAdd = async () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek)
    const nextMonday = new Date(today)
    nextMonday.setDate(today.getDate() + daysUntilMonday)
    const weekStart = nextMonday.toISOString().split('T')[0]

    const { data, error } = await mealPlanService.createMealPlan(user.id, weekStart)
    if (!error && data) {
      setMealPlans(prev => [data, ...prev])
      setSelectedPlan(data.id)
      toast.success('New meal plan created!')
    }
  }

  // Calculate adjusted ingredient amounts
  const adjustIngredientAmount = (amount) => {
    if (!amount || isNaN(parseFloat(amount))) return amount
    
    const multiplier = servings / originalServings
    const adjusted = parseFloat(amount) * multiplier
    
    // Round to reasonable precision
    if (adjusted < 1) {
      return adjusted.toFixed(2).replace(/\.?0+$/, '')
    } else if (adjusted < 10) {
      return adjusted.toFixed(1).replace(/\.?0+$/, '')
    } else {
      return Math.round(adjusted).toString()
    }
  }

  // Calculate adjusted nutrition
  const adjustNutrition = (value) => {
    if (!value || isNaN(parseFloat(value))) return value
    
    const multiplier = servings / originalServings
    const adjusted = parseFloat(value) * multiplier
    return Math.round(adjusted)
  }

  const increaseServings = () => {
    if (servings < 99) setServings(servings + 1)
  }

  const decreaseServings = () => {
    if (servings > 1) setServings(servings - 1)
  }

  const resetServings = () => {
    setServings(originalServings)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!recipe) return null

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
      {/* Header */}
      <AppHeader showBackButton={true} backTo="/recipes" />

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
              {recipe.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {recipe.description}
            </p>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={openMealPlanModal}
              className="p-3 rounded-full bg-temple-purple/10 dark:bg-temple-gold/10 text-temple-purple dark:text-temple-gold hover:bg-temple-purple/20 dark:hover:bg-temple-gold/20 transition-colors flex-shrink-0"
              title="Add to Meal Plan"
            >
              <CalendarPlus className="w-6 h-6" />
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`
                p-3 rounded-full transition-colors flex-shrink-0
                ${favorited
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              <Heart className={`w-6 h-6 ${favorited ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Scripture */}
            {recipe.scripture && (
              <div className="glass-card p-6 bg-temple-purple/5 dark:bg-temple-gold/5 border-2 border-temple-purple/20 dark:border-temple-gold/20">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Scripture Meditation
                  </h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic mb-2">
                  "{recipe.scripture.text}"
                </p>
                <p className="text-sm font-semibold text-temple-purple dark:text-temple-gold mb-3">
                  — {recipe.scripture.reference}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {recipe.scripture.reflection}
                </p>
              </div>
            )}

            {/* Ingredients */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-temple-purple dark:text-temple-gold" />
                Ingredients
              </h2>
              {servings !== originalServings && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-1">
                  <span>✓</span>
                  <span>Adjusted for {servings} servings</span>
                </p>
              )}
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-temple-purple/10 dark:bg-temple-gold/10 flex items-center justify-center text-xs font-semibold text-temple-purple dark:text-temple-gold">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">
                        {adjustIngredientAmount(ingredient.amount)} {ingredient.unit}
                      </span> {ingredient.item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Instructions
              </h2>
              <div className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-temple-purple dark:bg-temple-gold text-white flex items-center justify-center font-bold">
                      {instruction.step}
                    </div>
                    <p className="flex-1 pt-1 text-gray-700 dark:text-gray-300">
                      {instruction.instruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            {recipe.tips && recipe.tips.length > 0 && (
              <div className="glass-card p-6 bg-blue-50 dark:bg-blue-900/20">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Chef's Tips
                </h3>
                <ul className="space-y-2">
                  {recipe.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-temple-purple dark:text-temple-gold mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes */}
            {recipe.notes && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Notes
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {recipe.notes}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Serving Adjuster */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Adjust Servings
              </h3>
              
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={decreaseServings}
                  disabled={servings <= 1}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 transition-colors"
                >
                  −
                </button>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-temple-purple dark:text-temple-gold">
                    {servings}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    servings
                  </div>
                </div>
                
                <button
                  onClick={increaseServings}
                  disabled={servings >= 99}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 transition-colors"
                >
                  +
                </button>
              </div>
              
              {servings !== originalServings && (
                <div className="text-center">
                  <button
                    onClick={resetServings}
                    className="text-sm text-temple-purple dark:text-temple-gold hover:underline"
                  >
                    Reset to {originalServings}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Ingredients auto-adjusted
                  </p>
                </div>
              )}
            </div>
            
            {/* Recipe Info */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recipe Info
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Prep Time</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{recipe.prep_time} min</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cook Time</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{recipe.cook_time} min</span>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Total Time</span>
                  <span className="font-bold text-temple-purple dark:text-temple-gold">{recipe.total_time} min</span>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Servings</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {servings}
                    {servings !== originalServings && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        (recipe: {originalServings})
                      </span>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Difficulty</span>
                  <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-xs font-medium text-green-700 dark:text-green-400">
                    {recipe.difficulty}
                  </span>
                </div>
                
                {recipe.cuisine && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cuisine</span>
                    <span className="font-semibold text-gray-900 dark:text-white capitalize">{recipe.cuisine}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Nutrition */}
            {recipe.nutrition && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Nutrition
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Per serving ({servings} {servings === 1 ? 'serving' : 'servings'} total)
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Calories</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {adjustNutrition(recipe.nutrition.calories)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Protein</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {recipe.nutrition.protein}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Carbs</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {recipe.nutrition.carbs}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Fat</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {recipe.nutrition.fat}
                    </span>
                  </div>
                  
                  {recipe.nutrition.fiber && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Fiber</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {recipe.nutrition.fiber}
                      </span>
                    </div>
                  )}
                  
                  {servings !== originalServings && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        Total recipe: ~{adjustNutrition(recipe.nutrition.calories) * servings} calories
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dietary Tags */}
            {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Dietary Info
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.dietary_tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-400 capitalize">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    <BottomNav />

    {/* Add to Meal Plan Modal */}
    {showMealPlanModal && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add to Meal Plan
            </h3>
            <button onClick={() => setShowMealPlanModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Recipe being added */}
            <div className="p-3 rounded-lg bg-temple-purple/5 dark:bg-temple-gold/5 border border-temple-purple/20 dark:border-temple-gold/20">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{recipe?.title}</p>
            </div>

            {/* Select Meal Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meal Plan</label>
              {mealPlans.length === 0 ? (
                <button
                  onClick={handleCreatePlanAndAdd}
                  className="w-full p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-temple-purple dark:hover:border-temple-gold hover:text-temple-purple dark:hover:text-temple-gold text-sm"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Create your first meal plan
                </button>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedPlan || ''}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="form-input w-full"
                  >
                    {mealPlans.map(p => (
                      <option key={p.id} value={p.id}>{p.title || 'Untitled Plan'}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleCreatePlanAndAdd}
                    className="text-sm text-temple-purple dark:text-temple-gold hover:underline"
                  >
                    <Plus className="w-3 h-3 inline mr-1" />Create new plan
                  </button>
                </div>
              )}
            </div>

            {/* Select Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day</label>
              <div className="grid grid-cols-7 gap-1">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(i)}
                    className={`p-2 rounded-lg text-xs font-medium text-center transition-colors ${
                      selectedDay === i
                        ? 'bg-temple-purple dark:bg-temple-gold text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Meal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meal</label>
              <div className="grid grid-cols-4 gap-2">
                {MEAL_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedMealType(type)}
                    className={`p-2 rounded-lg text-sm font-medium capitalize text-center transition-colors ${
                      selectedMealType === type
                        ? 'bg-temple-purple dark:bg-temple-gold text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleAddToMealPlan}
              disabled={addingToPlan || !selectedPlan}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <CalendarPlus className="w-5 h-5" />
              {addingToPlan ? 'Adding...' : `Add to ${DAYS[selectedDay]} ${selectedMealType}`}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
