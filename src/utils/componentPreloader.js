/**
 * Component preloader for improved perceived performance
 * Preloads critical components during idle time
 */

export class ComponentPreloader {
  constructor() {
    this.preloadQueue = []
    this.preloaded = new Set()
    this.isIdle = false
    
    this.init()
  }
  
  init() {
    // Use requestIdleCallback when available, fallback to setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => this.startPreloading(), { timeout: 5000 })
    } else {
      setTimeout(() => this.startPreloading(), 2000)
    }
  }
  
  addToQueue(importFn, priority = 'normal') {
    this.preloadQueue.push({
      importFn,
      priority,
      timestamp: Date.now()
    })
    
    // Sort by priority (high first)
    this.preloadQueue.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1
      if (b.priority === 'high' && a.priority !== 'high') return 1
      return 0
    })
  }
  
  async startPreloading() {
    this.isIdle = true
    
    while (this.preloadQueue.length > 0 && this.isIdle) {
      const item = this.preloadQueue.shift()
      
      try {
        // Only preload if not already loaded
        if (!this.preloaded.has(item.importFn.toString())) {
          await item.importFn()
          this.preloaded.add(item.importFn.toString())
          
          // Add small delay between preloads to not block main thread
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } catch (error) {
        console.warn('Failed to preload component:', error)
      }
    }
  }
  
  stopPreloading() {
    this.isIdle = false
  }
  
  // Preload components that user is likely to visit
  preloadUserFlow() {
    // After login, users typically go to Dashboard → Profile → Recipes
    this.addToQueue(() => import('../pages/Dashboard'), 'high')
    this.addToQueue(() => import('../pages/Profile'), 'high')
    this.addToQueue(() => import('../pages/Recipes'), 'normal')
    this.addToQueue(() => import('../pages/WaterTracker'), 'normal')
  }
  
  // Preload based on current page
  preloadFromPage(currentPage) {
    const preloadMap = {
      'dashboard': [
        () => import('../pages/WaterTracker'),
        () => import('../pages/Devotionals'),
        () => import('../pages/Profile')
      ],
      'recipes': [
        () => import('../pages/RecipeLibrary'),
        () => import('../pages/MealPlanner')
      ],
      'profile': [
        () => import('../pages/NotificationSettings'),
        () => import('../pages/Goals')
      ]
    }
    
    const toPreload = preloadMap[currentPage] || []
    toPreload.forEach(importFn => this.addToQueue(importFn, 'normal'))
  }
}

export const componentPreloader = new ComponentPreloader()