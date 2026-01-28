import { useState, useEffect } from 'react'
import { useAdmin } from '../../contexts/AdminContext'
import { getAdminUsers, removeAdminUser } from '../../lib/adminSupabase'
import { Shield, Users, Trash2, Crown, X } from 'lucide-react'

const AdminSettings = () => {
  const { isSuperAdmin } = useAdmin()
  const [adminUsers, setAdminUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    const load = async () => {
      const admins = await getAdminUsers()
      setAdminUsers(admins)
      setLoading(false)
    }
    load()
  }, [])

  const handleRemove = async (id) => {
    await removeAdminUser(id)
    setAdminUsers(adminUsers.filter(a => a.id !== id))
    setDeleteConfirm(null)
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Access Restricted</h2>
          <p className="text-gray-400">Only super admins can access settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-white mb-1">Admin Settings</h1>
        <p className="text-gray-400">Manage admin users</p>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Admin Users</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-temple-gold/30 border-t-temple-gold rounded-full animate-spin" />
          </div>
        ) : adminUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No admin users</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {adminUsers.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${admin.role === 'super_admin' ? 'bg-temple-gold' : 'bg-temple-purple'}`}>
                    {admin.role === 'super_admin' ? <Crown className="w-5 h-5 text-white" /> : <Shield className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <p className="text-white font-medium">{admin.profiles?.full_name || 'Unknown'}</p>
                    <p className="text-sm text-gray-400">{admin.profiles?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs ${admin.role === 'super_admin' ? 'bg-temple-gold/20 text-temple-gold' : 'bg-purple-500/20 text-purple-400'}`}>
                    {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                  <button onClick={() => setDeleteConfirm(admin)} className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">How to Add an Admin</h3>
        <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-gray-300">
          <p className="text-green-400">-- Run in Supabase SQL Editor:</p>
          <p>INSERT INTO admin_users (user_id, role)</p>
          <p>VALUES ('user-id-here', 'admin');</p>
          <p className="text-gray-500 mt-2">-- Use 'super_admin' for full access</p>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Remove Admin?</h2>
            <p className="text-gray-300 mb-6">Remove {deleteConfirm.profiles?.email}?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-xl">Cancel</button>
              <button onClick={() => handleRemove(deleteConfirm.id)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSettings