import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Devotionals from './pages/Devotionals'
import Recipes from './pages/Recipes'
import RecipeLibrary from './pages/RecipeLibrary'
import Profile from './pages/Profile'
import { ThemeProvider } from './contexts/ThemeContext'
import { AdminProvider } from './contexts/AdminContext'
import { ToastProvider } from './contexts/ToastContext'
import AdminRoute from './components/admin/AdminRoute'
import AdminLayout from './components/admin/AdminLayout'
import WaterTracker from './pages/WaterTracker'
import MealPlanner from './pages/MealPlanner'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminRecipes from './pages/admin/AdminRecipes'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminSettings from './pages/admin/AdminSettings'
import AdminDebug from './pages/admin/AdminDebug'

import Terms from './pages/legal/Terms'
import Privacy from './pages/legal/Privacy'
import Cookies from './pages/legal/Cookies'
import Disclaimer from './pages/legal/Disclaimer'
import CookieConsent from './components/CookieConsent'

// Add imports
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Landing from './pages/Landing'
import NotFound from './pages/NotFound'
import VerifyEmail from './pages/VerifyEmail'
import Onboarding from './pages/Onboarding'

import { SubscriptionProvider } from './contexts/SubscriptionContext'
import Pricing from './pages/Pricing'
import BillingSuccess from './pages/BillingSuccess'
import BillingCanceled from './pages/BillingCanceled'
import Roadmap from './pages/Roadmap'
import Challenges from './pages/Challenges'
import ChallengeDetail from './pages/ChallengeDetail'
import InstallPWA from './components/InstallPWA'
import UpdatePrompt from './components/UpdatePrompt'
import AdminChallenges from './pages/admin/AdminChallenges'
import AdminChallengeEditor from './pages/admin/AdminChallengeEditor'
import Community from './pages/Community'
import PodDetail from './pages/PodDetail'
import MembersDirectory from './pages/MembersDirectory'

// Public route wrapper - redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-amber-50 dark:from-temple-dark dark:via-temple-dark-surface dark:to-[#251a30] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
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

<Route path="/roadmap" element={<Roadmap />} />
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/devotionals"
        element={
          <ProtectedRoute>
            <Layout>
              <Devotionals />
            </Layout>
          </ProtectedRoute>
        }
      />

<Route path="/admin/challenges" element={<AdminRoute><AdminLayout><AdminChallenges /></AdminLayout></AdminRoute>} />
<Route path="/admin/challenges/:id" element={<AdminRoute><AdminLayout><AdminChallengeEditor /></AdminLayout></AdminRoute>} />

<Route
  path="/challenges"
  element={
    <ProtectedRoute>
      <Layout>
        <Challenges />
      </Layout>
    </ProtectedRoute>
  }
/>
<Route
  path="/challenges/:slug"
  element={
    <ProtectedRoute>
      <Layout>
        <ChallengeDetail />
      </Layout>
    </ProtectedRoute>
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
<Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/recipes"
        element={
          <ProtectedRoute>
            <Layout>
              <Recipes />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipe-library"
        element={
          <ProtectedRoute>
            <Layout>
              <RecipeLibrary />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />

<Route
  path="/water"
  element={
    <ProtectedRoute>
      <Layout>
        <WaterTracker />
      </Layout>
    </ProtectedRoute>
  }
/>
<Route
  path="/meal-planner"
  element={
    <ProtectedRoute>
      <Layout>
        <MealPlanner />
      </Layout>
    </ProtectedRoute>
  }
/>
      {/* Admin Debug (no auth required to debug) */}
      <Route 
        path="/admin/debug" 
        element={
          <ProtectedRoute>
            <AdminDebug />
          </ProtectedRoute>
        } 
      />

      <Route
  path="/community"
  element={
    <ProtectedRoute>
      <Layout>
        <Community />
      </Layout>
    </ProtectedRoute>
  }
/>
<Route
  path="/community/pods/:podId"
  element={
    <ProtectedRoute>
      <Layout>
        <PodDetail />
      </Layout>
    </ProtectedRoute>
  }
/>
<Route
  path="/members"
  element={
    <ProtectedRoute>
      <Layout>
        <MembersDirectory />
      </Layout>
    </ProtectedRoute>
  }
/>

{/* Landing Page - Public, always accessible */}
<Route path="/" element={<Landing />} />

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
{/* Verify Email */}
<Route path="/verify-email" element={<VerifyEmail />} />

{/* Onboarding */}
<Route
  path="/onboarding"
  element={
    <ProtectedRoute>
      <Onboarding />
    </ProtectedRoute>
  }
/>

{/* 404 - Must be LAST */}
<Route path="*" element={<NotFound />} />

{/* Remove the old default redirect that went to /dashboard */}
{/* Instead of: <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
      <Route path="/admin/recipes" element={<AdminRoute><AdminLayout><AdminRecipes /></AdminLayout></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><AdminLayout><AdminAnalytics /></AdminLayout></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />

      {/* Legal Pages - Public */}
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/disclaimer" element={<Disclaimer />} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

      <Route path="/pricing" element={<Pricing />} />
<Route path="/billing/success" element={<BillingSuccess />} />
<Route path="/billing/canceled" element={<BillingCanceled />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <AdminProvider>
                <AppRoutes />
                <CookieConsent />
                <InstallPWA />
                <UpdatePrompt />
              </AdminProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
