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

// ─── Ingredient normalisation for bulk combining ─────────────────

// Normalise ingredient names so "sea salt" and "salt" combine
function normaliseIngredientName(raw) {
  let name = (raw || '').toLowerCase().trim()
  // Strip common adjectives that don't change the shopping item
  const stripPrefixes = [
    'fresh ', 'dried ', 'ground ', 'chopped ', 'minced ', 'diced ', 'sliced ',
    'crushed ', 'large ', 'small ', 'medium ', 'extra-virgin ', 'extra virgin ',
    'organic ', 'raw ', 'cooked ', 'frozen ', 'canned ', 'whole ', 'finely ',
    'thinly ', 'roughly ', 'freshly ', 'boneless ', 'skinless ', 'unsalted ',
    'salted ', 'light ', 'dark ', 'plain ', 'natural ', 'pure ', 'cold-pressed ',
    'roasted ', 'toasted ', 'blanched ', 'peeled ', 'deseeded ', 'pitted ',
    'ripe ', 'firm ', 'soft ', 'thick ', 'thin '
  ]
  for (const s of stripPrefixes) {
    if (name.startsWith(s)) {
      name = name.slice(s.length)
    }
  }
  // Strip colour/type prefixes for common items
  name = name.replace(/^(red|green|yellow|white|black|brown|sweet|hot|mild|baby|mini|jumbo) /, '')
  // Simple plural → singular
  if (name.endsWith('ies') && name.length > 4) name = name.slice(0, -3) + 'y'
  else if (name.endsWith('ves') && name.length > 4) name = name.slice(0, -3) + 'f'
  else if (name.endsWith('oes')) name = name.slice(0, -2)  // tomatoes → tomato, potatoes → potato
  else if (name.endsWith('es') && !name.endsWith('ches') && !name.endsWith('shes') && !name.endsWith('sses') && name.length > 4) name = name.slice(0, -1)
  else if (name.endsWith('s') && !name.endsWith('ss') && !name.endsWith('us') && name.length > 3) name = name.slice(0, -1)
  return name.trim()
}

// Normalise unit strings so "tablespoon" and "tbsp" combine
function normaliseUnit(raw) {
  const unit = (raw || '').toLowerCase().trim()
  const UNIT_MAP = {
    'g': 'g', 'gram': 'g', 'grams': 'g',
    'kg': 'kg', 'kilogram': 'kg', 'kilograms': 'kg',
    'ml': 'ml', 'milliliter': 'ml', 'millilitre': 'ml', 'milliliters': 'ml', 'millilitres': 'ml',
    'l': 'l', 'liter': 'l', 'litre': 'l', 'liters': 'l', 'litres': 'l',
    'tsp': 'tsp', 'teaspoon': 'tsp', 'teaspoons': 'tsp',
    'tbsp': 'tbsp', 'tablespoon': 'tbsp', 'tablespoons': 'tbsp',
    'cup': 'cup', 'cups': 'cup',
    'oz': 'oz', 'ounce': 'oz', 'ounces': 'oz',
    'lb': 'lb', 'lbs': 'lb', 'pound': 'lb', 'pounds': 'lb',
    'piece': 'piece', 'pieces': 'piece', 'whole': 'piece', 'pcs': 'piece',
    'clove': 'clove', 'cloves': 'clove',
    'pinch': 'pinch', 'pinches': 'pinch',
    'bunch': 'bunch', 'bunches': 'bunch',
    'can': 'can', 'cans': 'can', 'tin': 'can', 'tins': 'can',
    'handful': 'handful', 'handfuls': 'handful',
    'slice': 'slice', 'slices': 'slice',
    'sprig': 'sprig', 'sprigs': 'sprig',
    'stalk': 'stalk', 'stalks': 'stalk',
    'head': 'head', 'heads': 'head',
    'dash': 'dash', 'dashes': 'dash',
  }
  return UNIT_MAP[unit] || unit
}

// Convert all units to a base unit within their family so everything combines
function convertToBaseUnit(amount, unit) {
  // Weight family → all convert to grams
  if (unit === 'kg') return { amount: amount * 1000, unit: 'g' }
  if (unit === 'lb') return { amount: amount * 453.592, unit: 'g' }
  if (unit === 'oz') return { amount: amount * 28.3495, unit: 'g' }

  // Volume (small) family → all convert to tbsp
  if (unit === 'tsp') return { amount: amount / 3, unit: 'tbsp' }

  // Volume (large) family → all convert to ml
  if (unit === 'l') return { amount: amount * 1000, unit: 'ml' }
  if (unit === 'cup') return { amount: amount * 236.588, unit: 'ml' }

  return { amount, unit }
}

// Clean messy amount strings from AI (e.g. "3 lbs (about 680g)" → 3)
function parseAmount(raw) {
  if (typeof raw === 'number') return raw
  if (!raw) return 0
  const str = String(raw).trim()
  // Handle fractions like "1/2"
  const fractionMatch = str.match(/^(\d+)?\s*(\d+)\/(\d+)/)
  if (fractionMatch) {
    const whole = fractionMatch[1] ? parseInt(fractionMatch[1]) : 0
    return whole + parseInt(fractionMatch[2]) / parseInt(fractionMatch[3])
  }
  // Extract first number from messy strings like "3 lbs (about 680g)"
  const numMatch = str.match(/([\d.]+)/)
  return numMatch ? parseFloat(numMatch[1]) : 0
}

