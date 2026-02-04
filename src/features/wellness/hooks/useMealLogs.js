import { useState, useEffect } from 'react';
import { wellnessService } from '../services/wellnessService';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Custom hook for managing meal logs
 */
export const useMealLogs = (options = {}) => {
  const { user } = useAuth();
  const [mealLogs, setMealLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch meal logs
  const fetchMealLogs = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await wellnessService.getMealLogs(user.id, options);
      setMealLogs(data || []);
    } catch (err) {
      console.error('Error fetching meal logs:', err);
      setError(err.message);
      setMealLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when options change
  useEffect(() => {
    fetchMealLogs();
  }, [user?.id, options?.startDate, options?.endDate, options?.limit]);

  // Get meal logs for a specific date
  const getMealLogsByDate = async (date) => {
    if (!user) return [];
    
    try {
      return await wellnessService.getMealLogsByDate(user.id, date);
    } catch (err) {
      console.error('Error fetching meal logs by date:', err);
      throw err;
    }
  };

  // Create a new meal log
  const createMealLog = async (mealData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newMealLog = await wellnessService.createMealLog(user.id, mealData);
      setMealLogs(prev => [newMealLog, ...prev]);
      return newMealLog;
    } catch (err) {
      console.error('Error creating meal log:', err);
      throw err;
    }
  };

  // Update a meal log
  const updateMealLog = async (mealLogId, updates) => {
    try {
      const updated = await wellnessService.updateMealLog(mealLogId, updates);
      setMealLogs(prev => prev.map(ml => ml.id === mealLogId ? updated : ml));
      return updated;
    } catch (err) {
      console.error('Error updating meal log:', err);
      throw err;
    }
  };

  // Delete a meal log
  const deleteMealLog = async (mealLogId) => {
    try {
      await wellnessService.deleteMealLog(mealLogId);
      setMealLogs(prev => prev.filter(ml => ml.id !== mealLogId));
    } catch (err) {
      console.error('Error deleting meal log:', err);
      throw err;
    }
  };

  return {
    mealLogs,
    loading,
    error,
    refresh: fetchMealLogs,
    getMealLogsByDate,
    createMealLog,
    updateMealLog,
    deleteMealLog,
  };
};
