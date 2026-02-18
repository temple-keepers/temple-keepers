import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useRecipes } from '../hooks/useRecipes'
import { mealPlanService } from '../services/mealPlanService'
import { scaleIngredients, generateRecipeImage } from '../lib/recipeAI'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import { ArrowLeft, Clock, Users, Heart, ChefHat, CalendarPlus, X, Plus, ArrowRightLeft, ImageIcon } from 'lucide-react'

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

  const [generatingImage, setGeneratingImage] = useState(false)

  // Add to meal plan state
  const [showMealPlanModal, setShowMealPlanModal] = useState(false)
  const [mealPlans, setMealPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedMealType, setSelectedMealType] = useState('dinner')
  const [addingToPlan, setAddingToPlan] = useState(false)

  // AI-powered ingredient scaling
  const [aiIngredients, setAiIngredients] = useState(null)
  const [aiScaling, setAiScaling] = useState(false)
  const aiCacheRef = useRef({})

  useEffect(() => {
    if (!recipe || servings === originalServings) {
      setAiIngredients(null)
      setAiScaling(false)
      return
    }
    // Check cache first
    if (aiCacheRef.current[servings]) {
      setAiIngredients(aiCacheRef.current[servings])
      return
    }
    setAiScaling(true)
    const timer = setTimeout(() => {
      scaleIngredients(recipe.ingredients, originalServings, servings)
        .then(scaled => {
          if (scaled) {
            aiCacheRef.current[servings] = scaled
            setAiIngredients(scaled)
          }
        })
        .finally(() => setAiScaling(false))
    }, 600)
    return () => clearTimeout(timer)
  }, [servings, originalServings, recipe])

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

  // Convert a decimal to the nearest kitchen-friendly fraction
  const toKitchenFraction = (value) => {
    if (value <= 0) return '0'

    const whole = Math.floor(value)
    const frac = value - whole

    const fractions = [
      { d: 0,     s: '' },
      { d: 0.125, s: '⅛' },
      { d: 0.25,  s: '¼' },
      { d: 0.333, s: '⅓' },
      { d: 0.5,   s: '½' },
      { d: 0.667, s: '⅔' },
      { d: 0.75,  s: '¾' },
      { d: 1,     s: '' },
    ]

    let closest = fractions[0]
    let minDiff = Infinity
    for (const f of fractions) {
      const diff = Math.abs(frac - f.d)
      if (diff < minDiff) { minDiff = diff; closest = f }
    }

    let w = whole + (closest.d === 1 ? 1 : 0)
    const fs = closest.d === 1 ? '' : closest.s

    if (w === 0 && fs) return fs
    if (w > 0 && fs) return `${w} ${fs}`
    return w.toString()
  }

  // Calculate adjusted ingredient amounts with kitchen-friendly output
  const adjustIngredientAmount = (amount, unit = '') => {
    if (!amount || isNaN(parseFloat(amount))) return amount

    const multiplier = servings / originalServings
    const adjusted = parseFloat(amount) * multiplier

    // Countable / whole items — round to nearest whole number (min 1)
    const isWholeItem = /\b(medium|large|small|cloves?|whole|cans?|heads?|bunch|bunches|stalks?|sprigs?|slices?|pieces?|fillets?|breasts?|thighs?|drumsticks?|eggs?|links?|sheets?|leaves|leaf)\b/i.test(unit)

    if (isWholeItem) {
      return Math.max(1, Math.round(adjusted)).toString()
    }

    // Large values (>10): round to whole number
    if (adjusted >= 10) return Math.round(adjusted).toString()

    // Use kitchen-friendly fractions for measurable amounts
    return toKitchenFraction(adjusted)
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

      {/* Hero Image */}
      {recipe.image_urls && recipe.image_urls.length > 0 ? (
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-[4/3] sm:aspect-[16/9] bg-gray-200 dark:bg-gray-700">
            <img
              src={recipe.image_urls[0]}
              alt={recipe.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <button
            disabled={generatingImage}
            onClick={async () => {
              setGeneratingImage(true)
              toast.loading('\ud83d\udcf8 Generating image...', { id: 'gen-img' })
              try {
                const result = await generateRecipeImage(
                  recipe.id, recipe.title, recipe.description,
                  recipe.meal_type, recipe.cuisine
                )
                if (result.success) {
                  toast.success('Image generated!', { id: 'gen-img' })
                  setRecipe(prev => ({ ...prev, image_urls: [result.imageUrl] }))
                } else {
                  toast.error(`Image failed: ${result.error}`, { id: 'gen-img', duration: 5000 })
                }
              } catch (err) {
                toast.error(`Image error: ${err.message}`, { id: 'gen-img', duration: 5000 })
              }
              setGeneratingImage(false)
            }}
            className="w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 aspect-[4/3] sm:aspect-[16/9] flex flex-col items-center justify-center gap-3 hover:border-temple-purple dark:hover:border-temple-gold transition-colors"
          >
            {generatingImage ? (
              <>
                <div className="spinner w-8 h-8"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Generating image...</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-10 h-10 text-gray-400" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Generate AI Image</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white leading-tight">
              {recipe.title}
            </h1>
            <div className="flex items-center gap-2 flex-shrink-0 pt-1">
            <button
              onClick={() => {
                const msg = `Check out this healthy recipe on Temple Keepers:\n\n*${recipe.title}*\n${recipe.description ? `\n${recipe.description.slice(0, 100)}...` : ''}\n\nEvery recipe comes with scripture, nutrition info & healthy ingredient swaps.\n\nhttps://templekeepers.app/signup`
                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
              }}
              className="p-3 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors flex-shrink-0"
              title="Share on WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </button>
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
          {recipe.description && (
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              {recipe.description}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
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
                  {aiScaling && <span className="ml-1 w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
                </p>
              )}
              <ul className="space-y-2">
                {(aiIngredients || recipe.ingredients).map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-temple-purple/10 dark:bg-temple-gold/10 flex items-center justify-center text-xs font-semibold text-temple-purple dark:text-temple-gold">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">
                        {aiIngredients ? ingredient.amount : adjustIngredientAmount(ingredient.amount, ingredient.unit)} {ingredient.unit}
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
                      {instruction.instruction || instruction.text}
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

            {/* Healthy Swaps */}
            {(() => {
              // Parse healthy swaps from notes field
              const swapsMatch = recipe.notes?.match(/---HEALTHY_SWAPS---(.*)/s)
              if (!swapsMatch) return null
              try {
                const swaps = JSON.parse(swapsMatch[1])
                if (!swaps || swaps.length === 0) return null
                return (
                  <div className="glass-card p-6 bg-green-50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-800/30">
                    <div className="flex items-center gap-2 mb-4">
                      <ArrowRightLeft className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Healthy Swaps
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Common ingredient swaps to make this dish even healthier
                    </p>
                    <div className="space-y-3">
                      {swaps.map((swap, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/70 dark:bg-gray-800/50">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <span className="text-xs">❌</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-red-600 dark:text-red-400 line-through">
                                {swap.commonIngredient}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                                {swap.healthyAlternative}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {swap.reason}
                            </p>
                          </div>
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="text-xs">✅</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              } catch { return null }
            })()}

            {/* Notes (without the swaps JSON) */}
            {recipe.notes && (() => {
              const cleanNotes = recipe.notes.replace(/---HEALTHY_SWAPS---.*/s, '').trim()
              if (!cleanNotes) return null
              return (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Notes
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {cleanNotes}
                  </p>
                </div>
              )
            })()}
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
