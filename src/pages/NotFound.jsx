import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { Home, ArrowLeft, Search, Sparkles } from 'lucide-react'

const NotFound = () => {
  const { isDark } = useTheme()

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-temple-dark to-gray-900' 
        : 'bg-gradient-to-br from-purple-50 via-white to-amber-50'
    }`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl ${
          isDark ? 'bg-temple-purple/10' : 'bg-temple-purple/20'
        }`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl ${
          isDark ? 'bg-temple-gold/10' : 'bg-temple-gold/20'
        }`} />
      </div>

      <div className="text-center relative z-10 max-w-md">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-[150px] font-display font-bold leading-none bg-gradient-to-r from-temple-purple to-temple-gold bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Message */}
        <h2 className={`text-2xl font-display font-bold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Page Not Found
        </h2>
        <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Oops! It seems this page has wandered off the path. 
          Let's get you back to nourishing your temple.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className={`px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
              isDark 
                ? 'bg-white/10 text-white hover:bg-white/20' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-all`}
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className={`mt-12 p-6 rounded-2xl ${
          isDark ? 'bg-gray-800/50' : 'bg-white/50'
        } backdrop-blur-sm`}>
          <p className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Maybe you were looking for:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link to="/dashboard" className={`px-4 py-2 rounded-lg text-sm ${
              isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } transition-colors`}>
              Dashboard
            </Link>
            <Link to="/recipes" className={`px-4 py-2 rounded-lg text-sm ${
              isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } transition-colors`}>
              Recipes
            </Link>
            <Link to="/devotionals" className={`px-4 py-2 rounded-lg text-sm ${
              isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } transition-colors`}>
              Devotionals
            </Link>
            <Link to="/profile" className={`px-4 py-2 rounded-lg text-sm ${
              isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } transition-colors`}>
              Profile
            </Link>
          </div>
        </div>

        {/* Fun message */}
        <p className={`mt-8 text-sm flex items-center justify-center gap-2 ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}>
          <Sparkles className="w-4 h-4" />
          Even lost pages can find their way back
        </p>
      </div>
    </div>
  )
}

export default NotFound