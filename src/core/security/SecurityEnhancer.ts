/**
 * Security Enhancer - Advanced Security System for AI Agents
 * Provides comprehensive security controls, threat detection, and safety measures
 */

import { createLogger } from '../logger/EnhancedLogger'

const logger = createLogger('SecurityEnhancer')

export interface SecurityConfig {
  level: 'basic' | 'enhanced' | 'strict' | 'paranoid'
  encryptionEnabled: boolean
  auditingEnabled: boolean
  threatDetectionEnabled: boolean
  inputSanitationEnabled: boolean
  outputFilteringEnabled: boolean
  rateLimitingEnabled: boolean
  apiKeyProtection: boolean
}

export interface ThreatIntelligence {
  id: string
  type: 'malware' | 'phishing' | 'injection' | 'social_engineering' | 'data_breach'
  severity: 'low' | 'medium' | 'high' | 'critical'
  indicators: string[]
  timestamp: number
  source: string
  confidence: number
}

export interface SecurityIncident {
  id: string
  timestamp: number
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  source: string
  target: string
  mitigated: boolean
  response: SecurityResponse
}

export interface SecurityResponse {
  action: 'logged' | 'blocked' | 'sanitized' | 'escalated'
  automatic: boolean
  timestamp: number
  details: string
}

export interface ContentScanResult {
  safe: boolean
  threats: string[]
  confidence: number
  sanitized?: string
  blocked: boolean
}

export interface InputValidationResult {
  valid: boolean
  sanitized: string
  threats: string[]
  riskScore: number
}

class SecurityEnhancer {
  private static instance: SecurityEnhancer
  private config: SecurityConfig
  private threatIntelligence: Map<string, ThreatIntelligence> = new Map()
  private incidents: SecurityIncident[] = []
  private isInitialized = false
  
