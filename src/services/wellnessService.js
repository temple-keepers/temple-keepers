import { supabase } from '../lib/supabase';

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
    
    console.log('🔍 getCheckIns CALLED:', { userId, startDate, endDate, limit });
    
    let query = supabase
      .from('wellness_check_ins')
      .select('*')
      .eq('user_id', userId)
      .order('check_in_date', { ascending: false })
      .limit(limit);
    
    if (startDate) {
      console.log('📅 Adding startDate filter:', startDate);
      query = query.gte('check_in_date', startDate);
    }
    
    if (endDate) {
      console.log('📅 Adding endDate filter:', endDate);
      query = query.lte('check_in_date', endDate);
    }
    
    console.log('🚀 Executing query...');
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Query error:', error);
      throw error;
    }
    
    console.log('✅ Query result:', data?.length || 0, 'records');
    console.log('📊 Data:', data);
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

  /**
   * Save a check-in (upsert: update if exists, create if not)
   */
  async saveCheckIn(userId, checkInData) {
    const checkInDate = checkInData.check_in_date || new Date().toISOString().split('T')[0];
    
    // Check if check-in exists for this date
    const existing = await this.getCheckInByDate(userId, checkInDate);
    
    if (existing) {
      // Update existing check-in
      return await this.updateCheckIn(existing.id, checkInData);
    } else {
      // Create new check-in
      return await this.createCheckIn(userId, { ...checkInData, check_in_date: checkInDate });
    }
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
    const { startDate, endDate, limit = 50 } = options;
    
    let query = supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .order('log_time', { ascending: false })
      .limit(limit);
    
    if (startDate) {
      query = query.gte('log_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('log_date', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  /**
   * Create a new symptom log
   */
  async createSymptomLog(userId, symptomData) {
    console.log('Creating symptom log:', { userId, symptomData });
    
    const { data, error } = await supabase
      .from('symptom_logs')
      .insert({
        user_id: userId,
        log_date: symptomData.log_date,
        log_time: symptomData.log_time,
        symptom: symptomData.symptom,
        severity: symptomData.severity,
        notes: symptomData.notes || null,
        duration_minutes: symptomData.duration_minutes || null
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating symptom log:', error);
      throw error;
    }
    
    console.log('Symptom log created:', data);
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
