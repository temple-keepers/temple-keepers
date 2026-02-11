import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { shopService } from '../services/shopService'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Download, ShoppingBag, Crown, Star, ExternalLink,
  Package, BookOpen, CheckCircle, Loader2, Shield
} from 'lucide-react'

export const ShopProduct = () => {
  const { slug } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [owned, setOwned] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [slug])

  const loadProduct = async () => {
    setLoading(true)
    const { data } = await shopService.getProduct(slug)
    setProduct(data)

    if (data && user) {
      const isOwned = await shopService.checkOwnership(data.id)
      setOwned(isOwned)
    }
    setLoading(false)
  }

  const userTier = profile?.tier || 'free'

  const getDisplayPrice = () => {
    if (!product) return { text: '', free: false }
    const freeTiers = product.free_for_tiers || []
    if (freeTiers.includes(userTier)) return { text: 'Free with your plan', free: true, tierFree: true }
    if (!product.price_gbp || product.price_gbp === 0) return { text: 'Free', free: true }
    return { text: `£${product.price_gbp.toFixed(2)}`, free: false }
  }

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please sign in to purchase')
      navigate('/login')
      return
    }

    setPurchasing(true)
    try {
      const result = await shopService.checkout(product.id)

      if (result.error) {
        if (result.alreadyOwned) {
          setOwned(true)
          toast.success('You already own this!')
        } else {
          toast.error(result.error)
        }
        return
      }

      if (result.free) {
        setOwned(true)
        toast.success('Added to your library!')
        return
      }

      // Redirect to Stripe
      if (result.url) {
        window.location.href = result.url
      }
    } catch (err) {
      console.error('Purchase error:', err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setPurchasing(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const result = await shopService.getDownloadUrl(product.id)
      if (result.url) {
        const link = document.createElement('a')
        link.href = result.url
        link.download = result.fileName || 'download'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('Download started!')
      } else {
        toast.error(result.error || 'Download failed')
      }
    } catch (err) {
      toast.error('Download failed')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
          <AppHeader title="Shop" />
          <div className="flex items-center justify-center py-20"><div className="spinner"></div></div>
        </div>
        <BottomNav />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
          <AppHeader title="Shop" />
          <div className="text-center py-20">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Product not found</p>
            <button onClick={() => navigate('/shop')} className="btn-primary mt-4">Back to Shop</button>
          </div>
        </div>
        <BottomNav />
      </>
    )
  }

  const price = getDisplayPrice()

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
        <AppHeader title="Shop" />

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Back */}
          <button onClick={() => navigate('/shop')} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="glass-card overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-temple-purple/5 to-temple-purple/10 dark:from-temple-purple/10 dark:to-temple-purple/20">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-20 h-20 text-temple-purple/15 dark:text-temple-gold/15" />
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Title & badges */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {product.product_type === 'digital' && <Download className="w-3 h-3" />}
                    {product.product_type === 'physical' && <Package className="w-3 h-3" />}
                    {product.product_type === 'affiliate' && <ExternalLink className="w-3 h-3" />}
                    {product.product_type}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-temple-purple/10 dark:bg-temple-gold/10 text-temple-purple dark:text-temple-gold">
                    {product.category.replace(/_/g, ' ')}
                  </span>
                  {product.featured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-temple-gold/20 text-temple-gold">
                      <Star className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{product.title}</h1>

                {product.short_description && (
                  <p className="text-gray-600 dark:text-gray-400">{product.short_description}</p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                {product.compare_at_price_gbp && product.compare_at_price_gbp > (product.price_gbp || 0) && (
                  <span className="text-lg text-gray-400 line-through">£{product.compare_at_price_gbp.toFixed(2)}</span>
                )}
                <span className={`text-3xl font-bold ${
                  price.free ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                }`}>
                  {price.text}
                </span>
                {price.tierFree && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-temple-gold/20 text-temple-gold">
                    <Crown className="w-3 h-3" /> {userTier} benefit
                  </span>
                )}
              </div>

              {/* CTA */}
              <div>
                {owned ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                      <CheckCircle className="w-5 h-5" /> You own this
                    </div>
                    {product.product_type === 'digital' && product.file_url && (
                      <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {downloading ? 'Preparing...' : 'Download'}
                      </button>
                    )}
                  </div>
                ) : product.product_type === 'affiliate' ? (
                  <a
                    href={product.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on {product.affiliate_source || 'External Site'}
                  </a>
                ) : (
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {purchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                    {purchasing ? 'Processing...' : price.free ? 'Get for Free' : `Buy for ${price.text}`}
                  </button>
                )}
              </div>

              {/* Trust signals */}
              <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Secure checkout</span>
                {product.product_type === 'digital' && <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> Instant download</span>}
              </div>

              {/* Description */}
              {product.description && (
                <div className="glass-card p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">About this product</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 whitespace-pre-line">
                    {product.description}
                  </div>
                </div>
              )}

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  )
}