  // Security patterns for threat detection
  private readonly THREAT_PATTERNS = {
    xss: [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi
    ],
    injection: [
      /\b(union|select|insert|update|delete|drop|create|alter)\b.*\b(from|into|table|database)\b/gi,
      /;\s*(drop|delete|update|insert)\b/gi,
      /__proto__/gi,
      /constructor\s*\[/gi
    ],
    malicious_urls: [
      /bit\.ly|tinyurl|t\.co|goo\.gl/gi,
      /[a-z0-9]{10,}\.tk|\.ml|\.ga|\.cf/gi,
      /\d+\.\d+\.\d+\.\d+/g
    ],
    sensitive_data: [
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // Credit card patterns
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN patterns
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email patterns
      /\b(?:password|pass|pwd|secret|key|token)\s*[:=]\s*\S+/gi
    ],
    suspicious_commands: [
      /\b(rm|del|format|fdisk|mkfs)\b.*[-/]\w*[rf]/gi,
      /\b(wget|curl|powershell|cmd|bash|sh)[\s]/gi,
      /\b(eval|exec|system|shell_exec)\s*\(/gi
    ]
  }

  // Content filters for output sanitization
  private readonly CONTENT_FILTERS = {
    profanity: [
      // Basic profanity patterns - would be more comprehensive in production
      /\b(damn|hell|crap)\b/gi
    ],
    personal_info: [
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // Credit cards
      /\b[A-Z]{2}\d{6,8}\b/g // Driver's license patterns
    ],
    credentials: [
      /\b(?:api[_-]?key|access[_-]?token|secret[_-]?key|password)\s*[:=]\s*[^\s]+/gi,
      /\b[A-Za-z0-9+/]{20,}={0,3}\b/g // Base64 patterns that might be keys
    ]
  }

  private constructor() {
    this.config = {
      level: 'enhanced',
      encryptionEnabled: true,
      auditingEnabled: true,
      threatDetectionEnabled: true,
      inputSanitationEnabled: true,
      outputFilteringEnabled: true,
      rateLimitingEnabled: true,
      apiKeyProtection: true
    }
  }

  static getInstance(): SecurityEnhancer {
    if (!SecurityEnhancer.instance) {
      SecurityEnhancer.instance = new SecurityEnhancer()
    }
    return SecurityEnhancer.instance
  }

  async initialize(config?: Partial<SecurityConfig>): Promise<void> {
    if (this.isInitialized) {
      logger.warn('SecurityEnhancer already initialized')
      return
    }

    try {
      logger.info('Initializing Security Enhancer...')
      
      if (config) {
        this.config = { ...this.config, ...config }
      }

      // Load threat intelligence
      await this.loadThreatIntelligence()
      
      // Start background monitoring
      this.startBackgroundMonitoring()
      
      this.isInitialized = true
      logger.info('✅ Security Enhancer initialized successfully')
      
    } catch (error) {
      logger.error('Failed to initialize Security Enhancer', error as Error)
      throw error
    }
  }

  /**
   * Validate and sanitize user input with comprehensive threat detection
   */
  async validateInput(input: string, context: string = 'general'): Promise<InputValidationResult> {
    logger.debug('Validating input', { context, length: input.length })
    
    try {
      let sanitized = input
      const threats: string[] = []
      let riskScore = 0

      // Length validation
      if (input.length > 10000) {
        threats.push('excessive_length')
        riskScore += 3
        sanitized = input.substring(0, 10000)
      }

      // XSS detection and sanitization
      for (const pattern of this.THREAT_PATTERNS.xss) {
        if (pattern.test(input)) {
          threats.push('xss_attempt')
          riskScore += 5
          sanitized = sanitized.replace(pattern, '[REMOVED_XSS]')
        }
      }

      // Injection attack detection
      for (const pattern of this.THREAT_PATTERNS.injection) {
        if (pattern.test(input)) {
          threats.push('injection_attempt')
          riskScore += 7
          sanitized = sanitized.replace(pattern, '[REMOVED_INJECTION]')
        }
      }

      // Malicious URL detection
      for (const pattern of this.THREAT_PATTERNS.malicious_urls) {
        if (pattern.test(input)) {
          threats.push('suspicious_url')
          riskScore += 4
          sanitized = sanitized.replace(pattern, '[SUSPICIOUS_URL_REMOVED]')
        }
      }

      // Sensitive data detection
      for (const pattern of this.THREAT_PATTERNS.sensitive_data) {
        if (pattern.test(input)) {
          threats.push('sensitive_data')
          riskScore += 3
          sanitized = sanitized.replace(pattern, '[SENSITIVE_DATA_REMOVED]')
        }
      }

      // Suspicious command detection
      for (const pattern of this.THREAT_PATTERNS.suspicious_commands) {
        if (pattern.test(input)) {
          threats.push('suspicious_command')
          riskScore += 8
          sanitized = sanitized.replace(pattern, '[SUSPICIOUS_COMMAND_REMOVED]')
        }
      }

      // Context-specific validation
      if (context === 'ai_prompt') {
        // Additional AI-specific validations
        if (input.toLowerCase().includes('ignore previous instructions')) {
          threats.push('prompt_injection')
          riskScore += 6
        }
        if (input.toLowerCase().includes('system:') || input.toLowerCase().includes('admin:')) {
          threats.push('privilege_escalation')
          riskScore += 7
        }
      }

      // Record security event if threats detected
      if (threats.length > 0) {
        await this.recordIncident({
          type: 'input_validation',
          severity: riskScore > 7 ? 'high' : riskScore > 4 ? 'medium' : 'low',
          description: `Input validation detected: ${threats.join(', ')}`,
          source: 'user_input',
          target: context,
          mitigated: true,
          response: {
            action: 'sanitized',
            automatic: true,
            timestamp: Date.now(),
            details: `Sanitized input with risk score ${riskScore}`
          }
        })
      }

      const valid = riskScore < 5 // Consider input valid if risk score is low
      
      logger.debug('Input validation completed', { valid, threats, riskScore })
      
      return {
        valid,
        sanitized,
        threats,
        riskScore
      }
      
    } catch (error) {
      logger.error('Input validation failed', error as Error)
      return {
        valid: false,
        sanitized: '[INPUT_VALIDATION_ERROR]',
        threats: ['validation_error'],
        riskScore: 10
      }
    }
  }

  /**
   * Scan and filter output content for security and privacy
   */
  async scanOutput(content: string, context: string = 'general'): Promise<ContentScanResult> {
    logger.debug('Scanning output content', { context, length: content.length })
    
    try {
      const threats: string[] = []
      let sanitized = content
      let confidence = 0.95
      let blocked = false

      // Personal information detection and removal
      for (const pattern of this.CONTENT_FILTERS.personal_info) {
        if (pattern.test(content)) {
          threats.push('personal_information')
          sanitized = sanitized.replace(pattern, '[PERSONAL_INFO_REMOVED]')
        }
      }

      // Credential detection and removal
      for (const pattern of this.CONTENT_FILTERS.credentials) {
        if (pattern.test(content)) {
          threats.push('credentials_exposed')
          sanitized = sanitized.replace(pattern, '[CREDENTIALS_REMOVED]')
        }
      }

      // Profanity filtering (if enabled)
      if (this.config.level === 'strict' || this.config.level === 'paranoid') {
        for (const pattern of this.CONTENT_FILTERS.profanity) {
          if (pattern.test(content)) {
            threats.push('inappropriate_content')
            sanitized = sanitized.replace(pattern, '[FILTERED]')
          }
        }
      }

      // Check for leaked sensitive information
      if (content.includes('GROQ_API_KEY') || content.includes('SECRET_KEY')) {
        threats.push('api_key_exposure')
        blocked = true
        sanitized = '[OUTPUT_BLOCKED_API_KEY_DETECTED]'
        confidence = 0.99
      }

      // Malicious content detection
      for (const pattern of this.THREAT_PATTERNS.xss) {
        if (pattern.test(content)) {
          threats.push('malicious_script')
          sanitized = sanitized.replace(pattern, '[SCRIPT_REMOVED]')
        }
      }

      // Record security event if threats detected
      if (threats.length > 0) {
        await this.recordIncident({
          type: 'output_scanning',
          severity: blocked ? 'high' : 'medium',
          description: `Output scanning detected: ${threats.join(', ')}`,
          source: 'ai_output',
          target: context,
          mitigated: true,
          response: {
            action: blocked ? 'blocked' : 'sanitized',
            automatic: true,
            timestamp: Date.now(),
            details: `Output ${blocked ? 'blocked' : 'sanitized'} due to security concerns`
          }
        })
      }

      const safe = threats.length === 0
      
      logger.debug('Output scanning completed', { safe, threats, blocked })
      
      return {
        safe,
        threats,
        confidence,
        sanitized: sanitized !== content ? sanitized : undefined,
        blocked
      }
      
    } catch (error) {
      logger.error('Output scanning failed', error as Error)
      return {
        safe: false,
        threats: ['scanning_error'],
        confidence: 0.5,
        blocked: true
      }
    }
  }

  /**
   * Validate API key security
   */
  async validateApiKey(apiKey: string): Promise<{
    valid: boolean
    secure: boolean
    issues: string[]
  }> {
    const issues: string[] = []
    
    // Check key format
    if (!apiKey || apiKey.length < 20) {
      issues.push('key_too_short')
    }
    
    // Check for common insecure patterns
    if (apiKey.includes('test') || apiKey.includes('demo')) {
      issues.push('test_key_detected')
    }
    
    // Check entropy (randomness)
    const entropy = this.calculateEntropy(apiKey)
    if (entropy < 3.5) {
      issues.push('low_entropy')
    }
    
    // Check if key appears to be encoded
    if (/^[A-Za-z0-9+/]{20,}={0,3}$/.test(apiKey)) {
      // Looks like base64, which is good
    } else if (/^[a-f0-9]{32,}$/.test(apiKey)) {
      // Looks like hex, which is okay
    } else {
      issues.push('unusual_encoding')
    }

    const valid = apiKey.length > 0
    const secure = issues.length === 0
    
    return { valid, secure, issues }
  }

  /**
   * Generate secure random key
   */
  generateSecureKey(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * Check current security status
   */
  async getSecurityStatus(): Promise<{
    level: string
    threatsDetected: number
    incidentsToday: number
    lastScan: number
    overallScore: number
  }> {
    const now = Date.now()
    const today = now - (24 * 60 * 60 * 1000)
    
    const incidentsToday = this.incidents.filter(
      incident => incident.timestamp > today
    ).length
    
    const recentThreats = Array.from(this.threatIntelligence.values()).filter(
      threat => threat.timestamp > today
    ).length
    
    // Calculate overall security score
    let score = 100
    score -= incidentsToday * 5
    score -= recentThreats * 3
    score = Math.max(0, Math.min(100, score))
    
    return {
      level: this.config.level,
      threatsDetected: recentThreats,
      incidentsToday,
      lastScan: now,
      overallScore: score
    }
  }

  /**
   * Get security recommendations
   */
  async getSecurityRecommendations(): Promise<string[]> {
    const recommendations: string[] = []
    const status = await this.getSecurityStatus()
    
    if (status.incidentsToday > 5) {
      recommendations.push('High number of security incidents detected today. Consider increasing security level.')
    }
    
    if (status.overallScore < 80) {
      recommendations.push('Overall security score is low. Review recent incidents and update security policies.')
    }
    
    if (this.config.level === 'basic') {
      recommendations.push('Consider upgrading to enhanced security level for better protection.')
    }
    
    if (!this.config.encryptionEnabled) {
      recommendations.push('Enable encryption for sensitive data protection.')
    }
    
    if (!this.config.auditingEnabled) {
      recommendations.push('Enable security auditing for better incident tracking.')
    }
    
    return recommendations
  }

  /**
   * Update security configuration
   */
  async updateConfig(newConfig: Partial<SecurityConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig }
    logger.info('Security configuration updated', newConfig)
  }

  /**
   * Record security incident
   */
  private async recordIncident(incident: Omit<SecurityIncident, 'id' | 'timestamp'>): Promise<void> {
    const fullIncident: SecurityIncident = {
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...incident
    }
    
    this.incidents.push(fullIncident)
    
    // Keep only last 1000 incidents to prevent memory bloat
    if (this.incidents.length > 1000) {
      this.incidents = this.incidents.slice(-1000)
    }
    
    logger.info('Security incident recorded', {
      id: fullIncident.id,
      type: fullIncident.type,
      severity: fullIncident.severity
    })
  }

  /**
   * Load threat intelligence data
   */
  private async loadThreatIntelligence(): Promise<void> {
    // In a real implementation, this would load from external sources
    const threats: ThreatIntelligence[] = [
      {
        id: 'threat_xss_2024',
        type: 'injection',
        severity: 'high',
        indicators: ['<script>', 'javascript:', 'eval('],
        timestamp: Date.now(),
        source: 'internal',
        confidence: 0.95
      },
      {
        id: 'threat_social_eng_2024',
        type: 'social_engineering',
        severity: 'medium',
        indicators: ['ignore previous instructions', 'system:', 'admin:'],
        timestamp: Date.now(),
        source: 'internal',
        confidence: 0.85
      }
    ]
    
    threats.forEach(threat => {
      this.threatIntelligence.set(threat.id, threat)
    })
    
    logger.info(`Loaded ${threats.length} threat intelligence entries`)
  }

  /**
   * Start background security monitoring
   */
  private startBackgroundMonitoring(): void {
    // Monitor for security events every minute
    setInterval(async () => {
      await this.performSecurityScan()
    }, 60000)
    
    // Clean up old incidents every hour
    setInterval(() => {
      this.cleanupOldIncidents()
    }, 3600000)
    
    logger.info('Background security monitoring started')
  }

  /**
   * Perform periodic security scan
   */
  private async performSecurityScan(): Promise<void> {
    logger.debug('Performing periodic security scan')
    
    try {
      // Update threat intelligence
      await this.updateThreatIntelligence()
      
      // Check system health
      const status = await this.getSecurityStatus()
      
      if (status.overallScore < 50) {
        await this.recordIncident({
          type: 'security_degradation',
          severity: 'medium',
          description: 'Overall security score has dropped below 50%',
          source: 'system_monitor',
          target: 'security_system',
          mitigated: false,
          response: {
            action: 'logged',
            automatic: true,
            timestamp: Date.now(),
            details: 'Security degradation detected and logged'
          }
        })
      }
      
    } catch (error) {
      logger.error('Security scan failed', error as Error)
    }
  }

  /**
   * Update threat intelligence
   */
  private async updateThreatIntelligence(): Promise<void> {
    // In a real implementation, this would fetch from external threat feeds
    logger.debug('Updating threat intelligence')
  }

  /**
   * Clean up old security incidents
   */
  private cleanupOldIncidents(): void {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 days
    const originalCount = this.incidents.length
    
    this.incidents = this.incidents.filter(incident => incident.timestamp > cutoffTime)
    
    const removedCount = originalCount - this.incidents.length
    if (removedCount > 0) {
      logger.info(`Cleaned up ${removedCount} old security incidents`)
    }
  }

  /**
   * Calculate entropy of a string
   */
  private calculateEntropy(str: string): number {
    const freq: { [char: string]: number } = {}
    
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1
    }
    
    let entropy = 0
    const length = str.length
    
    for (const char in freq) {
      const p = freq[char] / length
      entropy -= p * Math.log2(p)
    }
    
    return entropy
  }
}

export default SecurityEnhancer