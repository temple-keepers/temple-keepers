import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { useAuth } from '../contexts/AuthContext'
import { wellnessService } from '../services/wellnessService'
import { SymptomLogForm } from '../components/wellness/SymptomLogForm'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import { useGamification } from '../hooks/useGamification'

export const WellnessSymptomLog = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const [saving, setSaving] = useState(false)
  const [existingSymptom, setExistingSymptom] = useState(null)
  const [loading, setLoading] = useState(!!id)
  const { trackAction } = useGamification()

  // Load existing symptom for edit mode
  useEffect(() => {
    if (!id || !user) return
    const loadSymptom = async () => {
      setLoading(true)
      try {
        const symptoms = await wellnessService.getSymptomLogs(user.id, { limit: 500 })
        const symptom = symptoms?.find(s => s.id === id)
        if (symptom) {
          setExistingSymptom(symptom)
        } else {
          toast.error('Symptom log not found')
          navigate('/wellness')
        }
      } catch (error) {
        console.error('Error loading symptom:', error)
        toast.error('Failed to load symptom log')
        navigate('/wellness')
      } finally {
        setLoading(false)
      }
    }
    loadSymptom()
  }, [id, user])

  const handleSave = async (symptomData) => {
    if (!user) return
    setSaving(true)
    try {
      if (id && existingSymptom) {
        await wellnessService.updateSymptomLog(id, symptomData)
        toast.success('Symptom log updated!')
      } else {
        const saved = await wellnessService.createSymptomLog(user.id, symptomData)
        trackAction('symptom_logged', 'symptom', saved?.id || null)
        toast.success('Symptom logged!')
      }
      navigate('/wellness')
    } catch (error) {
      console.error('Error saving symptom:', error)
      toast.error('Failed to save symptom. Please try again.')
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
      <AppHeader title={id ? 'Edit Symptom' : 'Log Symptom'} showBackButton={true} backTo="/wellness" />
      <SymptomLogForm
        existingSymptom={existingSymptom}
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
