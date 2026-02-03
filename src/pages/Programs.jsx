import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useEnrollment } from '../hooks/useEnrollment'
import { BookOpen, Calendar, Clock, Check } from 'lucide-react'

export const Programs = () => {
  const navigate = useNavigate()
  const { getEnrollment } = useEnrollment()
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [enrollmentStatus, setEnrollmentStatus] = useState({})

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    setLoading(true)
    
    // Get published programs
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    
    if (data) {
      setPrograms(data)
      
      // Check enrollment status for each program
      const statuses = {}
      for (const program of data) {
        const { data: enrollment } = await getEnrollment(program.id)
        statuses[program.id] = !!enrollment
      }
      setEnrollmentStatus(statuses)
    }
    
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/today')}
            className="text-sm text-temple-purple dark:text-temple-gold hover:underline mb-4"
          >
            ← Back to Today
          </button>
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Programs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Faith-based wellness journeys to transform your life
          </p>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {programs.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Programs Available Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Check back soon for new wellness programs
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div
                key={program.id}
                className="group glass-card overflow-hidden hover:scale-[1.02] transition-all cursor-pointer"
                onClick={() => navigate(`/programs/${program.slug}`)}
              >
                {/* Program Image Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white/80" />
                  {enrollmentStatus[program.id] && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-semibold text-temple-purple dark:text-temple-gold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Enrolled</span>
                    </div>
                  )}
                </div>

                {/* Program Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-temple-purple dark:group-hover:text-temple-gold transition-colors">
                    {program.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {program.description || 'Transform your spiritual walk through this guided program'}
                  </p>

                  {/* Program Meta */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{program.duration_days} days</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>20-30 min/day</span>
                    </div>
                    
                    {program.includes_fasting && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-400">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Fasting</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <button className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 text-white font-semibold hover:shadow-lg transition-all group-hover:scale-[1.02]">
                    {enrollmentStatus[program.id] ? 'Continue Program →' : 'Learn More →'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
