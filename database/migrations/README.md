# Database Migrations

## How to Apply Migrations

1. Go to your Supabase project: https://supabase.com/dashboard/project/jdcrzdmbwfkozuhsoqbl
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of the migration file you want to run
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

## Migration Order

Run the migrations in this order:

1. ✅ `002_change_health_goals_to_array.sql`
2. ✅ `003_fix_devotional_progress.sql`
3. ✅ `004_optimize_rls_policies.sql`
4. ✅ `005_optimize_indexes.sql`
5. ✅ `006_create_recipe_library.sql`
6. ✅ `007_fix_saved_recipes_rls.sql`
7. ✅ `008_fix_function_security.sql`
8. ✅ `009_consolidate_recipe_library_policies.sql`
9. ✅ `010_seed_recipe_library.sql` (optional - adds sample recipes)
10. ✅ `011_add_micronutrients_and_benefits.sql`
11. **⚠️ NEW** `012_create_admin_users.sql` - **RUN THIS NOW**

## Currently Missing: Admin Users Table

The application is currently failing because the `admin_users` table doesn't exist. You need to run migration `012_create_admin_users.sql` immediately.

### Quick Fix Steps:

1. Open Supabase SQL Editor
2. Run the contents of `012_create_admin_users.sql`
3. After creating the table, insert your first admin user:

```sql
-- Replace 'your-user-id-here' with your actual user ID from auth.users
INSERT INTO admin_users (user_id, role)
VALUES ('your-user-id-here', 'super_admin');
```

To find your user ID:
```sql
-- Run this to see all users
SELECT id, email FROM auth.users;
```

## What Each Migration Does

- **002**: Converts health_goals from TEXT to TEXT[]
- **003**: Fixes devotional progress tracking
- **004**: Optimizes RLS policies for better performance
- **005**: Adds database indexes for faster queries
- **006**: Creates recipe library tables (recipes, saved_recipes, etc.)
- **007**: Fixes RLS policies for saved recipes
- **008**: Secures database functions
- **009**: Consolidates and optimizes recipe library policies
- **010**: Seeds the database with sample recipes
- **011**: Adds micronutrients and nutritional benefits to recipes
- **012**: Creates admin_users table for admin functionality

## Troubleshooting

### Error: "relation 'admin_users' does not exist"
- Run migration `012_create_admin_users.sql`

### Error: "permission denied for table admin_users"
- Make sure RLS policies are created (included in migration 012)
- Verify you've inserted at least one admin user

### Error: 500 Internal Server Error
- Check that all migrations have been run
- Verify RLS policies are enabled
- Check Supabase logs in the Dashboard

## After Running Migration 012

The app should start working properly. The admin features will be available to users in the `admin_users` table.
