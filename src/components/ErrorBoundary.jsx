import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Track error count to detect error loops
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }))

    // Log to external service if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: true
      })
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    })
  }

  handleGoHome = () => {
    // Use proper navigation instead of window.location
    if (window.history && window.history.pushState) {
      window.history.pushState({}, '', '/')
      window.location.reload()
    } else {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      // If error keeps happening, show different message
      if (this.state.errorCount > 3) {
        return (
          <div 
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4"
            role="alert"
            aria-live="assertive"
          >
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Persistent Error
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We're experiencing technical difficulties. Please clear your browser cache and try again.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    localStorage.clear()
                    sessionStorage.clear()
                    window.location.href = '/'
                  }}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  aria-label="Clear browser cache and reload the application"
                >
                  Clear Cache & Reload
                </button>
                <a
                  href="mailto:support@templekeepers.app"
                  className="block w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-purple-600 dark:hover:border-purple-400 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                  aria-label="Contact support team for assistance"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        )
      }

      return (
        <div 
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Don't worry, your data is safe. Try refreshing the page or returning home.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left bg-red-50 dark:bg-red-900/10 p-4 rounded-lg">
                <summary className="cursor-pointer text-sm font-medium text-red-900 dark:text-red-400 mb-2">
                  Error Details
                </summary>
                <pre className="text-xs text-red-800 dark:text-red-300 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                aria-label="Try to recover from the error"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-purple-600 dark:hover:border-purple-400 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                aria-label="Go back to the home page"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
