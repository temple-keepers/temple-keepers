import { supabase } from '../lib/supabase'

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ghl-webhook`

/**
 * Send an event to GHL via the Supabase Edge Function.
 * Fires and forgets — never blocks the UI.
 */
async function sendEvent(event, data) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      console.warn('GHL: No session, skipping event:', event)
      return
    }

    const res = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ event, data }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.warn('GHL webhook error:', res.status, err)
    }
  } catch (err) {
    // Never let GHL errors break the app
    console.warn('GHL event failed (non-blocking):', event, err.message)
  }
}

/**
 * GHL Service — fire-and-forget event triggers
 * Each method sends a tagged event to GHL for workflow automation.
 */
export const ghlService = {
  /**
   * New user signed up
   */
  userSignup({ email, firstName, lastName }) {
    return sendEvent('user.signup', { email, firstName, lastName })
  },

  /**
   * User enrolled in a program
   */
  programEnrolled({ email, firstName, programTitle, programSlug, fastingType }) {
    return sendEvent('program.enrolled', {
      email, firstName, programTitle, programSlug, fastingType,
    })
  },

  /**
   * User completed a program day
   */
  dayCompleted({ email, firstName, programTitle, dayNumber, totalDays }) {
    return sendEvent('program.day_completed', {
      email, firstName, programTitle, dayNumber, totalDays,
    })
  },

  /**
   * User completed the full program
   */
  programCompleted({ email, firstName, programTitle }) {
    return sendEvent('program.completed', {
      email, firstName, programTitle,
    })
  },

  /**
   * User changed their fasting type mid-program
   */
  fastingTypeChanged({ email, firstName, oldFastingType, newFastingType }) {
    return sendEvent('fasting.type_changed', {
      email, firstName, oldFastingType, newFastingType,
    })
  },

  /**
   * Live session reminder
   */
  sessionReminder({ email, firstName, sessionNumber, sessionDate }) {
    return sendEvent('session.reminder', {
      email, firstName, sessionNumber, sessionDate,
    })
  },
}
