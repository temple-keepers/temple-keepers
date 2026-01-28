import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { getMealPlan, addMealToPlan, removeMealFromPlan, getUserRecipes, getShoppingList, getRecipeLibrary } from '../lib/supabase'
import { 
  Calendar,
  ChefHat,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Coffee,
  Sun,
  Moon,
  Apple,
  Trash2,
  Check,
  Copy,
  BookOpen,
  Heart
} from 'lucide-react'

const MealPlanner = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()))
  const [mealPlan, setMealPlan] = useState([])
  const [recipes, setRecipes] = useState([])
  const [libraryRecipes, setLibraryRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(null)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [shoppingList, setShoppingList] = useState([])
  const [recipeSource, setRecipeSource] = useState('saved') // 'saved' or 'library'
  const [quickAddRecipe, setQuickAddRecipe] = useState(null) // Recipe passed via navigation

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: Coffee },
    { id: 'lunch', label: 'Lunch', icon: Sun },
    { id: 'dinner', label: 'Dinner', icon: Moon },
    { id: 'snack', label: 'Snack', icon: Apple }
  ]

  function getWeekStart(date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  function getWeekDays(startDate) {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }

  const weekDays = getWeekDays(currentWeek)
  const startDate = weekDays[0].toISOString().split('T')[0]
  const endDate = weekDays[6].toISOString().split('T')[0]

  useEffect(() => {
    if (user) loadData()
  }, [user, currentWeek])

  // Handle incoming recipe from RecipeLibrary navigation
  useEffect(() => {
    if (location.state?.addRecipe) {
      setQuickAddRecipe(location.state.addRecipe)
      // Clear the state so it doesn't persist on refresh
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state])

  const loadData = async () => {
    setLoading(true)
    const [planData, recipesData, libraryData] = await Promise.all([
      getMealPlan(user.id, startDate, endDate),
      getUserRecipes(user.id),
      getRecipeLibrary('popular')
    ])
    setMealPlan(planData)
    setRecipes(recipesData)
    setLibraryRecipes(libraryData || [])
    setLoading(false)
  }

  const handleAddMeal = async (date, mealType, recipeId, source = 'saved') => {
    try {
      const newMeal = await addMealToPlan(user.id, date, mealType, recipeId, source)
      setMealPlan(prev => [...prev.filter(m => !(m.date === date && m.meal_type === mealType)), newMeal])
      setShowAddModal(null)
    } catch (error) {
      console.error('Failed to add meal:', error)
    }
  }

  const handleRemoveMeal = async (mealPlanId, date, mealType) => {
    try {
      await removeMealFromPlan(mealPlanId)
      setMealPlan(prev => prev.filter(m => m.id !== mealPlanId))
    } catch (error) {
      console.error('Failed to remove meal:', error)
    }
  }

  const generateShoppingList = async () => {
    const list = await getShoppingList(user.id, startDate, endDate)
    setShoppingList(list)
    setShowShoppingList(true)
  }

  const copyShoppingList = () => {
    const text = shoppingList.join('\n')
    navigator.clipboard.writeText(text)
  }

  const getMealForSlot = (date, mealType) => {
    const dateStr = date.toISOString().split('T')[0]
    return mealPlan.find(m => m.date === dateStr && m.meal_type === mealType)
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setCurrentWeek(newDate)
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className={`text-3xl md:text-4xl font-display font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Meal Planner
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Plan your healthy meals for the week
          </p>
        </div>
        <button
          onClick={generateShoppingList}
          className="btn-primary flex items-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          Shopping List
        </button>
      </div>

      {/* Week Navigation */}
      <div className="glass-card-strong rounded-2xl p-4 flex items-center justify-between animate-fade-in">
        <button
          onClick={() => navigateWeek(-1)}
          className={`p-2 rounded-xl transition-all ${
            isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        
        <div className="text-center">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {weekDays[0].toLocaleDateString('en', { month: 'long', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
        </div>
        
        <button
          onClick={() => navigateWeek(1)}
          className={`p-2 rounded-xl transition-all ${
            isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
          }`}
        >
          <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto animate-fade-in">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="p-3" /> {/* Empty cell for meal type column */}
            {weekDays.map((day, i) => (
              <div 
                key={i}
                className={`p-3 text-center rounded-xl ${
                  isToday(day)
                    ? 'bg-gradient-to-r from-temple-purple to-temple-gold text-white'
                    : isDark ? 'bg-white/5' : 'bg-gray-100'
                }`}
              >
                <p className={`text-xs font-medium ${
                  isToday(day) ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {day.toLocaleDateString('en', { weekday: 'short' })}
                </p>
                <p className={`text-lg font-bold ${
                  isToday(day) ? 'text-white' : isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  {day.getDate()}
                </p>
              </div>
            ))}
          </div>

          {/* Meal Rows */}
          {mealTypes.map((mealType) => {
            const Icon = mealType.icon
            return (
              <div key={mealType.id} className="grid grid-cols-8 gap-2 mb-2">
                {/* Meal Type Label */}
                <div className={`p-3 rounded-xl flex items-center gap-2 ${
                  isDark ? 'bg-white/5' : 'bg-gray-100'
                }`}>
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {mealType.label}
                  </span>
                </div>
                
                {/* Day Slots */}
                {weekDays.map((day, i) => {
                  const meal = getMealForSlot(day, mealType.id)
                  const dateStr = day.toISOString().split('T')[0]
                  
                  return (
                    <div 
                      key={i}
                      className={`min-h-[80px] rounded-xl border-2 border-dashed transition-all ${
                        meal 
                          ? isDark 
                            ? 'border-green-500/30 bg-green-500/10' 
                            : 'border-green-300 bg-green-50'
                          : isDark 
                            ? 'border-gray-700 hover:border-gray-600' 
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {meal ? (
                        <div className="p-2 h-full flex flex-col">
                          <div className="flex items-start justify-between gap-1">
                            <p className={`text-xs font-medium line-clamp-2 flex-1 ${
                              isDark ? 'text-white' : 'text-gray-800'
                            }`}>
                              {meal.recipe?.title || meal.custom_meal}
                            </p>
                            <button
                              onClick={() => handleRemoveMeal(meal.id, dateStr, mealType.id)}
                              className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          {meal.recipe && (
                            <p className="text-xs text-gray-500 mt-auto">
                              {meal.recipe.prep_time}
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAddModal({ date: dateStr, mealType: mealType.id })}
                          className="w-full h-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Meal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Add Meal
              </h3>
              <button onClick={() => setShowAddModal(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Tabs for Saved vs Library */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setRecipeSource('saved')}
                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  recipeSource === 'saved'
                    ? 'text-temple-purple border-b-2 border-temple-purple bg-temple-purple/5'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Heart className="w-4 h-4" />
                My Saved ({recipes.length})
              </button>
              <button
                onClick={() => setRecipeSource('library')}
                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  recipeSource === 'library'
                    ? 'text-temple-gold border-b-2 border-temple-gold bg-temple-gold/5'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Library ({libraryRecipes.length})
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {recipeSource === 'saved' ? (
                recipes.length === 0 ? (
                  <div className="text-center py-8">
                    <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No saved recipes yet</p>
                    <p className="text-sm text-gray-400">Generate and save recipes first!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recipes.map((recipe) => (
                      <button
                        key={recipe.id}
                        onClick={() => handleAddMeal(showAddModal.date, showAddModal.mealType, recipe.id, 'saved')}
                        className={`w-full p-4 rounded-xl text-left transition-all ${
                          isDark 
                            ? 'bg-white/5 hover:bg-white/10 border border-white/10' 
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {recipe.title}
                          </p>
                          <Heart className="w-4 h-4 text-pink-500 fill-pink-500 flex-shrink-0" />
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {recipe.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>Prep: {recipe.prep_time}</span>
                          <span>Cook: {recipe.cook_time}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                libraryRecipes.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No library recipes found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {libraryRecipes.map((recipe) => (
                      <button
                        key={recipe.id}
                        onClick={() => handleAddMeal(showAddModal.date, showAddModal.mealType, recipe.id, 'library')}
                        className={`w-full p-4 rounded-xl text-left transition-all ${
                          isDark 
                            ? 'bg-white/5 hover:bg-white/10 border border-white/10' 
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {recipe.title}
                          </p>
                          <BookOpen className="w-4 h-4 text-temple-gold flex-shrink-0" />
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {recipe.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>Prep: {recipe.prep_time}</span>
                          <span>Cook: {recipe.cook_time}</span>
                          {recipe.average_rating > 0 && (
                            <span className="flex items-center gap-1 text-yellow-500">
                              ★ {recipe.average_rating?.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shopping List Modal */}
      {showShoppingList && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <ShoppingCart className="w-5 h-5" />
                Shopping List
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyShoppingList}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={() => setShowShoppingList(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {shoppingList.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No ingredients this week</p>
                  <p className="text-sm text-gray-400">Add meals to your plan first!</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {shoppingList.map((item, i) => (
                    <li 
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        isDark ? 'bg-white/5' : 'bg-gray-50'
                      }`}
                    >
                      <div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600" />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Recipe Modal (from RecipeLibrary navigation) */}
      {quickAddRecipe && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl w-full max-w-md overflow-hidden ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Add to Meal Plan
                </h3>
                <button onClick={() => setQuickAddRecipe(null)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {quickAddRecipe.title}
                </p>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                  {quickAddRecipe.description}
                </p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Day
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuickAddRecipe(prev => ({ ...prev, selectedDay: day.toISOString().split('T')[0] }))}
                      className={`p-2 text-center rounded-lg text-xs transition-all ${
                        quickAddRecipe.selectedDay === day.toISOString().split('T')[0]
                          ? 'bg-temple-purple text-white'
                          : isDark 
                            ? 'bg-white/5 hover:bg-white/10 text-gray-300' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="font-medium">{day.toLocaleDateString('en', { weekday: 'short' })}</div>
                      <div>{day.getDate()}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Meal Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {mealTypes.map((meal) => {
                    const MealIcon = meal.icon
                    return (
                      <button
                        key={meal.id}
                        onClick={() => setQuickAddRecipe(prev => ({ ...prev, selectedMeal: meal.id }))}
                        className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                          quickAddRecipe.selectedMeal === meal.id
                            ? 'bg-temple-purple text-white'
                            : isDark 
                              ? 'bg-white/5 hover:bg-white/10 text-gray-300' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <MealIcon className="w-5 h-5" />
                        <span className="text-xs">{meal.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <button
                onClick={async () => {
                  if (quickAddRecipe.selectedDay && quickAddRecipe.selectedMeal) {
                    await handleAddMeal(quickAddRecipe.selectedDay, quickAddRecipe.selectedMeal, quickAddRecipe.id, 'library')
                    setQuickAddRecipe(null)
                  }
                }}
                disabled={!quickAddRecipe.selectedDay || !quickAddRecipe.selectedMeal}
                className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  quickAddRecipe.selectedDay && quickAddRecipe.selectedMeal
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-5 h-5" />
                Add to Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MealPlanner