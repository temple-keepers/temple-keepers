import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { Heart } from 'lucide-react'

const Footer = () => {
  const { isDark } = useTheme()
  const currentYear = new Date().getFullYear()

  return (
    <footer className={`border-t ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Temple Keepers" className="w-8 h-8" />
            <span className={`font-display font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Temple Keepers
            </span>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/terms" className={`hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              Terms
            </Link>
            <Link to="/privacy" className={`hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              Privacy
            </Link>
            <Link to="/cookies" className={`hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              Cookies
            </Link>
            <Link to="/disclaimer" className={`hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              Health Disclaimer
            </Link>
          </div>

          {/* Copyright */}
          <div className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <span>© {currentYear} Temple Keepers. Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>in the UK</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer