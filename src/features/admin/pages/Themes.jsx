import { Calendar, Plus } from 'lucide-react'

export const AdminThemes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
          Weekly Themes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage weekly devotional themes
        </p>
      </div>

      <div className="glass-card p-12 text-center">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Theme Management Coming Soon
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Create weekly themes for devotional content
        </p>
        <button className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>Create Theme</span>
        </button>
      </div>
    </div>
  )
}
