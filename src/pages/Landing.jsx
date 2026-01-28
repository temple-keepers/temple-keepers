import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { 
  ChefHat, 
  BookOpen, 
  Droplets, 
  CalendarDays,
  Sparkles,
  Heart,
  Trophy,
  Users,
  Check,
  ChevronDown,
  ChevronUp,
  Star,
  ArrowRight,
  Sun,
  Moon,
  Play,
  Shield,
  Zap,
  Target,
  Quote,
  Mail,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react'

const Landing = () => {
  const { isDark, toggleTheme } = useTheme()
  const [openFaq, setOpenFaq] = useState(null)
  const [billingCycle, setBillingCycle] = useState('monthly')

  const features = [
    {
      icon: ChefHat,
      title: 'AI-Powered Recipes',
      description: 'Generate healthy, delicious recipes tailored to your dietary needs with scripture-based reflections.',
      color: 'green'
    },
    {
      icon: BookOpen,
      title: 'Daily Devotionals',
      description: 'Start each day with faith-centered wellness devotionals that nourish your soul and body.',
      color: 'purple'
    },
    {
      icon: Droplets,
      title: 'Water Tracker',
      description: 'Stay hydrated with visual progress tracking, reminders, and streak goals.',
      color: 'blue'
    },
    {
      icon: CalendarDays,
      title: 'Meal Planner',
      description: 'Plan your weekly meals, save favorites, and generate shopping lists automatically.',
      color: 'amber'
    },
    {
      icon: Trophy,
      title: 'Points & Streaks',
      description: 'Stay motivated with gamified progress tracking, earning points for healthy habits.',
      color: 'gold'
    },
    {
      icon: Heart,
      title: 'Holistic Wellness',
      description: 'Integrate spiritual growth with physical health for complete temple care.',
      color: 'pink'
    }
  ]

  const howItWorks = [
    {
      step: '01',
      title: 'Create Your Account',
      description: 'Sign up in seconds and set your health goals, dietary preferences, and wellness intentions.'
    },
    {
      step: '02',
      title: 'Get Personalized Content',
      description: 'Receive AI-generated recipes and devotionals tailored to your unique journey.'
    },
    {
      step: '03',
      title: 'Track & Transform',
      description: 'Log your progress, build healthy habits, and watch your transformation unfold.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Busy Mum of 3',
      image: '👩🏽',
      quote: 'Temple Keepers helped me find time for both my health and my faith. The recipes are delicious and the devotionals speak to my soul!',
      rating: 5
    },
    {
      name: 'David K.',
      role: 'Church Pastor',
      image: '👨🏿',
      quote: 'I recommend this app to my entire congregation. It beautifully combines biblical wisdom with practical wellness guidance.',
      rating: 5
    },
    {
      name: 'Michelle T.',
      role: 'Wellness Journey',
      image: '👩🏻',
      quote: 'Lost 2 stone in 4 months! The meal planner and water tracker kept me accountable. This app changed my life.',
      rating: 5
    }
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      description: 'Perfect for beginning your wellness journey',
      monthlyPrice: 7.99,
      yearlyPrice: 79.99,
      features: [
        '5 AI recipes per month',
        'Daily devotionals',
        'Water tracking',
        'Basic meal planner',
        'Progress dashboard'
      ],
      popular: false,
      cta: 'Start Free Trial'
    },
    {
      name: 'Growth',
      description: 'Most popular for committed temple keepers',
      monthlyPrice: 14.99,
      yearlyPrice: 149.99,
      features: [
        'Unlimited AI recipes',
        'Daily devotionals',
        'Water tracking with reminders',
        'Full meal planner',
        'Shopping list generator',
        'Progress analytics',
        'Recipe library',
        'Priority support'
      ],
      popular: true,
      cta: 'Start Free Trial'
    },
    {
      name: 'Premium',
      description: 'Complete transformation package',
      monthlyPrice: 29.99,
      yearlyPrice: 299.99,
      features: [
        'Everything in Growth',
        'Personalized coaching tips',
        'Weekly challenges',
        'Prayer journal',
        'Family sharing (up to 5)',
        'Exclusive content',
        '1-on-1 onboarding call',
        'Lifetime updates'
      ],
      popular: false,
      cta: 'Start Free Trial'
    }
  ]

  const faqs = [
    {
      question: 'What makes Temple Keepers different from other wellness apps?',
      answer: 'Temple Keepers is the only wellness platform that truly integrates Christian faith with health. Every recipe comes with scripture-based reflections, and our devotionals focus on honoring your body as God\'s temple. It\'s wellness with purpose and spiritual depth.'
    },
    {
      question: 'How does the AI recipe generator work?',
      answer: 'Our AI considers your dietary preferences, restrictions, and health goals to create personalized recipes. Each recipe includes nutritional information, step-by-step instructions, and a relevant scripture with meditation. You can generate recipes based on ingredients you have or specific cuisines you enjoy.'
    },
    {
      question: 'Can I use Temple Keepers if I have dietary restrictions?',
      answer: 'Absolutely! Our AI supports all major dietary needs including vegetarian, vegan, gluten-free, dairy-free, keto, and more. Simply set your preferences in your profile, and all generated content will respect your requirements.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! All plans come with a 7-day free trial. No credit card required to start. Experience the full features of your chosen plan before committing.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time from your account settings. Your access continues until the end of your billing period. No hidden fees or complicated cancellation processes.'
    },
    {
      question: 'Is my data safe and private?',
      answer: 'Your privacy is our priority. We\'re fully GDPR compliant, use encryption for all data, and never sell your personal information. You can read our detailed Privacy Policy for more information.'
    }
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        isDark ? 'bg-gray-900/80' : 'bg-white/80'
      } backdrop-blur-xl border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Temple Keepers" className="w-10 h-10 object-contain" />
              <span className={`font-display text-xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Temple Keepers
              </span>
            </div>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className={`text-sm font-medium ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                Features
              </a>
              <a href="#how-it-works" className={`text-sm font-medium ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                How It Works
              </a>
              <a href="#pricing" className={`text-sm font-medium ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                Pricing
              </a>
              <a href="#faq" className={`text-sm font-medium ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                FAQ
              </a>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                {isDark ? <Sun className="w-5 h-5 text-gray-300" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
              <Link 
                to="/login"
                className={`text-sm font-medium ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Sign In
              </Link>
              <Link 
                to="/signup"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`relative pt-32 pb-20 overflow-hidden ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-temple-dark to-gray-900' 
          : 'bg-gradient-to-br from-purple-50 via-white to-amber-50'
      }`}>
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl ${
            isDark ? 'bg-temple-purple/20' : 'bg-temple-purple/30'
          }`} />
          <div className={`absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full blur-3xl ${
            isDark ? 'bg-temple-gold/10' : 'bg-temple-gold/20'
          }`} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="text-center lg:text-left">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
                isDark ? 'bg-temple-purple/20 text-temple-purple' : 'bg-temple-purple/10 text-temple-purple'
              }`}>
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Faith-Based Wellness Platform</span>
              </div>
              
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Honor Your Temple,{' '}
                <span className="bg-gradient-to-r from-temple-purple to-temple-gold bg-clip-text text-transparent">
                  Nourish Your Soul
                </span>
              </h1>
              
              <p className={`text-lg sm:text-xl mb-8 max-w-xl mx-auto lg:mx-0 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                The only wellness app that integrates Christian faith with healthy living. 
                AI-powered recipes, daily devotionals, and habit tracking designed for believers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/signup"
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-temple-purple/25 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a 
                  href="#how-it-works"
                  className={`px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                    isDark 
                      ? 'bg-white/10 text-white hover:bg-white/20' 
                      : 'bg-gray-900/5 text-gray-900 hover:bg-gray-900/10'
                  } transition-all`}
                >
                  <Play className="w-5 h-5" />
                  See How It Works
                </a>
              </div>

              {/* Social Proof */}
              <div className="mt-10 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  {['👩🏽', '👨🏿', '👩🏻', '👨🏼', '👩🏾'].map((emoji, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      isDark ? 'bg-gray-700 border-2 border-gray-800' : 'bg-gray-100 border-2 border-white'
                    }`}>
                      {emoji}
                    </div>
                  ))}
                </div>
                <div className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm">Loved by <strong>2,000+</strong> temple keepers</p>
                </div>
              </div>
            </div>

            {/* Right - Visual */}
            <div className="relative">
              <div className={`rounded-3xl overflow-hidden shadow-2xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}>
                {/* Mock App Screenshot */}
                <div className={`p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-temple-purple to-temple-gold flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Today's Recipe</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Generated just for you</p>
                    </div>
                  </div>
                  <div className={`rounded-2xl p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      🥗 Mediterranean Quinoa Bowl
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Prep: 15 min • Cook: 20 min • 450 cal
                    </p>
                    <div className={`mt-3 p-3 rounded-xl ${isDark ? 'bg-temple-purple/20' : 'bg-temple-purple/10'}`}>
                      <p className={`text-sm italic ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        "So whether you eat or drink or whatever you do, do it all for the glory of God."
                      </p>
                      <p className="text-xs text-temple-purple mt-1">— 1 Corinthians 10:31</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className={`absolute -left-8 top-1/4 p-4 rounded-2xl shadow-xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } animate-float`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>6/8 glasses</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Stay hydrated!</p>
                  </div>
                </div>
              </div>

              <div className={`absolute -right-4 bottom-1/4 p-4 rounded-2xl shadow-xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } animate-float-delayed`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>+15 points!</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Devotional done</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-20 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-display font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-temple-purple to-temple-gold bg-clip-text text-transparent">
                Transform
              </span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              A complete wellness platform that honors both your physical health and spiritual growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const colors = {
                green: 'bg-green-500/20 text-green-500',
                purple: 'bg-purple-500/20 text-purple-500',
                blue: 'bg-blue-500/20 text-blue-500',
                amber: 'bg-amber-500/20 text-amber-500',
                gold: 'bg-temple-gold/20 text-temple-gold',
                pink: 'bg-pink-500/20 text-pink-500'
              }
              return (
                <div 
                  key={index}
                  className={`p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
                    isDark 
                      ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700' 
                      : 'bg-white hover:shadow-xl border border-gray-100'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${colors[feature.color]}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={`py-20 ${
        isDark ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-display font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Start Your Journey in{' '}
              <span className="bg-gradient-to-r from-temple-purple to-temple-gold bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                {index < howItWorks.length - 1 && (
                  <div className={`hidden md:block absolute top-12 left-full w-full h-0.5 ${
                    isDark ? 'bg-gray-700' : 'bg-gray-200'
                  }`} style={{ width: 'calc(100% - 3rem)' }} />
                )}
                <div className="text-center">
                  <div className={`w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center ${
                    isDark ? 'bg-gray-700' : 'bg-white shadow-lg'
                  }`}>
                    <span className="text-4xl font-display font-bold bg-gradient-to-r from-temple-purple to-temple-gold bg-clip-text text-transparent">
                      {item.step}
                    </span>
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.title}
                  </h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className={`py-20 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
                isDark ? 'bg-temple-gold/20 text-temple-gold' : 'bg-temple-gold/10 text-temple-gold'
              }`}>
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">My Story</span>
              </div>
              
              <h2 className={`text-3xl sm:text-4xl font-display font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                From Struggling to{' '}
                <span className="bg-gradient-to-r from-temple-purple to-temple-gold bg-clip-text text-transparent">
                  Thriving
                </span>
              </h2>
              
              <div className={`space-y-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <p>
                  For years, I struggled with my health. Chronic fatigue, weight issues, and a disconnection 
                  from my body left me feeling hopeless. Despite being a woman of faith, I couldn't see 
                  how my spiritual life connected to my physical wellbeing.
                </p>
                <p>
                  Everything changed when I discovered the biblical principle of honoring my body as 
                  God's temple. Through holistic nutrition, lifestyle medicine, and faith-based approaches, 
                  I found healing I never thought possible.
                </p>
                <p>
                  <strong>Temple Keepers was born from this transformation.</strong> I created the app I 
                  wished I'd had—one that doesn't separate faith from health, but beautifully weaves them 
                  together.
                </p>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <img 
                  src="/logo.png" 
                  alt="Denise" 
                  className="w-16 h-16 rounded-full object-cover border-4 border-temple-gold/30"
                />
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Denise Parris</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Founder & Certified Health Coach
                  </p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className={`rounded-3xl p-8 ${
                isDark ? 'bg-gray-800' : 'bg-gradient-to-br from-temple-purple/10 to-temple-gold/10'
              }`}>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl text-center ${isDark ? 'bg-gray-700' : 'bg-white shadow-sm'}`}>
                    <p className="text-3xl font-bold bg-gradient-to-r from-temple-purple to-temple-gold bg-clip-text text-transparent">
                      10+
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Years Experience</p>
                  </div>
                  <div className={`p-4 rounded-2xl text-center ${isDark ? 'bg-gray-700' : 'bg-white shadow-sm'}`}>
                    <p className="text-3xl font-bold bg-gradient-to-r from-temple-purple to-temple-gold bg-clip-text text-transparent">
                      2000+
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Lives Changed</p>
                  </div>
                  <div className={`p-4 rounded-2xl text-center ${isDark ? 'bg-gray-700' : 'bg-white shadow-sm'}`}>
                    <p className="text-3xl font-bold bg-gradient-to-r from-temple-purple to-temple-gold bg-clip-text text-transparent">
                      3
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Certifications</p>
                  </div>
                  <div className={`p-4 rounded-2xl text-center ${isDark ? 'bg-gray-700' : 'bg-white shadow-sm'}`}>
                    <p className="text-3xl font-bold bg-gradient-to-r from-temple-purple to-temple-gold bg-clip-text text-transparent">
                      UK
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Based in Basildon</p>
                  </div>
                </div>

                <div className={`mt-6 p-4 rounded-2xl ${isDark ? 'bg-gray-700' : 'bg-white shadow-sm'}`}>
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Certifications:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      Integrative Nutrition Health Coach
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      Nutritional Therapist
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      Clinical Weight Loss Practitioner
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`py-20 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-display font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Loved by{' '}
              <span className="bg-gradient-to-r from-temple-purple to-temple-gold bg-clip-text text-transparent">
                Temple Keepers
              </span>
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Real stories from our community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={`p-6 rounded-2xl ${
                  isDark ? 'bg-gray-700' : 'bg-white shadow-lg'
                }`}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className={`w-8 h-8 mb-4 ${isDark ? 'text-gray-600' : 'text-gray-200'}`} />
                <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    isDark ? 'bg-gray-600' : 'bg-gray-100'
                  }`}>
                    {testimonial.image}
                  </div>
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {testimonial.name}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={`py-20 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl sm:text-4xl font-display font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Simple,{' '}
              <span className="bg-gradient-to-r from-temple-purple to-temple-gold bg-clip-text text-transparent">
                Transparent
              </span>
              {' '}Pricing
            </h2>
            <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Start your 7-day free trial. No credit card required.
            </p>

            {/* Billing Toggle */}
            <div className={`inline-flex items-center gap-4 p-1.5 rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Yearly
                <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-xs">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`relative rounded-2xl p-6 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-temple-purple to-temple-gold p-[2px]'
                    : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-temple-purple to-temple-gold text-white text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className={`h-full rounded-2xl p-6 ${
                  plan.popular
                    ? isDark ? 'bg-gray-800' : 'bg-white'
                    : isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      £{billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 flex-shrink-0 ${
                          plan.popular ? 'text-temple-gold' : 'text-green-500'
                        }`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/signup"
                    className={`block w-full py-3 rounded-xl font-medium text-center transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-temple-purple to-temple-gold text-white hover:opacity-90'
                        : isDark 
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className={`py-20 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl sm:text-4xl font-display font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-temple-purple to-temple-gold bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className={`rounded-2xl overflow-hidden ${
                  isDark ? 'bg-gray-700' : 'bg-white shadow-sm'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className={`w-full px-6 py-4 flex items-center justify-between text-left ${
                    isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-50'
                  } transition-colors`}
                >
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  ) : (
                    <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </button>
                {openFaq === index && (
                  <div className={`px-6 pb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className={`py-20 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`rounded-3xl p-12 ${
            isDark 
              ? 'bg-gradient-to-br from-temple-purple/20 to-temple-gold/10 border border-temple-purple/20' 
              : 'bg-gradient-to-br from-temple-purple/10 to-temple-gold/10'
          }`}>
            <h2 className={`text-3xl sm:text-4xl font-display font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Ready to Transform Your Life?
            </h2>
            <p className={`text-lg mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Join thousands of believers who are honoring their temples and nourishing their souls. 
              Start your free 7-day trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-temple-purple/25 flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/login"
                className={`px-8 py-4 rounded-xl font-semibold ${
                  isDark 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } transition-all`}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Temple Keepers" className="w-10 h-10 object-contain" />
                <span className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Temple Keepers
                </span>
              </div>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Faith-based wellness for Christians who want to honor their bodies as God's temple.
              </p>
              <div className="flex gap-4">
                <a href="#" className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Links */}
         <div>
  <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Product</h4>
  <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
    <li><a href="#features" className="hover:underline">Features</a></li>
    <li><a href="#pricing" className="hover:underline">Pricing</a></li>
    <li><a href="#faq" className="hover:underline">FAQ</a></li>
    <li><Link to="/roadmap" className="hover:underline">Roadmap</Link></li>  {/* ADD THIS */}
  </ul>
</div>

            <div>
              <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Legal</h4>
              <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <li><Link to="/terms" className="hover:underline">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
                <li><Link to="/cookies" className="hover:underline">Cookie Policy</Link></li>
                <li><Link to="/disclaimer" className="hover:underline">Health Disclaimer</Link></li>
              </ul>
            </div>

            <div>
              <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Contact</h4>
              <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@templekeepers.com
                </li>
                <li>Basildon, Essex, UK</li>
              </ul>
            </div>
          </div>

          <div className={`pt-8 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                © {new Date().getFullYear()} Temple Keepers. All rights reserved. Made with ❤️ in the UK
              </p>
              <p className={`text-sm flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Shield className="w-4 h-4" />
                GDPR Compliant
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing