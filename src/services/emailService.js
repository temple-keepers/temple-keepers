import { supabase } from '../lib/supabase'

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`

/**
 * Send an email via the Resend Edge Function.
 * Fires and forgets — never blocks the UI.
 * Authenticated via user JWT.
 */
async function sendEmailEvent(template, data) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const headers = {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    }
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const res = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ template, data }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.warn('Email send error:', res.status, err)
    }
  } catch (err) {
    // Never let email errors break the app
    console.warn('Email event failed (non-blocking):', template, err.message)
  }
}

/**
 * Email Service — fire-and-forget email triggers
 */
export const emailService = {
  /**
   * Welcome email on signup
   */
  welcome({ email, firstName, userId }) {
    return sendEmailEvent('welcome', { email, firstName, userId })
  },

  /**
   * Programme completion congratulations
   */
  programComplete({ email, firstName, userId, programTitle, totalDays }) {
    return sendEmailEvent('program_complete', { email, firstName, userId, programTitle, totalDays })
  },
}
