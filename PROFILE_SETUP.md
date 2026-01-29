# Profile & Pod Image Setup

## Database Migration

Run the migration file in Supabase SQL Editor:
`database/migrations/018_add_profile_fields.sql`

This adds:
- `date_of_birth` (DATE) - Private field for user age
- `city` (TEXT) - Public field for location
- `country` (TEXT) - Public field for timezone identification  
- `timezone` (TEXT) - Auto-detected timezone
- `image_url` to `pods` table

## Supabase Storage Bucket

You need to create a storage bucket for profile images:

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named: `profiles`
3. Make it **public**
4. Set policies:

### Storage Policies for `profiles` bucket:

```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Allow public read access to all images
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');

-- Allow authenticated users to upload pod images
CREATE POLICY "Users can upload pod images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'pods'
);
```

## Features Added

### User Profile Enhancements:
- ✅ **Profile Photo Upload** - Click camera icon to upload (max 5MB)
- ✅ **Date of Birth** - Private field (not shown publicly)
- ✅ **City & Country** - Public fields for timezone identification
- ✅ **Auto Timezone Detection** - Based on browser settings
- ✅ **Improved Mobile Layout** - Better spacing and responsive design

### Pod Enhancements:
- ✅ **Pod Image Upload** - Optional pod avatar/banner
- ✅ **Image Preview** - Shows uploaded image before creating pod
- ✅ **Storage Integration** - Images stored in Supabase Storage

## Privacy Notes

- **Date of Birth**: Stored in database but NOT displayed publicly
- **City/Country**: Public - helps identify user timezone for community features
- **Avatar**: Public - displayed on posts, pods, and profile
- **Pod Images**: Public - displayed on pod cards and detail pages

## Next Steps

After running the migration and setting up storage:
1. Test avatar upload on Profile page
2. Test pod image upload when creating a pod
3. Verify images display correctly in community posts
4. Check timezone is auto-detected correctly
