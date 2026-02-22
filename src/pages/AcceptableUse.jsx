import { PublicHeader } from '../components/PublicHeader'
import { Link } from 'react-router-dom'

export const AcceptableUse = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-12">

        <h1 className="text-4xl font-display font-bold gradient-text mb-4">
          Acceptable Use Policy
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: 18 February 2026
        </p>

        <div className="glass-card p-8 prose dark:prose-invert max-w-none">
          <p>
            This Acceptable Use Policy ("AUP") sets out the rules for using Temple Keepers, operated by
            Sagacity Network Ltd ("we", "us", "our"). This AUP supplements our{' '}
            <Link to="/terms" className="text-temple-purple dark:text-temple-gold">Terms of Service</Link> and
            applies to all users of the platform, including community features such as accountability pods,
            comments, prayer requests, and any shared content.
          </p>

          <h2>1. Community Standards</h2>
          <p>
            Temple Keepers is a faith-based wellness community. All users are expected to engage with
            respect, kindness, and a spirit of encouragement. Our community is built on the principle that
            every person is made in the image of God and deserves to be treated with dignity.
          </p>

          <h2>2. Prohibited Conduct</h2>
          <p>You must not use Temple Keepers to:</p>

          <h3>2.1 Harmful or Abusive Behaviour</h3>
          <ul>
            <li>Harass, bully, intimidate, or threaten other users</li>
            <li>Post content that is hateful, discriminatory, or promotes violence against any individual or group</li>
            <li>Stalk or engage in unwanted contact with other users</li>
            <li>Share another user's personal information without their consent</li>
            <li>Engage in predatory behaviour, grooming, or exploitation</li>
            <li>Encourage or facilitate self-harm, eating disorders, or other dangerous behaviours</li>
          </ul>

          <h3>2.2 Inappropriate Content</h3>
          <ul>
            <li>Post sexually explicit, pornographic, or obscene material</li>
            <li>Share graphic violence or disturbing imagery</li>
            <li>Post content promoting illegal drug use or excessive alcohol consumption</li>
            <li>Share content that is defamatory, libellous, or knowingly false</li>
            <li>Post spam, unsolicited advertising, or promotional material for competing services</li>
          </ul>

          <h3>2.3 Harmful Health Practices</h3>
          <ul>
            <li>Promote dangerous or extreme diets, fasting practices, or "cleanses" without medical oversight</li>
            <li>Provide specific medical diagnoses or prescribe treatments</li>
            <li>Discourage users from seeking professional medical advice</li>
            <li>Share unverified health claims as fact</li>
            <li>Sell or promote supplements, medications, or health products without authorisation</li>
          </ul>

          <h3>2.4 Spiritual Manipulation</h3>
          <ul>
            <li>Claim to speak on behalf of God in a way that manipulates, controls, or exploits others</li>
            <li>Use spiritual authority to coerce donations, obedience, or personal favours</li>
            <li>Promote cults, extremist ideologies, or fringe theological positions that cause harm</li>
            <li>Condemn, shame, or judge other users for their faith journey stage</li>
          </ul>

          <h3>2.5 Technical Abuse</h3>
          <ul>
            <li>Attempt to access other users' accounts or data</li>
            <li>Use automated tools, bots, or scrapers to collect content or data</li>
            <li>Reverse-engineer, decompile, or attempt to extract the source code of the platform</li>
            <li>Deliberately introduce malware, viruses, or harmful code</li>
            <li>Attempt to overwhelm or disrupt the Service through excessive requests</li>
            <li>Circumvent security measures, access controls, or rate limits</li>
            <li>Create multiple accounts to evade bans or manipulate features</li>
          </ul>

          <h3>2.6 Intellectual Property Violations</h3>
          <ul>
            <li>Copy, reproduce, or redistribute programme content, devotionals, or recipes from Temple Keepers</li>
            <li>Re-publish AI-generated content from the platform on competing services</li>
            <li>Use Temple Keepers content to train AI models or build derivative products</li>
            <li>Scrape or systematically download content from the platform</li>
            <li>Remove or alter copyright notices, watermarks, or attribution</li>
          </ul>

          <h2>3. Accountability Pods &amp; Community Spaces</h2>
          <p>When participating in pods and community features, you additionally agree to:</p>
          <ul>
            <li>Keep shared reflections, prayer requests, and personal stories confidential</li>
            <li>Not screenshot or share private community content outside of Temple Keepers</li>
            <li>Support and encourage other members, even when you disagree</li>
            <li>Report concerning content or behaviour rather than engaging in conflict</li>
            <li>Respect pod leaders and moderators</li>
            <li>Not use community features primarily for self-promotion or solicitation</li>
          </ul>

          <h2>4. User-Generated Content</h2>
          <p>
            Content you share in community spaces (pod posts, comments, prayer requests) should align with
            these standards. We reserve the right to remove content that violates this policy without prior
            notice.
          </p>
          <p>
            You retain ownership of your own content but grant us a licence to display it within the
            Service as set out in our <Link to="/terms" className="text-temple-purple dark:text-temple-gold">Terms of Service</Link>.
          </p>

          <h2>5. Reporting Violations</h2>
          <p>
            If you encounter content or behaviour that violates this policy, please report it to us
            immediately at <strong>support@templekeepers.app</strong> or use the in-app reporting feature.
            We take all reports seriously and will investigate promptly.
          </p>

          <h2>6. Enforcement</h2>
          <p>Violations of this policy may result in:</p>
          <ul>
            <li><strong>Warning:</strong> A written notice for minor or first-time violations</li>
            <li><strong>Content Removal:</strong> Offending content removed without notice</li>
            <li><strong>Temporary Suspension:</strong> Account access restricted for a defined period</li>
            <li><strong>Permanent Ban:</strong> Account permanently terminated for serious or repeated violations</li>
            <li><strong>Legal Action:</strong> Referral to law enforcement or civil proceedings where appropriate</li>
          </ul>
          <p>
            We may take any combination of these actions at our sole discretion. Serious violations
            (threats, illegal activity, exploitation) will result in immediate permanent ban and may be
            reported to authorities.
          </p>

          <h2>7. Appeals</h2>
          <p>
            If you believe enforcement action was taken in error, you may appeal by emailing
            <strong> support@templekeepers.app</strong> within 14 days of the action. Appeals will be
            reviewed by a different team member where possible.
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this AUP from time to time. Material changes will be notified via email or
            in-app notice. Continued use of Temple Keepers after changes constitutes acceptance.
          </p>

          <h2>9. Contact</h2>
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
          <Link to="/disclaimer" className="hover:text-temple-purple dark:hover:text-temple-gold">Disclaimer</Link>
        </div>
      </div>
    </div>
  )
}
