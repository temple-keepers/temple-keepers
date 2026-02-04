import { useNavigate } from 'react-router-dom'
import { Heart, BookOpen, Users, Award } from 'lucide-react'
import { PublicHeader } from '../components/PublicHeader'

export const AboutDenise = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <PublicHeader />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="glass-card p-12 mb-8 text-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 mx-auto mb-6 flex items-center justify-center text-6xl">
            💜
          </div>
          
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-3">
            Denise Parris
          </h1>
          
          <p className="text-xl text-temple-purple dark:text-temple-gold font-semibold mb-4">
            Founder & Health & Wellness Coach
          </p>
          
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Helping Christians over 25 discover a grace-filled approach to wellness 
            that honors God and nourishes both body and spirit
          </p>
        </div>

        {/* Story */}
        <div className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-temple-purple dark:text-temple-gold" />
            My Story
          </h2>
          
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              I know firsthand what it's like to struggle with health challenges and feel disconnected 
              from your body. My journey to wellness wasn't about willpower or strict diets—it was about 
              discovering the transformative power of holistic nutrition, lifestyle medicine, and most 
              importantly, faith-based approaches that honor the body as God's temple.
            </p>
            
            <p>
              After overcoming significant health challenges through a grace-filled approach to wellness, 
              I felt called to share this message with others. Too many Christians feel caught between 
              the pressure-driven world of secular fitness culture and the guilt of not "having it all together."
            </p>
            
            <p>
              Temple Keepers was born from this vision: to create a space where faith and wellness aren't 
              separate pursuits but beautifully integrated. Where grace meets practical action. Where you're 
              met exactly where you are, with no shame, no streaks, and no pressure—just gentle guidance 
              toward becoming the healthiest version of yourself.
            </p>
          </div>
        </div>

        {/* Credentials */}
        <div className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-temple-purple dark:text-temple-gold" />
            Credentials & Certifications
          </h2>
          
          <ul className="space-y-3">
            {[
              'Integrative Nutrition Health Coach',
              'Nutritional Therapist',
              'Advanced Clinical Weight Loss Practitioner',
              'Faith-Based Wellness Specialist'
            ].map((credential, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-temple-purple/10 dark:bg-temple-gold/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-temple-purple dark:text-temple-gold text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">{credential}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Philosophy */}
        <div className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-temple-purple dark:text-temple-gold" />
            My Philosophy
          </h2>
          
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="font-semibold text-gray-900 dark:text-white">
              "Your body is a temple of the Holy Spirit... honor God with your body." 
              <span className="text-temple-purple dark:text-temple-gold"> — 1 Corinthians 6:19-20 (NKJV)</span>
            </p>
            
            <p>
              This isn't about perfection—it's about stewardship. It's not about earning God's love 
              through good habits—it's about responding to His love by caring for the gift He's given you.
            </p>
            
            <p>
              I believe in:
            </p>
            
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Grace over guilt:</strong> Small, sustainable changes without shame</li>
              <li><strong>Faith integration:</strong> Every aspect anchored in scripture and prayer</li>
              <li><strong>Holistic approach:</strong> Mind, body, and spirit working together</li>
              <li><strong>Real food:</strong> Nourishment that honors both culture and faith</li>
              <li><strong>Community:</strong> We're stronger together in accountability and encouragement</li>
            </ul>
          </div>
        </div>

        {/* Mission */}
        <div className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-temple-purple dark:text-temple-gold" />
            The Temple Keepers Mission
          </h2>
          
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Temple Keepers exists to help Christians over 25 discover that caring for their body 
              is an act of worship. We're building a community where:
            </p>
            
            <ul className="space-y-3">
              {[
                'Faith and wellness are seamlessly integrated',
                'Grace meets you exactly where you are',
                'Every small step is celebrated',
                'Scripture guides your daily journey',
                'Community provides accountability without judgment',
                'Your unique story and struggles are honored'
              ].map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-temple-purple dark:text-temple-gold">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            
            <p className="pt-4 italic text-temple-purple dark:text-temple-gold">
              Whether you're just beginning your wellness journey or you've been walking this path 
              for years, Temple Keepers is your companion—offering daily encouragement, practical 
              tools, and a grace-filled community.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="glass-card p-8 text-center bg-gradient-to-br from-temple-purple/5 to-temple-gold/5">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Ready to Start Your Journey?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Join me and thousands of others discovering grace-filled wellness
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="btn-primary text-lg px-8 py-3"
          >
            Begin Your Free Journey
          </button>
        </div>

        {/* Contact */}
        <div className="text-center mt-8 text-gray-600 dark:text-gray-400">
          <p>Based in Basildon, UK</p>
          <p className="mt-2">
            Questions? <a href="mailto:denise@templekeepers.com" className="text-temple-purple dark:text-temple-gold hover:underline">
              denise@templekeepers.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
