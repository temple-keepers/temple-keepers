import { supabase } from './supabase'

// =============================================
// REACTIONS (Facebook-like)
// =============================================

export const REACTION_TYPES = {
  like: { emoji: '👍', label: 'Like' },
  love: { emoji: '❤️', label: 'Love' },
  pray: { emoji: '🙏', label: 'Pray' },
  celebrate: { emoji: '🎉', label: 'Celebrate' },
  care: { emoji: '🤗', label: 'Care' },
  insightful: { emoji: '💡', label: 'Insightful' }
}

export const addReaction = async (postId, userId, reactionType) => {
  // Check if user already reacted
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id, reaction')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    // Update reaction if different, otherwise remove
    if (existing.reaction === reactionType) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('id', existing.id)
      return null
    } else {
      const { data, error } = await supabase
        .from('post_likes')
        .update({ reaction: reactionType })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return data
    }
  } else {
    // Add new reaction
    const { data, error } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: userId,
        reaction: reactionType
      })
      .select()
      .single()
    if (error) throw error
    return data
  }
}

export const getPostReactions = async (postId) => {
  const { data, error } = await supabase
    .from('post_likes')
    .select('reaction, user_id')
    .eq('post_id', postId)

  if (error) {
    console.error('Error fetching reactions:', error)
    return { reactions: {}, userReaction: null }
  }

  // Count reactions by type
  const reactionCounts = {}
  data.forEach(r => {
    reactionCounts[r.reaction] = (reactionCounts[r.reaction] || 0) + 1
  })

  return { reactions: reactionCounts, totalCount: data.length }
}

export const getUserReaction = async (postId, userId) => {
  const { data, error } = await supabase
    .from('post_likes')
    .select('reaction')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user reaction:', error)
  }
  return data?.reaction || null
}

// =============================================
// NESTED COMMENTS (Comment Replies)
// =============================================

