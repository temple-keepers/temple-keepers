import { UtensilsCrossed, Plus } from 'lucide-react'

export const AdminRecipes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
          Recipe Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and manage recipes with AI assistance
        </p>
      </div>

      <div className="glass-card p-12 text-center">
        <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Recipe System Coming Soon
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Generate dietary-aware, fasting-compatible recipes
        </p>
        <button className="btn-gold inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>Create Recipe</span>
        </button>
      </div>
    </div>
  )
}
