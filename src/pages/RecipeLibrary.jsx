import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { 
  getRecipeLibrary, 
  saveRecipeFromLibrary, 
  rateRecipe, 
  addRecipeComment,
  getUserRecipeRating,
  getRecipeComments
} from '../lib/supabase'
import { 
  ChefHat, 
  Clock, 
  Users, 
  Heart,
  BookOpen,
  Star,
  MessageCircle,
  TrendingUp,
  Filter,
  Search,
  Save,
  Eye,
  Loader2,
  X,
  Flame,
  Leaf,
  Droplets,
  CalendarPlus
} from 'lucide-react'

const RecipeLibrary = () => {
  const navigate = useNavigate()
  const { user, refreshUserData } = useAuth()
  const { isDark } = useTheme()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [commenting, setCommenting] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    mealType: '',
    dietaryTags: [],
    sortBy: 'recent' // recent, popular, topRated
  })

  useEffect(() => {
    loadRecipes()
  }, [filters.sortBy])

  const loadRecipes = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('ðŸ“š Loading recipe library...')
      const data = await getRecipeLibrary(filters.sortBy)
      console.log('âœ… Loaded recipes:', data?.length || 0)
      setRecipes(data || [])
    } catch (error) {
      console.error('âŒ Error loading recipes:', error)
      setError(error.message || 'Failed to load recipes')
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }

  const openRecipeModal = async (recipe) => {
    setSelectedRecipe(recipe)
    setShowModal(true)
    
    // Load user's rating if they're logged in
    if (user) {
      const rating = await getUserRecipeRating(user.id, recipe.id)
      setUserRating(rating || 0)
    }
    
    // Load comments
    const recipeComments = await getRecipeComments(recipe.id)
    setComments(recipeComments || [])
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedRecipe(null)
    setUserRating(0)
    setComments([])
    setNewComment('')
  }

  const handleRating = async (rating) => {
    if (!user) {
      alert('Please log in to rate recipes')
      return
    }
    
    try {
      await rateRecipe(user.id, selectedRecipe.id, rating)
      setUserRating(rating)
      // Reload recipes to update average rating
      loadRecipes()
    } catch (error) {
      console.error('Error rating recipe:', error)
      alert('Failed to submit rating')
    }
  }

  const handleSaveRecipe = async (recipe) => {
    if (!user) {
      alert('Please log in to save recipes')
      return
    }
    
    console.log('ðŸ’¾ Saving recipe from library...')
    console.log('User ID:', user.id)
    console.log('Recipe:', recipe)
    
    try {
      const savedRecipe = await saveRecipeFromLibrary(user.id, recipe)
      console.log('âœ… Recipe saved:', savedRecipe)
      
      console.log('ðŸ”„ Refreshing user data...')
      await refreshUserData()
      
      alert('Recipe saved to your collection!')
    } catch (error) {
      console.error('âŒ Error saving recipe:', error)
      console.error('Error message:', error.message)
      console.error('Error details:', JSON.stringify(error, null, 2))
      alert('Failed to save recipe: ' + error.message)
    }
  }

  const handleAddComment = async () => {
    if (!user) {
      alert('Please log in to comment')
      return
    }
    
    if (!newComment.trim()) return
    
    setCommenting(true)
    try {
      await addRecipeComment(user.id, selectedRecipe.id, newComment)
      setNewComment('')
      // Reload comments
      const recipeComments = await getRecipeComments(selectedRecipe.id)
      setComments(recipeComments || [])
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment')
    }
    setCommenting(false)
  }

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = !filters.search || 
      recipe.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesMealType = !filters.mealType || recipe.meal_type === filters.mealType
    
    const matchesDietary = filters.dietaryTags.length === 0 ||
      filters.dietaryTags.every(tag => recipe.dietary_tags?.includes(tag))
    
    return matchesSearch && matchesMealType && matchesDietary
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className={`text-3xl md:text-4xl font-display font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          Recipe Library
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover faith-inspired recipes from our community
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card-strong rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-temple-purple"
            />
          </div>

          {/* Meal Type */}
          <select
            value={filters.mealType}
            onChange={(e) => setFilters({...filters, mealType: e.target.value})}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-temple-purple"
          >
            <option value="">All Meal Types</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
            <option value="dessert">Dessert</option>
          </select>

          {/* Sort By */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-temple-purple"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="topRated">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Recipes Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-temple-purple" />
            <p className="text-gray-600 dark:text-gray-400">Loading recipes...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <p className="text-xl text-gray-800 dark:text-white mb-2">Unable to load recipes</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadRecipes}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Loader2 className="w-5 h-5" />
            Try Again
          </button>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-20">
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-800 dark:text-white mb-2">No recipes found</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {recipes.length === 0 
              ? "The recipe library is currently empty. Be the first to contribute!"
              : "Try adjusting your filters to see more recipes."}
          </p>
          {recipes.length === 0 && (
            <button
              onClick={loadRecipes}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Loader2 className="w-5 h-5" />
              Refresh
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="glass-card-strong rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => openRecipeModal(recipe)}
            >
              {recipe.image_url && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={recipe.image_url} 
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-2">
                    {recipe.title}
                  </h3>
                  {recipe.is_featured && (
                    <Star className="w-5 h-5 text-temple-gold fill-temple-gold flex-shrink-0 ml-2" />
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {recipe.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {recipe.prep_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.prep_time}</span>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{recipe.servings}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-temple-gold fill-temple-gold" />
                      <span className="font-medium">{recipe.average_rating || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{recipe.view_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{recipe.save_count || 0}</span>
                    </div>
                  </div>
                </div>

                {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {recipe.dietary_tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs rounded-full bg-temple-purple/10 text-temple-purple dark:bg-temple-gold/10 dark:text-temple-gold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {showModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{selectedRecipe.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">By {selectedRecipe.author_name}</p>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Action Buttons */}
              {user && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSaveRecipe(selectedRecipe)}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save to My Recipes
                  </button>
                  <button
                    onClick={() => navigate('/meal-planner', { state: { addRecipe: selectedRecipe } })}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2"
                  >
                    <CalendarPlus className="w-5 h-5" />
                    Add to Meal Planner
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Stats */}
              <div className="flex items-center gap-6 text-sm pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-temple-gold fill-temple-gold" />
                  <span className="font-semibold">{selectedRecipe.average_rating || 0}</span>
                  <span className="text-gray-500">{`(${selectedRecipe.rating_count || 0} ratings)`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-gray-400" />
                  <span>{selectedRecipe.view_count || 0} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-gray-400" />
                  <span>{selectedRecipe.save_count || 0} saves</span>
                </div>
              </div>

              {/* Description */}
              {selectedRecipe.description && (
                <div>
                  <p className="text-gray-600 dark:text-gray-300">{selectedRecipe.description}</p>
                </div>
              )}

              {/* Recipe Info */}
              <div className="grid grid-cols-3 gap-4">
                {selectedRecipe.prep_time && (
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-temple-purple" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Prep Time</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{selectedRecipe.prep_time}</p>
                  </div>
                )}
                {selectedRecipe.cook_time && (
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cook Time</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{selectedRecipe.cook_time}</p>
                  </div>
                )}
                {selectedRecipe.servings && (
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Users className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Servings</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{selectedRecipe.servings}</p>
                  </div>
                )}
              </div>

              {/* Dietary Tags */}
              {selectedRecipe.dietary_tags && selectedRecipe.dietary_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedRecipe.dietary_tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-sm rounded-full bg-temple-purple/10 text-temple-purple dark:bg-temple-gold/10 dark:text-temple-gold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Ingredients */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <ChefHat className="w-6 h-6 text-temple-purple" />
                  Ingredients
                </h3>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients?.map((ingredient, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 rounded-full bg-temple-purple mt-2 flex-shrink-0" />
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Instructions</h3>
                <ol className="space-y-4">
                  {selectedRecipe.instructions?.map((step, idx) => (
                    <li key={idx} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-temple-purple text-white flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 pt-1">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {selectedRecipe.nutritional_benefits && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-500 dark:bg-green-600 rounded-xl">
                      <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Health Benefits</h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                        {selectedRecipe.nutritional_benefits}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nutrition Information */}
              {((selectedRecipe.nutrition_info && Object.keys(selectedRecipe.nutrition_info).length > 0) || 
               (selectedRecipe.micronutrients && Object.keys(selectedRecipe.micronutrients).length > 0)) && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-500" />
                    Nutrition Facts
                  </h3>
                  
                  {/* Macronutrients */}
                  {selectedRecipe.nutrition_info && Object.keys(selectedRecipe.nutrition_info).length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">Macronutrients</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {Object.entries(selectedRecipe.nutrition_info).map(([key, value]) => (
                          <div key={key} className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-3xl font-bold bg-gradient-to-r from-temple-purple to-temple-gold bg-clip-text text-transparent">{value}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 capitalize mt-1 font-medium">{key}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Micronutrients */}
                  {selectedRecipe.micronutrients && Object.keys(selectedRecipe.micronutrients).length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        Essential Vitamins & Minerals
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {Object.entries(selectedRecipe.micronutrients).map(([key, value]) => (
                          <div key={key} className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl border border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform">
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{value}</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300 capitalize font-medium">{key}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Rate Recipe */}
              {user && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Rate this Recipe</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRating(rating)}
                        className="p-2 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            rating <= userRating
                              ? 'text-temple-gold fill-temple-gold'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {userRating > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      You rated this recipe {userRating} stars
                    </p>
                  )}
                </div>
              )}

              {/* Comments Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comments ({comments.length})
                </h3>

                {/* Add Comment */}
                {user && (
                  <div className="mb-6">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-temple-purple resize-none"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={commenting || !newComment.trim()}
                      className="mt-2 btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {commenting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <MessageCircle className="w-5 h-5" />
                      )}
                      Post Comment
                    </button>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-gray-800 dark:text-white">{comment.user_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{comment.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={() => handleSaveRecipe(selectedRecipe)}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg"
              >
                <Save className="w-5 h-5" />
                Save to My Recipes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipeLibrary
