import { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../lib/supabase'
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

const FixAdminAccess = () => {
  const { isDark } = useTheme()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const fixAdminAccess = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      // Check current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Not logged in')
        return
      }

      const adminEmails = [
        'denise@deniseparris.com',
        'deniseparris@gmail.com'
      ]

      // Run the fix using the SQL function
      const { data, error: sqlError } = await supabase.rpc('fix_superadmin_access', {
        admin_emails: adminEmails
      })

      if (sqlError) {
        // If RPC doesn't exist, try direct update (requires service role)
        console.error('RPC error:', sqlError)
        setError('Please run FIX_SUPERADMIN_ACCESS.sql in the Supabase SQL editor')
        return
      }

      // Refresh session to get updated metadata
      await supabase.auth.refreshSession()

      setResults({
        success: true,
        message: 'Admin access has been restored!',
        details: data
      })

    } catch (err) {
      console.error('Error fixing admin access:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
        <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Fix Superadmin Access
        </h1>
        
        <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          If a superadmin has lost access to admin features, click the button below to restore their permissions.
        </p>

        <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                Alternative Method
              </p>
              <p className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-700'}`}>
                If this button doesn't work, run <code className="px-1 py-0.5 rounded bg-black/10">FIX_SUPERADMIN_ACCESS.sql</code> in your Supabase SQL Editor.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fixAdminAccess}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-semibold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Fixing...
            </>
          ) : (
            'Fix Admin Access'
          )}
        </button>

        {error && (
          <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-red-300' : 'text-red-800'}`}>
                  Error
                </p>
                <p className={`text-sm ${isDark ? 'text-red-200' : 'text-red-700'}`}>
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {results?.success && (
          <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                  Success!
                </p>
                <p className={`text-sm ${isDark ? 'text-green-200' : 'text-green-700'}`}>
                  {results.message}
                </p>
                <p className={`text-xs mt-2 ${isDark ? 'text-green-300' : 'text-green-600'}`}>
                  Please refresh the page to see the changes.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={`mt-8 p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            What this does:
          </h3>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>• Sets admin role in auth metadata (app_metadata)</li>
            <li>• Updates user metadata as backup</li>
            <li>• Syncs with admin_users table if it exists</li>
            <li>• Grants all superadmin permissions</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default FixAdminAccess
