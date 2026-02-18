import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { useAuth } from '../contexts/AuthContext'
import { wellnessService } from '../services/wellnessService'
import { MealLogForm } from '../components/wellness/MealLogForm'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import { useGamification } from '../hooks/useGamification'

export const WellnessMealLog = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams() // edit mode if id present
  const [saving, setSaving] = useState(false)
  const [existingMeal, setExistingMeal] = useState(null)
  const [loading, setLoading] = useState(!!id)
  const { trackAction } = useGamification()

  // Load existing meal for edit mode
  useEffect(() => {
    if (!id || !user) return
    const loadMeal = async () => {
      setLoading(true)
      try {
        const meals = await wellnessService.getMealLogs(user.id, { limit: 500 })
        const meal = meals?.find(m => m.id === id)
        if (meal) {
          setExistingMeal(meal)
        } else {
          toast.error('Meal log not found')
          navigate('/wellness')
        }
      } catch (error) {
        console.error('Error loading meal:', error)
        toast.error('Failed to load meal log')
        navigate('/wellness')
      } finally {
        setLoading(false)
      }
    }
    loadMeal()
  }, [id, user])

  const handleSave = async (mealData) => {
    if (!user) return
    setSaving(true)
    try {
      if (id && existingMeal) {
        // Update existing
        await wellnessService.updateMealLog(id, mealData)
        toast.success('Meal log updated! 🍽️')
      } else {
        // Create new
        const saved = await wellnessService.createMealLog(user.id, mealData)
        trackAction('meal_logged', 'meal', saved?.id || null)
        toast.success('Meal logged! 🍽️')
      }
      navigate('/wellness')
    } catch (error) {
      console.error('Error saving meal:', error)
      toast.error('Failed to save meal. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
      <AppHeader title={id ? 'Edit Meal Log' : 'Log Meal'} showBackButton={true} backTo="/wellness" />
      <MealLogForm
        existingMeal={existingMeal}
        onSave={handleSave}
        onClose={() => navigate('/wellness')}
        variant="page"
        showClose={false}
      />
    </div>
    <BottomNav />
    </>
  )
}
