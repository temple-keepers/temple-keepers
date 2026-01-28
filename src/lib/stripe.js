import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

// Price IDs from environment
export const PRICE_IDS = {
  starter: {
    monthly: import.meta.env.VITE_STRIPE_STARTER_MONTHLY,
    yearly: import.meta.env.VITE_STRIPE_STARTER_YEARLY
  },
  growth: {
    monthly: import.meta.env.VITE_STRIPE_GROWTH_MONTHLY,
    yearly: import.meta.env.VITE_STRIPE_GROWTH_YEARLY
  },
  premium: {
    monthly: import.meta.env.VITE_STRIPE_PREMIUM_MONTHLY,
    yearly: import.meta.env.VITE_STRIPE_PREMIUM_YEARLY
  }
}

// Plan details
export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Basic access to get started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '3 AI recipes per month',
      'Daily devotionals',
      'Basic dashboard'
    ],
    limits: {
      recipesPerMonth: 3,
      waterTracker: false,
      mealPlanner: false,
      analytics: false,
      membersDirectory: false
    }
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for beginning your wellness journey',
    monthlyPrice: 7.99,
    yearlyPrice: 79.99,
    features: [
      '15 AI recipes per month',
      'Daily devotionals',
      'Water tracking',
      'Basic meal planner',
      'Progress dashboard'
    ],
    limits: {
      recipesPerMonth: 15,
      waterTracker: true,
      mealPlanner: true,
      analytics: false,
      membersDirectory: true
    }
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    description: 'Most popular for committed temple keepers',
    monthlyPrice: 14.99,
    yearlyPrice: 149.99,
    popular: true,
    features: [
      'Unlimited AI recipes',
      'Daily devotionals',
      'Water tracking',
      'Full meal planner',
      'Shopping list generator',
      'Progress analytics',
      'Recipe library',
      'Priority support'
    ],
    limits: {
      recipesPerMonth: -1, // Unlimited
      waterTracker: true,
      mealPlanner: true,
      analytics: true,
      membersDirectory: true
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'Complete transformation package',
    monthlyPrice: 29.99,
    yearlyPrice: 299.99,
    features: [
      'Everything in Growth',
      'Personalized coaching tips',
      'Weekly challenges',
      'Prayer journal',
      'Family sharing (up to 5)',
      'Exclusive content',
      '1-on-1 onboarding call',
      'Lifetime updates'
    ],
    limits: {
      recipesPerMonth: -1,
      waterTracker: true,
      mealPlanner: true,
      analytics: true,
      membersDirectory: true,
      familySharing: true,
      coaching: true
    }
  }
}

// Get plan from price ID
export const getPlanFromPriceId = (priceId) => {
  for (const [planId, prices] of Object.entries(PRICE_IDS)) {
    if (prices.monthly === priceId || prices.yearly === priceId) {
      return planId
    }
  }
  return 'free'
}