// electron/services/SecurityManager.ts
export class SecurityManager {
  private static instance: SecurityManager
  private securityConfig = {
    enableCSP: true,
    allowInsecureContent: false,
    enableSandbox: true,
    enableContextIsolation: true,
    disableNodeIntegration: true
  }

  private constructor() {}

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager()
    }
    return SecurityManager.instance
  }

  getSecureWebPreferences() {
    return {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      sandbox: this.securityConfig.enableSandbox,
      enableRemoteModule: false,
      // Content Security Policy
      additionalArguments: this.securityConfig.enableCSP ? [
        '--enable-features=UseStrictSecurityOriginCheck'
      ] : []
    }
  }

  validateEnvironment(): { isSecure: boolean; warnings: string[] } {
    const warnings: string[] = []
    let isSecure = true

    // Check environment
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG === 'true') {
      warnings.push('Debug mode enabled - should be disabled in production')
    }

    // Check API key exposure
    if (process.env.GROQ_API_KEY && process.env.NODE_ENV === 'production') {
      // In production, API keys should be properly secured
      console.log('🔑 API key configured - ensure it\'s properly secured in production')
    }

    return { isSecure, warnings }
  }

  logSecurityStatus(): void {
    const status = this.validateEnvironment()
    
    console.log('🔒 Security Status:', {
      secure: status.isSecure,
      warnings: status.warnings.length,
      config: this.securityConfig
    })

    if (status.warnings.length > 0) {
      console.warn('⚠️ Security Warnings:', status.warnings)
    }
  }
}

export default SecurityManager