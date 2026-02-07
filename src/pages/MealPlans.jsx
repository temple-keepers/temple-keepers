import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { mealPlanService } from '../features/mealplans/services/mealPlanService'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import { Plus, Calendar, Trash2, ShoppingCart, ChefHat, X, ChevronLeft, ChevronRight, Warehouse, Info } from 'lucide-react'
import { useConfirm } from '../components/ConfirmModal'

// Get Monday of a given week
const getMonday = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Format a date range for display
const formatWeekRange = (monday) => {
  const end = new Date(monday)
  end.setDate(end.getDate() + 6)
  return `${monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

export const MealPlans = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showWeekPicker, setShowWeekPicker] = useState(false)
  const [pickerMonth, setPickerMonth] = useState(new Date())

  useEffect(() => {
    if (user) loadPlans()
  }, [user])

  const loadPlans = async () => {
    setLoading(true)
    const { data, error } = await mealPlanService.getMealPlans(user.id)
    if (!error) setPlans(data || [])
    setLoading(false)
  }

  const handleCreateForWeek = async (weekStart) => {
    setCreating(true)
    setShowWeekPicker(false)
    const dateStr = weekStart.toISOString().split('T')[0]

    const { data, error } = await mealPlanService.createMealPlan(user.id, dateStr)
    if (!error && data) {
      navigate(`/meal-plans/${data.id}`)
    } else {
      toast.error('Failed to create meal plan')
    }
    setCreating(false)
  }

  const handleDelete = async (e, planId) => {
    e.stopPropagation()
    const yes = await confirm({
      title: 'Delete Meal Plan',
      message: 'This will remove the meal plan and its shopping list. This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    })
    if (!yes) return
    const { error } = await mealPlanService.deleteMealPlan(planId)
    if (!error) {
      setPlans(plans.filter(p => p.id !== planId))
      toast.success('Meal plan deleted')
    }
  }

  const getMealCount = (plan) => plan.meal_plan_days?.length || 0

  const formatWeek = (dateStr) => {
    const d = new Date(dateStr)
    return formatWeekRange(d)
  }

  // Check if a week already has a plan
  const weekHasPlan = (monday) => {
    const dateStr = monday.toISOString().split('T')[0]
    return plans.some(p => p.week_start === dateStr)
  }

  // Generate weeks for the picker month
  const getWeeksInMonth = () => {
    const year = pickerMonth.getFullYear()
    const month = pickerMonth.getMonth()
    const weeks = []

    // Start from the Monday of the week containing the 1st
    const firstDay = new Date(year, month, 1)
    let monday = getMonday(firstDay)

    // Generate weeks until we pass the end of the month
    const lastDay = new Date(year, month + 1, 0)
    while (monday <= lastDay) {
      const sunday = new Date(monday)
      sunday.setDate(sunday.getDate() + 6)

      // Include week if any day falls in this month
      if (sunday.getMonth() === month || monday.getMonth() === month) {
        weeks.push(new Date(monday))
      }
      monday = new Date(monday)
      monday.setDate(monday.getDate() + 7)
    }

    return weeks
  }

  const isCurrentWeek = (monday) => {
    const today = getMonday(new Date())
    return monday.toDateString() === today.toDateString()
  }

  const isPastWeek = (monday) => {
    const today = getMonday(new Date())
    return monday < today
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
        {/* How it works */}
        <div className="glass-card p-4 mb-4 border-l-4 border-temple-purple dark:border-temple-gold">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-temple-purple dark:text-temple-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                <strong>Plan your meals for any week.</strong> Create a plan, fill it with your saved recipes (or auto-generate), then get a combined shopping list with bulk ingredients.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tip: Add items to your <button onClick={() => navigate('/pantry')} className="text-temple-purple dark:text-temple-gold font-medium underline">Pantry</button> first — they'll be automatically checked off your shopping list.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setShowWeekPicker(true)}
            disabled={creating}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {creating ? 'Creating...' : 'New Plan'}
          </button>
          <button
            onClick={() => navigate('/pantry')}
            className="btn-secondary flex items-center gap-2"
          >
            <Warehouse className="w-5 h-5" />
            My Pantry
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
            <button
              onClick={() => setShowWeekPicker(true)}
              disabled={creating}
              className="btn-primary"
            >
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

    {/* Week Picker Modal */}
    {showWeekPicker && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setShowWeekPicker(false)}>
        <div
          className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Choose a Week
            </h3>
            <button
              onClick={() => setShowWeekPicker(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-base font-semibold text-gray-900 dark:text-white">
              {pickerMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Week List */}
          <div className="px-4 pb-6 space-y-2 max-h-[50vh] overflow-y-auto">
            {getWeeksInMonth().map((monday) => {
              const hasPlan = weekHasPlan(monday)
              const current = isCurrentWeek(monday)
              const past = isPastWeek(monday)

              return (
                <button
                  key={monday.toISOString()}
                  onClick={() => !hasPlan && handleCreateForWeek(monday)}
                  disabled={hasPlan}
                  className={`
                    w-full p-4 rounded-xl text-left transition-all flex items-center justify-between
                    ${hasPlan
                      ? 'bg-gray-50 dark:bg-gray-700/30 opacity-60 cursor-not-allowed'
                      : current
                        ? 'bg-temple-purple/10 dark:bg-temple-gold/10 border-2 border-temple-purple dark:border-temple-gold hover:bg-temple-purple/20 dark:hover:bg-temple-gold/20'
                        : past
                          ? 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                          : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm font-medium ${current ? 'text-temple-purple dark:text-temple-gold' : 'text-gray-900 dark:text-white'}`}>
                        {formatWeekRange(monday)}
                      </span>
                    </div>
                    {current && (
                      <span className="text-xs text-temple-purple dark:text-temple-gold font-medium mt-1 inline-block">
                        This week
                      </span>
                    )}
                  </div>
                  {hasPlan ? (
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-600">
                      Plan exists
                    </span>
                  ) : (
                    <Plus className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )}
    </>
  )
}
