import { useNavigate } from 'react-router-dom'
import { PublicHeader } from '../components/PublicHeader'

export const Cookies = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-12">

        <h1 className="text-4xl font-display font-bold gradient-text mb-4">
          Cookie Policy
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: February 2, 2026
        </p>

        <div className="glass-card p-8 prose dark:prose-invert max-w-none">
          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help websites 
            remember your preferences and improve your experience.
          </p>

          <h2>2. How We Use Cookies</h2>
          <p>
            Temple Keepers uses cookies for:
          </p>
          <ul>
            <li><strong>Authentication:</strong> Keep you logged in securely</li>
            <li><strong>Preferences:</strong> Remember your settings (dark mode, language)</li>
            <li><strong>Analytics:</strong> Understand how you use our Service</li>
            <li><strong>Performance:</strong> Improve speed and functionality</li>
          </ul>

          <h2>3. Types of Cookies We Use</h2>
          
          <h3>3.1 Essential Cookies (Required)</h3>
          <p>
            These cookies are necessary for the Service to function and cannot be disabled:
          </p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Cookie Name</th>
                <th className="text-left p-2">Purpose</th>
                <th className="text-left p-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2"><code>sb-access-token</code></td>
                <td className="p-2">Authentication session</td>
                <td className="p-2">1 hour</td>
              </tr>
              <tr className="border-b">
                <td className="p-2"><code>sb-refresh-token</code></td>
                <td className="p-2">Maintain login status</td>
                <td className="p-2">7 days</td>
              </tr>
            </tbody>
          </table>

          <h3>3.2 Preference Cookies (Optional)</h3>
          <p>
            These cookies remember your choices:
          </p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Cookie Name</th>
                <th className="text-left p-2">Purpose</th>
                <th className="text-left p-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2"><code>theme</code></td>
                <td className="p-2">Dark/light mode preference</td>
                <td className="p-2">1 year</td>
              </tr>
              <tr className="border-b">
                <td className="p-2"><code>cookieConsent</code></td>
                <td className="p-2">Remember your cookie preferences</td>
                <td className="p-2">1 year</td>
              </tr>
            </tbody>
          </table>

          <h3>3.3 Analytics Cookies (Optional)</h3>
          <p>
            We may use analytics to understand usage patterns:
          </p>
          <ul>
            <li><strong>Google Analytics:</strong> Anonymous usage statistics</li>
            <li><strong>Purpose:</strong> Improve Service, identify popular features</li>
            <li><strong>Data Collected:</strong> Pages visited, time on site, browser type (no personal identifiers)</li>
            <li><strong>Control:</strong> You can opt out via browser settings or analytics opt-out tools</li>
          </ul>

          <h2>4. Third-Party Cookies</h2>
          <p>
            Some features use third-party services that may set cookies:
          </p>
          <ul>
            <li><strong>Supabase:</strong> Authentication and database services</li>
            <li><strong>Google Fonts:</strong> Typography (may set performance cookies)</li>
            <li><strong>Cloudflare:</strong> Security and performance (if applicable)</li>
          </ul>
          <p>
            Third parties are responsible for their own cookie policies.
          </p>

          <h2>5. How to Manage Cookies</h2>
          
          <h3>5.1 Browser Settings</h3>
          <p>
            Most browsers allow you to:
          </p>
          <ul>
            <li>View and delete cookies</li>
            <li>Block all cookies</li>
            <li>Block third-party cookies only</li>
            <li>Clear cookies when closing browser</li>
          </ul>

          <h3>5.2 Browser Instructions</h3>
          <ul>
            <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
            <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
            <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
          </ul>

          <h3>5.3 Mobile Devices</h3>
          <ul>
            <li><strong>iOS:</strong> Settings → Safari → Block All Cookies</li>
            <li><strong>Android:</strong> Chrome app → Settings → Privacy → Clear browsing data</li>
          </ul>

          <h3>5.4 Opt-Out Tools</h3>
          <ul>
            <li><strong>Google Analytics Opt-out:</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Download Browser Add-on</a></li>
            <li><strong>Do Not Track:</strong> Some browsers support DNT signals</li>
          </ul>

          <h2>6. Impact of Disabling Cookies</h2>
          <p>
            Disabling cookies may affect functionality:
          </p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Cookie Type</th>
                <th className="text-left p-2">If Disabled</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">Essential</td>
                <td className="p-2">Cannot stay logged in, Service won't function</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Preference</td>
                <td className="p-2">Settings won't be saved (must set dark mode each visit)</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Analytics</td>
                <td className="p-2">No impact on functionality</td>
              </tr>
            </tbody>
          </table>

          <h2>7. Local Storage</h2>
          <p>
            In addition to cookies, we use browser local storage for:
          </p>
          <ul>
            <li>Caching data for faster performance</li>
            <li>Storing user preferences</li>
            <li>Temporary session data</li>
          </ul>
          <p>
            Local storage can be cleared through browser settings similar to cookies.
          </p>

          <h2>8. Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy periodically. Check the "Last Updated" date for changes. 
            Continued use after updates constitutes acceptance.
          </p>

          <h2>9. Your Consent</h2>
          <p>
            By using Temple Keepers, you consent to our use of essential cookies. For optional cookies 
            (analytics, preferences), you can manage your preferences through:
          </p>
          <ul>
            <li>Cookie consent banner (on first visit)</li>
            <li>Browser settings (anytime)</li>
            <li>Contacting us to opt out</li>
          </ul>

          <h2>10. Contact Us</h2>
          <p>
            For questions about our use of cookies:
          </p>
          <p>
            <strong>Sagacity Network Ltd (trading as Temple Keepers)</strong><br />
            Email: privacy@templekeepers.app<br />
            Registered in England &middot; Company No. 15712287 &middot; Basildon, United Kingdom
          </p>

          <h2>11. More Information</h2>
          <p>
            To learn more about cookies:
          </p>
          <ul>
            <li><a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer">All About Cookies</a></li>
            <li><a href="https://ico.org.uk/for-the-public/online/cookies/" target="_blank" rel="noopener noreferrer">UK ICO: Cookies</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
