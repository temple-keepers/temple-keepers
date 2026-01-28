// Simple script to seed sample recipes directly
// Run this from Supabase SQL Editor

console.log(`
-- ============================================
-- QUICK SEED RECIPE LIBRARY
-- Run this in your Supabase SQL Editor
-- ============================================

-- Insert 5 sample approved recipes
INSERT INTO recipes (
  title, author_name, description, ingredients, instructions,
  scripture, scripture_reference, meditation,
  prep_time, cook_time, servings, cuisine, meal_type,
  dietary_tags, status, is_featured, approved_at
) VALUES 
(
  'Blessed Breakfast Bowl', 'Temple Keepers Team',
  'Start your day with this nourishing bowl filled with whole grains, fresh fruits, and nuts.',
  ARRAY['1 cup cooked quinoa', '1/2 cup Greek yogurt', '1 banana sliced', '1/4 cup mixed berries', '2 tbsp almonds', '1 tbsp honey', '1 tsp chia seeds', 'Pinch of cinnamon'],
  ARRAY['Cook quinoa and let cool', 'Place grains as base', 'Add yogurt on top', 'Arrange fruit', 'Sprinkle with nuts and seeds', 'Drizzle honey', 'Dust with cinnamon'],
  'So whether you eat or drink or whatever you do, do it all for the glory of God.',
  '1 Corinthians 10:31',
  'Every healthy choice you make is an act of worship. Your body is a temple.',
  '10 min', '15 min', '1', 'American', 'Breakfast',
  ARRAY['Vegetarian', 'Gluten-Free Option'], 'approved', true, NOW()
),
(
  'Mediterranean Salad', 'Temple Keepers Team',
  'A vibrant salad with the best of Mediterranean flavors.',
  ARRAY['4 cups greens', '1 cucumber diced', '1 cup cherry tomatoes', '1/2 red onion', '1/2 cup olives', '1/2 cup feta', '1/4 cup olive oil', '2 tbsp lemon juice', '1 tsp oregano'],
  ARRAY['Wash and prepare greens', 'Add vegetables', 'Add olives and feta', 'Whisk dressing', 'Pour and toss', 'Serve fresh'],
  'The Lord is my shepherd, I lack nothing.',
  'Psalm 23:1',
  'God provides abundantly. Each ingredient is a gift nourishing body and soul.',
  '15 min', '0 min', '2-3', 'Mediterranean', 'Lunch',
  ARRAY['Vegetarian', 'Gluten-Free'], 'approved', true, NOW()
),
(
  'Lentil Soup', 'Temple Keepers Team',
  'A hearty, protein-rich soup that builds strength.',
  ARRAY['2 tbsp olive oil', '1 onion', '3 carrots', '3 celery stalks', '4 garlic cloves', '1.5 cups lentils', '6 cups broth', '1 can tomatoes', 'spices', '2 cups spinach'],
  ARRAY['Heat oil', 'Sauté vegetables', 'Add garlic', 'Add lentils and liquids', 'Simmer 30-35 min', 'Add spinach', 'Season and serve'],
  'He gives strength to the weary.',
  'Isaiah 40:29',
  'God strengthens us daily, physically and spiritually.',
  '15 min', '40 min', '6', 'Middle Eastern', 'Dinner',
  ARRAY['Vegan', 'Gluten-Free'], 'approved', false, NOW()
),
(
  'Grilled Chicken', 'Temple Keepers Team',
  'Simple, flavorful grilled chicken with clean ingredients.',
  ARRAY['4 chicken breasts', '3 tbsp olive oil', '2 tbsp lemon juice', '3 garlic cloves', 'herbs', 'salt', 'pepper'],
  ARRAY['Mix marinade', 'Coat chicken', 'Marinate 30 min', 'Grill 6-7 min per side', 'Rest 5 min', 'Serve'],
  'Do it all for the glory of God.',
  '1 Corinthians 10:31',
  'Even cooking can be done for God''s glory.',
  '40 min', '15 min', '4', 'American', 'Dinner',
  ARRAY['High-Protein', 'Gluten-Free'], 'approved', false, NOW()
),
(
  'Berry Smoothie', 'Temple Keepers Team',
  'A refreshing, antioxidant-rich smoothie.',
  ARRAY['1 cup berries', '1 banana', '1 cup almond milk', '1/2 cup yogurt', '1 tbsp almond butter', '1 tbsp flaxseed', 'honey optional', 'ice'],
  ARRAY['Add all to blender', 'Blend until smooth', 'Adjust sweetness', 'Pour and garnish', 'Serve immediately'],
  'A cheerful heart is good medicine.',
  'Proverbs 17:22',
  'This smoothie celebrates joy and health.',
  '5 min', '0 min', '1', 'American', 'Breakfast',
  ARRAY['Vegetarian', 'Gluten-Free'], 'approved', false, NOW()
)
ON CONFLICT DO NOTHING;

SELECT COUNT(*) FROM recipes WHERE status = 'approved';
`);
