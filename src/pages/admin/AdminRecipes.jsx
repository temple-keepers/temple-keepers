import { useState, useEffect } from 'react'
import { getAllRecipes, deleteRecipeAdmin } from '../../lib/adminSupabase'
import { supabase } from '../../lib/supabase'
import { ChefHat, Search, ChevronLeft, ChevronRight, Eye, Trash2, X, AlertTriangle, RefreshCw } from 'lucide-react'

const AdminRecipes = () => {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const limit = 20

  useEffect(() => { loadRecipes() }, [page])

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('admin-recipes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recipes' },
        (payload) => {
          console.log('📡 Recipe change detected:', payload)
          // Reload data when any change happens
          loadRecipes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [page, search])

  const loadRecipes = async () => {
    setLoading(true)
    const { recipes: data, total: count } = await getAllRecipes(page, limit, search)
    setRecipes(data)
    setTotal(count)
    setLoading(false)
  }

  const handleDelete = async (id) => {
    try {
      await deleteRecipeAdmin(id)
      // Remove from local state immediately for responsiveness
      setRecipes(recipes.filter(r => r.id !== id))
      setTotal(prev => prev - 1)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete recipe:', error)
      alert('Failed to delete recipe')
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Recipe Management</h1>
          <p className="text-gray-400">{total} total recipes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadRecipes} className="p-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600" title="Refresh">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); loadRecipes() }} className="flex gap-2">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search recipes..."
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-temple-gold focus:outline-none w-64" />
            <button type="submit" className="px-4 py-2 bg-temple-purple text-white rounded-xl">Search</button>
          </form>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-temple-gold/30 border-t-temple-gold rounded-full animate-spin" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No recipes found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Recipe</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Creator</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe) => (
                  <tr key={recipe.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium truncate max-w-[200px]">{recipe.title}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{recipe.author_name || 'Anonymous'}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{new Date(recipe.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedRecipe(recipe)} className="p-2 rounded-lg hover:bg-gray-600 text-gray-400 hover:text-white"><Eye className="w-5 h-5" /></button>
                      <button onClick={() => setDeleteConfirm(recipe)} className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"><ChevronLeft className="w-5 h-5 text-gray-400" /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"><ChevronRight className="w-5 h-5 text-gray-400" /></button>
            </div>
          </div>
        )}
      </div>

      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">{selectedRecipe.title}</h2>
              <button onClick={() => setSelectedRecipe(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-gray-300 mb-4">{selectedRecipe.description}</p>
            {selectedRecipe.ingredients && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Ingredients</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  {selectedRecipe.ingredients.map((ing, i) => <li key={i}>• {ing}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Delete Recipe?</h2>
                <p className="text-gray-400 text-sm">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-xl">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminRecipes