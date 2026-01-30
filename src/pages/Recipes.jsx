import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext-minimal'
import { generateRecipe } from '../lib/gemini'
import { saveRecipe, publishRecipe, incrementUserStat } from '../lib/supabase'
import { useTheme } from '../contexts/ThemeContext'
import { 
  ChefHat, 
  Sparkles, 
  Clock, 
  Users, 
  Heart,
  Loader2,
  Save,
  RefreshCw,
  CheckCircle,
  UtensilsCrossed,
  Flame,
  Leaf,
  Zap,
  Minus,
  Plus
} from 'lucide-react'

// Helper function to scale ingredient quantities
const scaleIngredient = (ingredient, multiplier) => {
  if (multiplier === 1) return ingredient
  
  // Match patterns like "1 cup", "2.5 tbsp", "1/2 cup", "1 1/2 cups"
  const patterns = [
    // Mixed numbers: "1 1/2 cups"
    /^(\d+)\s+(\d+)\/(\d+)\s+(.+)$/,
    // Fractions: "1/2 cup"
    /^(\d+)\/(\d+)\s+(.+)$/,
    // Decimals and whole numbers: "2.5 cups" or "2 cups"
    /^([\d.]+)\s+(.+)$/
  ]
  
  // Try mixed number pattern first
  let match = ingredient.match(patterns[0])
  if (match) {
    const whole = parseFloat(match[1])
    const num = parseFloat(match[2])
    const denom = parseFloat(match[3])
    const rest = match[4]
    const originalValue = whole + (num / denom)
    const newValue = originalValue * multiplier
    return formatNumber(newValue) + ' ' + rest
  }
  
  // Try fraction pattern
  match = ingredient.match(patterns[1])
  if (match) {
    const num = parseFloat(match[1])
    const denom = parseFloat(match[2])
    const rest = match[3]
    const originalValue = num / denom
    const newValue = originalValue * multiplier
    return formatNumber(newValue) + ' ' + rest
  }
  
  // Try decimal/whole number pattern
  match = ingredient.match(patterns[2])
  if (match) {
    const originalValue = parseFloat(match[1])
    const rest = match[2]
    const newValue = originalValue * multiplier
    return formatNumber(newValue) + ' ' + rest
  }
  
  return ingredient
}

// Format number to nice display (avoid ugly decimals)
const formatNumber = (num) => {
  if (num === Math.floor(num)) return num.toString()
  
  // Common fractions
  const fractions = [
    { value: 0.25, display: '1/4' },
    { value: 0.33, display: '1/3' },
    { value: 0.5, display: '1/2' },
    { value: 0.67, display: '2/3' },
    { value: 0.75, display: '3/4' }
  ]
  
  const whole = Math.floor(num)
  const decimal = num - whole
  
  for (const frac of fractions) {
    if (Math.abs(decimal - frac.value) < 0.05) {
      return whole > 0 ? `${whole} ${frac.display}` : frac.display
    }
  }
  
  return num.toFixed(1).replace(/\.0$/, '')
}

