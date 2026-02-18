import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Save, Trash2 } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { useRecipes } from '../hooks/useRecipes'
import { useAuth } from '../contexts/AuthContext'

const dietaryOptions = [
  'daniel-fast',
  'vegetarian',
  'vegan',
  'pescatarian',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'low-carb',
  'keto',
  'paleo',
  'whole-foods',
  'mediterranean',
  'low-sodium'
]

export const RecipeEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { getRecipe, updateRecipe, deleteRecipe } = useRecipes()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [recipe, setRecipe] = useState(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mealType, setMealType] = useState('dinner')
  const [cuisine, setCuisine] = useState('')
  const [prepTime, setPrepTime] = useState(0)
  const [cookTime, setCookTime] = useState(0)
  const [servings, setServings] = useState(1)
  const [difficulty, setDifficulty] = useState('medium')
  const [dietaryTags, setDietaryTags] = useState([])
  const [dietaryText, setDietaryText] = useState('')
  const [ingredients, setIngredients] = useState([{ amount: '', unit: '', item: '' }])
  const [instructions, setInstructions] = useState([{ step: 1, instruction: '' }])
  const [tipsText, setTipsText] = useState('')
  const [notes, setNotes] = useState('')
  const [scriptureEnabled, setScriptureEnabled] = useState(false)
  const [scriptureText, setScriptureText] = useState('')
  const [scriptureReference, setScriptureReference] = useState('')
  const [scriptureReflection, setScriptureReflection] = useState('')

  useEffect(() => {
    loadRecipe()
  }, [id])

  const loadRecipe = async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await getRecipe(id)
    if (fetchError || !data) {
      navigate('/recipes')
      return
    }

    setRecipe(data)
    setTitle(data.title || '')
    setDescription(data.description || '')
    setMealType(String(data.meal_type || 'dinner').toLowerCase())
    setCuisine(data.cuisine || '')
    setPrepTime(data.prep_time || 0)
    setCookTime(data.cook_time || 0)
    setServings(data.servings || 1)
    setDifficulty(String(data.difficulty || 'medium').toLowerCase())

    const initialTags = Array.isArray(data.dietary_tags) ? data.dietary_tags : []
    setDietaryTags(initialTags)
    setDietaryText(initialTags.join(', '))

    const initialIngredients = Array.isArray(data.ingredients)
      ? data.ingredients.map((ingredient) => ({
        amount: ingredient?.amount ?? '',
        unit: ingredient?.unit ?? '',
        item: ingredient?.item ?? ''
      }))
      : []
    setIngredients(initialIngredients.length ? initialIngredients : [{ amount: '', unit: '', item: '' }])

    const initialInstructions = Array.isArray(data.instructions)
      ? data.instructions.map((instruction, index) => ({
        step: instruction?.step ?? index + 1,
        instruction: instruction?.instruction ?? ''
      }))
      : []
    setInstructions(initialInstructions.length ? initialInstructions : [{ step: 1, instruction: '' }])

    const initialTips = Array.isArray(data.tips) ? data.tips : []
    setTipsText(initialTips.join('\n'))
    setNotes(data.notes || '')

    const scripture = data.scripture || {}
    const hasScripture = Boolean(scripture.text || scripture.reference || scripture.reflection)
    setScriptureEnabled(hasScripture)
    setScriptureText(scripture.text || '')
    setScriptureReference(scripture.reference || '')
    setScriptureReflection(scripture.reflection || '')

    setLoading(false)
  }

  const canManage = user && recipe && (profile?.role === 'admin' || recipe.created_by === user.id)

  const toggleDietaryTag = (tag) => {
    const nextTags = dietaryTags.includes(tag)
      ? dietaryTags.filter((t) => t !== tag)
      : [...dietaryTags, tag]
    setDietaryTags(nextTags)
    setDietaryText(nextTags.join(', '))
  }

  const handleDietaryTextChange = (value) => {
    setDietaryText(value)
    const nextTags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
    setDietaryTags(nextTags)
  }

  const handleIngredientChange = (index, field, value) => {
    setIngredients((prev) =>
      prev.map((ingredient, idx) =>
        idx === index ? { ...ingredient, [field]: value } : ingredient
      )
    )
  }

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { amount: '', unit: '', item: '' }])
  }

  const removeIngredient = (index) => {
    setIngredients((prev) => {
      const next = prev.filter((_, idx) => idx !== index)
      return next.length ? next : [{ amount: '', unit: '', item: '' }]
    })
  }

  const handleInstructionChange = (index, value) => {
    setInstructions((prev) =>
      prev.map((instruction, idx) =>
        idx === index ? { ...instruction, instruction: value } : instruction
      )
    )
  }

  const addInstruction = () => {
    setInstructions((prev) => [
      ...prev,
      { step: prev.length + 1, instruction: '' }
    ])
  }

  const removeInstruction = (index) => {
    setInstructions((prev) => {
      const next = prev.filter((_, idx) => idx !== index)
      const normalized = next.map((instruction, idx) => ({
        ...instruction,
        step: idx + 1
      }))
      return normalized.length ? normalized : [{ step: 1, instruction: '' }]
    })
  }

  const buildIngredientsPayload = () => {
    const trimmed = ingredients
      .map((ingredient) => ({
        amount: String(ingredient.amount || '').trim(),
        unit: String(ingredient.unit || '').trim(),
        item: String(ingredient.item || '').trim()
      }))
      .filter((ingredient) => ingredient.item.length > 0)

    return trimmed
  }

  const buildInstructionsPayload = () => {
    const trimmed = instructions
      .map((instruction) => String(instruction.instruction || instruction.text || '').trim())
      .filter((instruction) => instruction.length > 0)

    return trimmed.map((instruction, index) => ({
      step: index + 1,
      instruction
    }))
  }

  const handleSave = async () => {
    setError(null)

    if (!title.trim()) {
      setError('Please enter a recipe title.')
      return
    }

    const nextIngredients = buildIngredientsPayload()
    if (nextIngredients.length === 0) {
      setError('Please add at least one ingredient.')
      return
    }

    const nextInstructions = buildInstructionsPayload()
    if (nextInstructions.length === 0) {
      setError('Please add at least one instruction step.')
      return
    }

    const nextTips = tipsText
      .split('\n')
      .map((tip) => tip.trim())
      .filter(Boolean)

    const prepValue = Number(prepTime) || 0
    const cookValue = Number(cookTime) || 0
    const servingsValue = Number(servings) || 1

    const scripturePayload = {
      text: scriptureText.trim(),
      reference: scriptureReference.trim(),
      reflection: scriptureReflection.trim()
    }
    const hasScriptureContent = Boolean(
      scripturePayload.text || scripturePayload.reference || scripturePayload.reflection
    )

    const updates = {
      title: title.trim(),
      description: description.trim(),
      meal_type: mealType,
      cuisine: cuisine.trim(),
      prep_time: prepValue,
      cook_time: cookValue,
      total_time: prepValue + cookValue,
      servings: servingsValue,
      difficulty,
      dietary_tags: dietaryTags,
      ingredients: nextIngredients,
      instructions: nextInstructions,
      tips: nextTips,
      notes: notes.trim(),
      scripture: scriptureEnabled && hasScriptureContent ? scripturePayload : null
    }

    setSaving(true)
    const { error: updateError } = await updateRecipe(id, updates)
    setSaving(false)

    if (updateError) {
      setError(updateError.message || 'Failed to update recipe.')
      return
    }

    navigate(`/recipes/${id}`)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this recipe? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    const { error: deleteError } = await deleteRecipe(id)
    setDeleting(false)

    if (deleteError) {
      setError(deleteError.message || 'Failed to delete recipe.')
      return
    }

    navigate('/recipes')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!recipe) return null

  if (!canManage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AppHeader showBackButton={true} backTo={`/recipes/${id}`} title="Edit Recipe" />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You do not have permission to edit this recipe.
            </p>
            <button
              onClick={() => navigate(`/recipes/${id}`)}
              className="btn-primary"
            >
              Back to Recipe
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader showBackButton={true} backTo={`/recipes/${id}`} title="Edit Recipe" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white">
              Update Recipe Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Adjust the details below and save your changes.
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            {deleting ? 'Deleting...' : 'Delete Recipe'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 space-y-4">
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input w-full"
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input w-full"
                  rows="3"
                />
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Ingredients
                </h2>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="text-sm font-semibold text-temple-purple dark:text-temple-gold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      value={ingredient.amount}
                      onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                      className="form-input col-span-3"
                      placeholder="Amt"
                    />
                    <input
                      type="text"
                      value={ingredient.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                      className="form-input col-span-3"
                      placeholder="Unit"
                    />
                    <input
                      type="text"
                      value={ingredient.item}
                      onChange={(e) => handleIngredientChange(index, 'item', e.target.value)}
                      className="form-input col-span-5"
                      placeholder="Ingredient"
                    />
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="col-span-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      aria-label="Remove ingredient"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Instructions
                </h2>
                <button
                  type="button"
                  onClick={addInstruction}
                  className="text-sm font-semibold text-temple-purple dark:text-temple-gold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Step
                </button>
              </div>
              <div className="space-y-3">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-temple-purple/10 dark:bg-temple-gold/10 flex items-center justify-center text-sm font-semibold text-temple-purple dark:text-temple-gold">
                      {index + 1}
                    </div>
                    <textarea
                      value={instruction.instruction || instruction.text || ''}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                      className="form-input flex-1"
                      rows="2"
                      placeholder={`Step ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      aria-label="Remove instruction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Notes
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input w-full"
                rows="4"
                placeholder="Add any notes about this recipe."
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Details
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Prep Time</label>
                  <input
                    type="number"
                    min="0"
                    value={prepTime}
                    onChange={(e) => setPrepTime(parseInt(e.target.value, 10) || 0)}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">Cook Time</label>
                  <input
                    type="number"
                    min="0"
                    value={cookTime}
                    onChange={(e) => setCookTime(parseInt(e.target.value, 10) || 0)}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">Servings</label>
                  <input
                    type="number"
                    min="1"
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value, 10) || 1)}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="form-input w-full"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Meal Type</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="form-input w-full"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Healthy Snack</option>
                  <option value="dessert">Healthy Dessert</option>
                </select>
              </div>

              <div>
                <label className="form-label">Cuisine</label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="form-input w-full"
                  placeholder="e.g., Italian"
                />
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Dietary Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleDietaryTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                      dietaryTags.includes(tag)
                        ? 'bg-temple-purple dark:bg-temple-gold text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div>
                <label className="form-label">Custom Tags</label>
                <input
                  type="text"
                  value={dietaryText}
                  onChange={(e) => handleDietaryTextChange(e.target.value)}
                  className="form-input w-full"
                  placeholder="comma-separated tags"
                />
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Tips
              </h2>
              <textarea
                value={tipsText}
                onChange={(e) => setTipsText(e.target.value)}
                className="form-input w-full"
                rows="4"
                placeholder="One tip per line."
              />
            </div>

            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Scripture
                </h2>
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={scriptureEnabled}
                    onChange={(e) => setScriptureEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-temple-purple dark:text-temple-gold"
                  />
                  Include
                </label>
              </div>
              {scriptureEnabled && (
                <div className="space-y-3">
                  <div>
                    <label className="form-label">Verse Text</label>
                    <textarea
                      value={scriptureText}
                      onChange={(e) => setScriptureText(e.target.value)}
                      className="form-input w-full"
                      rows="2"
                    />
                  </div>
                  <div>
                    <label className="form-label">Reference</label>
                    <input
                      type="text"
                      value={scriptureReference}
                      onChange={(e) => setScriptureReference(e.target.value)}
                      className="form-input w-full"
                    />
                  </div>
                  <div>
                    <label className="form-label">Reflection</label>
                    <textarea
                      value={scriptureReflection}
                      onChange={(e) => setScriptureReflection(e.target.value)}
                      className="form-input w-full"
                      rows="3"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-8">
          <button
            onClick={() => navigate(`/recipes/${id}`)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
