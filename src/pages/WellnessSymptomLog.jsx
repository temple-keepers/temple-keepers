import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { useAuth } from '../contexts/AuthContext'
import { wellnessService } from '../features/wellness/services/wellnessService'
import { SymptomLogForm } from '../features/wellness/components/SymptomLogForm'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import { useGamification } from '../hooks/useGamification'

export const WellnessSymptomLog = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const { trackAction } = useGamification()

  const handleSave = async (symptomData) => {
    if (!user) return
    setSaving(true)
    try {
      const saved = await wellnessService.createSymptomLog(user.id, symptomData)
      trackAction('symptom_logged', 'symptom', saved?.id || null)
      toast.success('Symptom logged!')
      navigate('/wellness')
    } catch (error) {
      console.error('Error saving symptom:', error)
      toast.error('Failed to save symptom. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
      <AppHeader title="Log Symptom" showBackButton={true} backTo="/wellness" />
      <SymptomLogForm
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
