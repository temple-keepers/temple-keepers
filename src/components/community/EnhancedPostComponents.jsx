import { useState } from 'react'
import { 
  Heart, ThumbsUp, Laugh, MessageCircle, Share2, Bookmark, 
  Edit2, MoreHorizontal, User 
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { 
  addReaction, 
  getPostReactions, 
  getUserReaction,
  savePost, 
  checkIfSaved,
  sharePost,
  REACTION_TYPES 
} from '../lib/communityEnhanced'

// =============================================
// REACTION PICKER - Facebook-like hover picker
// =============================================
export const ReactionPicker = ({ postId, userId, currentReaction, onReact, isDark }) => {
  const [showPicker, setShowPicker] = useState(false)
  const [hoverReaction, setHoverReaction] = useState(null)

  const handleReaction = async (reactionType) => {
    await addReaction(postId, userId, reactionType)
    onReact()
    setShowPicker(false)
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowPicker(true)}
      onMouseLeave={() => {
        setShowPicker(false)
        setHoverReaction(null)
      }}
    >
      {/* Main Button */}
      <button
        onClick={() => handleReaction('like')}
        className={`flex items-center gap-2 text-sm transition-colors ${
          currentReaction 
            ? 'text-temple-purple font-medium' 
            : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {currentReaction ? (
          <span className="text-lg">{REACTION_TYPES[currentReaction].emoji}</span>
        ) : (
          <ThumbsUp className="w-5 h-5" />
        )}
        <span className="hidden sm:inline">
          {currentReaction ? REACTION_TYPES[currentReaction].label : 'Like'}
        </span>
      </button>

      {/* Reaction Picker Popup */}
      {showPicker && (
        <div 
          className={`absolute bottom-full left-0 mb-2 flex items-center gap-2 p-3 rounded-full shadow-lg border backdrop-blur-sm z-20 ${
            isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
          }`}
          style={{ animation: 'scaleIn 0.2s ease-out' }}
        >
          {Object.entries(REACTION_TYPES).map(([type, { emoji, label }]) => (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              onMouseEnter={() => setHoverReaction(type)}
              onMouseLeave={() => setHoverReaction(null)}
              className={`transition-transform hover:scale-125 relative ${
                hoverReaction === type ? 'scale-125' : ''
              }`}
              title={label}
            >
              <span className="text-2xl">{emoji}</span>
              {hoverReaction === type && (
                <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap px-2 py-1 rounded ${
                  isDark ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
                }`}>
                  {label}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(5px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

// =============================================
// REACTION SUMMARY - Shows who reacted with what
// =============================================
export const ReactionSummary = ({ postId, reactions, isDark }) => {
  if (!reactions || Object.keys(reactions).length === 0) return null

  const sortedReactions = Object.entries(reactions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3) // Show top 3 reaction types

  const totalCount = Object.values(reactions).reduce((sum, count) => sum + count, 0)

  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="flex -space-x-1">
        {sortedReactions.map(([type]) => (
          <span 
            key={type}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-800"
            title={REACTION_TYPES[type].label}
          >
            <span className="text-sm">{REACTION_TYPES[type].emoji}</span>
          </span>
        ))}
      </div>
      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {totalCount}
      </span>
    </div>
  )
}

// =============================================
// POST ACTION BAR - Like, Comment, Share, Save
// =============================================
export const PostActionBar = ({ 
  post, 
  user, 
  currentReaction,
  isSaved,
  onReact, 
  onComment, 
  onShare,
  onSave,
  isDark 
}) => {
  const handleSave = async () => {
    await savePost(post.id, user.id)
    onSave()
  }

  const handleShare = async () => {
    await sharePost(post.id, user.id)
    onShare()
  }

  return (
    <div className={`flex items-center justify-between pt-3 border-t ${
      isDark ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className="flex items-center gap-6">
        {/* Reactions */}
        <ReactionPicker 
          postId={post.id}
          userId={user.id}
          currentReaction={currentReaction}
          onReact={onReact}
          isDark={isDark}
        />

        {/* Comment */}
        <button
          onClick={onComment}
          className={`flex items-center gap-2 text-sm ${
            isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">{post.comments_count || 0}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className={`flex items-center gap-2 text-sm ${
            isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Share2 className="w-5 h-5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Bookmark */}
      <button
        onClick={handleSave}
        className={`p-2 rounded-lg transition-colors ${
          isSaved
            ? 'text-temple-purple'
            : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
        }`}
        title={isSaved ? 'Saved' : 'Save post'}
      >
        <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
      </button>
    </div>
  )
}

// =============================================
// NESTED COMMENT COMPONENT
// =============================================
export const CommentWithReplies = ({ comment, postId, userId, isDark, onReply }) => {
  const [showReplies, setShowReplies] = useState(false)
  const [replies, setReplies] = useState([])
  const [replyText, setReplyText] = useState('')
  const [loadingReplies, setLoadingReplies] = useState(false)

  const loadReplies = async () => {
    if (showReplies) {
      setShowReplies(false)
      return
    }
    setLoadingReplies(true)
    const { getCommentReplies } = await import('../lib/communityEnhanced')
    const repliesData = await getCommentReplies(comment.id)
    setReplies(repliesData)
    setShowReplies(true)
    setLoadingReplies(false)
  }

  const handleReply = async () => {
    if (!replyText.trim()) return
    const { addCommentReply } = await import('../lib/communityEnhanced')
    await addCommentReply(postId, comment.id, userId, replyText)
    setReplyText('')
    await loadReplies()
    onReply()
  }

  return (
    <div className="space-y-2">
      {/* Main Comment */}
      <div className="flex gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isDark ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          {comment.profile?.avatar_url ? (
            <img src={comment.profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <div className={`inline-block px-4 py-2 rounded-2xl ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {comment.profile?.full_name || 'Temple Keeper'}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {comment.content}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-1 ml-4">
            <button 
              onClick={loadReplies}
              className={`text-xs font-medium ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Reply
            </button>
            {comment.reply_count > 0 && (
              <button 
                onClick={loadReplies}
                className={`text-xs font-medium ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {loadingReplies ? 'Loading...' : showReplies ? 'Hide' : `${comment.reply_count} ${comment.reply_count === 1 ? 'reply' : 'replies'}`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {showReplies && (
        <div className="ml-11 space-y-2">
          {replies.map(reply => (
            <div key={reply.id} className="flex gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {reply.profile?.avatar_url ? (
                  <img src={reply.profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <User className="w-3 h-3 text-gray-400" />
                )}
              </div>
              <div className={`flex-1 px-3 py-2 rounded-2xl ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <p className={`font-medium text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {reply.profile?.full_name || 'Temple Keeper'}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {reply.content}
                </p>
              </div>
            </div>
          ))}
          
          {/* Reply Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleReply()}
              placeholder="Write a reply..."
              className={`flex-1 px-3 py-2 rounded-full text-sm border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              } focus:outline-none`}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default { ReactionPicker, ReactionSummary, PostActionBar, CommentWithReplies }
