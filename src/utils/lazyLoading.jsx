import { lazy, Suspense, useState, useEffect, useRef } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'

/**
 * Higher-order component for lazy loading with error boundaries and loading states
 */
export const withLazyLoading = (importFunction, fallback = null) => {
  const LazyComponent = lazy(importFunction)

  return (props) => (
    <ErrorBoundary>
      <Suspense fallback={fallback || <LoadingSpinner variant="page" />}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

/**
 * Preload a lazy component for better UX
 */
export const preloadComponent = (importFunction) => {
  const componentImport = importFunction()
  return componentImport
}

/**
 * Lazy load with intersection observer for better performance
 */
export const withIntersectionLoading = (importFunction, options = {}) => {
  const { rootMargin = '100px', threshold = 0.1 } = options
  
  return (props) => {
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef()

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        },
        { rootMargin, threshold }
      )

      if (ref.current) {
        observer.observe(ref.current)
      }

      return () => observer.disconnect()
    }, [])

    if (!isVisible) {
      return (
        <div 
          ref={ref}
          className="min-h-[200px] flex items-center justify-center"
        >
          <LoadingSpinner variant="default" />
        </div>
      )
    }

    const LazyComponent = lazy(importFunction)
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner variant="page" />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    )
  }
}

export default withLazyLoading