import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { mealPlanService } from '../features/mealplans/services/mealPlanService'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import {
  Plus, Trash2, Package, ChevronDown, ChevronRight, X, Search,
  ShoppingCart, Info, Warehouse
} from 'lucide-react'
import { useConfirm } from '../components/ConfirmModal'

// Common pantry staples users can quickly add
const STAPLE_SUGGESTIONS = {
  'Spices & Seasonings': ['Salt', 'Black pepper', 'Cumin', 'Paprika', 'Turmeric', 'Cinnamon', 'Oregano', 'Thyme', 'Chilli flakes', 'Garlic powder', 'Onion powder', 'Mixed herbs'],
  'Oils & Condiments': ['Olive oil', 'Coconut oil', 'Vegetable oil', 'Soy sauce', 'Vinegar', 'Honey', 'Mustard', 'Tomato paste'],
  'Grains & Pasta': ['Rice', 'Pasta', 'Oats', 'Flour', 'Bread', 'Quinoa', 'Couscous'],
  'Canned & Dry': ['Tinned tomatoes', 'Chickpeas', 'Lentils', 'Beans', 'Coconut milk', 'Stock cubes'],
  'Nuts & Seeds': ['Almonds', 'Walnuts', 'Chia seeds', 'Flaxseed', 'Sesame seeds'],
}

