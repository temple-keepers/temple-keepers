import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // "HH:MM"
    const currentHour = now.getHours()

    console.log(`Running scheduled notifications at ${currentTime}`)

    // =============================================
    // 1. WATER REMINDERS
    // =============================================
    const { data: waterUsers } = await supabase
      .from('notification_preferences')
      .select('user_id, water_reminder_times, quiet_hours_enabled, quiet_hours_start, quiet_hours_end')
      .eq('water_reminders', true)
      .eq('push_enabled', true)

    if (waterUsers) {
      for (const user of waterUsers) {
        // Check quiet hours
        if (user.quiet_hours_enabled) {
          const start = parseInt(user.quiet_hours_start.split(':')[0])
          const end = parseInt(user.quiet_hours_end.split(':')[0])
          if (currentHour >= start || currentHour < end) continue
        }

        // Check if current time matches any reminder time
        const times = user.water_reminder_times || []
        const shouldSend = times.some((time: string) => {
          const [h, m] = time.split(':')
          return parseInt(h) === currentHour && Math.abs(parseInt(m) - now.getMinutes()) < 5
        })

        if (shouldSend) {
          await supabase.from('notifications').insert({
            user_id: user.user_id,
            type: 'water_reminder',
            title: '💧 Hydration Check',
            message: 'Time to drink a glass of water! Stay hydrated.',
            icon: 'droplets',
            action_url: '/water'
          })
        }
      }
    }

    // =============================================
    // 2. DEVOTIONAL REMINDERS
    // =============================================
    const { data: devotionalUsers } = await supabase
      .from('notification_preferences')
      .select('user_id, devotional_reminder_time, quiet_hours_enabled, quiet_hours_start, quiet_hours_end')
      .eq('devotional_reminder', true)
      .eq('push_enabled', true)

    if (devotionalUsers) {
      for (const user of devotionalUsers) {
        if (user.quiet_hours_enabled) {
          const start = parseInt(user.quiet_hours_start.split(':')[0])
          const end = parseInt(user.quiet_hours_end.split(':')[0])
          if (currentHour >= start || currentHour < end) continue
        }

        const [h, m] = (user.devotional_reminder_time || '07:00').split(':')
        if (parseInt(h) === currentHour && Math.abs(parseInt(m) - now.getMinutes()) < 5) {
          await supabase.from('notifications').insert({
            user_id: user.user_id,
            type: 'devotional_ready',
            title: '📖 Daily Devotional',
            message: 'Your daily devotional is waiting for you!',
            icon: 'book-open',
            action_url: '/devotionals'
          })
        }
      }
    }

    // =============================================
    // 3. CHALLENGE REMINDERS
    // =============================================
    const { data: challengeUsers } = await supabase
      .from('notification_preferences')
      .select('user_id, challenge_reminder_time')
      .eq('challenge_reminders', true)
      .eq('push_enabled', true)

    if (challengeUsers) {
      for (const user of challengeUsers) {
        const [h, m] = (user.challenge_reminder_time || '09:00').split(':')
        if (parseInt(h) === currentHour && Math.abs(parseInt(m) - now.getMinutes()) < 5) {
          // Check if user has active challenge
          const { data: activeChallenge } = await supabase
            .from('user_challenges')
            .select('id, current_day, challenge:challenge_id(title)')
            .eq('user_id', user.user_id)
            .eq('status', 'active')
            .single()

          if (activeChallenge) {
            await supabase.from('notifications').insert({
              user_id: user.user_id,
              type: 'challenge_reminder',
              title: `🎯 Day ${activeChallenge.current_day}`,
              message: `Complete today's tasks for "${activeChallenge.challenge?.title}"`,
              icon: 'trophy',
              action_url: '/challenges'
            })
          }
        }
      }
    }

    // =============================================
    // 4. STREAK AT RISK (Evening check - 8pm)
    // =============================================
    if (currentHour === 20) {
      const { data: streakUsers } = await supabase
        .from('notification_preferences')
        .select('user_id')
        .eq('streak_risk_alert', true)
        .eq('push_enabled', true)

      if (streakUsers) {
        for (const user of streakUsers) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('streak, last_activity_date')
            .eq('id', user.user_id)
            .single()

          if (profile && profile.streak >= 3) {
            const today = new Date().toISOString().split('T')[0]
            if (profile.last_activity_date !== today) {
              await supabase.from('notifications').insert({
                user_id: user.user_id,
                type: 'streak_risk',
                title: '⚠️ Streak at Risk!',
                message: `Your ${profile.streak}-day streak is at risk! Log activity before midnight.`,
                icon: 'flame',
                action_url: '/dashboard'
              })
            }
          }
        }
      }
    }

    // =============================================
    // 5. MEAL REMINDERS
    // =============================================
    const { data: mealUsers } = await supabase
      .from('notification_preferences')
      .select('user_id, meal_reminder_times')
      .eq('meal_reminders', true)
      .eq('push_enabled', true)

    if (mealUsers) {
      for (const user of mealUsers) {
        const times = user.meal_reminder_times || {}
        
        for (const [meal, time] of Object.entries(times)) {
          if (typeof time !== 'string') continue
          const [h, m] = time.split(':')
          if (parseInt(h) === currentHour && Math.abs(parseInt(m) - now.getMinutes()) < 5) {
            const mealLabel = meal.charAt(0).toUpperCase() + meal.slice(1)
            await supabase.from('notifications').insert({
              user_id: user.user_id,
              type: 'meal_reminder',
              title: `🍽️ ${mealLabel} Time`,
              message: `Time for ${meal}! Check your meal plan for healthy options.`,
              icon: 'utensils',
              action_url: '/meal-planner'
            })
          }
        }
      }
    }

    // =============================================
    // 6. TRIAL ENDING REMINDERS (Daily at 10am)
    // =============================================
    if (currentHour === 10) {
      const { data: trialUsers } = await supabase
        .from('subscriptions')
        .select('user_id, trial_end')
        .eq('status', 'trialing')

      if (trialUsers) {
        for (const user of trialUsers) {
          if (!user.trial_end) continue
          
          const trialEnd = new Date(user.trial_end)
          const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysLeft === 3 || daysLeft === 1) {
            await supabase.from('notifications').insert({
              user_id: user.user_id,
              type: 'subscription_trial_ending',
              title: '⏰ Trial Ending Soon',
              message: `Your free trial ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Subscribe to keep your progress!`,
              icon: 'clock',
              action_url: '/pricing'
            })
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, time: currentTime }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})