import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { mealPlanService } from '../features/mealplans/services/mealPlanService'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import { 
  Check, Plus, Trash2, ShoppingCart, ChevronDown, ChevronRight,
  RefreshCw, Package, Info, Warehouse, Share2
} from 'lucide-react'
import { shareShoppingListPdf } from '../utils/sharePdf'

export const ShoppingList = () => {
  const { planId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [list, setList] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [collapsedCategories, setCollapsedCategories] = useState(new Set())

  // Manual add
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemAmount, setNewItemAmount] = useState('')
  const [newItemUnit, setNewItemUnit] = useState('')

  useEffect(() => {
    if (user && planId) loadOrGenerate()
  }, [user, planId])

  const loadOrGenerate = async () => {
    setLoading(true)

    const { data: lists } = await mealPlanService.getShoppingLists(user.id)
    const existing = lists?.find(l => l.meal_plan_id === planId)

    if (existing) {
      setList(existing)
      setItems(existing.items || [])
    } else {
      await handleRegenerate()
    }
    setLoading(false)
  }

  const handleRegenerate = async () => {
    setGenerating(true)
    const { data, error } = await mealPlanService.generateShoppingList(user.id, planId)
    if (!error && data) {
      setList(data)
      setItems(data.items || [])
      toast.success('Shopping list updated!')
    } else {
      toast.error('Failed to generate list. Add recipes to your meal plan first.')
    }
    setGenerating(false)
  }

  const toggleItem = async (index) => {
    const updated = [...items]
    updated[index] = { ...updated[index], checked: !updated[index].checked }
    setItems(updated)

    if (list?.id) {
      await mealPlanService.updateShoppingListItems(list.id, updated)
    }
  }

  const removeItem = async (index) => {
    const updated = items.filter((_, i) => i !== index)
    setItems(updated)

    if (list?.id) {
      await mealPlanService.updateShoppingListItems(list.id, updated)
    }
  }

  const handleAddItem = async () => {
    if (!newItemName.trim()) return

    const newItem = {
      name: newItemName.trim(),
      amount: newItemAmount ? parseFloat(newItemAmount) : null,
      unit: newItemUnit.trim(),
      category: mealPlanService.categorizeIngredient(newItemName.trim()),
      checked: false,
      recipes: ['Manual'],
      isManual: true,
    }

    const updated = [...items, newItem]
    setItems(updated)
    setNewItemName('')
    setNewItemAmount('')
    setNewItemUnit('')
    setShowAddForm(false)

    if (list?.id) {
      await mealPlanService.updateShoppingListItems(list.id, updated)
      toast.success('Item added!')
    }
  }

  const toggleCategory = (category) => {
    const updated = new Set(collapsedCategories)
    if (updated.has(category)) {
      updated.delete(category)
    } else {
      updated.add(category)
    }
    setCollapsedCategories(updated)
  }

  // Share shopping list as PDF
  const [sharing, setSharing] = useState(false)

  const handleShareList = async () => {
    setSharing(true)
    try {
      await shareShoppingListPdf(items, list?.title || 'Shopping List')
      toast.success('PDF ready!')
    } catch (err) {
      console.error('Share failed:', err)
      toast.error('Failed to generate PDF')
    } finally {
      setSharing(false)
    }
  }

  // Group items by category
  const groupedItems = items.reduce((acc, item, index) => {
    const cat = item.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push({ ...item, _index: index })
    return acc
  }, {})

  const categoryOrder = [
    'Produce', 'Protein', 'Dairy', 'Grains & Pasta', 
    'Canned & Dry', 'Oils & Condiments', 'Spices', 'Nuts & Seeds', 'Other'
  ]

  const sortedCategories = Object.keys(groupedItems).sort(
    (a, b) => (categoryOrder.indexOf(a) === -1 ? 99 : categoryOrder.indexOf(a)) -
              (categoryOrder.indexOf(b) === -1 ? 99 : categoryOrder.indexOf(b))
  )

  const checkedCount = items.filter(i => i.checked).length
  const pantryCount = items.filter(i => i.inPantry).length
  const needToBuyCount = items.filter(i => !i.inPantry && !i.checked).length
  const totalCount = items.length
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

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
      <AppHeader title="Shopping List" showBackButton={true} backTo={`/meal-plans/${planId}`} />

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Intro */}
        <div className="glass-card p-4 mb-4 border-l-4 border-temple-purple dark:border-temple-gold">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-temple-purple dark:text-temple-gold flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Ingredients from all your recipes have been <strong>combined into bulk amounts</strong>. Tick items off as you shop. 
              {pantryCount > 0 && (
                <span className="text-green-600 dark:text-green-400"> {pantryCount} item{pantryCount !== 1 ? 's' : ''} already in your pantry {pantryCount !== 1 ? 'are' : 'is'} pre-checked.</span>
              )}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="glass-card p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {checkedCount} of {totalCount} items checked
                {needToBuyCount > 0 && (
                  <span className="text-gray-500 dark:text-gray-400"> · {needToBuyCount} to buy</span>
                )}
              </span>
              <span className="text-sm font-bold text-temple-purple dark:text-temple-gold">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
          <button
            onClick={handleRegenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
          <button
            onClick={() => navigate('/pantry')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
          >
            <Warehouse className="w-4 h-4" />
            My Pantry
          </button>
          <button
            onClick={handleShareList}
            disabled={sharing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm transition-colors disabled:opacity-50"
          >
            <Share2 className={`w-4 h-4 ${sharing ? 'animate-pulse' : ''}`} />
            {sharing ? 'Creating PDF...' : 'Share PDF'}
          </button>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <div className="glass-card p-4 mb-6">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Add a custom item</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Need something that's not in your recipes? Add it here.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Item name..."
                className="form-input flex-1"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              />
              <input
                type="number"
                value={newItemAmount}
                onChange={(e) => setNewItemAmount(e.target.value)}
                placeholder="Qty"
                className="form-input w-20"
              />
              <input
                type="text"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                placeholder="Unit"
                className="form-input w-20"
              />
              <button onClick={handleAddItem} className="btn-primary px-4">
                Add
              </button>
            </div>
          </div>
        )}

        {/* Shopping List by Category */}
        {totalCount === 0 ? (
          <div className="glass-card p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Items Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add recipes to your meal plan first, then come back to generate your combined shopping list.
            </p>
            <button onClick={() => navigate(`/meal-plans/${planId}`)} className="btn-primary">
              Go to Meal Plan
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCategories.map(category => {
              const categoryItems = groupedItems[category]
              const isCollapsed = collapsedCategories.has(category)
              const checkedInCategory = categoryItems.filter(i => i.checked).length

              return (
                <div key={category} className="glass-card overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {category}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {checkedInCategory}/{categoryItems.length}
                      </span>
                    </div>
                    {isCollapsed ? (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Items */}
                  {!isCollapsed && (
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      {categoryItems.map((item) => (
                        <div
                          key={item._index}
                          className={`flex items-center gap-3 px-4 py-3 border-b last:border-b-0 border-gray-100 dark:border-gray-700/50 transition-colors ${
                            item.checked ? 'bg-green-50/50 dark:bg-green-900/10' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleItem(item._index)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              item.checked
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 dark:border-gray-600 hover:border-temple-purple dark:hover:border-temple-gold'
                            }`}
                          >
                            {item.checked && <Check className="w-4 h-4" />}
                          </button>

                          {/* Item Details */}
                          <div className={`flex-1 min-w-0 ${item.checked ? 'opacity-50' : ''}`}>
                            <div className={`text-sm font-medium ${item.checked ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                              {item.amount && <span className="text-temple-purple dark:text-temple-gold">{item.amount} {item.unit} </span>}
                              {item.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {item.inPantry && (
                                <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                                  <Warehouse className="w-3 h-3" />
                                  In pantry
                                </span>
                              )}
                              {item.recipes?.length > 0 && item.recipes[0] !== 'Manual' && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {item.inPantry ? '· ' : ''}For: {item.recipes.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Delete */}
                          <button
                            onClick={() => removeItem(item._index)}
                            className="p-1 rounded text-gray-400 hover:text-red-500 flex-shrink-0"
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
      </div>
    </div>
    <BottomNav />
    </>
  )
}
