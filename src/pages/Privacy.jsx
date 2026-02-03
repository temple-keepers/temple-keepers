import { useNavigate } from 'react-router-dom'
import { PublicHeader } from '../components/PublicHeader'

export const Privacy = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-12">

        <h1 className="text-4xl font-display font-bold gradient-text mb-4">
          Privacy Policy
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: February 2, 2026
        </p>

        <div className="glass-card p-8 prose dark:prose-invert max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Sagacity Network Ltd, trading as Temple Keepers ("we," "our," or "us"), is committed to protecting 
            your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
            when you use our platform at templekeepers.com (the "Service").
          </p>

          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, password</li>
            <li><strong>Profile Information:</strong> Dietary preferences, wellness goals, fasting type selections</li>
            <li><strong>User Content:</strong> Check-in responses, meal logs, program reflections, recipe favorites</li>
            <li><strong>Communications:</strong> Messages you send to us, feedback, support requests</li>
          </ul>

          <h3>2.2 Automatically Collected Information</h3>
          <ul>
            <li><strong>Usage Data:</strong> Pages viewed, features used, time spent, program progress</li>
            <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
            <li><strong>Cookies:</strong> See our Cookie Policy for details</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and maintain the Service</li>
            <li>Personalize your experience (program recommendations, recipe suggestions)</li>
            <li>Send you devotionals, program updates, and service notifications</li>
            <li>Improve our Service through analytics</li>
            <li>Respond to your inquiries and support requests</li>
            <li>Protect against fraudulent or unauthorized activity</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. AI-Generated Content</h2>
          <p>
            Temple Keepers uses AI (Google Gemini) to generate personalized programs and recipes. When you request 
            AI-generated content, we send your dietary preferences and program parameters to Google's API. Google 
            processes this data according to their privacy policy. We do not share personal identifying information 
            with AI services.
          </p>

          <h2>5. Data Sharing and Disclosure</h2>
          
          <h3>5.1 We Share Information With:</h3>
          <ul>
            <li><strong>Service Providers:</strong> Supabase (database hosting), Google (AI services), email service providers</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>

          <h3>5.2 We DO NOT:</h3>
          <ul>
            <li>Sell your personal information</li>
            <li>Share your information for third-party marketing</li>
            <li>Make your private reflections or check-ins public</li>
          </ul>

          <h2>6. Data Security</h2>
          <p>
            We implement industry-standard security measures including:
          </p>
          <ul>
            <li>Encryption of data in transit (HTTPS/TLS)</li>
            <li>Encrypted database storage</li>
            <li>Row-level security policies</li>
            <li>Regular security audits</li>
            <li>Limited employee access to personal data</li>
          </ul>
          <p>
            However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
          </p>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Export:</strong> Download your data in portable format</li>
            <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails</li>
            <li><strong>Object:</strong> Object to certain processing activities</li>
          </ul>
          <p>
            To exercise these rights, email us at privacy@templekeepers.com
          </p>

          <h2>8. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to provide services. 
            After account deletion, we retain certain information for legal compliance (typically 7 years for 
            financial records). Anonymous usage data may be retained indefinitely.
          </p>

          <h2>9. Children's Privacy</h2>
          <p>
            Temple Keepers is intended for adults 18 and over. We do not knowingly collect information from 
            children under 18. If we discover we've collected such information, we will delete it promptly.
          </p>

          <h2>10. International Users</h2>
          <p>
            Our Service is operated from the United Kingdom. If you're accessing from outside the UK, your 
            information will be transferred to and processed in the UK. By using our Service, you consent 
            to this transfer.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We'll notify you of material changes via email 
            or prominent notice on our Service. Continued use after changes constitutes acceptance.
          </p>

          <h2>12. Contact Us</h2>
          <p>For privacy questions or concerns:</p>
          <p>
            <strong>Sagacity Network Ltd (trading as Temple Keepers)</strong><br />
            Email: privacy@templekeepers.com<br />
            Address: Basildon, United Kingdom
          </p>

          <h2>13. UK GDPR Compliance</h2>
          <p>
            As a UK-based company, we comply with UK GDPR requirements. Our lawful basis for processing 
            includes:
          </p>
          <ul>
            <li><strong>Contract:</strong> To provide the Service you've signed up for</li>
            <li><strong>Consent:</strong> For marketing communications (you can withdraw anytime)</li>
            <li><strong>Legitimate Interest:</strong> To improve our Service and prevent fraud</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
