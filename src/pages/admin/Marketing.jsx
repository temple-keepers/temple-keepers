import { useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import {
  Sparkles, Copy, Check, RefreshCw, Instagram, Facebook,
  BookOpen, Heart, UtensilsCrossed, Flame, Users, Megaphone,
  Download, Eye, EyeOff, ChevronDown
} from 'lucide-react'

const CONTENT_TYPES = [
  { id: 'scripture-wellness', label: 'Scripture + Wellness', icon: BookOpen, description: 'Bible verse paired with a health/wellness message' },
  { id: 'programme-promo', label: 'Programme Promotion', icon: Megaphone, description: 'Promote a specific programme with a compelling CTA' },
  { id: 'tip-post', label: 'Health/Wellness Tip', icon: Heart, description: 'Practical wellness tip rooted in faith' },
  { id: 'recipe-highlight', label: 'Recipe Highlight', icon: UtensilsCrossed, description: 'Feature a healthy recipe or meal idea' },
  { id: 'testimony-prompt', label: 'Testimony / Story', icon: Flame, description: 'Personal transformation story or prompt for user stories' },
  { id: 'community-engagement', label: 'Community Engagement', icon: Users, description: 'Question, poll, or conversation starter' },
]

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'both', label: 'Both', icon: Sparkles },
]

const TONES = [
  { id: 'warm-encouraging', label: 'Warm & Encouraging' },
  { id: 'bold-prophetic', label: 'Bold & Prophetic' },
  { id: 'casual-relatable', label: 'Casual & Relatable' },
  { id: 'pastoral-gentle', label: 'Pastoral & Gentle' },
]

