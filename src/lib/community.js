import { supabase } from './supabase'

// ============================================
// COMMUNITY FEED
// ============================================

export const getFeedPosts = async (limit = 20, offset = 0) => {
  const { data: posts, error } = await supabase
    .from('community_posts')
    .select('*')
    .eq('is_hidden', false)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }
  
  if (!posts || posts.length === 0) return []
  
  // Fetch profiles for all user_ids
  const userIds = [...new Set(posts.map(p => p.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, community_visible')
    .in('id', userIds)
  
  // Attach profiles to posts
  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
  return posts.map(post => ({
    ...post,
    profile: profileMap.get(post.user_id)
  }))
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
  const { data: comments, error } = await supabase
    .from('post_comments')
    .select('*')
    .eq('post_id', postId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }
  
  if (!comments || comments.length === 0) return []
  
  // Fetch profiles
  const userIds = [...new Set(comments.map(c => c.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds)
  
  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
  return comments.map(comment => ({
    ...comment,
    profile: profileMap.get(comment.user_id)
  }))
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
    .select('*')
    .eq('is_private', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category) {
    query = query.eq('category', category)
  }

  const { data: prayers, error } = await query

  if (error) {
    console.error('Error fetching prayers:', error)
    return []
  }
  
  if (!prayers || prayers.length === 0) return []
  
  // Fetch profiles
  const userIds = [...new Set(prayers.map(p => p.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, community_visible')
    .in('id', userIds)
  
  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
  return prayers.map(prayer => ({
    ...prayer,
    profile: profileMap.get(prayer.user_id)
  }))
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
  const { data: pods, error } = await supabase
    .from('pods')
    .select('*')
    .eq('is_private', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pods:', error)
    return []
  }
  
  if (!pods || pods.length === 0) return []
  
  // Fetch member counts
  const podIds = pods.map(p => p.id)
  const { data: memberCounts } = await supabase
    .from('pod_members')
    .select('pod_id')
    .in('pod_id', podIds)
  
  // Fetch creator profiles
  const creatorIds = [...new Set(pods.map(p => p.created_by))]
  const { data: creators } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', creatorIds)
  
  const creatorMap = new Map(creators?.map(c => [c.id, c]) || [])
  const countMap = new Map()
  memberCounts?.forEach(m => {
    countMap.set(m.pod_id, (countMap.get(m.pod_id) || 0) + 1)
  })
  
  return pods.map(pod => ({
    ...pod,
    members: [{ count: countMap.get(pod.id) || 0 }],
    creator: creatorMap.get(pod.created_by)
  }))
}

export const getMyPods = async (userId) => {
  const { data: memberships, error } = await supabase
    .from('pod_members')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching my pods:', error)
    return []
  }
  
  if (!memberships || memberships.length === 0) return []
  
  // Fetch pod details
  const podIds = memberships.map(m => m.pod_id)
  const { data: pods } = await supabase
    .from('pods')
    .select('*')
    .in('id', podIds)
  
  // Fetch member counts
  const { data: memberCounts } = await supabase
    .from('pod_members')
    .select('pod_id')
    .in('pod_id', podIds)
  
  const countMap = new Map()
  memberCounts?.forEach(m => {
    countMap.set(m.pod_id, (countMap.get(m.pod_id) || 0) + 1)
  })
  
  const podMap = new Map(pods?.map(p => [p.id, p]) || [])
  return memberships.map(pm => ({
    ...podMap.get(pm.pod_id),
    my_role: pm.role,
    members: [{ count: countMap.get(pm.pod_id) || 0 }]
  }))
}

export const getPodDetails = async (podId) => {
  const { data: pod, error } = await supabase
    .from('pods')
    .select('*')
    .eq('id', podId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching pod:', error)
    return null
  }
  
  if (!pod) return null
  
  // Fetch members
  const { data: members } = await supabase
    .from('pod_members')
    .select('*')
    .eq('pod_id', podId)
  
  if (!members || members.length === 0) {
    return { ...pod, members: [] }
  }
  
  // Fetch profiles
  const userIds = members.map(m => m.user_id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds)
  
  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
  const membersWithProfiles = members.map(m => ({
    ...m,
    profile: profileMap.get(m.user_id)
  }))
  
  return {
    ...pod,
    members: membersWithProfiles
  }
}

export const createPod = async (userId, name, description, focus, isPrivate = false) => {
  console.log('🔵 Creating pod:', { userId, name, description, focus, isPrivate })
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

  const podData = {
    name,
    description,
    focus,
    is_private: isPrivate,
    invite_code: inviteCode,
    created_by: userId
  }
  
  console.log('📤 Inserting pod:', podData)
  
  const { data: pod, error: podError } = await supabase
    .from('pods')
    .insert(podData)
    .select()
    .single()

  if (podError) {
    console.error('❌ Pod creation error:', podError)
    throw podError
  }
  
  console.log('✅ Pod created:', pod)

  // Add creator as admin
  console.log('📤 Adding creator as admin')
  const { error: memberError } = await supabase
    .from('pod_members')
    .insert({
      pod_id: pod.id,
      user_id: userId,
      role: 'admin'
    })

  if (memberError) {
    console.error('❌ Member creation error:', memberError)
    throw memberError
  }
  
  console.log('✅ Pod and membership created successfully')
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