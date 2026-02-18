import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { useAuth } from '../contexts/AuthContext'
import { useCheckIns } from '../hooks/useCheckIns'
import { useMealLogs } from '../hooks/useMealLogs'
import { useSymptoms } from '../hooks/useSymptoms'
import { wellnessService } from '../services/wellnessService'
import { BottomNav } from '../components/BottomNav'
import { 
  Calendar,
  TrendingUp,
  Activity,
  Heart,
  Moon,
  Smile,
  Zap,
  Droplets,
  Dumbbell,
  Clock,
  ChevronRight,
  Edit,
  Plus,
  BarChart3,
  Apple,
  AlertCircle
} from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'

export const Wellness = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('checkins') // overview, checkins, meals, symptoms
  const [selectedPeriod, setSelectedPeriod] = useState('all') // week, month, all
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // Get date range based on selected period
  const getDateRange = () => {
    const today = new Date()
    switch (selectedPeriod) {
      case 'week':
        return { 
          startDate: format(startOfWeek(today), 'yyyy-MM-dd'),
          endDate: format(endOfWeek(today), 'yyyy-MM-dd')
        }
      case 'month':
        return { 
          startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        }
      default:
        return { startDate: null, endDate: null }
    }
  }

  const { startDate, endDate } = getDateRange()

  // Memoize options to prevent unnecessary re-renders
  const checkInsOptions = useMemo(() => ({ 
    startDate, 
    endDate, 
    limit: 100 
  }), [startDate, endDate])
  
  const mealsOptions = useMemo(() => ({ 
    startDate, 
    endDate, 
    limit: 100 
  }), [startDate, endDate])
  
  const symptomsOptions = useMemo(() => ({ 
    startDate, 
    endDate, 
    limit: 50 
  }), [startDate, endDate])

  // Fetch data
  const { checkIns, loading: checkInsLoading } = useCheckIns(checkInsOptions)
  const { mealLogs, loading: mealsLoading } = useMealLogs(mealsOptions)
  const { symptoms, loading: symptomsLoading } = useSymptoms(symptomsOptions)

  // Debug logging
  useEffect(() => {
    console.log('=== WELLNESS HUB DEBUG ===')
    console.log('User ID:', user?.id)
    console.log('Selected Period:', selectedPeriod)
    console.log('Date Range:', { startDate, endDate })
    console.log('Options:', checkInsOptions)
    console.log('Check-ins Loading:', checkInsLoading)
    console.log('Check-ins Count:', checkIns?.length || 0)
    console.log('Check-ins Data:', checkIns)
    console.log('=========================')
  }, [user?.id, selectedPeriod, startDate, endDate, checkInsOptions, checkIns, checkInsLoading])

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
      
      setLoadingStats(true)
      try {
        console.log('Fetching stats for user:', user.id, 'dates:', startDate, endDate)
        const wellnessStats = await wellnessService.getWellnessStats(user.id, startDate, endDate)
        console.log('Stats fetched:', wellnessStats)
        setStats(wellnessStats)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoadingStats(false)
      }
    }

    fetchStats()
  }, [user?.id, startDate, endDate])

  const loading = checkInsLoading || mealsLoading || symptomsLoading

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
      <AppHeader title="Wellness Hub" />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Actions */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => navigate('/wellness/check-in')}
            className="flex items-center gap-2 px-4 py-2.5 bg-temple-purple dark:bg-temple-gold text-white rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Check-in</span>
          </button>
          <button
            onClick={() => navigate('/wellness/meals/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 whitespace-nowrap"
          >
            <Apple className="w-5 h-5" />
            <span className="font-medium">Log Meal</span>
          </button>
          <button
            onClick={() => navigate('/wellness/symptoms/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 whitespace-nowrap"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Log Symptom</span>
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'week'
                ? 'bg-temple-purple dark:bg-temple-gold text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'month'
                ? 'bg-temple-purple dark:bg-temple-gold text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setSelectedPeriod('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'all'
                ? 'bg-temple-purple dark:bg-temple-gold text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            All Time
          </button>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Activity}
              label="Avg Energy"
              value={stats.averages.energy || '--'}
              suffix="/10"
              color="purple"
            />
            <StatCard
              icon={Moon}
              label="Avg Sleep"
              value={stats.averages.sleep || '--'}
              suffix="/10"
              color="blue"
            />
            <StatCard
              icon={Smile}
              label="Avg Mood"
              value={stats.averages.mood || '--'}
              suffix="/10"
              color="green"
            />
            <StatCard
              icon={Heart}
              label="Check-ins"
              value={stats.checkInCount || 0}
              color="red"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={BarChart3}
            label="Overview"
          />
          <TabButton
            active={activeTab === 'checkins'}
            onClick={() => setActiveTab('checkins')}
            icon={Activity}
            label="Check-ins"
            count={checkIns?.length}
          />
          <TabButton
            active={activeTab === 'meals'}
            onClick={() => setActiveTab('meals')}
            icon={Apple}
            label="Meals"
            count={mealLogs?.length}
          />
          <TabButton
            active={activeTab === 'symptoms'}
            onClick={() => setActiveTab('symptoms')}
            icon={AlertCircle}
            label="Symptoms"
            count={symptoms?.length}
          />
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-temple-purple dark:border-temple-gold"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewTab stats={stats} checkIns={checkIns} mealLogs={mealLogs} symptoms={symptoms} />
            )}
            {activeTab === 'checkins' && (
              <CheckInsTab checkIns={checkIns} />
            )}
            {activeTab === 'meals' && (
              <MealsTab mealLogs={mealLogs} />
            )}
            {activeTab === 'symptoms' && (
              <SymptomsTab symptoms={symptoms} />
            )}
          </>
        )}
      </main>
    </div>
    
    {/* Mobile Bottom Navigation */}
    <BottomNav />
    </>
  )
}

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, suffix, color }) => {
  const colorClasses = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}{suffix}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  )
}

