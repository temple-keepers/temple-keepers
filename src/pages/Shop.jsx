import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { shopService } from '../services/shopService'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import {
  ShoppingBag, BookOpen, Dumbbell, Heart, Star, ExternalLink,
  Download, Package, Filter, Library, Crown, Sparkles
} from 'lucide-react'

const CATEGORIES = [
  { value: '', label: 'All', icon: ShoppingBag },
  { value: 'ebooks', label: 'eBooks', icon: BookOpen },
  { value: 'recipe_books', label: 'Recipes', icon: BookOpen },
  { value: 'supplements', label: 'Supplements', icon: Heart },
  { value: 'fitness', label: 'Fitness', icon: Dumbbell },
  { value: 'wellness', label: 'Wellness', icon: Sparkles },
  { value: 'devotionals', label: 'Devotionals', icon: Star },
]

const TYPE_ICONS = {
  digital: Download,
  physical: Package,
  affiliate: ExternalLink,
}

export const Shop = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [ownedIds, setOwnedIds] = useState(new Set())

  useEffect(() => {
    loadProducts()
  }, [category])

  useEffect(() => {
    loadLibrary()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    const { data } = await shopService.getProducts({ category: category || undefined })
    setProducts(data || [])
    setLoading(false)
  }

  const loadLibrary = async () => {
    const { data } = await shopService.getLibrary()
    if (data) {
      setOwnedIds(new Set(data.map(item => item.product_id)))
    }
  }

  const userTier = profile?.tier || 'free'

  const getDisplayPrice = (product) => {
    const freeTiers = product.free_for_tiers || []
    if (freeTiers.includes(userTier)) return { text: 'Free with your plan', free: true, tierFree: true }
    if (!product.price_gbp || product.price_gbp === 0) return { text: 'Free', free: true }
    return { text: `£${product.price_gbp.toFixed(2)}`, free: false }
  }

  const featured = products.filter(p => p.featured)
  const regular = products.filter(p => !p.featured)

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
        <AppHeader title="Shop" />

        <div className="max-w-6xl mx-auto px-4 py-6">

          {/* Hero */}
          <div className="glass-card p-6 sm:p-8 mb-6 bg-gradient-to-br from-temple-purple/5 to-transparent dark:from-temple-purple/10">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Temple Keepers Shop</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resources for your body, mind & spirit</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => navigate('/shop/library')}
                className="text-sm font-medium text-temple-purple dark:text-temple-gold hover:underline flex items-center gap-1"
              >
                <Library className="w-4 h-4" /> My Library
              </button>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <button
                onClick={() => navigate('/shop/orders')}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:underline flex items-center gap-1"
              >
                <Package className="w-4 h-4" /> My Orders
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                    category === cat.value
                      ? 'bg-temple-purple text-white dark:bg-temple-gold dark:text-gray-900 border-transparent'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              )
            })}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="spinner"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No products available yet. Check back soon!</p>
            </div>
          ) : (
            <>
              {/* Featured Products */}
              {featured.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-temple-gold" /> Featured
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featured.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        price={getDisplayPrice(product)}
                        owned={ownedIds.has(product.id)}
                        onClick={() => navigate(`/shop/${product.slug}`)}
                        featured
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Products */}
              {regular.length > 0 && (
                <div>
                  {featured.length > 0 && (
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Products</h2>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {regular.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        price={getDisplayPrice(product)}
                        owned={ownedIds.has(product.id)}
                        onClick={() => {
                          if (product.product_type === 'affiliate') {
                            window.open(product.affiliate_url, '_blank', 'noopener')
                          } else {
                            navigate(`/shop/${product.slug}`)
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <BottomNav />
    </>
  )
}

const ProductCard = ({ product, price, owned, onClick, featured }) => {
  const TypeIcon = TYPE_ICONS[product.product_type] || ShoppingBag

  return (
    <button
      onClick={onClick}
      className={`glass-card overflow-hidden text-left hover:shadow-lg transition-all group ${
        featured ? 'ring-1 ring-temple-gold/30' : ''
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-temple-purple/5 to-temple-purple/10 dark:from-temple-purple/10 dark:to-temple-purple/20 overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-temple-purple/20 dark:text-temple-gold/20" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {owned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500 text-white">
              <Download className="w-3 h-3" /> Owned
            </span>
          )}
          {price.tierFree && !owned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-temple-gold text-gray-900">
              <Crown className="w-3 h-3" /> Free for you
            </span>
          )}
          {featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-temple-gold/90 text-gray-900">
              <Star className="w-3 h-3" /> Featured
            </span>
          )}
        </div>

        {/* Type badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
            <TypeIcon className="w-3 h-3" />
            {product.product_type === 'affiliate' ? 'External' : product.product_type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
          {product.title}
        </h3>
        {product.short_description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {product.short_description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div>
            {product.compare_at_price_gbp && product.compare_at_price_gbp > (product.price_gbp || 0) && (
              <span className="text-xs text-gray-400 line-through mr-2">£{product.compare_at_price_gbp.toFixed(2)}</span>
            )}
            <span className={`text-sm font-bold ${
              price.free
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-900 dark:text-white'
            }`}>
              {price.text}
            </span>
          </div>
          {product.product_type === 'affiliate' && (
            <ExternalLink className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
    </button>
  )
}
