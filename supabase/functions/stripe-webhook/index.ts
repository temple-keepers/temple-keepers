import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('Received event:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        const planId = session.metadata?.plan_id
        const billingCycle = session.metadata?.billing_cycle

        if (userId && session.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          
          // Get plan name
          const planNames: Record<string, string> = {
            starter: 'Starter',
            growth: 'Growth',
            premium: 'Premium'
          }

          // Update subscription in database
          const { error } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              plan_id: planId || 'growth',
              plan_name: planNames[planId || 'growth'] || 'Growth',
              status: subscription.status,
              price_id: subscription.items.data[0]?.price.id,
              billing_cycle: billingCycle || 'monthly',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })

          if (error) {
            console.error('Error updating subscription:', error)
            throw error
          }

          console.log('Subscription created for user:', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id

        if (userId) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)

          if (error) {
            console.error('Error updating subscription:', error)
            throw error
          }

          console.log('Subscription updated:', subscription.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            plan_id: 'free',
            plan_name: 'Free',
            stripe_subscription_id: null,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error canceling subscription:', error)
          throw error
        }

        console.log('Subscription canceled:', subscription.id)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          // Get user from subscription
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', invoice.subscription)
            .single()

          if (subData?.user_id) {
            // Record payment
            await supabase.from('payments').insert({
              user_id: subData.user_id,
              stripe_invoice_id: invoice.id,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: 'paid',
              description: `Subscription payment - ${invoice.lines.data[0]?.description || 'Temple Keepers'}`
            })
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment failed for invoice:', invoice.id)
        // You could send an email notification here
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})