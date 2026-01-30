import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext-minimal'
import { supabase } from '../lib/supabase'
import { PLANS } from '../lib/stripe'

const SubscriptionContext = createContext({})

export const useSubscription = () => useContext(SubscriptionContext)

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSubscription()
      checkAdminStatus()
      
      // Realtime subscription updates
      const channel = supabase
        .channel('subscription_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Subscription updated:', payload)
            setSubscription(payload.new)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } else {
      setSubscription(null)
      setIsAdmin(false)
      setLoading(false)
    }
  }, [user])

  const checkAdminStatus = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const role = authUser.app_metadata?.role || authUser.user_metadata?.role
        setIsAdmin(role === 'admin' || role === 'super_admin')
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      // Handle case where table doesn't exist or error
      if (error) {
        console.log('No subscription found, defaulting to free plan')
      }

      setSubscription(data || { plan_id: 'free', plan_name: 'Free', status: 'active' })
    } catch (error) {
      console.error('Error:', error)
      // Default to free plan on any error
      setSubscription({ plan_id: 'free', plan_name: 'Free', status: 'active' })
    } finally {
      setLoading(false)
    }
  }

  // Check feature access - Admins have access to everything
  const hasAccess = (feature) => {
    // Admins have full access to all features
    if (isAdmin) return true
    
    if (!subscription) return false
    const plan = PLANS[subscription.plan_id] || PLANS.free
    
    switch (feature) {
      case 'water_tracker':
        return plan.limits.waterTracker
      case 'meal_planner':
        return plan.limits.mealPlanner
      case 'members_directory':
        return plan.limits.membersDirectory
      case 'analytics':
        return plan.limits.analytics
      case 'unlimited_recipes':
        return plan.limits.recipesPerMonth === -1
      case 'family_sharing':
        return plan.limits.familySharing
      case 'coaching':
        return plan.limits.coaching
      default:
        return true
    }
  }

  // Get recipe limit - Admins get unlimited
  const getRecipeLimit = () => {
    if (isAdmin) return -1 // Unlimited for admins
    if (!subscription) return 3
    const plan = PLANS[subscription.plan_id] || PLANS.free
    return plan.limits.recipesPerMonth
  }

  // Is active subscription
  const isActive = () => {
    if (isAdmin) return true // Always active for admins
    if (!subscription) return false
    return ['active', 'trialing'].includes(subscription.status)
  }

  // Is paid plan - Admins are treated as premium
  const isPaid = () => {
    if (isAdmin) return true
    if (!subscription) return false
    return subscription.plan_id !== 'free' && isActive()
  }

  // Get current plan details - Admins get premium
  const getCurrentPlan = () => {
    if (isAdmin) return PLANS.premium
    if (!subscription) return PLANS.free
    return PLANS[subscription.plan_id] || PLANS.free
  }

  // Is canceling at period end
  const isCanceling = () => {
    return subscription?.cancel_at_period_end === true
  }

  const value = {
    subscription,
    loading,
    isAdmin,
    hasAccess,
    getRecipeLimit,
    isActive,
    isPaid,
    getCurrentPlan,
    isCanceling,
    refreshSubscription: fetchSubscription
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}