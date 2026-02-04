import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrograms } from '../../hooks/usePrograms'
import { BookOpen, Plus, Edit, Trash2, Eye, EyeOff, Calendar } from 'lucide-react'

export const AdminPrograms = () => {
  const navigate = useNavigate()
  const { programs, loading, getPrograms, deleteProgram, togglePublish } = usePrograms()
  const [filter, setFilter] = useState('all') // 'all', 'published', 'draft'

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    if (filter === 'all') {
      await getPrograms()
    } else {
      await getPrograms({ published: filter === 'published' })
    }
  }

  useEffect(() => {
    loadPrograms()
  }, [filter])

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete "${title}"? This will also delete all day content.`)) {
      await deleteProgram(id)
    }
  }

  const handleTogglePublish = async (id, currentStatus) => {
    await togglePublish(id, currentStatus)
  }

  const filteredPrograms = programs.filter(p => {
    if (filter === 'all') return true
    if (filter === 'published') return p.is_published
    if (filter === 'draft') return !p.is_published
    return true
  })

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
            Programs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage wellness programs
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/programs/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Program</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-temple-purple text-white dark:bg-temple-gold'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All ({programs.length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'published'
                ? 'bg-temple-purple text-white dark:bg-temple-gold'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Published ({programs.filter(p => p.is_published).length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'draft'
                ? 'bg-temple-purple text-white dark:bg-temple-gold'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Drafts ({programs.filter(p => !p.is_published).length})
          </button>
        </div>
      </div>

      {/* Programs List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {filter === 'all' ? 'No programs yet' : `No ${filter} programs`}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first program like the 14-Day Prayer Fast
          </p>
          <button
            onClick={() => navigate('/admin/programs/new')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Program</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className="glass-card p-6 hover:scale-[1.02] transition-transform"
            >
              {/* Program Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {program.title}
                    </h3>
                    {program.is_published ? (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                        Draft
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {program.description || 'No description'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {program.duration_days} days
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-temple-purple/10 text-temple-purple dark:bg-temple-gold/10 dark:text-temple-gold">
                      {program.program_type}
                    </span>
                    {program.includes_fasting && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        Fasting
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => navigate(`/admin/programs/${program.id}/edit`)}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm py-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                
                <button
                  onClick={() => handleTogglePublish(program.id, program.is_published)}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm py-2"
                >
                  {program.is_published ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>Unpublish</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Publish</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleDelete(program.id, program.title)}
                  className="px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

