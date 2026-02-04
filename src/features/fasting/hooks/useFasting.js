import { useState, useEffect } from 'react'
import { fastingService } from '../services/fastingService'

// Hook to get cohort data
export const useCohort = (cohortId) => {
  const [cohort, setCohort] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!cohortId) {
      setLoading(false)
      return
    }

    const fetchCohort = async () => {
      try {
        setLoading(true)
        const data = await fastingService.getCohortById(cohortId)
        setCohort(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching cohort:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCohort()
  }, [cohortId])

  return { cohort, loading, error }
}

// Hook to get next live session
export const useNextSession = (cohortId) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!cohortId) {
      setLoading(false)
      return
    }

    const fetchNextSession = async () => {
      try {
        setLoading(true)
        const data = await fastingService.getNextSession(cohortId)
        setSession(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching next session:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchNextSession()
  }, [cohortId])

  return { session, loading, error }
}

// Hook to get all sessions for a cohort
export const useSessions = (cohortId) => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!cohortId) {
      setLoading(false)
      return
    }

    const fetchSessions = async () => {
      try {
        setLoading(true)
        const data = await fastingService.getSessionsForCohort(cohortId)
        setSessions(data || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching sessions:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [cohortId])

  return { sessions, loading, error }
}

// Hook to get active cohorts for a program
export const useActiveCohorts = (programId) => {
  const [cohorts, setCohorts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!programId) {
      setLoading(false)
      return
    }

    const fetchCohorts = async () => {
      try {
        setLoading(true)
        const data = await fastingService.getActiveCohorts(programId)
        setCohorts(data || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching cohorts:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCohorts()
  }, [programId])

  return { cohorts, loading, error }
}