// Extract unit from messy amount strings when unit field is empty
function extractUnit(amountStr, unitField) {
  if (unitField && unitField.trim()) return normaliseUnit(unitField)
  if (typeof amountStr !== 'string') return ''
  // Try to find a unit in the amount string
  const unitMatch = amountStr.match(/\d+\s*(lbs?|oz|g|kg|ml|l|cups?|tbsp|tsp|teaspoons?|tablespoons?|cloves?|cans?|pieces?|bunch|handfuls?)\b/i)
  if (unitMatch) return normaliseUnit(unitMatch[1])
  return ''
}

// After combining, display in the friendliest unit
function upscaleUnit(amount, unit) {
  if (unit === 'g') {
    if (amount >= 1000) return { amount: +(amount / 1000).toFixed(2), unit: 'kg' }
    return { amount: +amount.toFixed(0), unit: 'g' }  // whole grams, no decimals
  }
  if (unit === 'ml') {
    if (amount >= 1000) return { amount: +(amount / 1000).toFixed(2), unit: 'l' }
    return { amount: +amount.toFixed(0), unit: 'ml' }
  }
  if (unit === 'tbsp') {
    if (amount >= 16) return { amount: +(amount / 16).toFixed(1), unit: 'cup' }
    // Convert back to tsp if less than 1 tbsp
    if (amount < 1) return { amount: +(amount * 3).toFixed(1), unit: 'tsp' }
    return { amount: +amount.toFixed(1), unit: 'tbsp' }
  }
  return { amount: +amount.toFixed(2), unit }
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
    // Shopping lists and meal_plan_days cascade delete automatically via FK
    // but delete shopping lists explicitly for safety
    await supabase.from('shopping_lists').delete().eq('meal_plan_id', planId)
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

    // Fetch user's pantry to cross-reference
    const { data: pantryItems } = await supabase
      .from('user_pantry')
      .select('item_name')
      .eq('user_id', userId)

    const pantrySet = new Set(
      (pantryItems || []).map(p => normaliseIngredientName(p.item_name))
    )

    // Aggregate ingredients with improved normalisation
    const ingredientMap = new Map()

    for (const day of plan.meal_plan_days || []) {
      if (!day.recipes?.ingredients) continue

      for (const ing of day.recipes.ingredients) {
        const rawName = ing.item || ing.name || ''
        if (!rawName.trim()) continue

        const normName = normaliseIngredientName(rawName)
        const normUnit = extractUnit(ing.amount, ing.unit)

        // Parse messy amounts and convert tsp → tbsp for combining
        const cleanAmount = parseAmount(ing.amount)
        const converted = convertToBaseUnit(cleanAmount, normUnit)
        const key = `${normName}_${converted.unit}`

        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)
          existing.amount += converted.amount
          existing.recipes.add(day.recipes.title)
        } else {
          ingredientMap.set(key, {
            name: normName.charAt(0).toUpperCase() + normName.slice(1),  // Clean, capitalised display name
            normName,                       // Normalised for pantry matching
            amount: converted.amount,
            unit: converted.unit,
            category: categorizeIngredient(rawName),
            checked: false,
            recipes: new Set([day.recipes.title]),
            inPantry: pantrySet.has(normName),
          })
        }
      }
    }

    // Convert to array, upscale large units, and serialize
    const items = Array.from(ingredientMap.values()).map(item => {
      const scaled = item.amount > 0 ? upscaleUnit(item.amount, item.unit) : { amount: null, unit: item.unit }
      return {
        name: item.name,
        amount: scaled.amount,
        unit: scaled.unit,
        category: item.category,
        checked: item.inPantry ? true : false,   // Auto-check items user already has
        inPantry: item.inPantry,
        recipes: Array.from(item.recipes),
      }
    })

    // Sort: pantry items last, then by category, then name
    items.sort((a, b) => {
      if (a.inPantry !== b.inPantry) return a.inPantry ? 1 : -1
      return a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    })

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

  // ─── PANTRY ─────────────────────────────────────────

  async getPantry(userId) {
    const { data, error } = await supabase
      .from('user_pantry')
      .select('*')
      .eq('user_id', userId)
      .order('category', { ascending: true })
      .order('item_name', { ascending: true })

    return { data, error }
  },

  async addToPantry(userId, itemName, category) {
    const cat = category || categorizeIngredient(itemName)
    const { data, error } = await supabase
      .from('user_pantry')
      .upsert({
        user_id: userId,
        item_name: itemName.trim(),
        category: cat,
      }, { onConflict: 'user_id,item_name' })
      .select()
      .single()

    return { data, error }
  },

  async addManyToPantry(userId, items) {
    const rows = items.map(item => ({
      user_id: userId,
      item_name: (typeof item === 'string' ? item : item.name).trim(),
      category: (typeof item === 'string' ? categorizeIngredient(item) : item.category) || 'Other',
    }))

    const { data, error } = await supabase
      .from('user_pantry')
      .upsert(rows, { onConflict: 'user_id,item_name' })
      .select()

    return { data, error }
  },

  async removeFromPantry(pantryId) {
    const { error } = await supabase
      .from('user_pantry')
      .delete()
      .eq('id', pantryId)

    return { error }
  },

  async clearPantry(userId) {
    const { error } = await supabase
      .from('user_pantry')
      .delete()
      .eq('user_id', userId)

    return { error }
  },

  // Helpers
  DAYS,
  MEAL_TYPES,
  categorizeIngredient,
  normaliseIngredientName,
}