export const addCommentReply = async (postId, parentCommentId, userId, content) => {
  const { data, error } = await supabase
    .from('post_comments')
    .insert({
      post_id: postId,
      user_id: userId,
      content,
      parent_comment_id: parentCommentId
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getCommentReplies = async (commentId) => {
  const { data: replies, error } = await supabase
    .from('post_comments')
    .select('*')
    .eq('parent_comment_id', commentId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching replies:', error)
    return []
  }

  // Fetch profiles for reply authors
  const userIds = [...new Set(replies.map(r => r.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds)

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
  return replies.map(reply => ({
    ...reply,
    profile: profileMap.get(reply.user_id)
  }))
}

// =============================================
// POST SHARING
// =============================================

export const sharePost = async (postId, userId, shareComment = null) => {
  const { data, error } = await supabase
    .from('community_post_shares')
    .insert({
      post_id: postId,
      shared_by: userId,
      share_comment: shareComment
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getPostShares = async (postId) => {
  const { data, error } = await supabase
    .from('community_post_shares')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching shares:', error)
    return []
  }
  return data
}

// =============================================
// MULTIPLE IMAGES/MEDIA
// =============================================

export const uploadPostMedia = async (userId, files) => {
  const uploads = []
  
  for (const file of files) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(fileName, file)

    if (error) {
      console.error('Error uploading media:', error)
      continue
    }

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName)

    uploads.push({
      url: publicUrl,
      type: file.type.startsWith('video') ? 'video' : 'image'
    })
  }

  return uploads
}

export const addPostMedia = async (postId, mediaItems) => {
  const inserts = mediaItems.map((item, index) => ({
    post_id: postId,
    media_url: item.url,
    media_type: item.type,
    position: index
  }))

  const { data, error } = await supabase
    .from('community_post_media')
    .insert(inserts)
    .select()

  if (error) throw error
  return data
}

export const getPostMedia = async (postId) => {
  const { data, error } = await supabase
    .from('community_post_media')
    .select('*')
    .eq('post_id', postId)
    .order('position', { ascending: true })

  if (error) {
    console.error('Error fetching media:', error)
    return []
  }
  return data
}

// =============================================
// MEMBER MENTIONS (@username)
// =============================================

export const extractMentions = (content) => {
  const mentionRegex = /@(\w+)/g
  const mentions = []
  let match
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1])
  }
  return mentions
}

export const searchMembersByUsername = async (query) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .ilike('full_name', `%${query}%`)
    .limit(10)

  if (error) {
    console.error('Error searching members:', error)
    return []
  }
  return data
}

export const addPostMentions = async (postId, mentionedUserIds) => {
  const inserts = mentionedUserIds.map(userId => ({
    post_id: postId,
    mentioned_user_id: userId
  }))

  const { data, error } = await supabase
    .from('community_post_mentions')
    .insert(inserts)
    .select()

  if (error) {
    // Ignore duplicate key errors
    if (error.code !== '23505') {
      console.error('Error adding mentions:', error)
    }
  }
  return data
}

// =============================================
// POLLS
// =============================================

export const createPoll = async (postId, question, options, multipleChoice = false, expiresAt = null) => {
  const pollOptions = options.map((text, index) => ({
    id: (index + 1).toString(),
    text,
    votes: 0
  }))

  const { data, error } = await supabase
    .from('community_polls')
    .insert({
      post_id: postId,
      question,
      options: pollOptions,
      multiple_choice: multipleChoice,
      expires_at: expiresAt
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const voteOnPoll = async (pollId, userId, optionIds) => {
  // Check if user already voted
  const { data: existing } = await supabase
    .from('community_poll_votes')
    .select('id')
    .eq('poll_id', pollId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    // Update vote
    const { data, error } = await supabase
      .from('community_poll_votes')
      .update({ option_ids: optionIds })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    // Insert new vote
    const { data, error } = await supabase
      .from('community_poll_votes')
      .insert({
        poll_id: pollId,
        user_id: userId,
        option_ids: optionIds
      })
      .select()
      .single()
    if (error) throw error
    return data
  }
}

export const getPollResults = async (pollId) => {
  const { data: poll, error: pollError } = await supabase
    .from('community_polls')
    .select('*')
    .eq('id', pollId)
    .single()

  if (pollError) throw pollError

  const { data: votes, error: votesError } = await supabase
    .from('community_poll_votes')
    .select('option_ids')
    .eq('poll_id', pollId)

  if (votesError) throw votesError

  // Count votes for each option
  const voteCounts = {}
  votes.forEach(vote => {
    vote.option_ids.forEach(optionId => {
      voteCounts[optionId] = (voteCounts[optionId] || 0) + 1
    })
  })

  // Update options with vote counts
  const updatedOptions = poll.options.map(option => ({
    ...option,
    votes: voteCounts[option.id] || 0
  }))

  return {
    ...poll,
    options: updatedOptions,
    totalVotes: votes.length
  }
}

// =============================================
// POD EVENTS
// =============================================

export const createPodEvent = async (podId, userId, eventData) => {
  const { data, error } = await supabase
    .from('pod_events')
    .insert({
      pod_id: podId,
      created_by: userId,
      ...eventData
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getPodEvents = async (podId) => {
  const { data, error } = await supabase
    .from('pod_events')
    .select('*')
    .eq('pod_id', podId)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }
  return data
}

export const rsvpToEvent = async (eventId, userId, status = 'going') => {
  const { data: existing } = await supabase
    .from('pod_event_rsvps')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    // Update RSVP
    const { data, error } = await supabase
      .from('pod_event_rsvps')
      .update({ status })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    // Create RSVP
    const { data, error } = await supabase
      .from('pod_event_rsvps')
      .insert({
        event_id: eventId,
        user_id: userId,
        status
      })
      .select()
      .single()
    if (error) throw error
    return data
  }
}

export const getEventRsvps = async (eventId) => {
  const { data, error } = await supabase
    .from('pod_event_rsvps')
    .select('*')
    .eq('event_id', eventId)

  if (error) {
    console.error('Error fetching RSVPs:', error)
    return []
  }

  // Fetch profiles
  const userIds = data.map(r => r.user_id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds)

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
  return data.map(rsvp => ({
    ...rsvp,
    profile: profileMap.get(rsvp.user_id)
  }))
}

// =============================================
// POST SAVES/BOOKMARKS
// =============================================

export const savePost = async (postId, userId) => {
  const { data, error } = await supabase
    .from('community_post_saves')
    .insert({
      post_id: postId,
      user_id: userId
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      // Already saved, so unsave
      await unsavePost(postId, userId)
      return null
    }
    throw error
  }
  return data
}

export const unsavePost = async (postId, userId) => {
  const { error } = await supabase
    .from('community_post_saves')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)

  if (error) throw error
}

export const getSavedPosts = async (userId) => {
  const { data: saves, error } = await supabase
    .from('community_post_saves')
    .select('post_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching saved posts:', error)
    return []
  }

  if (saves.length === 0) return []

  // Get full post details
  const postIds = saves.map(s => s.post_id)
  const { data: posts } = await supabase
    .from('community_posts')
    .select('*')
    .in('id', postIds)

  // Fetch profiles
  const userIds = [...new Set(posts?.map(p => p.user_id) || [])]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds)

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
  return posts?.map(post => ({
    ...post,
    profile: profileMap.get(post.user_id)
  })) || []
}

export const checkIfSaved = async (postId, userId) => {
  const { data, error } = await supabase
    .from('community_post_saves')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking save status:', error)
  }
  return !!data
}

// =============================================
// POST EDITING
// =============================================

export const editPost = async (postId, content, images = null) => {
  // Get current post to save to history
  const { data: currentPost } = await supabase
    .from('community_posts')
    .select('content, image_url, edit_history')
    .eq('id', postId)
    .single()

  if (!currentPost) throw new Error('Post not found')

  // Add current version to history
  const editHistory = currentPost.edit_history || []
  editHistory.push({
    content: currentPost.content,
    image_url: currentPost.image_url,
    edited_at: new Date().toISOString()
  })

  // Update post
  const { data, error } = await supabase
    .from('community_posts')
    .update({
      content,
      image_url: images || currentPost.image_url,
      edited_at: new Date().toISOString(),
      edit_history: editHistory
    })
    .eq('id', postId)
    .select()
    .single()

  if (error) throw error
  return data
}

