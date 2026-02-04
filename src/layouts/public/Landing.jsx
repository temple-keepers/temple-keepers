import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Heart, Users, Sparkles, Calendar, ChefHat, Check, ArrowRight, Menu, X } from 'lucide-react'

export const Landing = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: BookOpen,
      title: "Daily Scripture & Devotionals",
      description: "Start each day grounded in faith with NKJV scripture and inspiring devotionals"
    },
    {
      icon: Calendar,
      title: "AI-Powered Programs",
      description: "14-day faith-based wellness journeys that unlock one day at a time with grace"
    },
    {
      icon: ChefHat,
      title: "Scripture-Integrated Recipes",
      description: "AI-generated recipes with 10 cuisines, including Caribbean & African, each paired with scripture"
    },
    {
      icon: Heart,
      title: "Gentle Accountability",
      description: "Daily check-ins and meal logging without pressure, streaks, or shame"
    },
    {
      icon: Users,
      title: "Community Pods (Coming Soon)",
      description: "Connect with like-minded believers for prayer, encouragement, and accountability"
    },
    {
      icon: Sparkles,
      title: "AI Wellness Coach",
      description: "Personalized guidance that honors your body as God's temple"
    }
  ]

  const pricingTiers = [
    {
      name: "Free",
      price: "£0",
      period: "forever",
      features: [
        "Daily devotionals",
        "Basic check-ins",
        "5 AI recipes/month",
        "1 active program",
        "Mobile responsive"
      ],
      cta: "Start Free",
      highlighted: false
    },
    {
      name: "Premium",
      price: "£9.99",
      period: "per month",
      features: [
        "Everything in Free",
        "Unlimited AI recipes",
        "Unlimited programs",
        "Meal planning",
        "Priority support",
        "Ad-free experience"
      ],
      cta: "Start Premium Trial",
      highlighted: true
    },
    {
      name: "Church",
      price: "£299",
      period: "per month",
      features: [
        "Everything in Premium",
        "Up to 100 members",
        "Custom branding",
        "Admin dashboard",
        "Group management",
        "Usage analytics"
      ],
      cta: "Contact Us",
      highlighted: false
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Temple Keepers" className="w-10 h-10" />
            <span className="font-display text-2xl font-bold gradient-text">
              Temple Keepers
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-temple-purple dark:hover:text-temple-gold"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary text-sm"
            >
              Get Started
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => {
                  navigate('/about-denise')
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                About
              </button>
              <button
                onClick={() => {
                  navigate('/roadmap')
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Roadmap
              </button>
              <button
                onClick={() => {
                  navigate('/login')
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  navigate('/signup')
                  setMobileMenuOpen(false)
                }}
                className="block w-full btn-primary"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-temple-purple/5 to-temple-gold/5 dark:from-temple-purple/10 dark:to-temple-gold/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 dark:text-white mb-6">
            Nourish Your Body,
            <br />
            <span className="gradient-text">Strengthen Your Faith</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            A grace-based wellness platform for Christians over 25 who want to honor God 
            by caring for their body—His temple.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary text-lg px-8 py-4"
            >
              Start Your Journey Free
            </button>
            <button
              onClick={() => navigate('/about')}
              className="btn-secondary text-lg px-8 py-4"
            >
              Learn More
            </button>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Join Christians worldwide who are discovering a grace-filled approach to wellness
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need for Holistic Wellness
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Integrate faith and wellness with tools designed for your spiritual and physical journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="glass-card p-8 hover:scale-[1.02] transition-transform"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Your Journey in 4 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Sign Up Free", description: "Create your account in 30 seconds" },
              { step: 2, title: "Choose a Program", description: "Browse AI-generated wellness journeys" },
              { step: 3, title: "Start Today", description: "Begin with Day 1 devotional & action" },
              { step: 4, title: "Grow Daily", description: "New content unlocks each day with grace" }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className={`glass-card p-8 ${
                  tier.highlighted
                    ? 'ring-2 ring-temple-purple dark:ring-temple-gold scale-105'
                    : ''
                }`}
              >
                {tier.highlighted && (
                  <div className="text-center mb-4">
                    <span className="px-3 py-1 rounded-full bg-temple-purple dark:bg-temple-gold text-white text-xs font-semibold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {tier.name}
                </h3>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-temple-purple dark:text-temple-gold">
                    {tier.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    /{tier.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/signup')}
                  className={
                    tier.highlighted
                      ? 'btn-primary w-full'
                      : 'btn-secondary w-full'
                  }
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="glass-card p-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 mx-auto mb-6 flex items-center justify-center text-3xl">
              💜
            </div>
            <blockquote className="text-2xl font-serif italic text-gray-700 dark:text-gray-300 mb-6">
              "Finally, a wellness platform that doesn't compromise my faith or make me feel 
              guilty when life happens. The grace-based approach is exactly what I needed."
            </blockquote>
            <p className="font-semibold text-gray-900 dark:text-white">
              — Sarah M., Temple Keepers Member
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-display font-bold text-white mb-6">
            Ready to Honor Your Temple?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join believers worldwide in discovering grace-filled wellness
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="bg-white text-temple-purple dark:text-temple-gold px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-all"
          >
            Start Your Free Journey Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Temple Keepers" className="w-8 h-8" />
                <span className="font-display text-xl font-bold">Temple Keepers</span>
              </div>
              <p className="text-gray-400 text-sm">
                Grace-based wellness for Christians
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="/roadmap" className="hover:text-white">Roadmap</a></li>
                <li><a href="/pricing" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/about-denise" className="hover:text-white">About Denise</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
                <li><a href="/cookies" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 Sagacity Network Ltd, trading as Temple Keepers. All rights reserved.</p>
            <p className="mt-2">Registered in England. Basildon, UK.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
