import { supabase } from '../../../lib/supabase'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

// Ingredient category mapping for shopping list grouping
const CATEGORY_MAP = {
  // Produce
  tomato: 'Produce', tomatoes: 'Produce', onion: 'Produce', onions: 'Produce',
  garlic: 'Produce', ginger: 'Produce', lemon: 'Produce', lemons: 'Produce',
  lime: 'Produce', limes: 'Produce', avocado: 'Produce', avocados: 'Produce',
  spinach: 'Produce', kale: 'Produce', lettuce: 'Produce', cucumber: 'Produce',
  pepper: 'Produce', peppers: 'Produce', carrot: 'Produce', carrots: 'Produce',
  broccoli: 'Produce', cauliflower: 'Produce', zucchini: 'Produce',
  potato: 'Produce', potatoes: 'Produce', sweet_potato: 'Produce',
  mushroom: 'Produce', mushrooms: 'Produce', celery: 'Produce',
  cabbage: 'Produce', mango: 'Produce', banana: 'Produce', apple: 'Produce',
  berries: 'Produce', strawberries: 'Produce', blueberries: 'Produce',
  cilantro: 'Produce', parsley: 'Produce', basil: 'Produce', mint: 'Produce',
  // Protein
  chicken: 'Protein', beef: 'Protein', pork: 'Protein', turkey: 'Protein',
  salmon: 'Protein', fish: 'Protein', shrimp: 'Protein', tofu: 'Protein',
  tempeh: 'Protein', egg: 'Protein', eggs: 'Protein', lamb: 'Protein',
  // Dairy
  milk: 'Dairy', cheese: 'Dairy', yogurt: 'Dairy', butter: 'Dairy',
  cream: 'Dairy', sour_cream: 'Dairy',
  // Grains & Pasta
  rice: 'Grains & Pasta', pasta: 'Grains & Pasta', bread: 'Grains & Pasta',
  flour: 'Grains & Pasta', oats: 'Grains & Pasta', quinoa: 'Grains & Pasta',
  couscous: 'Grains & Pasta', tortilla: 'Grains & Pasta', noodles: 'Grains & Pasta',
  // Canned & Dry
  beans: 'Canned & Dry', lentils: 'Canned & Dry', chickpeas: 'Canned & Dry',
  coconut_milk: 'Canned & Dry', tomato_paste: 'Canned & Dry',
  broth: 'Canned & Dry', stock: 'Canned & Dry',
  // Oils & Condiments
  olive_oil: 'Oils & Condiments', oil: 'Oils & Condiments',
  vinegar: 'Oils & Condiments', soy_sauce: 'Oils & Condiments',
  honey: 'Oils & Condiments', maple_syrup: 'Oils & Condiments',
  tahini: 'Oils & Condiments', mustard: 'Oils & Condiments',
  // Spices
  salt: 'Spices', pepper_spice: 'Spices', cumin: 'Spices', paprika: 'Spices',
  turmeric: 'Spices', cinnamon: 'Spices', oregano: 'Spices', thyme: 'Spices',
  chili: 'Spices', curry: 'Spices',
  // Nuts & Seeds
  almonds: 'Nuts & Seeds', walnuts: 'Nuts & Seeds', cashews: 'Nuts & Seeds',
  peanuts: 'Nuts & Seeds', sesame: 'Nuts & Seeds', chia: 'Nuts & Seeds',
  flax: 'Nuts & Seeds',
}

function categorizeIngredient(itemName) {
  const lower = itemName.toLowerCase().replace(/[^a-z\s]/g, '')
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword.replace(/_/g, ' ')) || lower.includes(keyword.replace(/_/g, ''))) {
      return category
    }
  }
  return 'Other'
}

