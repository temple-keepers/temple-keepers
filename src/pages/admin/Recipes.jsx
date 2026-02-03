import { PDFRecipeImporter } from '../../components/admin/PDFRecipeImporter'

export const AdminRecipes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
          Recipe Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Import recipes from PDF files and manage your recipe library
        </p>
      </div>

      <PDFRecipeImporter />
      
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How It Works
        </h3>
        <ol className="space-y-3 text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-temple-purple/20 dark:bg-temple-gold/20 text-temple-purple dark:text-temple-gold flex items-center justify-center text-sm font-semibold">
              1
            </span>
            <span>Upload a PDF file containing a recipe</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-temple-purple/20 dark:bg-temple-gold/20 text-temple-purple dark:text-temple-gold flex items-center justify-center text-sm font-semibold">
              2
            </span>
            <span>System will attempt to extract recipe data (title, ingredients, instructions)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-temple-purple/20 dark:bg-temple-gold/20 text-temple-purple dark:text-temple-gold flex items-center justify-center text-sm font-semibold">
              3
            </span>
            <span>Review and edit the extracted data to ensure accuracy</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-temple-purple/20 dark:bg-temple-gold/20 text-temple-purple dark:text-temple-gold flex items-center justify-center text-sm font-semibold">
              4
            </span>
            <span>Save the recipe to your library - it will be available to all users</span>
          </li>
        </ol>
      </div>

      <div className="glass-card p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <span>💡</span> Tips for Best Results
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Use PDFs with clear, well-formatted text</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Recipes with standard sections (Ingredients, Instructions) work best</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Scanned images may not extract well - text-based PDFs are recommended</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Always review extracted data before saving</span>
          </li>
        </ul>
      </div>
    </div>
  )
}