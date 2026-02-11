import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AdminProvider } from './contexts/AdminContext'
import { Toaster } from 'react-hot-toast'
import { LoadingSpinner } from './components/LoadingSpinner'
import { InstallBanner } from './components/InstallBanner'
import { UpdateBanner } from './components/UpdateBanner'
import { ConfirmProvider } from './components/ConfirmModal'
import { PinLockScreen } from './components/PinLockScreen'
import { CookieConsent } from './components/CookieConsent'

// ─── Eager loads (critical path — Landing, Auth, Today) ──────────
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Today } from './pages/Today'

// ─── Lazy loads (everything else) ────────────────────────────────
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })))
const Programs = lazy(() => import('./pages/Programs').then(m => ({ default: m.Programs })))
const ProgramDetail = lazy(() => import('./pages/ProgramDetail').then(m => ({ default: m.ProgramDetail })))
const ProgramDay = lazy(() => import('./pages/ProgramDay').then(m => ({ default: m.ProgramDay })))
const Recipes = lazy(() => import('./pages/Recipes').then(m => ({ default: m.Recipes })))
const RecipeDetail = lazy(() => import('./pages/RecipeDetail').then(m => ({ default: m.RecipeDetail })))
const RecipeGenerator = lazy(() => import('./pages/RecipeGenerator').then(m => ({ default: m.RecipeGenerator })))
const MealPlans = lazy(() => import('./pages/MealPlans').then(m => ({ default: m.MealPlans })))
const MealPlanBuilder = lazy(() => import('./pages/MealPlanBuilder').then(m => ({ default: m.MealPlanBuilder })))
const ShoppingList = lazy(() => import('./pages/ShoppingList').then(m => ({ default: m.ShoppingList })))
const Pantry = lazy(() => import('./pages/Pantry').then(m => ({ default: m.Pantry })))
const WellnessHub = lazy(() => import('./pages/WellnessHub').then(m => ({ default: m.Wellness })))
const WellnessCheckIn = lazy(() => import('./pages/WellnessCheckIn').then(m => ({ default: m.WellnessCheckIn })))
const WellnessMealLog = lazy(() => import('./pages/WellnessMealLog').then(m => ({ default: m.WellnessMealLog })))
const WellnessSymptomLog = lazy(() => import('./pages/WellnessSymptomLog').then(m => ({ default: m.WellnessSymptomLog })))
const Pods = lazy(() => import('./pages/Pods').then(m => ({ default: m.Pods })))
const PodDetail = lazy(() => import('./pages/PodDetail').then(m => ({ default: m.PodDetail })))
const NotificationSettings = lazy(() => import('./pages/NotificationSettings').then(m => ({ default: m.NotificationSettings })))
const Roadmap = lazy(() => import('./pages/Roadmap').then(m => ({ default: m.Roadmap })))
const AboutDenise = lazy(() => import('./pages/AboutDenise').then(m => ({ default: m.AboutDenise })))
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })))
const Terms = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })))
const Cookies = lazy(() => import('./pages/Cookies').then(m => ({ default: m.Cookies })))
const Achievements = lazy(() => import('./pages/Achievements').then(m => ({ default: m.Achievements })))
const Shop = lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop })))
const ShopProduct = lazy(() => import('./pages/ShopProduct').then(m => ({ default: m.ShopProduct })))
const ShopSuccess = lazy(() => import('./pages/ShopSuccess').then(m => ({ default: m.ShopSuccess })))
const ShopLibrary = lazy(() => import('./pages/ShopLibrary').then(m => ({ default: m.ShopLibrary })))
const ShopOrders = lazy(() => import('./pages/ShopOrders').then(m => ({ default: m.ShopOrders })))

// Admin — lazy loaded as a group (only admins ever need these)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })))
const AdminPrograms = lazy(() => import('./pages/admin/Programs').then(m => ({ default: m.AdminPrograms })))
const ProgramBuilder = lazy(() => import('./pages/admin/ProgramBuilder').then(m => ({ default: m.ProgramBuilder })))
const DayEditor = lazy(() => import('./pages/admin/DayEditor').then(m => ({ default: m.DayEditor })))
const AdminRecipes = lazy(() => import('./pages/admin/Recipes').then(m => ({ default: m.AdminRecipes })))
const AdminThemes = lazy(() => import('./pages/admin/Themes').then(m => ({ default: m.AdminThemes })))
const AdminUsers = lazy(() => import('./pages/admin/Users').then(m => ({ default: m.AdminUsers })))
const AdminEnrollments = lazy(() => import('./pages/admin/Enrollments').then(m => ({ default: m.AdminEnrollments })))
const AdminSettings = lazy(() => import('./pages/admin/Settings').then(m => ({ default: m.AdminSettings })))
const AdminPods = lazy(() => import('./pages/admin/Pods').then(m => ({ default: m.AdminPods })))
const AdminShop = lazy(() => import('./pages/admin/Shop').then(m => ({ default: m.AdminShop })))
const AdminAnnouncements = lazy(() => import('./pages/admin/Announcements').then(m => ({ default: m.AdminAnnouncements })))

// ─── Page loading fallback ───────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="spinner w-8 h-8 mx-auto mb-3"></div>
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
  </div>
)

