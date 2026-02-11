import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { shopService } from '../services/shopService'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import toast from 'react-hot-toast'
import { Library, Download, BookOpen, Loader2, ShoppingBag, Crown } from 'lucide-react'

export const ShopLibrary = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState(null)

  useEffect(() => { loadLibrary() }, [])

  const loadLibrary = async () => {
    setLoading(true)
    const { data } = await shopService.getLibrary()
    setItems(data || [])
    setLoading(false)
  }

  const handleDownload = async (productId) => {
    setDownloadingId(productId)
    try {
      const result = await shopService.getDownloadUrl(productId)
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
    } catch { toast.error('Download failed') }
    finally { setDownloadingId(null) }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
        <AppHeader title="My Library" />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Library className="w-6 h-6 text-temple-purple dark:text-temple-gold" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Library</h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="spinner"></div></div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">Your library is empty</p>
              <button onClick={() => navigate('/shop')} className="btn-primary flex items-center gap-2 mx-auto">
                <ShoppingBag className="w-4 h-4" /> Browse Shop
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => {
                const product = item.product
                if (!product) return null
                return (
                  <div key={item.id} className="glass-card p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-temple-purple/5 dark:bg-temple-purple/10 flex-shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-temple-purple/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{product.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          item.access_type === 'tier_free'
                            ? 'bg-temple-gold/20 text-temple-gold'
                            : item.access_type === 'gifted'
                              ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        }`}>
                          {item.access_type === 'tier_free' && <Crown className="w-3 h-3 inline mr-1" />}
                          {item.access_type === 'tier_free' ? 'Plan benefit' : item.access_type === 'gifted' ? 'Gifted' : 'Purchased'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {item.download_count || 0} downloads
                        </span>
                      </div>
                    </div>
                    {product.file_url && (
                      <button
                        onClick={() => handleDownload(product.id)}
                        disabled={downloadingId === product.id}
                        className="btn-primary px-4 py-2 text-sm flex items-center gap-2 flex-shrink-0"
                      >
                        {downloadingId === product.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Download className="w-4 h-4" />
                        }
                        {downloadingId === product.id ? '...' : 'Download'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </>
  )
}
