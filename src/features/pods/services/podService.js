import { supabase } from '../../../lib/supabase'

export const podService = {

  // ─── PODS (CRUD) ───────────────────────────────────────

  async getPods() {
    const { data, error } = await supabase
      .from('pods')
      .select(`
        *,
        pod_members(count),
        created_by_profile:profiles!pods_created_by_fkey(first_name, avatar_url)
      `)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async getMyPods(userId) {
    const { data: memberships, error } = await supabase
      .from('pod_members')
      .select(`
        pod_id,
        role,
        pods (
          *,
          pod_members(count),
          created_by_profile:profiles!pods_created_by_fkey(first_name, avatar_url)
        )
      `)
      .eq('user_id', userId)

    return {
      data: memberships?.map(m => ({ ...m.pods, myRole: m.role })) || [],
      error
    }
  },

  async getPod(podId) {
    const { data, error } = await supabase
      .from('pods')
      .select(`
        *,
        created_by_profile:profiles!pods_created_by_fkey(first_name, avatar_url),
        pod_members(
          id, user_id, role, joined_at,
          profiles(first_name, avatar_url)
        )
      `)
      .eq('id', podId)
      .single()

    return { data, error }
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
    const { error: joinError } = await supabase
      .from('pod_members')
      .insert({
        pod_id: pod.id,
        user_id: userId,
        role: 'leader',
      })

    return { data: pod, error: joinError }
  },

  async updatePod(podId, updates) {
    const { data, error } = await supabase
      .from('pods')
      .update(updates)
      .eq('id', podId)
      .select()
      .single()

    return { data, error }
  },

  async deletePod(podId) {
    // Delete dependents first
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

  // ─── POSTS & DISCUSSION ───────────────────────────────

  async getPosts(podId, postType = null) {
    let query = supabase
      .from('pod_posts')
      .select(`
        *,
        profiles:profiles!pod_posts_user_id_fkey(first_name, avatar_url),
        replies:pod_posts(
          id, content, user_id, created_at, is_anonymous,
          profiles:profiles!pod_posts_user_id_fkey(first_name, avatar_url)
        ),
        prayer_reactions(id, user_id, reaction_type)
      `)
      .eq('pod_id', podId)
      .is('parent_id', null) // top-level posts only
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (postType) {
      query = query.eq('post_type', postType)
    }

    const { data, error } = await query
    return { data, error }
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
      .select(`
        *,
        profiles:profiles!pod_posts_user_id_fkey(first_name, avatar_url)
      `)
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
      .select(`
        *,
        profiles:profiles!pod_posts_user_id_fkey(first_name, avatar_url)
      `)
      .single()

    return { data, error }
  },

  async deletePost(postId) {
    const { error } = await supabase.from('pod_posts').delete().eq('id', postId)
    return { error }
  },

  async togglePin(postId, isPinned) {
    const { error } = await supabase
      .from('pod_posts')
      .update({ is_pinned: !isPinned })
      .eq('id', postId)

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
      .select(`
        *,
        programs(id, title, slug, duration_days, program_type),
        assigned_by_profile:profiles!pod_challenges_assigned_by_fkey(first_name)
      `)
      .eq('pod_id', podId)
      .order('created_at', { ascending: false })

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
      .select(`
        *,
        programs(id, title, slug, duration_days)
      `)
      .single()

    return { data, error }
  },

  async deleteChallenge(challengeId) {
    const { error } = await supabase
      .from('pod_challenges')
      .delete()
      .eq('id', challengeId)

    return { error }
  },
}
