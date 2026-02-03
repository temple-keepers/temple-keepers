import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useEnrollment } from '../hooks/useEnrollment'
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
  const [selectedFasting, setSelectedFasting] = useState(null)

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
    
    // Set default fasting type
    if (programData.includes_fasting && programData.fasting_types?.length > 0) {
      setSelectedFasting(programData.fasting_types[0])
    }
    
    setLoading(false)
  }

  const handleEnroll = async () => {
    if (!program) return
    
    setEnrolling(true)
    
    // User chooses start date
    const startNow = window.confirm('Start this program today? Click OK to start today, or Cancel to choose a start date.')
    
    let startDate = new Date().toISOString().split('T')[0] // Today
    
    if (!startNow) {
      const dateInput = prompt('Enter start date (YYYY-MM-DD):', startDate)
      if (dateInput) {
        startDate = dateInput
      }
    }
    
    const { data, error } = await enrollInProgram(
      program.id, 
      program.includes_fasting ? selectedFasting : null,
      startDate
    )
    
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
      navigate(`/programs/${program.slug}/day/${enrollment.current_day}`)
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
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/programs')}
            className="flex items-center gap-2 text-sm text-temple-purple dark:text-temple-gold hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Programs
          </button>
          
          <h1 className="text-4xl font-display font-bold gradient-text mb-4">
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
            {program.includes_fasting && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">Includes fasting</span>
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
            <>
              {program.includes_fasting && program.fasting_types?.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Choose Your Fasting Type:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {program.fasting_types.map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedFasting(type)}
                        className={`
                          p-4 rounded-lg border-2 text-left transition-all capitalize
                          ${selectedFasting === type
                            ? 'border-temple-purple bg-temple-purple/10 dark:border-temple-gold dark:bg-temple-gold/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-temple-purple/50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {selectedFasting === type && (
                            <Check className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                          )}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {type} Fast
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {type === 'daylight' && 'Eat between 6pm-6am'}
                          {type === 'daniel' && 'Whole foods only, no sugar/meat'}
                          {type === 'media' && 'No social media or news'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="btn-primary"
              >
                {enrolling ? 'Enrolling...' : 'Start This Program'}
              </button>
            </>
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
              {program.includes_fasting && (
                <li className="flex items-start gap-2">
                  <span className="text-temple-purple dark:text-temple-gold mt-1">•</span>
                  <span><strong>Fasting Encouragement</strong> — Gentle reminders</span>
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
    </div>
  )
}
