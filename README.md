# 🏛️ Temple Keepers

> **Honor Your Body, Nurture Your Soul**

A beautiful, faith-based wellness platform for Christians that integrates spiritual growth with physical health through AI-powered features.

![Temple Keepers](https://via.placeholder.com/800x400/667eea/ffffff?text=Temple+Keepers)

## ✨ Features

### 🔐 Authentication
- Secure signup and login with Supabase Auth
- Protected routes for authenticated users
- User session management

### 📊 Dashboard
- Personalized welcome messages with time-based greetings
- Real-time stats tracking (streaks, devotionals, recipes, points)
- Daily scripture that rotates throughout the week
- Quick action cards for easy navigation
- Wellness tips and insights

### 📖 Daily Devotionals
- Faith-integrated wellness devotionals
- Multiple themes (General Wellness, Finding Strength, Nourishing Body, Rest & Recovery)
- AI-powered devotional generation using Google Gemini
- Scripture with NKJV translations
- Reflections, prayers, action steps, and affirmations
- Progress tracking

### 🍳 AI Recipe Generator
- Generate healthy, faith-inspired recipes using Google Gemini AI
- Customizable preferences (meal type, cuisine, dietary restrictions)
- Each recipe includes:
  - Detailed ingredients and instructions
  - Scripture meditation related to the meal
  - Nutrition information
  - Prep and cook times
- Save favorite recipes to your profile

### 👤 User Profile
- Edit personal information and bio
- Set health goals and dietary preferences
- View and manage saved recipes
- Configure notification preferences
- Track your wellness journey stats

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS with glass morphism design
- **Routing:** React Router v6
- **Backend:** Supabase (Auth + PostgreSQL)
- **AI:** Google Gemini AI
- **Icons:** Lucide React

## 🎨 Design System

### Colors
- Primary Gradient: `#667eea → #764ba2`
- Background: Soft purple/pink gradients
- Glass morphism effects with backdrop blur

### Typography
- Display: Playfair Display (headings)
- Body: Inter (content)

### Components
- Glass cards with blur effects
- Gradient buttons with hover animations
- Smooth page transitions
- Mobile-responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Google AI Studio account (for Gemini API)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/temple-keepers.git
   cd temple-keepers
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the schema from `database/schema.sql`
   - Copy your project URL and anon key

4. **Get Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key

5. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
temple-keepers/
├── database/
│   └── schema.sql          # Supabase database schema
├── public/
│   └── favicon.svg         # App favicon
├── src/
│   ├── components/
│   │   ├── Layout.jsx      # Main layout with sidebar
│   │   └── ProtectedRoute.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx # Authentication state
│   ├── lib/
│   │   ├── supabase.js     # Supabase client & helpers
│   │   └── gemini.js       # Gemini AI integration
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Devotionals.jsx
│   │   ├── Recipes.jsx
│   │   └── Profile.jsx
│   ├── App.jsx             # Main app with routing
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## 🗄️ Database Schema

### Tables
- **profiles** - User profile information
- **user_stats** - Tracking streaks, points, completions
- **devotionals** - Daily devotional content
- **devotional_progress** - User devotional completions
- **saved_recipes** - User's saved AI-generated recipes
- **daily_challenges** - Wellness challenges
- **challenge_completions** - User challenge tracking

### Key Features
- Row Level Security (RLS) on all tables
- Automatic profile creation on signup
- Streak tracking with triggers
- Points system for gamification

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📱 Mobile Support

Temple Keepers is fully responsive with:
- Mobile-optimized navigation
- Touch-friendly buttons
- Bottom navigation bar on mobile
- Optimized card layouts

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 💜 Created By

**Denise** - Health & Wellness Coach
- Integrative Nutrition Health Coach
- Nutritional Therapist
- Advanced Fertility Nutritional Advisor
- Advanced Clinical Weight Loss Practitioner

---

<p align="center">
  Made with faith & love 💜
  <br>
  <em>"Do you not know that your bodies are temples of the Holy Spirit?"</em>
  <br>
  — 1 Corinthians 6:19
</p>
