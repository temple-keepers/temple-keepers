# Adding Sample Recipes to Recipe Library

The Recipe Library page shows "No recipes found" because there are currently no approved recipes in the database.

## Quick Fix: Add Sample Recipes

1. **Go to your Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your Temple Keepers project
   - Go to the SQL Editor

2. **Copy and paste this SQL** (copy from the line starting with `--` below, NOT the ```sql line):

```sql
-- Add 5 sample approved recipes to get started
INSERT INTO recipes (
  title, author_name, description, ingredients, instructions,
  scripture, scripture_reference, meditation,
  prep_time, cook_time, servings, cuisine, meal_type,
  dietary_tags, status, is_featured, approved_at
) VALUES 
(
  'Blessed Breakfast Bowl', 
  'Temple Keepers Team',
  'Start your day with this nourishing bowl filled with whole grains, fresh fruits, and nuts.',
  ARRAY['1 cup cooked quinoa', '1/2 cup Greek yogurt', '1 banana sliced', '1/4 cup mixed berries', '2 tbsp almonds', '1 tbsp honey', '1 tsp chia seeds', 'Pinch of cinnamon'],
  ARRAY['Cook quinoa and let cool', 'Place grains as base', 'Add yogurt on top', 'Arrange fruit', 'Sprinkle with nuts and seeds', 'Drizzle honey', 'Dust with cinnamon'],
  'So whether you eat or drink or whatever you do, do it all for the glory of God.',
  '1 Corinthians 10:31',
  'Every healthy choice you make is an act of worship. Your body is a temple.',
  '10 minutes', '15 minutes', '1 serving', 'American', 'Breakfast',
  ARRAY['Vegetarian', 'Gluten-Free Option'], 'approved', true, NOW()
),
(
  'Mediterranean Salad', 
  'Temple Keepers Team',
  'A vibrant salad with the best of Mediterranean flavors.',
  ARRAY['4 cups mixed greens', '1 cucumber diced', '1 cup cherry tomatoes', '1/2 red onion', '1/2 cup olives', '1/2 cup feta', '1/4 cup olive oil', '2 tbsp lemon juice', '1 tsp oregano'],
  ARRAY['Wash and prepare greens', 'Add vegetables', 'Add olives and feta', 'Whisk dressing ingredients', 'Pour dressing and toss', 'Serve immediately'],
  'The Lord is my shepherd, I lack nothing.',
  'Psalm 23:1',
  'God provides abundantly. Each ingredient is a gift nourishing body and soul.',
  '15 minutes', '0 minutes', '2-3 servings', 'Mediterranean', 'Lunch',
  ARRAY['Vegetarian', 'Gluten-Free'], 'approved', true, NOW()
),
(
  'Strength-Building Lentil Soup', 
  'Temple Keepers Team',
  'A hearty, protein-rich soup that builds strength and warms the soul.',
  ARRAY['2 tbsp olive oil', '1 onion diced', '3 carrots diced', '3 celery stalks', '4 garlic cloves', '1.5 cups lentils', '6 cups vegetable broth', '1 can diced tomatoes', '2 cups spinach'],
  ARRAY['Heat oil in large pot', 'Sauté vegetables 5-7 min', 'Add garlic', 'Add lentils and liquids with spices', 'Simmer 30-35 minutes', 'Add spinach until wilted', 'Season and serve hot'],
  'He gives strength to the weary and increases the power of the weak.',
  'Isaiah 40:29',
  'God strengthens us daily, both physically and spiritually.',
  '15 minutes', '40 minutes', '6 servings', 'Middle Eastern', 'Dinner',
  ARRAY['Vegan', 'Gluten-Free', 'High-Protein'], 'approved', false, NOW()
),
(
  'Grace-Filled Grilled Chicken', 
  'Temple Keepers Team',
  'Simple, flavorful grilled chicken with clean ingredients.',
  ARRAY['4 chicken breasts', '3 tbsp olive oil', '2 tbsp lemon juice', '3 garlic cloves minced', '1 tsp rosemary', '1 tsp thyme', 'salt and pepper'],
  ARRAY['Mix marinade ingredients', 'Coat chicken thoroughly', 'Marinate 30 minutes', 'Preheat grill to medium-high', 'Grill 6-7 minutes per side to 165°F', 'Rest 5 minutes', 'Slice and serve'],
  'Whether you eat or drink or whatever you do, do it all for the glory of God.',
  '1 Corinthians 10:31',
  'Even everyday acts like cooking can be done for God''s glory.',
  '40 minutes', '15 minutes', '4 servings', 'American', 'Dinner',
  ARRAY['High-Protein', 'Gluten-Free', 'Keto-Friendly'], 'approved', false, NOW()
),
(
  'Joyful Berry Smoothie', 
  'Temple Keepers Team',
  'A refreshing, antioxidant-rich smoothie that brings joy to your morning.',
  ARRAY['1 cup mixed berries', '1 banana', '1 cup almond milk', '1/2 cup Greek yogurt', '1 tbsp almond butter', '1 tbsp flaxseed', '1/2 cup ice'],
  ARRAY['Add all ingredients to blender', 'Blend on high 30-60 seconds', 'Taste and adjust sweetness', 'Pour into glass', 'Garnish with fresh berries', 'Serve immediately'],
  'A cheerful heart is good medicine, but a crushed spirit dries up the bones.',
  'Proverbs 17:22',
  'This smoothie celebrates joy and health. Let gratitude fill your heart.',
  '5 minutes', '0 minutes', '1 serving', 'American', 'Breakfast',
  ARRAY['Vegetarian', 'Gluten-Free', 'Healthy'], 'approved', false, NOW()
);

-- Verify recipes were added
SELECT COUNT(*) as "Recipes Added", 
       COUNT(*) FILTER (WHERE status = 'approved') as "Approved Recipes"
FROM recipes;
```

3. **Run the query** by clicking the "Run" button

4. **Refresh your Recipe Library page** - you should now see 5 sample recipes!

## What Was Fixed

1. ✅ Fixed `refreshProfile` → `refreshUserData` naming mismatch in Profile.jsx
2. ✅ Fixed async promise handling in AuthContext to prevent "message channel closed" errors
3. ✅ Improved error handling in profile saves with detailed logging
4. ✅ Enhanced Recipe Library with better error states and retry functionality
5. ✅ Added comprehensive logging for recipe save operations
6. ✅ Improved empty state messaging in Recipe Library

## Testing Recipe Saves

Once you have recipes in the library:
1. Open a recipe by clicking on it
2. Click the "Save Recipe" button
3. Check the browser console (F12) for detailed logs
4. The recipe should save to your personal collection

If you see errors in the console, they will now show exactly what's failing with detailed error messages.
