import { PublicHeader } from '../components/PublicHeader'
import { Link } from 'react-router-dom'

export const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-12">

        <h1 className="text-4xl font-display font-bold gradient-text mb-4">
          Disclaimer
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: 18 February 2026
        </p>

        <div className="glass-card p-8 prose dark:prose-invert max-w-none">

          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 not-prose mb-8">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              IMPORTANT: Please read this disclaimer carefully before using Temple Keepers. By using our
              Service, you acknowledge that you have read, understood, and agree to the terms below.
            </p>
          </div>

          <h2>1. Not Medical Advice</h2>
          <p>
            Temple Keepers is a wellness and faith-based lifestyle platform. It is <strong>not a medical
            service</strong> and does not provide medical advice, diagnosis, or treatment.
          </p>
          <p>The content on this platform, including but not limited to:</p>
          <ul>
            <li>Daily devotionals and reflections</li>
            <li>Fasting programme guidance and schedules</li>
            <li>AI-generated recipes and nutrition estimates</li>
            <li>Wellness check-in tools and symptom tracking</li>
            <li>Meal logging and dietary suggestions</li>
            <li>Community posts and shared experiences</li>
          </ul>
          <p>
            is provided for <strong>educational and inspirational purposes only</strong>. It should never
            be used as a substitute for professional medical advice from a qualified healthcare provider.
          </p>

          <h2>2. Consult Your Doctor</h2>
          <p>You should always consult a qualified healthcare professional before:</p>
          <ul>
            <li>Starting any fasting programme, especially if you have existing health conditions</li>
            <li>Making significant changes to your diet or eating patterns</li>
            <li>Following any nutritional or dietary guidance provided by the platform</li>
            <li>If you are pregnant, breastfeeding, or planning to become pregnant</li>
            <li>If you have or suspect you have diabetes, heart disease, kidney disease, or any chronic condition</li>
            <li>If you take any prescription or over-the-counter medications</li>
            <li>If you have a history of eating disorders</li>
          </ul>
          <p>
            <strong>Never disregard professional medical advice</strong> or delay seeking it because of
            something you have read on Temple Keepers. If you think you may have a medical emergency,
            call your doctor or emergency services immediately.
          </p>

          <h2>3. Not Counselling or Therapy</h2>
          <p>
            Temple Keepers is not a counselling, therapy, or mental health service. While we encourage
            spiritual reflection, prayer, and community support, these are <strong>not substitutes for
            professional mental health care</strong>.
          </p>
          <p>
            If you are experiencing mental health difficulties, suicidal thoughts, or emotional distress,
            please contact a qualified professional or call a helpline such as:
          </p>
          <ul>
            <li><strong>Samaritans (UK):</strong> 116 123 (free, 24/7)</li>
            <li><strong>NHS Mental Health:</strong> 111 (option 2)</li>
            <li><strong>SHOUT Crisis Text Line:</strong> Text "SHOUT" to 85258</li>
          </ul>

          <h2>4. AI-Generated Content</h2>
          <p>
            Parts of Temple Keepers use artificial intelligence (Google Gemini) to generate content
            including but not limited to recipes, devotionals, nutrition estimates, and programme
            suggestions.
          </p>
          <p><strong>AI-generated content:</strong></p>
          <ul>
            <li>May contain errors, inaccuracies, or omissions</li>
            <li>Should be reviewed and verified before relying on it</li>
            <li>Does not constitute professional dietary, nutritional, or medical advice</li>
            <li>May not account for all individual health conditions, allergies, or interactions</li>
            <li>Nutrition estimates are approximate and should not be relied upon for medical dietary management</li>
          </ul>
          <p>
            While we make reasonable efforts to ensure accuracy, we cannot guarantee that AI-generated
            content is complete, accurate, or suitable for your specific circumstances.
          </p>

          <h2>5. Nutrition Information</h2>
          <p>
            Nutritional information provided on Temple Keepers, whether AI-generated or otherwise, is
            <strong> approximate only</strong>. Actual nutritional values may vary depending on specific
            ingredients, brands, preparation methods, and portion sizes. Users with specific dietary
            requirements or medical conditions should consult a registered nutritionist or dietitian.
          </p>

          <h2>6. Fasting Disclaimer</h2>
          <p>
            Fasting can carry health risks, particularly for certain individuals. Temple Keepers provides
            fasting guidance as a spiritual discipline, not as medical treatment.
          </p>
          <p><strong>You should NOT fast if:</strong></p>
          <ul>
            <li>You are pregnant or breastfeeding</li>
            <li>You have a history of eating disorders</li>
            <li>You have type 1 diabetes or uncontrolled type 2 diabetes</li>
            <li>You are under 18 years of age</li>
            <li>You are recovering from surgery</li>
            <li>Your doctor has advised against it</li>
          </ul>
          <p>
            If you experience dizziness, fainting, extreme fatigue, chest pain, or any other concerning
            symptoms while fasting, <strong>break your fast immediately and seek medical advice</strong>.
          </p>

          <h2>7. Faith &amp; Spiritual Content</h2>
          <p>
            Temple Keepers is a Christian platform. Spiritual content, including devotionals, prayer
            prompts, and scripture selections, reflects a broadly Christian perspective. This content:
          </p>
          <ul>
            <li>Represents general Christian encouragement, not doctrinal authority</li>
            <li>Is not a substitute for pastoral care, church community, or spiritual direction</li>
            <li>May include AI-generated reflections which should be evaluated by the reader</li>
            <li>Does not claim to represent any specific denomination's official teaching</li>
          </ul>

          <h2>8. Community Content</h2>
          <p>
            Content shared by other users in community features (accountability pods, comments, prayer
            requests) represents the views and experiences of those individuals, not of Sagacity Network
            Ltd. We do not endorse, verify, or guarantee the accuracy of user-generated content.
          </p>

          <h2>9. Third-Party Links &amp; Services</h2>
          <p>
            Temple Keepers may contain links to third-party websites or services. We are not responsible
            for the content, privacy practices, or accuracy of any third-party resources. Inclusion of
            a link does not imply endorsement.
          </p>

          <h2>10. Results &amp; Testimonials</h2>
          <p>
            Any results or testimonials shared on Temple Keepers represent individual experiences and are
            not guaranteed. Wellness outcomes depend on numerous factors including genetics, existing health
            conditions, adherence, and other lifestyle factors. Your results may vary.
          </p>

          <h2>11. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by English law, Sagacity Network Ltd and its directors,
            employees, contractors, and affiliates shall not be liable for any loss or damage arising
            from your use of Temple Keepers, including but not limited to:
          </p>
          <ul>
            <li>Any adverse health effects from following fasting, dietary, or exercise guidance</li>
            <li>Errors or omissions in AI-generated content</li>
            <li>Reliance on nutrition estimates or dietary information</li>
            <li>Interactions with other community members</li>
            <li>Loss of data or service interruptions</li>
          </ul>

          <h2>12. Governing Law</h2>
          <p>
            This Disclaimer is governed by the laws of England and Wales. Nothing in this disclaimer
            excludes or limits liability which cannot be excluded or limited under applicable law,
            including liability for death or personal injury caused by negligence.
          </p>

          <h2>13. Contact Us</h2>
          <p>
            If you have any questions about this Disclaimer:
          </p>
          <p>
            <strong>Sagacity Network Ltd (trading as Temple Keepers)</strong><br />
            Email: support@templekeepers.app<br />
            Registered in England &middot; Company No. 15712287 &middot; Basildon, United Kingdom
          </p>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
          <Link to="/terms" className="hover:text-temple-purple dark:hover:text-temple-gold">Terms of Service</Link>
          <span>&middot;</span>
          <Link to="/privacy" className="hover:text-temple-purple dark:hover:text-temple-gold">Privacy Policy</Link>
          <span>&middot;</span>
          <Link to="/cookies" className="hover:text-temple-purple dark:hover:text-temple-gold">Cookie Policy</Link>
          <span>&middot;</span>
          <Link to="/acceptable-use" className="hover:text-temple-purple dark:hover:text-temple-gold">Acceptable Use</Link>
        </div>
      </div>
    </div>
  )
}
