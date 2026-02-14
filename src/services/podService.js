import { supabase } from '../lib/supabase'

export const podService = {

  // ─── PODS ──────────────────────────────────────────────

  async getPods() {
    const { data, error } = await supabase
      .from('pods')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      // Get member counts
      for (const pod of data) {
        const { count } = await supabase
          .from('pod_members')
          .select('*', { count: 'exact', head: true })
          .eq('pod_id', pod.id)
        pod.member_count = count || 0
      }
    }

    return { data, error }
  },

  async getMyPods(userId) {
    const { data: memberships, error } = await supabase
      .from('pod_members')
      .select('pod_id, role')
      .eq('user_id', userId)

    if (error || !memberships?.length) return { data: [], error }

    const podIds = memberships.map(m => m.pod_id)
    const { data: pods } = await supabase
      .from('pods')
      .select('*')
      .in('id', podIds)
      .order('created_at', { ascending: false })

    // Merge role and member counts
    const roleMap = {}
    for (const m of memberships) roleMap[m.pod_id] = m.role

    if (pods) {
      for (const pod of pods) {
        pod.myRole = roleMap[pod.id]
        const { count } = await supabase
          .from('pod_members')
          .select('*', { count: 'exact', head: true })
          .eq('pod_id', pod.id)
        pod.member_count = count || 0
      }
    }

    return { data: pods || [], error: null }
  },

  async getPod(podId) {
    const { data: pod, error } = await supabase
      .from('pods')
      .select('*')
      .eq('id', podId)
      .single()

    if (error || !pod) return { data: null, error }

    // Get members with profile info
    const { data: members } = await supabase
      .from('pod_members')
      .select('id, user_id, role, joined_at')
      .eq('pod_id', podId)
      .order('joined_at')

    // Get profile info for members
    if (members?.length) {
      const userIds = members.map(m => m.user_id)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, avatar_url')
        .in('id', userIds)

      const profileMap = {}
      for (const p of (profiles || [])) profileMap[p.id] = p

      for (const m of members) {
        m.profile = profileMap[m.user_id] || { first_name: 'Member' }
      }
    }

    pod.pod_members = members || []
    return { data: pod, error: null }
  },

  async createPod(userId, { name, description, isPrivate, maxMembers }) {
    const { data: pod, error: podError } = await supabase
      .from('pods')
      .insert({
        name,
        description,
        created_by: userId,
        is_private: isPrivate || false,
        max_members: maxMembers || 8,
      })
      .select()
      .single()

    if (podError) return { error: podError }

    // Auto-join creator as leader
    await supabase
      .from('pod_members')
      .insert({ pod_id: pod.id, user_id: userId, role: 'leader' })

    return { data: pod, error: null }
  },

  async deletePod(podId) {
    await supabase.from('pod_posts').delete().eq('pod_id', podId)
    await supabase.from('pod_challenges').delete().eq('pod_id', podId)
    await supabase.from('pod_members').delete().eq('pod_id', podId)
    const { error } = await supabase.from('pods').delete().eq('id', podId)
    return { error }
  },

  // ─── MEMBERSHIP ────────────────────────────────────────

  async joinPod(podId, userId) {
    const { data, error } = await supabase
      .from('pod_members')
      .insert({ pod_id: podId, user_id: userId, role: 'member' })
      .select()
      .single()
    return { data, error }
  },

  async leavePod(podId, userId) {
    const { error } = await supabase
      .from('pod_members')
      .delete()
      .eq('pod_id', podId)
      .eq('user_id', userId)
    return { error }
  },

  async isMember(podId, userId) {
    const { data } = await supabase
      .from('pod_members')
      .select('id, role')
      .eq('pod_id', podId)
      .eq('user_id', userId)
      .maybeSingle()
    return { isMember: !!data, role: data?.role }
  },

  // ─── POSTS ─────────────────────────────────────────────

  async getPosts(podId, postType = null) {
    let query = supabase
      .from('pod_posts')
      .select('*')
      .eq('pod_id', podId)
      .is('parent_id', null)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (postType) query = query.eq('post_type', postType)

    const { data: posts, error } = await query
    if (error || !posts?.length) return { data: posts || [], error }

    // Get author profiles
    const userIds = [...new Set(posts.map(p => p.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, avatar_url')
      .in('id', userIds)
    const profileMap = {}
    for (const p of (profiles || [])) profileMap[p.id] = p

    // Get replies
    const postIds = posts.map(p => p.id)
    const { data: replies } = await supabase
      .from('pod_posts')
      .select('*')
      .in('parent_id', postIds)
      .order('created_at', { ascending: true })

    // Get reply author profiles
    const replyUserIds = [...new Set((replies || []).map(r => r.user_id))]
    const newUserIds = replyUserIds.filter(id => !profileMap[id])
    if (newUserIds.length) {
      const { data: replyProfiles } = await supabase
        .from('profiles')
        .select('id, first_name, avatar_url')
        .in('id', newUserIds)
      for (const p of (replyProfiles || [])) profileMap[p.id] = p
    }

    // Get prayer reactions
    const { data: reactions } = await supabase
      .from('prayer_reactions')
      .select('id, post_id, user_id, reaction_type')
      .in('post_id', postIds)

    // Assemble
    const repliesByParent = {}
    for (const r of (replies || [])) {
      r.profile = profileMap[r.user_id] || { first_name: 'Member' }
      if (!repliesByParent[r.parent_id]) repliesByParent[r.parent_id] = []
      repliesByParent[r.parent_id].push(r)
    }

    const reactionsByPost = {}
    for (const r of (reactions || [])) {
      if (!reactionsByPost[r.post_id]) reactionsByPost[r.post_id] = []
      reactionsByPost[r.post_id].push(r)
    }

    for (const post of posts) {
      post.profile = profileMap[post.user_id] || { first_name: 'Member' }
      post.replies = repliesByParent[post.id] || []
      post.prayer_reactions = reactionsByPost[post.id] || []
    }

    return { data: posts, error: null }
  },

  async createPost(podId, userId, { content, postType, isAnonymous }) {
    const { data, error } = await supabase
      .from('pod_posts')
      .insert({
        pod_id: podId,
        user_id: userId,
        content,
        post_type: postType || 'discussion',
        is_anonymous: isAnonymous || false,
      })
      .select()
      .single()
    return { data, error }
  },

  async createReply(podId, parentId, userId, content) {
    const { data, error } = await supabase
      .from('pod_posts')
      .insert({
        pod_id: podId,
        user_id: userId,
        parent_id: parentId,
        content,
        post_type: 'discussion',
      })
      .select()
      .single()
    return { data, error }
  },

  async deletePost(postId) {
    const { error } = await supabase.from('pod_posts').delete().eq('id', postId)
    return { error }
  },

  // ─── PRAYER REACTIONS ──────────────────────────────────

  async addReaction(postId, userId, reactionType = 'praying') {
    const { data, error } = await supabase
      .from('prayer_reactions')
      .insert({ post_id: postId, user_id: userId, reaction_type: reactionType })
      .select()
      .single()
    return { data, error }
  },

  async removeReaction(postId, userId, reactionType = 'praying') {
    const { error } = await supabase
      .from('prayer_reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('reaction_type', reactionType)
    return { error }
  },

  // ─── CHALLENGES ────────────────────────────────────────

  async getChallenges(podId) {
    const { data, error } = await supabase
      .from('pod_challenges')
      .select('*, programs(id, title, slug, duration_days)')
      .eq('pod_id', podId)
      .order('created_at', { ascending: false })

    if (data) {
      const userIds = [...new Set(data.map(c => c.assigned_by))]
      if (userIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name')
          .in('id', userIds)
        const map = {}
        for (const p of (profiles || [])) map[p.id] = p
        for (const c of data) c.assigned_by_profile = map[c.assigned_by] || null
      }
    }

    return { data, error }
  },

  async createChallenge(podId, userId, { programId, startDate }) {
    const { data: program } = await supabase
      .from('programs')
      .select('duration_days')
      .eq('id', programId)
      .single()

    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + (program?.duration_days || 14) - 1)

    const { data, error } = await supabase
      .from('pod_challenges')
      .insert({
        pod_id: podId,
        program_id: programId,
        start_date: startDate,
        end_date: endDate.toISOString().split('T')[0],
        assigned_by: userId,
        status: new Date(startDate) > new Date() ? 'upcoming' : 'active',
      })
      .select()
      .single()
    return { data, error }
  },

  async deleteChallenge(challengeId) {
    const { error } = await supabase.from('pod_challenges').delete().eq('id', challengeId)
    return { error }
  },
}
