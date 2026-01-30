import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext-minimal'
import { useTheme } from '../contexts/ThemeContext'
import { generateDevotional } from '../lib/gemini'
import { saveDevotionalCompletion, incrementUserStat } from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'

import { 
  BookOpen, 
  Heart, 
  CheckCircle, 
  Sparkles, 
  RefreshCw,
  Quote,
  Sun,
  Moon,
  Loader2,
  Play,
  Lightbulb,
  MessageCircle
} from 'lucide-react'

const Devotionals = () => {
  const { user, refreshUserData } = useAuth()
  const { isDark } = useTheme()
  const [todayDevotional, setTodayDevotional] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('general')
  const { toast } = useToast()

  const themes = [
    { id: 'general', label: 'General Wellness', icon: Heart },
    { id: 'strength', label: 'Finding Strength', icon: Sparkles },
    { id: 'nutrition', label: 'Nourishing Body', icon: Sun },
    { id: 'rest', label: 'Rest & Recovery', icon: Moon },
  ]

  // Fallback devotional data
  const fallbackDevotional = {
    title: "Your Body, God's Temple",
    scripture: "Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God? You are not your own; you were bought at a price. Therefore honor God with your bodies.",
    scriptureReference: "1 Corinthians 6:19-20 (NKJV)",
    reflection: `Today, we're reminded of the profound truth that our bodies are not merely our own—they are sacred dwellings of God's Holy Spirit. This isn't meant to burden us with guilt, but to inspire us with purpose and dignity.

When we view our health choices through this lens, even the smallest acts of self-care become acts of worship. Choosing nourishing foods, getting adequate rest, moving our bodies, and managing stress are all ways we can honor the One who created us.

Consider how different your day might look if you approached each health decision as an opportunity to glorify God. The morning walk becomes a prayer. The healthy meal becomes an offering. The restful sleep becomes trust in His provision.

Remember, caring for your temple isn't about perfection—it's about intention. God sees your heart and honors your efforts to steward the body He's given you.`,
    prayer: "Heavenly Father, thank You for this body You've given me. Help me to see it as the sacred gift it is—a temple of Your Holy Spirit. Give me wisdom in my choices today, strength to resist temptation, and grace for the moments I fall short. May every act of self-care be an act of worship to You. In Jesus' name, Amen.",
    actionStep: "Take a 10-minute walk today while listening to worship music or speaking with God. Let this simple act be your way of honoring your temple.",
    affirmation: "My body is a temple of the Holy Spirit, and I choose to honor God in how I care for it today."
  }

  useEffect(() => {
    loadDevotional()
  }, [])

  const loadDevotional = async () => {
    setLoading(true)
    
    // Check if we have today's devotional cached
    const today = new Date().toDateString()
    const cachedDate = localStorage.getItem('devotional_date')
    const cachedDevotional = localStorage.getItem('devotional_content')
    
    if (cachedDate === today && cachedDevotional) {
      try {
        setTodayDevotional(JSON.parse(cachedDevotional))
        setLoading(false)
        return
      } catch (e) {
        console.warn('Failed to parse cached devotional')
      }
    }
    
    // Generate a new devotional for today
    try {
      const result = await generateDevotional('general wellness')
      if (result.devotional) {
        setTodayDevotional(result.devotional)
        // Cache for today
        localStorage.setItem('devotional_date', today)
        localStorage.setItem('devotional_content', JSON.stringify(result.devotional))
      } else {
        setTodayDevotional(fallbackDevotional)
      }
    } catch (error) {
      console.error('Failed to generate daily devotional:', error)
      setTodayDevotional(fallbackDevotional)
    }
    
    setLoading(false)
  }

  const generateNewDevotional = async () => {
    setGenerating(true)
    setCompleted(false)
    const theme = themes.find(t => t.id === selectedTheme)?.label || 'general wellness'
    
    try {
      const result = await generateDevotional(theme)
      if (result.error) {
        alert('Failed to generate devotional: ' + result.error)
      } else if (result.devotional) {
        setTodayDevotional(result.devotional)
      }
    } catch (error) {
      console.error('Failed to generate devotional:', error)
      alert('Failed to generate devotional. Using default content.')
    }
    setGenerating(false)
  }
  

  const markComplete = async () => {
    if (!todayDevotional) {
      console.error('❌ No devotional loaded')
      return
    }
    
    console.log('📦 Saving devotional for user:', user.id)
    
    setCompleting(true)
    try {
      console.log('💾 Calling saveDevotionalCompletion...')
      // Save to database
      await saveDevotionalCompletion(user.id, todayDevotional)
      
      console.log('📊 Incrementing stats...')
      // Increment stats and add 15 points
      await incrementUserStat(user.id, 'devotionals_completed', 15)
      
      // Refresh stats in UI
      await refreshUserData()
      
      setCompleted(true)
      console.log('✅ Devotional completed and stats updated!')
      alert('Devotional marked as complete!')
    } catch (error) {
      console.error('❌ Failed to save devotional:', error)
      console.error('Error details:', error.message, error.stack)
      alert('Failed to mark complete: ' + error.message)
    }
    setCompleting(false)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading today's devotional...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className={`text-3xl md:text-4xl font-display font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          Daily Devotional
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Nourish your soul as you care for your temple
        </p>
      </div>

      {/* Theme Selector */}
      <div className="glass-card-strong rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Choose a Theme
        </h2>
        <div className="flex flex-wrap gap-3">
          {themes.map((theme) => {
            const Icon = theme.icon
            return (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  selectedTheme === theme.id
                    ? 'bg-gradient-to-r from-temple-purple to-temple-purple-dark text-white shadow-lg'
                    : isDark
                      ? 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                      : 'bg-white/50 text-gray-600 hover:bg-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{theme.label}</span>
              </button>
            )
          })}
        </div>
        <button
          onClick={generateNewDevotional}
          disabled={generating}
          className="btn-gold mt-4 flex items-center gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate New Devotional</span>
            </>
          )}
        </button>
      </div>

      {/* Main Devotional Content */}
      {todayDevotional && (
        <div className="space-y-6">
          {/* Title Card */}
          <div className="scripture-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                isDark 
                  ? 'bg-gradient-to-br from-temple-purple to-temple-purple-dark shadow-lg shadow-temple-purple/30' 
                  : 'bg-gradient-to-br from-temple-purple to-temple-purple-dark'
              }`}>
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-display font-bold mb-2 ${
                  isDark ? 'gradient-text-gold' : 'gradient-text'
                }`}>
                  {todayDevotional.title}
                </h2>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-temple-gold" />
                  <span className="text-sm text-temple-gold font-medium">Today's Devotional</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scripture */}
          <div className="scripture-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start gap-4">
              <Quote className={`w-8 h-8 flex-shrink-0 ${isDark ? 'text-temple-gold' : 'text-temple-purple'}`} />
              <div>
                <p className="devotional-verse text-lg md:text-xl leading-relaxed">
                  "{todayDevotional.scripture}"
                </p>
                <p className="devotional-reference mt-3">
                  — {todayDevotional.scriptureReference}
                </p>
              </div>
            </div>
          </div>

          {/* Reflection */}
          <div className="glass-card-strong rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              <Lightbulb className={`w-5 h-5 ${isDark ? 'text-temple-gold' : 'text-temple-purple'}`} />
              Reflection
            </h3>
            <div className={`prose max-w-none ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {todayDevotional.reflection.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Prayer */}
          <div className={`rounded-2xl p-6 animate-fade-in ${
            isDark 
              ? 'bg-gradient-to-r from-temple-purple/20 to-temple-gold/10 border border-temple-gold/20' 
              : 'bg-gradient-to-r from-purple-50 to-amber-50'
          }`} style={{ animationDelay: '0.5s' }}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              <MessageCircle className={`w-5 h-5 ${isDark ? 'text-temple-gold' : 'text-temple-purple'}`} />
              Prayer
            </h3>
            <p className={`italic leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {todayDevotional.prayer}
            </p>
          </div>

          {/* Action Step */}
          <div className="glass-card-strong rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              <Play className="w-5 h-5 text-green-500" />
              Today's Action Step
            </h3>
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              {todayDevotional.actionStep}
            </p>
          </div>

          {/* Affirmation */}
          <div className={`rounded-2xl p-6 text-center animate-fade-in ${
            isDark 
              ? 'bg-gradient-to-r from-temple-purple/30 to-temple-gold/20 border border-temple-purple/30' 
              : 'bg-gradient-to-r from-temple-purple/10 to-temple-gold/10'
          }`} style={{ animationDelay: '0.7s' }}>
            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Daily Affirmation
            </h3>
            <p className={`text-xl font-display italic ${
              isDark ? 'text-temple-gold' : 'text-temple-purple'
            }`}>
              "{todayDevotional.affirmation}"
            </p>
          </div>

          {/* Complete Button */}
          <div className="flex justify-center pt-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <button
              onClick={markComplete}
              disabled={completing || completed}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                completed
                  ? isDark
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-green-100 text-green-700'
                  : 'btn-primary'
              }`}
            >
              {completing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : completed ? (
                <>
                  <CheckCircle className="w-6 h-6" />
                  <span>Completed! +15 pts 🙏</span>
                </>
              ) : (
                <>
                  <Heart className="w-6 h-6" />
                  <span>Mark as Complete</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Devotionals