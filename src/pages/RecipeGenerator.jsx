import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateRecipe, generateRecipeImage } from '../lib/recipeAI'
import { useRecipes } from '../hooks/useRecipes'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import { Sparkles, Clock, Users, ChefHat, Check, BookOpen, ArrowLeft, ArrowRight, Save } from 'lucide-react'

export const RecipeGenerator = () => {
  const navigate = useNavigate()
  const { createRecipe } = useRecipes()

  const [mealType, setMealType] = useState('dinner')
  const [cuisine, setCuisine] = useState('any')
  const [cookingTime, setCookingTime] = useState(30)
  const [servings, setServings] = useState(4)
  const [recipeCount, setRecipeCount] = useState(1)
  const [dietaryRestrictions, setDietaryRestrictions] = useState([])
  const [craving, setCraving] = useState('')
  const [includeIngredients, setIncludeIngredients] = useState('')
  const [excludeIngredients, setExcludeIngredients] = useState('')

  const [generating, setGenerating] = useState(false)
  const [generatedRecipes, setGeneratedRecipes] = useState([])
  const [activeRecipeIndex, setActiveRecipeIndex] = useState(0)
  const [savedIndexes, setSavedIndexes] = useState(new Set())
  const [savingIndex, setSavingIndex] = useState(null)

  const dietaryOptions = [
    'daniel-fast',
    'vegetarian', 'vegan', 'pescatarian', 'gluten-free', 'dairy-free',
    'nut-free', 'low-carb', 'keto', 'paleo', 'whole-foods', 'mediterranean', 'low-sodium'
  ]

  const cuisineOptions = [
    'any', 'american', 'italian', 'mexican', 'asian',
    'mediterranean', 'indian', 'middle-eastern', 'caribbean', 'african'
  ]

  const mealTypeOptions = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Healthy Snack' },
    { value: 'dessert', label: 'Healthy Dessert' }
  ]

  const toggleDietary = (option) => {
    setDietaryRestrictions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    )
  }

  const parseIngredientList = (value) => value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)

  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedRecipes([])
    setSavedIndexes(new Set())
    setActiveRecipeIndex(0)

    const mealTypeLabel = mealTypeOptions.find(option => option.value === mealType)?.label || mealType
    const results = []

    for (let i = 0; i < recipeCount; i++) {
      toast.loading(`Generating recipe ${i + 1} of ${recipeCount}...`, { id: 'gen-progress' })

      const { success, recipe, error } = await generateRecipe({
        mealType: mealTypeLabel.toLowerCase(),
        dietaryRestrictions,
        cuisine,
        cookingTime,
        servings,
        includeIngredients: parseIngredientList(includeIngredients),
        excludeIngredients: parseIngredientList(excludeIngredients),
        previousRecipeTitles: results.map(r => r.title),
        craving: craving.trim()
      })

      if (success) {
        results.push(recipe)
        setGeneratedRecipes([...results])
      } else {
        toast.error(`Recipe ${i + 1} failed: ${error}`)
      }
    }

    toast.dismiss('gen-progress')

    if (results.length > 0) {
      toast.success(`${results.length} recipe${results.length > 1 ? 's' : ''} generated! 🙏`)
    }

    setGenerating(false)
  }

  const handleSave = async (index) => {
    const recipe = generatedRecipes[index]
    if (!recipe || savedIndexes.has(index)) return

    setSavingIndex(index)

    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert']
    let saveMealType = mealType
    if (!validMealTypes.includes(saveMealType)) saveMealType = 'snack'

    const rawDifficulty = recipe.difficulty || 'Easy'
    const normalizedDifficulty = rawDifficulty.charAt(0).toUpperCase() + rawDifficulty.slice(1).toLowerCase()
    const validDifficulties = ['Easy', 'Medium', 'Hard']
    const difficulty = validDifficulties.includes(normalizedDifficulty) ? normalizedDifficulty : 'Easy'

    const recipeData = {
      title: recipe.title,
      description: recipe.description,
      meal_type: saveMealType,
      cuisine: recipe.cuisine || cuisine,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      total_time: recipe.total_time,
      servings: recipe.servings,
      difficulty,
      dietary_tags: recipe.dietary_tags || [],
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      nutrition: recipe.nutrition,
      tips: recipe.tips || [],
      notes: recipe.notes || '',
      // Store healthy swaps in notes as a JSON section if present
      ...(recipe.healthySwaps && recipe.healthySwaps.length > 0 ? {
        notes: (recipe.notes || '') + (recipe.notes ? '\n\n' : '') + '---HEALTHY_SWAPS---' + JSON.stringify(recipe.healthySwaps)
      } : {})
    }

    const { data, error } = await createRecipe(recipeData)

    if (!error && data) {
      setSavedIndexes(prev => new Set([...prev, index]))
      toast.success(`"${recipe.title}" saved! 🙏`)

      // Generate image in the background (don't block the user)
      toast.loading('📸 Generating image...', { id: `img-${data.id}` })
      generateRecipeImage(
        data.id,
        recipe.title,
        recipe.description,
        saveMealType,
        recipe.cuisine || cuisine
      ).then(result => {
        if (result.success) {
          toast.success(`📸 Image generated for "${recipe.title}"`, { id: `img-${data.id}`, duration: 3000 })
        } else {
          toast.error(`Image failed: ${result.error}`, { id: `img-${data.id}`, duration: 5000 })
        }
      }).catch((err) => {
        toast.error(`Image error: ${err.message || err}`, { id: `img-${data.id}`, duration: 5000 })
      })
    } else {
      console.error('Save error:', error)
      toast.error(`Failed to save: ${error?.message || 'Unknown error'}`)
    }

    setSavingIndex(null)
  }

  const handleSaveAll = async () => {
    for (let i = 0; i < generatedRecipes.length; i++) {
      if (!savedIndexes.has(i)) {
        await handleSave(i)
      }
    }
  }

  const activeRecipe = generatedRecipes[activeRecipeIndex]
  const allSaved = generatedRecipes.length > 0 && savedIndexes.size === generatedRecipes.length

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
      <AppHeader title="AI Recipe Generator" showBackButton={true} backTo="/recipes" />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Create custom healthy recipes powered by AI
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Generator Form */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                Recipe Settings
              </h2>

              {/* Craving / Mood */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What do you feel like eating today?
                </label>
                <input
                  type="text"
                  value={craving}
                  onChange={(e) => setCraving(e.target.value)}
                  placeholder="e.g., something warm and comforting, a light summer salad, spicy noodles..."
                  className="form-input"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Optional — describe your mood or craving and the AI will tailor the recipe
                </p>
              </div>

              {/* Meal Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meal Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {mealTypeOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setMealType(option.value)}
                      className={`
                        px-4 py-2 rounded-lg font-medium transition-colors
                        ${mealType === option.value
                          ? 'bg-temple-purple dark:bg-temple-gold text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuisine */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cuisine
                </label>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="form-input capitalize"
                >
                  {cuisineOptions.map(c => (
                    <option key={c} value={c} className="capitalize">{c}</option>
                  ))}
                </select>
              </div>

              {/* Time, Servings & Count */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Max Time
                  </label>
                  <input
                    type="number"
                    value={cookingTime}
                    onChange={(e) => setCookingTime(parseInt(e.target.value))}
                    min="15"
                    max="120"
                    step="15"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Servings
                  </label>
                  <input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value))}
                    min="1"
                    max="12"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Recipes
                  </label>
                  <select
                    value={recipeCount}
                    onChange={(e) => setRecipeCount(parseInt(e.target.value))}
                    className="form-input"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dietary Restrictions */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dietary Restrictions
                </label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => toggleDietary(option)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors
                        ${dietaryRestrictions.includes(option)
                          ? 'bg-temple-purple dark:bg-temple-gold text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredient Preferences */}
              <div className="grid gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ingredients to Include (comma separated)
                  </label>
                  <input
                    type="text"
                    value={includeIngredients}
                    onChange={(e) => setIncludeIngredients(e.target.value)}
                    placeholder="e.g., salmon, spinach, garlic"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ingredients to Exclude (comma separated)
                  </label>
                  <input
                    type="text"
                    value={excludeIngredients}
                    onChange={(e) => setExcludeIngredients(e.target.value)}
                    placeholder="e.g., peanuts, dairy, sugar"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="spinner w-5 h-5"></div>
                    <span>Generating {recipeCount > 1 ? `${recipeCount} Recipes` : 'Recipe'}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate {recipeCount > 1 ? `${recipeCount} Recipes` : 'Recipe'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Recipe Preview */}
          <div>
            {generatedRecipes.length > 0 && activeRecipe ? (
              <div className="space-y-4">
                {/* Recipe Navigation (multi-recipe) */}
                {generatedRecipes.length > 1 && (
                  <div className="glass-card p-3">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setActiveRecipeIndex(Math.max(0, activeRecipeIndex - 1))}
                        disabled={activeRecipeIndex === 0}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-2">
                        {generatedRecipes.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveRecipeIndex(i)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                              ${i === activeRecipeIndex
                                ? 'bg-temple-purple dark:bg-temple-gold text-white scale-110'
                                : savedIndexes.has(i)
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }
                            `}
                          >
                            {savedIndexes.has(i) ? <Check className="w-4 h-4" /> : i + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setActiveRecipeIndex(Math.min(generatedRecipes.length - 1, activeRecipeIndex + 1))}
                        disabled={activeRecipeIndex === generatedRecipes.length - 1}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Save All button */}
                    {!allSaved && generatedRecipes.length > 1 && (
                      <button
                        onClick={handleSaveAll}
                        disabled={savingIndex !== null}
                        className="w-full mt-3 py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save All {generatedRecipes.length - savedIndexes.size} Unsaved
                      </button>
                    )}

                    {allSaved && (
                      <div className="mt-3 text-center">
                        <button
                          onClick={() => navigate('/recipes')}
                          className="text-sm text-temple-purple dark:text-temple-gold font-medium hover:underline"
                        >
                          All saved! View your recipes →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Recipe Card */}
                <div className="glass-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex-1 mr-3">
                      {activeRecipe.title}
                    </h2>
                    <button
                      onClick={() => handleSave(activeRecipeIndex)}
                      disabled={savingIndex === activeRecipeIndex || savedIndexes.has(activeRecipeIndex)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                        ${savedIndexes.has(activeRecipeIndex)
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-temple-purple dark:bg-temple-gold text-white hover:shadow-lg'
                        }
                      `}
                    >
                      {savedIndexes.has(activeRecipeIndex) ? (
                        <>
                          <Check className="w-4 h-4" />
                          Saved
                        </>
                      ) : savingIndex === activeRecipeIndex ? (
                        'Saving...'
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {activeRecipe.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{activeRecipe.totalTime} min</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{activeRecipe.servings} servings</span>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                      {activeRecipe.difficulty}
                    </div>
                  </div>

                  {/* Dietary Tags */}
                  {activeRecipe.dietaryTags && activeRecipe.dietaryTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {activeRecipe.dietaryTags.map(tag => (
                        <span key={tag} className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-400 capitalize">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Ingredients */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Ingredients
                    </h3>
                    <ul className="space-y-2">
                      {activeRecipe.ingredients?.map((ingredient, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="text-temple-purple dark:text-temple-gold">•</span>
                          <span><strong>{ingredient.amount} {ingredient.unit}</strong> {ingredient.item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Instructions
                    </h3>
                    <div className="space-y-2">
                      {activeRecipe.instructions?.map((instruction, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-temple-purple/20 dark:bg-temple-gold/20 flex items-center justify-center text-xs font-bold text-temple-purple dark:text-temple-gold">
                            {instruction.step}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 pt-0.5">
                            {instruction.instruction || instruction.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  {activeRecipe.tips && activeRecipe.tips.length > 0 && (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Chef's Tips
                      </h4>
                      <ul className="space-y-1">
                        {activeRecipe.tips.map((tip, index) => (
                          <li key={index} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-temple-purple dark:text-temple-gold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Healthy Swaps */}
                  {activeRecipe.healthySwaps && activeRecipe.healthySwaps.length > 0 && (
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                        💡 Healthy Swaps
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Common ingredient swaps to make this type of dish even healthier
                      </p>
                      <div className="space-y-2">
                        {activeRecipe.healthySwaps.map((swap, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 line-through">
                              {swap.commonIngredient}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                              {swap.healthyAlternative}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 italic">
                              {swap.reason}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : generating ? (
              <div className="glass-card p-12 text-center">
                <div className="spinner w-12 h-12 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Creating {recipeCount > 1 ? 'Recipes' : 'Recipe'}...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our AI chef is preparing something special
                </p>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to Create
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Customise your settings and click Generate to create faith-inspired recipes
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    <BottomNav />
    </>
  )
}
