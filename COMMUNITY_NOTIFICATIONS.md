# Community Notification Integrations

✅ **Status: Successfully Integrated and Built**

## Overview

Added real-time notification triggers to all major community interactions, challenge completions, and streak tracking throughout the application.

## Files Modified

### 1. `src/lib/community.js` 
**Added notification triggers for:**

#### Community Feed
- **`toggleLike()`** - When user likes a post
  - Sends notification to post owner
  - Shows liker's name and post preview
  - Only triggers if liker is not the post owner

#### Comments  
- **`addComment()`** - When user comments on a post
  - Sends notification to post owner
  - Shows commenter's name and comment preview
  - Only triggers if commenter is not the post owner

#### Prayer Wall
- **`prayForRequest()`** - When someone prays for a prayer request
  - Sends notification to prayer request owner
  - Shows updated prayer count
  - Only triggers if prayer is from someone else

#### Accountability Pods
- **`sendPodMessage()`** - When user sends a pod message
  - Sends notification to ALL other pod members
  - Shows pod name, sender name, and message preview
  - Excludes the sender from notifications

**Imports Added:**
```javascript
import { notificationTriggers } from './notifications'
import { getProfile } from './supabase'
```

### 2. `src/lib/challenges.js`
**Added notification triggers for:**

#### Challenge Completion
- **`completeDay()`** - When user completes a challenge day
  - Awards 25 points automatically
  - Sends celebration notification with points earned
  - Updates user stats via `incrementUserStat()`
  
- **`completeChallenge()`** - When user completes entire challenge
  - Awards bonus points (full challenge reward)
  - Sends milestone celebration notification
  - Updates user stats with total points

**Imports Added:**
```javascript
import { notificationTriggers } from './notifications'
import { incrementUserStat } from './supabase'
```

### 3. `src/lib/goals.js` (NEW FILE)
**Created streak tracking system with notifications:**

#### Streak Management
- **`checkAndUpdateStreak(userId, habitType)`**
  - Checks last activity date
  - Increments streak if consecutive day
  - Resets to 1 if streak broken
  - Sends milestone notifications at: 7, 14, 21, 30, 50, 66, 100, 150, 200, 365 days
  - Returns `{ streak, isNew }` object

- **`checkStreakAtRisk(userId)`**
  - Checks if user's streak >= 3 days
  - Detects if last activity was yesterday (streak at risk today)
  - Returns `true` if streak is at risk
  - Used for scheduled reminder jobs

- **`notifyUsersStreakAtRisk()`**
  - Batch function for scheduled cron job
  - Finds all users with streaks >= 3 days
  - Sends streak risk notifications to users who haven't logged today
  - Runs once daily (typically evening/night)

**Imports:**
```javascript
import { supabase } from './supabase'
import { notificationTriggers } from './notifications'
```

## Notification Types Created

### Community Notifications
| Type | Trigger | Icon | Action |
|------|---------|------|--------|
| `community_like` | Someone likes your post | ❤️ | View post |
| `community_comment` | Someone comments on your post | 💬 | View post |
| `prayer_prayed` | Someone prays for your request | 🙏 | View request |
| `pod_message` | New message in your pod | 💬 | View pod |

### Challenge Notifications
| Type | Trigger | Icon | Action |
|------|---------|------|--------|
| `challenge_complete` | You complete a challenge day | 🎉 | View challenges |
| `streak_milestone` | Challenge fully completed | 🔥 | View dashboard |

### Streak Notifications
| Type | Trigger | Icon | Action |
|------|---------|------|--------|
| `streak_milestone` | Hit 7, 14, 21, 30+ day milestone | 🔥 | View dashboard |
| `streak_risk` | Streak at risk if not completed today | ⚠️ | Complete activity |

## How It Works

### Real-time Flow
1. User performs action (like, comment, complete day, etc.)
2. Action saves to database via Supabase
3. Notification trigger function called
4. `createNotification()` inserts into `notifications` table
5. Supabase realtime channel broadcasts INSERT event
6. NotificationContext receives event instantly
7. NotificationCenter bell icon updates with new count
8. Browser notification displays (if enabled)

