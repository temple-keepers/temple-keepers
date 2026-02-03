import { useState } from 'react'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export const PDFRecipeImporter = () => {
  const { user } = useAuth()
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    prep_time: 30,
    cook_time: 30,
    servings: 4,
    difficulty: 'medium',
    cuisine: '',
    meal_type: 'dinner',
    dietary_tags: []
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const updateRecipe = (field, value) => {
    setRecipe(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    // Validate
    if (!recipe.title.trim()) {
      setError('Please enter a recipe title')
      return
    }

    // Parse ingredients (split by new lines)
    const ingredientsArray = recipe.ingredients
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => ({
        item: line,
        amount: '',
        unit: ''
      }))

    if (ingredientsArray.length === 0) {
      setError('Please add at least one ingredient')
      return
    }

    // Parse instructions (split by new lines, add numbering if not present)
    const instructionsArray = recipe.instructions
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, index) => {
        // Remove existing numbering patterns like "1.", "1)", "Step 1:", etc.
        const cleaned = line.replace(/^(\d+[\.\):]?\s*|Step\s*\d+[\.\):]?\s*)/i, '').trim()
        return {
          step: index + 1,
          instruction: cleaned
        }
      })

    if (instructionsArray.length === 0) {
      setError('Please add at least one instruction step')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const { data, error: dbError } = await supabase
        .from('recipes')
        .insert([{
          title: recipe.title.trim(),
          description: recipe.description.trim() || `Admin recipe: ${recipe.title}`,
          ingredients: ingredientsArray,
          instructions: instructionsArray,
          prep_time: recipe.prep_time,
          cook_time: recipe.cook_time,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          cuisine: recipe.cuisine.trim(),
          meal_type: recipe.meal_type,
          dietary_tags: recipe.dietary_tags,
          created_by: user.id,
          is_admin_created: true,
          created_at: new Date().toISOString()
        }])
        .select()

      if (dbError) throw dbError

      setSuccess(true)
      setTimeout(() => {
        handleReset()
      }, 2000)
    } catch (err) {
      console.error('Error saving recipe:', err)
      setError('Failed to save recipe: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setRecipe({
      title: '',
      description: '',
      ingredients: '',
      instructions: '',
      prep_time: 30,
      cook_time: 30,
      servings: 4,
      difficulty: 'medium',
      cuisine: '',
      meal_type: 'dinner',
      dietary_tags: []
    })
    setError(null)
    setSuccess(false)
  }

  if (success) {
    return (
      <div className="glass-card p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Recipe Added Successfully!
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The recipe has been added to your library
        </p>
        <button onClick={handleReset} className="btn-primary">
          Add Another Recipe
        </button>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Add New Recipe
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Paste your recipe text below - ingredients and instructions will be automatically parsed
        </p>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Recipe Title *
          </label>
          <input
            type="text"
            value={recipe.title}
            onChange={(e) => updateRecipe('title', e.target.value)}
            className="form-input w-full"
            placeholder="e.g., High Protein Quiche"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={recipe.description}
            onChange={(e) => updateRecipe('description', e.target.value)}
            className="form-input w-full"
            rows="2"
            placeholder="Brief description of the recipe"
          />
        </div>

        {/* Ingredients - Bulk Paste */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ingredients * <span className="text-xs text-gray-500">(one per line)</span>
          </label>
          <textarea
            value={recipe.ingredients}
            onChange={(e) => updateRecipe('ingredients', e.target.value)}
            className="form-input w-full font-mono text-sm"
            rows="12"
            placeholder="11.2 oz. (320g) pie crust, store-bought
1 onion, finely diced
2 cloves garlic, minced
1 oz. (30g) spinach, chopped
2 large eggs
6 oz. (180g) egg whites
6 fl oz. (180ml) whole milk
5 oz. (140g) smoked bacon, chopped
3 oz. (85g) mozzarella cheese"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            💡 Tip: Just paste your ingredients - each line becomes one item
          </p>
        </div>

        {/* Instructions - Bulk Paste */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Instructions * <span className="text-xs text-gray-500">(one step per line)</span>
          </label>
          <textarea
            value={recipe.instructions}
            onChange={(e) => updateRecipe('instructions', e.target.value)}
            className="form-input w-full font-mono text-sm"
            rows="12"
            placeholder="Preheat the oven to 375°F (190°C). Place the pie crust on a baking sheet and prick the base with a fork. Bake for 8 minutes. Let cool slightly.
In a skillet over medium heat, sauté onion for 5 minutes. Add garlic and cook for 1 minute. Add spinach and cook until wilted. Let cool.
In a large bowl, whisk eggs, egg whites, and milk. Season with salt and pepper. Stir in the cooked vegetables, bacon, and cheese.
Pour into the crust, ensuring it's not overfilled. Bake for 35-45 minutes until set and golden. Rest for 10 minutes before slicing."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            💡 Tip: Each line becomes a numbered step automatically. No need to add "1.", "2." etc.
          </p>
        </div>

        {/* Times and Servings */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prep Time (min)
            </label>
            <input
              type="number"
              value={recipe.prep_time || ''}
              onChange={(e) => updateRecipe('prep_time', parseInt(e.target.value) || 0)}
              className="form-input w-full"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cook Time (min)
            </label>
            <input
              type="number"
              value={recipe.cook_time || ''}
              onChange={(e) => updateRecipe('cook_time', parseInt(e.target.value) || 0)}
              className="form-input w-full"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Servings
            </label>
            <input
              type="number"
              value={recipe.servings || ''}
              onChange={(e) => updateRecipe('servings', parseInt(e.target.value) || 0)}
              className="form-input w-full"
              min="1"
            />
          </div>
        </div>

        {/* Meal Type, Cuisine, Difficulty */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meal Type
            </label>
            <select
              value={recipe.meal_type}
              onChange={(e) => updateRecipe('meal_type', e.target.value)}
              className="form-input w-full"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cuisine
            </label>
            <input
              type="text"
              value={recipe.cuisine}
              onChange={(e) => updateRecipe('cuisine', e.target.value)}
              className="form-input w-full"
              placeholder="e.g., Italian"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Difficulty
            </label>
            <select
              value={recipe.difficulty}
              onChange={(e) => updateRecipe('difficulty', e.target.value)}
              className="form-input w-full"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Clear Form
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Add Recipe</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

