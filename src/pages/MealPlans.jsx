import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { mealPlanService } from '../features/mealplans/services/mealPlanService'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import { Plus, Calendar, Trash2, ShoppingCart, ChefHat, Sparkles } from 'lucide-react'

export const MealPlans = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (user) loadPlans()
  }, [user])

  const loadPlans = async () => {
    setLoading(true)
    const { data, error } = await mealPlanService.getMealPlans(user.id)
    if (!error) setPlans(data || [])
    setLoading(false)
  }

  const handleCreate = async () => {
    setCreating(true)
    // Default to next Monday
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek)
    const nextMonday = new Date(today)
    nextMonday.setDate(today.getDate() + daysUntilMonday)
    const weekStart = nextMonday.toISOString().split('T')[0]

    const { data, error } = await mealPlanService.createMealPlan(user.id, weekStart)
    if (!error && data) {
      navigate(`/meal-plans/${data.id}`)
    } else {
      toast.error('Failed to create meal plan')
    }
    setCreating(false)
  }

  const handleDelete = async (e, planId) => {
    e.stopPropagation()
    if (!confirm('Delete this meal plan?')) return
    const { error } = await mealPlanService.deleteMealPlan(planId)
    if (!error) {
      setPlans(plans.filter(p => p.id !== planId))
      toast.success('Meal plan deleted')
    }
  }

  const getMealCount = (plan) => plan.meal_plan_days?.length || 0

  const formatWeek = (dateStr) => {
    const d = new Date(dateStr)
    const end = new Date(d)
    end.setDate(end.getDate() + 6)
    return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }

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
      <AppHeader title="Meal Plans" />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Plan your weekly meals and generate shopping lists
          </p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {creating ? 'Creating...' : 'New Plan'}
          </button>
        </div>

        {/* Plans List */}
        {plans.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Meal Plans Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create a weekly meal plan to organise your recipes and generate a shopping list
            </p>
            <button onClick={handleCreate} disabled={creating} className="btn-primary">
              <Plus className="w-5 h-5 inline mr-2" />
              Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {plans.map(plan => (
              <div
                key={plan.id}
                onClick={() => navigate(`/meal-plans/${plan.id}`)}
                className="glass-card p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {plan.title || 'Untitled Plan'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{formatWeek(plan.week_start)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-3 py-1 rounded-full bg-temple-purple/10 dark:bg-temple-gold/10 text-temple-purple dark:text-temple-gold font-medium">
                        {getMealCount(plan)} meals planned
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/shopping-list/${plan.id}`)
                      }}
                      className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Shopping List"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, plan.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    <BottomNav />
    </>
  )
}
