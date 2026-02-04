import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useEnrollment } from '../hooks/useEnrollment'
import { StartDateModal } from '../components/StartDateModal'
import { FastingTypeSelector } from '../features/fasting/components/FastingTypeSelector'
import { useActiveCohorts } from '../features/fasting/hooks/useFasting'
import { AppHeader } from '../components/AppHeader'
import { ArrowLeft, Calendar, Clock, BookOpen, Check } from 'lucide-react'

export const ProgramDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getEnrollment, enrollInProgram } = useEnrollment()
  
  const [program, setProgram] = useState(null)
  const [days, setDays] = useState([])
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [showStartDateModal, setShowStartDateModal] = useState(false)
  const [showFastingSelector, setShowFastingSelector] = useState(false)
  const [fastingSelection, setFastingSelection] = useState(null)
  
  // Get active cohorts for fasting programs
  const { cohorts } = useActiveCohorts(program?.id)

  useEffect(() => {
    loadProgram()
  }, [slug])

  const loadProgram = async () => {
    setLoading(true)
    
    // Load program
    const { data: programData, error } = await supabase
      .from('programs')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    
    if (error || !programData) {
      navigate('/programs')
      return
    }
    
    setProgram(programData)
    
    // Load days
    const { data: daysData } = await supabase
      .from('program_days')
      .select('*')
      .eq('program_id', programData.id)
      .order('day_number', { ascending: true })
      
    if (daysData) {
      setDays(daysData)
    }
    
    // Check enrollment
    const { data: enrollmentData } = await getEnrollment(programData.id)
    if (enrollmentData) {
      setEnrollment(enrollmentData)
    }
    
    setLoading(false)
  }

  const handleEnroll = () => {
    // If fasting program, show fasting selector first
    if (program?.program_type === 'fasting') {
      setShowFastingSelector(true)
    } else {
      setShowStartDateModal(true)
    }
  }

  const handleFastingSelect = (selection) => {
    setFastingSelection(selection)
    setShowFastingSelector(false)
    setShowStartDateModal(true)
  }

  const handleStartDateConfirm = async (startDate) => {
    if (!program) return
    
    setShowStartDateModal(false)
    setEnrolling(true)
    
    // For fasting programs, add cohort and fasting type
    const enrollmentData = {
      program_id: program.id,
      start_date: startDate
    }

    if (program.program_type === 'fasting' && fastingSelection) {
      enrollmentData.fasting_type = fastingSelection.fasting_type
      enrollmentData.fasting_window = fastingSelection.fasting_window
      // Use first available cohort
      if (cohorts && cohorts.length > 0) {
        enrollmentData.cohort_id = cohorts[0].id
      }
    }
    
    const { data, error } = await enrollInProgram(enrollmentData)
    
    if (!error && data) {
      // Navigate to Day 1
      navigate(`/programs/${program.slug}/day/1`)
    } else {
      alert(error?.message || 'Failed to enroll')
    }
    
    setEnrolling(false)
  }

  const handleContinue = () => {
    if (enrollment) {
      // Calculate next uncompleted day
      const completedDaysSet = new Set(enrollment.completed_days || [])
      const startDate = new Date(enrollment.start_date)
      const today = new Date()
      const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))
      const maxUnlockedDay = Math.min(daysSinceStart + 1, program.duration_days)
      
      // Find first uncompleted day within unlocked range
      let nextDay = 1
      for (let i = 1; i <= maxUnlockedDay; i++) {
        if (!completedDaysSet.has(i)) {
          nextDay = i
          break
        }
      }
      
      // If all unlocked days are complete, show the latest unlocked day
      if (completedDaysSet.has(nextDay) && nextDay < maxUnlockedDay) {
        nextDay = maxUnlockedDay
      }
      
      navigate(`/programs/${program.slug}/day/${nextDay}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!program) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <AppHeader showBackButton={true} backTo="/programs" />

      {/* Program Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold gradient-text mb-4">
            {program.title}
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {program.description}
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">{program.duration_days} days</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Clock className="w-5 h-5" />
              <span className="font-medium">20-30 min/day</span>
            </div>
            {(program.program_type === 'fasting' || program.program_type === 'hybrid') && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">{program.has_live_sessions ? 'Fasting + Live Sessions' : 'Includes Fasting'}</span>
              </div>
            )}
          </div>

          {/* CTA */}
          {enrollment ? (
            <button
              onClick={handleContinue}
              className="btn-primary"
            >
              Continue Program (Day {enrollment.current_day})
            </button>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="btn-primary"
            >
              {enrolling ? 'Enrolling...' : 'Start This Program'}
            </button>
          )}
        </div>
      </div>

      {/* Program Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* What to Expect */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            What to Expect
          </h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-400">
            <p>Each day includes:</p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-temple-purple dark:text-temple-gold mt-1">•</span>
                <span><strong>Scripture</strong> — Daily NKJV passage with reflection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-temple-purple dark:text-temple-gold mt-1">•</span>
                <span><strong>Focus Thought</strong> — Why today matters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-temple-purple dark:text-temple-gold mt-1">•</span>
                <span><strong>Prayer</strong> — Guided prayer prompt</span>
              </li>
              {(program.program_type === 'fasting' || program.program_type === 'hybrid') && (
                <li className="flex items-start gap-2">
                  <span className="text-temple-purple dark:text-temple-gold mt-1">•</span>
                  <span><strong>Fasting Tracker</strong> — Daily compliance tracking</span>
                </li>
              )}
              {program.has_live_sessions && (
                <li className="flex items-start gap-2">
                  <span className="text-temple-purple dark:text-temple-gold mt-1">•</span>
                  <span><strong>Live Sessions</strong> — Weekly Zoom gatherings</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-temple-purple dark:text-temple-gold mt-1">•</span>
                <span><strong>Reflection</strong> — Personal questions for journaling</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-temple-purple dark:text-temple-gold mt-1">•</span>
                <span><strong>Action Step</strong> — One small, doable action</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Daily Overview */}
        {days.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Daily Journey
            </h2>
            <div className="space-y-2">
              {days.map(day => (
                <div
                  key={day.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-temple-purple/10 dark:bg-temple-gold/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-temple-purple dark:text-temple-gold">
                      {day.day_number}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {day.title}
                    </h3>
                    {day.anchor_sentence && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {day.anchor_sentence}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grace-Based Approach */}
        <div className="glass-card p-6 bg-temple-purple/5 dark:bg-temple-gold/5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Grace-Based Journey
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            This isn't about perfection. Missed a day? No problem. Pick up where you left off. 
            God's grace covers every gap, and transformation happens through gentle, consistent steps.
          </p>
        </div>
      </div>

      {/* Fasting Type Selector Modal */}
      {showFastingSelector && (
        <FastingTypeSelector
          onSelect={handleFastingSelect}
          onClose={() => setShowFastingSelector(false)}
        />
      )}

      {/* Start Date Modal */}
      <StartDateModal
        isOpen={showStartDateModal}
        onClose={() => setShowStartDateModal(false)}
        onConfirm={handleStartDateConfirm}
        programTitle={program?.title}
      />
    </div>
  )
}
