import { Link } from 'react-router-dom'
import { PublicHeader } from '../components/PublicHeader'

export const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-12">

        <h1 className="text-4xl font-display font-bold gradient-text mb-4">
          Terms of Service
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: 18 February 2026
        </p>

        <div className="glass-card p-8 prose dark:prose-invert max-w-none">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using Temple Keepers ("Service"), operated by Sagacity Network Ltd ("Company," "we," 
            "our," or "us"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any 
            part of these Terms, you may not access the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Temple Keepers is a faith-based wellness platform providing:
          </p>
          <ul>
            <li>Daily scripture devotionals and wellness guidance</li>
            <li>AI-generated wellness programs and recipes</li>
            <li>Check-in tracking and meal logging tools</li>
            <li>Community features (when available)</li>
            <li>Educational content on holistic health</li>
          </ul>

          <h2>3. Eligibility</h2>
          <p>
            You must be at least 18 years old to use this Service. By using the Service, you represent and 
            warrant that you meet this requirement.
          </p>

          <h2>4. Account Registration</h2>
          
          <h3>4.1 Account Creation</h3>
          <p>
            To access certain features, you must create an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your information as needed</li>
            <li>Keep your password secure and confidential</li>
            <li>Notify us immediately of unauthorized access</li>
            <li>Be responsible for all activity under your account</li>
          </ul>

          <h3>4.2 Account Termination</h3>
          <p>
            We reserve the right to suspend or terminate accounts that violate these Terms or for any reason 
            at our discretion, with or without notice.
          </p>

          <h2>5. User Content</h2>
          
          <h3>5.1 Your Content</h3>
          <p>
            You retain ownership of content you submit ("User Content"), including check-ins, reflections, 
            and meal logs. By submitting content, you grant us a worldwide, non-exclusive, royalty-free 
            license to use, store, and display your content to provide the Service.
          </p>

          <h3>5.2 Content Standards</h3>
          <p>You agree not to submit content that:</p>
          <ul>
            <li>Violates any law or regulation</li>
            <li>Infringes on intellectual property rights</li>
            <li>Contains hate speech, harassment, or threats</li>
            <li>Contains explicit or inappropriate content</li>
            <li>Promotes dangerous or harmful behavior</li>
            <li>Misrepresents your identity or affiliation</li>
          </ul>

          <h2>6. AI-Generated Content</h2>
          
          <h3>6.1 Nature of AI Content</h3>
          <p>
            Programs and recipes may be generated using AI technology (Google Gemini). While we strive for 
            accuracy, AI-generated content:
          </p>
          <ul>
            <li>May contain errors or inaccuracies</li>
            <li>Should not replace professional medical advice</li>
            <li>Is provided "as is" without warranties</li>
            <li>May vary in quality</li>
          </ul>

          <h3>6.2 User Responsibility</h3>
          <p>
            You are responsible for evaluating AI-generated content before use, especially regarding dietary 
            restrictions, allergies, or health conditions.
          </p>

          <h2>7. Prohibited Uses</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for illegal purposes</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Scrape, copy, or automate access to content</li>
            <li>Impersonate others or provide false information</li>
            <li>Transmit viruses or malicious code</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Use the Service to promote competing services</li>
          </ul>

          <h2>8. Intellectual Property</h2>
          
          <h3>8.1 Our Content</h3>
          <p>
            The Service, including its original design, user interface, functionality, programme content,
            devotional material, AI-generated recipes, wellness tools, source code, graphics, logos, and
            all other proprietary content (collectively, "Our Content"), is owned by Sagacity Network Ltd
            and protected by copyright and other intellectual property laws of England and Wales and
            international treaties.
          </p>
          <p>You may not, without our express prior written consent:</p>
          <ul>
            <li>Copy, reproduce, distribute, or publicly display Our Content</li>
            <li>Create derivative works based on Our Content</li>
            <li>Re-publish programme materials, devotional content, or recipes on any other platform</li>
            <li>Use Our Content to train artificial intelligence or machine learning models</li>
            <li>Systematically download, scrape, or harvest content from the Service</li>
            <li>Reverse-engineer, decompile, disassemble, or attempt to derive the source code of the platform</li>
            <li>Remove, alter, or obscure any copyright or proprietary notices</li>
          </ul>

          <h3>8.2 Brand Identity</h3>
          <p>
            The Temple Keepers name, logo, visual design system, and brand identity as used on this
            platform are the property of Sagacity Network Ltd. Unauthorised use of our brand assets
            in connection with any product or service that is likely to cause confusion is prohibited.
          </p>

          <h3>8.3 AI-Generated Content</h3>
          <p>
            Recipes, devotionals, and other content generated by our AI systems on behalf of users
            are produced using our proprietary prompts, configurations, and systems. While individual
            users may use AI-generated content for personal purposes, systematic collection,
            republication, or commercial use of AI-generated content from Temple Keepers is prohibited
            without written permission.
          </p>

          <h3>8.4 Programme &amp; Curriculum Content</h3>
          <p>
            Structured programme content (including but not limited to "Make Room for the Lord",
            fasting guides, wellness challenges, and any future programmes) is original copyrighted
            material. Reproducing, distributing, or creating derivative programmes based on this
            content without written authorisation constitutes copyright infringement.
          </p>

          <h2>9. Medical Disclaimer</h2>
          <p className="font-semibold text-red-600 dark:text-red-400">
            IMPORTANT: Temple Keepers is NOT a medical service and does NOT provide medical advice.
          </p>
          <ul>
            <li>Content is for informational and inspirational purposes only</li>
            <li>Always consult healthcare professionals before starting any wellness program</li>
            <li>Do not disregard professional medical advice because of information on our Service</li>
            <li>If you have medical conditions, dietary restrictions, or take medications, consult your doctor</li>
            <li>In case of medical emergency, call emergency services immediately</li>
          </ul>

          <h2>10. Subscription and Payments</h2>
          
          <h3>10.1 Free and Premium Tiers</h3>
          <p>
            We offer both free and paid subscription options. Premium features and pricing are subject 
            to change with reasonable notice.
          </p>

          <h3>10.2 Billing</h3>
          <ul>
            <li>Subscriptions auto-renew unless cancelled</li>
            <li>You authorize us to charge your payment method</li>
            <li>Fees are non-refundable except as required by law</li>
            <li>You're responsible for all charges, including unauthorized use</li>
          </ul>

          <h3>10.3 Cancellation</h3>
          <p>
            You may cancel anytime. Cancellation takes effect at the end of the current billing period. 
            No refunds for partial periods.
          </p>

          <h2>11. Limitation of Liability</h2>
          <p className="font-semibold">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
          </p>
          <ul>
            <li>The Service is provided "AS IS" and "AS AVAILABLE"</li>
            <li>We make no warranties, express or implied</li>
            <li>We are not liable for indirect, incidental, or consequential damages</li>
            <li>Our total liability is limited to fees paid in the past 12 months (maximum £100)</li>
            <li>We are not responsible for third-party services (Google AI, Supabase, etc.)</li>
          </ul>

          <h2>12. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Sagacity Network Ltd, its officers, employees, and 
            agents from any claims, damages, or expenses arising from:
          </p>
          <ul>
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of another</li>
            <li>Your User Content</li>
          </ul>

          <h2>13. Changes to Service</h2>
          <p>
            We reserve the right to modify or discontinue the Service (or any part) at any time, with or 
            without notice. We are not liable for any modification, suspension, or discontinuation.
          </p>

          <h2>14. Changes to Terms</h2>
          <p>
            We may revise these Terms at any time. Material changes will be notified via email or Service 
            notice. Continued use after changes constitutes acceptance.
          </p>

          <h2>15. Governing Law</h2>
          <p>
            These Terms are governed by the laws of England and Wales. Any disputes will be resolved in 
            the courts of England and Wales.
          </p>

          <h2>16. Dispute Resolution</h2>
          <p>
            For disputes, we encourage informal resolution by contacting us first. If unresolved, disputes 
            may be submitted to mediation before litigation.
          </p>

          <h2>17. Severability</h2>
          <p>
            If any provision is found unenforceable, it will be modified to reflect the parties' intention, 
            and remaining provisions remain in full effect.
          </p>

          <h2>18. Additional Policies</h2>
          <p>
            The following policies form part of your agreement with us and are incorporated by reference:
          </p>
          <ul>
            <li><Link to="/privacy" className="text-temple-purple dark:text-temple-gold">Privacy Policy</Link> — how we collect and use your data</li>
            <li><Link to="/cookies" className="text-temple-purple dark:text-temple-gold">Cookie Policy</Link> — how we use cookies and local storage</li>
            <li><Link to="/acceptable-use" className="text-temple-purple dark:text-temple-gold">Acceptable Use Policy</Link> — community standards and prohibited conduct</li>
            <li><Link to="/disclaimer" className="text-temple-purple dark:text-temple-gold">Disclaimer</Link> — health, faith, and AI content disclaimers</li>
          </ul>

          <h2>19. Entire Agreement</h2>
          <p>
            These Terms, along with our Privacy Policy, Cookie Policy, Acceptable Use Policy, and
            Disclaimer, constitute the entire agreement between you and Sagacity Network Ltd regarding
            the Service.
          </p>

          <h2>20. Contact Information</h2>
          <p>
            For questions about these Terms:
          </p>
          <p>
            <strong>Sagacity Network Ltd (trading as Temple Keepers)</strong><br />
            Email: legal@templekeepers.app<br />
            Registered in England &middot; Company No. 15712287 &middot; Basildon, United Kingdom
          </p>

          <p className="mt-8 text-sm text-gray-600 dark:text-gray-400">
            By using Temple Keepers, you acknowledge that you have read, understood, and agree to be bound 
            by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  )
}
