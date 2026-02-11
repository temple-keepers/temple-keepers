import { supabase } from '../lib/supabase'
import { gamificationService } from './gamificationService'

export const referralService = {
  async getReferralCode(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Failed to get referral code:', error)
      return null
    }
    return data?.referral_code || null
  },

  getShareUrl(referralCode) {
    return `${window.location.origin}/signup?ref=${referralCode}`
  },

  async lookupReferrer(referralCode) {
    if (!referralCode) return null

    const { data, error } = await supabase
      .rpc('lookup_referrer', { p_referral_code: referralCode })

    if (error) {
      console.warn('Referral lookup failed:', error.message)
      return null
    }
    return data || null
  },

  async recordReferral(referrerId, referredId, referralCode) {
    try {
      if (!referrerId || !referredId || referrerId === referredId) return

      const { error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrerId,
          referred_id: referredId,
          referral_code: referralCode.toUpperCase(),
        })

      if (error) {
        console.warn('Referral record failed:', error.message)
        return
      }

      // Award points to the referrer
      const result = await gamificationService.awardPoints(
        referrerId,
        'referral_signup',
        'referral',
        referredId
      )

      if (result) {
        await supabase
          .from('referrals')
          .update({ points_awarded: true })
          .eq('referrer_id', referrerId)
          .eq('referred_id', referredId)
      }
    } catch (err) {
      console.warn('Referral processing failed (non-blocking):', err.message)
    }
  },

  async getReferralCount(userId) {
    const { count, error } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)

    if (error) return 0
    return count || 0
  },
}