// ─── Route wrappers ──────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading, pinLocked, unlockPin, signOut } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (pinLocked) {
    return (
      <PinLockScreen
        onUnlock={unlockPin}
        onUsePassword={async () => {
          await signOut()
          window.location.href = '/login'
        }}
      />
    )
  }
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (user) return <Navigate to="/today" replace />
  return children
}

const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You need admin privileges to access this area.</p>
          <a href="/today" className="btn-primary inline-block">Go to Dashboard</a>
        </div>
      </div>
    )
  }
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Landing & legal (lazy except landing) */}
      <Route path="/" element={<Landing />} />
      <Route path="/roadmap" element={<Suspense fallback={<PageLoader />}><Roadmap /></Suspense>} />
      <Route path="/about" element={<Landing />} />
      <Route path="/about-denise" element={<Suspense fallback={<PageLoader />}><AboutDenise /></Suspense>} />
      <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><Privacy /></Suspense>} />
      <Route path="/terms" element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />
      <Route path="/cookies" element={<Suspense fallback={<PageLoader />}><Cookies /></Suspense>} />

      {/* Auth */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Core — Today is eager loaded for fastest first paint */}
      <Route path="/today" element={<ProtectedRoute><Today /></ProtectedRoute>} />

      {/* Programs */}
      <Route path="/programs" element={<ProtectedRoute><Programs /></ProtectedRoute>} />
      <Route path="/programs/:slug" element={<ProtectedRoute><ProgramDetail /></ProtectedRoute>} />
      <Route path="/programs/:slug/day/:dayNumber" element={<ProtectedRoute><ProgramDay /></ProtectedRoute>} />

      {/* Recipes */}
      <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
      <Route path="/recipes/generate" element={<ProtectedRoute><RecipeGenerator /></ProtectedRoute>} />
      <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />

      {/* Meal Plans */}
      <Route path="/meal-plans" element={<ProtectedRoute><MealPlans /></ProtectedRoute>} />
      <Route path="/meal-plans/:id" element={<ProtectedRoute><MealPlanBuilder /></ProtectedRoute>} />
      <Route path="/shopping-list/:planId" element={<ProtectedRoute><ShoppingList /></ProtectedRoute>} />
      <Route path="/pantry" element={<ProtectedRoute><Pantry /></ProtectedRoute>} />

      {/* Wellness */}
      <Route path="/wellness" element={<ProtectedRoute><WellnessHub /></ProtectedRoute>} />
      <Route path="/wellness/check-in" element={<ProtectedRoute><WellnessCheckIn /></ProtectedRoute>} />
      <Route path="/wellness/meals/new" element={<ProtectedRoute><WellnessMealLog /></ProtectedRoute>} />
      <Route path="/wellness/symptoms/new" element={<ProtectedRoute><WellnessSymptomLog /></ProtectedRoute>} />

      {/* Profile & Settings */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
      <Route path="/notification-settings" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
      <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />

      {/* Community */}
      <Route path="/pods" element={<ProtectedRoute><Pods /></ProtectedRoute>} />
      <Route path="/pods/:id" element={<ProtectedRoute><PodDetail /></ProtectedRoute>} />

      {/* Shop */}
      <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
      <Route path="/shop/library" element={<ProtectedRoute><ShopLibrary /></ProtectedRoute>} />
      <Route path="/shop/orders" element={<ProtectedRoute><ShopOrders /></ProtectedRoute>} />
      <Route path="/shop/success" element={<ProtectedRoute><ShopSuccess /></ProtectedRoute>} />
      <Route path="/shop/:slug" element={<ProtectedRoute><ShopProduct /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
        <Route path="programs" element={<Suspense fallback={<PageLoader />}><AdminPrograms /></Suspense>} />
        <Route path="programs/new" element={<Suspense fallback={<PageLoader />}><ProgramBuilder /></Suspense>} />
        <Route path="programs/:id/edit" element={<Suspense fallback={<PageLoader />}><ProgramBuilder /></Suspense>} />
        <Route path="programs/:programId/days" element={<Suspense fallback={<PageLoader />}><DayEditor /></Suspense>} />
        <Route path="recipes" element={<Suspense fallback={<PageLoader />}><AdminRecipes /></Suspense>} />
        <Route path="themes" element={<Suspense fallback={<PageLoader />}><AdminThemes /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<PageLoader />}><AdminUsers /></Suspense>} />
        <Route path="enrollments" element={<Suspense fallback={<PageLoader />}><AdminEnrollments /></Suspense>} />
        <Route path="pods" element={<Suspense fallback={<PageLoader />}><AdminPods /></Suspense>} />
        <Route path="shop" element={<Suspense fallback={<PageLoader />}><AdminShop /></Suspense>} />
        <Route path="announcements" element={<Suspense fallback={<PageLoader />}><AdminAnnouncements /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<PageLoader />}><AdminSettings /></Suspense>} />
      </Route>

      {/* Default */}
      <Route path="*" element={<Navigate to="/today" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AdminProvider>
            <ConfirmProvider>
              <Toaster position="top-center" />
              <InstallBanner />
              <UpdateBanner />
              <AppRoutes />
              <CookieConsent />
            </ConfirmProvider>
          </AdminProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
