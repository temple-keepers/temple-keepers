import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { shopService } from '../services/shopService'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import { Package, CheckCircle, Clock, XCircle, Truck, ShoppingBag } from 'lucide-react'

const STATUS_CONFIG = {
  completed: { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Completed' },
  pending: { icon: Clock, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'Pending' },
  cancelled: { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Cancelled' },
  refunded: { icon: XCircle, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800', label: 'Refunded' },
}

export const ShopOrders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    setLoading(true)
    const { data } = await shopService.getOrders()
    setOrders(data || [])
    setLoading(false)
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
        <AppHeader title="My Orders" />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 text-temple-purple dark:text-temple-gold" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="spinner"></div></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No orders yet</p>
              <button onClick={() => navigate('/shop')} className="btn-primary flex items-center gap-2 mx-auto">
                <ShoppingBag className="w-4 h-4" /> Browse Shop
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                const StatusIcon = cfg.icon
                return (
                  <div key={order.id} className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" /> {cfg.label}
                        </span>
                        {order.payment_status === 'free' && (
                          <span className="text-xs text-gray-400">Free</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {(order.items || []).map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-temple-purple/5 dark:bg-temple-purple/10 flex-shrink-0">
                            {item.product?.image_url ? (
                              <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-temple-purple/20" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {item.product?.title || 'Product'}
                            </p>
                            <p className="text-xs text-gray-500">Qty {item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.total_price_gbp > 0 ? `£${item.total_price_gbp.toFixed(2)}` : 'Free'}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Shipping */}
                    {order.shipping_status && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-sm text-gray-500">
                        <Truck className="w-4 h-4" />
                        Shipping: {order.shipping_status}
                        {order.tracking_number && <span className="font-mono text-xs">({order.tracking_number})</span>}
                      </div>
                    )}

                    {/* Total */}
                    {order.total_gbp > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                        <span className="text-sm text-gray-500">Total</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">£{order.total_gbp.toFixed(2)}</span>
                      </div>
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
