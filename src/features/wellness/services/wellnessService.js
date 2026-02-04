import { supabase } from '../../../core/api/supabase';

/**
 * Wellness Service
 * Handles all business logic for wellness tracking:
 * - Check-ins
 * - Meal logs
 * - Symptom logs
 */

// ============================================
// CHECK-INS
// ============================================

export const wellnessService = {
  /**
   * Get check-ins for a user within a date range
   */
  async getCheckIns(userId, options = {}) {
    const { startDate, endDate, limit = 30 } = options;
    
    let query = supabase
      .from('wellness_check_ins')
      .select('*')
      .eq('user_id', userId)
      .order('check_in_date', { ascending: false })
      .limit(limit);
    
    if (startDate) {
      query = query.gte('check_in_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('check_in_date', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  /**
   * Get a specific check-in by date
   */
  async getCheckInByDate(userId, date) {
    const { data, error } = await supabase
      .from('wellness_check_ins')
      .select('*')
      .eq('user_id', userId)
      .eq('check_in_date', date)
      .order('version', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Create a new check-in
   */
  async createCheckIn(userId, checkInData) {
    const { data, error } = await supabase
      .from('wellness_check_ins')
      .insert({
        user_id: userId,
        ...checkInData,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update an existing check-in
   */
  async updateCheckIn(checkInId, updates) {
    const { data, error } = await supabase
      .from('wellness_check_ins')
      .update(updates)
      .eq('id', checkInId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete a check-in
   */
  async deleteCheckIn(checkInId) {
    const { error } = await supabase
      .from('wellness_check_ins')
      .delete()
      .eq('id', checkInId);
    
    if (error) throw error;
  },

  // ============================================
  // MEAL LOGS
  // ============================================

  /**
   * Get meal logs for a user within a date range
   */
  async getMealLogs(userId, options = {}) {
    const { startDate, endDate, mealType, limit = 50 } = options;
    
    let query = supabase
      .from('meal_logs')
      .select('*, recipes(title, meal_type)')
      .eq('user_id', userId)
      .order('meal_date', { ascending: false })
      .order('meal_time', { ascending: false })
      .limit(limit);
    
    if (startDate) {
      query = query.gte('meal_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('meal_date', endDate);
    }
    
    if (mealType) {
      query = query.eq('meal_type', mealType);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  /**
   * Get meal logs for a specific date
   */
  async getMealLogsByDate(userId, date) {
    const { data, error } = await supabase
      .from('meal_logs')
      .select('*, recipes(title, meal_type)')
      .eq('user_id', userId)
      .eq('meal_date', date)
      .order('meal_time', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  /**
   * Create a new meal log
   */
  async createMealLog(userId, mealData) {
    const { data, error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: userId,
        ...mealData,
      })
      .select('*, recipes(title, meal_type)')
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update a meal log
   */
  async updateMealLog(mealLogId, updates) {
    const { data, error } = await supabase
      .from('meal_logs')
      .update(updates)
      .eq('id', mealLogId)
      .select('*, recipes(title, meal_type)')
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete a meal log
   */
  async deleteMealLog(mealLogId) {
    const { error } = await supabase
      .from('meal_logs')
      .delete()
      .eq('id', mealLogId);
    
    if (error) throw error;
  },

  // ============================================
  // SYMPTOM LOGS
  // ============================================

  /**
   * Get symptom logs for a user
   */
  async getSymptomLogs(userId, options = {}) {
    const { startDate, endDate, symptomType, limit = 50 } = options;
    
    let query = supabase
      .from('symptom_logs')
      .select('*, meal_logs(description, meal_type, meal_date)')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .limit(limit);
    
    if (startDate) {
      query = query.gte('logged_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('logged_at', endDate);
    }
    
    if (symptomType) {
      query = query.eq('symptom_type', symptomType);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  /**
   * Create a new symptom log
   */
  async createSymptomLog(userId, symptomData) {
    const { data, error } = await supabase
      .from('symptom_logs')
      .insert({
        user_id: userId,
        ...symptomData,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update a symptom log
   */
  async updateSymptomLog(symptomLogId, updates) {
    const { data, error } = await supabase
      .from('symptom_logs')
      .update(updates)
      .eq('id', symptomLogId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete a symptom log
   */
  async deleteSymptomLog(symptomLogId) {
    const { error } = await supabase
      .from('symptom_logs')
      .delete()
      .eq('id', symptomLogId);
    
    if (error) throw error;
  },

  // ============================================
  // ANALYTICS & INSIGHTS
  // ============================================

  /**
   * Get wellness statistics for a date range
   */
  async getWellnessStats(userId, startDate, endDate) {
    const checkIns = await this.getCheckIns(userId, { startDate, endDate, limit: 1000 });
    
    if (!checkIns || checkIns.length === 0) {
      return null;
    }
    
    // Calculate averages
    const stats = {
      checkInCount: checkIns.length,
      averages: {
        energy: calculateAverage(checkIns, 'energy_level'),
        sleep: calculateAverage(checkIns, 'sleep_quality'),
        mood: calculateAverage(checkIns, 'mood'),
        stress: calculateAverage(checkIns, 'stress_level'),
        sleepHours: calculateAverage(checkIns, 'sleep_hours'),
        water: calculateAverage(checkIns, 'water_intake'),
        exercise: calculateAverage(checkIns, 'exercise_minutes'),
      },
      spiritual: {
        prayerDays: checkIns.filter(c => c.prayer_time > 0).length,
        bibleReadingDays: checkIns.filter(c => c.bible_reading).length,
        devotionalDays: checkIns.filter(c => c.devotional_completed).length,
      },
    };
    
    return stats;
  },
};

// Helper function to calculate averages
function calculateAverage(array, field) {
  const values = array.map(item => item[field]).filter(val => val != null);
  if (values.length === 0) return null;
  return (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1);
}
