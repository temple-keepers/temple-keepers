import { useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { gamificationService } from '../services/gamificationService'

/**
 * Hook to award points and check badges after user actions.
 * Uses a debounce to batch badge checks (avoids hammering DB on rapid actions).
 * 
 * Usage:
 *   const { trackAction } = useGamification()
 *   trackAction('wellness_checkin', 'checkin', someId)
 */
export const useGamification = () => {
  const { user, profile } = useAuth()
  const badgeCheckTimer = useRef(null)

  const trackAction = useCallback(async (reason, sourceType, sourceId = null) => {
    if (!user) return
    if (profile?.role === 'admin') return

    // Award points
    const result = await gamificationService.awardPoints(user.id, reason, sourceType, sourceId)

    // Debounce badge check (wait 2s after last action)
    if (badgeCheckTimer.current) clearTimeout(badgeCheckTimer.current)
    badgeCheckTimer.current = setTimeout(() => {
      gamificationService.checkBadges(user.id)
    }, 2000)

    return result
  }, [user, profile])

  return { trackAction }
}
