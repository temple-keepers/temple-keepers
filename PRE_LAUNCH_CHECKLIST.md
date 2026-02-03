# Pre-Launch Checklist 🚀

Use this checklist before deploying to production.

---

## ✅ Code Quality

- [ ] No `console.log()` statements in production code (or acceptable amount)
- [ ] No TODO/FIXME comments blocking launch
- [ ] All features tested locally
- [ ] No errors in browser console
- [ ] Production build works: `npm run build && npm run preview`

---

## ✅ Database

- [ ] Migration script ran successfully in Supabase
- [ ] All tables visible in Table Editor
- [ ] RLS enabled on all tables: `profiles`, `daily_logs`, `daily_log_entries`
- [ ] RLS policies tested (users can only see their own data)
- [ ] Trigger exists: `on_auth_user_created`
- [ ] Function exists: `get_or_create_today_log`

---

## ✅ Authentication

- [ ] Can sign up new account
- [ ] Profile auto-created on signup
- [ ] Can log in with existing account
- [ ] Can log out
- [ ] Session persists on refresh
- [ ] Protected routes work (can't access `/today` without login)
- [ ] Public routes redirect when logged in

---

## ✅ Features

### Check-In
- [ ] Modal opens when clicking "Quick Check-In"
- [ ] Can select mood
- [ ] Can add optional note
- [ ] Saves to database (check Supabase)
- [ ] Appears in Temple Care Today
- [ ] Multiple check-ins work (count increases)

### Meal Logging
- [ ] Modal opens when clicking "Log a Meal"
- [ ] Can select meal type
- [ ] Can enter description
- [ ] Saves to database (check Supabase)
- [ ] Appears in Temple Care Today with type and description
- [ ] Multiple meals list correctly

### Daily Devotional
- [ ] AI devotional generates on first load
- [ ] Shows loading spinner while generating
- [ ] Devotional displays with verse, reference, reflection
- [ ] Same devotional shows all day (cached)
- [ ] Fallback Scripture shows if AI fails
- [ ] No errors in console related to Gemini API

### UI
- [ ] Dark mode toggle works
- [ ] Theme persists on refresh
- [ ] Logo shows in top-left
- [ ] "Temple Care Today" title displays
- [ ] All cards have glass effect
- [ ] Animations smooth
- [ ] No layout shifts or jumps

---

## ✅ Security

- [ ] `.env` file is in `.gitignore`
- [ ] No API keys committed to Git
- [ ] Using Supabase **anon** key (not service role key)
- [ ] RLS policies prevent cross-user data access
- [ ] Passwords are hashed (Supabase handles this)
- [ ] No sensitive data in localStorage (only theme preference)

---

## ✅ Mobile / Responsive

- [ ] Tested on mobile viewport (Chrome DevTools)
- [ ] All text readable on small screens
- [ ] Buttons easy to tap (not too small)
- [ ] Modals don't overflow screen
- [ ] Logo + name responsive (hides name on mobile)
- [ ] Cards stack properly on mobile
- [ ] No horizontal scrolling

---

## ✅ Environment Variables

### Local (.env file):
- [ ] `VITE_SUPABASE_URL` set correctly
- [ ] `VITE_SUPABASE_ANON_KEY` set correctly
- [ ] `VITE_GEMINI_API_KEY` set correctly

### Vercel (when deploying):
- [ ] All 3 variables added in Vercel dashboard
- [ ] All environments checked (Production, Preview, Development)
- [ ] Variable names match exactly (with `VITE_` prefix)

---

## ✅ Supabase Configuration

- [ ] Project created
- [ ] Database migration ran
- [ ] Site URL set to Vercel URL in Auth settings
- [ ] Redirect URLs include Vercel domain
- [ ] Email confirmations enabled/disabled as desired
- [ ] Rate limiting configured (if needed)

---

## ✅ Gemini API

- [ ] API key created at ai.google.dev
- [ ] API key has quota remaining
- [ ] Test generation works locally
- [ ] Fallback devotional works if API fails
- [ ] Rate limits acceptable for your usage

---

## ✅ Performance

- [ ] App loads in < 3 seconds
- [ ] No unnecessary re-renders
- [ ] Images optimized (logo is < 100KB)
- [ ] No memory leaks (test by using app for 5+ minutes)
- [ ] Database queries are indexed
- [ ] Only loads today's data (not entire history)

---

## ✅ Error Handling

- [ ] Graceful error messages (no raw error objects shown)
- [ ] Network failures handled (try airplane mode)
- [ ] AI generation failures handled (fallback works)
- [ ] Database errors handled
- [ ] Form validation works
- [ ] No unhandled promise rejections

---

## ✅ User Experience

- [ ] First-time user can sign up easily
- [ ] UI is intuitive (no explanation needed)
- [ ] Tone is gentle and encouraging throughout
- [ ] No shame or pressure language
- [ ] Empty states are helpful (not just blank)
- [ ] Loading states are clear
- [ ] Success feedback after actions (data appears)

---

## ✅ Content

- [ ] No typos in UI text
- [ ] Devotional tone is pastoral and warm
- [ ] All encouragement messages are uplifting
- [ ] NKJV Scripture references formatted correctly
- [ ] No placeholder text (e.g., "Lorem ipsum")

---

## ✅ Documentation

- [ ] README.md exists and is accurate
- [ ] SETUP.md has clear instructions
- [ ] DEPLOYMENT.md explains how to deploy
- [ ] .env.example has all required variables
- [ ] Database migration script is documented

---

## ✅ Legal / Privacy

- [ ] User data stored securely (Supabase handles this)
- [ ] No PII (Personally Identifiable Information) logged
- [ ] Terms of Service prepared (if needed)
- [ ] Privacy Policy prepared (if needed)
- [ ] Cookie consent (if in EU - not currently implemented)

---

## ✅ Git / Version Control

- [ ] All changes committed
- [ ] `.gitignore` includes `.env` and `node_modules`
- [ ] No sensitive files in repo
- [ ] Commit messages are clear
- [ ] On main/master branch
- [ ] Repo is private (if using GitHub)

---

## ✅ Deployment Prep

- [ ] Vercel account created
- [ ] GitHub repo created (optional but recommended)
- [ ] Custom domain purchased (optional)
- [ ] DNS configured (if using custom domain)

---

## ✅ Final Testing (Do This Last!)

### Fresh Account Test:
1. [ ] Open incognito/private window
2. [ ] Sign up with new email
3. [ ] Complete entire flow (check-in, meal, see summary)
4. [ ] Sign out
5. [ ] Sign back in
6. [ ] Data persists correctly

### Multi-Day Test (if time):
1. [ ] Use app on Day 1
2. [ ] Come back on Day 2
3. [ ] New devotional generates
4. [ ] Yesterday's data not shown
5. [ ] Clean slate each day

---

## 🎉 Ready to Launch?

If all boxes are checked, you're ready to deploy!

Run through DEPLOYMENT.md and ship it! 🚀

---

## Post-Launch Monitoring (First Week)

- [ ] Check Vercel deployment logs daily
- [ ] Monitor Supabase database size
- [ ] Watch Gemini API usage
- [ ] Collect user feedback
- [ ] Fix any critical bugs immediately
- [ ] Celebrate! You shipped! 🎉

---

**Note:** It's okay if everything isn't perfect. Done is better than perfect. Ship it, then iterate! 💜
