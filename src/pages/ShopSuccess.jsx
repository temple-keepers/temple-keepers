import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { shopService } from '../services/shopService'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import { CheckCircle, Loader2, XCircle, ShoppingBag, Library } from 'lucide-react'

export const ShopSuccess = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // verifying, success, error

  useEffect(() => {
    const sessionId = params.get('session_id')
    if (sessionId) {
      verifyPayment(sessionId)
    } else {
      setStatus('error')
    }
  }, [])

  const verifyPayment = async (sessionId) => {
    try {
      const result = await shopService.verifyPayment(sessionId)
      if (result.success) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
        <AppHeader title="Shop" />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="w-16 h-16 text-temple-purple dark:text-temple-gold mx-auto mb-6 animate-spin" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Confirming your purchase...</h1>
              <p className="text-gray-500">Please wait while we verify your payment.</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank you!</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">Your purchase is complete. Digital products are now available in your library.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => navigate('/shop/library')} className="btn-primary flex items-center justify-center gap-2">
                  <Library className="w-4 h-4" /> Go to My Library
                </button>
                <button onClick={() => navigate('/shop')} className="text-sm text-gray-500 hover:underline">Continue Shopping</button>
              </div>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">We couldn't verify your payment. If you were charged, please contact us.</p>
              <button onClick={() => navigate('/shop')} className="btn-primary flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Back to Shop
              </button>
            </>
          )}
        </div>
      </div>
      <BottomNav />
    </>
  )
}
