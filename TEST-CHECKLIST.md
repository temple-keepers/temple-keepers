# Testing Checklist

## Steps to Test Each Feature

### 1. Recipe Generation & Save
1. Open browser console (F12)
2. Go to Recipes page
3. Select meal type and preferences
4. Click "Generate Recipe"
5. **Look for console logs**:
   - 🔄 Generating recipe with preferences
   - 📝 Raw AI response length
   - ✅ Parsed recipe
   - ✅ Recipe validated successfully
6. Click "Save Recipe"
7. **Look for console logs**:
   - Inserting recipe data
   - ✅ Recipe saved successfully

### 2. Devotional Completion
1. Go to Devotionals page
2. Click "Mark as Complete"
3. **Look for console logs**:
   - Saving devotional for user
   - ✅ Devotional saved successfully

### 3. Profile Save
1. Go to Profile page
2. Select health goals
3. Click "Save Profile"
4. **Look for console logs**:
   - Saving profile with data
   - Updating profile for user
   - Updates being sent
   - ✅ Profile updated successfully

## Common Error Messages to Share

If you see ANY of these in console, share the COMPLETE message:
- ❌ Error generating recipe
- ❌ Error saving recipe
- !!! Supabase returned error
- Failed to save devotional
- Failed to save profile

## How to Share Console Output

1. Press F12
2. Click "Console" tab
3. Try ONE action at a time
4. Right-click in console → "Save as..." or copy all text
5. Share the output with me