const Recipes = () => {
  const { user, refreshUserData, profile } = useAuth()
  const { isDark } = useTheme()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [published, setPublished] = useState(false)
  const [recipe, setRecipe] = useState(null)
  const [error, setError] = useState('')
  const [servingMultiplier, setServingMultiplier] = useState(1)
  
  const [preferences, setPreferences] = useState({
    mealType: 'dinner',
    cuisinePreference: '',
    dietaryRestrictions: [],
    ingredients: '',
    healthGoals: '',
    feelLikeEating: '',
    excludeIngredients: '',
    prepTimeRange: ''
  })

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { id: 'lunch', label: 'Lunch', icon: '☀️' },
    { id: 'dinner', label: 'Dinner', icon: '🌙' },
    { id: 'snack', label: 'Snack', icon: '🍎' },
    { id: 'dessert', label: 'Healthy Dessert', icon: '🍰' }
  ]

  const dietaryOptions = [
    'Daniel Diet',
    'Vegetarian',
    'Vegan',
    'Pescatarian',
    'Gluten-Free',
    'Dairy-Free',
    'Low-Carb',
    'Keto',
    'Paleo',
    'Whole30',
    'Low-FODMAP',
    'Sugar-Free',
    'High-Protein',
    'Nut-Free',
    'Halal',
    'Kosher'
  ]

  const cuisineOptions = [
    'Mediterranean',
    'Asian',
    'Mexican',
    'Italian',
    'Middle Eastern',
    'Indian',
    'American',
    'Caribbean'
  ]

  // Initialize preferences from user profile
  useEffect(() => {
    if (profile?.dietary_preferences?.length > 0) {
      setPreferences(prev => ({
        ...prev,
        dietaryRestrictions: profile.dietary_preferences
      }))
    }
  }, [profile])

  const handleDietaryChange = (option) => {
    setPreferences(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(option)
        ? prev.dietaryRestrictions.filter(d => d !== option)
        : [...prev.dietaryRestrictions, option]
    }))
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setSaved(false)
    setPublished(false)
    setServingMultiplier(1) // Reset serving size when generating new recipe

    try {
      const result = await generateRecipe({
        mealType: preferences.mealType,
        dietary: preferences.dietaryRestrictions,
        cuisine: preferences.cuisinePreference,
        ingredients: preferences.ingredients,
        healthGoals: preferences.healthGoals,
        feelLikeEating: preferences.feelLikeEating,
        excludeIngredients: preferences.excludeIngredients,
        prepTimeRange: preferences.prepTimeRange
      })
      
      if (result.error) {
        setError(result.error)
      } else if (result.recipe) {
        setRecipe(result.recipe)
      }
    } catch (err) {
      console.error('Generation error:', err)
      setError('Failed to generate recipe. Please try again.')
    }

    setLoading(false)
  }

  const handleSave = async () => {
    console.log('🔵 Save button clicked')
    
    if (!user) {
      console.error('❌ No user found')
      alert('You must be logged in to save recipes')
      return
    }
    
    if (!recipe) {
      console.error('❌ No recipe to save')
      alert('Generate a recipe first')
      return
    }

    console.log('📦 Saving recipe for user:', user.id)
    console.log('📋 Recipe data:', recipe)
    
    setSaving(true)
    try {
      console.log('💾 Calling saveRecipe...')
      console.log('Recipe data:', recipe)
      const savedRecipe = await saveRecipe(user.id, recipe)
      console.log('✅ Recipe saved:', savedRecipe)
      
      console.log('📊 Incrementing stats...')
      // Increment the recipes_saved stat and add 10 points
      const updatedStats = await incrementUserStat(user.id, 'recipes_saved', 10)
      console.log('✅ Stats incremented:', updatedStats)
      
      // Refresh stats in UI
      console.log('🔄 Refreshing user data...')
      await refreshUserData()
      
      setSaved(true)
      console.log('✅ Recipe saved and stats updated!')
      alert('Recipe saved successfully!')
    } catch (error) {
      console.error('❌ Failed to save recipe:', error)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      console.error('Error details:', JSON.stringify(error, null, 2))
      alert('Failed to save recipe: ' + error.message)
    }
    setSaving(false)
  }

  const handlePublishRecipe = async () => {
    if (!user) {
      toast.error('You must be logged in to publish recipes')
      return
    }

    if (!recipe) {
      toast.error('Generate a recipe first')
      return
    }

    setPublishing(true)
    try {
      const recipeToPublish = {
        ...recipe,
        author_name: profile?.full_name || 'Anonymous',
        mealType: preferences.mealType,
        dietaryTags: preferences.dietaryRestrictions
      }
      
      await publishRecipe(user.id, recipeToPublish)
      setPublished(true)
      toast.success('Recipe submitted for approval! Once approved, it will appear in the recipe library.')
    } catch (error) {
      console.error('❌ Failed to publish recipe:', error)
      toast.error('Failed to publish recipe: ' + error.message)
    }
    setPublishing(false)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className={`text-3xl md:text-4xl font-display font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          AI Recipe Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create faith-inspired, healthy recipes tailored to your needs
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Preferences Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card-strong rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              <UtensilsCrossed className={`w-5 h-5 ${isDark ? 'text-temple-gold' : 'text-temple-purple'}`} />
              Meal Type
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {mealTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setPreferences(prev => ({ ...prev, mealType: type.id }))}
                  className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${
                    preferences.mealType === type.id
                      ? 'bg-gradient-to-r from-temple-purple to-temple-purple-dark text-white shadow-lg'
                      : isDark 
                        ? 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10' 
                        : 'bg-white/50 text-gray-600 hover:bg-white'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card-strong rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              <Leaf className="w-5 h-5 text-green-500" />
              Dietary Preferences
            </h2>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleDietaryChange(option)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    preferences.dietaryRestrictions.includes(option)
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                      : isDark
                        ? 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                        : 'bg-white/50 text-gray-600 hover:bg-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card-strong rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              <Flame className="w-5 h-5 text-orange-500" />
              Cuisine Style
            </h2>
            <select
              value={preferences.cuisinePreference}
              onChange={(e) => setPreferences(prev => ({ ...prev, cuisinePreference: e.target.value }))}
              className="glass-input w-full"
            >
              <option value="">Any cuisine</option>
              {cuisineOptions.map((cuisine) => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
          </div>

          <div className="glass-card-strong rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Additional Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="form-label">What do you feel like eating?</label>
                <input
                  type="text"
                  value={preferences.feelLikeEating}
                  onChange={(e) => setPreferences(prev => ({ ...prev, feelLikeEating: e.target.value }))}
                  className="glass-input w-full"
                  placeholder="e.g., something creamy, spicy, comfort food"
                />
              </div>
              <div>
                <label className="form-label">Ingredients to include</label>
                <input
                  type="text"
                  value={preferences.ingredients}
                  onChange={(e) => setPreferences(prev => ({ ...prev, ingredients: e.target.value }))}
                  className="glass-input w-full"
                  placeholder="e.g., chicken, spinach, tomatoes"
                />
              </div>
              <div>
                <label className="form-label">Ingredients to exclude</label>
                <input
                  type="text"
                  value={preferences.excludeIngredients}
                  onChange={(e) => setPreferences(prev => ({ ...prev, excludeIngredients: e.target.value }))}
                  className="glass-input w-full"
                  placeholder="e.g., mushrooms, cilantro, onions"
                />
              </div>
              <div>
                <label className="form-label">Time to prepare</label>
                <select
                  value={preferences.prepTimeRange}
                  onChange={(e) => setPreferences(prev => ({ ...prev, prepTimeRange: e.target.value }))}
                  className="glass-input w-full"
                >
                  <option value="">Any time</option>
                  <option value="quick">Quick (under 20 min)</option>
                  <option value="medium">Medium (20-40 min)</option>
                  <option value="relaxed">Relaxed (40-60 min)</option>
                  <option value="long">Long (over 60 min)</option>
                </select>
              </div>
              <div>
                <label className="form-label">Health goals</label>
                <input
                  type="text"
                  value={preferences.healthGoals}
                  onChange={(e) => setPreferences(prev => ({ ...prev, healthGoals: e.target.value }))}
                  className="glass-input w-full"
                  placeholder="e.g., weight loss, energy boost, gut health"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating your recipe...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Recipe</span>
              </>
            )}
          </button>
        </div>

        {/* Recipe Display */}
        <div className="lg:col-span-3">
          {error && (
            <div className={`rounded-xl p-4 mb-6 ${
              isDark 
                ? 'bg-red-500/10 border border-red-500/30 text-red-400' 
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              {error}
            </div>
          )}

          {!recipe && !loading && (
            <div className="glass-card rounded-3xl p-12 text-center animate-fade-in">
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                isDark 
                  ? 'bg-gradient-to-br from-temple-purple/30 to-temple-gold/20' 
                  : 'bg-gradient-to-br from-temple-purple/10 to-temple-gold/5'
              }`}>
                <ChefHat className={`w-12 h-12 ${isDark ? 'text-temple-gold' : 'text-temple-purple'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Ready to Cook Something Amazing?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Set your preferences and let our AI create a faith-inspired, healthy recipe just for you!
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-card rounded-3xl p-12 text-center animate-fade-in">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse ${
                isDark 
                  ? 'bg-gradient-to-br from-temple-purple to-temple-gold shadow-lg shadow-temple-purple/30' 
                  : 'bg-gradient-to-br from-temple-purple to-temple-purple-dark'
              }`}>
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Crafting Your Recipe...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Adding a sprinkle of faith and a dash of nutrition! ✨
              </p>
            </div>
          )}

          {recipe && !loading && (
            <div className="glass-card-strong rounded-3xl overflow-hidden animate-fade-in">
              {/* Recipe Header */}
              <div className={`p-8 text-white ${
                isDark 
                  ? 'bg-gradient-to-r from-temple-purple to-temple-purple-dark' 
                  : 'bg-gradient-to-r from-temple-purple to-temple-purple-dark'
              }`}>
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
                  {recipe.title}
                </h2>
                <p className="text-white/90">{recipe.description}</p>
                
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Prep: {recipe.prepTime}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm">Cook: {recipe.cookTime}</span>
                  </div>
                  {/* Adjustable Servings */}
                  <div className="flex items-center gap-2 bg-white/20 rounded-lg px-2 py-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Serves:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setServingMultiplier(Math.max(0.5, servingMultiplier - 0.5))}
                        className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold min-w-[3rem] text-center">
                        {Math.round(parseInt(recipe.servings) * servingMultiplier)}
                      </span>
                      <button
                        onClick={() => setServingMultiplier(Math.min(4, servingMultiplier + 0.5))}
                        className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Health Benefits Section */}
                {recipe.benefits && recipe.benefits.length > 0 && (
                  <div className={`rounded-2xl p-6 ${
                    isDark 
                      ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20' 
                      : 'bg-gradient-to-r from-green-50 to-emerald-50'
                  }`}>
                    <div className="flex items-start gap-4">
                      <Heart className={`w-6 h-6 flex-shrink-0 mt-1 ${
                        isDark ? 'text-green-400' : 'text-green-600'
                      }`} />
                      <div className="flex-1">
                        <p className={`text-lg font-semibold mb-3 ${
                          isDark ? 'text-green-400' : 'text-green-700'
                        }`}>Health Benefits</p>
                        <ul className="space-y-2">
                          {recipe.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Sparkles className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                isDark ? 'text-green-400' : 'text-green-500'
                              }`} />
                              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ingredients */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Ingredients
                    </h3>
                    {servingMultiplier !== 1 && (
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        isDark ? 'bg-temple-gold/20 text-temple-gold' : 'bg-temple-purple/10 text-temple-purple'
                      }`}>
                        Adjusted for {Math.round(parseInt(recipe.servings) * servingMultiplier)} servings
                      </span>
                    )}
                  </div>
                  <ul className="grid md:grid-cols-2 gap-2">
                    {recipe.ingredients?.map((ingredient, idx) => (
                      <li key={idx} className={`flex items-center gap-3 p-3 rounded-xl ${
                        isDark ? 'bg-white/5 border border-white/10' : 'bg-white/50'
                      }`}>
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-temple-purple to-temple-gold" />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                          {scaleIngredient(ingredient, servingMultiplier)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Instructions
                  </h3>
                  <ol className="space-y-4">
                    {recipe.instructions?.map((step, idx) => (
                      <li key={idx} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-temple-purple to-temple-purple-dark text-white flex items-center justify-center flex-shrink-0 text-sm font-medium shadow-lg">
                          {idx + 1}
                        </div>
                        <p className={`pt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Nutrition Info */}
                {recipe.nutritionInfo && (
                  <div className={`rounded-2xl p-6 ${
                    isDark 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-green-50'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Nutrition (per serving)
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-500">{recipe.nutritionInfo.calories}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Calories</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-500">{recipe.nutritionInfo.protein}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Protein</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-500">{recipe.nutritionInfo.carbs}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Carbs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-500">{recipe.nutritionInfo.fiber}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Fiber</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Micronutrients Breakdown */}
                {recipe.micronutrients && Object.keys(recipe.micronutrients).length > 0 && (
                  <div className={`rounded-2xl p-6 ${
                    isDark 
                      ? 'bg-blue-500/10 border border-blue-500/20' 
                      : 'bg-blue-50'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      <Zap className="w-5 h-5 text-blue-500" />
                      Micronutrients
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(recipe.micronutrients).map(([nutrient, value]) => (
                        <div key={nutrient} className={`p-3 rounded-xl ${
                          isDark ? 'bg-white/5' : 'bg-white/70'
                        }`}>
                          <p className="text-sm font-medium text-blue-500 capitalize">{nutrient.replace(/_/g, ' ')}</p>
                          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving || saved}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      saved
                        ? isDark 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-green-100 text-green-700'
                        : 'btn-primary'
                    }`}
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : saved ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    <span>{saved ? 'Saved! +10 pts' : 'Save Recipe'}</span>
                  </button>

                  <button
                    onClick={handlePublishRecipe}
                    disabled={publishing || published}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      published
                        ? isDark 
                          ? 'bg-temple-gold/20 text-temple-gold border border-temple-gold/30'
                          : 'bg-temple-gold/20 text-temple-gold'
                        : 'btn-secondary'
                    }`}
                  >
                    {publishing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : published ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                    <span>{published ? 'Submitted for Approval!' : 'Publish to Library'}</span>
                  </button>
                  
                  <button
                    onClick={handleGenerate}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Generate Another</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Recipes