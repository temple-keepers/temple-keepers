import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'
import { AppHeader } from '../components/AppHeader'
import { Plus, Search, Clock, Users, Sparkles, UtensilsCrossed, ChefHat, Coffee, Sandwich, Apple, Cookie, CakeSlice, Book } from 'lucide-react'

export const Recipes = () => {
  const navigate = useNavigate()
  const { recipes, loading, getRecipes } = useRecipes()

  const [filters, setFilters] = useState({
    search: '',
    mealType: '',
    cuisine: '',
    maxTime: '',
    dietaryTags: []
  })

  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    await getRecipes(filters)
  }

  const handleSearch = async () => {
    await getRecipes(filters)
  }

  const toggleDietaryTag = (tag) => {
    setFilters(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag]
    }))
  }

  const dietaryOptions = [
    'daniel-fast',
    'vegetarian', 'vegan', 'pescatarian', 'gluten-free', 'dairy-free',
    'nut-free', 'low-carb', 'keto', 'paleo', 'whole-foods', 'mediterranean', 'low-sodium'
  ]

  const getMealMeta = (mealType) => {
    const normalized = String(mealType || '').toLowerCase()
    if (normalized.includes('breakfast')) return { label: 'Breakfast', icon: Coffee }
    if (normalized.includes('lunch')) return { label: 'Lunch', icon: Sandwich }
    if (normalized.includes('dinner')) return { label: 'Dinner', icon: UtensilsCrossed }
    if (normalized.includes('dessert')) return { label: 'Dessert', icon: CakeSlice }
    if (normalized.includes('snack')) return { label: 'Snack', icon: Apple }
    return { label: 'Recipe', icon: ChefHat }
  }

  if (loading && recipes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <AppHeader title="Recipes" />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Faith-inspired, nourishing meals for body and soul
          </p>
          <button
            onClick={() => navigate('/recipes/generate')}
            className="btn-primary flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span className="hidden sm:inline">Generate Recipe</span>
            <span className="sm:hidden">Generate</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search recipes..."
                  className="form-input pl-10"
                />
              </div>
              <button
                onClick={handleSearch}
                className="btn-secondary"
              >
                Search
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleDietaryTag(tag)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors
                    ${filters.dietaryTags.includes(tag)
                      ? 'bg-temple-purple dark:bg-temple-gold text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

      {/* Recipe Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {recipes.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Recipes Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Generate your first AI-powered recipe
            </p>
            <button
              onClick={() => navigate('/recipes/generate')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate Recipe</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map(recipe => {
              const meta = getMealMeta(recipe.meal_type)
              const MealIcon = meta.icon

              return (
                <div
                  key={recipe.id}
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                  className="glass-card overflow-hidden hover:scale-[1.02] transition-all cursor-pointer group"
                >
                  {/* Recipe Header */}
                  <div className="h-24 bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-between px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                        <MealIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-white/90">{meta.label}</span>
                    </div>
                    {recipe.scripture && (
                      <div className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center">
                        <Book className="w-4 h-4 text-temple-purple dark:text-temple-gold" />
                      </div>
                    )}
                  </div>

                  {/* Recipe Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-temple-purple dark:group-hover:text-temple-gold transition-colors">
                      {recipe.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
                      {recipe.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{recipe.total_time}min</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <Users className="w-3.5 h-3.5" />
                        <span>{recipe.servings}</span>
                      </div>
                      <div className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-xs font-medium text-green-700 dark:text-green-400">
                        {recipe.difficulty}
                      </div>
                    </div>

                    {/* Dietary Tags */}
                    {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {recipe.dietary_tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-400 capitalize">
                            {tag}
                          </span>
                        ))}
                        {recipe.dietary_tags.length > 3 && (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400">
                            +{recipe.dietary_tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    <button className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 text-white font-semibold text-sm hover:shadow-lg transition-all">
                      View Recipe &rarr;
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
