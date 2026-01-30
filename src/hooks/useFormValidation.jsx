import { useState, useCallback, useMemo } from 'react'
import { useToast } from '../contexts/ToastContext'
import { useTheme } from '../contexts/ThemeContext'

/**
 * Validation rules that can be composed together
 */
export const validationRules = {
  required: (message = 'This field is required') => (value) => {
    if (value === null || value === undefined || value === '' || 
        (Array.isArray(value) && value.length === 0)) {
      return message
    }
    return null
  },
  
  minLength: (min, message = `Must be at least ${min} characters`) => (value) => {
    if (!value) return null
    return value.length < min ? message : null
  },
  
  maxLength: (max, message = `Must be no more than ${max} characters`) => (value) => {
    if (!value) return null
    return value.length > max ? message : null
  },
  
  pattern: (regex, message = 'Invalid format') => (value) => {
    if (!value) return null
    return regex.test(value) ? null : message
  },
  
  email: (message = 'Please enter a valid email address') => (value) => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? null : message
  },
  
  passwordStrength: (message = 'Password must contain at least 8 characters, one uppercase, one lowercase, and one number') => (value) => {
    if (!value) return null
    const hasLength = value.length >= 8
    const hasUpper = /[A-Z]/.test(value)
    const hasLower = /[a-z]/.test(value)
    const hasNumber = /\d/.test(value)
    
    return hasLength && hasUpper && hasLower && hasNumber ? null : message
  },
  
  confirmPassword: (originalPassword, message = 'Passwords do not match') => (value) => {
    if (!value) return null
    return value === originalPassword ? null : message
  },
  
  url: (message = 'Please enter a valid URL') => (value) => {
    if (!value) return null
    try {
      new URL(value)
      return null
    } catch {
      return message
    }
  },
  
  custom: (validator, message = 'Invalid value') => (value) => {
    if (!value) return null
    return validator(value) ? null : message
  }
}

/**
 * Form validation hook
 */
export const useFormValidation = (initialValues = {}, validationSchema = {}, options = {}) => {
  const { toast } = useToast()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    showErrorToast = false,
    validateOnChange = true,
    validateOnBlur = true
  } = options
  
  // Validate a single field
  const validateField = useCallback((name, value) => {
    const fieldValidators = validationSchema[name]
    if (!fieldValidators) return null
    
    for (const validator of fieldValidators) {
      const error = validator(value)
      if (error) return error
    }
    return null
  }, [validationSchema])
  
  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {}
    let isValid = true
    
    Object.keys(validationSchema).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })
    
    setErrors(newErrors)
    return { isValid, errors: newErrors }
  }, [values, validateField, validationSchema])
  
  // Set field value
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    if (validateOnChange) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [validateField, validateOnChange])
  
  // Set multiple values
  const setMultipleValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }))
    
    if (validateOnChange) {
      const newErrors = { ...errors }
      Object.keys(newValues).forEach(name => {
        const error = validateField(name, newValues[name])
        newErrors[name] = error
      })
      setErrors(newErrors)
    }
  }, [errors, validateField, validateOnChange])
  
  // Handle field blur
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    
    if (validateOnBlur) {
      const error = validateField(name, values[name])
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [values, validateField, validateOnBlur])
  
  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit) => {
    const { isValid, errors: validationErrors } = validateForm()
    
    // Mark all fields as touched
    const allTouched = {}
    Object.keys(validationSchema).forEach(key => {
      allTouched[key] = true
    })
    setTouched(allTouched)
    
    if (!isValid) {
      if (showErrorToast) {
        const firstError = Object.values(validationErrors).find(Boolean)
        toast.error(firstError || 'Please fix the errors in the form')
      }
      return false
    }
    
    setIsSubmitting(true)
    try {
      await onSubmit(values)
      return true
    } catch (error) {
      console.error('Form submission error:', error)
      if (showErrorToast) {
        toast.error(error.message || 'Failed to submit form')
      }
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [validateForm, validationSchema, values, showErrorToast, toast])
  
  // Reset form
  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])
  
  // Simple validation function that can be used standalone
  const validateInput = useCallback((value, rules, fieldName = 'Field') => {
    if (!rules) return null
    
    // Convert single rule object to validator function
    if (typeof rules === 'object' && !Array.isArray(rules)) {
      const validators = []
      
      if (rules.required) {
        validators.push(validationRules.required(`${fieldName} is required`))
      }
      if (rules.minLength) {
        validators.push(validationRules.minLength(rules.minLength, `${fieldName} must be at least ${rules.minLength} characters`))
      }
      if (rules.maxLength) {
        validators.push(validationRules.maxLength(rules.maxLength, `${fieldName} must be no more than ${rules.maxLength} characters`))
      }
      if (rules.pattern) {
        validators.push(validationRules.pattern(rules.pattern, `${fieldName} format is invalid`))
      }
      if (rules.type === 'email') {
        validators.push(validationRules.email(`${fieldName} must be a valid email address`))
      }
      if (rules.passwordStrength) {
        validators.push(validationRules.passwordStrength(`${fieldName} must contain at least 8 characters, one uppercase, one lowercase, and one number`))
      }
      if (rules.confirmPassword) {
        validators.push(validationRules.confirmPassword(rules.confirmPassword, `${fieldName} must match`))
      }
      
      // Test all validators
      for (const validator of validators) {
        const error = validator(value)
        if (error) return error
      }
      return null
    }
    
    // Handle array of validators
    if (Array.isArray(rules)) {
      for (const validator of rules) {
        const error = validator(value)
        if (error) return error
      }
      return null
    }
    
    return null
  }, [])
  
  // Get field error helper
  const getFieldError = useCallback((fieldName) => {
    return touched[fieldName] ? errors[fieldName] : null
  }, [touched, errors])
  
  // Computed properties
  const isValid = useMemo(() => {
    return Object.keys(validationSchema).every(key => !errors[key])
  }, [errors, validationSchema])
  
  const hasErrors = useMemo(() => {
    return Object.values(errors).some(Boolean)
  }, [errors])
  
  const isDirty = useMemo(() => {
    return Object.keys(values).some(key => values[key] !== initialValues[key])
  }, [values, initialValues])
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    hasErrors,
    isDirty,
    setValue,
    setValues: setMultipleValues,
    handleBlur,
    handleSubmit,
    validateForm,
    validateField,
    validateInput,
    getFieldError,
    reset
  }
}

/**
 * Input component with validation
 */
export const ValidatedInput = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  className = '',
  placeholder = '',
  disabled = false,
  ...props
}) => {
  const { isDark } = useTheme()
  const showError = touched && error
  
  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={name}
          className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={() => onBlur(name)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
          showError
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : isDark
            ? 'border-gray-600 bg-gray-700 text-white focus:border-temple-gold focus:ring-2 focus:ring-temple-gold/20'
            : 'border-gray-300 bg-white focus:border-temple-purple focus:ring-2 focus:ring-temple-purple/20'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        {...props}
      />
      {showError && (
        <p className="text-red-500 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  )
}

export default useFormValidation