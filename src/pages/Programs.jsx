import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useEnrollment } from '../hooks/useEnrollment'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import { BookOpen, Calendar, Clock, Check, Flame, Target } from 'lucide-react'
import { HealthDisclaimer } from '../components/HealthDisclaimer'

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
    const { data } = await supabase
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

  const programTypeMeta = {
    fasting: { label: 'Fasting', icon: Flame },
    challenge: { label: 'Challenge', icon: Target },
    course: { label: 'Course', icon: BookOpen },
    default: { label: 'Program', icon: BookOpen }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
      {/* Header */}
      <AppHeader title="Programs" />

      {/* Programs Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Faith-based wellness journeys to transform your life
        </p>
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
            {programs.map((program) => {
              const typeKey = program.program_type || (program.includes_fasting ? 'fasting' : 'default')
              const meta = programTypeMeta[typeKey] || programTypeMeta.default
              const TypeIcon = meta.icon

              return (
                <div
                  key={program.id}
                  className="group glass-card overflow-hidden hover:scale-[1.02] transition-all cursor-pointer"
                  onClick={() => navigate(`/programs/${program.slug}`)}
                >
                  {/* Program Header */}
                  <div className="relative h-24 bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-between px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-sm font-semibold text-white/90">
                        {meta.label}
                      </div>
                    </div>
                    {enrollmentStatus[program.id] && (
                      <div className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-semibold text-temple-purple dark:text-temple-gold flex items-center gap-1.5">
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
                      {enrollmentStatus[program.id] ? 'Continue Program ->' : 'Learn More ->'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
    <div className="pb-2 px-4">
      <HealthDisclaimer compact />
    </div>
    <BottomNav />
    </>
  )
}
