import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const usePrograms = () => {
  const { user } = useAuth()
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(false)

  // Get all programs
  const getPrograms = async ({ published = null } = {}) => {
    setLoading(true)
    
    let query = supabase
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false })

    if (published !== null) {
      query = query.eq('is_published', published)
    }

    const { data, error } = await query
    
    if (!error && data) {
      setPrograms(data)
    }
    
    setLoading(false)
    return { data, error }
  }

  // Get single program
  const getProgram = async (id) => {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  }

  // Create program
  const createProgram = async (programData) => {
    const { data, error } = await supabase
      .from('programs')
      .insert({
        ...programData,
        created_by: user.id
      })
      .select()
      .single()

    if (!error && data) {
      setPrograms([data, ...programs])
    }

    return { data, error }
  }

  // Update program
  const updateProgram = async (id, updates) => {
    const { data, error } = await supabase
      .from('programs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setPrograms(programs.map(p => p.id === id ? data : p))
    }

    return { data, error }
  }

  // Delete program
  const deleteProgram = async (id) => {
    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('id', id)

    if (!error) {
      setPrograms(programs.filter(p => p.id !== id))
    }

    return { error }
  }

  // Toggle publish status
  const togglePublish = async (id, currentStatus) => {
    return updateProgram(id, { is_published: !currentStatus })
  }

  return {
    programs,
    loading,
    getPrograms,
    getProgram,
    createProgram,
    updateProgram,
    deleteProgram,
    togglePublish
  }
}
