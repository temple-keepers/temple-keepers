import { describe, it, expect, vi } from 'vitest'
import { sanitizeInput, validateForm, RateLimiter, generateCSPNonce } from '../utils/security'

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = sanitizeInput(input)
      expect(result).toBe('Hello')
    })

    it('should remove event handlers', () => {
      const input = '<div onclick="alert()">Hello</div>'
      const result = sanitizeInput(input)
      expect(result).toBe('<div>Hello</div>')
    })

    it('should preserve safe HTML', () => {
      const input = '<p><strong>Bold text</strong></p>'
      const result = sanitizeInput(input)
      expect(result).toBe('<p><strong>Bold text</strong></p>')
    })

    it('should handle empty input', () => {
      const result = sanitizeInput('')
      expect(result).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(sanitizeInput(null)).toBe('')
      expect(sanitizeInput(undefined)).toBe('')
    })
  })

  describe('validateForm', () => {
    it('should validate email field', () => {
      const rules = { email: { required: true, email: true } }
      
      const validResult = validateForm({ email: 'test@example.com' }, rules)
      expect(validResult.isValid).toBe(true)
      expect(validResult.errors).toEqual({})
      
      const invalidResult = validateForm({ email: 'invalid-email' }, rules)
      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.errors.email).toBe('Please enter a valid email address')
    })

    it('should validate required fields', () => {
      const rules = { name: { required: true } }
      
      const invalidResult = validateForm({ name: '' }, rules)
      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.errors.name).toBe('This field is required')
      
      const validResult = validateForm({ name: 'John' }, rules)
      expect(validResult.isValid).toBe(true)
    })

    it('should validate minimum length', () => {
      const rules = { password: { required: true, minLength: 8 } }
      
      const invalidResult = validateForm({ password: '123' }, rules)
      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.errors.password).toBe('Must be at least 8 characters long')
      
      const validResult = validateForm({ password: '12345678' }, rules)
      expect(validResult.isValid).toBe(true)
    })

    it('should validate maximum length', () => {
      const rules = { bio: { maxLength: 10 } }
      
      const invalidResult = validateForm({ bio: 'This is way too long' }, rules)
      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.errors.bio).toBe('Must be no more than 10 characters long')
    })

    it('should use custom validation functions', () => {
      const rules = {
        age: {
          custom: (value) => {
            const num = parseInt(value)
            if (isNaN(num) || num < 18) {
              return 'Must be 18 or older'
            }
            return null
          }
        }
      }
      
      const invalidResult = validateForm({ age: '16' }, rules)
      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.errors.age).toBe('Must be 18 or older')
      
      const validResult = validateForm({ age: '25' }, rules)
      expect(validResult.isValid).toBe(true)
    })
  })

  describe('RateLimiter', () => {
    it('should allow requests under the limit', () => {
      const limiter = new RateLimiter(5, 60000) // 5 requests per minute
      
      expect(limiter.isAllowed('user1')).toBe(true)
      expect(limiter.isAllowed('user1')).toBe(true)
      expect(limiter.isAllowed('user1')).toBe(true)
    })

    it('should block requests over the limit', () => {
      const limiter = new RateLimiter(2, 60000) // 2 requests per minute
      
      expect(limiter.isAllowed('user1')).toBe(true)
      expect(limiter.isAllowed('user1')).toBe(true)
      expect(limiter.isAllowed('user1')).toBe(false)
    })

    it('should handle different users separately', () => {
      const limiter = new RateLimiter(1, 60000) // 1 request per minute
      
      expect(limiter.isAllowed('user1')).toBe(true)
      expect(limiter.isAllowed('user2')).toBe(true)
      expect(limiter.isAllowed('user1')).toBe(false)
      expect(limiter.isAllowed('user2')).toBe(false)
    })

    it('should reset after time window', () => {
      vi.useFakeTimers()
      
      const limiter = new RateLimiter(1, 1000) // 1 request per second
      
      expect(limiter.isAllowed('user1')).toBe(true)
      expect(limiter.isAllowed('user1')).toBe(false)
      
      // Fast forward 1.1 seconds
      vi.advanceTimersByTime(1100)
      
      expect(limiter.isAllowed('user1')).toBe(true)
      
      vi.useRealTimers()
    })

    it('should return remaining attempts', () => {
      const limiter = new RateLimiter(3, 60000)
      
      limiter.isAllowed('user1')
      expect(limiter.getRemainingAttempts('user1')).toBe(2)
      
      limiter.isAllowed('user1')
      expect(limiter.getRemainingAttempts('user1')).toBe(1)
      
      limiter.isAllowed('user1')
      expect(limiter.getRemainingAttempts('user1')).toBe(0)
    })
  })

  describe('generateCSPNonce', () => {
    it('should generate a nonce of correct length', () => {
      const nonce = generateCSPNonce()
      expect(nonce).toHaveLength(32)
    })

    it('should generate different nonces', () => {
      const nonce1 = generateCSPNonce()
      const nonce2 = generateCSPNonce()
      expect(nonce1).not.toBe(nonce2)
    })

    it('should generate base64url safe characters', () => {
      const nonce = generateCSPNonce()
      expect(nonce).toMatch(/^[A-Za-z0-9_-]+$/)
    })
  })
})