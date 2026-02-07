import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { verifyPin } from '../lib/pinUtils'
import { supabase } from '../lib/supabase'
import { Lock, Delete, LogIn } from 'lucide-react'

export const PinLockScreen = ({ onUnlock, onUsePassword }) => {
  const { user, profile } = useAuth()
  const [pin, setPin] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const inputRefs = [useRef(), useRef(), useRef(), useRef()]

  useEffect(() => {
    // Focus first input on mount
    inputRefs[0].current?.focus()
  }, [])

  const handleDigit = async (digit, index) => {
    if (attempts >= 5) return

    const newPin = [...pin]
    newPin[index] = digit
    setPin(newPin)
    setError('')

    // Move to next input
    if (index < 3 && digit) {
      inputRefs[index + 1].current?.focus()
    }

    // Auto-submit when all 4 digits entered
    if (index === 3 && digit) {
      const fullPin = newPin.join('')
      if (fullPin.length === 4) {
        await verifyEnteredPin(fullPin)
      }
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newPin = [...pin]
      if (pin[index]) {
        newPin[index] = ''
        setPin(newPin)
      } else if (index > 0) {
        newPin[index - 1] = ''
        setPin(newPin)
        inputRefs[index - 1].current?.focus()
      }
    }
  }

  const verifyEnteredPin = async (fullPin) => {
    setVerifying(true)
    try {
      const valid = await verifyPin(fullPin, user.id, profile.pin_hash)
      if (valid) {
        onUnlock()
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        setPin(['', '', '', ''])
        inputRefs[0].current?.focus()

        if (newAttempts >= 5) {
          setError('Too many attempts. Please use your password.')
        } else {
          setError(`Incorrect PIN. ${5 - newAttempts} attempts remaining.`)
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setPin(['', '', '', ''])
      inputRefs[0].current?.focus()
    } finally {
      setVerifying(false)
    }
  }

  const handleNumPad = async (digit) => {
    // Find first empty slot
    const emptyIndex = pin.findIndex(d => d === '')
    if (emptyIndex === -1) return
    await handleDigit(digit, emptyIndex)
  }

  const handleBackspace = () => {
    // Find last filled slot
    const lastFilled = pin.reduce((last, d, i) => d ? i : last, -1)
    if (lastFilled === -1) return
    const newPin = [...pin]
    newPin[lastFilled] = ''
    setPin(newPin)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-sm text-center">
        {/* Logo & greeting */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4 animate-float">
            <img src="/logo.png" alt="Temple Keepers" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-display font-bold gradient-text mb-1">
            Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Enter your PIN to continue</p>
        </div>

        {/* PIN dots */}
        <div className="flex justify-center gap-4 mb-6">
          {pin.map((digit, i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                digit
                  ? 'border-temple-purple dark:border-temple-gold bg-temple-purple/10 dark:bg-temple-gold/10 text-temple-purple dark:text-temple-gold'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
              } ${verifying ? 'opacity-50' : ''}`}
            >
              {digit ? '•' : ''}
            </div>
          ))}
        </div>

        {/* Hidden inputs for keyboard support */}
        <div className="sr-only">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(-1)
                handleDigit(val, i)
              }}
              onKeyDown={(e) => handleKeyDown(e, i)}
              aria-label={`PIN digit ${i + 1}`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>
        )}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button
              key={n}
              onClick={() => handleNumPad(String(n))}
              disabled={verifying || attempts >= 5}
              className="w-full aspect-square rounded-xl text-2xl font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-40"
            >
              {n}
            </button>
          ))}
          <div /> {/* empty space */}
          <button
            onClick={() => handleNumPad('0')}
            disabled={verifying || attempts >= 5}
            className="w-full aspect-square rounded-xl text-2xl font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-40"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            disabled={verifying}
            className="w-full aspect-square rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Use password instead */}
        <button
          onClick={onUsePassword}
          className="text-sm text-temple-purple dark:text-temple-gold hover:underline flex items-center justify-center gap-2 mx-auto"
        >
          <LogIn className="w-4 h-4" />
          Use password instead
        </button>
      </div>
    </div>
  )
}