export const Pantry = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const [pantryItems, setPantryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showStaples, setShowStaples] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedCategories, setCollapsedCategories] = useState(new Set())

  useEffect(() => {
    if (user) loadPantry()
  }, [user])

  const loadPantry = async () => {
    setLoading(true)
    const { data, error } = await mealPlanService.getPantry(user.id)
    if (!error) setPantryItems(data || [])
    setLoading(false)
  }

  const handleAddItem = async () => {
    if (!newItemName.trim()) return
    const { error } = await mealPlanService.addToPantry(user.id, newItemName.trim())
    if (!error) {
      await loadPantry()
      setNewItemName('')
      toast.success(`Added "${newItemName.trim()}"`)
    } else {
      toast.error('Failed to add item')
    }
  }

  const handleAddStaple = async (name) => {
    const { error } = await mealPlanService.addToPantry(user.id, name)
    if (!error) {
      await loadPantry()
      toast.success(`Added "${name}"`)
    }
  }

  const handleAddAllStaples = async (category, items) => {
    const { error } = await mealPlanService.addManyToPantry(user.id, items)
    if (!error) {
      await loadPantry()
      toast.success(`Added ${items.length} ${category} items`)
    }
  }

  const handleRemoveItem = async (pantryId, name) => {
    const { error } = await mealPlanService.removeFromPantry(pantryId)
    if (!error) {
      setPantryItems(prev => prev.filter(p => p.id !== pantryId))
      toast.success(`Removed "${name}"`)
    }
  }

  const handleClearAll = async () => {
    const yes = await confirm({
      title: 'Clear Pantry',
      message: 'Remove all items from your pantry? This cannot be undone.',
      confirmLabel: 'Clear All',
      variant: 'danger',
    })
    if (!yes) return
    const { error } = await mealPlanService.clearPantry(user.id)
    if (!error) {
      setPantryItems([])
      toast.success('Pantry cleared')
    }
  }

  const toggleCategory = (cat) => {
    const updated = new Set(collapsedCategories)
    if (updated.has(cat)) updated.delete(cat)
    else updated.add(cat)
    setCollapsedCategories(updated)
  }

  // Check if a staple is already in pantry
  const isInPantry = (name) => {
    const norm = mealPlanService.normaliseIngredientName(name)
    return pantryItems.some(p => mealPlanService.normaliseIngredientName(p.item_name) === norm)
  }

  // Group pantry items by category
  const filtered = searchQuery
    ? pantryItems.filter(p => p.item_name.toLowerCase().includes(searchQuery.toLowerCase()))
    : pantryItems

  const grouped = filtered.reduce((acc, item) => {
    const cat = item.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const categoryOrder = [
    'Produce', 'Protein', 'Dairy', 'Grains & Pasta',
    'Canned & Dry', 'Oils & Condiments', 'Spices', 'Nuts & Seeds', 'Other'
  ]

  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => (categoryOrder.indexOf(a) === -1 ? 99 : categoryOrder.indexOf(a)) -
              (categoryOrder.indexOf(b) === -1 ? 99 : categoryOrder.indexOf(b))
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
      <AppHeader title="My Pantry" showBackButton={true} backTo="/recipes" />

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Intro */}
        <div className="glass-card p-4 mb-6 border-l-4 border-temple-purple dark:border-temple-gold">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-temple-purple dark:text-temple-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                <strong>Track what you already have at home.</strong> When you generate a shopping list from a meal plan, items in your pantry will be automatically marked off — so you only see what you need to buy.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tip: Use the "Quick Add Staples" button below to add common kitchen basics in one tap.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-temple-purple dark:bg-temple-gold text-white font-medium text-sm hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
          <button
            onClick={() => setShowStaples(!showStaples)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
          >
            <Warehouse className="w-4 h-4" />
            Quick Add Staples
          </button>
          {pantryItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm transition-colors ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <div className="glass-card p-4 mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder="e.g., Olive oil, Rice, Garlic..."
                className="form-input flex-1"
                autoFocus
              />
              <button onClick={handleAddItem} className="btn-primary px-4">
                Add
              </button>
            </div>
          </div>
        )}

        {/* Quick Add Staples */}
        {showStaples && (
          <div className="glass-card p-4 mb-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Tap items to add them to your pantry
              </h3>
              <button onClick={() => setShowStaples(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            {Object.entries(STAPLE_SUGGESTIONS).map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {category}
                  </span>
                  <button
                    onClick={() => handleAddAllStaples(category, items.filter(i => !isInPantry(i)))}
                    className="text-xs text-temple-purple dark:text-temple-gold font-medium hover:underline"
                  >
                    Add all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map(name => {
                    const alreadyAdded = isInPantry(name)
                    return (
                      <button
                        key={name}
                        onClick={() => !alreadyAdded && handleAddStaple(name)}
                        disabled={alreadyAdded}
                        className={`
                          px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                          ${alreadyAdded
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-default'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-temple-purple/10 dark:hover:bg-temple-gold/10 hover:text-temple-purple dark:hover:text-temple-gold'
                          }
                        `}
                      >
                        {alreadyAdded ? '✓ ' : '+ '}{name}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search (show when items exist) */}
        {pantryItems.length > 5 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your pantry..."
              className="form-input pl-10"
            />
          </div>
        )}

        {/* Pantry Count */}
        {pantryItems.length > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {pantryItems.length} item{pantryItems.length !== 1 ? 's' : ''} in your pantry
          </p>
        )}

        {/* Pantry List */}
        {filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Warehouse className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {pantryItems.length === 0 ? 'Your Pantry is Empty' : 'No matching items'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {pantryItems.length === 0
                ? 'Add the ingredients you already have at home. When you create a shopping list, these items will be automatically checked off.'
                : 'Try a different search term'
              }
            </p>
            {pantryItems.length === 0 && (
              <button
                onClick={() => setShowStaples(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Warehouse className="w-5 h-5" />
                Quick Add Staples
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCategories.map(category => {
              const categoryItems = grouped[category]
              const isCollapsed = collapsedCategories.has(category)

              return (
                <div key={category} className="glass-card overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                      <span className="font-semibold text-gray-900 dark:text-white">{category}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {isCollapsed
                      ? <ChevronRight className="w-5 h-5 text-gray-400" />
                      : <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </button>

                  {!isCollapsed && (
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      {categoryItems.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 border-gray-100 dark:border-gray-700/50"
                        >
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.item_name}
                          </span>
                          <button
                            onClick={() => handleRemoveItem(item.id, item.item_name)}
                            className="p-1 rounded text-gray-400 hover:text-red-500 flex-shrink-0"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Navigation hint */}
        {pantryItems.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/meal-plans')}
              className="inline-flex items-center gap-2 text-sm text-temple-purple dark:text-temple-gold font-medium hover:underline"
            >
              <ShoppingCart className="w-4 h-4" />
              Go to Meal Plans to generate a shopping list
            </button>
          </div>
        )}
      </div>
    </div>
    <BottomNav />
    </>
  )
}
