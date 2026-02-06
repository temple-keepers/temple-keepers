import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AdminProvider } from './contexts/AdminContext'
import { Toaster } from 'react-hot-toast'
import { LoadingSpinner } from './components/LoadingSpinner'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Today } from './pages/Today'
import { Profile } from './pages/Profile'
import { Programs } from './pages/Programs'
import { ProgramDetail } from './pages/ProgramDetail'
import { ProgramDay } from './pages/ProgramDay'
import { Recipes } from './pages/Recipes'
import { Wellness as WellnessHub } from './pages/WellnessHub'

import { WellnessCheckIn } from './pages/WellnessCheckIn'
import { WellnessMealLog } from './pages/WellnessMealLog'
import { WellnessSymptomLog } from './pages/WellnessSymptomLog'
import { RecipeDetail } from './pages/RecipeDetail'
import { RecipeGenerator } from './pages/RecipeGenerator'
import { MealPlans } from './pages/MealPlans'
import { MealPlanBuilder } from './pages/MealPlanBuilder'
import { ShoppingList } from './pages/ShoppingList'
import { Roadmap } from './pages/Roadmap'
import { AboutDenise } from './pages/AboutDenise'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import { Cookies } from './pages/Cookies'
import { AdminLayout } from './components/admin/AdminLayout'
import { AdminDashboard } from './pages/admin/Dashboard'
import { AdminPrograms } from './pages/admin/Programs'
import { ProgramBuilder } from './pages/admin/ProgramBuilder'
import { DayEditor } from './pages/admin/DayEditor'
import { AdminRecipes } from './pages/admin/Recipes'
import { AdminThemes } from './pages/admin/Themes'
import { AdminUsers } from './pages/admin/Users'
import { AdminEnrollments } from './pages/admin/Enrollments'
import { AdminSettings } from './pages/admin/Settings'

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Public Route wrapper (redirect to /today if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (user) {
    return <Navigate to="/today" replace />
  }
  
  return children
}

// Admin Route wrapper
const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Not admin
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need admin privileges to access this area.
          </p>
          <a href="/today" className="btn-primary inline-block">
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Landing & legal pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/about" element={<Landing />} />
      <Route path="/about-denise" element={<AboutDenise />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/cookies" element={<Cookies />} />
      
      {/* Auth routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/signup" element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      } />
      
      {/* Protected routes */}
      <Route path="/today" element={
        <ProtectedRoute>
          <Today />
        </ProtectedRoute>
      } />
      
      <Route path="/wellness" element={
        <ProtectedRoute>
          <WellnessHub />
        </ProtectedRoute>
      } />


      <Route path="/wellness/check-in" element={
        <ProtectedRoute>
          <WellnessCheckIn />
        </ProtectedRoute>
      } />

      <Route path="/wellness/meals/new" element={
        <ProtectedRoute>
          <WellnessMealLog />
        </ProtectedRoute>
      } />

      <Route path="/wellness/symptoms/new" element={
        <ProtectedRoute>
          <WellnessSymptomLog />
        </ProtectedRoute>
      } />
            
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* User program routes */}
      <Route path="/programs" element={
        <ProtectedRoute>
          <Programs />
        </ProtectedRoute>
      } />
      
      <Route path="/programs/:slug" element={
        <ProtectedRoute>
          <ProgramDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/programs/:slug/day/:dayNumber" element={
        <ProtectedRoute>
          <ProgramDay />
        </ProtectedRoute>
      } />
      
      {/* Recipe routes */}
      <Route path="/recipes" element={
        <ProtectedRoute>
          <Recipes />
        </ProtectedRoute>
      } />
      
      <Route path="/recipes/generate" element={
        <ProtectedRoute>
          <RecipeGenerator />
        </ProtectedRoute>
      } />
      
      <Route path="/recipes/:id" element={
        <ProtectedRoute>
          <RecipeDetail />
        </ProtectedRoute>
      } />
      
      {/* Meal Plan routes */}
      <Route path="/meal-plans" element={
        <ProtectedRoute>
          <MealPlans />
        </ProtectedRoute>
      } />
      
      <Route path="/meal-plans/:id" element={
        <ProtectedRoute>
          <MealPlanBuilder />
        </ProtectedRoute>
      } />
      
      <Route path="/shopping-list/:planId" element={
        <ProtectedRoute>
          <ShoppingList />
        </ProtectedRoute>
      } />
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="programs" element={<AdminPrograms />} />
        <Route path="programs/new" element={<ProgramBuilder />} />
        <Route path="programs/:id/edit" element={<ProgramBuilder />} />
        <Route path="programs/:programId/days" element={<DayEditor />} />
        <Route path="recipes" element={<AdminRecipes />} />
        <Route path="themes" element={<AdminThemes />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="enrollments" element={<AdminEnrollments />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/today" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AdminProvider>
            <Toaster position="top-center" />
            <AppRoutes />
          </AdminProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
