# Temple Keepers V2

A daily Christian wellness companion for mind, body, and spirit.

## 🎯 Core Philosophy

> *Faithful daily stewardship, not extreme discipline, produces lasting transformation.*

Temple Keepers is a **gentle daily rhythm** that helps you return—not "win." It integrates faith and health naturally, removing shame from wellness.

---

## 🚀 Quick Start

### 1. Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose a name (e.g., "temple-keepers")
4. Set a strong database password
5. Choose a region close to you
6. Click "Create new project"

### 2. Set Up Database

1. In your Supabase project, go to **SQL Editor**
2. Copy the entire contents of `database/migration.sql`
3. Paste into a new query
4. Click **Run**
5. Verify tables are created (you should see: `profiles`, `daily_logs`, `daily_log_entries`)

### 3. Get Your API Keys

In your Supabase project:
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 4. Get Gemini API Key

1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Create a new API key
4. Copy it

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your keys:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

### 6. Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` 🎉

---

## 📅 Build Status

### ✅ COMPLETE - All 7 Days Done!

**Day 1-2: Foundation** ✅
- [x] Project setup (Vite + React)
- [x] Design system (glass cards, animations)
- [x] Supabase configuration
- [x] Auth (email/password + first name)
- [x] Database schema with RLS
- [x] Today Hub layout (4 blocks)

**Day 3: Polish & Dark Mode** ✅
- [x] Logo in top-left
- [x] Dark mode toggle
- [x] "Temple Care Today" title
- [x] Theme persistence

**Day 4-5: Core Features** ✅
- [x] Check-in modal (mood + note)
- [x] Meal logging modal
- [x] Database integration
- [x] Real-time summary updates
- [x] useTodayLog hook

**Day 6: AI Devotional** ✅
- [x] Gemini integration
- [x] Daily devotional generation
- [x] Database caching
- [x] Fallback Scripture
- [x] useDevotional hook

**Day 7: Deployment Ready** ✅
- [x] Vercel configuration
- [x] Deployment guide
- [x] Pre-launch checklist
- [x] Production optimizations

---

## 🚀 Ready to Deploy

The app is production-ready! Follow **DEPLOYMENT.md** to ship it.

---

## 🏗️ Project Structure

```
temple-keepers-v2/
├── src/
│   ├── components/
│   │   └── LoadingSpinner.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── Today.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── database/
│   └── migration.sql
├── .env.example
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🎨 Design System

### Colors
- **Purple**: `#7B2D8E` (temple-purple)
- **Gold**: `#D4A574` (temple-gold)

### Components
- `welcome-card` - Welcome message
- `scripture-card` - Daily devotional
- `action-card` - Interactive buttons
- `summary-card` - Day summary
- `btn-primary` - Purple gradient
- `btn-gold` - Gold gradient
- `glass-input` - Form inputs

### Animations
- `animate-fade-in` - Gentle entrance
- `animate-float` - Logo animation
- `stagger-children` - Sequential reveals

---

## 📊 Database Schema

### `profiles`
- `id` (UUID) - References auth.users
- `first_name` (TEXT)
- `email` (TEXT)
- `created_at` / `updated_at`

### `daily_logs`
- `id` (UUID)
- `user_id` (UUID)
- `log_date` (DATE)
- One per user per day (UNIQUE constraint)

### `daily_log_entries`
- `id` (UUID)
- `log_id` (UUID)
- `entry_type` (TEXT) - 'mood', 'note', 'meal', 'devotional'
- `entry_data` (JSONB) - Flexible storage

---

## 🔐 Security

- **RLS enabled** on all tables
- Users can only see their own data
- Auth handled by Supabase
- No sensitive data in frontend code

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Testing Signup/Login

1. Go to `/signup`
2. Enter: First Name, Email, Password
3. Should redirect to `/today`
4. Profile should be auto-created
5. Check Supabase → Table Editor → profiles

---

## 🎯 The Today Hub (4 Blocks)

### Block 1: Welcome Card
- Time-based greeting
- User's first name
- Gentle encouragement

### Block 2: Daily Bread
- AI-generated devotional
- Scripture verse (NKJV)
- Short reflection

### Block 3: One Small Step
- Quick Check-In button
- Log a Meal button

### Block 4: Today Summary
- Check-ins count
- Meals logged list
- Empty state message

---

## 📝 Notes

### What Makes This Different
- **No streaks** - Every day is complete in itself
- **No backlog** - No "catching up"
- **Grace-first** - Designed for your worst day
- **Faith-integrated** - Christ-centered, Scripture-anchored

### From the Vision Doc
> *"This is not an app people 'complete'. It's an app people come back to."*

---

## 🙏 Support

If you have issues:
1. Check `.env` has all three keys
2. Verify database migration ran successfully
3. Check browser console for errors
4. Verify Supabase RLS is enabled

---

Built with faith, care, and clean code. 💜
