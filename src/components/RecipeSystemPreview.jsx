import { Upload, UtensilsCrossed } from 'lucide-react'

export const RecipePDFImportPreview = ({ 
  onImportClick,
  className = ''
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center py-16 px-6 text-center">
        {/* Icon */}
        <div className="mb-6 relative">
          {/* Glow effect */}
          <div className="absolute inset-0 blur-2xl opacity-50">
            <div className="w-24 h-24 bg-temple-gold/50 rounded-full" />
          </div>
          
          {/* Icon container */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 flex items-center justify-center">
            <UtensilsCrossed className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Recipe System Coming Soon
        </h2>

        {/* Subtitle */}
        <p className="text-gray-400 max-w-md mb-8 text-sm sm:text-base">
          Generate dietary-aware, fasting-compatible recipes
        </p>

        {/* CTA Button */}
        <button
          onClick={onImportClick}
          disabled
          className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500/50 to-amber-600/50 text-white/50 font-medium cursor-not-allowed"
        >
          <Upload className="w-5 h-5" />
          <span>Import PDF Recipes</span>
        </button>
        
        <p className="text-xs text-gray-500 mt-4">
          PDF import feature coming in future update
        </p>
      </div>
    </div>
  )
}
