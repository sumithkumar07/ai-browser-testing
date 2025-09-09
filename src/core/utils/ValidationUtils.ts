/**
 * Enhanced Validation Utilities
 * Provides comprehensive input validation and sanitization
 */

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  email?: boolean
  url?: boolean
  numeric?: boolean
  custom?: (value: any) => boolean | string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  sanitizedValue?: any
}

export class ValidationUtils {
  /**
   * Validate a single value against rules
   */
  static validate(value: any, rules: ValidationRule): ValidationResult {
    const errors: string[] = []
    let sanitizedValue = value

    // Required check
    if (rules.required && (value === null || value === undefined || value === '')) {
      errors.push('This field is required')
      return { isValid: false, errors }
    }

    // Skip other validations if value is empty and not required
    if (!rules.required && (value === null || value === undefined || value === '')) {
      return { isValid: true, errors: [], sanitizedValue: value }
    }

    // Convert to string for string-based validations
    const stringValue = String(value).trim()
    sanitizedValue = stringValue

    // Length validations
    if (rules.minLength && stringValue.length < rules.minLength) {
      errors.push(`Minimum length is ${rules.minLength} characters`)
    }

    if (rules.maxLength && stringValue.length > rules.maxLength) {
      errors.push(`Maximum length is ${rules.maxLength} characters`)
      sanitizedValue = stringValue.substring(0, rules.maxLength)
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      errors.push('Invalid format')
    }

    // Email validation
    if (rules.email && !this.isValidEmail(stringValue)) {
      errors.push('Invalid email address')
    }

    // URL validation
    if (rules.url && !this.isValidUrl(stringValue)) {
      errors.push('Invalid URL')
    }

    // Numeric validation
    if (rules.numeric && !this.isNumeric(stringValue)) {
      errors.push('Must be a valid number')
    }

    // Custom validation
    if (rules.custom) {
      const customResult = rules.custom(value)
      if (customResult !== true) {
        errors.push(typeof customResult === 'string' ? customResult : 'Invalid value')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue
    }
  }

  /**
   * Validate multiple fields
   */
  static validateFields(data: Record<string, any>, rules: Record<string, ValidationRule>): {
    isValid: boolean
    errors: Record<string, string[]>
    sanitizedData: Record<string, any>
  } {
    const errors: Record<string, string[]> = {}
    const sanitizedData: Record<string, any> = {}
    let isValid = true

    for (const [field, fieldRules] of Object.entries(rules)) {
      const result = this.validate(data[field], fieldRules)
      
      if (!result.isValid) {
        errors[field] = result.errors
        isValid = false
      }
      
      sanitizedData[field] = result.sanitizedValue
    }

    return { isValid, errors, sanitizedData }
  }

  /**
   * Email validation
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * URL validation
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Numeric validation
   */
  static isNumeric(value: string): boolean {
    return !isNaN(Number(value)) && !isNaN(parseFloat(value))
  }

  /**
   * Sanitize HTML content
   */
  static sanitizeHtml(html: string): string {
    // Basic HTML sanitization - remove scripts and dangerous tags
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .replace(/javascript:/gi, '') // Remove javascript: urls
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/['"]/g, '') // Remove quotes
      .substring(0, 1000) // Limit length
  }

  /**
   * Validate and sanitize URL
   */
  static sanitizeUrl(url: string): string | null {
    try {
      const parsed = new URL(url)
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null
      }
      
      return parsed.toString()
    } catch {
      // Try adding https:// if no protocol
      if (!url.includes('://')) {
        try {
          const withProtocol = `https://${url}`
          const parsed = new URL(withProtocol)
          return parsed.toString()
        } catch {
          return null
        }
      }
      return null
    }
  }

  /**
   * Validate file type
   */
  static isAllowedFileType(filename: string, allowedTypes: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase()
    return extension ? allowedTypes.includes(extension) : false
  }

  /**
   * Validate file size
   */
  static isValidFileSize(size: number, maxSizeBytes: number): boolean {
    return size <= maxSizeBytes
  }

  /**
   * Validate JSON string
   */
  static isValidJson(jsonString: string): boolean {
    try {
      JSON.parse(jsonString)
      return true
    } catch {
      return false
    }
  }

  /**
   * Validate date string
   */
  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    score: number
    feedback: string[]
    isStrong: boolean
  } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) {
      score += 20
    } else {
      feedback.push('Password should be at least 8 characters long')
    }

    if (/[a-z]/.test(password)) {
      score += 20
    } else {
      feedback.push('Include lowercase letters')
    }

    if (/[A-Z]/.test(password)) {
      score += 20
    } else {
      feedback.push('Include uppercase letters')
    }

    if (/\d/.test(password)) {
      score += 20
    } else {
      feedback.push('Include numbers')
    }

    if (/[^a-zA-Z\d]/.test(password)) {
      score += 20
    } else {
      feedback.push('Include special characters')
    }

    return {
      score,
      feedback,
      isStrong: score >= 80
    }
  }

  /**
   * Rate limiting validation
   */
  private static rateLimitMap = new Map<string, number[]>()

  static checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const requests = this.rateLimitMap.get(key) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < windowMs)
    
    if (validRequests.length >= maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.rateLimitMap.set(key, validRequests)
    
    return true
  }

  /**
   * Validate API key format
   */
  static isValidApiKey(apiKey: string, expectedPrefix?: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') {
      return false
    }

    if (expectedPrefix && !apiKey.startsWith(expectedPrefix)) {
      return false
    }

    // Basic length and character validation
    return apiKey.length >= 10 && /^[a-zA-Z0-9_-]+$/.test(apiKey)
  }

  /**
   * Escape SQL injection attempts
   */
  static escapeSql(input: string): string {
    return input.replace(/['";\\]/g, '')
  }

  /**
   * Validate MongoDB ObjectId
   */
  static isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id)
  }

  /**
   * Validate UUID
   */
  static isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }
}

export default ValidationUtils