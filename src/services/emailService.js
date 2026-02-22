import { supabase } from '../lib/supabase'

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`

/**
 * Send an email via the Resend Edge Function.
 * Fires and forgets — never blocks the UI.
 * Sends apikey header for auth (JWT not required).
 */
async function sendEmailEvent(template, data, retryCount = 0) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    }

    // Try to include JWT if available (not required — anon key is sufficient)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
    } catch {
      // Session not ready yet — that's fine, apikey will authenticate
    }

    const res = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ template, data }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.warn('Email send error:', res.status, err)

      // Retry once after 2s for transient failures
      if (retryCount === 0 && (res.status >= 500 || res.status === 0)) {
        setTimeout(() => sendEmailEvent(template, data, 1), 2000)
      }
    }
  } catch (err) {
    // Never let email errors break the app
    console.warn('Email event failed (non-blocking):', template, err.message)

    // Retry once after 2s for network errors
    if (retryCount === 0) {
      setTimeout(() => sendEmailEvent(template, data, 1), 2000)
    }
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
