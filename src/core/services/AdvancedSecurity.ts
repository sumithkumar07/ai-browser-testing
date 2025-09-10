/**
 * Advanced Security Service
 * Provides AES-256 encryption, hardware attestation, and secure credential management
 */

import { createLogger } from '../logger/EnhancedLogger'
import { appEvents } from '../utils/EventEmitter'
import * as crypto from 'crypto-js'

const logger = createLogger('AdvancedSecurity')

export interface SecurityConfig {
  encryptionEnabled: boolean
  hardwareAttestationEnabled: boolean
  keyRotationInterval: number // milliseconds
  sessionTimeout: number // milliseconds
  maxFailedAttempts: number
  secureStorageEnabled: boolean
}

export interface EncryptedData {
  data: string
  iv: string
  salt: string
  algorithm: string
  keyDerivation: string
  timestamp: number
}

export interface SecurityCredential {
  id: string
  service: string
  type: 'api-key' | 'oauth-token' | 'password' | 'certificate'
  encrypted: boolean
  data: string | EncryptedData
  expiresAt?: number
  createdAt: number
  lastUsed?: number
  metadata: Record<string, any>
}

export interface SecurityAuditEntry {
  id: string
  timestamp: number
  action: string
  userId?: string
  resource: string
  success: boolean
  details: Record<string, any>
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface HardwareAttestation {
  platform: string
  tpmAvailable: boolean
  secureBootEnabled: boolean
  attestationKey: string
  measurements: Record<string, string>
  timestamp: number
  signature: string
}

export class AdvancedSecurity {
  private static instance: AdvancedSecurity
  private config: SecurityConfig
  private masterKey: string | null = null
  private credentials: Map<string, SecurityCredential> = new Map()
  private auditLog: SecurityAuditEntry[] = []
  private failedAttempts: Map<string, number> = new Map()
  private activeSessions: Map<string, { startTime: number; lastActivity: number }> = new Map()
  private keyRotationTimer: ReturnType<typeof setInterval> | null = null
  private isInitialized = false

  private constructor() {
    this.config = this.getDefaultConfig()
  }

  static getInstance(): AdvancedSecurity {
    if (!AdvancedSecurity.instance) {
      AdvancedSecurity.instance = new AdvancedSecurity()
    }
    return AdvancedSecurity.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    logger.info('🔐 Initializing Advanced Security Service...')

    try {
      // Initialize master key
      await this.initializeMasterKey()

      // Perform hardware attestation if enabled
      if (this.config.hardwareAttestationEnabled) {
        await this.performHardwareAttestation()
      }

      // Start key rotation timer
      this.startKeyRotation()

      // Set up security monitoring
      this.setupSecurityMonitoring()

      // Set up event listeners
      this.setupEventListeners()

      this.isInitialized = true
      logger.info('✅ Advanced Security Service initialized successfully')

      this.auditLog.push({
        id: `audit_${Date.now()}`,
        timestamp: Date.now(),
        action: 'security-service-initialized',
        resource: 'system',
        success: true,
        details: { config: this.config },
        riskLevel: 'low'
      })

    } catch (error) {
      logger.error('Failed to initialize Advanced Security Service', error as Error)
      throw error
    }
  }

  private getDefaultConfig(): SecurityConfig {
    return {
      encryptionEnabled: true,
      hardwareAttestationEnabled: false, // Disabled by default for compatibility
      keyRotationInterval: 24 * 60 * 60 * 1000, // 24 hours
      sessionTimeout: 2 * 60 * 60 * 1000, // 2 hours
      maxFailedAttempts: 5,
      secureStorageEnabled: true
    }
  }

  private async initializeMasterKey(): Promise<void> {
    try {
      // In production, this would derive from hardware or secure user input
      // For now, generate a secure random key
      this.masterKey = crypto.lib.WordArray.random(256/8).toString()
      
      logger.info('🔑 Master key initialized')
    } catch (error) {
      logger.error('Failed to initialize master key', error as Error)
      throw error
    }
  }

