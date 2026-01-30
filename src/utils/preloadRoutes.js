// Utility to preload routes for faster navigation
// Import this and call preloadCriticalRoutes() after initial page load

export const preloadCriticalRoutes = () => {
  // Preload most commonly accessed pages after a short delay
  setTimeout(() => {
    // Only preload if user is authenticated (has auth token)
    const hasAuth = localStorage.getItem('supabase.auth.token')
    
    if (hasAuth) {
      // Preload dashboard components
      import('../pages/Dashboard')
      import('../pages/Devotionals')
      
      // Preload after another delay to not block interactions
      setTimeout(() => {
        import('../pages/Habits')
        import('../pages/Community')
        import('../pages/Recipes')
      }, 2000)
    }
  }, 1000)
}

// Preload on hover for specific routes
export const preloadOnHover = (routeName) => {
  const routes = {
    dashboard: () => import('../pages/Dashboard'),
    devotionals: () => import('../pages/Devotionals'),
    recipes: () => import('../pages/Recipes'),
    community: () => import('../pages/Community'),
    habits: () => import('../pages/Habits'),
    challenges: () => import('../pages/Challenges'),
    profile: () => import('../pages/Profile'),
    water: () => import('../pages/WaterTracker'),
    'meal-planner': () => import('../pages/MealPlanner'),
  }
  
  if (routes[routeName]) {
    routes[routeName]().catch(() => {
      // Silently fail if preload doesn't work
    })
  }
}
