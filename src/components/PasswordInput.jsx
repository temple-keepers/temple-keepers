import { useState, useMemo } from 'react'
import { Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react'

// Common passwords that Supabase's pwned-password check will reject
const COMMON_PATTERNS = [
  /^password/i, /^123456/, /^qwerty/i, /^abc123/i,
  /^letmein/i, /^welcome/i, /^monkey/i, /^dragon/i,
  /^master/i, /^jesus/i, /^blessed/i, /^faith/i,
  /^church/i, /^temple/i, /^praise/i, /^amen/i,
]

const getStrength = (password) => {
  if (!password) return { score: 0, label: '', colour: '' }

  let score = 0
  const checks = {
    length8: password.length >= 8,
    length12: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    digit: /[0-9]/.test(password),
    symbol: /[^a-zA-Z0-9]/.test(password),
    noCommon: !COMMON_PATTERNS.some(p => p.test(password)),
    noRepeat: !/(.)\1{2,}/.test(password),
  }

  if (checks.length8) score += 1
  if (checks.length12) score += 1
  if (checks.lowercase) score += 1
  if (checks.uppercase) score += 1
  if (checks.digit) score += 1
  if (checks.symbol) score += 1
  if (checks.noCommon) score += 1
  if (checks.noRepeat) score += 0.5

  // Cap at 5 levels
  const level = Math.min(Math.floor(score / 1.5), 4)

  const levels = [
    { label: 'Too weak', colour: 'bg-red-500' },
    { label: 'Weak', colour: 'bg-orange-500' },
    { label: 'Fair', colour: 'bg-yellow-500' },
    { label: 'Good', colour: 'bg-blue-500' },
    { label: 'Strong', colour: 'bg-green-500' },
  ]

  return { ...levels[level], score: level, checks }
}

export const PasswordInput = ({
  value,
  onChange,
  label = 'Password',
  placeholder = '••••••••',
  showStrength = true,
  showRequirements = true,
  minLength = 8,
  disabled = false,
  id,
  name,
  autoComplete,
}) => {
  const [visible, setVisible] = useState(false)
  const strength = useMemo(() => getStrength(value), [value])

  const requirements = [
    { met: value.length >= minLength, text: `At least ${minLength} characters` },
    { met: /[A-Z]/.test(value), text: 'One uppercase letter' },
    { met: /[a-z]/.test(value), text: 'One lowercase letter' },
    { met: /[0-9]/.test(value), text: 'One number' },
    { met: /[^a-zA-Z0-9]/.test(value), text: 'One special character (!@#$%...)' },
  ]

  const allMet = requirements.every(r => r.met)

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="form-input pr-10"
          placeholder={placeholder}
          required
          disabled={disabled}
          minLength={minLength}
          id={id}
          name={name}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          tabIndex={-1}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Strength bar */}
      {showStrength && value.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-1 mb-1">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i <= strength.score ? strength.colour : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className={`text-xs font-medium ${
            strength.score <= 1 ? 'text-red-500' :
            strength.score === 2 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-green-600 dark:text-green-400'
          }`}>
            {strength.label}
          </p>
        </div>
      )}

      {/* Requirements checklist */}
      {showRequirements && value.length > 0 && (
        <div className="mt-2 space-y-1">
          {requirements.map((req, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {req.met ? (
                <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
              ) : (
                <X className="w-3 h-3 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              )}
              <span className={`text-xs ${
                req.met
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {req.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Warning about common passwords */}
      {value.length >= minLength && strength.checks && !strength.checks.noCommon && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>This looks like a common password and may be rejected. Try something more unique.</span>
        </div>
      )}

      {/* Tip when no input yet */}
      {value.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Use a mix of letters, numbers, and symbols — avoid common words
        </p>
      )}
    </div>
  )
}
