import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePrograms } from '../../hooks/usePrograms'
import { useProgramDays } from '../../hooks/useProgramDays'
import { 
  generateScriptureSuggestions,
  generateFocusThought,
  generatePrayer,
  generateReflectionQuestions,
  generateActionStep,
  generateCompletionMessage,
  generateFullDayContent
} from '../../lib/programContentAI'
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Sparkles, 
  BookOpen,
  MessageSquare,
  ListTodo,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export const DayEditor = () => {
  const { programId } = useParams()
  const navigate = useNavigate()
  const { getProgram } = usePrograms()
  const { days, loading: daysLoading, getDays, getDay, saveDay, createDays } = useProgramDays(programId)
  
  const [program, setProgram] = useState(null)
  const [currentDayNumber, setCurrentDayNumber] = useState(1)
  const [dayData, setDayData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSection, setAiSection] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    initializeProgram()
  }, [programId])

  const initializeProgram = async () => {
    setInitializing(true)
    await loadProgram()
    await loadDays()
  }

  useEffect(() => {
    // Auto-create days if program exists but has no days
    if (program && days.length === 0 && !daysLoading) {
      createInitialDays()
    } else if (days.length > 0) {
      setInitializing(false)
    }
  }, [program, days, daysLoading])

  const createInitialDays = async () => {
    if (program) {
      await createDays(program.duration_days)
      await getDays() // Reload after creation
      setInitializing(false)
    }
  }

  useEffect(() => {
    if (currentDayNumber) {
      loadDay(currentDayNumber)
    }
  }, [currentDayNumber])

  const loadProgram = async () => {
    const { data } = await getProgram(programId)
    if (data) setProgram(data)
  }

  const loadDays = async () => {
    await getDays()
  }

  const loadDay = async (dayNumber) => {
    const { data } = await getDay(dayNumber)
    if (data) {
      setDayData(data)
    } else {
      // Initialize empty day
      setDayData({
        day_number: dayNumber,
        title: '',
        anchor_sentence: '',
        scripture_reference: '',
        scripture_text: '',
        focus_thought: '',
        prayer_text: '',
        fasting_reminder: '',
        reflection_questions: [],
        action_step: '',
        completion_message: ''
      })
    }
  }

  const handleChange = (field, value) => {
    setDayData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!dayData.title) {
      toast.error('Day title is required')
      return
    }

    setSaving(true)
    await saveDay(currentDayNumber, dayData)
    setSaving(false)
  }

  const handleAIGenerate = async (section) => {
    if (!dayData.title) {
      toast.error('Please add a day title first')
      return
    }

    setAiLoading(true)
    setAiSection(section)

    try {
      switch(section) {
        case 'scripture':
          const scriptureResult = await generateScriptureSuggestions({
            dayNumber: currentDayNumber,
            title: dayData.title,
            theme: dayData.anchor_sentence,
            programType: program?.program_type
          })
          if (scriptureResult.success && scriptureResult.data.length > 0) {
            const suggestion = scriptureResult.data[0]
            handleChange('scripture_reference', suggestion.reference)
            handleChange('scripture_text', suggestion.text)
          }
          break

        case 'focus':
          const focusResult = await generateFocusThought({
            scripture: dayData.scripture_text,
            title: dayData.title,
            theme: dayData.anchor_sentence
          })
          if (focusResult.success) {
            handleChange('focus_thought', focusResult.data)
          }
          break

        case 'prayer':
          const prayerResult = await generatePrayer({
            scripture: dayData.scripture_text,
            title: dayData.title,
            theme: dayData.anchor_sentence
          })
          if (prayerResult.success) {
            handleChange('prayer_text', prayerResult.data)
          }
          break

        case 'reflection':
          const reflectionResult = await generateReflectionQuestions({
            scripture: dayData.scripture_text,
            title: dayData.title,
            theme: dayData.anchor_sentence,
            actionStep: dayData.action_step
          })
          if (reflectionResult.success) {
            handleChange('reflection_questions', reflectionResult.data)
          }
          break

        case 'action':
          const actionResult = await generateActionStep({
            scripture: dayData.scripture_text,
            title: dayData.title,
            theme: dayData.anchor_sentence
          })
          if (actionResult.success) {
            handleChange('action_step', actionResult.data)
          }
          break

        case 'completion':
          const completionResult = await generateCompletionMessage({
            title: dayData.title
          })
          if (completionResult.success) {
            handleChange('completion_message', completionResult.data)
          }
          break

        case 'full':
          const fullResult = await generateFullDayContent({
            dayNumber: currentDayNumber,
            title: dayData.title,
            theme: dayData.anchor_sentence,
            programType: program?.program_type,
            includesFasting: program?.includes_fasting
          })
          if (fullResult.success) {
            setDayData(prev => ({
              ...prev,
              ...fullResult.data
            }))
          }
          break
      }
    } catch (error) {
      console.error('AI generation error:', error)
      toast.error('Failed to generate content. Please try again.')
    }

    setAiLoading(false)
    setAiSection(null)
  }

  const goToDay = (dayNumber) => {
    if (dayNumber >= 1 && dayNumber <= (program?.duration_days || 14)) {
      setCurrentDayNumber(dayNumber)
    }
  }

  if (!program || !dayData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/programs')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            {program.title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Editing Day {currentDayNumber} of {program.duration_days}
          </p>
        </div>
        <button
          onClick={() => handleAIGenerate('full')}
          disabled={aiLoading || !dayData.title}
          className="btn-gold flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>{aiLoading ? 'Generating...' : 'AI Generate All'}</span>
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>

      {/* Day Navigation */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {Array.from({ length: program.duration_days }, (_, i) => i + 1).map(dayNum => (
            <button
              key={dayNum}
              onClick={() => goToDay(dayNum)}
              className={`
                flex-shrink-0 w-10 h-10 rounded-lg font-medium transition-all
                ${currentDayNumber === dayNum
                  ? 'bg-temple-purple text-white dark:bg-temple-gold'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              {dayNum}
            </button>
          ))}
        </div>
      </div>

      {/* Day Content Editor */}
      <div className="space-y-6">
        
        {/* Section 1: Header */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-temple-purple dark:text-temple-gold">1.</span>
            Header
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Day Title *</label>
              <input
                type="text"
                value={dayData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Breaking Wrong Agreements"
                className="form-input"
                required
              />
            </div>
            
            <div>
              <label className="form-label">Anchor Sentence</label>
              <input
                type="text"
                value={dayData.anchor_sentence}
                onChange={(e) => handleChange('anchor_sentence', e.target.value)}
                placeholder="Today we clear space in the mind for God's truth"
                className="form-input"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Short orientation line (1 sentence)
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Scripture */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-temple-purple dark:text-temple-gold">2.</span>
              Scripture
            </h2>
            <button
              onClick={() => handleAIGenerate('scripture')}
              disabled={aiLoading}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              {aiLoading && aiSection === 'scripture' ? 'Generating...' : 'AI Suggest'}
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Scripture Reference</label>
              <input
                type="text"
                value={dayData.scripture_reference}
                onChange={(e) => handleChange('scripture_reference', e.target.value)}
                placeholder="2 Corinthians 10:5"
                className="form-input"
              />
            </div>
            
            <div>
              <label className="form-label">Scripture Text (NKJV)</label>
              <textarea
                value={dayData.scripture_text}
                onChange={(e) => handleChange('scripture_text', e.target.value)}
                placeholder="Paste full NKJV text here..."
                className="form-input resize-none"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Focus Thought */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-temple-purple dark:text-temple-gold">3.</span>
              Focus Thought
            </h2>
            <button
              onClick={() => handleAIGenerate('focus')}
              disabled={aiLoading || !dayData.scripture_text}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              {aiLoading && aiSection === 'focus' ? 'Generating...' : 'AI Generate'}
            </button>
          </div>
          
          <textarea
            value={dayData.focus_thought}
            onChange={(e) => handleChange('focus_thought', e.target.value)}
            placeholder="2-4 lines explaining why today matters..."
            className="form-input resize-none"
            rows={3}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Plain, pastoral language connecting Scripture to real life
          </p>
        </div>

        {/* Section 4: Prayer Prompt */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-temple-purple dark:text-temple-gold">4.</span>
              Prayer Prompt
            </h2>
            <button
              onClick={() => handleAIGenerate('prayer')}
              disabled={aiLoading || !dayData.scripture_text}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              {aiLoading && aiSection === 'prayer' ? 'Generating...' : 'AI Generate'}
            </button>
          </div>
          
          <textarea
            value={dayData.prayer_text}
            onChange={(e) => handleChange('prayer_text', e.target.value)}
            placeholder="Write a short, sincere prayer users can pray aloud..."
            className="form-input resize-none"
            rows={4}
          />
        </div>

        {/* Section 5: Fasting Reminder (conditional) */}
        {program.includes_fasting && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-temple-purple dark:text-temple-gold">5.</span>
              Fasting Reminder
            </h2>
            
            <textarea
              value={dayData.fasting_reminder}
              onChange={(e) => handleChange('fasting_reminder', e.target.value)}
              placeholder="Gentle encouragement about the fast (no guilt)..."
              className="form-input resize-none"
              rows={2}
            />
          </div>
        )}

        {/* Section 6: Reflection Questions */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-temple-purple dark:text-temple-gold">6.</span>
              Reflection Questions
            </h2>
            <button
              onClick={() => handleAIGenerate('reflection')}
              disabled={aiLoading || !dayData.scripture_text}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              {aiLoading && aiSection === 'reflection' ? 'Generating...' : 'AI Generate'}
            </button>
          </div>
          
          <div className="space-y-3">
            {dayData.reflection_questions.map((question, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => {
                    const newQuestions = [...dayData.reflection_questions]
                    newQuestions[index] = e.target.value
                    handleChange('reflection_questions', newQuestions)
                  }}
                  placeholder={`Question ${index + 1}`}
                  className="form-input flex-1"
                />
                <button
                  onClick={() => {
                    const newQuestions = dayData.reflection_questions.filter((_, i) => i !== index)
                    handleChange('reflection_questions', newQuestions)
                  }}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                handleChange('reflection_questions', [...dayData.reflection_questions, ''])
              }}
              className="btn-secondary text-sm"
            >
              + Add Question
            </button>
          </div>
        </div>

        {/* Section 7: Action Step */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-temple-purple dark:text-temple-gold">7.</span>
              Action Step
            </h2>
            <button
              onClick={() => handleAIGenerate('action')}
              disabled={aiLoading || !dayData.scripture_text}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              {aiLoading && aiSection === 'action' ? 'Generating...' : 'AI Generate'}
            </button>
          </div>
          
          <textarea
            value={dayData.action_step}
            onChange={(e) => handleChange('action_step', e.target.value)}
            placeholder="One small, doable action (clear and specific)..."
            className="form-input resize-none"
            rows={2}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Should be completable in 5-15 minutes
          </p>
        </div>

        {/* Section 8: Completion Message */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-temple-purple dark:text-temple-gold">8.</span>
              Completion Message
            </h2>
            <button
              onClick={() => handleAIGenerate('completion')}
              disabled={aiLoading}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              {aiLoading && aiSection === 'completion' ? 'Generating...' : 'AI Generate'}
            </button>
          </div>
          
          <textarea
            value={dayData.completion_message}
            onChange={(e) => handleChange('completion_message', e.target.value)}
            placeholder="Warm encouragement when user completes this day..."
            className="form-input resize-none"
            rows={2}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between glass-card p-4">
        <button
          onClick={() => goToDay(currentDayNumber - 1)}
          disabled={currentDayNumber === 1}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Previous Day</span>
        </button>
        
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Day {currentDayNumber} of {program.duration_days}
        </span>
        
        <button
          onClick={() => goToDay(currentDayNumber + 1)}
          disabled={currentDayNumber === program.duration_days}
          className="btn-secondary flex items-center gap-2"
        >
          <span>Next Day</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
