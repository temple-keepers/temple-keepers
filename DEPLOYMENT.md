# Deployment Guide - Temple Keepers V2 🚀

## Deploy to Vercel (Recommended)

Vercel is free for hobby projects and perfect for Vite + React apps.

---

## Step 1: Prepare Your Code (5 minutes)

### 1. Make sure everything works locally
```bash
npm run dev
```

Test:
- ✅ Sign up / Login works
- ✅ Check-in saves to database
- ✅ Meal logging works
- ✅ AI devotional generates
- ✅ Dark mode toggles
- ✅ No console errors

### 2. Build for production
```bash
npm run build
```

This creates a `dist/` folder with optimized files.

### 3. Test the production build
```bash
npm run preview
```

Visit the URL shown. Everything should work the same as dev.

---

## Step 2: Create Vercel Account (2 minutes)

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub (recommended) or email
4. Verify your email

---

## Step 3: Deploy from GitHub (10 minutes)

### Option A: Using GitHub (Recommended)

1. **Create GitHub repository:**
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it: `temple-keepers`
   - Make it **Private** (important!)
   - Click "Create repository"

2. **Push your code:**
   ```bash
   cd temple-keepers-v2
   git init
   git add .
   git commit -m "Initial commit - Temple Keepers V2"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/temple-keepers.git
   git push -u origin main
   ```

3. **Connect to Vercel:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Select your `temple-keepers` repo
   - Click "Import"

### Option B: Deploy without Git

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd temple-keepers-v2
   vercel
   ```

3. Follow prompts:
   - "Set up and deploy?" → **Yes**
   - "Which scope?" → Select your account
   - "Link to existing project?" → **No**
   - "Project name?" → `temple-keepers` (or your choice)
   - "Directory?" → **./** (press Enter)
   - "Override settings?" → **No**

---

## Step 4: Add Environment Variables (5 minutes)

**CRITICAL:** You must add these in Vercel dashboard.

1. Go to your project in Vercel
2. Click "Settings" tab
3. Click "Environment Variables" in sidebar
4. Add these three variables:

### Variable 1: VITE_SUPABASE_URL
- **Name:** `VITE_SUPABASE_URL`
- **Value:** Your Supabase project URL (from Supabase → Settings → API)
- **Environments:** Production, Preview, Development (check all)

### Variable 2: VITE_SUPABASE_ANON_KEY
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** Your Supabase anon key (from Supabase → Settings → API)
- **Environments:** Production, Preview, Development (check all)

### Variable 3: VITE_GEMINI_API_KEY
- **Name:** `VITE_GEMINI_API_KEY`
- **Value:** Your Gemini API key (from ai.google.dev)
- **Environments:** Production, Preview, Development (check all)

4. Click "Save" for each one

---

## Step 5: Redeploy (2 minutes)

After adding environment variables:

1. Go to "Deployments" tab
2. Click "..." menu on latest deployment
3. Click "Redeploy"
4. Click "Redeploy" to confirm

Wait 1-2 minutes for build to complete.

---

## Step 6: Configure Supabase URL (5 minutes)

Your app will have a Vercel URL like: `https://temple-keepers.vercel.app`

You need to tell Supabase this URL is allowed.

1. **Go to Supabase Dashboard**
2. **Settings** → **Authentication**
3. **Site URL:** Add your Vercel URL (e.g., `https://temple-keepers.vercel.app`)
4. **Redirect URLs:** Add these:
   ```
   https://temple-keepers.vercel.app/today
   https://temple-keepers.vercel.app/*
   ```
5. Click **Save**

---

## Step 7: Test Production App (5 minutes)

Visit your Vercel URL (e.g., `https://temple-keepers.vercel.app`)

### Test Checklist:
- [ ] Page loads (no errors)
- [ ] Can sign up with new account
- [ ] Profile created in Supabase
- [ ] Can log in
- [ ] Redirects to `/today`
- [ ] Logo shows (if not, see troubleshooting below)
- [ ] Dark mode toggles
- [ ] AI devotional loads (might take 5-10 seconds first time)
- [ ] Can check in → saves → appears in Temple Care Today
- [ ] Can log meal → saves → appears in Temple Care Today
- [ ] Sign out works
- [ ] Can sign back in

### Mobile Test:
- [ ] Open on phone
- [ ] Everything responsive
- [ ] Modals work on small screen
- [ ] Buttons easy to tap

---

## Step 8: Custom Domain (Optional, 10 minutes)

Want `app.templekeepers.com` instead of `.vercel.app`?

1. **Buy domain** (Namecheap, Google Domains, etc.)
2. **In Vercel:**
   - Go to project → Settings → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `app.templekeepers.com`)
   - Follow DNS instructions
3. **Wait 5-60 minutes** for DNS to propagate

---

## Troubleshooting

### Logo doesn't show
- Make sure `public/logo.png` exists in your repo
- Check browser console for 404 errors
- Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### "Missing environment variables" error
- Check all 3 variables are added in Vercel
- Make sure names match exactly: `VITE_SUPABASE_URL` (not `SUPABASE_URL`)
- Redeploy after adding variables

### Can't sign up / Database errors
- Check Supabase RLS policies are enabled
- Verify anon key is correct
- Check Supabase logs: Dashboard → Logs

### AI devotional doesn't generate
- Check Gemini API key is correct
- Check API key has quota remaining
- Check browser console for errors
- Fallback Scripture should still show if AI fails

### Authentication redirect fails
- Make sure Vercel URL is in Supabase redirect URLs
- Use exact URL (no trailing slash unless Vercel adds one)
- Wait 5 minutes after changing Supabase settings

---

## Security Checklist

Before going live:

- [ ] `.env` is in `.gitignore` (never commit API keys!)
- [ ] GitHub repo is **Private** (or at least `.env` excluded)
- [ ] RLS policies enabled on all Supabase tables
- [ ] Supabase anon key (not service key) in production
- [ ] Redirect URLs restricted to your domain only
- [ ] No debug/test files committed

---

## Performance Tips

- [ ] Images optimized (logo is small)
- [ ] No console.log in production code (optional cleanup)
- [ ] Lazy load routes if app grows (not needed yet)
- [ ] Enable Vercel Analytics (free, optional)

---

## Ongoing Maintenance

### Daily:
- Check error logs in Vercel dashboard
- Monitor Gemini API usage

### Weekly:
- Review Supabase usage (database size, API calls)
- Check for new npm security updates: `npm audit`

### Monthly:
- Review and update dependencies: `npm outdated`
- Backup Supabase database (Supabase → Database → Backups)

---

## Costs

**Free Tier Limits:**
- **Vercel:** Unlimited personal projects (hobby plan)
- **Supabase:** 500MB database, 2GB bandwidth/month (usually enough for small apps)
- **Gemini:** 15 requests/minute, 1500 requests/day (free tier)

**What happens if you exceed:**
- Vercel: Nothing (hobby projects stay free)
- Supabase: App pauses until next month or upgrade to Pro ($25/mo)
- Gemini: Rate limited (fallback Scripture shows instead)

---

## Success! 🎉

Your app is live at: `https://your-app.vercel.app`

Now you can:
- Share with beta testers
- Get feedback
- Iterate and improve
- Add more features

---

## Next Steps

Consider adding:
- Weekly themes management (admin panel)
- User onboarding flow (priorities selection)
- Analytics (Vercel Analytics or Google Analytics)
- Feedback form
- More devotional variety

---

**Congratulations!** You've shipped a real app. 💜

Need help? Check:
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev/)
