import { Settings as SettingsIcon, Sliders } from 'lucide-react'

export const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
          Platform Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure platform features and settings
        </p>
      </div>

      <div className="glass-card p-12 text-center">
        <Sliders className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Feature Gating & Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Toggle features and manage tier restrictions
        </p>
        <button className="btn-secondary inline-flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          <span>Configure</span>
        </button>
      </div>
    </div>
  )
}
