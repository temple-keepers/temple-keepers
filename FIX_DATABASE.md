# 🚨 URGENT: Fix Database Errors

## Problem
The app is showing 500 errors because the `admin_users` table is missing from your Supabase database.

## Solution (5 minutes)

### Step 1: Run the Migration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/jdcrzdmbwfkozuhsoqbl)
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste ALL of the contents from `database/migrations/012_create_admin_users.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### Step 2: Create Your Admin User (IMPORTANT)

The migration sets up the table with proper permissions. Now add yourself as admin:

1. In the same SQL Editor, run this to find your user ID:
```sql
SELECT id, email FROM auth.users;
```

2. Copy your user ID (the long UUID string) and run this (replace the ID):
```sql
-- Replace 'paste-your-user-id-here' with the actual UUID from step 1
INSERT INTO admin_users (user_id, role)
VALUES ('paste-your-user-id-here', 'super_admin');
```

**CRITICAL:** Make sure you see "Success. 1 row inserted" - if you get an error, the policies weren't created correctly.

### Step 3: Verify

Run this to confirm the admin was created:
```sql
SELECT * FROM admin_users;
```

### Step 4: Reload the App

Refresh your browser at http://localhost:5173 - the errors should be gone!

---

## What This Does

- Creates the `admin_users` table for admin functionality
- Sets up proper security policies (RLS)
- Adds indexes for performance
- Gives you super admin access

## Already Have Admins?

If you've previously added admins through another method, you can migrate them:
```sql
-- Example: Give all existing users admin access
INSERT INTO admin_users (user_id, role)
SELECT id, 'admin' 
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
```

---

**Need help?** Check `database/migrations/README.md` for more details.
