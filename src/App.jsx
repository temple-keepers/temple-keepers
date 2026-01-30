import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext-minimal'
import { ThemeProvider } from './contexts/ThemeContext'
import { AdminProvider } from './contexts/AdminContext'
import { ToastProvider } from './contexts/ToastContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { SecurityProvider } from './contexts/SecurityContext'
import { getNetworkStatus, onNetworkChange } from './lib/apiHelpers'
import { useMobileLifecycle } from './hooks/useMobileLifecycle'

// Import critical components immediately (needed for initial render)
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import CookieConsent from './components/CookieConsent'
import InstallPWA from './components/InstallPWA'
import UpdatePrompt from './components/UpdatePrompt'
import ErrorBoundary from './components/ErrorBoundary'
import { preloadComponent } from './utils/lazyLoading'
import { PreloadManager } from './utils/preloadManager.jsx'

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login-simple'))
const Signup = lazy(() => import('./pages/Signup'))
const Landing = lazy(() => import('./pages/Landing'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Devotionals = lazy(() => import('./pages/Devotionals'))
const Recipes = lazy(() => import('./pages/Recipes'))
const RecipeLibrary = lazy(() => import('./pages/RecipeLibrary'))
const Profile = lazy(() => import('./pages/Profile'))
const WaterTracker = lazy(() => import('./pages/WaterTracker'))
const MealPlanner = lazy(() => import('./pages/MealPlanner'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const NotFound = lazy(() => import('./pages/NotFound'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Pricing = lazy(() => import('./pages/Pricing'))
const BillingSuccess = lazy(() => import('./pages/BillingSuccess'))
const BillingCanceled = lazy(() => import('./pages/BillingCanceled'))
const Roadmap = lazy(() => import('./pages/Roadmap'))
const Challenges = lazy(() => import('./pages/Challenges'))
const ChallengeDetail = lazy(() => import('./pages/ChallengeDetail'))
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'))
const AllNotifications = lazy(() => import('./pages/AllNotifications'))
const Habits = lazy(() => import('./pages/Habits'))
const HabitCreate = lazy(() => import('./pages/HabitCreate'))
const HabitDetail = lazy(() => import('./pages/HabitDetail'))
const Goals = lazy(() => import('./pages/Goals'))
const WeeklyReview = lazy(() => import('./pages/WeeklyReview'))
const IdentityStatement = lazy(() => import('./pages/IdentityStatement'))
const DailyLog = lazy(() => import('./pages/DailyLog'))

// Lazy load community pages (less frequently accessed)
const Community = lazy(() => import('./pages/Community'))
const PodDetail = lazy(() => import('./pages/PodDetail'))
const MembersDirectory = lazy(() => import('./pages/MembersDirectory'))

// Lazy load community sub-components (only load when needed)
const PrayerWallTab = lazy(() => import('./components/community/PrayerWallTab'))
const PodsTab = lazy(() => import('./components/community/PodsTab'))
const LeaderboardTab = lazy(() => import('./components/community/LeaderboardTab'))

// Lazy load legal pages (rarely accessed)
const Terms = lazy(() => import('./pages/legal/Terms'))
const Privacy = lazy(() => import('./pages/legal/Privacy'))
const Cookies = lazy(() => import('./pages/legal/Cookies'))
const Disclaimer = lazy(() => import('./pages/legal/Disclaimer'))

// Lazy load admin pages (only for admins)
const AdminRoute = lazy(() => import('./components/admin/AdminRoute'))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminRecipes = lazy(() => import('./pages/admin/AdminRecipes'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminDebug = lazy(() => import('./pages/admin/AdminDebug'))
const AdminChallenges = lazy(() => import('./pages/admin/AdminChallenges'))
const AdminChallengeEditor = lazy(() => import('./pages/admin/AdminChallengeEditor'))

// Offline banner component
const OfflineBanner = () => (
  <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
    <span className="inline-flex items-center gap-2">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
      </svg>
      You're offline. Some features may not work.
    </span>
  </div>
)

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-amber-50 dark:from-temple-dark dark:via-temple-dark-surface dark:to-[#251a30] flex items-center justify-center">
    <div className="text-center">
      <div className="spinner mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
)

// Public route wrapper - redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Landing Page - Public */}
      <Route path="/" element={<Suspense fallback={<PageLoader />}><Landing /></Suspense>} />
      
      {/* Auth Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } 
      />
      <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />
      <Route path="/verify-email" element={<Suspense fallback={<PageLoader />}><VerifyEmail /></Suspense>} />

      {/* Onboarding */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Onboarding />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Core Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/devotionals"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Devotionals />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipes"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Recipes />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipe-library"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <RecipeLibrary />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Profile />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/water"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <WaterTracker />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/daily-log"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <DailyLog />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/meal-planner"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <MealPlanner />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Challenges */}
      <Route
        path="/challenges"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Challenges />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/challenges/:slug"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <ChallengeDetail />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Habits & Goals */}
      <Route path="/habits" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><Habits /></Suspense></Layout></ProtectedRoute>} />
      <Route path="/habits/new" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><HabitCreate /></Suspense></Layout></ProtectedRoute>} />
      <Route path="/habits/:habitId" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><HabitDetail /></Suspense></Layout></ProtectedRoute>} />
      <Route path="/habits/review" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><WeeklyReview /></Suspense></Layout></ProtectedRoute>} />
      <Route path="/habits/identity" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><IdentityStatement /></Suspense></Layout></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><Layout><Suspense fallback={<PageLoader />}><Goals /></Suspense></Layout></ProtectedRoute>} />

      {/* Community */}
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Community />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/community/pods/:podId"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <PodDetail />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/members"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <MembersDirectory />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Notifications */}
      <Route
        path="/settings/notifications"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <NotificationSettings />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <AllNotifications />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute></Suspense>} />
      <Route path="/admin/users" element={<Suspense fallback={<PageLoader />}><AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute></Suspense>} />
      <Route path="/admin/recipes" element={<Suspense fallback={<PageLoader />}><AdminRoute><AdminLayout><AdminRecipes /></AdminLayout></AdminRoute></Suspense>} />
      <Route path="/admin/analytics" element={<Suspense fallback={<PageLoader />}><AdminRoute><AdminLayout><AdminAnalytics /></AdminLayout></AdminRoute></Suspense>} />
      <Route path="/admin/settings" element={<Suspense fallback={<PageLoader />}><AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute></Suspense>} />
      <Route path="/admin/debug" element={<Suspense fallback={<PageLoader />}><AdminRoute><AdminLayout><AdminDebug /></AdminLayout></AdminRoute></Suspense>} />
      <Route path="/admin/challenges" element={<Suspense fallback={<PageLoader />}><AdminRoute><AdminLayout><AdminChallenges /></AdminLayout></AdminRoute></Suspense>} />
      <Route path="/admin/challenges/:id" element={<Suspense fallback={<PageLoader />}><AdminRoute><AdminLayout><AdminChallengeEditor /></AdminLayout></AdminRoute></Suspense>} />

      {/* Legal Pages */}
      <Route path="/terms" element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />
      <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><Privacy /></Suspense>} />
      <Route path="/cookies" element={<Suspense fallback={<PageLoader />}><Cookies /></Suspense>} />
      <Route path="/disclaimer" element={<Suspense fallback={<PageLoader />}><Disclaimer /></Suspense>} />

      {/* Pricing & Billing */}
      <Route path="/pricing" element={<Suspense fallback={<PageLoader />}><Pricing /></Suspense>} />
      <Route path="/billing/success" element={<Suspense fallback={<PageLoader />}><BillingSuccess /></Suspense>} />
      <Route path="/billing/canceled" element={<Suspense fallback={<PageLoader />}><BillingCanceled /></Suspense>} />
      
      {/* Roadmap */}
      <Route path="/roadmap" element={<Suspense fallback={<PageLoader />}><Roadmap /></Suspense>} />

      {/* 404 */}
      <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
    </Routes>
  )
}

