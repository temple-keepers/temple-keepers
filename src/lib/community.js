import { supabase } from './supabase'

// ============================================
// COMMUNITY FEED
// ============================================

export const getFeedPosts = async (limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      profile:user_id (
        id,
        full_name,
        avatar_url,
        community_visible
      )
    `)
    .eq('is_hidden', false)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }
  return data || []
}

export const createPost = async (userId, type, content, isAnonymous = false, imageUrl = null) => {
  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      user_id: userId,
      type,
      content,
      is_anonymous: isAnonymous,
      image_url: imageUrl
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating post:', error)
    throw error
  }
  return data
}

// Upload image for post
export const uploadPostImage = async (userId, file) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('post-images')
    .upload(fileName, file)

  if (error) {
    console.error('Error uploading image:', error)
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from('post-images')
    .getPublicUrl(fileName)

  return publicUrl
}

export const deletePost = async (postId) => {
  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', postId)

  if (error) throw error
  return true
}

export const toggleLike = async (postId, userId) => {
  // Check if already liked
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    // Unlike
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('id', existing.id)
    
    if (error) throw error
    return false // unliked
  } else {
    // Like
    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: userId })
    
    if (error) throw error
    return true // liked
  }
}

export const checkUserLiked = async (postId, userId) => {
  const { data } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  return !!data
}

export const getPostComments = async (postId) => {
  const { data, error } = await supabase
    .from('post_comments')
    .select(`
      *,
      profile:user_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }
  return data || []
}

export const addComment = async (postId, userId, content) => {
  const { data, error } = await supabase
    .from('post_comments')
    .insert({ post_id: postId, user_id: userId, content })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// PRAYER WALL
// ============================================

export const getPrayerRequests = async (limit = 50, offset = 0, category = null) => {
  let query = supabase
    .from('prayer_requests')
    .select(`
      *,
      profile:user_id (
        id,
        full_name,
        avatar_url,
        community_visible
      )
    `)
    .eq('is_private', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching prayers:', error)
    return []
  }
  return data || []
}

export const getMyPrayerRequests = async (userId) => {
  const { data, error } = await supabase
    .from('prayer_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching my prayers:', error)
    return []
  }
  return data || []
}

export const createPrayerRequest = async (userId, title, description, category, isAnonymous = false, isPrivate = false) => {
  const { data, error } = await supabase
    .from('prayer_requests')
    .insert({
      user_id: userId,
      title,
      description,
      category,
      is_anonymous: isAnonymous,
      is_private: isPrivate
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const markPrayerAnswered = async (prayerId, testimony = null) => {
  const { data, error } = await supabase
    .from('prayer_requests')
    .update({
      is_answered: true,
      answered_testimony: testimony,
      updated_at: new Date().toISOString()
    })
    .eq('id', prayerId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deletePrayerRequest = async (prayerId) => {
  const { error } = await supabase
    .from('prayer_requests')
    .delete()
    .eq('id', prayerId)

  if (error) throw error
  return true
}

export const prayForRequest = async (prayerId, userId) => {
  // Check if already prayed
  const { data: existing } = await supabase
    .from('prayer_interactions')
    .select('id')
    .eq('prayer_request_id', prayerId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    return false // Already prayed
  }

  const { error } = await supabase
    .from('prayer_interactions')
    .insert({ prayer_request_id: prayerId, user_id: userId })

  if (error) throw error
  return true
}

export const checkUserPrayed = async (prayerId, userId) => {
  const { data } = await supabase
    .from('prayer_interactions')
    .select('id')
    .eq('prayer_request_id', prayerId)
    .eq('user_id', userId)
    .single()

  return !!data
}

// ============================================
// ACCOUNTABILITY PODS
// ============================================

export const getPublicPods = async () => {
  const { data, error } = await supabase
    .from('pods')
    .select(`
      *,
      members:pod_members(count),
      creator:created_by (
        full_name
      )
    `)
    .eq('is_private', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pods:', error)
    return []
  }
  return data || []
}

export const getMyPods = async (userId) => {
  const { data, error } = await supabase
    .from('pod_members')
    .select(`
      *,
      pod:pod_id (
        *,
        members:pod_members(count)
      )
    `)
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching my pods:', error)
    return []
  }
  return data?.map(pm => ({ ...pm.pod, my_role: pm.role })) || []
}

export const getPodDetails = async (podId) => {
  const { data, error } = await supabase
    .from('pods')
    .select(`
      *,
      members:pod_members (
        *,
        profile:user_id (
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('id', podId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching pod:', error)
    return null
  }
  return data
}

export const createPod = async (userId, name, description, focus, isPrivate = false) => {
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

  const { data: pod, error: podError } = await supabase
    .from('pods')
    .insert({
      name,
      description,
      focus,
      is_private: isPrivate,
      invite_code: inviteCode,
      created_by: userId
    })
    .select()
    .single()

  if (podError) throw podError

  // Add creator as admin
  const { error: memberError } = await supabase
    .from('pod_members')
    .insert({
      pod_id: pod.id,
      user_id: userId,
      role: 'admin'
    })

  if (memberError) throw memberError

  return pod
}

export const joinPod = async (podId, userId) => {
  // Check member count
  const { data: pod } = await supabase
    .from('pods')
    .select('max_members, members:pod_members(count)')
    .eq('id', podId)
    .single()

  if (pod && pod.members[0]?.count >= pod.max_members) {
    throw new Error('Pod is full')
  }

  const { error } = await supabase
    .from('pod_members')
    .insert({ pod_id: podId, user_id: userId, role: 'member' })

  if (error) throw error
  return true
}

export const joinPodByCode = async (inviteCode, userId) => {
  const { data: pod } = await supabase
    .from('pods')
    .select('id, max_members, members:pod_members(count)')
    .eq('invite_code', inviteCode.toUpperCase())
    .single()

  if (!pod) {
    throw new Error('Invalid invite code')
  }

  if (pod.members[0]?.count >= pod.max_members) {
    throw new Error('Pod is full')
  }

  return joinPod(pod.id, userId)
}

export const leavePod = async (podId, userId) => {
  const { error } = await supabase
    .from('pod_members')
    .delete()
    .eq('pod_id', podId)
    .eq('user_id', userId)

  if (error) throw error
  return true
}

export const getPodMessages = async (podId, limit = 50) => {
  const { data, error } = await supabase
    .from('pod_messages')
    .select(`
      *,
      profile:user_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('pod_id', podId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }
  return (data || []).reverse()
}

export const sendPodMessage = async (podId, userId, content, type = 'message') => {
  const { data, error } = await supabase
    .from('pod_messages')
    .insert({ pod_id: podId, user_id: userId, content, type })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// LEADERBOARD
// ============================================

export const getLeaderboard = async (limit = 20) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, points, streak, community_visible')
    .eq('community_visible', true)
    .order('points', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }
  return data || []
}

// ============================================
// USER PROFILES
// ============================================

export const getPublicProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .eq('community_visible', true)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  return data
}