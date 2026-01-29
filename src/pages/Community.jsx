import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { useAdmin } from '../contexts/AdminContext'
import { 
  getFeedPosts, 
  createPost,
  uploadPostImage,
  toggleLike, 
  checkUserLiked,
  getPostComments,
  addComment,
  deletePost
} from '../lib/community'
// Temporarily disabled enhanced components
// import {
//   addReaction,
//   getUserReaction,
//   getPostReactions,
//   savePost,
//   unsavePost,
//   checkIfSaved
// } from '../lib/communityEnhanced'
// import { ReactionPicker, ReactionSummary, PostActionBar } from '../components/community/EnhancedPostComponents'
import { getProfile } from '../lib/supabase'
import {
  MessageCircle,
  Heart,
  Send,
  MoreHorizontal,
  Trash2,
  Award,
  Flame,
  Sparkles,
  HelpCircle,
  BookHeart,
  Plus,
  X,
  Users,
  Trophy,
  HandHeart,
  ChevronDown,
  User,
  Clock,
  MessageSquare,
  Image,
  Smile,
  Link2,
  ExternalLink,
  Loader2
} from 'lucide-react'

const Community = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { toast } = useToast()
  const { isAdmin } = useAdmin()
  
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState('feed')

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    const [postsData, profile] = await Promise.all([
      getFeedPosts(),
      getProfile(user.id)
    ])
    setPosts(postsData)
    setUserProfile(profile)
    setLoading(false)
  }

  const tabs = [
    { id: 'feed', label: 'Feed', icon: MessageCircle },
    { id: 'prayer', label: 'Prayer Wall', icon: HandHeart },
    { id: 'pods', label: 'Pods', icon: Users },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-temple-purple/30 border-t-temple-purple rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 max-w-2xl">  
        <div>
          <h1 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Community
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Connect, encourage, and grow together
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-temple-purple'
                  : isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      {activeTab === 'feed' && (
        <FeedTab 
          posts={posts} 
          user={user} 
          userProfile={userProfile}
          isDark={isDark} 
          toast={toast}
          onRefresh={loadData}
        />
      )}
      {activeTab === 'prayer' && (
        <PrayerWallTab user={user} isDark={isDark} toast={toast} />
      )}
      {activeTab === 'pods' && (
        <PodsTab user={user} isDark={isDark} toast={toast} isAdmin={isAdmin} />
      )}
      {activeTab === 'leaderboard' && (
        <LeaderboardTab user={user} isDark={isDark} />
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          user={user}
          isDark={isDark}
          toast={toast}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}

// ============================================
// POST CONTENT HELPER - Renders clickable links
// ============================================
const PostContent = ({ content, isDark }) => {
  // Regex to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = content.split(urlRegex)
  
  return (
    <>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-temple-purple hover:underline break-all"
            >
              {part}
            </a>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

// ============================================
// EMOJI PICKER
// ============================================
const EMOJI_LIST = [
  '😀', '😊', '🙏', '❤️', '🔥', '✨', '💪', '🎉', '👏', '💯',
  '🙌', '😇', '🥰', '😍', '🤗', '🤩', '💜', '💖', '🌟', '⭐',
  '✝️', '📖', '🕊️', '🌈', '☀️', '🌻', '🍎', '🥗', '💧', '🏃',
  '🧘', '💤', '🎯', '📝', '💡', '🔔', '🎵', '🌸', '🌿', '🦋'
]

// ============================================
// FEED TAB
// ============================================
const FeedTab = ({ posts, user, userProfile, isDark, toast, onRefresh }) => {
  const [likedPosts, setLikedPosts] = useState({})
  const [expandedComments, setExpandedComments] = useState(null)
  const [comments, setComments] = useState({})
  const [newComment, setNewComment] = useState('')
  const [loadingComment, setLoadingComment] = useState(false)

  useEffect(() => {
    // Check which posts user has liked
    const checkLikes = async () => {
      const liked = {}
      for (const post of posts) {
        liked[post.id] = await checkUserLiked(post.id, user.id)
      }
      setLikedPosts(liked)
    }
    checkLikes()
  }, [posts, user.id])

  const handleLike = async (postId) => {
    try {
      const liked = await toggleLike(postId, user.id)
      setLikedPosts(prev => ({ ...prev, [postId]: liked }))
      onRefresh()
    } catch (error) {
      toast.error('Failed to like post')
    }
  }

  const loadComments = async (postId) => {
    if (expandedComments === postId) {
      setExpandedComments(null)
      return
    }
    const commentsData = await getPostComments(postId)
    setComments(prev => ({ ...prev, [postId]: commentsData }))
    setExpandedComments(postId)
  }

  const handleComment = async (postId) => {
    if (!newComment.trim()) return
    setLoadingComment(true)
    try {
      await addComment(postId, user.id, newComment)
      setNewComment('')
      loadComments(postId)
      onRefresh()
      toast.success('Comment added!')
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setLoadingComment(false)
    }
  }

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return
    try {
      await deletePost(postId)
      onRefresh()
      toast.success('Post deleted')
    } catch (error) {
      toast.error('Failed to delete post')
    }
  }

  const typeIcons = {
    update: MessageCircle,
    win: Award,
    encouragement: Sparkles,
    question: HelpCircle,
    testimony: BookHeart
  }

  const typeLabels = {
    update: 'Update',
    win: 'Win',
    encouragement: 'Encouragement',
    question: 'Question',
    testimony: 'Testimony'
  }

  const typeColors = {
    update: 'bg-blue-500/20 text-blue-500',
    win: 'bg-amber-500/20 text-amber-500',
    encouragement: 'bg-pink-500/20 text-pink-500',
    question: 'bg-purple-500/20 text-purple-500',
    testimony: 'bg-green-500/20 text-green-500'
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {posts.length === 0 ? (
        <div className={`text-center py-12 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <MessageCircle className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No posts yet
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Be the first to share with the community!
          </p>
        </div>
      ) : (
        posts.map((post) => {
          const Icon = typeIcons[post.type] || MessageCircle
          const profile = post.profile // Direct join to profiles
          const isOwner = post.user_id === user.id
          const postComments = comments[post.id] || []
          const linkPreview = post.link_preview

          return (
            <div 
              key={post.id}
              className={`rounded-2xl p-5 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {post.is_anonymous ? 'Anonymous' : (profile?.full_name || 'Temple Keeper')}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatTime(post.created_at)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${typeColors[post.type]}`}>
                        {typeLabels[post.type]}
                      </span>
                    </div>
                  </div>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleDelete(post.id)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>

              {/* Content with clickable links */}
              <p className={`mb-4 whitespace-pre-wrap ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <PostContent content={post.content} isDark={isDark} />
              </p>

              {/* Post Image */}
              {post.image_url && (
                <div className="mb-4 rounded-xl overflow-hidden">
                  <img 
                    src={post.image_url} 
                    alt="Post image" 
                    className="w-full max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => window.open(post.image_url, '_blank')}
                  />
                </div>
              )}

              {/* Link Preview */}
              {linkPreview && (
                <a 
                  href={linkPreview.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`block mb-4 rounded-xl overflow-hidden border ${
                    isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                  } transition-colors`}
                >
                  {linkPreview.image && (
                    <img 
                      src={linkPreview.image} 
                      alt="" 
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className={`p-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`font-medium mb-1 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {linkPreview.title || linkPreview.url}
                    </p>
                    {linkPreview.description && (
                      <p className={`text-sm line-clamp-2 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {linkPreview.description}
                      </p>
                    )}
                    <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <ExternalLink className="w-3 h-3" />
                      {new URL(linkPreview.url).hostname}
                    </p>
                  </div>
                </a>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 text-sm ${
                    likedPosts[post.id] 
                      ? 'text-red-500' 
                      : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${likedPosts[post.id] ? 'fill-red-500' : ''}`} />
                  {post.likes_count}
                </button>
                <button
                  onClick={() => loadComments(post.id)}
                  className={`flex items-center gap-2 text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  {post.comments_count}
                </button>
              </div>

              {/* Comments Section */}
              {expandedComments === post.id && (
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  {/* Comment List */}
                  <div className="space-y-3 mb-4">
                    {postComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isDark ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <span className="font-medium">
                              {comment.user?.profiles?.full_name || 'Temple Keeper'}
                            </span>
                            <span className={`ml-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {formatTime(comment.created_at)}
                            </span>
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                      placeholder="Write a comment..."
                      className={`flex-1 px-4 py-2 rounded-xl border ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                      } focus:outline-none`}
                    />
                    <button
                      onClick={() => handleComment(post.id)}
                      disabled={loadingComment || !newComment.trim()}
                      className="p-2 rounded-xl bg-temple-purple text-white disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

// ============================================
// CREATE POST MODAL - Enhanced with images, emojis, and link preview
// ============================================
const CreatePostModal = ({ user, isDark, toast, onClose, onCreated }) => {
  const [type, setType] = useState('update')
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [posting, setPosting] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const types = [
    { id: 'update', label: 'Update', icon: MessageCircle },
    { id: 'win', label: 'Win 🎉', icon: Award },
    { id: 'encouragement', label: 'Encourage', icon: Sparkles },
    { id: 'question', label: 'Question', icon: HelpCircle },
    { id: 'testimony', label: 'Testimony', icon: BookHeart }
  ]

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = content.slice(0, start) + emoji + content.slice(end)
      setContent(newContent)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 0)
    } else {
      setContent(prev => prev + emoji)
    }
    setShowEmojiPicker(false)
  }

  // Extract URL from content for link preview
  const extractUrl = (text) => {
    const urlMatch = text.match(/(https?:\/\/[^\s]+)/)
    return urlMatch ? urlMatch[1] : null
  }

  const handlePost = async () => {
    if (!content.trim() && !imageFile) {
      toast.error('Please write something or add an image')
      return
    }
    setPosting(true)
    try {
      let imageUrl = null
      
      // Upload image if selected
      if (imageFile) {
        setUploadingImage(true)
        try {
          imageUrl = await uploadPostImage(user.id, imageFile)
        } catch (err) {
          console.error('Image upload failed:', err)
          toast.error('Failed to upload image')
          setPosting(false)
          setUploadingImage(false)
          return
        }
        setUploadingImage(false)
      }

      const newPost = await createPost(user.id, type, content, isAnonymous, imageUrl)
      console.log('Post created successfully:', newPost)
      
      // Reset form state
      setContent('')
      setImageFile(null)
      setImagePreview(null)
      setIsAnonymous(false)
      setType('update')
      
      toast.success('Posted! 🎉')
      
      // Close modal first
      onClose()
      
      // Then refresh data after a brief delay to ensure DB consistency
      setTimeout(() => {
        onCreated()
      }, 300)
    } catch (error) {
      console.error('Post error:', error)
      toast.error(error.message || 'Failed to post')
    } finally {
      setPosting(false)
      setUploadingImage(false)
    }
  }

  const detectedUrl = extractUrl(content)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Share with Community
          </h3>
          <button onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Type */}
        <div className="flex flex-wrap gap-2 mb-4">
          {types.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                  type === t.id
                    ? 'bg-temple-purple text-white'
                    : isDark 
                      ? 'bg-gray-700 text-gray-300' 
                      : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            type === 'win' ? "Share your win! What are you celebrating? 🎉" :
            type === 'question' ? "What would you like to ask the community? 🤔" :
            type === 'testimony' ? "Share how God has worked in your life... ✨" :
            type === 'encouragement' ? "Share some encouragement... 💜" :
            "What's on your mind? 💭"
          }
          rows={4}
          className={`w-full px-4 py-3 rounded-xl border resize-none mb-2 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
          } focus:outline-none focus:ring-2 focus:ring-temple-purple/20`}
        />

        {/* Media Toolbar */}
        <div className="flex items-center gap-2 mb-4">
          {/* Image Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
            title="Add image"
          >
            <Image className="w-5 h-5" />
          </button>

          {/* Emoji Picker Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 rounded-lg transition-colors ${
                showEmojiPicker 
                  ? 'bg-temple-purple/20 text-temple-purple' 
                  : isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
              title="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            
            {/* Emoji Grid */}
            {showEmojiPicker && (
              <div className={`absolute bottom-full left-0 mb-2 p-3 rounded-xl shadow-lg border z-10 ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
              }`}>
                <div className="grid grid-cols-8 gap-1 w-64">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* URL detected indicator */}
          {detectedUrl && (
            <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Link2 className="w-4 h-4" />
              Link detected
            </span>
          )}
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative mb-4">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full max-h-48 object-cover rounded-xl"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Anonymous Toggle */}
        <label className={`flex items-center gap-3 mb-4 cursor-pointer ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-temple-purple focus:ring-temple-purple"
          />
          <span className="text-sm">Post anonymously</span>
        </label>

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
            onClick={handlePost}
            disabled={posting || uploadingImage || (!content.trim() && !imageFile)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {posting || uploadingImage ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {uploadingImage ? 'Uploading...' : 'Posting...'}
              </>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// PRAYER WALL TAB (Import separately)
// ============================================
import PrayerWallTab from '../components/community/PrayerWallTab'

// ============================================
// PODS TAB (Import separately)
// ============================================
import PodsTab from '../components/community/PodsTab'

// ============================================
// LEADERBOARD TAB (Import separately)
// ============================================
import LeaderboardTab from '../components/community/LeaderboardTab'

export default Community