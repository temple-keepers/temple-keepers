import { useState, useCallback, useMemo } from 'react'
import { validateForm, secureInput, rateLimiters } from '../utils/security'

/**
 * Secure form hook with built-in validation and security measures
 */
export const useSecureForm = (initialValues = {}, validationRules = {}, options = {}) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitAttempts, setSubmitAttempts] = useState(0)

  // Rate limiter configuration
  const rateLimiter = options.rateLimiter || rateLimiters.general
  const identifier = options.identifier || 'anonymous'

  // Validate single field
  const validateField = useCallback((name, value) => {
    const rule = validationRules[name]
    if (!rule) return { valid: true, value }

    return secureInput(value, rule.validator, {
      ...rule.options,
      fieldType: name,
      trackValidation: true,
      rateLimiter: rateLimiter,
      identifier: `${identifier}_${name}`
    })
  }, [validationRules, rateLimiter, identifier])

  // Handle field change with validation
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }, [errors])

  // Handle field blur with validation
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    
    const value = values[name]
    const result = validateField(name, value)
    
    if (!result.valid) {
      setErrors(prev => ({ ...prev, [name]: result.error }))
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }))
      // Update with sanitized value
      if (result.value !== value) {
        setValues(prev => ({ ...prev, [name]: result.value }))
      }
    }
  }, [values, validateField])

  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors = {}
    const sanitizedValues = {}
    let isValid = true

    for (const [name, value] of Object.entries(values)) {
      const result = validateField(name, value)
      
      if (!result.valid) {
        newErrors[name] = result.error
        isValid = false
      } else {
        sanitizedValues[name] = result.value
      }
    }

    setErrors(newErrors)
    return { isValid, sanitizedValues }
  }, [values, validateField])

  // Secure submit handler
  const handleSubmit = useCallback(async (onSubmit) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setSubmitAttempts(prev => prev + 1)

    try {
      // Rate limiting check
      const rateLimitResult = rateLimiter.isAllowed(`${identifier}_submit`)
      if (!rateLimitResult.allowed) {
        throw new Error('Too many submission attempts. Please wait and try again.')
      }

      // Validate all fields
      const { isValid, sanitizedValues } = validateAll()
      
      if (!isValid) {
        throw new Error('Please fix the errors in the form')
      }

      // Mark all fields as touched
      const touchedFields = {}
      Object.keys(values).forEach(key => {
        touchedFields[key] = true
      })
      setTouched(touchedFields)

      // Call submit handler with sanitized values
      await onSubmit(sanitizedValues)

      // Reset submit attempts on success
      setSubmitAttempts(0)

    } catch (error) {
      console.error('Form submission error:', error)
      
      // Track submission errors
      if (window.gtag) {
        window.gtag('event', 'form_submission_error', {
          form_type: options.formType || 'unknown',
          error_message: error.message
        })
      }
      
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, rateLimiter, identifier, validateAll, values, options.formType])

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
    setSubmitAttempts(0)
  }, [initialValues])

  // Get field props for easy integration
  const getFieldProps = useCallback((name) => ({
    value: values[name] || '',
    onChange: (e) => handleChange(name, e.target.value),
    onBlur: () => handleBlur(name),
    error: touched[name] ? errors[name] : '',
    'data-field-name': name
  }), [values, handleChange, handleBlur, touched, errors])

  // Compute form state
  const formState = useMemo(() => ({
    isValid: Object.keys(errors).length === 0 && Object.keys(touched).length > 0,
    hasErrors: Object.keys(errors).some(key => errors[key]),
    isSubmitting,
    submitAttempts,
    isDirty: JSON.stringify(values) !== JSON.stringify(initialValues)
  }), [errors, touched, isSubmitting, submitAttempts, values, initialValues])

  return {
    values,
    errors,
    touched,
    formState,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    validateAll,
    getFieldProps,
    reset
  }
}

/**
 * Secure input component with built-in validation
 */
export const SecureInput = ({
  name,
  type = 'text',
  label,
  placeholder,
  required = false,
  autoComplete,
  className = '',
  getFieldProps,
  ...props
}) => {
  const fieldProps = getFieldProps(name)
  
  return (
    <div className={`secure-input-wrapper ${className}`}>
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
          ${fieldProps.error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:border-blue-500'
          }
        `}
        {...fieldProps}
        {...props}
      />
      
      {fieldProps.error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {fieldProps.error}
        </p>
      )}
    </div>
  )
}

/**
 * Security-focused form validation rules
 */
export const securityRules = {
  email: {
    validator: validateForm.email,
    options: { required: true }
  },
  
  password: {
    validator: validateForm.password,
    options: { required: true }
  },
  
  confirmPassword: {
    validator: (value, options) => {
      const { password } = options.formValues || {}
      
      if (!value) return { valid: false, error: 'Please confirm your password' }
      if (value !== password) return { valid: false, error: 'Passwords do not match' }
      
      return { valid: true, value }
    },
    options: { required: true }
  },
  
  firstName: {
    validator: validateForm.text,
    options: { required: true, minLength: 1, maxLength: 50 }
  },
  
  lastName: {
    validator: validateForm.text,
    options: { required: true, minLength: 1, maxLength: 50 }
  },
  
  displayName: {
    validator: validateForm.text,
    options: { required: false, minLength: 2, maxLength: 30 }
  },
  
  bio: {
    validator: validateForm.text,
    options: { required: false, maxLength: 500 }
  },
  
  website: {
    validator: validateForm.url,
    options: { 
      required: false,
      allowedDomains: [] // Empty means all domains allowed
    }
  }
}