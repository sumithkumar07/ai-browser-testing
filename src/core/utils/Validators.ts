/**
 * Validation Utilities
 * Common validation functions for the application
 */

import { APP_CONSTANTS } from './Constants'

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * URL Validation
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const isWebUrl = (url: string): boolean => {
  if (!validateUrl(url)) return false
  const parsed = new URL(url)
  return parsed.protocol === 'http:' || parsed.protocol === 'https:'
}

/**
 * Tab Validation
 */
export const validateTabTitle = (title: string): string => {
  if (!title || title.trim().length === 0) {
    return APP_CONSTANTS.TABS.DEFAULT_TITLE
  }
  
  const trimmed = title.trim()
  if (trimmed.length > APP_CONSTANTS.TABS.MAX_TITLE_LENGTH) {
    return trimmed.substring(0, APP_CONSTANTS.TABS.MAX_TITLE_LENGTH) + '...'
  }
  
  return trimmed
}

export const validateTabId = (tabId: string): boolean => {
  return typeof tabId === 'string' && tabId.length > 0
}

/**
 * AI Input Validation
 */
export const validateAIMessage = (message: string): void => {
  if (!message || message.trim().length === 0) {
    throw new ValidationError('Message cannot be empty', 'message')
  }
  
  if (message.length > APP_CONSTANTS.AI.MAX_MESSAGE_LENGTH) {
    throw new ValidationError(
      `Message too long. Maximum ${APP_CONSTANTS.AI.MAX_MESSAGE_LENGTH} characters`,
      'message'
    )
  }
}

/**
 * File Validation
 */
export const validateFileType = (filename: string, allowedTypes: string[]): boolean => {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return allowedTypes.includes(extension)
}

export const isImageFile = (filename: string): boolean => {
  return validateFileType(filename, APP_CONSTANTS.SUPPORTED_FILES.IMAGES)
}

export const isDocumentFile = (filename: string): boolean => {
  return validateFileType(filename, APP_CONSTANTS.SUPPORTED_FILES.DOCUMENTS)
}

/**
 * Settings Validation
 */
export const validateSettings = (settings: any): void => {
  if (!settings || typeof settings !== 'object') {
    throw new ValidationError('Settings must be an object')
  }
  
  // Add specific setting validations as needed
}

/**
 * Agent Task Validation
 */
export const validateAgentTask = (task: string): void => {
  if (!task || task.trim().length === 0) {
    throw new ValidationError('Task description cannot be empty', 'task')
  }
  
  if (task.length > 1000) {
    throw new ValidationError('Task description too long. Maximum 1000 characters', 'task')
  }
}

/**
 * Generic Validation Helpers
 */
export const isString = (value: any): value is string => {
  return typeof value === 'string'
}

export const isNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value)
}

export const isBoolean = (value: any): value is boolean => {
  return typeof value === 'boolean'
}

export const isObject = (value: any): value is object => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export const isArray = (value: any): value is any[] => {
  return Array.isArray(value)
}

/**
 * Data Sanitization
 */
export const sanitizeString = (str: string): string => {
  return str.replace(/[<>]/g, '').trim()
}

export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url)
    return parsed.toString()
  } catch {
    return ''
  }
}

/**
 * Validation Schema Builder
 */
export interface ValidationRule {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array'
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export class SchemaValidator {
  private schema: Record<string, ValidationRule>

  constructor(schema: Record<string, ValidationRule>) {
    this.schema = schema
  }

  validate(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const [field, rule] of Object.entries(this.schema)) {
      const value = data[field]

      // Required check
      if (rule.required && (value === undefined || value === null)) {
        errors.push(`${field} is required`)
        continue
      }

      // Skip validation if value is not provided and not required
      if (value === undefined || value === null) continue

      // Type check
      if (rule.type) {
        const typeValid = this.checkType(value, rule.type)
        if (!typeValid) {
          errors.push(`${field} must be of type ${rule.type}`)
          continue
        }
      }

      // String-specific validations
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${field} must be at least ${rule.minLength} characters`)
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${field} must be at most ${rule.maxLength} characters`)
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`${field} format is invalid`)
        }
      }

      // Custom validation
      if (rule.custom) {
        const customResult = rule.custom(value)
        if (customResult !== true) {
          errors.push(typeof customResult === 'string' ? customResult : `${field} is invalid`)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  private checkType(value: any, type: string): boolean {
    switch (type) {
      case 'string': return isString(value)
      case 'number': return isNumber(value)
      case 'boolean': return isBoolean(value)
      case 'object': return isObject(value)
      case 'array': return isArray(value)
      default: return true
    }
  }
}

// Pre-built validators for common use cases
export const urlValidator = new SchemaValidator({
  url: {
    required: true,
    type: 'string',
    custom: (value) => validateUrl(value) || 'Invalid URL format'
  }
})

export const tabValidator = new SchemaValidator({
  id: { required: true, type: 'string', minLength: 1 },
  title: { required: true, type: 'string', minLength: 1, maxLength: APP_CONSTANTS.TABS.MAX_TITLE_LENGTH },
  url: { required: true, type: 'string', custom: (value) => validateUrl(value) || 'Invalid URL' },
  type: { required: true, type: 'string', custom: (value) => ['browser', 'ai'].includes(value) || 'Invalid tab type' }
})