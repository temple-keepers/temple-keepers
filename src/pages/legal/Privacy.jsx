import { useTheme } from '../../contexts/ThemeContext'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

const Privacy = () => {
  const { isDark } = useTheme()
  
  const lastUpdated = "January 28, 2026"
  const companyName = "Sagacity Network Ltd - Temple Keepers"
  const companyEmail = "privacy@templekeepers.com"
  const companyAddress = "Basildon, Essex, United Kingdom"

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
            isDark ? 'bg-green-500/20' : 'bg-green-500/10'
          }`}>
            <Shield className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Privacy Policy
            </h1>
            <p className="text-gray-500">Last updated: {lastUpdated}</p>
          </div>
        </div>

        {/* GDPR Notice */}
        <div className={`rounded-2xl p-6 mb-8 ${
          isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
        }`}>
          <p className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-800'}`}>
            🇪🇺 GDPR Compliant
          </p>
          <p className={`mt-2 text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            This Privacy Policy complies with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. We are committed to protecting your personal data and respecting your privacy rights.
          </p>
        </div>

        {/* Content */}
        <div className={`rounded-2xl p-8 space-y-8 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          
          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              1. Who We Are
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              {companyName} is operated by Denise Parris, a certified Health & Wellness Coach based in {companyAddress}. We are the data controller responsible for your personal data.
            </p>
            <p className={`mt-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              For any privacy-related questions, contact our Data Protection contact at: {companyEmail}
            </p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              2. Information We Collect
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              We collect the following types of personal data:
            </p>
            
            <h3 className={`font-medium mt-4 mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Information you provide directly:
            </h3>
            <ul className={`list-disc pl-6 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li><strong>Account Information:</strong> Name, email address, password</li>
              <li><strong>Profile Information:</strong> Health goals, dietary preferences, dietary restrictions</li>
              <li><strong>Usage Data:</strong> Recipes saved, devotionals completed, water intake logs, meal plans</li>
              <li><strong>Communication Data:</strong> Messages you send to us, feedback, support requests</li>
            </ul>

            <h3 className={`font-medium mt-4 mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Information collected automatically:
            </h3>
            <ul className={`list-disc pl-6 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
              <li><strong>Usage Information:</strong> Pages visited, features used, time spent on the app</li>
              <li><strong>Cookies:</strong> Session cookies, preference cookies (see our Cookie Policy)</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              3. Legal Basis for Processing (GDPR)
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              We process your personal data under the following legal bases:
            </p>
            <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li><strong>Contract:</strong> To provide our services to you and manage your account</li>
              <li><strong>Consent:</strong> For marketing communications (which you can withdraw at any time)</li>
              <li><strong>Legitimate Interests:</strong> To improve our services, prevent fraud, and ensure security</li>
              <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              4. How We Use Your Information
            </h2>
            <ul className={`list-disc pl-6 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>To provide and maintain our Service</li>
              <li>To personalize your experience (recipes, devotionals based on your preferences)</li>
              <li>To track your wellness progress (water intake, meal plans, streaks)</li>
              <li>To send you important updates about the Service</li>
              <li>To respond to your support requests</li>
              <li>To improve our Service based on usage patterns</li>
              <li>To detect and prevent fraud or security issues</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              5. Data Sharing and Third Parties
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              We share your data with the following third-party service providers:
            </p>
            <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li><strong>Supabase:</strong> Database and authentication services (EU data centers)</li>
              <li><strong>Google (Gemini AI):</strong> AI-powered recipe and content generation</li>
              <li><strong>Payment Processors:</strong> For subscription payments (when applicable)</li>
            </ul>
            <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              We do NOT sell your personal data to third parties. We only share data as necessary to provide our services.
            </p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              6. International Data Transfers
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Some of our service providers may process data outside the UK/EEA. When this occurs, we ensure appropriate safeguards are in place, such as:
            </p>
            <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Standard Contractual Clauses (SCCs) approved by the UK ICO</li>
              <li>Adequacy decisions for countries with equivalent data protection</li>
              <li>Data processing agreements with all third-party providers</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              7. Data Retention
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              We retain your personal data for as long as necessary to provide our services and fulfill the purposes outlined in this policy:
            </p>
            <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li><strong>Account Data:</strong> Retained while your account is active, deleted within 30 days of account deletion</li>
              <li><strong>Usage Data:</strong> Retained for up to 2 years for analytics purposes</li>
              <li><strong>Support Communications:</strong> Retained for up to 3 years</li>
              <li><strong>Legal Requirements:</strong> Some data may be retained longer if required by law</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              8. Your Rights (GDPR)
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Under UK GDPR, you have the following rights:
            </p>
            <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Right to Restriction:</strong> Request limitation of processing</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time (where consent is the legal basis)</li>
            </ul>
            <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              To exercise any of these rights, contact us at {companyEmail}. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              9. Data Security
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              We implement appropriate technical and organizational measures to protect your personal data:
            </p>
            <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Encryption of data in transit (HTTPS/TLS) and at rest</li>
              <li>Secure authentication with password hashing</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls limiting who can access your data</li>
              <li>Row Level Security (RLS) ensuring you can only access your own data</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              10. Children's Privacy
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Our Service is not intended for children under the age of 16. We do not knowingly collect personal data from children under 16. If we become aware that we have collected personal data from a child under 16, we will take steps to delete that information.
            </p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              11. Changes to This Policy
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by email and/or a prominent notice on our Service prior to the change becoming effective.
            </p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              12. Complaints
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              If you have concerns about how we handle your personal data, please contact us first at {companyEmail}. You also have the right to lodge a complaint with the UK Information Commissioner's Office (ICO):
            </p>
            <ul className={`list-none mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>🌐 Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-temple-purple hover:underline">ico.org.uk</a></li>
              <li>📞 Helpline: 0303 123 1113</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              13. Contact Us
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              For any privacy-related questions or requests:
            </p>
            <ul className={`list-none mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>📧 Email: {companyEmail}</li>
              <li>📍 Address: {companyAddress}</li>
            </ul>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link to="/terms" className="text-temple-purple hover:underline">Terms of Service</Link>
          <span className="text-gray-400">•</span>
          <Link to="/cookies" className="text-temple-purple hover:underline">Cookie Policy</Link>
          <span className="text-gray-400">•</span>
          <Link to="/disclaimer" className="text-temple-purple hover:underline">Health Disclaimer</Link>
        </div>
      </div>
    </div>
  )
}

export default Privacy