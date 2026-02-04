import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, BookOpen, Calendar, TrendingUp, Download, Search, Filter, Eye, CheckCircle, XCircle } from 'lucide-react'

export const AdminEnrollments = () => {
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState([])
  const [programs, setPrograms] = useState([])
  const [selectedProgram, setSelectedProgram] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEnrollments: 0,
    activePrograms: 0,
    completionRate: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    try {
      // Load all programs
      const { data: programsData } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (programsData) {
        setPrograms(programsData)
      }

      // Load all enrollments with user and program data
      const { data: enrollmentsData } = await supabase
        .from('program_enrollments')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          ),
          programs:program_id (
            title,
            slug,
            duration_days,
            program_type
          )
        `)
        .order('created_at', { ascending: false })
      
      if (enrollmentsData) {
        setEnrollments(enrollmentsData)
        
        // Calculate stats
        const activeEnrollments = enrollmentsData.filter(e => e.status === 'active')
        const completedEnrollments = enrollmentsData.filter(e => e.status === 'completed')
        const uniqueUsers = new Set(enrollmentsData.map(e => e.user_id))
        
        setStats({
          totalUsers: uniqueUsers.size,
          totalEnrollments: enrollmentsData.length,
          activePrograms: activeEnrollments.length,
          completionRate: enrollmentsData.length > 0 
            ? Math.round((completedEnrollments.length / enrollmentsData.length) * 100)
            : 0
        })
      }
    } catch (error) {
      console.error('Error loading enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesProgram = selectedProgram === 'all' || enrollment.program_id === selectedProgram
    const matchesSearch = !searchTerm || 
      enrollment.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.programs?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesProgram && matchesSearch
  })

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Program', 'Start Date', 'Status', 'Days Complete', 'Progress %', 'Fasting Type', 'Fasting Window', 'In Cohort']
    const rows = filteredEnrollments.map(e => [
      `${e.profiles?.first_name || ''} ${e.profiles?.last_name || ''}`,
      e.profiles?.email || '',
      e.programs?.title || '',
      e.start_date,
      e.status,
      `${e.completed_days?.length || 0}/${e.programs?.duration_days || 0}`,
      `${getProgressPercentage(e)}%`,
      e.fasting_type || 'N/A',
      e.fasting_window || 'N/A',
      e.cohort_id ? 'Yes' : 'No'
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `enrollments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getProgressPercentage = (enrollment) => {
    const completed = enrollment.completed_days?.length || 0
    const total = enrollment.programs?.duration_days || 1
    return Math.round((completed / total) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
          Program Enrollments
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track user enrollments, progress, and fasting compliance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-temple-purple dark:text-temple-gold" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalUsers}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.activePrograms}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Enrollments</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalEnrollments}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Enrollments</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.completionRate}%
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or program..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Program Filter */}
          <div className="md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
              >
                <option value="all">All Programs</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fasting
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No enrollments found
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {enrollment.profiles?.first_name} {enrollment.profiles?.last_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {enrollment.profiles?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {enrollment.programs?.title}
                      </div>
                      {enrollment.programs?.program_type === 'fasting' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 mt-1">
                          Fasting Program
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(enrollment.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {enrollment.completed_days?.length || 0} / {enrollment.programs?.duration_days || 0} days
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-temple-purple dark:bg-temple-gold h-2 rounded-full transition-all"
                              style={{ width: `${getProgressPercentage(enrollment)}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {getProgressPercentage(enrollment)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {enrollment.fasting_type ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-white capitalize">
                            {enrollment.fasting_type.replace('_', ' ')}
                          </div>
                          {enrollment.fasting_window && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {enrollment.fasting_window}
                            </div>
                          )}
                          {enrollment.cohort_id && (
                            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                              ✓ In cohort
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        enrollment.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : enrollment.status === 'completed'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                      }`}>
                        {enrollment.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {enrollment.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {enrollment.status === 'paused' && <XCircle className="w-3 h-3 mr-1" />}
                        {enrollment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredEnrollments.length} of {enrollments.length} total enrollments
      </div>
    </div>
  )
}
