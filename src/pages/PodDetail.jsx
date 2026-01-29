import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { 
  getPodDetails, 
  getPodMessages, 
  sendPodMessage,
  leavePod,
  REACTION_TYPES,
  addPodMessageReaction,
  getPodMessageReactions,
  getUserPodMessageReaction
} from '../lib/community'
import {
  ArrowLeft,
  Send,
  Users,
  Crown,
  Settings,
  LogOut,
  Copy,
  Check,
  User,
  Sparkles,
  HandHeart,
  PartyPopper,
  MessageCircle
} from 'lucide-react'

const PodDetail = () => {
  const { podId } = useParams()
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)

  const [pod, setPod] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [messageType, setMessageType] = useState('message')
  const [showReactionPicker, setShowReactionPicker] = useState(null)

  useEffect(() => {
    loadPod()
  }, [podId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadPod = async () => {
    setLoading(true)
    const [podData, messagesData] = await Promise.all([
      getPodDetails(podId),
      getPodMessages(podId)
    ])
    setPod(podData)
    setMessages(messagesData)
    setLoading(false)
  }

  const handleSend = async () => {
    if (!newMessage.trim()) return
    setSending(true)
    try {
      await sendPodMessage(podId, user.id, newMessage, messageType)
      setNewMessage('')
      setMessageType('message')
      loadPod()
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleLeave = async () => {
    if (!confirm('Leave this pod?')) return
    try {
      await leavePod(podId, user.id)
      toast.success('Left pod')
      navigate('/community')
    } catch (error) {
      toast.error('Failed to leave pod')
    }
  }

  const copyInviteCode = () => {
    navigator.clipboard.writeText(pod.invite_code)
    setCopiedCode(true)
    toast.success('Invite code copied!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleReaction = async (messageId, reactionType) => {
    try {
      await addPodMessageReaction(messageId, user.id, reactionType)
      setShowReactionPicker(null)
      loadPod() // Reload to get updated reactions
    } catch (error) {
      toast.error('Failed to add reaction')
    }
  }

  const messageTypeIcons = {
    message: MessageCircle,
    checkin: Check,
    prayer: HandHeart,
    celebration: PartyPopper
  }

  const messageTypeColors = {
    message: '',
    checkin: isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200',
    prayer: isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200',
    celebration: isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin" />
      </div>
    )
  }

  if (!pod) {
    return (
      <div className="text-center py-12">
        <p>Pod not found</p>
      </div>
    )
  }

  const currentMember = pod.members?.find(m => m.user_id === user.id)
  const isAdmin = currentMember?.role === 'admin'

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/community')}
            className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {pod.name}
            </h1>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {pod.members?.length} members
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Invite Code */}
          <button
            onClick={copyInviteCode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
              isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {copiedCode ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {pod.invite_code}
          </button>
          {!isAdmin && (
            <button
              onClick={handleLeave}
              className={`p-2 rounded-lg text-red-500 ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Members Bar */}
      <div className={`flex items-center gap-2 px-4 py-2 border-b overflow-x-auto ${
        isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
      }`}>
        {pod.members?.map((member) => (
          <div 
            key={member.id}
            className={`flex items-center gap-2 px-2 py-1 rounded-lg flex-shrink-0 ${
              isDark ? 'bg-gray-700' : 'bg-white'
            }`}
            title={member.user?.profiles?.full_name}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isDark ? 'bg-gray-600' : 'bg-gray-100'
            }`}>
              {member.user?.profiles?.avatar_url ? (
                <img src={member.user.profiles.avatar_url} className="w-6 h-6 rounded-full" />
              ) : (
                <User className="w-3 h-3 text-gray-400" />
              )}
            </div>
            <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {member.user?.profiles?.full_name?.split(' ')[0] || 'Member'}
            </span>
            {member.role === 'admin' && (
              <Crown className="w-3 h-3 text-temple-gold" />
            )}
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.user_id === user.id
            const showDate = index === 0 || 
              formatDate(messages[index - 1].created_at) !== formatDate(message.created_at)
            const Icon = messageTypeIcons[message.type]

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="text-center my-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${isOwn ? 'order-2' : ''}`}>
                    {!isOwn && (
                      <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {message.user?.profiles?.full_name || 'Member'}
                      </p>
                    )}
                    <div className="relative group">
                      <div className={`px-4 py-2 rounded-2xl border ${
                        message.type !== 'message'
                          ? messageTypeColors[message.type]
                          : isOwn
                            ? 'bg-temple-purple text-white border-temple-purple'
                            : isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      }`}>
                        {message.type !== 'message' && (
                          <div className="flex items-center gap-1 mb-1">
                            <Icon className="w-3 h-3" />
                            <span className="text-xs font-medium capitalize">{message.type}</span>
                          </div>
                        )}
                        <p className={isOwn && message.type === 'message' ? 'text-white' : ''}>
                          {message.content}
                        </p>
                      </div>

                      {/* Reaction Summary */}
                      {(() => {
                        const reactionSummary = getPodMessageReactions(message)
                        const hasReactions = Object.keys(reactionSummary).length > 0
                        return hasReactions ? (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {Object.entries(reactionSummary).map(([type, count]) => (
                              <button
                                key={type}
                                onClick={() => handleReaction(message.id, type)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${
                                  getUserPodMessageReaction(message, user.id).includes(type)
                                    ? isDark 
                                      ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                                      : 'bg-purple-50 border-purple-200 text-purple-700'
                                    : isDark
                                      ? 'bg-gray-800/50 border-gray-700 text-gray-300'
                                      : 'bg-gray-50 border-gray-200 text-gray-600'
                                } hover:scale-105 transition-transform`}
                              >
                                <span>{REACTION_TYPES[type]?.emoji}</span>
                                <span>{count}</span>
                              </button>
                            ))}
                          </div>
                        ) : null
                      })()}

                      {/* Add Reaction Button - Always Visible */}
                      <div 
                        className={`relative inline-block mt-2`}
                        onMouseEnter={() => setShowReactionPicker(message.id)}
                        onMouseLeave={() => setShowReactionPicker(null)}
                      >
                        <button
                          onClick={() => setShowReactionPicker(showReactionPicker === message.id ? null : message.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                            isDark 
                              ? 'bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-gray-300 border border-gray-700' 
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 border border-gray-200'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>React</span>
                        </button>

                        {/* Reaction Picker Popup */}
                        {showReactionPicker === message.id && (
                          <div 
                            className={`absolute left-0 top-full mt-1 flex gap-1 p-2 rounded-lg shadow-lg border backdrop-blur-sm z-20 ${
                              isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
                            }`}
                          >
                            {Object.entries(REACTION_TYPES).map(([type, { emoji, label }]) => (
                              <button
                                key={type}
                                onClick={() => handleReaction(message.id, type)}
                                className="transition-transform hover:scale-125 p-1"
                                title={label}
                              >
                                <span className="text-lg">{emoji}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-right' : ''} ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Message Type Selector */}
        <div className="flex gap-2 mb-3">
          {Object.entries(messageTypeIcons).map(([type, Icon]) => (
            <button
              key={type}
              onClick={() => setMessageType(type)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${
                messageType === type
                  ? 'bg-temple-purple text-white'
                  : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span className="capitalize">{type}</span>
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              messageType === 'checkin' ? "Share your check-in..." :
              messageType === 'prayer' ? "Share a prayer request..." :
              messageType === 'celebration' ? "Celebrate a win! 🎉" :
              "Type a message..."
            }
            className={`flex-1 px-4 py-3 rounded-xl border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
            } focus:outline-none`}
          />
          <button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="p-3 rounded-xl bg-temple-purple text-white disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PodDetail