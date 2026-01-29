import { useState, useEffect } from 'react'
import { BarChart3, CheckCircle, Clock, Calendar, MapPin, Users, Video } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import {
  createPoll,
  voteOnPoll,
  getPollResults,
  createPodEvent,
  getPodEvents,
  rsvpToEvent,
  getEventRsvps
} from '../../lib/communityEnhanced'

// =============================================
// POLL COMPONENT
// =============================================
export const PollCard = ({ poll, userId, isDark }) => {
  const [results, setResults] = useState(null)
  const [userVote, setUserVote] = useState(null)
  const [selectedOptions, setSelectedOptions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPollData()
  }, [poll.id])

  const loadPollData = async () => {
    const pollResults = await getPollResults(poll.id)
    setResults(pollResults)
    
    // Check if user has voted
    const { data } = await supabase
      .from('community_poll_votes')
      .select('option_ids')
      .eq('poll_id', poll.id)
      .eq('user_id', userId)
      .single()
    
    if (data) {
      setUserVote(data.option_ids)
      setSelectedOptions(data.option_ids)
    }
  }

  const handleVote = async () => {
    if (selectedOptions.length === 0) return
    setLoading(true)
    try {
      await voteOnPoll(poll.id, userId, selectedOptions)
      await loadPollData()
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleOption = (optionId) => {
    if (!poll.multiple_choice) {
      setSelectedOptions([optionId])
    } else {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      )
    }
  }

  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date()
  const hasVoted = userVote !== null
  const totalVotes = results?.totalVotes || 0

  return (
    <div className={`p-4 rounded-xl border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Poll Question */}
      <div className="flex items-start gap-2 mb-3">
        <BarChart3 className="w-5 h-5 text-temple-purple flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {poll.question}
          </h4>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            {poll.multiple_choice && ' • Multiple choice'}
            {poll.expires_at && (
              <>
                {' • '}
                {isExpired ? 'Ended' : 'Ends'} {new Date(poll.expires_at).toLocaleDateString()}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Poll Options */}
      <div className="space-y-2 mb-3">
        {results?.options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
          const isSelected = selectedOptions.includes(option.id)
          const isVoted = userVote?.includes(option.id)

          return (
            <div key={option.id}>
              {hasVoted || isExpired ? (
                // Show results
                <div className={`relative p-3 rounded-lg overflow-hidden ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  {/* Progress bar */}
                  <div 
                    className="absolute inset-0 bg-temple-purple/20"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {option.text}
                      </span>
                      {isVoted && (
                        <CheckCircle className="w-4 h-4 text-temple-purple" />
                      )}
                    </div>
                    <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {Math.round(percentage)}%
                    </span>
                  </div>
                </div>
              ) : (
                // Voting interface
                <button
                  onClick={() => toggleOption(option.id)}
                  className={`w-full p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-temple-purple bg-temple-purple/10'
                      : isDark
                        ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-temple-purple' : 'border-gray-400'
                    }`}>
                      {isSelected && (
                        <div className="w-3 h-3 rounded-full bg-temple-purple" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {option.text}
                    </span>
                  </div>
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Vote Button */}
      {!hasVoted && !isExpired && (
        <button
          onClick={handleVote}
          disabled={selectedOptions.length === 0 || loading}
          className="w-full py-2 rounded-lg bg-temple-purple text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Voting...' : 'Vote'}
        </button>
      )}
    </div>
  )
}

// =============================================
// CREATE POLL MODAL
// =============================================
export const CreatePollModal = ({ postId, userId, onClose, onCreated, isDark }) => {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [multipleChoice, setMultipleChoice] = useState(false)
  const [expiresIn, setExpiresIn] = useState('7') // days
  const [creating, setCreating] = useState(false)

  const updateOption = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ''])
    }
  }

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleCreate = async () => {
    const validOptions = options.filter(o => o.trim())
    if (!question.trim() || validOptions.length < 2) {
      alert('Please provide a question and at least 2 options')
      return
    }

    setCreating(true)
    try {
      const expiresAt = expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000).toISOString() : null
      await createPoll(postId, question, validOptions, multipleChoice, expiresAt)
      onCreated()
    } catch (error) {
      console.error('Error creating poll:', error)
      alert('Failed to create poll')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-3xl p-6 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Create Poll
        </h3>

        {/* Question */}
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className={`w-full px-4 py-3 rounded-xl border mb-4 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
          } focus:outline-none`}
        />

        {/* Options */}
        <div className="space-y-2 mb-4">
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className={`flex-1 px-4 py-2 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                } focus:outline-none`}
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className="px-3 text-red-500 hover:bg-red-500/10 rounded-lg"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {options.length < 10 && (
            <button
              onClick={addOption}
              className={`w-full py-2 rounded-lg border-2 border-dashed ${
                isDark 
                  ? 'border-gray-600 text-gray-400 hover:border-gray-500' 
                  : 'border-gray-300 text-gray-500 hover:border-gray-400'
              }`}
            >
              + Add Option
            </button>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={multipleChoice}
              onChange={(e) => setMultipleChoice(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Allow multiple choices
            </span>
          </label>

          <div>
            <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Poll duration
            </label>
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl border mt-1 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            >
              <option value="">Never</option>
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-medium ${
              isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex-1 py-3 rounded-xl bg-temple-purple text-white font-medium disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Poll'}
          </button>
        </div>
      </div>
    </div>
  )
}

// =============================================
// POD EVENT CARD
// =============================================
export const PodEventCard = ({ event, userId, isDark }) => {
  const [rsvps, setRsvps] = useState([])
  const [userRsvp, setUserRsvp] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRsvps()
  }, [event.id])

  const loadRsvps = async () => {
    const rsvpData = await getEventRsvps(event.id)
    setRsvps(rsvpData)
    const userResponse = rsvpData.find(r => r.user_id === userId)
    setUserRsvp(userResponse?.status || null)
  }

  const handleRsvp = async (status) => {
    setLoading(true)
    try {
      await rsvpToEvent(event.id, userId, status)
      await loadRsvps()
    } catch (error) {
      console.error('Error RSVPing:', error)
    } finally {
      setLoading(false)
    }
  }

  const eventDate = new Date(event.event_date)
  const isPast = eventDate < new Date()
  const goingCount = rsvps.filter(r => r.status === 'going').length
  const maybeCount = rsvps.filter(r => r.status === 'maybe').length

  return (
    <div className={`p-4 rounded-xl border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Event Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-3 rounded-xl ${isPast ? 'bg-gray-500/20' : 'bg-temple-purple/20'}`}>
          <Calendar className={`w-6 h-6 ${isPast ? 'text-gray-500' : 'text-temple-purple'}`} />
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {event.title}
          </h4>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {eventDate.toLocaleString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {event.description}
        </p>
      )}

      {/* Location/Link */}
      <div className="space-y-2 mb-3">
        {event.is_online && event.meeting_link && (
          <a
            href={event.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-temple-purple hover:underline"
          >
            <Video className="w-4 h-4" />
            Join online meeting
          </a>
        )}
        {!event.is_online && event.location && (
          <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <MapPin className="w-4 h-4" />
            {event.location}
          </div>
        )}
      </div>

      {/* RSVP Counts */}
      <div className={`flex items-center gap-4 py-2 mb-3 border-t border-b ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <Users className="w-4 h-4 inline mr-1" />
          {goingCount} going
        </div>
        {maybeCount > 0 && (
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {maybeCount} maybe
          </div>
        )}
        {event.max_attendees && (
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Limit: {event.max_attendees}
          </div>
        )}
      </div>

      {/* RSVP Buttons */}
      {!isPast && (
        <div className="flex gap-2">
          <button
            onClick={() => handleRsvp('going')}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              userRsvp === 'going'
                ? 'bg-temple-purple text-white'
                : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Going
          </button>
          <button
            onClick={() => handleRsvp('maybe')}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              userRsvp === 'maybe'
                ? 'bg-temple-gold text-white'
                : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Maybe
          </button>
          <button
            onClick={() => handleRsvp('not_going')}
            disabled={loading}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              userRsvp === 'not_going'
                ? isDark ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-700'
                : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Can't go
          </button>
        </div>
      )}
    </div>
  )
}

export default { PollCard, CreatePollModal, PodEventCard }
