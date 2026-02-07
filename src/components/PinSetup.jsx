import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { hashPin, verifyPin } from '../lib/pinUtils'
import toast from 'react-hot-toast'
import { Lock, ShieldCheck, Trash2, KeyRound } from 'lucide-react'

export const PinSetup = () => {
  const { user, profile } = useAuth()
  const [hasPin, setHasPin] = useState(false)
  const [step, setStep] = useState('idle') // idle | enter | confirm | removing
  const [pin, setPin] = useState(['', '', '', ''])
  const [confirmPin, setConfirmPin] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRefs = [useRef(), useRef(), useRef(), useRef()]
  const confirmRefs = [useRef(), useRef(), useRef(), useRef()]

  useEffect(() => {
    setHasPin(!!profile?.pin_hash)
  }, [profile])

  const resetState = () => {
    setStep('idle')
    setPin(['', '', '', ''])
    setConfirmPin(['', '', '', ''])
    setError('')
  }

  const handleDigit = (value, index, isConfirm = false) => {
    const arr = isConfirm ? [...confirmPin] : [...pin]
    const refs = isConfirm ? confirmRefs : inputRefs
    const setter = isConfirm ? setConfirmPin : setPin

    arr[index] = value.replace(/\D/g, '').slice(-1)
    setter(arr)
    setError('')

    if (arr[index] && index < 3) {
      refs[index + 1].current?.focus()
    }

    // Auto-advance from enter → confirm
    if (!isConfirm && index === 3 && arr.join('').length === 4) {
      setTimeout(() => {
        setStep('confirm')
        setTimeout(() => confirmRefs[0].current?.focus(), 50)
      }, 150)
    }
  }

  const handleKeyDown = (e, index, isConfirm = false) => {
    const arr = isConfirm ? confirmPin : pin
    const refs = isConfirm ? confirmRefs : inputRefs
    const setter = isConfirm ? setConfirmPin : setPin

    if (e.key === 'Backspace') {
      e.preventDefault()
      const newArr = [...arr]
      if (arr[index]) {
        newArr[index] = ''
        setter(newArr)
      } else if (index > 0) {
        newArr[index - 1] = ''
        setter(newArr)
        refs[index - 1].current?.focus()
      }
    }
  }

  const handleSave = async () => {
    const entered = pin.join('')
    const confirmed = confirmPin.join('')

    if (entered.length !== 4 || confirmed.length !== 4) {
      setError('Please enter all 4 digits')
      return
    }

    if (entered !== confirmed) {
      setError('PINs do not match. Please try again.')
      setConfirmPin(['', '', '', ''])
      setStep('confirm')
      setTimeout(() => confirmRefs[0].current?.focus(), 50)
      return
    }

    setSaving(true)
    try {
      const hash = await hashPin(entered, user.id)
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ pin_hash: hash })
        .eq('id', user.id)

      if (dbError) throw dbError

      setHasPin(true)
      // Store flag so lock screen activates on next visit
      localStorage.setItem(`tk-pin-enabled-${user.id}`, 'true')
      toast.success('PIN set up successfully!')
      resetState()
    } catch (err) {
      console.error('PIN save error:', err)
      toast.error('Failed to save PIN. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemovePin = async () => {
    setSaving(true)
    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ pin_hash: null })
        .eq('id', user.id)

      if (dbError) throw dbError

      setHasPin(false)
      localStorage.removeItem(`tk-pin-enabled-${user.id}`)
      toast.success('PIN removed')
      resetState()
    } catch (err) {
      toast.error('Failed to remove PIN')
    } finally {
      setSaving(false)
    }
  }

  const PinInput = ({ values, refs, isConfirm = false }) => (
    <div className="flex justify-center gap-3">
      {values.map((digit, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleDigit(e.target.value, i, isConfirm)}
          onKeyDown={(e) => handleKeyDown(e, i, isConfirm)}
          className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-white dark:bg-gray-800 focus:outline-none transition-all ${
            digit
              ? 'border-temple-purple dark:border-temple-gold text-temple-purple dark:text-temple-gold'
              : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
          } focus:border-temple-purple dark:focus:border-temple-gold focus:ring-2 focus:ring-temple-purple/20 dark:focus:ring-temple-gold/20`}
          aria-label={`${isConfirm ? 'Confirm' : ''} PIN digit ${i + 1}`}
        />
      ))}
    </div>
  )

  // Idle state — show setup or manage
  if (step === 'idle') {
    return (
      <div className="glass-card p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-temple-purple to-temple-purple-dark dark:from-temple-gold dark:to-yellow-600 flex items-center justify-center flex-shrink-0">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">Quick PIN Login</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {hasPin ? 'PIN is active — unlock with 4 digits' : 'Set a 4-digit PIN for faster access'}
          </p>
        </div>
        {hasPin ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setStep('enter')
                setTimeout(() => inputRefs[0].current?.focus(), 50)
              }}
              className="text-sm text-temple-purple dark:text-temple-gold hover:underline font-medium"
            >
              Change
            </button>
            <button
              onClick={handleRemovePin}
              disabled={saving}
              className="text-sm text-red-500 hover:underline font-medium"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setStep('enter')
              setTimeout(() => inputRefs[0].current?.focus(), 50)
            }}
            className="text-sm text-temple-purple dark:text-temple-gold hover:underline font-medium whitespace-nowrap"
          >
            Set up
          </button>
        )}
      </div>
    )
  }

  // Enter / Confirm flow
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <KeyRound className="w-5 h-5 text-temple-purple dark:text-temple-gold" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {step === 'enter' ? 'Enter a 4-digit PIN' : 'Confirm your PIN'}
        </h3>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {step === 'enter'
          ? 'Choose a PIN you\'ll remember. You can always sign in with your password.'
          : 'Enter the same PIN again to confirm.'}
      </p>

      {step === 'enter' && <PinInput values={pin} refs={inputRefs} />}
      {step === 'confirm' && <PinInput values={confirmPin} refs={confirmRefs} isConfirm />}

      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm mt-3 text-center">{error}</p>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={resetState}
          className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
        >
          Cancel
        </button>

        {step === 'confirm' && (
          <button
            onClick={handleSave}
            disabled={saving || confirmPin.join('').length !== 4}
            className="btn-primary text-sm px-6 py-2 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save PIN'}
          </button>
        )}
      </div>
    </div>
  )
}
