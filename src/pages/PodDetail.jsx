import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { podService } from '../features/pods/services/podService'
import { supabase } from '../lib/supabase'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import {
  Users, MessageCircle, Heart, Trophy, Send, Pin, Trash2,
  Reply, MoreVertical, Crown, LogOut, Lock, Globe, HandHeart,
  X, Plus, Calendar, ChevronDown, ChevronUp
} from 'lucide-react'
import { useConfirm } from '../components/ConfirmModal'

export const PodDetail = () => {
  const { id: podId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const confirm = useConfirm()

  const [pod, setPod] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('discussion')
  const [membership, setMembership] = useState({ isMember: false, role: null })

  // Posts
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [newPost, setNewPost] = useState('')
  const [postType, setPostType] = useState('discussion')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [posting, setPosting] = useState(false)

  // Replies
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')

  // Challenges
  const [challenges, setChallenges] = useState([])
  const [showNewChallenge, setShowNewChallenge] = useState(false)
  const [programs, setPrograms] = useState([])
  const [selectedProgram, setSelectedProgram] = useState('')
  const [challengeStart, setChallengeStart] = useState('')

  // Expanded posts
  const [expandedPosts, setExpandedPosts] = useState(new Set())

  useEffect(() => {
    loadPod()
  }, [podId])

  useEffect(() => {
    if (membership.isMember) {
      if (tab === 'discussion') loadPosts()
      if (tab === 'prayer') loadPosts('prayer')
      if (tab === 'challenges') loadChallenges()
    }
  }, [tab, membership.isMember])

  const loadPod = async () => {
    setLoading(true)
    const [podRes, memberRes] = await Promise.all([
      podService.getPod(podId),
      podService.isMember(podId, user.id),
    ])
    if (podRes.error || !podRes.data) {
      toast.error('Pod not found')
      navigate('/pods')
      return
    }
    setPod(podRes.data)
    setMembership(memberRes)
    setLoading(false)
  }

  const loadPosts = async (type = null) => {
    setPostsLoading(true)
    const { data } = await podService.getPosts(podId, type)
    setPosts(data || [])
    setPostsLoading(false)
  }

  const loadChallenges = async () => {
    const { data } = await podService.getChallenges(podId)
    setChallenges(data || [])
  }

  const handlePost = async () => {
    if (!newPost.trim()) return
    setPosting(true)
    const type = tab === 'prayer' ? 'prayer' : postType
    const { data, error } = await podService.createPost(podId, user.id, {
      content: newPost.trim(),
      postType: type,
      isAnonymous: tab === 'prayer' ? isAnonymous : false,
    })
    if (!error) {
      setNewPost('')
      setIsAnonymous(false)
      if (tab === 'prayer') loadPosts('prayer')
      else loadPosts()
      toast.success(tab === 'prayer' ? 'Prayer request shared 🙏' : 'Posted!')
    }
    setPosting(false)
  }

  const handleReply = async (parentId) => {
    if (!replyText.trim()) return
    const { error } = await podService.createReply(podId, parentId, user.id, replyText.trim())
    if (!error) {
      setReplyText('')
      setReplyingTo(null)
      if (tab === 'prayer') loadPosts('prayer')
      else loadPosts()
    }
  }

  const handleDelete = async (postId) => {
    const { error } = await podService.deletePost(postId)
    if (!error) {
      if (tab === 'prayer') loadPosts('prayer')
      else loadPosts()
    }
  }

  const handleReaction = async (postId, reactionType) => {
    const post = posts.find(p => p.id === postId)
    const myReaction = post?.prayer_reactions?.find(r => r.user_id === user.id && r.reaction_type === reactionType)

    if (myReaction) {
      await podService.removeReaction(postId, user.id, reactionType)
    } else {
      await podService.addReaction(postId, user.id, reactionType)
    }

    if (tab === 'prayer') loadPosts('prayer')
    else loadPosts()
  }

  const handleJoin = async () => {
    const { error } = await podService.joinPod(podId, user.id)
    if (!error) {
      toast.success('Welcome! 🎉')
      loadPod()
    }
  }

  const handleLeave = async () => {
    const yes = await confirm({
      title: 'Leave Pod',
      message: 'Are you sure you want to leave this pod? You can rejoin later.',
      confirmLabel: 'Leave',
      variant: 'info',
      icon: LogOut,
    })
    if (!yes) return
    const { error } = await podService.leavePod(podId, user.id)
    if (!error) {
      toast.success('Left the pod')
      navigate('/pods')
    }
  }

  const handleCreateChallenge = async () => {
    if (!selectedProgram || !challengeStart) return toast.error('Select a program and start date')
    const { error } = await podService.createChallenge(podId, user.id, {
      programId: selectedProgram,
      startDate: challengeStart,
    })
    if (!error) {
      toast.success('Challenge started! 🏆')
      setShowNewChallenge(false)
      loadChallenges()
    }
  }

  const loadPrograms = async () => {
    const { data } = await supabase
      .from('programs')
      .select('id, title, duration_days')
      .eq('is_published', true)
      .order('title')
    setPrograms(data || [])
  }

  const toggleExpanded = (postId) => {
    const updated = new Set(expandedPosts)
    updated.has(postId) ? updated.delete(postId) : updated.add(postId)
    setExpandedPosts(updated)
  }

  const isLeader = membership.role === 'leader'
  const tabs = [
    { key: 'discussion', label: 'Discussion', icon: MessageCircle },
    { key: 'prayer', label: 'Prayer Wall', icon: HandHeart },
    { key: 'challenges', label: 'Challenges', icon: Trophy },
    { key: 'members', label: 'Members', icon: Users },
  ]

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div></div>
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
      <AppHeader title={pod?.name || 'Pod'} showBackButton={true} backTo="/pods" />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Pod Info */}
        <div className="glass-card p-4 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {pod.is_private ? <Lock className="w-4 h-4 text-gray-400" /> : <Globe className="w-4 h-4 text-gray-400" />}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {pod.pod_members?.length || 0}/{pod.max_members} members
                </span>
              </div>
              {pod.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{pod.description}</p>
              )}
            </div>
            {membership.isMember ? (
              !isLeader && (
                <button onClick={handleLeave} className="text-sm text-red-500 hover:underline flex items-center gap-1">
                  <LogOut className="w-4 h-4" /> Leave
                </button>
              )
            ) : (
              <button onClick={handleJoin} className="btn-primary text-sm">Join Pod</button>
            )}
          </div>
        </div>

        {!membership.isMember ? (
          <div className="glass-card p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Join to participate</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Join this pod to see discussions, prayer requests, and challenges.</p>
            <button onClick={handleJoin} className="btn-primary">Join Pod</button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto">
              {tabs.map(t => {
                const Icon = t.icon
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      tab === t.key
                        ? 'bg-temple-purple dark:bg-temple-gold text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                )
              })}
            </div>

            {/* Discussion / Prayer Wall */}
            {(tab === 'discussion' || tab === 'prayer') && (
              <div className="space-y-4">
                {/* New Post */}
                <div className="glass-card p-4">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder={tab === 'prayer' ? 'Share a prayer request or testimony...' : 'Share with your pod...'}
                    className="form-input mb-3"
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {tab === 'prayer' && (
                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          Post anonymously
                        </label>
                      )}
                    </div>
                    <button onClick={handlePost} disabled={posting || !newPost.trim()} className="btn-primary flex items-center gap-2 text-sm">
                      <Send className="w-4 h-4" />
                      {posting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>

                {/* Posts */}
                {postsLoading ? (
                  <div className="text-center py-8"><div className="spinner mx-auto"></div></div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>{tab === 'prayer' ? 'No prayer requests yet. Be the first to share.' : 'No posts yet. Start the conversation!'}</p>
                  </div>
                ) : (
                  posts.map(post => {
                    const isOwn = post.user_id === user.id
                    const authorName = post.is_anonymous ? 'Anonymous' : (post.profile?.first_name || post.profiles?.first_name || 'Member')
                    const prayingCount = post.prayer_reactions?.filter(r => r.reaction_type === 'praying').length || 0
                    const amenCount = post.prayer_reactions?.filter(r => r.reaction_type === 'amen').length || 0
                    const myPraying = post.prayer_reactions?.some(r => r.user_id === user.id && r.reaction_type === 'praying')
                    const myAmen = post.prayer_reactions?.some(r => r.user_id === user.id && r.reaction_type === 'amen')
                    const replies = post.replies || []
                    const isExpanded = expandedPosts.has(post.id)

                    return (
                      <div key={post.id} className="glass-card p-4">
                        {/* Post Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-temple-purple/20 dark:bg-temple-gold/20 flex items-center justify-center text-sm font-bold text-temple-purple dark:text-temple-gold">
                              {authorName[0]?.toUpperCase()}
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{authorName}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {post.is_pinned && <Pin className="w-4 h-4 text-temple-purple dark:text-temple-gold" />}
                            {(isOwn || isLeader) && (
                              <button onClick={() => handleDelete(post.id)} className="p-1 rounded text-gray-400 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Post Content */}
                        <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">{post.content}</p>

                        {/* Reactions & Actions */}
                        <div className="flex items-center gap-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                          {tab === 'prayer' && (
                            <>
                              <button
                                onClick={() => handleReaction(post.id, 'praying')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                  myPraying
                                    ? 'bg-temple-purple/20 dark:bg-temple-gold/20 text-temple-purple dark:text-temple-gold'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                🙏 Praying {prayingCount > 0 && `(${prayingCount})`}
                              </button>
                              <button
                                onClick={() => handleReaction(post.id, 'amen')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                  myAmen
                                    ? 'bg-temple-purple/20 dark:bg-temple-gold/20 text-temple-purple dark:text-temple-gold'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                ❤️ Amen {amenCount > 0 && `(${amenCount})`}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <Reply className="w-3.5 h-3.5" /> Reply
                          </button>
                          {replies.length > 0 && (
                            <button
                              onClick={() => toggleExpanded(post.id)}
                              className="flex items-center gap-1 text-xs text-temple-purple dark:text-temple-gold font-medium"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                            </button>
                          )}
                        </div>

                        {/* Reply Input */}
                        {replyingTo === post.id && (
                          <div className="mt-3 flex gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleReply(post.id)}
                              placeholder="Write a reply..."
                              className="form-input flex-1 text-sm"
                              autoFocus
                            />
                            <button onClick={() => handleReply(post.id)} className="btn-primary text-sm px-3">
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Replies */}
                        {isExpanded && replies.length > 0 && (
                          <div className="mt-3 ml-6 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                            {replies.map(reply => (
                              <div key={reply.id} className="text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {reply.is_anonymous ? 'Anonymous' : (reply.profile?.first_name || reply.profiles?.first_name || 'Member')}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(reply.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* Challenges Tab */}
            {tab === 'challenges' && (
              <div className="space-y-4">
                {(isLeader) && (
                  <button
                    onClick={() => { setShowNewChallenge(true); loadPrograms() }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Start a Challenge
                  </button>
                )}

                {challenges.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No challenges yet.</p>
                    {isLeader && <p className="text-sm mt-1">Start a group challenge for your pod!</p>}
                  </div>
                ) : (
                  challenges.map(challenge => (
                    <div key={challenge.id} className="glass-card p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {challenge.programs?.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(challenge.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              {challenge.end_date && ` – ${new Date(challenge.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              challenge.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                              challenge.status === 'upcoming' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                              'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              {challenge.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Started by {challenge.assigned_by_profile?.first_name}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/programs/${challenge.programs?.slug}`)}
                          className="text-sm text-temple-purple dark:text-temple-gold font-medium hover:underline"
                        >
                          View Program →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Members Tab */}
            {tab === 'members' && (
              <div className="space-y-2">
                {pod.pod_members?.map(member => (
                  <div key={member.id} className="glass-card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-temple-purple/20 dark:bg-temple-gold/20 flex items-center justify-center font-bold text-temple-purple dark:text-temple-gold">
                        {(member.profile?.first_name || member.profiles?.first_name)?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {member.profile?.first_name || member.profiles?.first_name || 'Member'}
                        </span>
                        {member.role === 'leader' && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-temple-gold/20 text-temple-gold font-medium">
                            <Crown className="w-3 h-3 inline mr-1" />Leader
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Joined {new Date(member.joined_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
    <BottomNav />

    {/* New Challenge Modal */}
    {showNewChallenge && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Start a Challenge</h3>
            <button onClick={() => setShowNewChallenge(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program</label>
              <select value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)} className="form-input">
                <option value="">Select a program...</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.title} ({p.duration_days} days)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input
                type="date" value={challengeStart} onChange={(e) => setChallengeStart(e.target.value)}
                className="form-input" min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleCreateChallenge} className="btn-primary w-full">
              Start Challenge 🏆
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
