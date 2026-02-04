import { useState, useEffect } from 'react';
import { wellnessService } from '../services/wellnessService';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Custom hook for managing wellness check-ins
 */
export const useCheckIns = (options = {}) => {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch check-ins
  const fetchCheckIns = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching check-ins with options:', options);
      const data = await wellnessService.getCheckIns(user.id, options);
      console.log('Check-ins fetched:', data?.length || 0, 'records');
      setCheckIns(data || []);
    } catch (err) {
      console.error('Error fetching check-ins:', err);
      setError(err.message);
      setCheckIns([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when options change
  useEffect(() => {
    console.log('⚡ useCheckIns useEffect triggered!', {
      userId: user?.id,
      options,
      startDate: options?.startDate,
      endDate: options?.endDate,
      limit: options?.limit
    });
    fetchCheckIns();
  }, [user?.id, options?.startDate, options?.endDate, options?.limit]);

  // Get check-in for a specific date
  const getCheckInByDate = async (date) => {
    if (!user) return null;
    
    try {
      return await wellnessService.getCheckInByDate(user.id, date);
    } catch (err) {
      console.error('Error fetching check-in by date:', err);
      throw err;
    }
  };

  // Create a new check-in
  const createCheckIn = async (checkInData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newCheckIn = await wellnessService.createCheckIn(user.id, checkInData);
      setCheckIns(prev => [newCheckIn, ...prev]);
      return newCheckIn;
    } catch (err) {
      console.error('Error creating check-in:', err);
      throw err;
    }
  };

  // Update a check-in
  const updateCheckIn = async (checkInId, updates) => {
    try {
      const updated = await wellnessService.updateCheckIn(checkInId, updates);
      setCheckIns(prev => prev.map(ci => ci.id === checkInId ? updated : ci));
      return updated;
    } catch (err) {
      console.error('Error updating check-in:', err);
      throw err;
    }
  };

  // Delete a check-in
  const deleteCheckIn = async (checkInId) => {
    try {
      await wellnessService.deleteCheckIn(checkInId);
      setCheckIns(prev => prev.filter(ci => ci.id !== checkInId));
    } catch (err) {
      console.error('Error deleting check-in:', err);
      throw err;
    }
  };

  return {
    checkIns,
    loading,
    error,
    refresh: fetchCheckIns,
    getCheckInByDate,
    createCheckIn,
    updateCheckIn,
    deleteCheckIn,
  };
};
