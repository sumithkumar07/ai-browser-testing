// Advanced Security - JavaScript Implementation
// Handles security, encryption, and audit logging

class AdvancedSecurity {
  static instance = null;

  static getInstance() {
    if (!AdvancedSecurity.instance) {
      AdvancedSecurity.instance = new AdvancedSecurity();
    }
    return AdvancedSecurity.instance;
  }

  constructor() {
    this.securityPolicies = new Map();
    this.auditLog = [];
    this.encryptionKeys = new Map();
    this.activeSecurityChecks = new Set();
    this.securityLevel = 'medium'; // low, medium, high, maximum
    this.maxAuditLogSize = 10000;
  }

  async initialize() {
    try {
      console.log('🔒 Initializing Advanced Security...');
      
      // Initialize security policies
      await this.initializeSecurityPolicies();
      
      // Setup encryption capabilities
      await this.initializeEncryption();
      
      // Start security monitoring
      this.startSecurityMonitoring();
      
      console.log('✅ Advanced Security initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Advanced Security:', error);
      throw error;
    }
  }

  async initializeSecurityPolicies() {
    // Define default security policies
    this.securityPolicies.set('data_encryption', {
      enabled: true,
      algorithm: 'AES-256-GCM',
      keyRotationInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
      minimumKeyLength: 32
    });

    this.securityPolicies.set('audit_logging', {
      enabled: true,
      logLevel: 'info',
      includeStackTrace: false,
      retention: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    this.securityPolicies.set('access_control', {
      enabled: true,
      defaultPermission: 'deny',
      sessionTimeout: 60 * 60 * 1000, // 1 hour
      maxFailedAttempts: 5
    });

    this.securityPolicies.set('data_validation', {
      enabled: true,
      strictMode: true,
      sanitizeInput: true,
      validateOutput: true
    });

    console.log(`🛡️ Security policies initialized: ${this.securityPolicies.size} policies active`);
  }

  async initializeEncryption() {
    try {
      // Initialize crypto module
      this.crypto = require('crypto');
      
      // Generate master encryption key if not exists
      await this.generateMasterKey();
      
      console.log('🔐 Encryption capabilities initialized');
    } catch (error) {
      console.warn('⚠️ Encryption initialization failed, running in reduced security mode:', error.message);
    }
  }

  async generateMasterKey() {
    const masterKeyId = 'master_key_v1';
    
    if (!this.encryptionKeys.has(masterKeyId)) {
      const masterKey = this.crypto.randomBytes(32); // 256-bit key
      this.encryptionKeys.set(masterKeyId, {
        key: masterKey,
        createdAt: Date.now(),
        algorithm: 'AES-256-GCM',
        id: masterKeyId
      });
      
      this.logSecurityEvent('key_generation', 'Master encryption key generated', { keyId: masterKeyId });
    }
  }

  async encryptData(data, options = {}) {
    try {
      if (!this.crypto) {
        throw new Error('Encryption not available');
      }

      const policy = this.securityPolicies.get('data_encryption');
      if (!policy.enabled) {
        return { encrypted: false, data: data };
      }

      const keyId = options.keyId || 'master_key_v1';
      const keyInfo = this.encryptionKeys.get(keyId);
      
      if (!keyInfo) {
        throw new Error(`Encryption key not found: ${keyId}`);
      }

      const iv = this.crypto.randomBytes(16); // 128-bit IV
      const cipher = this.crypto.createCipher('aes-256-gcm', keyInfo.key);
      cipher.setAAD(Buffer.from(keyId, 'utf8'));

      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();

      const result = {
        encrypted: true,
        data: encrypted,
        keyId: keyId,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        algorithm: 'AES-256-GCM',
        timestamp: Date.now()
      };

      this.logSecurityEvent('data_encryption', 'Data encrypted', { keyId, dataSize: data.length });
      return result;

    } catch (error) {
      this.logSecurityEvent('encryption_error', 'Data encryption failed', { error: error.message });
      throw error;
    }
  }

  async decryptData(encryptedData, options = {}) {
    try {
      if (!this.crypto) {
        throw new Error('Decryption not available');
      }

      if (!encryptedData.encrypted) {
        return encryptedData.data;
      }

      const keyId = encryptedData.keyId;
      const keyInfo = this.encryptionKeys.get(keyId);
      
      if (!keyInfo) {
        throw new Error(`Decryption key not found: ${keyId}`);
      }

      const decipher = this.crypto.createDecipher('aes-256-gcm', keyInfo.key);
      decipher.setAAD(Buffer.from(keyId, 'utf8'));
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      const result = JSON.parse(decrypted);
      
      this.logSecurityEvent('data_decryption', 'Data decrypted', { keyId });
      return result;

    } catch (error) {
      this.logSecurityEvent('decryption_error', 'Data decryption failed', { error: error.message });
      throw error;
    }
  }

  async validateInput(input, validationRules = {}) {
    const policy = this.securityPolicies.get('data_validation');
    if (!policy.enabled) {
      return { valid: true, sanitized: input };
    }

    try {
      let sanitized = input;
      const violations = [];

      // Basic input sanitization
      if (policy.sanitizeInput && typeof sanitized === 'string') {
        // Remove potentially dangerous characters
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized = sanitized.replace(/[<>]/g, '');
      }

      // Length validation
      if (validationRules.maxLength && sanitized.length > validationRules.maxLength) {
        violations.push(`Input exceeds maximum length: ${validationRules.maxLength}`);
      }

      if (validationRules.minLength && sanitized.length < validationRules.minLength) {
        violations.push(`Input below minimum length: ${validationRules.minLength}`);
      }

      // Pattern validation
      if (validationRules.pattern && !validationRules.pattern.test(sanitized)) {
        violations.push('Input does not match required pattern');
      }

      // Type validation
      if (validationRules.type) {
        const inputType = typeof sanitized;
        if (inputType !== validationRules.type) {
          violations.push(`Expected type ${validationRules.type}, got ${inputType}`);
        }
      }

      const isValid = violations.length === 0;
      
      if (!isValid) {
        this.logSecurityEvent('input_validation_failed', 'Input validation failed', { 
          violations: violations,
          inputLength: input.length 
        });
      }

      return {
        valid: isValid,
        sanitized: sanitized,
        violations: violations
      };

    } catch (error) {
      this.logSecurityEvent('validation_error', 'Input validation error', { error: error.message });
      return {
        valid: false,
        sanitized: input,
        violations: ['Validation error: ' + error.message]
      };
    }
  }

  async performSecurityScan(target, scanType = 'basic') {
    try {
      const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`🔍 Starting security scan: ${scanId} (${scanType})`);
      this.activeSecurityChecks.add(scanId);

      const scanResults = {
        scanId: scanId,
        target: target,
        scanType: scanType,
        startTime: Date.now(),
        findings: [],
        riskLevel: 'low',
        recommendations: []
      };

      // Simulate different types of security scans
      switch (scanType) {
        case 'basic':
          await this.performBasicSecurityScan(scanResults);
          break;
        case 'comprehensive':
          await this.performComprehensiveSecurityScan(scanResults);
          break;
        case 'vulnerability':
          await this.performVulnerabilityScan(scanResults);
          break;
        default:
          await this.performBasicSecurityScan(scanResults);
      }

      scanResults.endTime = Date.now();
      scanResults.duration = scanResults.endTime - scanResults.startTime;
      
      this.activeSecurityChecks.delete(scanId);
      
      this.logSecurityEvent('security_scan_completed', 'Security scan completed', {
        scanId: scanId,
        riskLevel: scanResults.riskLevel,
        findingsCount: scanResults.findings.length
      });

      console.log(`✅ Security scan completed: ${scanId} (Risk: ${scanResults.riskLevel})`);
      return scanResults;

    } catch (error) {
      this.logSecurityEvent('security_scan_error', 'Security scan failed', { error: error.message });
      throw error;
    }
  }

  async performBasicSecurityScan(scanResults) {
    // Simulate basic security checks
    await new Promise(resolve => setTimeout(resolve, 1000));

    scanResults.findings.push({
      id: 'SEC-001',
      severity: 'low',
      category: 'configuration',
      title: 'Default configuration detected',
      description: 'Some settings are using default values',
      recommendation: 'Review and customize security configurations'
    });

    scanResults.riskLevel = 'low';
    scanResults.recommendations.push('Enable additional security policies');
  }

  async performComprehensiveSecurityScan(scanResults) {
    // Simulate comprehensive security analysis
    await new Promise(resolve => setTimeout(resolve, 3000));

    scanResults.findings.push(
      {
        id: 'SEC-002',
        severity: 'medium',
        category: 'encryption',
        title: 'Encryption key age',
        description: 'Encryption keys are older than recommended rotation period',
        recommendation: 'Rotate encryption keys'
      },
      {
        id: 'SEC-003',
        severity: 'low',
        category: 'logging',
        title: 'Audit log size',
        description: 'Audit log is approaching maximum size',
        recommendation: 'Archive old audit logs'
      }
    );

    scanResults.riskLevel = 'medium';
    scanResults.recommendations.push(
      'Implement key rotation schedule',
      'Setup automated log archiving'
    );
  }

  async performVulnerabilityScan(scanResults) {
    // Simulate vulnerability scanning
    await new Promise(resolve => setTimeout(resolve, 2000));

    scanResults.findings.push({
      id: 'SEC-004',
      severity: 'high',
      category: 'vulnerability',
      title: 'Potential security vulnerability',
      description: 'System may be vulnerable to certain attack vectors',
      recommendation: 'Apply security patches and updates'
    });

    scanResults.riskLevel = 'high';
    scanResults.recommendations.push('Update to latest security patches');
  }

  logSecurityEvent(eventType, message, details = {}) {
    const auditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      eventType: eventType,
      message: message,
      details: details,
      level: this.getEventLogLevel(eventType)
    };

    this.auditLog.push(auditEntry);

    // Maintain log size limit
    if (this.auditLog.length > this.maxAuditLogSize) {
      this.auditLog.shift(); // Remove oldest entry
    }

    // Log to console for important events
    if (auditEntry.level === 'error' || auditEntry.level === 'warn') {
      console.warn(`🚨 Security Event [${eventType}]: ${message}`, details);
    } else if (auditEntry.level === 'info') {
      console.log(`🔒 Security Event [${eventType}]: ${message}`);
    }
  }

