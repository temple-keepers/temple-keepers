import { useState } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export const PDFRecipeImporter = () => {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractedRecipe, setExtractedRecipe] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please select a valid PDF file')
      setFile(null)
    }
  }

  const extractTextFromPDF = async (file) => {
    // For now, we'll use a simple text extraction
    // In production, you'd use a PDF parsing library or AI service
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target.result
        // Simple extraction - in production use proper PDF parser
        resolve(text)
      }
      reader.readAsText(file)
    })
  }

  const parseRecipeFromText = (text) => {
    // Simple parsing logic - enhance with AI in production
    const lines = text.split('\n').filter(line => line.trim())
    
    // Try to find title (usually first line or line with "Recipe")
    let title = lines[0] || 'Imported Recipe'
    
    // Look for common recipe sections
    const ingredientsIndex = lines.findIndex(line => 
      line.toLowerCase().includes('ingredient')
    )
    const instructionsIndex = lines.findIndex(line => 
      line.toLowerCase().includes('instruction') || 
      line.toLowerCase().includes('direction')
    )
    
    let ingredients = []
    let instructions = []
    
    if (ingredientsIndex !== -1) {
      // Extract ingredients
      const endIndex = instructionsIndex !== -1 ? instructionsIndex : lines.length
      ingredients = lines.slice(ingredientsIndex + 1, endIndex)
        .filter(line => line.trim() && !line.toLowerCase().includes('instruction'))
        .map(line => line.trim())
    }
    
    if (instructionsIndex !== -1) {
      // Extract instructions
      instructions = lines.slice(instructionsIndex + 1)
        .filter(line => line.trim())
        .map((line, index) => `${index + 1}. ${line.trim()}`)
    }

    return {
      title: title.trim(),
      description: `Imported from PDF: ${file?.name || 'recipe.pdf'}`,
      ingredients: ingredients.length > 0 ? ingredients : ['Ingredient 1', 'Ingredient 2'],
      instructions: instructions.length > 0 ? instructions : ['Step 1', 'Step 2'],
      prep_time: 30,
      cook_time: 30,
      servings: 4,
      difficulty: 'medium',
      cuisine: '',
      meal_type: 'dinner',
      dietary_tags: []
    }
  }

  const handleUploadAndExtract = async () => {
    if (!file) return

    setUploading(true)
    setExtracting(true)
    setError(null)

    try {
      // Extract text from PDF
      const pdfText = await extractTextFromPDF(file)
      
      // Parse recipe data
      const recipe = parseRecipeFromText(pdfText)
      
      setExtractedRecipe(recipe)
      setExtracting(false)
    } catch (err) {
      console.error('Error extracting recipe:', err)
      setError('Failed to extract recipe from PDF. Please try again or enter manually.')
      setExtracting(false)
    } finally {
      setUploading(false)
    }
  }

  const handleSaveRecipe = async () => {
    if (!extractedRecipe || !user) return

    setUploading(true)
    setError(null)

    try {
      const { data, error: dbError } = await supabase
        .from('recipes')
        .insert([{
          ...extractedRecipe,
          created_by: user.id,
          is_admin_created: true,
          created_at: new Date().toISOString()
        }])
        .select()

      if (dbError) throw dbError

      setSuccess(true)
      setTimeout(() => {
        setFile(null)
        setExtractedRecipe(null)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      console.error('Error saving recipe:', err)
      setError('Failed to save recipe to database')
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setExtractedRecipe(null)
    setError(null)
    setSuccess(false)
  }

  const updateExtractedRecipe = (field, value) => {
    setExtractedRecipe(prev => ({ ...prev, [field]: value }))
  }

  if (success) {
    return (
      <div className="glass-card p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Recipe Imported Successfully!
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The recipe has been added to your library
        </p>
        <button onClick={handleReset} className="btn-primary">
          Import Another Recipe
        </button>
      </div>
    )
  }

  if (extractedRecipe) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Review Extracted Recipe
          </h3>
          <button
            onClick={handleReset}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recipe Title *
            </label>
            <input
              type="text"
              value={extractedRecipe.title}
              onChange={(e) => updateExtractedRecipe('title', e.target.value)}
              className="form-input w-full"
              placeholder="Recipe name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={extractedRecipe.description}
              onChange={(e) => updateExtractedRecipe('description', e.target.value)}
              className="form-input w-full"
              rows="2"
              placeholder="Brief description"
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ingredients (one per line)
            </label>
            <textarea
              value={extractedRecipe.ingredients.join('\n')}
              onChange={(e) => updateExtractedRecipe('ingredients', e.target.value.split('\n').filter(i => i.trim()))}
              className="form-input w-full font-mono text-sm"
              rows="8"
              placeholder="1 cup flour&#10;2 eggs&#10;1 tsp salt"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Instructions (one per line)
            </label>
            <textarea
              value={extractedRecipe.instructions.join('\n')}
              onChange={(e) => updateExtractedRecipe('instructions', e.target.value.split('\n').filter(i => i.trim()))}
              className="form-input w-full font-mono text-sm"
              rows="8"
              placeholder="1. Preheat oven&#10;2. Mix ingredients&#10;3. Bake for 30 minutes"
            />
          </div>

          {/* Times and Servings */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prep Time (min)
              </label>
              <input
                type="number"
                value={extractedRecipe.prep_time}
                onChange={(e) => updateExtractedRecipe('prep_time', parseInt(e.target.value))}
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cook Time (min)
              </label>
              <input
                type="number"
                value={extractedRecipe.cook_time}
                onChange={(e) => updateExtractedRecipe('cook_time', parseInt(e.target.value))}
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Servings
              </label>
              <input
                type="number"
                value={extractedRecipe.servings}
                onChange={(e) => updateExtractedRecipe('servings', parseInt(e.target.value))}
                className="form-input w-full"
              />
            </div>
          </div>

          {/* Meal Type and Cuisine */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meal Type
              </label>
              <select
                value={extractedRecipe.meal_type}
                onChange={(e) => updateExtractedRecipe('meal_type', e.target.value)}
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
                value={extractedRecipe.cuisine}
                onChange={(e) => updateExtractedRecipe('cuisine', e.target.value)}
                className="form-input w-full"
                placeholder="e.g., Italian, Mexican"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveRecipe}
            disabled={uploading}
            className="flex-1 btn-primary"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Save Recipe</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-8">
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center mx-auto mb-4">
          <Upload className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Import Recipe from PDF
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Upload a PDF file and we'll extract the recipe data
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block w-full">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-temple-purple dark:hover:border-temple-gold transition-colors">
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-temple-purple dark:text-temple-gold" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setFile(null)
                  }}
                  className="p-1 text-gray-500 hover:text-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  PDF files only (max 10MB)
                </p>
              </>
            )}
          </div>
        </label>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Extract Button */}
      <button
        onClick={handleUploadAndExtract}
        disabled={!file || uploading || extracting}
        className="w-full btn-primary"
      >
        {extracting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Extracting Recipe...</span>
          </>
        ) : (
          <>
            <FileText className="w-5 h-5" />
            <span>Extract Recipe from PDF</span>
          </>
        )}
      </button>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> The extraction may not be perfect. You'll be able to review and edit the recipe data before saving.
        </p>
      </div>
    </div>
  )
}
