import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import {
  BookOpen, Heart, Users, ChefHat, ArrowRight, Flame, Shield,
  Home, Calendar, UtensilsCrossed, MessageCircle, User,
  Search, Sparkles, CalendarDays, ShoppingCart, ArrowRightLeft,
  Bell, Lock, Trophy, Share2, Smartphone, Monitor, HelpCircle,
  ShieldCheck, UserX, Trash2
} from 'lucide-react'

export const UserGuide = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const Section = ({ number, title, highlight, children }) => (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-temple-purple dark:bg-temple-gold text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          {number}
        </div>
        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
          {title} {highlight && <span className="text-temple-purple dark:text-temple-gold">{highlight}</span>}
        </h2>
      </div>
      {children}
    </div>
  )

  const FeatureCard = ({ icon: Icon, title, children }) => (
    <div className="glass-card p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-temple-purple/10 dark:bg-temple-gold/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{children}</p>
        </div>
      </div>
    </div>
  )

  const Step = ({ number, title, children }) => (
    <div className="flex gap-4 mb-4">
      <div className="w-8 h-8 rounded-full bg-temple-purple dark:bg-temple-gold text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{children}</p>
      </div>
    </div>
  )

  const TipBox = ({ children }) => (
    <div className="rounded-xl bg-temple-gold/5 dark:bg-temple-gold/10 border border-temple-gold/20 p-4 my-4">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-temple-gold">💡 Tip: </span>
        {children}
      </p>
    </div>
  )

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-8">
        <AppHeader 
          title="User Guide" 
          showBackButton={true} 
          backTo={user ? '/profile' : '/'} 
        />

        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
              Welcome to <span className="text-temple-purple dark:text-temple-gold">Temple Keepers</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
              Your complete guide to the faith-based wellness platform that integrates scripture, fasting, nutrition, and community.
            </p>
          </div>

          {/* Table of Contents */}
          <div className="glass-card p-6 mb-12">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">What's Inside</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { n: '01', label: 'Your Data & Privacy' },
                { n: '02', label: 'Getting Started' },
                { n: '03', label: 'Your Today Page' },
                { n: '04', label: 'Programmes & Challenges' },
                { n: '05', label: 'Recipes & Meal Planning' },
                { n: '06', label: 'Community Pods' },
                { n: '07', label: 'Your Profile & Settings' },
                { n: '08', label: 'Tips for Success' },
                { n: '09', label: 'FAQ' },
              ].map(item => (
                <a key={item.n} href={`#section-${item.n}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <span className="text-sm font-bold text-temple-purple dark:text-temple-gold">{item.n}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* ===== 01 YOUR DATA & PRIVACY ===== */}
          <div id="section-01">
            <Section number="01" title="Your Data &" highlight="Privacy">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We believe you should always be in full control of your personal information. Temple Keepers is built on trust and transparency.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <FeatureCard icon={ShieldCheck} title="Your Data is Private">
                  We never sell, share, or monetise your personal information. Your health, spiritual, and wellness data belongs to you alone.
                </FeatureCard>
                <FeatureCard icon={UserX} title="Remove Personal Details">
                  At any time, you can clear your name, phone, location, health profile, and spiritual profile from your account — while keeping your account active.
                </FeatureCard>
                <FeatureCard icon={Trash2} title="Delete Your Account">
                  You can permanently delete your account and all associated data at any time. No hoops to jump through, no waiting periods.
                </FeatureCard>
                <FeatureCard icon={Lock} title="No Lock-In">
                  There are no contracts or commitments. You're free to leave whenever you choose, and we'll remove everything.
                </FeatureCard>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How to Manage Your Data</h3>
              <Step number="1" title="Go to your Profile">
                Tap "Profile" in the bottom navigation bar.
              </Step>
              <Step number="2" title="Scroll to Account Management">
                At the bottom of your Profile page, tap "Account Management" to expand the section.
              </Step>
              <Step number="3" title="Choose your option">
                Select "Remove Personal Details" to clear your data but keep your account, or "Delete Account" to permanently remove everything.
              </Step>

              <TipBox>
                Account deletion is instant and irreversible. If you just want a fresh start, try "Remove Personal Details" first — your account stays active and you can fill in your profile again whenever you like.
              </TipBox>
            </Section>
          </div>

          {/* ===== 02 GETTING STARTED ===== */}
          <div id="section-02">
            <Section number="02" title="Getting" highlight="Started">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Temple Keepers is the first faith-based wellness platform designed for all Christians over 25. It's 100% free.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Creating Your Account</h3>
              <Step number="1" title="Visit templekeepers.app">
                Open your browser on any device — phone, tablet, or computer.
              </Step>
              <Step number="2" title={`Tap "Start Your Journey — It's Free"`}>
                On the landing page, tap the purple button to begin.
              </Step>
              <Step number="3" title="Enter your details">
                Provide your name, email address, and create a password. You'll receive a confirmation email.
              </Step>
              <Step number="4" title="You're in!">
                Once signed in, you'll land on your Today page — your daily wellness dashboard.
              </Step>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">Install on Your Phone</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Temple Keepers works like a native app! Add it to your home screen for the best experience:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <FeatureCard icon={Smartphone} title="iPhone / iPad">
                  Open in Safari → Tap the Share icon → "Add to Home Screen"
                </FeatureCard>
                <FeatureCard icon={Monitor} title="Android">
                  Open in Chrome → Tap ⋮ menu → "Add to Home Screen" or "Install App"
                </FeatureCard>
              </div>

              <TipBox>
                Installing as an app gives you a full-screen experience without browser bars, faster loading, and push notifications.
              </TipBox>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">Navigating the App</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Five main sections are always accessible from the bottom navigation bar:
              </p>
              <div className="glass-card p-4">
                <div className="flex justify-around">
                  {[
                    { icon: Home, label: 'Today' },
                    { icon: Calendar, label: 'Programs' },
                    { icon: UtensilsCrossed, label: 'Recipes' },
                    { icon: Users, label: 'Community' },
                    { icon: User, label: 'Profile' },
                  ].map(item => (
                    <div key={item.label} className="text-center">
                      <item.icon className="w-5 h-5 mx-auto mb-1 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </div>

          {/* ===== 03 TODAY PAGE ===== */}
          <div id="section-03">
            <Section number="03" title="Your" highlight="Today Page">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The Today page is your daily wellness command centre. Every time you open Temple Keepers, this is where you'll land.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <FeatureCard icon={Heart} title="Personalised Greeting">
                  A warm welcome that changes with the time of day, along with an encouraging message.
                </FeatureCard>
                <FeatureCard icon={Flame} title="Streak Tracker">
                  See your daily streak and weekly progress. Every day you engage builds your streak and earns points.
                </FeatureCard>
                <FeatureCard icon={BookOpen} title="Weekly Devotional">
                  Fresh scripture each week with a thoughtful reflection connecting faith and wellness.
                </FeatureCard>
                <FeatureCard icon={Shield} title="Today's Action">
                  A practical daily action step you can tick off to mark the day as done.
                </FeatureCard>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Levels & Points</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                As you engage daily, you earn points and level up — from Seedling to Oak and beyond.
              </p>

              <TipBox>
                Check in every morning as part of your devotional time — even 2 minutes makes a difference. Consistency builds the habit.
              </TipBox>
            </Section>
          </div>

          {/* ===== 04 PROGRAMMES ===== */}
          <div id="section-04">
            <Section number="04" title="Programmes &" highlight="Challenges">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Guided multi-day journeys combining scripture, science, and practical action steps to transform your health and spiritual life.
              </p>

              <div className="space-y-3 mb-6">
                <FeatureCard icon={Flame} title="Make Room for the Lord — 14 Days">
                  A guided fasting journey with daily scripture, prayer, and live Zoom sessions. Choose your fasting type and track progress.
                </FeatureCard>
                <FeatureCard icon={Shield} title="30-Day No Sugar Challenge">
                  Break free from sugar addiction with daily science + scripture. Learn what happens biologically at each phase.
                </FeatureCard>
                <FeatureCard icon={Heart} title="21 Days to Release Fear, Forgive & Find Peace">
                  Blending scripture, neuroscience, and emotional intelligence to release fear and find peace.
                </FeatureCard>
                <FeatureCard icon={Users} title="Kingdom Couples — 6-Week Marriage Journey">
                  Strengthen your marriage through faith-based principles and daily couple devotionals.
                </FeatureCard>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How Programmes Work</h3>
              <Step number="1" title="Browse & Enrol">
                Go to Programs tab, browse available programmes, and tap "Learn More" then "Join."
              </Step>
              <Step number="2" title="Daily Content">
                Each day unlocks scripture, devotional, action step, and reflection questions. Days unlock sequentially.
              </Step>
              <Step number="3" title="Complete Your Day">
                Read, reflect, complete the action, and mark done. This updates your streak and earns points.
              </Step>
              <Step number="4" title="Track Progress">
                See completion percentage, days done, and milestone achievements.
              </Step>

              <TipBox>
                The No Sugar Challenge includes "Temple Science" sections explaining exactly what happens in your body — from insulin dropping on Day 1 to full system restoration by Day 30.
              </TipBox>
            </Section>
          </div>

          {/* ===== 05 RECIPES ===== */}
          <div id="section-05">
            <Section number="05" title="Recipes &" highlight="Meal Planning">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Nourish your temple with faith-inspired, genuinely healthy recipes. Browse, generate with AI, and plan your meals.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <FeatureCard icon={Search} title="Search & Filter">
                  Filter by Daniel Fast, Vegan, Keto, Gluten-Free, Mediterranean, Low-Carb, and more.
                </FeatureCard>
                <FeatureCard icon={Sparkles} title="AI Recipe Generator">
                  Generate unique recipes tailored to your preferences — meal type, cuisine, dietary needs, and cooking time.
                </FeatureCard>
                <FeatureCard icon={ArrowRightLeft} title="Healthy Swaps">
                  Every recipe shows common unhealthy ingredients people typically use and the healthier alternative.
                </FeatureCard>
                <FeatureCard icon={BookOpen} title="Scripture Meditation">
                  Each recipe includes a Bible verse connecting the meal to faith and body stewardship.
                </FeatureCard>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Meal Planner & Pantry</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Tap <strong>"Planner"</strong> to create weekly meal plans. Assign recipes to days and meal types. Tap <strong>"Pantry"</strong> to manage ingredients and generate shopping lists you can export as PDF.
              </p>

              <TipBox>
                All recipes are genuinely healthy — no refined sugar, no processed seed oils, no artificial additives. Even desserts use natural sweeteners like dates, fruit, and raw honey.
              </TipBox>
            </Section>
          </div>

          {/* ===== 06 COMMUNITY ===== */}
          <div id="section-06">
            <Section number="06" title="Community" highlight="Pods">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Small groups for accountability, prayer, and encouragement. Share victories, exchange recipes, and support each other.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <FeatureCard icon={Heart} title="Prayer & Encouragement">
                  Share prayer requests, celebrate answered prayers, and lift each other up.
                </FeatureCard>
                <FeatureCard icon={ChefHat} title="Healthy Temple Recipes">
                  Share wholesome recipes, meal prep ideas, and kitchen wins.
                </FeatureCard>
              </div>

              <Step number="1" title="Go to Community tab">
                Tap "Community" in the bottom navigation.
              </Step>
              <Step number="2" title="Discover public pods">
                Tap "Discover" to see available pods you can join.
              </Step>
              <Step number="3" title="Create your own">
                Tap "New Pod" to create a pod for your church, small group, or friends. Public or private, up to 50 members.
              </Step>

              <TipBox>
                People who join a community pod are significantly more likely to complete a programme. Find your people — accountability is powerful.
              </TipBox>
            </Section>
          </div>

          {/* ===== 07 PROFILE ===== */}
          <div id="section-07">
            <Section number="07" title="Your Profile &" highlight="Settings">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your journey at a glance — stats, achievements, and settings.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <FeatureCard icon={Lock} title="Quick PIN Login">
                  Set a 4-digit PIN for faster access.
                </FeatureCard>
                <FeatureCard icon={Bell} title="Notifications">
                  Manage reminders and alerts.
                </FeatureCard>
                <FeatureCard icon={Trophy} title="Achievements">
                  View your level, points, and unlocked badges.
                </FeatureCard>
                <FeatureCard icon={Share2} title="Invite Friends">
                  Share your link and earn 25 points per signup.
                </FeatureCard>
              </div>
            </Section>
          </div>

          {/* ===== 08 TIPS ===== */}
          <div id="section-08">
            <Section number="08" title="Tips for" highlight="Success">
              <div className="space-y-3">
                <Step number="1" title="Make it part of your morning routine">
                  Open Temple Keepers during devotional time. Read the scripture, reflect, and set your wellness intention.
                </Step>
                <Step number="2" title="Join a programme">
                  Structured daily content keeps you engaged. Even if you're not fasting, try the No Sugar Challenge.
                </Step>
                <Step number="3" title="Join a community pod">
                  You're more likely to stick with it when others are on the journey with you.
                </Step>
                <Step number="4" title="Use the AI Recipe Generator">
                  Generate recipes tailored to your exact needs and save your favourites.
                </Step>
                <Step number="5" title="Track your streak">
                  Daily consistency matters more than perfection. Even 2 minutes builds your streak.
                </Step>
                <Step number="6" title="Invite friends and family">
                  The journey is always better together. Share your link from your Profile page.
                </Step>
              </div>
            </Section>
          </div>

          {/* ===== 09 FAQ ===== */}
          <div id="section-09">
            <Section number="09" title="Frequently Asked" highlight="Questions">
              <div className="space-y-6">
                {[
                  { q: 'Is Temple Keepers really free?', a: 'Yes! Temple Keepers is 100% free. All programmes, recipes, community features, and AI tools are available at no cost.' },
                  { q: 'Do I need to download anything?', a: 'No. It works in your browser. However, you can install it on your home screen for an app-like experience.' },
                  { q: 'Is this only for women?', a: 'No — Temple Keepers is for all Christians over 25, both men and women.' },
                  { q: 'What Bible version do you use?', a: 'We use the King James Version (KJV) for all scripture references.' },
                  { q: 'Can I do multiple programmes at once?', a: 'You can be enrolled in multiple, but we recommend focusing on one at a time for best results.' },
                  { q: 'What dietary options are available?', a: 'Daniel Fast, Vegetarian, Vegan, Pescatarian, Gluten-Free, Dairy-Free, Nut-Free, Low-Carb, Keto, Paleo, Whole-Foods, Mediterranean, and Low-Sodium.' },
                  { q: 'Is my data private?', a: 'Yes. Your data is private and secure. We never sell your information. See our Privacy Policy for full details.' },
                  { q: 'Can I delete my account?', a: 'Yes. Go to Profile → Account Management → Delete Account. Type "DELETE" to confirm and your account and all data will be permanently removed instantly.' },
                  { q: 'Can I remove my personal details without deleting my account?', a: 'Yes. Go to Profile → Account Management → Remove Personal Details. This clears your name, phone, location, and health/spiritual profiles while keeping your account active.' },
                  { q: 'How do I get support?', a: 'Email us at support@templekeepers.app or reach out through our social media channels.' },
                ].map((item, i) => (
                  <div key={i}>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 flex items-start gap-2">
                      <HelpCircle className="w-5 h-5 text-temple-purple dark:text-temple-gold flex-shrink-0 mt-0.5" />
                      {item.q}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">{item.a}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-2">
              "Do you not know that your bodies are temples of the Holy Spirit?"
            </p>
            <p className="text-sm font-semibold text-temple-purple dark:text-temple-gold mb-4">
              — 1 Corinthians 6:19
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              © 2026 Sagacity Network Ltd (Company No. 15712287)
            </p>
            {!user && (
              <button
                onClick={() => navigate('/signup')}
                className="mt-6 btn-primary"
              >
                Start Your Journey — It's Free <ArrowRight className="w-4 h-4 inline ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>

      {user && <BottomNav />}
    </>
  )
}
