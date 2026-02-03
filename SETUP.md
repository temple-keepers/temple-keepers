# Setup Guide - Temple Keepers V2

Follow these steps **in order**. Each step takes 2-5 minutes.

---

## Step 1: Create New Supabase Project (5 min)

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `temple-keepers` (or whatever you prefer)
   - **Database Password**: Create a strong password (save it somewhere)
   - **Region**: Choose closest to UK (e.g., "Europe West (London)")
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

---

## Step 2: Run Database Migration (3 min)

1. In your new Supabase project, click **SQL Editor** (in the left sidebar)
2. Click **"New query"**
3. Open `database/migration.sql` in your code editor
4. Copy **the entire file** (all ~300 lines)
5. Paste into the SQL Editor
6. Click **"Run"** (or press Ctrl/Cmd + Enter)
7. You should see: "Success. No rows returned"

**Verify it worked:**
- Click **"Table Editor"** in the left sidebar
- You should see: `profiles`, `daily_logs`, `daily_log_entries`

---

## Step 3: Get Supabase API Keys (2 min)

1. In Supabase, click **Settings** (gear icon at bottom left)
2. Click **API**
3. Copy these two values:

   **Project URL**: 
   ```
   https://xxxxx.supabase.co
   ```
   
   **anon public key**: 
   ```
   eyJhbGc... (long string)
   ```

Keep these safe—you'll need them in the next step.

---

## Step 4: Get Gemini API Key (3 min)

1. Go to [https://ai.google.dev/gemini-api/docs/api-key](https://ai.google.dev/gemini-api/docs/api-key)
2. Click **"Get API key"** or **"Get started"**
3. Sign in with Google
4. Click **"Create API Key"**
5. Select **"Create API key in new project"**
6. Copy the key (starts with `AIza...`)

---

## Step 5: Configure .env File (2 min)

1. In your project folder, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your code editor

3. Replace the placeholder values with your actual keys:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   VITE_GEMINI_API_KEY=AIza...
   ```

4. Save the file

**⚠️ Important**: Never commit `.env` to git (it's already in `.gitignore`)

---

## Step 6: Install Dependencies (2 min)

In your terminal, in the project folder:

```bash
npm install
```

This will install React, Supabase, Tailwind, and other dependencies.

---

## Step 7: Start Development Server (1 min)

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step 8: Test Signup Flow (3 min)

1. You should be redirected to `/login`
2. Click **"Create one"** to go to signup
3. Fill in:
   - **First Name**: Your name
   - **Email**: Your email
   - **Password**: At least 6 characters
4. Click **"Create Account"**
5. You should be redirected to `/today`
6. You should see: "Welcome back, [Your Name]!"

**Verify in Supabase:**
1. Go to **Table Editor** → **profiles**
2. You should see your profile with your name and email

---

## Step 9: Test Login Flow (2 min)

1. Click **"Sign Out"** in the top right
2. Try logging in with your email and password
3. You should land back on `/today`

---

## ✅ You're Done!

If all the above works, you have:
- ✅ Clean Supabase project
- ✅ Database with RLS security
- ✅ Working auth (signup/login/logout)
- ✅ Today Hub displaying
- ✅ Profile auto-creation

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` file exists (not `.env.example`)
- Check all three variables are filled in
- Restart dev server (`Ctrl+C`, then `npm run dev`)

### Can't sign up / "User already registered"
- Go to Supabase → **Authentication** → **Users**
- Delete the test user
- Try again

### Profile not created
- Go to Supabase → **SQL Editor**
- Run: `SELECT * FROM auth.users;`
- Check if trigger exists: Look for `on_auth_user_created` in Database → Triggers

### Logo not showing
- Make sure `public/logo.png` exists
- If not, copy it from your old project

---

## 📞 Next Steps

Once setup is complete, we'll add:
- Day 4-5: Check-in modal + meal logging
- Day 6: AI devotional (using Gemini)
- Day 7: Polish + deploy to Vercel

---

**Questions?** Just ask! 💜
