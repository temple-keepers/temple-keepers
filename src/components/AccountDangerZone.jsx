import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useConfirm } from './ConfirmModal'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { AlertTriangle, Trash2, UserX, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

export const AccountDangerZone = () => {
  const { user } = useAuth()
  const confirm = useConfirm()
  const [expanded, setExpanded] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [processing, setProcessing] = useState(false)

  const cleanupAvatar = async (avatarPath) => {
    if (!avatarPath || avatarPath.startsWith('data:')) return
    try {
      const bucketName = import.meta.env.VITE_SUPABASE_AVATAR_BUCKET || 'avatars'
      const { data: files } = await supabase.storage.from(bucketName).list(user.id)
      if (files?.length) {
        const paths = files.map(f => `${user.id}/${f.name}`)
        await supabase.storage.from(bucketName).remove(paths)
      }
    } catch (err) {
      console.warn('Avatar cleanup failed (non-blocking):', err)
    }
  }

  const handleRemovePersonalDetails = async () => {
    const confirmed = await confirm({
      title: 'Remove Personal Details?',
      message: 'This will clear your name, phone, location, health profile, spiritual profile, and other personal information. Your account will remain active but with a blank profile. This cannot be undone.',
      confirmLabel: 'Remove Details',
      cancelLabel: 'Cancel',
      variant: 'warning',
      icon: UserX,
    })

    if (!confirmed) return

    setProcessing(true)
    try {
      const { data, error } = await supabase.rpc('anonymize_user_profile', {
        p_user_id: user.id,
      })

      if (error) throw error

      await cleanupAvatar(data?.avatar_path)

      // Clear PIN since pin_hash was nulled
      localStorage.removeItem(`tk-pin-enabled-${user.id}`)
      sessionStorage.removeItem(`tk-pin-unlocked-${user.id}`)

      toast.success('Personal details removed successfully.')
      window.location.reload()
    } catch (err) {
      console.error('Failed to remove personal details:', err)
      toast.error('Failed to remove details. Please try again.')
      setProcessing(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toUpperCase() !== 'DELETE') return

    setProcessing(true)
    try {
      const { data, error } = await supabase.rpc('delete_user_account', {
        p_user_id: user.id,
      })

      if (error) throw error

      await cleanupAvatar(data?.avatar_path)

      // Clear PIN storage
      localStorage.removeItem(`tk-pin-enabled-${user.id}`)
      sessionStorage.removeItem(`tk-pin-unlocked-${user.id}`)

      toast.success('Your account has been deleted. We wish you well.')

      // Use local scope — auth.users is already deleted so a global
      // signOut API call would fail and AuthContext wouldn't clear state
      await supabase.auth.signOut({ scope: 'local' })
      window.location.href = '/'
    } catch (err) {
      console.error('Failed to delete account:', err)
      toast.error('Failed to delete account. Please try again or contact support.')
      setProcessing(false)
    }
  }

  return (
    <div className="mt-8 border-t-2 border-red-200 dark:border-red-900/30 pt-4">
      {/* Collapsible header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-2 text-left"
        disabled={processing}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="font-semibold text-red-700 dark:text-red-400">Account Management</span>
        </div>
        {expanded
          ? <ChevronUp className="w-5 h-5 text-gray-400" />
          : <ChevronDown className="w-5 h-5 text-gray-400" />
        }
      </button>

      {expanded && (
        <div className="mt-4 space-y-6">
          {/* Remove Personal Details */}
          <div className="glass-card p-4 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
            <div className="flex items-start gap-3">
              <UserX className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Remove Personal Details</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Clear your name, phone, location, health and spiritual profiles. Your account stays active but with a blank profile.
                </p>
                <button
                  onClick={handleRemovePersonalDetails}
                  disabled={processing}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                  Remove Personal Details
                </button>
              </div>
            </div>
          </div>

          {/* Delete Account */}
          <div className="glass-card p-4 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Delete Account</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Permanently delete your account and all associated data. This action is <strong>irreversible</strong>.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  All your programmes, recipes, wellness data, community posts, and settings will be permanently removed.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      disabled={processing}
                      placeholder="Type DELETE here"
                      className="w-full max-w-xs px-3 py-2 rounded-xl border border-red-300 dark:border-red-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={processing || deleteConfirmText.toUpperCase() !== 'DELETE'}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                    Permanently Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