export const mealPlanService = {

  // ─── MEAL PLANS ────────────────────────────────────────

  async getMealPlans(userId) {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*, meal_plan_days(*, recipes(id, title, meal_type, prep_time, cook_time, total_time, dietary_tags, image_urls))')
      .eq('user_id', userId)
      .order('week_start', { ascending: false })

    return { data, error }
  },

  async getMealPlan(planId) {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*, meal_plan_days(*, recipes(id, title, description, meal_type, prep_time, cook_time, total_time, servings, dietary_tags, ingredients, image_urls))')
      .eq('id', planId)
      .single()

    return { data, error }
  },

  async createMealPlan(userId, weekStart, title) {
    const { data, error } = await supabase
      .from('meal_plans')
      .insert({
        user_id: userId,
        week_start: weekStart,
        title: title || `Week of ${new Date(weekStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
      })
      .select()
      .single()

    return { data, error }
  },

  async deleteMealPlan(planId) {
    // Delete days first due to FK
    await supabase.from('meal_plan_days').delete().eq('meal_plan_id', planId)
    const { error } = await supabase.from('meal_plans').delete().eq('id', planId)
    return { error }
  },

  // ─── MEAL PLAN DAYS ────────────────────────────────────

  async addMealToDay(planId, dayOfWeek, mealType, recipeId, customMealName) {
    const insert = {
      meal_plan_id: planId,
      day_of_week: dayOfWeek,
      meal_type: mealType,
    }
    if (recipeId) insert.recipe_id = recipeId
    if (customMealName) insert.custom_meal_name = customMealName

    const { data, error } = await supabase
      .from('meal_plan_days')
      .insert(insert)
      .select('*, recipes(id, title, meal_type, prep_time, cook_time, total_time, dietary_tags, image_urls)')
      .single()

    return { data, error }
  },

  async removeMealFromDay(mealDayId) {
    const { error } = await supabase
      .from('meal_plan_days')
      .delete()
      .eq('id', mealDayId)

    return { error }
  },

  async moveMeal(mealDayId, newDayOfWeek, newMealType) {
    const { data, error } = await supabase
      .from('meal_plan_days')
      .update({ day_of_week: newDayOfWeek, meal_type: newMealType })
      .eq('id', mealDayId)
      .select()
      .single()

    return { data, error }
  },

  // ─── AUTO-GENERATE ─────────────────────────────────────

  async autoGeneratePlan(userId, planId, preferences = {}) {
    // Fetch user's available recipes
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, meal_type, dietary_tags, prep_time, cook_time, total_time')
      .or(`created_by.eq.${userId},is_published.eq.true`)

    if (recipesError || !recipes?.length) {
      return { error: recipesError || { message: 'No recipes available. Create some recipes first!' } }
    }

    // Filter by dietary preferences if provided
    let filtered = recipes
    if (preferences.dietaryTags?.length) {
      filtered = recipes.filter(r =>
        preferences.dietaryTags.some(tag => r.dietary_tags?.includes(tag))
      )
      if (filtered.length < 4) filtered = recipes
    }

    // Group by meal type
    const byType = {
      breakfast: filtered.filter(r => r.meal_type === 'breakfast'),
      lunch: filtered.filter(r => r.meal_type === 'lunch'),
      dinner: filtered.filter(r => r.meal_type === 'dinner'),
      snack: filtered.filter(r => r.meal_type === 'snack'),
    }

    // Fill in missing types with all recipes
    for (const type of MEAL_TYPES) {
      if (byType[type].length === 0) byType[type] = [...filtered]
    }

    // Clear existing days for this plan
    await supabase.from('meal_plan_days').delete().eq('meal_plan_id', planId)

    // Fisher-Yates shuffle for true randomness
    const shuffle = (arr) => {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }

    const meals = []
    const mealsToGenerate = preferences.mealsPerDay || ['breakfast', 'lunch', 'dinner']

    for (const mealType of mealsToGenerate) {
      const pool = byType[mealType]
      // Create a shuffled queue that avoids repeats as much as possible
      let queue = shuffle(pool)
      const usedRecently = new Set()
      const maxRecent = Math.min(Math.floor(pool.length * 0.6), 4)

      for (let day = 0; day < 7; day++) {
        // If queue is empty, reshuffle
        if (queue.length === 0) {
          queue = shuffle(pool)
        }

        // Try to pick one not used recently
        let picked = null
        for (let i = 0; i < queue.length; i++) {
          if (!usedRecently.has(queue[i].id)) {
            picked = queue.splice(i, 1)[0]
            break
          }
        }

        // Fallback: just take the first
        if (!picked) {
          picked = queue.shift()
          if (!picked) picked = pool[Math.floor(Math.random() * pool.length)]
        }

        // Track recently used
        usedRecently.add(picked.id)
        if (usedRecently.size > maxRecent) {
          const first = usedRecently.values().next().value
          usedRecently.delete(first)
        }

        meals.push({
          meal_plan_id: planId,
          day_of_week: day,
          meal_type: mealType,
          recipe_id: picked.id,
        })
      }
    }

    const { data, error } = await supabase
      .from('meal_plan_days')
      .insert(meals)
      .select('*, recipes(id, title, meal_type, prep_time, cook_time, total_time, dietary_tags, image_urls)')

    return { data, error }
  },

  // ─── SHOPPING LIST ─────────────────────────────────────

  async generateShoppingList(userId, planId) {
    // Fetch the meal plan with full recipe ingredients
    const { data: plan, error: planError } = await supabase
      .from('meal_plans')
      .select('*, meal_plan_days(*, recipes(title, servings, ingredients))')
      .eq('id', planId)
      .single()

    if (planError || !plan) return { error: planError }

    // Aggregate ingredients
    const ingredientMap = new Map()

    for (const day of plan.meal_plan_days || []) {
      if (!day.recipes?.ingredients) continue

      for (const ing of day.recipes.ingredients) {
        const key = `${(ing.item || ing.name || '').toLowerCase().trim()}_${(ing.unit || '').toLowerCase().trim()}`
        if (!key || key === '_') continue

        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)
          existing.amount = (parseFloat(existing.amount) || 0) + (parseFloat(ing.amount) || 0)
          existing.recipes.add(day.recipes.title)
        } else {
          ingredientMap.set(key, {
            name: ing.item || ing.name || '',
            amount: parseFloat(ing.amount) || 0,
            unit: ing.unit || '',
            category: categorizeIngredient(ing.item || ing.name || ''),
            checked: false,
            recipes: new Set([day.recipes.title]),
          })
        }
      }
    }

    // Convert to array and serialize
    const items = Array.from(ingredientMap.values()).map(item => ({
      ...item,
      amount: item.amount > 0 ? Number(item.amount.toFixed(2)) : null,
      recipes: Array.from(item.recipes),
    }))

    // Sort by category then name
    items.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))

    // Upsert shopping list
    const { data: existing } = await supabase
      .from('shopping_lists')
      .select('id')
      .eq('meal_plan_id', planId)
      .eq('user_id', userId)
      .maybeSingle()

    let result
    if (existing) {
      result = await supabase
        .from('shopping_lists')
        .update({ items, title: plan.title ? `Shopping: ${plan.title}` : null, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('shopping_lists')
        .insert({
          user_id: userId,
          meal_plan_id: planId,
          week_start: plan.week_start,
          title: plan.title ? `Shopping: ${plan.title}` : null,
          items,
        })
        .select()
        .single()
    }

    return result
  },

  async getShoppingLists(userId) {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async getShoppingList(listId) {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('id', listId)
      .single()

    return { data, error }
  },

  async updateShoppingListItems(listId, items) {
    const { data, error } = await supabase
      .from('shopping_lists')
      .update({ items, updated_at: new Date().toISOString() })
      .eq('id', listId)
      .select()
      .single()

    return { data, error }
  },

  async addManualItem(listId, currentItems, newItem) {
    const items = [
      ...currentItems,
      {
        name: newItem.name,
        amount: newItem.amount || null,
        unit: newItem.unit || '',
        category: newItem.category || categorizeIngredient(newItem.name),
        checked: false,
        recipes: ['Manual'],
        isManual: true,
      }
    ]
    return this.updateShoppingListItems(listId, items)
  },

  async deleteShoppingList(listId) {
    const { error } = await supabase.from('shopping_lists').delete().eq('id', listId)
    return { error }
  },

  // Helpers
  DAYS,
  MEAL_TYPES,
  categorizeIngredient,
}