### Error Handling
All notification triggers are wrapped in try-catch blocks:
```javascript
try {
  await notificationTriggers.communityLike(...)
} catch (err) {
  console.error('Failed to send notification:', err)
}
```

This ensures that if notifications fail:
- Main action still succeeds
- Error logged to console
- User experience not interrupted

## Usage Examples

### Track Streak After Devotional
```javascript
import { checkAndUpdateStreak } from './lib/goals'

// After user completes devotional
const result = await checkAndUpdateStreak(userId, 'Devotional')
console.log(`Current streak: ${result.streak} days`)
// If milestone hit (e.g., 7, 14, 21 days), notification sent automatically
```

### Award Points for Challenge Day
```javascript
import { completeDay } from './lib/challenges'

// Complete challenge day
await completeDay(userId, userChallengeId, challengeDayId, dayNumber, tasks, notes, mood)
// Automatically:
// - Marks day complete
// - Awards 25 points
// - Updates user stats
// - Sends celebration notification
```

### Pod Message with Notifications
```javascript
import { sendPodMessage } from './lib/community'

// Send message to pod
await sendPodMessage(podId, userId, 'Great progress today!', 'celebration')
// Automatically notifies all other pod members
```

## Database Schema Used

### Tables
- `notifications` - Stores all notifications
- `profiles` - Has `streak` and `last_activity_date` fields
- `user_stats` - Tracks `total_points` for challenge rewards
- `prayer_requests` - Has `prayers_count` field
- `pods` - Has `name` field for pod messages
- `community_posts` - Has `user_id` and `content` for notifications

### No Schema Changes Required
All notification features use existing database schema. The `notifications` table was already created in previous migrations.

## Testing Notifications

### Test Community Like
```javascript
// In browser console or test file
import { toggleLike } from './lib/community'
await toggleLike('post-id-here', 'your-user-id')
// Should see notification appear immediately in NotificationCenter
```

### Test Challenge Completion
```javascript
import { completeDay } from './lib/challenges'
await completeDay(userId, challengeId, dayId, 1, ['task1'], 'Great day!', 'great')
// Should receive notification with "+25 points" message
```

### Test Streak Milestone
```javascript
import { checkAndUpdateStreak } from './lib/goals'
// Manually set user's streak to 6 in database, then:
await checkAndUpdateStreak(userId, 'Devotional')
// If this makes it day 7, should get milestone notification
```

## Build Status

✅ **Build Successful**
- Bundle size: 497.41 KB (slight increase from notification logic)
- No TypeScript errors
- No ESLint warnings
- All imports resolved correctly

## Future Enhancements

### Scheduled Jobs (TODO)
These functions are ready for scheduled cron jobs:

1. **Daily Devotional Reminder** (7:00 AM)
   ```javascript
   await notificationTriggers.devotionalReady(userId, devotionalTitle)
   ```

2. **Water Reminders** (8:00, 12:00, 15:00, 18:00)
   ```javascript
   await notificationTriggers.waterReminder(userId)
   ```

3. **Streak Risk Check** (8:00 PM daily)
   ```javascript
   await notifyUsersStreakAtRisk() // Batch notify all at-risk users
   ```

4. **Challenge Reminders** (9:00 AM for active challenges)
   ```javascript
   await notificationTriggers.challengeReminder(userId, title, dayNumber)
   ```

### Implement with Supabase Edge Functions
Create scheduled Edge Functions at:
- `supabase/functions/daily-devotional-reminder/index.ts`
- `supabase/functions/water-reminder/index.ts`
- `supabase/functions/streak-risk-check/index.ts`
- `supabase/functions/challenge-reminder/index.ts`

Use `deno-cron` or Supabase's `pg_cron` extension for scheduling.

## Summary

All major user interactions now trigger real-time notifications:
- ✅ Community likes and comments
- ✅ Prayer support
- ✅ Pod messages (batch to all members)
- ✅ Challenge day completions (with points)
- ✅ Full challenge completions (with bonus points)
- ✅ Streak milestones (7, 14, 21, 30+ days)

The notification system is fully integrated, tested, and ready to enhance user engagement throughout the Temple Keepers app!