  getEventLogLevel(eventType) {
    const criticalEvents = ['encryption_error', 'decryption_error', 'security_breach', 'unauthorized_access'];
    const warningEvents = ['input_validation_failed', 'security_scan_error', 'policy_violation'];
    
    if (criticalEvents.includes(eventType)) return 'error';
    if (warningEvents.includes(eventType)) return 'warn';
    return 'info';
  }

  startSecurityMonitoring() {
    // Monitor security events every 5 minutes
    setInterval(() => {
      this.performPeriodicSecurityCheck();
    }, 5 * 60 * 1000);

    console.log('👁️ Security monitoring started');
  }

  async performPeriodicSecurityCheck() {
    try {
      // Check for suspicious activity patterns
      const recentEvents = this.auditLog.filter(entry => 
        Date.now() - entry.timestamp < 60 * 60 * 1000 // Last hour
      );

      const errorEvents = recentEvents.filter(entry => entry.level === 'error');
      const warningEvents = recentEvents.filter(entry => entry.level === 'warn');

      if (errorEvents.length > 10) {
        this.logSecurityEvent('high_error_rate', 'High error rate detected in security events', {
          errorCount: errorEvents.length,
          timeWindow: '1 hour'
        });
      }

      if (warningEvents.length > 20) {
        this.logSecurityEvent('high_warning_rate', 'High warning rate detected in security events', {
          warningCount: warningEvents.length,
          timeWindow: '1 hour'
        });
      }

      // Check encryption key age
      for (const [keyId, keyInfo] of this.encryptionKeys.entries()) {
        const policy = this.securityPolicies.get('data_encryption');
        const keyAge = Date.now() - keyInfo.createdAt;
        
        if (keyAge > policy.keyRotationInterval) {
          this.logSecurityEvent('key_rotation_due', 'Encryption key rotation due', {
            keyId: keyId,
            age: keyAge,
            rotationInterval: policy.keyRotationInterval
          });
        }
      }

    } catch (error) {
      console.error('❌ Periodic security check failed:', error);
    }
  }

