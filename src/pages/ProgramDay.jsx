import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useEnrollment } from '../hooks/useEnrollment'
import { FastingTracker } from '../features/fasting/components/FastingTracker'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import { ArrowLeft, ArrowRight, Check, BookOpen } from 'lucide-react'
import { ChangeFastingType } from '../features/fasting/components/ChangeFastingType'
import { ghlService } from '../services/ghlService'

export const ProgramDay = () => {
  const { slug, dayNumber } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const {
    getEnrollment,
    markDayComplete,
    isDayCompleted
  } = useEnrollment()

  const [program, setProgram] = useState(null)
  const [day, setDay] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reflectionAnswers, setReflectionAnswers] = useState({})

  useEffect(() => {
    loadDayContent()
  }, [slug, dayNumber])

  const loadDayContent = async () => {
    setLoading(true)

    // Get program
    const { data: programData } = await supabase
      .from('programs')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
      
    if (!programData) {
      navigate('/programs')
      return
    }
    setProgram(programData)

    // Check enrollment
    const { data: enrollmentData } = await getEnrollment(programData.id)
    if (!enrollmentData) {
      navigate(`/programs/${slug}`)
      return
    }
    setEnrollment(enrollmentData)

    // Calculate which day is currently unlocked
    const startDate = new Date(enrollmentData.start_date + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))
    const currentUnlockedDay = daysSinceStart + 1 // Day 1 unlocks on start date
    
    const requestedDay = parseInt(dayNumber)
    
    // Check if requested day is locked
    if (requestedDay > currentUnlockedDay) {
      setLoading(false)
      return // Will show locked state
    }

    // Get day content
    const { data: dayData } = await supabase
      .from('program_days')
      .select('*')
      .eq('program_id', programData.id)
      .eq('day_number', requestedDay)
      .single()
      
    if (!dayData) {
      navigate(`/programs/${slug}`)
      return
    }
    setDay(dayData)

    // Check if completed
    const completed = await isDayCompleted(enrollmentData.id, requestedDay)
    setIsCompleted(completed)
    
    // Load existing reflection if completed
    if (completed) {
      const { data: completion } = await supabase
        .from('program_day_completions')
        .select('reflection_response')
        .eq('enrollment_id', enrollmentData.id)
        .eq('day_number', requestedDay)
        .single()
        
      if (completion?.reflection_response) {
        setReflectionAnswers(completion.reflection_response)
      }
    }

    setLoading(false)
  }

  const handleReflectionChange = (index, value) => {
    setReflectionAnswers(prev => ({
      ...prev,
      [index]: value
    }))
  }

  const handleComplete = async () => {
    if (!enrollment || !day) return

    setSaving(true)

    const { error } = await markDayComplete(
      enrollment.id,
      parseInt(dayNumber),
      reflectionAnswers
    )

    if (!error) {
      // Track day completion in GHL (non-blocking)
      ghlService.trackDayCompleted(profile, program, parseInt(dayNumber), day.title)

      // Check if this was the last day → program completed
      const completedCount = (enrollment.completed_days?.length || 0) + 1
      if (completedCount >= program.duration_days) {
        ghlService.trackProgramCompleted(profile, program)
      }

      // Reload to show completion
      await loadDayContent()
    } else {
      toast.error('Failed to save completion')
    }

    setSaving(false)
  }

  const goToDay = (newDayNumber) => {
    navigate(`/programs/${slug}/day/${newDayNumber}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!program || !enrollment) return null

  const currentDayNum = parseInt(dayNumber)
  const canGoPrevious = currentDayNum > 1
  
  // Calculate unlocked day
  const startDate = new Date(enrollment.start_date + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))
  const currentUnlockedDay = Math.min(daysSinceStart + 1, program.duration_days)
  const isLocked = currentDayNum > currentUnlockedDay

  // Only allow navigating to next day if it's unlocked
  const nextDayIsUnlocked = (currentDayNum + 1) <= currentUnlockedDay
  const canGoNext = currentDayNum < program.duration_days && nextDayIsUnlocked

  // Show locked state
  if (isLocked && !day) {
    const daysUntilUnlock = currentDayNum - currentUnlockedDay
    const unlockDate = new Date(startDate)
    unlockDate.setDate(unlockDate.getDate() + (currentDayNum - 1))
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/today')}
                className="flex items-center gap-2 text-sm text-temple-purple dark:text-temple-gold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Today
              </button>
              
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Day {currentDayNum} of {program.duration_days}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Day {currentDayNum} is Locked
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              This day will unlock on <strong>{unlockDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
            </p>
            
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
              {daysUntilUnlock === 1 ? 'Unlocks tomorrow' : `Unlocks in ${daysUntilUnlock} days`}
            </p>

            <div className="flex gap-3 justify-center">
              {canGoPrevious && (
                <button
                  onClick={() => goToDay(currentDayNum - 1)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Go to Day {currentDayNum - 1}
                </button>
              )}
              
              <button
                onClick={() => navigate('/today')}
                className="btn-primary"
              >
                Back to Today
              </button>
            </div>
          </div>

          {/* Day Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => goToDay(currentDayNum - 1)}
              disabled={!canGoPrevious}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${canGoPrevious
                  ? 'text-temple-purple dark:text-temple-gold hover:bg-temple-purple/10 dark:hover:bg-temple-gold/10'
                  : 'text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Previous Day</span>
            </button>

            <button
              onClick={() => goToDay(currentDayNum + 1)}
              disabled={!canGoNext}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${canGoNext
                  ? 'text-temple-purple dark:text-temple-gold hover:bg-temple-purple/10 dark:hover:bg-temple-gold/10'
                  : 'text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <span>Next Day</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!day) return null

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/today')}
              className="flex items-center gap-2 text-sm text-temple-purple dark:text-temple-gold hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Today
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Day {currentDayNum} of {program.duration_days}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        
        {/* Section 1: Header */}
        <div className="glass-card p-8 text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-temple-purple/10 dark:bg-temple-gold/10 text-temple-purple dark:text-temple-gold text-sm font-medium mb-4">
            Day {currentDayNum}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-3">
            {day.title}
          </h1>
          {day.anchor_sentence && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {day.anchor_sentence}
            </p>
          )}
        </div>

        {/* Section 2: Scripture */}
        {day.scripture_text && (
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Scripture
              </h2>
            </div>
            
            {day.scripture_reference && (
              <p className="text-sm font-medium text-temple-purple dark:text-temple-gold mb-2">
                {day.scripture_reference} (NKJV)
              </p>
            )}
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 border-temple-purple dark:border-temple-gold">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                {day.scripture_text}
              </p>
            </div>
          </div>
        )}

        {/* Section 3: Focus Thought */}
        {day.focus_thought && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Why Today Matters
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {day.focus_thought}
            </p>
          </div>
        )}

        {/* Section 4: Prayer */}
        {day.prayer_text && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Prayer
            </h2>
            <div className="p-4 bg-temple-purple/5 dark:bg-temple-gold/5 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                {day.prayer_text}
              </p>
            </div>
          </div>
        )}

        {/* Section 5: Fasting Reminder */}
        {program.includes_fasting && day.fasting_reminder && (
          <div className="glass-card p-6 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Fasting Reminder
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {day.fasting_reminder}
            </p>
            {enrollment?.fasting_type && (
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Your choice: <span className="font-semibold capitalize">{enrollment.fasting_type.replace('_', '-')} Fast</span>
                  {enrollment.fasting_type === 'time_window' && enrollment.fasting_window && (
                    <span className="text-xs ml-1">({enrollment.fasting_window.split('-').map(t => {
                      const [h, m] = t.split(':')
                      const hour = parseInt(h)
                      const ampm = hour >= 12 ? 'pm' : 'am'
                      const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
                      return m === '00' ? `${h12}${ampm}` : `${h12}:${m}${ampm}`
                    }).join(' – ')})</span>
                  )}
                </p>
                <ChangeFastingType
                  enrollment={enrollment}
                  onChanged={(updated) => setEnrollment(updated)}
                />
              </div>
            )}
          </div>
        )}

        {/* Section 5.5: Fasting Tracker (for fasting programs) */}
        {enrollment?.cohort_id && enrollment?.fasting_type && user && (
          <FastingTracker
            userId={user.id}
            enrollmentId={enrollment.id}
            fastingType={enrollment.fasting_type}
            fastingWindow={enrollment.fasting_window}
            date={new Date().toISOString().split('T')[0]}
            onSave={() => {}}
          />
        )}

        {/* Section 6: Reflection */}
        {day.reflection_questions && day.reflection_questions.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Reflection
            </h2>
            <div className="space-y-4">
              {day.reflection_questions.map((question, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {question}
                  </label>
                  <textarea
                    value={reflectionAnswers[index] || ''}
                    onChange={(e) => handleReflectionChange(index, e.target.value)}
                    disabled={isCompleted}
                    placeholder="Your private reflection..."
                    className="form-input resize-none"
                    rows={3}
                  />
                </div>
              ))}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                🔒 Your reflections are private and only visible to you
              </p>
            </div>
          </div>
        )}

        {/* Section 7: Action Step */}
        {day.action_step && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Today's Action
            </h2>
            <div className="flex items-start gap-3 p-4 bg-temple-purple/5 dark:bg-temple-gold/5 rounded-lg">
              <Check className="w-5 h-5 text-temple-purple dark:text-temple-gold mt-0.5 flex-shrink-0" />
              <p className="text-gray-700 dark:text-gray-300">
                {day.action_step}
              </p>
            </div>
          </div>
        )}

        {/* Section 8: Completion */}
        {!isCompleted ? (
          <div className="glass-card p-6 bg-temple-purple/5 dark:bg-temple-gold/5">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
              Complete Today's Journey
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Mark this day complete when you're ready to move forward
            </p>
            <button
              onClick={handleComplete}
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving ? 'Saving...' : 'Mark Day Complete ✓'}
            </button>
          </div>
        ) : (
          <div className="glass-card p-6 bg-green-50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-800 text-center">
            <Check className="w-12 h-12 mx-auto mb-3 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Day {currentDayNum} Complete!
            </h2>
            {day.completion_message && (
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {day.completion_message}
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => goToDay(currentDayNum - 1)}
            disabled={!canGoPrevious}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${canGoPrevious
                ? 'text-temple-purple dark:text-temple-gold hover:bg-temple-purple/10 dark:hover:bg-temple-gold/10'
                : 'text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous Day</span>
          </button>

          <button
            onClick={() => goToDay(currentDayNum + 1)}
            disabled={!canGoNext}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${canGoNext
                ? 'text-temple-purple dark:text-temple-gold hover:bg-temple-purple/10 dark:hover:bg-temple-gold/10'
                : 'text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <span>Next Day</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
    <BottomNav />
    </>
  )
}
