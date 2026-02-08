import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BookOpen, Heart, Users, Sparkles, Calendar, ChefHat, 
  ArrowRight, Menu, X, Flame, Shield, Star, Check,
  Clock, Zap, Award, Sun, Moon
} from 'lucide-react'

// Animated counter hook
const useCounter = (end, duration = 2000, startOnView = true) => {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!startOnView) {
      setStarted(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [started, end, duration])

  return { count, ref }
}

export const Landing = () => {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const cuisinesCounter = useCounter(10)
  const featuresCounter = useCounter(25)

  return (
    <div className="min-h-screen bg-[#0D0B1A] text-white overflow-hidden">
      
      {/* ═══ Ambient Background ═══ */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-temple-purple/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-temple-gold/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-purple-900/15 rounded-full blur-[80px]" />
      </div>

      {/* ═══ Header ═══ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrollY > 50 
          ? 'bg-[#0D0B1A]/90 backdrop-blur-xl border-b border-white/5 py-3' 
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Temple Keepers" className="w-10 h-10 drop-shadow-lg" />
            <span className="font-display text-2xl font-bold bg-gradient-to-r from-temple-gold-light to-temple-gold bg-clip-text text-transparent">
              Temple Keepers
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-temple-gold transition-colors">Features</a>
            <a href="#programs" className="text-sm text-gray-400 hover:text-temple-gold transition-colors">Programs</a>
            <a href="#about" className="text-sm text-gray-400 hover:text-temple-gold transition-colors">About</a>
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="relative group px-5 py-2.5 rounded-full text-sm font-semibold overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-temple-purple via-temple-purple-light to-temple-gold opacity-90 group-hover:opacity-100 transition-opacity" />
              <span className="relative text-white">Join Free</span>
            </button>
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0D0B1A]/95 backdrop-blur-xl border-b border-white/5">
            <div className="px-6 py-6 space-y-3">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Programs', href: '#programs' },
                { label: 'About Denise', action: () => navigate('/about-denise') },
                { label: 'Roadmap', action: () => navigate('/roadmap') },
              ].map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => { 
                    if (item.action) { e.preventDefault(); item.action() }
                    setMobileMenuOpen(false) 
                  }}
                  className="block py-3 text-gray-300 hover:text-white border-b border-white/5 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <div className="flex gap-3 pt-3">
                <button onClick={() => { navigate('/login'); setMobileMenuOpen(false) }}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-center text-sm font-medium text-gray-300 hover:bg-white/5">
                  Sign In
                </button>
                <button onClick={() => { navigate('/signup'); setMobileMenuOpen(false) }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-temple-purple to-temple-gold text-center text-sm font-semibold text-white">
                  Join Free
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[100vh] flex items-center justify-center pt-20">
        {/* Cross light ray effect */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[2px] h-40 bg-gradient-to-b from-temple-gold/40 to-transparent" />
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-gradient-to-r from-transparent via-temple-gold/30 to-transparent" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Launch Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-temple-gold/30 bg-temple-gold/5 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-temple-gold-light font-medium">
              ✨ Now live — join free and start your journey today
            </span>
          </div>

          <h1 className="text-[2.75rem] sm:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6">
            <span className="text-white">Your Body Is</span>
            <br />
            <span className="bg-gradient-to-r from-temple-gold-light via-temple-gold to-amber-400 bg-clip-text text-transparent">
              God's Temple
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            The first faith-based wellness platform that integrates 
            <span className="text-gray-200"> scripture, fasting, nutrition, and community </span>
            to help you honour the temple God gave you.
          </p>

          <p className="text-base text-temple-gold/80 italic font-display mb-10">
            "Do you not know that your bodies are temples of the Holy Spirit?"
            <span className="text-gray-500 not-italic text-sm ml-2">— 1 Corinthians 6:19</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/signup')}
              className="group relative px-8 py-4 rounded-xl text-lg font-semibold overflow-hidden shadow-2xl shadow-temple-purple/20 hover:shadow-temple-purple/40 transition-shadow"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-temple-purple via-temple-purple-light to-temple-purple" />
              <span className="absolute inset-0 bg-gradient-to-r from-temple-purple via-temple-gold to-temple-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative flex items-center justify-center gap-2 text-white">
                Start Your Journey — It's Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-8 py-4 rounded-xl text-lg font-medium border border-white/10 text-gray-300 hover:bg-white/5 hover:border-white/20 transition-all"
            >
              See What's Inside
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-green-400" />
              100% Free
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-700" />
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-pink-400" />
              Grace-Based
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-700" />
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-temple-gold" />
              NKJV Scripture
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce text-gray-600" style={{ animationDuration: '3s' }}>
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-gray-700 flex items-start justify-center p-1">
            <div className="w-1.5 h-2.5 rounded-full bg-temple-gold/50 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ═══ WHAT IS TEMPLE KEEPERS ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Text */}
            <div>
              <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-temple-gold mb-4">
                Why Temple Keepers?
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6 leading-tight">
                Wellness Shouldn't Feel Like 
                <span className="text-temple-gold"> Punishment</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Most wellness apps are built on guilt, restriction, and willpower. 
                Temple Keepers is different. We start with <span className="text-white">grace</span>, 
                ground every day in <span className="text-white">scripture</span>, and walk alongside each other 
                with <span className="text-white">gentle accountability</span> — never shame.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                This app was born from a personal health journey — one that's still ongoing.
                Denise built Temple Keepers because she needed it too, and figured others might as well.
                We're all walking this out together.
              </p>
              <button
                onClick={() => navigate('/about-denise')}
                className="text-temple-gold hover:text-temple-gold-light flex items-center gap-2 font-medium transition-colors"
              >
                Read Denise's story
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right - Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Flame, value: '3', label: 'Fasting Options', sublabel: 'No-food · Time-window · Daniel Fast', color: 'from-orange-500 to-red-500' },
                { icon: ChefHat, ref: cuisinesCounter.ref, value: cuisinesCounter.count, label: 'World Cuisines', sublabel: 'Caribbean, African, Asian & more', color: 'from-blue-500 to-cyan-500' },
                { icon: Calendar, value: '✓', label: 'Guided Programs', sublabel: 'Fasting, challenges & more', color: 'from-temple-purple to-purple-400' },
                { icon: Zap, ref: featuresCounter.ref, value: featuresCounter.count + '+', label: 'Features', sublabel: 'Devotionals, tracking, recipes…', color: 'from-temple-gold to-amber-400' },
              ].map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div
                    key={i}
                    ref={stat.ref}
                    className="relative group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] backdrop-blur-sm transition-all duration-300"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm font-medium text-gray-300">{stat.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{stat.sublabel}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="relative py-24 sm:py-32">
        {/* Section divider */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-temple-gold mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Everything You Need,
              <span className="text-temple-gold"> Nothing You Don't</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Every feature is designed to support your spiritual and physical journey — with grace at the centre.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Daily Devotionals",
                description: "Start each day grounded in NKJV scripture with AI-enhanced devotionals, reflection questions, and guided prayer.",
                accent: "from-purple-500 to-violet-600"
              },
              {
                icon: Calendar,
                title: "Faith-Based Programs",
                description: "Structured wellness journeys that unlock day by day — including fasting programmes, challenges, and guided devotional series.",
                accent: "from-temple-purple to-pink-500"
              },
              {
                icon: ChefHat,
                title: "AI Recipe Generator",
                description: "Generate recipes across 10 cuisines — Caribbean, African, Mediterranean and more — each paired with scripture meditation.",
                accent: "from-blue-500 to-cyan-400"
              },
              {
                icon: Heart,
                title: "Wellness Tracking",
                description: "Log meals, symptoms, and daily check-ins with gentle accountability. Track your energy, mood, sleep, and hydration.",
                accent: "from-pink-500 to-rose-500"
              },
              {
                icon: Users,
                title: "Community Pods",
                description: "Join accountability pods with other believers. Share prayers, encouragement, and healthy recipes together.",
                accent: "from-green-500 to-emerald-400"
              },
              {
                icon: Award,
                title: "Streaks & Badges",
                description: "Earn faith-themed badges and level up from Seedling to Temple Keeper. Celebrate consistency without pressure.",
                accent: "from-temple-gold to-amber-400"
              }
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={i}
                  className="group relative p-6 sm:p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.accent} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ PROGRAMS OVERVIEW ═══ */}
      <section id="programs" className="relative py-24 sm:py-32">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        {/* Warm glow behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-temple-purple/10 rounded-full blur-[150px]" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-temple-gold mb-4">
              Guided Programs
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Structured Journeys,
              <span className="text-temple-gold"> Your Pace</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Browse programmes designed to support your spiritual and physical growth — one day at a time, with grace built in.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Program card examples */}
            {[
              {
                icon: Flame,
                type: 'Fasting',
                title: 'Fasting Programs',
                description: 'Scripture-grounded fasting journeys with 3 flexible options. Choose your pace, change anytime — no judgement.',
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: Star,
                type: 'Challenge',
                title: 'Wellness Challenges',
                description: 'Short, focused challenges like building a water drinking habit — practical steps paired with daily encouragement.',
                color: 'from-blue-500 to-cyan-400'
              },
              {
                icon: BookOpen,
                type: 'Devotional',
                title: 'Devotional Series',
                description: 'Multi-day devotional journeys that go deeper into themes of health, identity, purpose, and spiritual growth.',
                color: 'from-temple-purple to-purple-400'
              }
            ].map((program, i) => {
              const Icon = program.icon
              return (
                <div key={i} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-6 sm:p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${program.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold tracking-wide uppercase text-gray-500">{program.type}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{program.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">{program.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {['Day-by-day unlock', 'NKJV scripture', 'Progress tracking'].map(tag => (
                        <span key={tag} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/signup')}
              className="group inline-flex items-center gap-2 text-temple-gold hover:text-temple-gold-light font-semibold transition-colors"
            >
              Sign up to browse programs
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-temple-gold mb-4">
              Getting Started
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold">
              Ready in <span className="text-temple-gold">60 Seconds</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-temple-purple via-temple-gold/30 to-temple-gold" />
            
            {[
              { step: '01', title: 'Sign Up Free', desc: 'Create your account — no card needed', icon: Sparkles },
              { step: '02', title: 'Explore', desc: 'Browse programs, recipes, and features', icon: BookOpen },
              { step: '03', title: 'Join a Program', desc: 'Pick a journey that speaks to you', icon: Calendar },
              { step: '04', title: 'Grow Daily', desc: 'New content unlocks each morning', icon: Star }
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="relative text-center group">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 flex items-center justify-center mx-auto mb-5 group-hover:border-temple-gold/30 transition-colors">
                    <Icon className="w-8 h-8 text-temple-gold" />
                  </div>
                  <div className="text-xs text-temple-gold font-bold mb-2">{item.step}</div>
                  <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ ABOUT DENISE ═══ */}
      <section id="about" className="relative py-24 sm:py-32">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-temple-purple/5 to-transparent pointer-events-none" />
            
            <div className="p-8 sm:p-12">
              <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-temple-gold mb-4">
                The Story Behind Temple Keepers
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6 leading-tight">
                I built this because
                <br /><span className="text-temple-gold">I needed it too</span>
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-4 text-gray-400 leading-relaxed">
                  <p>
                    I'm Denise — a wellness coach based in the UK, still very much 
                    on my own healing journey. I've studied nutrition, trained as a health coach, 
                    and learned a lot along the way.
                  </p>
                  <p>
                    But I'm not here as someone who has it all figured out. I built Temple Keepers 
                    because <span className="text-white">I needed a tool that combined faith and wellness</span> — 
                    and I couldn't find one. So I made it, and now I want to walk this road with you.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Background & Training</p>
                  {[
                    'Certified Health & Wellness Coach',
                    'Integrative Nutrition Health Coach',
                    'Nutritional Therapist',
                    'Advanced Fertility Nutritional Advisor',
                    'Advanced Clinical Weight Loss Practitioner'
                  ].map((cert, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-temple-gold flex-shrink-0" />
                      <span className="text-sm text-gray-300">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate('/about-denise')}
                className="mt-8 group flex items-center gap-2 text-temple-gold hover:text-temple-gold-light font-medium transition-colors"
              >
                Read more of my story
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        {/* Big glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-temple-purple/20 rounded-full blur-[150px]" />
        
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-5xl mb-6">✝️</div>
          <h2 className="text-3xl sm:text-5xl font-display font-bold mb-6 leading-tight">
            Let's Honour Our Temples
            <br />
            <span className="bg-gradient-to-r from-temple-gold-light to-temple-gold bg-clip-text text-transparent">
              Together
            </span>
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            None of us have it all figured out — and that's okay. 
            Let's walk this journey of faith and wellness side by side, with grace.
          </p>
          
          <button
            onClick={() => navigate('/signup')}
            className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold overflow-hidden shadow-2xl shadow-temple-purple/30 hover:shadow-temple-purple/50 transition-shadow"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-temple-purple via-temple-purple-light to-temple-gold" />
            <span className="absolute inset-0 bg-gradient-to-r from-temple-gold via-temple-purple to-temple-gold opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <span className="relative text-white">Start Your Free Journey</span>
            <ArrowRight className="relative w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="mt-6 text-sm text-gray-600">
            No credit card required · Always free to start
          </p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative border-t border-white/5 bg-[#080714]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Temple Keepers" className="w-8 h-8" />
                <span className="font-display text-lg font-bold bg-gradient-to-r from-temple-gold-light to-temple-gold bg-clip-text text-transparent">
                  Temple Keepers
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Grace-based wellness for Christians.
                <br />Honour your temple.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-temple-gold transition-colors">Features</a></li>
                <li><a href="#programs" className="hover:text-temple-gold transition-colors">Programs</a></li>
                <li><a href="/roadmap" className="hover:text-temple-gold transition-colors">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/about-denise" className="hover:text-temple-gold transition-colors">About Denise</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/privacy" className="hover:text-temple-gold transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-temple-gold transition-colors">Terms of Service</a></li>
                <li><a href="/cookies" className="hover:text-temple-gold transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 mb-6">
            <p className="text-xs text-gray-600 leading-relaxed text-center max-w-2xl mx-auto">
              <span className="text-gray-500 font-medium">Health Disclaimer:</span>{' '}
              Temple Keepers is for educational and inspirational purposes only. It is not a substitute for 
              professional medical advice, diagnosis, or treatment. Always consult a healthcare professional 
              before starting any fasting, dietary, or wellness programme.
            </p>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">
              © 2026 Sagacity Network Ltd, trading as Temple Keepers. All rights reserved.
            </p>
            <p className="text-xs text-gray-600">
              Registered in England · Company No. 15712287 · Basildon, UK
            </p>
          </div>
        </div>
      </footer>

      {/* ═══ CSS Animations ═══ */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  )
}
