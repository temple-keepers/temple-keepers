import { useTheme } from '../../contexts/ThemeContext'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

const Terms = () => {
  const { isDark } = useTheme()
  
  const lastUpdated = "January 28, 2026"
  const companyName = "Sagacity Network Ltd Temple Keepers"
  const companyEmail = "hello@templekeepers.app"
  const websiteUrl = "https://templekeepers.app"

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
            isDark ? 'bg-temple-purple/20' : 'bg-temple-purple/10'
          }`}>
            <FileText className="w-6 h-6 text-temple-purple" />
          </div>
          <div>
            <h1 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Terms of Service
            </h1>
            <p className="text-gray-500">Last updated: {lastUpdated}</p>
          </div>
        </div>

        {/* Content */}
        <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''}`}>
          <div className={`rounded-2xl p-8 space-y-8 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
            
            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                1. Agreement to Terms
              </h2>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                By accessing or using {companyName} ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p className={`mt-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                These Terms apply to all visitors, users, and others who access or use the Service. By using the Service, you represent that you are at least 18 years of age, or if you are under 18, that you have obtained parental or guardian consent to use the Service.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                2. Description of Service
              </h2>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                {companyName} is a faith-based wellness platform that provides:
              </p>
              <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>AI-generated healthy recipes with spiritual reflections</li>
                <li>Daily devotionals focused on holistic wellness</li>
                <li>Water intake tracking and hydration reminders</li>
                <li>Meal planning tools</li>
                <li>Personal wellness progress tracking</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                3. User Accounts
              </h2>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
              </p>
              <p className={`mt-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                4. Health Disclaimer
              </h2>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                <p className={`font-medium ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                  ⚠️ Important Health Notice
                </p>
                <p className={`mt-2 ${isDark ? 'text-amber-200' : 'text-amber-700'}`}>
                  The content provided through {companyName} is for informational and educational purposes only. It is NOT intended as a substitute for professional medical advice, diagnosis, or treatment.
                </p>
              </div>
              <ul className={`list-disc pl-6 mt-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition</li>
                <li>Never disregard professional medical advice or delay in seeking it because of something you have read on {companyName}</li>
                <li>If you think you may have a medical emergency, call your doctor or emergency services immediately</li>
                <li>AI-generated recipes may contain ingredients that could cause allergic reactions - always check ingredients carefully</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                5. AI-Generated Content
              </h2>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Our Service uses artificial intelligence (AI) to generate recipes, devotionals, and wellness content. By using the Service, you acknowledge and agree that:
              </p>
              <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>AI-generated content may not always be accurate, complete, or suitable for your specific circumstances</li>
                <li>You are responsible for verifying any information before acting on it</li>
                <li>Nutritional information provided is estimated and may vary</li>
                <li>We do not guarantee the theological accuracy of AI-generated devotional content</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                6. Subscription and Payments
              </h2>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Some features of the Service may require a paid subscription. By subscribing:
              </p>
              <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>You agree to pay all fees associated with your chosen subscription plan</li>
                <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
                <li>You can cancel your subscription at any time through your account settings</li>
                <li>Refunds are provided in accordance with our refund policy and applicable consumer protection laws</li>
                <li>We reserve the right to change subscription prices with 30 days' notice</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                7. Acceptable Use
              </h2>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                You agree NOT to use the Service to:
              </p>
              <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Transmit harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Use automated means to access the Service without permission</li>
                <li>Collect user information without consent</li>
                <li>Impersonate another person or entity</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                8. Intellectual Property
              </h2>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                The Service and its original content (excluding user-generated content), features, and functionality are and will remain the exclusive property of {companyName} and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>
              <p className={`mt-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                You retain ownership of any content you create or upload to the Service, but grant us a license to use, store, and display that content as necessary to provide the Service.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                9. Limitation of Liability
              </h2>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                To the maximum extent permitted by applicable law, {companyName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>Your access to or use of or inability to access or use the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                10. Termination
              </h2>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
              <p className={`mt-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                You may delete your account at any time through your account settings or by contacting us at {companyEmail}.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                11. Governing Law
              </h2>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                These Terms shall be governed and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                12. Changes to Terms
              </h2>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                13. Contact Us
              </h2>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                If you have any questions about these Terms, please contact us:
              </p>
              <ul className={`list-none mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>📧 Email: {companyEmail}</li>
                <li>🌐 Website: {websiteUrl}</li>
              </ul>
            </section>

          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link to="/privacy" className="text-temple-purple hover:underline">Privacy Policy</Link>
          <span className="text-gray-400">•</span>
          <Link to="/cookies" className="text-temple-purple hover:underline">Cookie Policy</Link>
          <span className="text-gray-400">•</span>
          <Link to="/disclaimer" className="text-temple-purple hover:underline">Health Disclaimer</Link>
        </div>
      </div>
    </div>
  )
}

export default Terms