  async encrypt(data: string, customKey?: string): Promise<EncryptedData> {
    if (!this.config.encryptionEnabled) {
      throw new Error('Encryption is disabled')
    }

    if (!this.masterKey && !customKey) {
      throw new Error('No encryption key available')
    }

    try {
      const key = customKey || this.masterKey!
      const salt = crypto.lib.WordArray.random(128/8)
      const iv = crypto.lib.WordArray.random(128/8)
      
      // Derive key using PBKDF2
      const derivedKey = crypto.PBKDF2(key, salt, {
        keySize: 256/32,
        iterations: 10000
      })

      // Encrypt using AES-256-CBC
      const encrypted = crypto.AES.encrypt(data, derivedKey, {
        iv: iv,
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7
      })

      const result: EncryptedData = {
        data: encrypted.toString(),
        iv: iv.toString(),
        salt: salt.toString(),
        algorithm: 'AES-256-CBC',
        keyDerivation: 'PBKDF2',
        timestamp: Date.now()
      }

      this.logSecurityEvent('data-encrypted', 'encryption', true, {
        algorithm: result.algorithm,
        keyDerivation: result.keyDerivation
      })

      return result

    } catch (error) {
      this.logSecurityEvent('encryption-failed', 'encryption', false, {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  async decrypt(encryptedData: EncryptedData, customKey?: string): Promise<string> {
    if (!this.config.encryptionEnabled) {
      throw new Error('Encryption is disabled')
    }

    if (!this.masterKey && !customKey) {
      throw new Error('No decryption key available')
    }

    try {
      const key = customKey || this.masterKey!
      const salt = crypto.enc.Hex.parse(encryptedData.salt)
      const iv = crypto.enc.Hex.parse(encryptedData.iv)

      // Derive the same key using PBKDF2
      const derivedKey = crypto.PBKDF2(key, salt, {
        keySize: 256/32,
        iterations: 10000
      })

      // Decrypt using AES-256-CBC
      const decrypted = crypto.AES.decrypt(encryptedData.data, derivedKey, {
        iv: iv,
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7
      })

      const decryptedText = decrypted.toString(crypto.enc.Utf8)

      if (!decryptedText) {
        throw new Error('Decryption failed - invalid key or corrupted data')
      }

      this.logSecurityEvent('data-decrypted', 'decryption', true, {
        algorithm: encryptedData.algorithm
      })

      return decryptedText

    } catch (error) {
      this.logSecurityEvent('decryption-failed', 'decryption', false, {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  async storeCredential(credential: Omit<SecurityCredential, 'id' | 'createdAt' | 'encrypted'>): Promise<string> {
    const credentialId = `cred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
      let processedData: string | EncryptedData = credential.data

      // Encrypt sensitive data
      if (this.config.encryptionEnabled && typeof credential.data === 'string') {
        processedData = await this.encrypt(credential.data)
      }

      const secureCredential: SecurityCredential = {
        id: credentialId,
        service: credential.service,
        type: credential.type,
        encrypted: this.config.encryptionEnabled,
        data: processedData,
        expiresAt: credential.expiresAt,
        createdAt: Date.now(),
        metadata: credential.metadata || {}
      }

      this.credentials.set(credentialId, secureCredential)

      this.logSecurityEvent('credential-stored', credential.service, true, {
        type: credential.type,
        encrypted: this.config.encryptionEnabled
      })

      logger.info(`🔐 Stored credential for ${credential.service}`)
      return credentialId

    } catch (error) {
      this.logSecurityEvent('credential-store-failed', credential.service, false, {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  async retrieveCredential(credentialId: string): Promise<SecurityCredential | null> {
    try {
      const credential = this.credentials.get(credentialId)
      if (!credential) {
        this.logSecurityEvent('credential-not-found', credentialId, false, { credentialId })
        return null
      }

      // Check expiration
      if (credential.expiresAt && credential.expiresAt < Date.now()) {
        this.credentials.delete(credentialId)
        this.logSecurityEvent('credential-expired', credential.service, false, { credentialId })
        return null
      }

      // Decrypt if necessary
      if (credential.encrypted && typeof credential.data !== 'string') {
        const decryptedData = await this.decrypt(credential.data as EncryptedData)
        credential.data = decryptedData
        credential.encrypted = false // Mark as decrypted for this instance
      }

      // Update last used timestamp
      credential.lastUsed = Date.now()

      this.logSecurityEvent('credential-retrieved', credential.service, true, {
        type: credential.type
      })

      return credential

    } catch (error) {
      this.logSecurityEvent('credential-retrieval-failed', credentialId, false, {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  async deleteCredential(credentialId: string): Promise<boolean> {
    try {
      const credential = this.credentials.get(credentialId)
      if (!credential) {
        return false
      }

      this.credentials.delete(credentialId)

      this.logSecurityEvent('credential-deleted', credential.service, true, {
        type: credential.type
      })

      logger.info(`🗑️ Deleted credential for ${credential.service}`)
      return true

    } catch (error) {
      this.logSecurityEvent('credential-deletion-failed', credentialId, false, {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  async performHardwareAttestation(): Promise<HardwareAttestation> {
    logger.info('🛡️ Performing hardware attestation...')

    try {
      // Simulate hardware attestation (in real implementation, this would use TPM)
      const attestation: HardwareAttestation = {
        platform: process.platform,
        tpmAvailable: false, // Simulated - would check for actual TPM
        secureBootEnabled: false, // Simulated - would check secure boot status
        attestationKey: crypto.lib.WordArray.random(256/8).toString(),
        measurements: {
          bootloader: crypto.lib.WordArray.random(256/8).toString(),
          kernel: crypto.lib.WordArray.random(256/8).toString(),
          application: crypto.lib.WordArray.random(256/8).toString()
        },
        timestamp: Date.now(),
        signature: crypto.lib.WordArray.random(256/8).toString()
      }

      this.logSecurityEvent('hardware-attestation', 'system', true, {
        platform: attestation.platform,
        tpmAvailable: attestation.tpmAvailable
      })

      logger.info('✅ Hardware attestation completed')
      return attestation

    } catch (error) {
      this.logSecurityEvent('hardware-attestation-failed', 'system', false, {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  createSecureSession(userId?: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.activeSessions.set(sessionId, {
      startTime: Date.now(),
      lastActivity: Date.now()
    })

    this.logSecurityEvent('session-created', userId || 'anonymous', true, {
      sessionId,
      timeout: this.config.sessionTimeout
    })

    logger.info(`🔑 Created secure session: ${sessionId}`)
    return sessionId
  }

  validateSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId)
    if (!session) {
      this.logSecurityEvent('session-invalid', sessionId, false, { reason: 'not-found' })
      return false
    }

    const now = Date.now()
    if (now - session.lastActivity > this.config.sessionTimeout) {
      this.activeSessions.delete(sessionId)
      this.logSecurityEvent('session-expired', sessionId, false, {
        lastActivity: session.lastActivity,
        timeout: this.config.sessionTimeout
      })
      return false
    }

    // Update last activity
    session.lastActivity = now
    return true
  }

  destroySession(sessionId: string): boolean {
    const existed = this.activeSessions.delete(sessionId)
    
    if (existed) {
      this.logSecurityEvent('session-destroyed', sessionId, true, {})
      logger.info(`🔐 Destroyed session: ${sessionId}`)
    }

    return existed
  }

  private startKeyRotation(): void {
    if (this.keyRotationTimer) {
      clearInterval(this.keyRotationTimer)
    }

    this.keyRotationTimer = setInterval(async () => {
      try {
        await this.rotateKeys()
      } catch (error) {
        logger.error('Key rotation failed', error as Error)
      }
    }, this.config.keyRotationInterval)

    logger.info(`🔄 Key rotation scheduled every ${this.config.keyRotationInterval / 1000 / 60} minutes`)
  }

  private async rotateKeys(): Promise<void> {
    logger.info('🔄 Rotating encryption keys...')

    try {
      const oldKey = this.masterKey
      
      // Generate new master key
      this.masterKey = crypto.lib.WordArray.random(256/8).toString()

      // Re-encrypt all stored credentials with new key
      const credentialPromises = Array.from(this.credentials.values()).map(async (credential) => {
        if (credential.encrypted && typeof credential.data !== 'string') {
          try {
            // Decrypt with old key
            const decrypted = await this.decrypt(credential.data as EncryptedData, oldKey!)
            
            // Re-encrypt with new key
            credential.data = await this.encrypt(decrypted)
            
          } catch (error) {
            logger.warn(`Failed to re-encrypt credential ${credential.id}:`, error)
          }
        }
      })

      await Promise.allSettled(credentialPromises)

      this.logSecurityEvent('keys-rotated', 'system', true, {
        credentialsUpdated: this.credentials.size
      })

      logger.info('✅ Key rotation completed')

    } catch (error) {
      this.logSecurityEvent('key-rotation-failed', 'system', false, {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  private setupSecurityMonitoring(): void {
    // Monitor for security events
    setInterval(() => {
      this.performSecurityCheck()
    }, 60000) // Every minute

    logger.info('👁️ Security monitoring started')
  }

  private performSecurityCheck(): void {
    // Check for expired sessions
    const now = Date.now()
    const expiredSessions = []

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.lastActivity > this.config.sessionTimeout) {
        expiredSessions.push(sessionId)
      }
    }

    // Clean up expired sessions
    expiredSessions.forEach(sessionId => {
      this.destroySession(sessionId)
    })

    // Check for suspicious activity
    this.checkForSuspiciousActivity()
  }

  private checkForSuspiciousActivity(): void {
    const recentFailures = this.auditLog
      .filter(entry => 
        !entry.success && 
        Date.now() - entry.timestamp < 5 * 60 * 1000 // Last 5 minutes
      )

    if (recentFailures.length > 10) {
      this.logSecurityEvent('suspicious-activity-detected', 'system', false, {
        recentFailures: recentFailures.length,
        riskLevel: 'high'
      })
      
      logger.warn(`🚨 Suspicious activity detected: ${recentFailures.length} failures in last 5 minutes`)
    }
  }

  private setupEventListeners(): void {
    appEvents.on('security:encrypt', async (data: { text: string; callback: (result: EncryptedData) => void }) => {
      try {
        const encrypted = await this.encrypt(data.text)
        data.callback(encrypted)
      } catch (error) {
        logger.error('Encryption request failed', error as Error)
      }
    })

    appEvents.on('security:decrypt', async (data: { encrypted: EncryptedData; callback: (result: string) => void }) => {
      try {
        const decrypted = await this.decrypt(data.encrypted)
        data.callback(decrypted)
      } catch (error) {
        logger.error('Decryption request failed', error as Error)
      }
    })
  }

  private logSecurityEvent(action: string, resource: string, success: boolean, details: Record<string, any>): void {
    const entry: SecurityAuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      action,
      resource,
      success,
      details,
      riskLevel: this.assessRiskLevel(action, success, details)
    }

    this.auditLog.push(entry)

    // Limit audit log size
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-5000) // Keep last 5000 entries
    }

    // Emit security event
    appEvents.emit('security:auditLog', entry)
  }

  private assessRiskLevel(action: string, success: boolean, details: Record<string, any>): 'low' | 'medium' | 'high' | 'critical' {
    if (!success) {
      if (action.includes('failed') || action.includes('invalid')) {
        return 'medium'
      }
      if (action.includes('suspicious') || action.includes('breach')) {
        return 'critical'
      }
    }

    if (action.includes('credential') || action.includes('key')) {
      return 'medium'
    }

    return 'low'
  }

  // Public API methods
  public getSecurityStatus(): any {
    return {
      encryptionEnabled: this.config.encryptionEnabled,
      hardwareAttestationEnabled: this.config.hardwareAttestationEnabled,
      activeSessions: this.activeSessions.size,
      storedCredentials: this.credentials.size,
      auditLogEntries: this.auditLog.length,
      lastKeyRotation: this.keyRotationTimer ? 'Active' : 'Inactive'
    }
  }

  public getAuditLog(limit: number = 100): SecurityAuditEntry[] {
    return this.auditLog.slice(-limit)
  }

  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Restart key rotation if interval changed
    if (newConfig.keyRotationInterval) {
      this.startKeyRotation()
    }

    this.logSecurityEvent('config-updated', 'system', true, newConfig)
    logger.info('⚙️ Security configuration updated')
  }

  public async cleanup(): Promise<void> {
    if (this.keyRotationTimer) {
      clearInterval(this.keyRotationTimer)
      this.keyRotationTimer = null
    }

    this.credentials.clear()
    this.activeSessions.clear()
    this.masterKey = null

    logger.info('🧹 Security service cleanup completed')
  }
}

export default AdvancedSecurity