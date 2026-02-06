import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { useAuth } from '../contexts/AuthContext'
import { wellnessService } from '../features/wellness/services/wellnessService'
import { MealLogForm } from '../features/wellness/components/MealLogForm'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'

export const WellnessMealLog = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const handleSave = async (mealData) => {
    if (!user) return
    setSaving(true)
    try {
      await wellnessService.createMealLog(user.id, mealData)
      toast.success('Meal logged! 🍽️')
      navigate('/wellness')
    } catch (error) {
      console.error('Error saving meal:', error)
      toast.error('Failed to save meal. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
      <AppHeader title="Log Meal" showBackButton={true} backTo="/wellness" />
      <MealLogForm
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
