import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priceId, userId, userEmail, planId, billingCycle } = await req.json()

    if (!priceId || !userId || !userEmail) {
      throw new Error('Missing required fields')
    }

    // Check if customer already exists
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    })

    let customerId = customers.data[0]?.id

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId
        }
      })
      customerId = customer.id
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/billing/canceled`,
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          supabase_user_id: userId,
          plan_id: planId,
          billing_cycle: billingCycle
        }
      },
      metadata: {
        supabase_user_id: userId,
        plan_id: planId,
        billing_cycle: billingCycle
      }
    })

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Checkout error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})