import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, ShoppingBag, Save, X, Star, Eye, EyeOff, Trash2, Edit2, Package, Search, Truck } from 'lucide-react'

const CATEGORIES = ['ebooks', 'recipe_books', 'supplements', 'fitness', 'wellness', 'devotionals', 'courses', 'other']
const TYPES = ['digital', 'physical', 'affiliate']

const empty = () => ({
  title: '', slug: '', description: '', short_description: '',
  product_type: 'digital', category: 'ebooks', tags: [],
  price_gbp: '', compare_at_price_gbp: '', free_for_tiers: [],
  file_url: '', file_name: '', affiliate_url: '', affiliate_source: '',
  requires_shipping: false, stock_quantity: '',
  image_url: '', featured: false, sort_order: 0, status: 'draft'
})

export const AdminShop = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('products')

  useEffect(() => { loadProducts() }, [])
  useEffect(() => { if (tab === 'orders' && orders.length === 0) loadOrders() }, [tab])

  const loadProducts = async () => {
    setLoading(true)
    const { data } = await supabase.from('shop_products').select('*').order('sort_order').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const loadOrders = async () => {
    const { data } = await supabase
      .from('shop_orders')
      .select('*, user:profiles(first_name, email), items:shop_order_items(*, product:shop_products(title))')
      .order('created_at', { ascending: false }).limit(50)
    setOrders(data || [])
  }

  const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleSave = async () => {
    if (!editing.title) { toast.error('Title required'); return }
    setSaving(true)
    const p = {
      ...editing,
      slug: editing.slug || slug(editing.title),
      price_gbp: editing.price_gbp ? parseFloat(editing.price_gbp) : null,
      compare_at_price_gbp: editing.compare_at_price_gbp ? parseFloat(editing.compare_at_price_gbp) : null,
      stock_quantity: editing.stock_quantity ? parseInt(editing.stock_quantity) : null,
      tags: typeof editing.tags === 'string' ? editing.tags.split(',').map(t => t.trim()).filter(Boolean) : (editing.tags || []),
      updated_at: new Date().toISOString(),
    }
    delete p.created_at; delete p.created_by

    let error
    if (editing.id) {
      ({ error } = await supabase.from('shop_products').update(p).eq('id', editing.id))
    } else {
      delete p.id
      ;({ error } = await supabase.from('shop_products').insert(p))
    }

    if (error) toast.error('Failed: ' + error.message)
    else { toast.success(editing.id ? 'Updated!' : 'Created!'); setEditing(null); loadProducts() }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await supabase.from('shop_products').delete().eq('id', id)
    toast.success('Deleted'); loadProducts()
  }

  const handleShipUpdate = async (orderId, status) => {
    await supabase.from('shop_orders').update({ shipping_status: status }).eq('id', orderId)
    toast.success('Updated'); loadOrders()
  }

  const filtered = products.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()))

  // ====== EDIT FORM ======
  if (editing) {
    const e = editing
    const set = (k, v) => setEditing({ ...e, [k]: v })
    const toggleTier = (tier) => {
      const tiers = e.free_for_tiers || []
      set('free_for_tiers', tiers.includes(tier) ? tiers.filter(t => t !== tier) : [...tiers, tier])
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{e.id ? 'Edit Product' : 'New Product'}</h1>
          <button onClick={() => setEditing(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Basic Info</h3>
              <div><label className="form-label">Title</label><input type="text" value={e.title} onChange={ev => { set('title', ev.target.value); if (!e.id) set('slug', slug(ev.target.value)) }} className="form-input" /></div>
              <div><label className="form-label">Slug</label><input type="text" value={e.slug} onChange={ev => set('slug', ev.target.value)} className="form-input" /></div>
              <div><label className="form-label">Short Description</label><input type="text" value={e.short_description || ''} onChange={ev => set('short_description', ev.target.value)} className="form-input" maxLength={200} /></div>
              <div><label className="form-label">Full Description</label><textarea value={e.description || ''} onChange={ev => set('description', ev.target.value)} className="form-input resize-none" rows={5} /></div>
              <div><label className="form-label">Tags (comma-separated)</label><input type="text" value={Array.isArray(e.tags) ? e.tags.join(', ') : e.tags || ''} onChange={ev => set('tags', ev.target.value)} className="form-input" /></div>
            </div>
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Media</h3>
              <div><label className="form-label">Image URL</label><input type="url" value={e.image_url || ''} onChange={ev => set('image_url', ev.target.value)} className="form-input" /></div>
              {e.image_url && <img src={e.image_url} alt="" className="w-32 h-32 rounded-lg object-cover" />}
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Type & Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Type</label><select value={e.product_type} onChange={ev => set('product_type', ev.target.value)} className="form-input">{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="form-label">Category</label><select value={e.category} onChange={ev => set('category', ev.target.value)} className="form-input">{CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Price (£)</label><input type="number" step="0.01" value={e.price_gbp || ''} onChange={ev => set('price_gbp', ev.target.value)} className="form-input" placeholder="Blank = free" /></div>
                <div><label className="form-label">Was (£)</label><input type="number" step="0.01" value={e.compare_at_price_gbp || ''} onChange={ev => set('compare_at_price_gbp', ev.target.value)} className="form-input" /></div>
              </div>
              <div>
                <label className="form-label">Free for Tiers</label>
                <div className="flex gap-3">
                  {['premium', 'pro'].map(tier => (
                    <label key={tier} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={(e.free_for_tiers || []).includes(tier)} onChange={() => toggleTier(tier)} className="rounded" />
                      {tier}
                    </label>
                  ))}
                </div>
              </div>
              <div><label className="form-label">Status</label><select value={e.status} onChange={ev => set('status', ev.target.value)} className="form-input">{['draft', 'active', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={e.featured} onChange={ev => set('featured', ev.target.checked)} className="rounded" /> Featured product</label>
              <div><label className="form-label">Sort Order</label><input type="number" value={e.sort_order || 0} onChange={ev => set('sort_order', parseInt(ev.target.value) || 0)} className="form-input w-24" /></div>
            </div>

            {e.product_type === 'digital' && (
              <div className="glass-card p-5 space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Digital File</h3>
                <div><label className="form-label">File URL (Supabase Storage or external)</label><input type="url" value={e.file_url || ''} onChange={ev => set('file_url', ev.target.value)} className="form-input" /></div>
                <div><label className="form-label">Display File Name</label><input type="text" value={e.file_name || ''} onChange={ev => set('file_name', ev.target.value)} className="form-input" placeholder="e.g. TK-Recipe-Book.pdf" /></div>
              </div>
            )}

            {e.product_type === 'affiliate' && (
              <div className="glass-card p-5 space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Affiliate Link</h3>
                <div><label className="form-label">Affiliate URL</label><input type="url" value={e.affiliate_url || ''} onChange={ev => set('affiliate_url', ev.target.value)} className="form-input" /></div>
                <div><label className="form-label">Source</label><input type="text" value={e.affiliate_source || ''} onChange={ev => set('affiliate_source', ev.target.value)} className="form-input" placeholder="e.g. Amazon, iHerb" /></div>
              </div>
            )}

            {e.product_type === 'physical' && (
              <div className="glass-card p-5 space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Physical Product</h3>
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={e.requires_shipping} onChange={ev => set('requires_shipping', ev.target.checked)} className="rounded" /> Requires shipping</label>
                <div><label className="form-label">Stock Quantity</label><input type="number" value={e.stock_quantity || ''} onChange={ev => set('stock_quantity', ev.target.value)} className="form-input w-32" /></div>
              </div>
            )}

            <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ====== LIST VIEW ======
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">Shop Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage products, orders, and digital downloads</p>
        </div>
        <button onClick={() => setEditing(empty())} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700 w-fit">
        {[{ id: 'products', label: 'Products', icon: ShoppingBag }, { id: 'orders', label: 'Orders', icon: Package }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-temple-purple text-white dark:bg-temple-gold dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <>
          <div className="glass-card p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="form-input pl-10 w-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p></div>
            <div className="glass-card p-4"><p className="text-sm text-gray-500">Active</p><p className="text-2xl font-bold text-green-600">{products.filter(p => p.status === 'active').length}</p></div>
            <div className="glass-card p-4"><p className="text-sm text-gray-500">Draft</p><p className="text-2xl font-bold text-yellow-600">{products.filter(p => p.status === 'draft').length}</p></div>
            <div className="glass-card p-4"><p className="text-sm text-gray-500">Featured</p><p className="text-2xl font-bold text-temple-gold">{products.filter(p => p.featured).length}</p></div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="spinner"></div></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No products found</div>
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Product</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Type</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Price</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {p.image_url ? <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><ShoppingBag className="w-4 h-4 text-gray-400" /></div>}
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate flex items-center gap-1">
                              {p.featured && <Star className="w-3.5 h-3.5 text-temple-gold" />}
                              {p.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{p.category.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{p.product_type}</span></td>
                      <td className="p-4"><span className="text-sm font-medium text-gray-900 dark:text-white">{p.price_gbp ? `£${p.price_gbp.toFixed(2)}` : 'Free'}</span></td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : p.status === 'draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditing({ ...p })} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Edit"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'orders' && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Customer</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Items</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Total</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Payment</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Shipping</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No orders yet</td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{o.user?.first_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{o.user?.email}</p>
                  </td>
                  <td className="p-4">
                    {(o.items || []).map((item, i) => (
                      <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{item.product?.title || 'Product'} × {item.quantity}</p>
                    ))}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{o.total_gbp > 0 ? `£${o.total_gbp.toFixed(2)}` : 'Free'}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.payment_status === 'paid' ? 'bg-green-100 text-green-700' : o.payment_status === 'free' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.payment_status}</span>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    {o.shipping_status ? (
                      <select value={o.shipping_status} onChange={ev => handleShipUpdate(o.id, ev.target.value)} className="text-xs form-input py-1 px-2">
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    ) : <span className="text-xs text-gray-400">N/A</span>}
                  </td>
                  <td className="p-4 text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
