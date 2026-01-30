import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext-minimal'
import { checkIsAdmin } from '../lib/adminSupabase'

const AdminContext = createContext({})

export const useAdmin = () => useContext(AdminContext)

export const AdminProvider = ({ children }) => {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminData, setAdminData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyAdmin = async () => {
      if (user) {
        const admin = await checkIsAdmin(user.id)
        setIsAdmin(!!admin)
        setAdminData(admin || null)
      } else {
        setIsAdmin(false)
        setAdminData(null)
      }
      setLoading(false)
    }

    verifyAdmin()
  }, [user])

  const value = {
    isAdmin,
    adminData,
    loading,
    isSuperAdmin: adminData?.role === 'super_admin',
    permissions: adminData?.permissions || {}
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}