// Tab Button Component
const TabButton = ({ active, onClick, icon: Icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
      active
        ? 'bg-temple-purple dark:bg-temple-gold text-white shadow-md'
        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
    {count !== undefined && (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
        active ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
      }`}>
        {count}
      </span>
    )}
  </button>
)

// Overview Tab
const OverviewTab = ({ stats, checkIns, mealLogs, symptoms }) => (
  <div className="space-y-6">
    {/* Spiritual Practices */}
    {stats && (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Spiritual Practices</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-temple-purple dark:text-temple-gold">
              {stats.spiritual.prayerDays}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Prayer Days</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-temple-purple dark:text-temple-gold">
              {stats.spiritual.bibleReadingDays}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Bible Reading</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-temple-purple dark:text-temple-gold">
              {stats.spiritual.devotionalDays}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Devotionals</div>
          </div>
        </div>
      </div>
    )}

    {/* Recent Activity */}
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
      
      {checkIns?.length === 0 && mealLogs?.length === 0 && symptoms?.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No activity yet. Start tracking!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {checkIns?.slice(0, 3).map((checkIn) => (
            <ActivityItem
              key={checkIn.id}
              icon={Activity}
              title="Daily Check-in"
              date={checkIn.check_in_date}
              color="purple"
            />
          ))}
          {mealLogs?.slice(0, 3).map((meal) => (
            <ActivityItem
              key={meal.id}
              icon={Apple}
              title={`${meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)} logged`}
              date={meal.meal_date}
              color="green"
            />
          ))}
        </div>
      )}
    </div>
  </div>
)

const ActivityItem = ({ icon: Icon, title, date, color }) => {
  const colorClasses = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {format(new Date(date), 'MMM d, yyyy')}
        </p>
      </div>
    </div>
  )
}

// Check-ins Tab
const CheckInsTab = ({ checkIns }) => {
  const [selectedCheckIn, setSelectedCheckIn] = useState(null)

  if (!checkIns || checkIns.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700">
        <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No check-ins yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Start tracking your daily wellness</p>
        <button
          onClick={() => window.location.href = '/wellness/check-in'}
          className="inline-flex items-center gap-2 px-6 py-3 bg-temple-purple dark:bg-temple-gold text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
        >
          <Plus className="w-5 h-5" />
          Create First Check-in
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {checkIns.map((checkIn) => (
        <CheckInCard
          key={checkIn.id}
          checkIn={checkIn}
          onClick={() => setSelectedCheckIn(checkIn)}
        />
      ))}

      {/* Check-in Detail Modal */}
      {selectedCheckIn && (
        <CheckInDetailModal
          checkIn={selectedCheckIn}
          onClose={() => setSelectedCheckIn(null)}
        />
      )}
    </div>
  )
}

// Check-in Card
const CheckInCard = ({ checkIn, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
  >
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">
          {format(new Date(checkIn.check_in_date), 'EEEE, MMMM d')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {format(new Date(checkIn.created_at), 'h:mm a')}
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>

    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {checkIn.energy_level && (
        <MetricBadge icon={Zap} value={checkIn.energy_level} label="Energy" />
      )}
      {checkIn.sleep_quality && (
        <MetricBadge icon={Moon} value={checkIn.sleep_quality} label="Sleep" />
      )}
      {checkIn.mood && (
        <MetricBadge icon={Smile} value={checkIn.mood} label="Mood" />
      )}
      {checkIn.water_intake && (
        <MetricBadge icon={Droplets} value={checkIn.water_intake} label="Water" suffix="oz" />
      )}
      {checkIn.exercise_minutes && (
        <MetricBadge icon={Dumbbell} value={checkIn.exercise_minutes} label="Exercise" suffix="m" />
      )}
      {checkIn.sleep_hours && (
        <MetricBadge icon={Clock} value={checkIn.sleep_hours} label="Sleep" suffix="h" />
      )}
    </div>

    {checkIn.gratitude && (
      <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
          "{checkIn.gratitude}"
        </p>
      </div>
    )}
  </div>
)

const MetricBadge = ({ icon: Icon, value, label, suffix = '' }) => (
  <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <Icon className="w-4 h-4 text-temple-purple dark:text-temple-gold mb-1" />
    <div className="text-sm font-bold text-gray-900 dark:text-white">
      {value}{suffix}
    </div>
    <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
  </div>
)

// Check-in Detail Modal
const CheckInDetailModal = ({ checkIn, onClose }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {format(new Date(checkIn.check_in_date), 'EEEE, MMMM d, yyyy')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {format(new Date(checkIn.created_at), 'h:mm a')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Physical Metrics */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Physical</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {checkIn.energy_level && (
              <DetailMetric icon={Zap} label="Energy Level" value={`${checkIn.energy_level}/10`} />
            )}
            {checkIn.sleep_quality && (
              <DetailMetric icon={Moon} label="Sleep Quality" value={`${checkIn.sleep_quality}/10`} />
            )}
            {checkIn.sleep_hours && (
              <DetailMetric icon={Clock} label="Sleep Hours" value={`${checkIn.sleep_hours}h`} />
            )}
            {checkIn.water_intake && (
              <DetailMetric icon={Droplets} label="Water Intake" value={`${checkIn.water_intake} oz`} />
            )}
            {checkIn.exercise_minutes && (
              <DetailMetric icon={Dumbbell} label="Exercise" value={`${checkIn.exercise_minutes} min`} />
            )}
          </div>
        </section>

        {/* Mental/Emotional */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Mental & Emotional</h3>
          <div className="grid grid-cols-2 gap-4">
            {checkIn.mood && (
              <DetailMetric icon={Smile} label="Mood" value={`${checkIn.mood}/10`} />
            )}
            {checkIn.stress_level && (
              <DetailMetric icon={Activity} label="Stress Level" value={`${checkIn.stress_level}/10`} />
            )}
          </div>
        </section>

        {/* Spiritual */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Spiritual</h3>
          <div className="space-y-3">
            {checkIn.prayer_time > 0 && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Heart className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                <span className="text-gray-900 dark:text-white">
                  Prayed for {checkIn.prayer_time} minutes
                </span>
              </div>
            )}
            {checkIn.bible_reading && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Heart className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                <span className="text-gray-900 dark:text-white">Read Bible today</span>
              </div>
            )}
            {checkIn.devotional_completed && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Heart className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                <span className="text-gray-900 dark:text-white">Completed devotional</span>
              </div>
            )}
          </div>
        </section>

        {/* Notes */}
        {(checkIn.gratitude || checkIn.challenges || checkIn.prayer_requests || checkIn.notes) && (
          <section>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Reflections</h3>
            <div className="space-y-4">
              {checkIn.gratitude && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Gratitude</h4>
                  <p className="text-gray-900 dark:text-white p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {checkIn.gratitude}
                  </p>
                </div>
              )}
              {checkIn.challenges && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Challenges</h4>
                  <p className="text-gray-900 dark:text-white p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {checkIn.challenges}
                  </p>
                </div>
              )}
              {checkIn.prayer_requests && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Prayer Requests</h4>
                  <p className="text-gray-900 dark:text-white p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {checkIn.prayer_requests}
                  </p>
                </div>
              )}
              {checkIn.notes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Additional Notes</h4>
                  <p className="text-gray-900 dark:text-white p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {checkIn.notes}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              onClose()
              window.location.href = '/wellness/check-in'
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-temple-purple dark:bg-temple-gold text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
          >
            <Edit className="w-5 h-5" />
            Edit Check-in
          </button>
        </div>
      </div>
    </div>
  </div>
)

const DetailMetric = ({ icon: Icon, label, value }) => (
  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    </div>
    <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
  </div>
)

// Meals Tab
const MealsTab = ({ mealLogs }) => {
  if (!mealLogs || mealLogs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700">
        <Apple className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No meals logged yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Start tracking your nutrition</p>
        <button
          onClick={() => window.location.href = '/wellness/meals/new'}
          className="inline-flex items-center gap-2 px-6 py-3 bg-temple-purple dark:bg-temple-gold text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
        >
          <Plus className="w-5 h-5" />
          Log First Meal
        </button>
      </div>
    )
  }

  // Group meals by date
  const mealsByDate = mealLogs.reduce((acc, meal) => {
    const date = meal.meal_date
    if (!acc[date]) acc[date] = []
    acc[date].push(meal)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(mealsByDate).map(([date, meals]) => (
        <div key={date}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            {format(new Date(date), 'EEEE, MMMM d')}
          </h3>
          <div className="space-y-3">
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const MealCard = ({ meal }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-3 py-1 bg-temple-purple/10 dark:bg-temple-gold/10 text-temple-purple dark:text-temple-gold text-sm font-semibold rounded-full">
            {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
          </span>
          {meal.meal_time && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {format(new Date(`2000-01-01T${meal.meal_time}`), 'h:mm a')}
            </span>
          )}
        </div>
        <h4 className="font-bold text-gray-900 dark:text-white">{meal.description}</h4>
        {meal.recipes && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Recipe: {meal.recipes.title}
          </p>
        )}
      </div>
      <button
        onClick={() => window.location.href = `/wellness/meals/${meal.id}/edit`}
        className="p-2 text-gray-400 hover:text-temple-purple dark:hover:text-temple-gold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
        title="Edit meal"
      >
        <Edit className="w-4 h-4" />
      </button>
    </div>

    {meal.photo_urls && meal.photo_urls.length > 0 && (
      <div className="flex gap-2 mb-3">
        {meal.photo_urls.map((url, i) => (
          <img key={i} src={url} alt="Meal" className="w-16 h-16 rounded-lg object-cover" />
        ))}
      </div>
    )}

    {meal.nutrition && meal.nutrition.calories && (
      <div className="flex gap-3 mb-3 text-xs">
        <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full font-medium">🔥 {meal.nutrition.calories} kcal</span>
        {meal.nutrition.protein_g && <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full font-medium">P: {meal.nutrition.protein_g}g</span>}
        {meal.nutrition.carbs_g && <span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full font-medium">C: {meal.nutrition.carbs_g}g</span>}
        {meal.nutrition.fat_g && <span className="px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-full font-medium">F: {meal.nutrition.fat_g}g</span>}
      </div>
    )}

    {meal.notes && (
      <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        {meal.notes}
      </p>
    )}

    {(meal.hunger_before || meal.hunger_after || meal.satisfaction) && (
      <div className="mt-3 flex gap-3 text-sm">
        {meal.hunger_before && (
          <span className="text-gray-600 dark:text-gray-400">
            Hunger before: <strong>{meal.hunger_before}/10</strong>
          </span>
        )}
        {meal.satisfaction && (
          <span className="text-gray-600 dark:text-gray-400">
            Satisfaction: <strong>{meal.satisfaction}/10</strong>
          </span>
        )}
      </div>
    )}

    {meal.water_ml > 0 && (
      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
        💧 {meal.water_ml >= 1000 ? `${(meal.water_ml / 1000).toFixed(1)}L` : `${meal.water_ml}ml`} water
      </div>
    )}
  </div>
)

// Symptoms Tab
const SymptomsTab = ({ symptoms }) => {
  if (!symptoms || symptoms.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No symptoms logged</h3>
        <p className="text-gray-600 dark:text-gray-400">Track symptoms to discover patterns</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {symptoms.map((symptom) => (
        <SymptomCard key={symptom.id} symptom={symptom} />
      ))}
    </div>
  )
}

const SymptomCard = ({ symptom }) => {
  const getSeverityColor = (severity) => {
    if (severity <= 3) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    if (severity <= 6) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  }

  const displayDate = symptom.logged_at || symptom.created_at || `${symptom.log_date}T${symptom.log_time || '00:00'}`

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-gray-900 dark:text-white capitalize">{symptom.symptom || symptom.symptom_type}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(symptom.severity)}`}>
              {symptom.severity}/10
            </span>
            {symptom.is_recurring && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                Recurring
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {format(new Date(displayDate), 'MMM d, yyyy • h:mm a')}
          </p>
        </div>
        <button
          onClick={() => window.location.href = `/wellness/symptoms/${symptom.id}/edit`}
          className="p-2 text-gray-400 hover:text-temple-purple dark:hover:text-temple-gold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
          title="Edit symptom"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>

      {symptom.body_area && (
        <div className="mb-2">
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
            📍 {symptom.body_area}
          </span>
        </div>
      )}

      {symptom.notes && (
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{symptom.notes}</p>
      )}

      <div className="flex flex-wrap gap-2 text-sm">
        {symptom.duration_minutes && (
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
            ⏱️ {symptom.duration_minutes >= 999 ? 'Ongoing' : symptom.duration_minutes >= 60 ? `${Math.round(symptom.duration_minutes / 60)}h` : `${symptom.duration_minutes} min`}
          </span>
        )}
        {symptom.triggered_by && (
          <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">
            ⚡ {symptom.triggered_by}
          </span>
        )}
        {symptom.relieved_by && (
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
            💊 {symptom.relieved_by}
          </span>
        )}
        {symptom.interfered_with && (
          <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
            Disrupted: {symptom.interfered_with}
          </span>
        )}
      </div>
    </div>
  )
}