export const AdminMarketing = () => {
  const { session } = useAuth()
  const [contentType, setContentType] = useState('scripture-wellness')
  const [platform, setPlatform] = useState('both')
  const [tone, setTone] = useState('warm-encouraging')
  const [programme, setProgramme] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedPosts, setGeneratedPosts] = useState([])
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [showPreview, setShowPreview] = useState(null)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  const programmes = [
    { slug: '', label: 'No specific programme' },
    { slug: '30-day-no-sugar-challenge', label: '30-Day No Sugar Challenge' },
    { slug: 'release-fear-forgive-find-peace', label: '21 Days to Release Fear, Forgive & Find Peace' },
    { slug: 'kingdom-couples', label: 'Kingdom Couples — 6-Week Marriage Journey' },
    { slug: 'make-room-for-the-lord', label: 'Make Room for the Lord — 14-Day Fast' },
    { slug: 'grace-based-wellness', label: '14 Days of Grace-Based Wellness' },
    { slug: 'water-habit', label: 'Water Drinking Habit — 7 Days' },
  ]

  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedPosts([])

    const selectedType = CONTENT_TYPES.find(t => t.id === contentType)
    const selectedProgramme = programmes.find(p => p.slug === programme)

    const prompt = `You are the social media manager for Temple Keepers, a faith-based wellness app for Christians over 25 (men and women). The app helps believers honour God through holistic wellness — combining scripture, nutrition, fitness, and spiritual growth.

BRAND VOICE:
- Warm, encouraging, never preachy or condemning
- Faith-forward but practical — not just "pray about it" but real action steps
- Inclusive — for ALL Christians, all backgrounds, men and women
- Uses UK English spelling (honour, colour, programme)
- Conversational, not corporate
- Occasionally uses emojis but not excessively

CONTENT REQUEST:
- Content type: ${selectedType.label} — ${selectedType.description}
- Platform: ${platform === 'both' ? 'Facebook AND Instagram (generate one version optimised for each)' : platform === 'facebook' ? 'Facebook (can be longer, more conversational)' : 'Instagram (concise, visual-first, include hashtags)'}
- Tone: ${tone}
${programme ? `- Programme to promote: ${selectedProgramme.label}` : ''}
${customTopic ? `- Specific topic/angle: ${customTopic}` : ''}

APP DETAILS (reference naturally, don't force):
- App URL: templekeepers.app
- Features: AI recipe generator, daily devotionals, wellness tracking, fasting programmes, community pods, meal logging
- The app is FREE to use

REQUIREMENTS:
- Generate ${platform === 'both' ? '2 posts (one for Facebook, one for Instagram)' : '1 post'}
- Each post should include: the full caption text, suggested hashtags (5-10), and a brief note on what image/graphic to pair with it
- For Instagram: keep under 2200 characters, front-load the hook in first line
- For Facebook: can be longer, include a question to drive comments
- Include a clear but natural call-to-action (not salesy)
- If promoting a programme, include what transformation the user can expect
- NEVER be preachy, guilt-tripping, or use fear tactics

Return ONLY valid JSON (no markdown, no backticks):
{
  "posts": [
    {
      "platform": "facebook" or "instagram",
      "caption": "Full post caption text",
      "hashtags": ["hashtag1", "hashtag2"],
      "image_suggestion": "Brief description of what image/graphic to create",
      "hook": "The first line / attention grabber",
      "cta": "The call-to-action text"
    }
  ]
}`

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession?.access_token}`,
        },
        body: JSON.stringify({
          action: 'raw-prompt',
          params: { prompt },
        }),
      })

      const result = await res.json()
      if (!result.success) throw new Error(result.error || 'Generation failed')

      const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data
      setGeneratedPosts(data.posts || [])
      
      // Add to history
      setHistory(prev => [{
        timestamp: new Date().toISOString(),
        contentType: selectedType.label,
        platform,
        posts: data.posts || [],
      }, ...prev].slice(0, 20))

      toast.success('Content generated!')
    } catch (err) {
      console.error('Generation error:', err)
      toast.error(err.message || 'Failed to generate content')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const getFullPostText = (post) => {
    return `${post.caption}\n\n${post.hashtags.map(h => `#${h.replace(/^#/, '')}`).join(' ')}`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-temple-purple dark:text-temple-gold" />
          Marketing Studio
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Generate ready-to-post social media content for Facebook and Instagram
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
            
            {/* Content Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Content Type
              </label>
              <div className="space-y-2">
                {CONTENT_TYPES.map(type => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      onClick={() => setContentType(type.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all
                        ${contentType === type.id
                          ? 'bg-temple-purple/10 dark:bg-temple-gold/10 border-temple-purple dark:border-temple-gold border text-temple-purple dark:text-temple-gold'
                          : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Platform
              </label>
              <div className="flex gap-2">
                {PLATFORMS.map(p => {
                  const Icon = p.icon
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${platform === p.id
                          ? 'bg-temple-purple text-white dark:bg-temple-gold'
                          : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tone
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all
                      ${tone === t.id
                        ? 'bg-temple-purple/10 dark:bg-temple-gold/10 border-temple-purple dark:border-temple-gold border text-temple-purple dark:text-temple-gold'
                        : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Programme (optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Programme (optional)
              </label>
              <select
                value={programme}
                onChange={e => setProgramme(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
              >
                {programmes.map(p => (
                  <option key={p.slug} value={p.slug}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Custom Topic */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Custom topic or angle (optional)
              </label>
              <textarea
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                placeholder="e.g. 'Focus on busy mums who skip meals' or 'Tie in to new year resolutions'"
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm resize-none"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2
                bg-gradient-to-r from-temple-purple to-purple-600 dark:from-temple-gold dark:to-amber-600
                hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Content
                </>
              )}
            </button>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                <span>Recent Generations ({history.length})</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
              </button>
              {showHistory && (
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                  {history.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setGeneratedPosts(item.posts)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{item.contentType}</p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {new Date(item.timestamp).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {' · '}{item.platform}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Generated Content */}
        <div className="lg:col-span-2 space-y-6">
          {generatedPosts.length === 0 && !generating && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Ready to create
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                Choose your content type, platform, and tone on the left, then hit Generate. 
                You'll get ready-to-copy captions with hashtags and image suggestions.
              </p>
            </div>
          )}

          {generating && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <RefreshCw className="w-10 h-10 text-temple-purple dark:text-temple-gold mx-auto mb-4 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">Crafting your content...</p>
            </div>
          )}

          {generatedPosts.map((post, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Post Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {post.platform === 'facebook' ? (
                    <Facebook className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Instagram className="w-5 h-5 text-pink-600" />
                  )}
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">
                    {post.platform}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(showPreview === index ? null : index)}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Toggle preview"
                  >
                    {showPreview === index ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleCopy(getFullPostText(post), index)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${copiedIndex === index
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-temple-purple/10 text-temple-purple dark:bg-temple-gold/10 dark:text-temple-gold hover:bg-temple-purple/20 dark:hover:bg-temple-gold/20'
                      }`}
                  >
                    {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedIndex === index ? 'Copied!' : 'Copy All'}
                  </button>
                </div>
              </div>

              {/* Hook highlight */}
              {post.hook && (
                <div className="px-6 pt-4">
                  <div className="bg-temple-purple/5 dark:bg-temple-gold/5 border border-temple-purple/20 dark:border-temple-gold/20 rounded-lg px-4 py-2">
                    <p className="text-xs font-semibold text-temple-purple dark:text-temple-gold mb-1">HOOK (first line)</p>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{post.hook}</p>
                  </div>
                </div>
              )}

              {/* Caption */}
              <div className="px-6 py-4">
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {post.caption}
                </p>
              </div>

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="px-6 pb-4">
                  <div className="flex flex-wrap gap-1.5">
                    {post.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-medium
                          bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      >
                        #{tag.replace(/^#/, '')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Suggestion */}
              {post.image_suggestion && (
                <div className="px-6 pb-4">
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg px-4 py-3">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">IMAGE SUGGESTION</p>
                    <p className="text-sm text-amber-800 dark:text-amber-300">{post.image_suggestion}</p>
                  </div>
                </div>
              )}

              {/* CTA highlight */}
              {post.cta && (
                <div className="px-6 pb-4">
                  <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-lg px-4 py-2">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">CALL TO ACTION</p>
                    <p className="text-sm text-green-800 dark:text-green-300">{post.cta}</p>
                  </div>
                </div>
              )}

              {/* Phone Preview */}
              {showPreview === index && (
                <div className="px-6 pb-6">
                  <div className="max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-600 overflow-hidden shadow-lg">
                    {/* Simulated header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-temple-purple to-purple-600 dark:from-temple-gold dark:to-amber-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">TK</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">templekeepers</p>
                        <p className="text-xs text-gray-500">Sponsored</p>
                      </div>
                    </div>
                    {/* Image placeholder */}
                    <div className="aspect-square bg-gradient-to-br from-temple-purple/20 to-purple-100 dark:from-temple-gold/20 dark:to-amber-900/20 flex items-center justify-center">
                      <div className="text-center px-6">
                        <Sparkles className="w-8 h-8 text-temple-purple dark:text-temple-gold mx-auto mb-2" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">{post.image_suggestion}</p>
                      </div>
                    </div>
                    {/* Caption preview */}
                    <div className="px-4 py-3">
                      <p className="text-xs text-gray-800 dark:text-gray-200 line-clamp-4">{post.caption}</p>
                      <p className="text-xs text-blue-500 mt-1">
                        {post.hashtags?.slice(0, 4).map(t => `#${t.replace(/^#/, '')}`).join(' ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick copy buttons */}
              <div className="px-6 pb-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => handleCopy(post.caption, `caption-${index}`)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 
                    text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {copiedIndex === `caption-${index}` ? 'Copied!' : 'Copy caption only'}
                </button>
                <button
                  onClick={() => handleCopy(post.hashtags?.map(t => `#${t.replace(/^#/, '')}`).join(' '), `tags-${index}`)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 
                    text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {copiedIndex === `tags-${index}` ? 'Copied!' : 'Copy hashtags only'}
                </button>
              </div>
            </div>
          ))}

          {/* Regenerate */}
          {generatedPosts.length > 0 && !generating && (
            <div className="flex justify-center">
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium
                  border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300
                  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}