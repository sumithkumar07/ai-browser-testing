/**
 * Validators - Data validation utilities
 * FIXED: Return proper validation result objects instead of throwing exceptions
 */

import { APP_CONSTANTS } from './Constants'
 
export interface ValidationResult {
  isValid: boolean
  error?: string
}

export const validateAgentTask = (task: string): ValidationResult => {
  try {
    if (!task || typeof task !== 'string') {
      return { isValid: false, error: 'Task must be a non-empty string' }
    }
    
    if (task.trim().length === 0) {
      return { isValid: false, error: 'Task description cannot be empty' }
    }
    
    if (task.length > APP_CONSTANTS.LIMITS.MAX_TASK_LENGTH) {
      return { isValid: false, error: `Task description too long (max ${APP_CONSTANTS.LIMITS.MAX_TASK_LENGTH} characters)` }
    }
    
    // Check for potentially malicious content
    const maliciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /__proto__/gi,
      /constructor/gi
    ]
    
    for (const pattern of maliciousPatterns) {
      if (pattern.test(task)) {
        return { isValid: false, error: 'Task contains potentially malicious content' }
      }
    }
    
    return { isValid: true }
  } catch (error) {
    return { isValid: false, error: 'Validation failed due to unexpected error' }
  }
}

export const validateUrl = (url: string): ValidationResult => {
  try {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'URL must be a non-empty string' }
    }
    
    const trimmedUrl = url.trim()
    if (trimmedUrl.length === 0) {
      return { isValid: false, error: 'URL cannot be empty' }
    }
    
    // Allow common URL patterns
    if (trimmedUrl === 'about:blank' || trimmedUrl.startsWith('ai://')) {
      return { isValid: true }
    }
    
    try {
      new URL(trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`)
      return { isValid: true }
    } catch (urlError) {
      return { isValid: false, error: 'Invalid URL format' }
    }
  } catch (error) {
    return { isValid: false, error: 'URL validation failed due to unexpected error' }
  }
}

export const validateTabId = (tabId: string): ValidationResult => {
  try {
    if (!tabId || typeof tabId !== 'string') {
      return { isValid: false, error: 'Tab ID must be a non-empty string' }
    }
    
    if (tabId.trim().length === 0) {
      return { isValid: false, error: 'Tab ID cannot be empty' }
    }
    
    // Validate tab ID format
    if (!/^[a-zA-Z0-9_-]+$/.test(tabId)) {
      return { isValid: false, error: 'Tab ID contains invalid characters' }
    }
    
    return { isValid: true }
  } catch (error) {
    return { isValid: false, error: 'Tab ID validation failed due to unexpected error' }
  }
}

export const validateAIMessage = (message: any): ValidationResult => {
  try {
    if (!message || typeof message !== 'object') {
      return { isValid: false, error: 'Message must be an object' }
    }
    
    if (!message.content || typeof message.content !== 'string') {
      return { isValid: false, error: 'Message content must be a non-empty string' }
    }
    
    if (!message.id || typeof message.id !== 'string') {
      return { isValid: false, error: 'Message ID must be a non-empty string' }
    }
    
    if (typeof message.isUser !== 'boolean') {
      return { isValid: false, error: 'Message isUser must be a boolean' }
    }
    
    if (!message.timestamp || typeof message.timestamp !== 'number') {
      return { isValid: false, error: 'Message timestamp must be a number' }
    }
    
    return { isValid: true }
  } catch (error) {
    return { isValid: false, error: 'Message validation failed due to unexpected error' }
  }
}

export const sanitizeInput = (input: string): string => {
  try {
    if (!input || typeof input !== 'string') {
      return ''
    }
    
    return input
      .trim()
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:text\/html/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/__proto__/gi, '')
      .replace(/constructor/gi, '')
      .replace(/[<>]/g, '') // Remove angle brackets for basic XSS protection
  } catch (error) {
    return ''
  }
}

export const isValidEmail = (email: string): ValidationResult => {
  try {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email must be a non-empty string' }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' }
    }
    
    return { isValid: true }
  } catch (error) {
    return { isValid: false, error: 'Email validation failed due to unexpected error' }
  }
}