import { useState, useEffect } from 'react';
import { wellnessService } from '../services/wellnessService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for managing symptom logs
 */
export const useSymptoms = (options = {}) => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch symptom logs
  const fetchSymptoms = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await wellnessService.getSymptomLogs(user.id, options);
      setSymptoms(data || []);
    } catch (err) {
      console.error('Error fetching symptom logs:', err);
      setError(err.message);
      setSymptoms([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when options change
  useEffect(() => {
    fetchSymptoms();
  }, [user?.id, options?.startDate, options?.endDate, options?.limit]);

  // Create a new symptom log
  const createSymptom = async (symptomData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newSymptom = await wellnessService.createSymptomLog(user.id, symptomData);
      setSymptoms(prev => [newSymptom, ...prev]);
      return newSymptom;
    } catch (err) {
      console.error('Error creating symptom log:', err);
      throw err;
    }
  };

  // Update a symptom log
  const updateSymptom = async (symptomId, updates) => {
    try {
      const updated = await wellnessService.updateSymptomLog(symptomId, updates);
      setSymptoms(prev => prev.map(s => s.id === symptomId ? updated : s));
      return updated;
    } catch (err) {
      console.error('Error updating symptom log:', err);
      throw err;
    }
  };

  // Delete a symptom log
  const deleteSymptom = async (symptomId) => {
    try {
      await wellnessService.deleteSymptomLog(symptomId);
      setSymptoms(prev => prev.filter(s => s.id !== symptomId));
    } catch (err) {
      console.error('Error deleting symptom log:', err);
      throw err;
    }
  };

  return {
    symptoms,
    loading,
    error,
    refresh: fetchSymptoms,
    createSymptom,
    updateSymptom,
    deleteSymptom,
  };
};