function App() {
  const [isOffline, setIsOffline] = useState(!getNetworkStatus())
  const { isAppActive, isMobile, platform, isPWA } = useMobileLifecycle()

  useEffect(() => {
    // Initialize smart preloading
    const preloadManager = new PreloadManager()
    
    // Set up network monitoring  
    const unsubscribe = onNetworkChange((online) => {
      setIsOffline(!online)
      if (online && isMobile) {
        console.log('📡 Connection restored on mobile')
        // Trigger any pending offline queue processing
        window.dispatchEvent(new Event('online'))
      }
    })
    
    // Preload critical routes after initial load
    const timer = setTimeout(() => {
      preloadManager.preloadCriticalRoutes()
    }, 2000) // Wait 2s after app load
    
    return () => {
      unsubscribe()
      clearTimeout(timer)
    }
  }, [isMobile])

  // Log platform info
  useEffect(() => {
    if (isMobile) {
      console.log(`📱 Mobile platform: ${platform}, PWA: ${isPWA}`)
    }
  }, [isMobile, platform, isPWA])

  return (
    <ErrorBoundary>
      <Router future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <SecurityProvider>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <SubscriptionProvider>
                  <NotificationProvider>
                    <AdminProvider>
                      {isOffline && <OfflineBanner />}
                      <AppRoutes />
                      <CookieConsent />
                      <InstallPWA />
                      <UpdatePrompt />
                    </AdminProvider>
                  </NotificationProvider>
                </SubscriptionProvider>
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </SecurityProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
