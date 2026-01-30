/**
 * Smart component preloading based on user navigation patterns
 */

class PreloadManager {
  constructor() {
    this.preloadCache = new Set()
    this.userPatterns = this.loadUserPatterns()
    this.currentRoute = window.location.pathname
    
    // Start listening to navigation
    this.setupNavigationTracking()
  }

  loadUserPatterns() {
    try {
      return JSON.parse(localStorage.getItem('user_nav_patterns') || '{}')
    } catch {
      return {}
    }
  }

  saveUserPatterns() {
    try {
      localStorage.setItem('user_nav_patterns', JSON.stringify(this.userPatterns))
    } catch {
      // Storage failed, ignore
    }
  }

  setupNavigationTracking() {
    // Track route changes
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = (...args) => {
      this.trackNavigation(args[2])
      return originalPushState.apply(history, args)
    }

    history.replaceState = (...args) => {
      this.trackNavigation(args[2])
      return originalReplaceState.apply(history, args)
    }

    // Track back/forward
    window.addEventListener('popstate', (event) => {
      this.trackNavigation(window.location.pathname)
    })
  }

  trackNavigation(newRoute) {
    if (!newRoute) return
    
    const from = this.currentRoute
    const to = newRoute
    
    // Record navigation pattern
    if (from && from !== to) {
      if (!this.userPatterns[from]) {
        this.userPatterns[from] = {}
      }
      this.userPatterns[from][to] = (this.userPatterns[from][to] || 0) + 1
      this.saveUserPatterns()
      
      // Preload likely next routes
      this.preloadLikelyRoutes(to)
    }
    
    this.currentRoute = to
  }

  preloadLikelyRoutes(currentRoute) {
    const patterns = this.userPatterns[currentRoute]
    if (!patterns) return

    // Sort by frequency and preload top 2 most likely next routes
    const sortedRoutes = Object.entries(patterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([route]) => route)

    sortedRoutes.forEach(route => {
      this.preloadRoute(route)
    })
  }

  async preloadRoute(route) {
    if (this.preloadCache.has(route)) return

    this.preloadCache.add(route)
    
    try {
      // Map routes to their lazy loaders
      const routeLoaders = {
        '/dashboard': () => import('../pages/Dashboard.jsx'),
        '/community': () => import('../pages/Community.jsx'),
        '/challenges': () => import('../pages/Challenges.jsx'),
        '/recipes': () => import('../pages/Recipes.jsx'),
        '/recipe-library': () => import('../pages/RecipeLibrary.jsx'),
        '/goals': () => import('../pages/Goals.jsx'),
        '/habits': () => import('../pages/Habits.jsx'),
        '/daily-log': () => import('../pages/DailyLog.jsx'),
        '/devotionals': () => import('../pages/Devotionals.jsx'),
        '/meal-planner': () => import('../pages/MealPlanner.jsx'),
        '/profile': () => import('../pages/Profile.jsx'),
        '/water': () => import('../pages/WaterTracker.jsx')
      }

      const loader = routeLoaders[route]
      if (loader) {
        // Preload in background
        loader().catch(() => {
          // Ignore preload errors
          this.preloadCache.delete(route)
        })
      }
    } catch {
      this.preloadCache.delete(route)
    }
  }

  // Manual preload for critical paths
  preloadCriticalRoutes() {
    // Preload most common routes
    const criticalRoutes = ['/dashboard', '/community', '/challenges']
    criticalRoutes.forEach(route => this.preloadRoute(route))
  }

  // Preload based on user actions (hover, focus)
  preloadOnHover(route) {
    // Add small delay to avoid preloading on quick hovers
    setTimeout(() => {
      this.preloadRoute(route)
    }, 200)
  }

  // Get preload recommendations for a route
  getRecommendations(route) {
    const patterns = this.userPatterns[route]
    if (!patterns) return []

    return Object.entries(patterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([route, count]) => ({ route, frequency: count }))
  }

  // Clear patterns (for testing or reset)
  clearPatterns() {
    this.userPatterns = {}
    this.saveUserPatterns()
    this.preloadCache.clear()
  }
}

// Create singleton instance
const preloadManager = new PreloadManager()

// React hook for component preloading
export const usePreloading = () => {
  const preloadOnHover = (route) => {
    preloadManager.preloadOnHover(route)
  }

  const getRecommendations = (route) => {
    return preloadManager.getRecommendations(route)
  }

  return {
    preloadOnHover,
    getRecommendations
  }
}

// Enhanced Link component with preloading
import { Link as RouterLink } from 'react-router-dom'
import { forwardRef } from 'react'

export const PreloadLink = forwardRef(({ to, children, ...props }, ref) => {
  const handleMouseEnter = () => {
    preloadManager.preloadOnHover(to)
  }

  return (
    <RouterLink
      ref={ref}
      to={to}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </RouterLink>
  )
})

PreloadLink.displayName = 'PreloadLink'

// Initialize critical preloading when app starts
if (typeof window !== 'undefined') {
  // Preload critical routes after a short delay
  setTimeout(() => {
    preloadManager.preloadCriticalRoutes()
  }, 2000)
}

export { PreloadManager }
export default preloadManager