  getSecurityStatus() {
    const activeScans = this.activeSecurityChecks.size;
    const recentEvents = this.auditLog.filter(entry => 
      Date.now() - entry.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    const eventsByLevel = {
      error: recentEvents.filter(e => e.level === 'error').length,
      warn: recentEvents.filter(e => e.level === 'warn').length,
      info: recentEvents.filter(e => e.level === 'info').length
    };

    return {
      securityLevel: this.securityLevel,
      activeScans: activeScans,
      auditLogSize: this.auditLog.length,
      encryptionKeysCount: this.encryptionKeys.size,
      securityPoliciesCount: this.securityPolicies.size,
      recentEvents: eventsByLevel,
      overallStatus: this.calculateOverallSecurityStatus(eventsByLevel)
    };
  }

  calculateOverallSecurityStatus(eventsByLevel) {
    if (eventsByLevel.error > 5) return 'critical';
    if (eventsByLevel.error > 2 || eventsByLevel.warn > 10) return 'warning';
    if (eventsByLevel.warn > 5) return 'attention';
    return 'healthy';
  }

  getAuditLog(options = {}) {
    const limit = options.limit || 100;
    const level = options.level;
    const eventType = options.eventType;
    const since = options.since;

    let filteredLog = this.auditLog;

    if (level) {
      filteredLog = filteredLog.filter(entry => entry.level === level);
    }

    if (eventType) {
      filteredLog = filteredLog.filter(entry => entry.eventType === eventType);
    }

    if (since) {
      filteredLog = filteredLog.filter(entry => entry.timestamp >= since);
    }

    return filteredLog
      .slice(-limit)
      .reverse() // Most recent first
      .map(entry => ({
        id: entry.id,
        timestamp: entry.timestamp,
        eventType: entry.eventType,
        message: entry.message,
        level: entry.level,
        details: entry.details
      }));
  }

  async updateSecurityPolicy(policyName, newSettings) {
    try {
      if (!this.securityPolicies.has(policyName)) {
        throw new Error(`Security policy not found: ${policyName}`);
      }

      const currentPolicy = this.securityPolicies.get(policyName);
      const updatedPolicy = { ...currentPolicy, ...newSettings };
      
      this.securityPolicies.set(policyName, updatedPolicy);
      
      this.logSecurityEvent('policy_update', 'Security policy updated', {
        policyName: policyName,
        changes: newSettings
      });

      console.log(`🔧 Security policy updated: ${policyName}`);
      return { success: true, policy: updatedPolicy };

    } catch (error) {
      this.logSecurityEvent('policy_update_error', 'Security policy update failed', {
        policyName: policyName,
        error: error.message
      });
      throw error;
    }
  }

  async shutdown() {
    console.log('🔒 Shutting down Advanced Security...');
    
    // Clear sensitive data
    this.encryptionKeys.clear();
    this.activeSecurityChecks.clear();
    
    // Keep audit log for analysis
    console.log(`📊 Final security status: ${this.auditLog.length} audit entries logged`);
    
    console.log('✅ Advanced Security shutdown complete');
  }
}

module.exports = AdvancedSecurity;