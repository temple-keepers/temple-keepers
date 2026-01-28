import { useTheme } from '../../contexts/ThemeContext'
import { Link } from 'react-router-dom'
import { ArrowLeft, Cookie } from 'lucide-react'

const Cookies = () => {
  const { isDark } = useTheme()
  
  const lastUpdated = "January 28, 2026"
  const companyName = "Sagacity Network LtdTemple Keepers"
  const companyEmail = "privacy@templekeepers.com"

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Link */}
        <Link 
          to="/" 
          className={`inline-flex items-center gap-2 mb-8 ${
            isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-amber-500/20' : 'bg-amber-500/10'
          }`}>
            <Cookie className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Cookie Policy
            </h1>
            <p className="text-gray-500">Last updated: {lastUpdated}</p>
          </div>
        </div>

        {/* Content */}
        <div className={`rounded-2xl p-8 space-y-8 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          
          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              What Are Cookies?
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              How We Use Cookies
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              {companyName} uses cookies for the following purposes:
            </p>
            
            <div className="mt-4 space-y-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  🔐 Essential Cookies (Strictly Necessary)
                </h3>
                <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  These cookies are required for the website to function. They enable basic features like authentication, security, and remembering your login status.
                </p>
                <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <strong>Cannot be disabled</strong> | Expires: Session or 7 days
                </p>
              </div>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  ⚙️ Functional Cookies (Preferences)
                </h3>
                <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  These cookies remember your preferences, such as your theme choice (dark/light mode), language settings, and other customizations.
                </p>
                <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <strong>Can be disabled</strong> | Expires: 1 year
                </p>
              </div>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  📊 Analytics Cookies (Performance)
                </h3>
                <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  These cookies help us understand how visitors interact with our website by collecting anonymous information about page visits and feature usage.
                </p>
                <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <strong>Can be disabled</strong> | Expires: 2 years
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Specific Cookies We Use
            </h2>
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <thead>
                  <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                    <th className="text-left py-3 px-2 font-medium">Cookie Name</th>
                    <th className="text-left py-3 px-2 font-medium">Purpose</th>
                    <th className="text-left py-3 px-2 font-medium">Type</th>
                    <th className="text-left py-3 px-2 font-medium">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                    <td className="py-3 px-2">sb-access-token</td>
                    <td className="py-3 px-2">Authentication session</td>
                    <td className="py-3 px-2">Essential</td>
                    <td className="py-3 px-2">Session</td>
                  </tr>
                  <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                    <td className="py-3 px-2">sb-refresh-token</td>
                    <td className="py-3 px-2">Keep you logged in</td>
                    <td className="py-3 px-2">Essential</td>
                    <td className="py-3 px-2">7 days</td>
                  </tr>
                  <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                    <td className="py-3 px-2">theme</td>
                    <td className="py-3 px-2">Dark/light mode preference</td>
                    <td className="py-3 px-2">Functional</td>
                    <td className="py-3 px-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Third-Party Cookies
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Some cookies may be set by third-party services we use:
            </p>
            <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li><strong>Supabase:</strong> Authentication and session management</li>
              <li><strong>Google:</strong> AI content generation (no tracking cookies)</li>
            </ul>
            <p className={`mt-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              We do NOT use advertising or marketing cookies.
            </p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Managing Cookies
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              You can control and manage cookies in several ways:
            </p>
            <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies through their settings</li>
              <li><strong>Our Cookie Preferences:</strong> Use our cookie consent banner to manage your preferences</li>
            </ul>
            <p className={`mt-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Note: Disabling essential cookies will prevent you from using the Service, as they are required for authentication and basic functionality.
            </p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Contact Us
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              If you have questions about our use of cookies, contact us at {companyEmail}.
            </p>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link to="/terms" className="text-temple-purple hover:underline">Terms of Service</Link>
          <span className="text-gray-400">•</span>
          <Link to="/privacy" className="text-temple-purple hover:underline">Privacy Policy</Link>
          <span className="text-gray-400">•</span>
          <Link to="/disclaimer" className="text-temple-purple hover:underline">Health Disclaimer</Link>
        </div>
      </div>
    </div>
  )
}

export default Cookies