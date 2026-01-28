import { useTheme } from '../../contexts/ThemeContext'
import { Link } from 'react-router-dom'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

const Disclaimer = () => {
  const { isDark } = useTheme()
  
  const lastUpdated = "January 28, 2026"
  const companyName = "Sagacity Network Ltd - Temple Keepers"
  const companyEmail = "support@templekeepers.com"

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
            isDark ? 'bg-red-500/20' : 'bg-red-500/10'
          }`}>
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Health Disclaimer
            </h1>
            <p className="text-gray-500">Last updated: {lastUpdated}</p>
          </div>
        </div>

        {/* Important Notice */}
        <div className={`rounded-2xl p-6 mb-8 ${
          isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`font-bold text-lg ${isDark ? 'text-red-400' : 'text-red-800'}`}>
            ⚠️ IMPORTANT: READ THIS DISCLAIMER CAREFULLY
          </p>
          <p className={`mt-3 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
            {companyName} provides health and wellness information for educational and informational purposes only. This information is NOT a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>

        {/* Content */}
        <div className={`rounded-2xl p-8 space-y-8 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          
          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Not Medical Advice
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              The content provided through {companyName}, including but not limited to recipes, nutritional information, wellness tips, and devotionals, is intended for general informational purposes only. It is not intended to be and should not be interpreted as medical advice or a substitute for professional medical advice.
            </p>
            <ul className={`list-disc pl-6 mt-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>We are NOT licensed medical professionals</li>
              <li>Our content does NOT replace consultation with qualified healthcare providers</li>
              <li>Individual results may vary</li>
              <li>What works for one person may not work for another</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Consult Healthcare Professionals
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              <strong>ALWAYS consult with a qualified healthcare provider before:</strong>
            </p>
            <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Starting any new diet or nutrition program</li>
              <li>Making significant changes to your eating habits</li>
              <li>If you have any existing medical conditions</li>
              <li>If you are pregnant, nursing, or planning to become pregnant</li>
              <li>If you are taking any medications</li>
              <li>If you have food allergies or intolerances</li>
              <li>If you have or suspect an eating disorder</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              AI-Generated Content
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              {companyName} uses artificial intelligence to generate recipes and wellness content. Please be aware:
            </p>
            <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>AI-generated content may contain errors or inaccuracies</li>
              <li>Nutritional information is estimated and may not be precise</li>
              <li>Always verify ingredients for allergens before preparing any recipe</li>
              <li>AI cannot account for your individual health circumstances</li>
              <li>Recipe suggestions may not be suitable for all dietary requirements</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Allergies and Food Safety
            </h2>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
              <p className={`font-medium ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                ⚠️ Allergy Warning
              </p>
              <p className={`mt-2 ${isDark ? 'text-amber-200' : 'text-amber-700'}`}>
                Recipes may contain or come into contact with common allergens including but not limited to: nuts, peanuts, dairy, eggs, wheat, gluten, soy, fish, and shellfish. Always check ingredients carefully if you have food allergies.
              </p>
            </div>
            <ul className={`list-disc pl-6 mt-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Cross-contamination can occur in home kitchens</li>
              <li>Read all ingredient labels carefully</li>
              <li>When in doubt, do not consume</li>
              <li>Seek immediate medical attention if you experience an allergic reaction</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Mental Health
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              While we provide faith-based devotionals and encouragement, {companyName} is not a mental health service. If you are experiencing:
            </p>
            <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Depression, anxiety, or other mental health concerns</li>
              <li>Thoughts of self-harm or suicide</li>
              <li>Disordered eating or body image issues</li>
            </ul>
            <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Please seek help from a qualified mental health professional immediately. In the UK, you can contact:
            </p>
            <ul className={`list-none mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>📞 Samaritans: 116 123 (free, 24/7)</li>
              <li>📞 NHS Mental Health: 111 (option 2)</li>
              <li>📞 BEAT Eating Disorders: 0808 801 0677</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Weight Management
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Any information related to weight loss or weight management should be approached with caution:
            </p>
            <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Healthy weight varies by individual</li>
              <li>Rapid weight loss can be harmful</li>
              <li>Consult a healthcare provider before starting any weight loss program</li>
              <li>Focus on overall health, not just the number on the scale</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Limitation of Liability
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              By using {companyName}, you acknowledge and agree that:
            </p>
            <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>You use the Service and its content at your own risk</li>
              <li>We are not liable for any adverse effects or consequences resulting from the use of any information, suggestions, or recipes provided</li>
              <li>We make no warranties about the accuracy, completeness, or suitability of any content</li>
              <li>You are solely responsible for your health decisions</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Professional Credentials
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              The founder of {companyName}, Denise Parris, holds the following credentials:
            </p>
            <ul className={`list-disc pl-6 mt-3 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Certified Integrative Nutrition Health Coach</li>
              <li>Certified Nutritional Therapist</li>
              <li>Advanced Clinical Weight Loss Practitioner</li>
            </ul>
            <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              While these certifications demonstrate expertise in wellness coaching, they do not qualify as medical licenses. Health coaching is complementary to, not a replacement for, medical care.
            </p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Contact Us
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              If you have questions about this disclaimer, contact us at {companyEmail}.
            </p>
          </section>

        </div>

        {/* Acknowledgment */}
        <div className={`mt-8 rounded-2xl p-6 text-center ${
          isDark ? 'bg-temple-purple/10 border border-temple-purple/20' : 'bg-temple-purple/5 border border-temple-purple/20'
        }`}>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            By using {companyName}, you acknowledge that you have read, understood, and agree to this Health Disclaimer.
          </p>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link to="/terms" className="text-temple-purple hover:underline">Terms of Service</Link>
          <span className="text-gray-400">•</span>
          <Link to="/privacy" className="text-temple-purple hover:underline">Privacy Policy</Link>
          <span className="text-gray-400">•</span>
          <Link to="/cookies" className="text-temple-purple hover:underline">Cookie Policy</Link>
        </div>
      </div>
    </div>
  )
}

export default Disclaimer