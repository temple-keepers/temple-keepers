import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateRecipe } from '../lib/recipeAI'
import { useRecipes } from '../hooks/useRecipes'
import { AppHeader } from '../components/AppHeader'
import { ArrowLeft, Sparkles, Clock, Users, ChefHat, Book } from 'lucide-react'

export const RecipeGenerator = () => {
  const navigate = useNavigate()
  const { createRecipe } = useRecipes()
  
  const [mealType, setMealType] = useState('dinner')
  const [cuisine, setCuisine] = useState('any')
  const [cookingTime, setCookingTime] = useState(30)
  const [servings, setServings] = useState(4)
  const [dietaryRestrictions, setDietaryRestrictions] = useState([])
  const [includeScripture, setIncludeScripture] = useState(true)
  
  const [generating, setGenerating] = useState(false)
  const [generatedRecipe, setGeneratedRecipe] = useState(null)
  const [saving, setSaving] = useState(false)

  const dietaryOptions = [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free',
    'nut-free', 'low-carb', 'keto', 'paleo'
  ]

  const cuisineOptions = [
    'any', 'american', 'italian', 'mexican', 'asian',
    'mediterranean', 'indian', 'middle-eastern', 'caribbean', 'african'
  ]

  const toggleDietary = (option) => {
    setDietaryRestrictions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    )
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedRecipe(null)

    const { success, recipe, error } = await generateRecipe({
      mealType,
      dietaryRestrictions,
      cuisine,
      cookingTime,
      servings,
      includeScripture
    })

    if (success) {
      setGeneratedRecipe(recipe)
    } else {
      alert('Failed to generate recipe: ' + error)
    }

    setGenerating(false)
  }

  const handleSave = async () => {
    if (!generatedRecipe) return

    setSaving(true)

    const recipeData = {
      title: generatedRecipe.title,
      description: generatedRecipe.description,
      meal_type: mealType,
      cuisine: generatedRecipe.cuisine || cuisine,
      prep_time: generatedRecipe.prepTime,
      cook_time: generatedRecipe.cookTime,
      total_time: generatedRecipe.totalTime,
      servings: generatedRecipe.servings,
      difficulty: generatedRecipe.difficulty,
      dietary_tags: generatedRecipe.dietaryTags || [],
      ingredients: generatedRecipe.ingredients,
      instructions: generatedRecipe.instructions,
      nutrition: generatedRecipe.nutrition,
      scripture: generatedRecipe.scripture || null,
      tips: generatedRecipe.tips || [],
      notes: generatedRecipe.notes || ''
    }

    const { data, error } = await createRecipe(recipeData)

    if (!error && data) {
      // Show success message
      alert('Recipe saved successfully!')
      // Redirect to recipes list to see it
      navigate('/recipes')
    } else {
      console.error('Save error:', error)
      alert(`Failed to save recipe: ${error?.message || 'Unknown error'}. Make sure you've run the database migration in Supabase!`)
    }

    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <AppHeader title="AI Recipe Generator" showBackButton={true} backTo="/recipes" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Create custom recipes with scripture-based inspiration
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Generator Form */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                Recipe Settings
              </h2>

              {/* Meal Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meal Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['breakfast', 'lunch', 'dinner'].map(type => (
                    <button
                      key={type}
                      onClick={() => setMealType(type)}
                      className={`
                        px-4 py-2 rounded-lg font-medium capitalize transition-colors
                        ${mealType === type
                          ? 'bg-temple-purple dark:bg-temple-gold text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      {type}
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

              {/* Time & Servings */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Max Time (min)
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

              {/* Include Scripture */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <input
                  type="checkbox"
                  id="includeScripture"
                  checked={includeScripture}
                  onChange={(e) => setIncludeScripture(e.target.checked)}
                  className="w-5 h-5 rounded text-temple-purple dark:text-temple-gold"
                />
                <label htmlFor="includeScripture" className="flex-1 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                  <Book className="w-4 h-4" />
                  Include Scripture Meditation
                </label>
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
                    <span>Generating Recipe...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Recipe</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Recipe Preview */}
          <div>
            {generatedRecipe ? (
              <div className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {generatedRecipe.title}
                  </h2>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary text-sm"
                  >
                    {saving ? 'Saving...' : 'Save Recipe'}
                  </button>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {generatedRecipe.description}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{generatedRecipe.totalTime} min</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{generatedRecipe.servings} servings</span>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                    {generatedRecipe.difficulty}
                  </div>
                </div>

                {/* Dietary Tags */}
                {generatedRecipe.dietaryTags && generatedRecipe.dietaryTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {generatedRecipe.dietaryTags.map(tag => (
                      <span key={tag} className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-400 capitalize">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Scripture */}
                {generatedRecipe.scripture && (
                  <div className="p-4 rounded-lg bg-temple-purple/5 dark:bg-temple-gold/5 border-l-4 border-temple-purple dark:border-temple-gold mb-6">
                    <p className="text-sm italic text-gray-700 dark:text-gray-300 mb-2">
                      "{generatedRecipe.scripture.text}"
                    </p>
                    <p className="text-xs font-semibold text-temple-purple dark:text-temple-gold mb-2">
                      — {generatedRecipe.scripture.reference}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {generatedRecipe.scripture.reflection}
                    </p>
                  </div>
                )}

                {/* Ingredients */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Ingredients
                  </h3>
                  <ul className="space-y-2">
                    {generatedRecipe.ingredients?.map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-temple-purple dark:text-temple-gold">•</span>
                        <span><strong>{ingredient.amount} {ingredient.unit}</strong> {ingredient.item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions Preview */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Instructions
                  </h3>
                  <div className="space-y-2">
                    {generatedRecipe.instructions?.map((instruction, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-temple-purple/20 dark:bg-temple-gold/20 flex items-center justify-center text-xs font-bold text-temple-purple dark:text-temple-gold">
                          {instruction.step}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 pt-0.5">
                          {instruction.instruction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                {generatedRecipe.tips && generatedRecipe.tips.length > 0 && (
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Chef's Tips
                    </h4>
                    <ul className="space-y-1">
                      {generatedRecipe.tips.map((tip, index) => (
                        <li key={index} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-temple-purple dark:text-temple-gold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to Create
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Customize your settings and click Generate to create a faith-inspired recipe
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
