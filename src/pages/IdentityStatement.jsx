import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext-minimal'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { getIdentityStatement, updateIdentityStatement } from '../lib/habits'
import {
  ArrowLeft,
  Sparkles,
  Quote,
  Save,
  Loader2,
  Lightbulb,
  Target,
  Heart,
  BookOpen
} from 'lucide-react'

const IdentityStatement = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [statement, setStatement] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadStatement()
  }, [])

  const loadStatement = async () => {
    setLoading(true)
    const data = await getIdentityStatement(user.id)
    setStatement(data || '')
    setLoading(false)
  }

  const handleSave = async () => {
    if (!statement.trim()) {
      toast.error('Please enter an identity statement')
      return
    }
    setSaving(true)
    try {
      await updateIdentityStatement(user.id, statement)
      toast.success('Identity statement saved! 🌟')
      navigate('/habits')
    } catch (error) {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const examples = [
    "I am a person who honors my body as God's temple",
    "I am someone who prioritizes my health and wellbeing",
    "I am a person who shows up for myself every day",
    "I am someone who nourishes my body with intention",
    "I am a person of discipline and self-control",
    "I am someone who cares for the gift of my body",
    "I am a person who makes healthy choices easily",
    "I am someone who moves my body with joy"
  ]

  const tips = [
    {
      icon: Target,
      title: "Be Specific",
      description: "Focus on who you want to become, not what you want to achieve"
    },
    {
      icon: Heart,
      title: "Make It Personal",
      description: "Use words that resonate deeply with your values and faith"
    },
    {
      icon: BookOpen,
      title: "Root It in Scripture",
      description: "Connect to biblical truths about your identity in Christ"
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/habits')}
          className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </button>
        <div>
          <h1 className={`text-xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Identity Statement
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Who are you becoming?
          </p>
        </div>
      </div>

      {/* Intro */}
      <div className={`rounded-2xl p-6 mb-6 ${
        isDark 
          ? 'bg-gradient-to-r from-temple-purple/20 to-temple-gold/10 border border-temple-purple/30' 
          : 'bg-gradient-to-r from-temple-purple/10 to-temple-gold/10 border border-temple-purple/20'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-temple-purple/20' : 'bg-temple-purple/10'
          }`}>
            <Sparkles className="w-6 h-6 text-temple-purple" />
          </div>
          <div>
            <h2 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              The Power of Identity
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Research shows that lasting change comes from shifting your identity, not just your behavior. 
              Every action you take is a vote for the type of person you wish to become.
            </p>
          </div>
        </div>
      </div>

      {/* Statement Input */}
      <div className={`rounded-2xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Complete this sentence:
        </label>
        <div className="flex items-start gap-2 mb-4">
          <Quote className="w-5 h-5 text-temple-purple flex-shrink-0 mt-3" />
          <div className="flex-1">
            <span className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>I am a person who </span>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="honors my body as God's temple..."
              rows={3}
              className={`w-full mt-2 px-4 py-3 rounded-xl border resize-none ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
            />
          </div>
        </div>

        {/* Preview */}
        {statement && (
          <div className={`p-4 rounded-xl ${
            isDark ? 'bg-temple-purple/10 border border-temple-purple/20' : 'bg-temple-purple/5 border border-temple-purple/10'
          }`}>
            <p className={`text-sm italic ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              "I am a person who {statement}"
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className={`rounded-2xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-temple-gold" />
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Tips for Your Statement
          </h3>
        </div>
        <div className="space-y-3">
          {tips.map((tip, index) => {
            const Icon = tip.icon
            return (
              <div key={index} className="flex items-start gap-3">
                <Icon className="w-5 h-5 text-temple-purple flex-shrink-0 mt-0.5" />
                <div>
                  <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {tip.title}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {tip.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Examples */}
      <div className={`rounded-2xl p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Example Statements
        </h3>
        <div className="space-y-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => setStatement(example.replace("I am a person who ", "").replace("I am someone who ", ""))}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
              }`}
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>

      {/* Scripture */}
      <div className={`rounded-2xl p-4 mb-8 ${
        isDark ? 'bg-temple-purple/10 border border-temple-purple/20' : 'bg-temple-purple/5 border border-temple-purple/10'
      }`}>
        <p className={`text-sm italic text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          "Do you not know that your bodies are temples of the Holy Spirit, who is in you, 
          whom you have received from God? You are not your own; you were bought at a price. 
          Therefore honor God with your bodies."
        </p>
        <p className="text-xs text-temple-purple text-center mt-2">— 1 Corinthians 6:19-20</p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || !statement.trim()}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Save className="w-5 h-5" />
        )}
        Save Identity Statement
      </button>
    </div>
  )
}

export default IdentityStatement