import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const AdminDebug = () => {
  const { user } = useAuth()
  const [debug, setDebug] = useState({
    authUser: null,
    adminCheck: null,
    adminUsers: null,
    authUsers: null,
    policies: null,
    errors: []
  })

  useEffect(() => {
    const runDiagnostics = async () => {
      const errors = []
      const result = {
        authUser: user,
        adminCheck: null,
        adminUsers: null,
        authUsers: null,
        policies: null,
        errors
      }

      // Check 1: Current auth user
      console.log('🔍 Current User:', user)

      // Check 2: Try to query admin_users for current user
      try {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user?.id)
          .single()

        result.adminCheck = { data: adminData, error: adminError?.message }
        if (adminError) errors.push(`Admin check error: ${adminError.message}`)
        console.log('🔍 Admin Check Result:', adminData, adminError)
      } catch (e) {
        errors.push(`Admin check exception: ${e.message}`)
      }

      // Check 3: Try to see all admin_users (will work if user is already admin)
      try {
        const { data: allAdmins, error: allAdminsError } = await supabase
          .from('admin_users')
          .select('*')

        result.adminUsers = { data: allAdmins, error: allAdminsError?.message }
        if (allAdminsError) errors.push(`All admins error: ${allAdminsError.message}`)
        console.log('🔍 All Admin Users:', allAdmins, allAdminsError)
      } catch (e) {
        errors.push(`All admins exception: ${e.message}`)
      }

      // Check 4: Try to see auth.users (might not work due to permissions)
      try {
        const { data: authUsersData, error: authUsersError } = await supabase
          .from('auth.users')
          .select('id, email')

        result.authUsers = { data: authUsersData, error: authUsersError?.message }
        console.log('🔍 Auth Users:', authUsersData, authUsersError)
      } catch (e) {
        console.log('⚠️ Cannot query auth.users from client (expected)')
      }

      result.errors = errors
      setDebug(result)
    }

    if (user) {
      runDiagnostics()
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Debug - No User</h1>
        <p>You need to be logged in to see debug info.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">🔧 Admin Access Debug</h1>

      {/* Current User */}
      <section className="mb-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3 text-temple-gold">1. Current Authenticated User</h2>
        <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
          {JSON.stringify({
            id: user.id,
            email: user.email,
            created_at: user.created_at
          }, null, 2)}
        </pre>
      </section>

      {/* Admin Check */}
      <section className="mb-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3 text-temple-gold">2. Admin Check (Your Record)</h2>
        {debug.adminCheck?.error ? (
          <div className="bg-red-900/30 border border-red-500 rounded p-4 mb-4">
            <p className="font-semibold text-red-400">❌ Error:</p>
            <p className="text-red-300">{debug.adminCheck.error}</p>
          </div>
        ) : null}
        <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(debug.adminCheck, null, 2)}
        </pre>
        {!debug.adminCheck?.data && !debug.adminCheck?.error ? (
          <div className="mt-4 bg-yellow-900/30 border border-yellow-500 rounded p-4">
            <p className="font-semibold text-yellow-400">⚠️ No admin record found for your user ID</p>
            <p className="text-yellow-300 text-sm mt-2">
              Your user ID: <code className="bg-gray-900 px-2 py-1 rounded">{user.id}</code>
            </p>
            <p className="text-yellow-300 text-sm mt-2">
              Run this in Supabase SQL Editor:
            </p>
            <pre className="bg-gray-900 p-3 rounded mt-2 text-xs overflow-auto">
{`INSERT INTO admin_users (user_id, role)
VALUES ('${user.id}', 'super_admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'super_admin';`}
            </pre>
          </div>
        ) : null}
      </section>

      {/* All Admin Users */}
      <section className="mb-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3 text-temple-gold">3. All Admin Users</h2>
        {debug.adminUsers?.error ? (
          <div className="bg-red-900/30 border border-red-500 rounded p-4 mb-4">
            <p className="font-semibold text-red-400">❌ Error:</p>
            <p className="text-red-300">{debug.adminUsers.error}</p>
            <p className="text-red-200 text-sm mt-2">
              This could mean RLS policies are blocking access, or you're not yet an admin.
            </p>
          </div>
        ) : null}
        <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(debug.adminUsers, null, 2)}
        </pre>
      </section>

      {/* Errors Summary */}
      {debug.errors.length > 0 && (
        <section className="mb-8 bg-red-900/20 border border-red-500 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3 text-red-400">⚠️ Errors Found</h2>
          <ul className="list-disc list-inside space-y-2">
            {debug.errors.map((error, i) => (
              <li key={i} className="text-red-300">{error}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Instructions */}
      <section className="bg-blue-900/20 border border-blue-500 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3 text-blue-400">📋 Next Steps</h2>
        <ol className="list-decimal list-inside space-y-3 text-blue-200">
          <li>
            Open your Supabase Dashboard: <a 
              href="https://supabase.com/dashboard/project/jdcrzdmbwfkozuhsoqbl/editor" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-temple-gold hover:underline"
            >
              SQL Editor
            </a>
          </li>
          <li>Run the query shown in section 2 above (if your admin record is missing)</li>
          <li>Refresh this page to see if the issue is resolved</li>
          <li>Check section 3 to verify both users are listed as super_admin</li>
        </ol>
      </section>
    </div>
  )
}

export default AdminDebug
