import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext-minimal'
import { useTheme } from '../contexts/ThemeContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useToast } from '../contexts/ToastContext'
import { stripePromise, PLANS, PRICE_IDS } from '../lib/stripe'
import { supabase } from '../lib/supabase'
import { 
  Check, 
  Sparkles, 
  ArrowLeft,
  Loader2,
  Crown,
  Zap,
  Shield
} from 'lucide-react'

const Pricing = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { subscription, getCurrentPlan } = useSubscription()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [loading, setLoading] = useState(null)

  const currentPlan = getCurrentPlan()
  const planOrder = ['starter', 'growth', 'premium']

  const handleSubscribe = async (planId) => {
    if (!user) {
      navigate('/signup')
      return
    }

    if (planId === 'free' || planId === subscription?.plan_id) {
      return
    }

    setLoading(planId)

    try {
      const priceId = PRICE_IDS[planId]?.[billingCycle]
      
      if (!priceId) {
        console.error('Missing priceId for:', planId, billingCycle, 'PRICE_IDS:', PRICE_IDS)
        toast.error('Payment system is being configured. Please contact support.')
        setLoading(null)
        return
      }

      // Validate that it's actually a Stripe Price ID (should start with price_)
      if (!priceId.startsWith('price_')) {
        console.error('Invalid priceId format:', priceId, '- should start with price_')
        toast.error('Payment configuration error. Please contact support.')
        setLoading(null)
        return
      }

      // Call edge function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId,
          userId: user.id,
          userEmail: user.email,
          planId,
          billingCycle
        }
      })

      if (error) {
        console.error('Edge function error:', error)
        toast.error('Payment service is temporarily unavailable. Please try again later.')
        setLoading(null)
        return
      }

      if (!data?.sessionId) {
        toast.error('Unable to create checkout session. Please try again.')
        setLoading(null)
        return
      }

      // Redirect to Stripe
      const stripe = await stripePromise
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      })

      if (stripeError) throw stripeError

    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className={`min-h-screen py-12 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 mb-8 ${
            isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-display font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Choose Your Plan
          </h1>
          <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Start your 7-day free trial. Cancel anytime.
          </p>

          {/* Current Plan Badge */}
          {subscription && subscription.plan_id !== 'free' && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
              isDark ? 'bg-temple-purple/20 text-temple-purple' : 'bg-temple-purple/10 text-temple-purple'
            }`}>
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Current: {currentPlan.name}</span>
            </div>
          )}

          {/* Billing Toggle */}
          <div className={`inline-flex items-center gap-4 p-1.5 rounded-xl ${
            isDark ? 'bg-gray-800' : 'bg-gray-200'
          }`}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-500'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-500'
              }`}
            >
              Yearly
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-xs">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {planOrder.map((planId) => {
            const plan = PLANS[planId]
            const isCurrentPlan = subscription?.plan_id === planId
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice

            return (
              <div 
                key={planId}
                className={`relative rounded-2xl ${
                  plan.popular ? 'bg-gradient-to-br from-temple-purple to-temple-gold p-[2px]' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-temple-purple to-temple-gold text-white text-sm font-medium flex items-center gap-1 z-10">
                    <Zap className="w-4 h-4" />
                    Most Popular
                  </div>
                )}

                <div className={`h-full rounded-2xl p-6 ${
                  plan.popular
                    ? isDark ? 'bg-gray-800' : 'bg-white'
                    : isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      £{price}
                    </span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 flex-shrink-0 ${
                          plan.popular ? 'text-temple-gold' : 'text-green-500'
                        }`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(planId)}
                    disabled={loading === planId || isCurrentPlan}
                    className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      isCurrentPlan
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : plan.popular
                          ? 'bg-gradient-to-r from-temple-purple to-temple-gold text-white hover:opacity-90'
                          : isDark 
                            ? 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {loading === planId ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Start Free Trial
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust Badges */}
        <div className={`mt-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <span className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              Secure Payments
            </span>
            <span className="text-sm">✨ 7-day free trial</span>
            <span className="text-sm">❌ Cancel anytime</span>
            <span className="text-sm">🔒 GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing