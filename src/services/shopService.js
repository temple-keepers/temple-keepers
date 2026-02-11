import { supabase } from '../lib/supabase'

const SHOP_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shop-checkout`

const getHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`,
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  }
}

export const shopService = {
  // Get all active products
  async getProducts({ category, type, featured } = {}) {
    let query = supabase
      .from('shop_products')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (category) query = query.eq('category', category)
    if (type) query = query.eq('product_type', type)
    if (featured) query = query.eq('featured', true)

    const { data, error } = await query
    return { data, error }
  },

  // Get single product by slug
  async getProduct(slug) {
    const { data, error } = await supabase
      .from('shop_products')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()
    return { data, error }
  },

  // Check if user owns a product
  async checkOwnership(productId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase
      .from('shop_user_library')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single()

    return !!data
  },

  // Get user's library
  async getLibrary() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [] }

    const { data, error } = await supabase
      .from('shop_user_library')
      .select('*, product:shop_products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Get user's orders
  async getOrders() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [] }

    const { data, error } = await supabase
      .from('shop_orders')
      .select('*, items:shop_order_items(*, product:shop_products(title, image_url, slug))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Initiate checkout (handles free + paid)
  async checkout(productId) {
    const headers = await getHeaders()
    const res = await fetch(`${SHOP_FN_URL}/create-checkout`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId }),
    })
    return await res.json()
  },

  // Verify payment after Stripe redirect
  async verifyPayment(sessionId) {
    const headers = await getHeaders()
    const res = await fetch(`${SHOP_FN_URL}/verify-payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ sessionId }),
    })
    return await res.json()
  },

  // Get download URL for a digital product
  async getDownloadUrl(productId) {
    const headers = await getHeaders()
    const res = await fetch(`${SHOP_FN_URL}/download`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId }),
    })
    return await res.json()
  },
}
