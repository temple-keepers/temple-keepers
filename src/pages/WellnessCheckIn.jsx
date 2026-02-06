import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { useAuth } from '../contexts/AuthContext'
import { wellnessService } from '../features/wellness/services/wellnessService'
import { CheckInForm } from '../features/wellness/components/CheckInForm'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'

export const WellnessCheckIn = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [existingCheckIn, setExistingCheckIn] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadExisting()
  }, [user])

  const loadExisting = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const existing = await wellnessService.getCheckInByDate(user.id, today)
      setExistingCheckIn(existing)
    } catch (error) {
      console.error('Error loading existing check-in:', error)
      setExistingCheckIn(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (checkInData) => {
    try {
      await wellnessService.saveCheckIn(user.id, checkInData)
      toast.success('Check-in saved! 🙏')
      navigate('/wellness')
    } catch (error) {
      console.error('Error saving check-in:', error)
      toast.error('Failed to save check-in. Please try again.')
    }
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
      <AppHeader title="Daily Check-In" showBackButton={true} backTo="/wellness" />
      <CheckInForm
        existingCheckIn={existingCheckIn}
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
