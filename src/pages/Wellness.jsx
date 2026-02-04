import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Heart, Activity, Apple, Stethoscope, ArrowRight } from 'lucide-react'

export const Wellness = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader title="Wellness" />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Wellness Hub</h1>
          </div>
          <p className="text-white/90 text-lg">
            Track your physical, mental, and spiritual wellness all in one place.
          </p>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-temple-purple/10 dark:bg-temple-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-10 h-10 text-temple-purple dark:text-temple-gold" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Coming Very Soon!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We're building comprehensive wellness tracking features including check-ins, meal logging, and symptom tracking. Stay tuned!
            </p>
            <div className="flex gap-2 justify-center">
              <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
                In Development
              </span>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-temple-purple dark:text-temple-gold" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Daily Check-ins</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track energy, mood, sleep, and spiritual practices daily
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <Apple className="w-6 h-6 text-temple-purple dark:text-temple-gold" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Meal Logging</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Log meals with photos and track how food makes you feel
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <Stethoscope className="w-6 h-6 text-temple-purple dark:text-temple-gold" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Symptom Tracking</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track symptoms and discover patterns for better health
            </p>
          </div>
        </div>

        {/* Current Features */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Available Now
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/today')}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Daily Check-in</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Quick wellness tracking</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-temple-purple dark:group-hover:text-temple-gold transition-colors" />
            </button>

            <button
              onClick={() => navigate('/today')}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Apple className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Meal Logging</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Track what you eat</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-temple-purple dark:group-hover:text-temple-gold transition-colors" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
