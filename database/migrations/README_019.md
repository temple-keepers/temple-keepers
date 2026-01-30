# Security Fix Migration - 019

## Issues Fixed

### 1. Function Search Path Mutable (10 warnings)
All database functions now have `SET search_path = public` and `SECURITY DEFINER` to prevent SQL injection attacks:

- ✅ `create_notification_preferences`
- ✅ `notify_push_on_insert`
- ✅ `update_post_likes_count`
- ✅ `update_post_comments_count`
- ✅ `update_prayers_count`
- ✅ `is_pod_member`
- ✅ `update_habit_streak`
- ✅ `get_post_reaction_counts`
- ✅ `increment_comment_reply_count`
- ✅ `decrement_comment_reply_count`

### 2. RLS Policy Always True (3 warnings)

**Fixed:**
- ✅ `challenge_days` - "Admins can manage challenge days" now checks `admin_users` table
- ✅ `challenges` - "Admins can manage challenges" now checks `admin_users` table

**Kept Permissive (Intentional):**
- ℹ️ `notifications` - "System can create notifications" remains permissive for server-side notification creation
  - Added comment explaining this is intentional
  - Should be called with service role key only

### 3. Leaked Password Protection (1 warning)

**Manual Action Required:**
⚠️ This must be enabled in Supabase Dashboard:
1. Go to: Authentication → Settings → Password
2. Enable "Leaked Password Protection"
3. This checks passwords against HaveIBeenPwned.org database

## How to Apply

### Using Supabase Dashboard:
1. Open SQL Editor
2. Paste contents of `019_fix_security_warnings.sql`
3. Run the migration
4. Verify no errors

### Using Supabase CLI:
```bash
supabase db push
```

## Security Improvements

### Before:
- Functions could be vulnerable to search_path manipulation
- Admin policies weren't checking actual admin status
- Functions had unnecessary public execute permissions

### After:
- All functions explicitly set `search_path = public`
- All functions use `SECURITY DEFINER` for controlled privilege elevation
- Admin policies verify against `admin_users` table
- Sensitive trigger functions have public execute revoked
- User-callable functions explicitly granted to `authenticated` role

## Testing After Migration

Run these queries to verify the fixes:

```sql
-- Verify functions have search_path set
SELECT 
  routine_name,
  routine_schema,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'create_notification_preferences',
  'notify_push_on_insert',
  'update_post_likes_count',
  'update_post_comments_count',
  'update_prayers_count',
  'is_pod_member',
  'update_habit_streak',
  'get_post_reaction_counts',
  'increment_comment_reply_count',
  'decrement_comment_reply_count'
);

-- Verify admin policies check admin_users table
SELECT 
  schemaname,
  tablename,
  policyname,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('challenge_days', 'challenges')
AND policyname LIKE '%Admins%';
```

## Expected Results

After running the migration and enabling password protection:
- ✅ All 10 function warnings should be resolved
- ✅ 2 out of 3 RLS policy warnings resolved (notifications intentionally kept)
- ✅ Auth warning requires manual dashboard setting
- ✅ Supabase linter should show 1 warning instead of 14

## Notes

- The `notifications` policy remains permissive by design for system-created notifications
- Always use service role key (not anon key) when creating notifications server-side
- Password protection must be manually enabled in Auth settings
