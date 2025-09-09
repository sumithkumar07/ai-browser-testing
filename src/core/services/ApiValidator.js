// GROQ API Validator Service - Production Ready
// Handles API key validation, rate limiting, and error recovery

class ApiValidator {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl || 'https://api.groq.com/openai/v1';
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.rateLimitWindow = options.rateLimitWindow || 60000; // 1 minute
    this.maxRequestsPerWindow = options.maxRequestsPerWindow || 100;
    
    // Rate limiting state
    this.requestCount = 0;
    this.windowStart = Date.now();
    this.isRateLimited = false;
    
    // Health monitoring
    this.healthStatus = 'unknown';
    this.lastHealthCheck = 0;
    this.consecutiveFailures = 0;
    this.maxConsecutiveFailures = 5;
  }

  // Validate API key format and accessibility
  async validateApiKey() {
    try {
      console.log('🔑 Validating GROQ API key...');
      
      if (!this.apiKey) {
        throw new Error('API key is required');
      }

      if (!this.apiKey.startsWith('gsk_')) {
        throw new Error('Invalid GROQ API key format - must start with "gsk_"');
      }

      if (this.apiKey.length < 50) {
        throw new Error('API key appears to be too short');
      }

      // Test API connectivity with minimal request
      const testRequest = await this.makeRequest('/models', {
        method: 'GET',
        timeout: 10000
      });

      if (testRequest.success) {
        console.log('✅ GROQ API key validated successfully');
        this.healthStatus = 'healthy';
        this.consecutiveFailures = 0;
        return { valid: true, models: testRequest.data };
      } else {
        throw new Error(testRequest.error || 'API key validation failed');
      }

    } catch (error) {
      console.error('❌ API key validation failed:', error.message);
      this.healthStatus = 'unhealthy';
      this.consecutiveFailures++;
      
      return {
        valid: false,
        error: error.message,
        consecutiveFailures: this.consecutiveFailures
      };
    }
  }

  // Enhanced request method with retry logic and error handling
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const maxRetries = options.maxRetries || this.maxRetries;
    let lastError = null;

    // Check rate limiting
    if (this.isRateLimited) {
      return {
        success: false,
        error: 'Rate limited - please wait before making more requests',
        rateLimited: true
      };
    }

    // Update rate limiting counters
    this.updateRateLimitCounters();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📡 Making request to ${endpoint} (attempt ${attempt}/${maxRetries})`);

        const requestOptions = {
          method: options.method || 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'KAiro-Browser/2.0.0',
            ...options.headers
          },
          timeout: options.timeout || 30000
        };

        if (options.body) {
          requestOptions.body = JSON.stringify(options.body);
        }

        const response = await this.fetchWithTimeout(url, requestOptions);
        
        if (response.ok) {
          const data = await response.json();
          this.consecutiveFailures = 0;
          this.healthStatus = 'healthy';
          
          return {
            success: true,
            data: data,
            status: response.status,
            attempt: attempt
          };
        } else {
          const errorData = await response.json().catch(() => ({}));
          lastError = new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
          
          // Handle specific error codes
          if (response.status === 401) {
            this.healthStatus = 'unauthorized';
            throw new Error('Invalid API key - please check your GROQ API key');
          } else if (response.status === 429) {
            this.isRateLimited = true;
            setTimeout(() => { this.isRateLimited = false; }, this.rateLimitWindow);
            throw new Error('Rate limit exceeded - please wait before making more requests');
          } else if (response.status >= 500) {
            // Server error - retry
            console.warn(`⚠️ Server error ${response.status}, retrying in ${this.retryDelay * attempt}ms...`);
            await this.delay(this.retryDelay * attempt);
            continue;
          } else {
            // Client error - don't retry
            throw lastError;
          }
        }

      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          this.consecutiveFailures++;
          this.healthStatus = 'unhealthy';
          break;
        }

        // Exponential backoff for retries
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        console.warn(`⚠️ Request failed, retrying in ${delay}ms... (${error.message})`);
        await this.delay(delay);
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Request failed after all retries',
      attempts: maxRetries,
      consecutiveFailures: this.consecutiveFailures
    };
  }

  // Fetch with timeout support
  async fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // Rate limiting management
  updateRateLimitCounters() {
    const now = Date.now();
    
    // Reset window if needed
    if (now - this.windowStart >= this.rateLimitWindow) {
      this.requestCount = 0;
      this.windowStart = now;
      this.isRateLimited = false;
    }
    
    this.requestCount++;
    
    // Check if rate limit exceeded
    if (this.requestCount >= this.maxRequestsPerWindow) {
      this.isRateLimited = true;
      console.warn('⚠️ Rate limit reached, throttling requests');
    }
  }

  // Health monitoring
  async performHealthCheck() {
    const now = Date.now();
    
    // Don't check too frequently
    if (now - this.lastHealthCheck < 30000) { // 30 seconds
      return { status: this.healthStatus, cached: true };
    }

    this.lastHealthCheck = now;
    const validation = await this.validateApiKey();
    
    return {
      status: this.healthStatus,
      valid: validation.valid,
      consecutiveFailures: this.consecutiveFailures,
      isCircuitOpen: this.consecutiveFailures >= this.maxConsecutiveFailures,
      rateLimited: this.isRateLimited,
      timestamp: now
    };
  }

  // Circuit breaker pattern
  isCircuitOpen() {
    return this.consecutiveFailures >= this.maxConsecutiveFailures;
  }

  // Reset circuit breaker
  resetCircuit() {
    this.consecutiveFailures = 0;
    this.healthStatus = 'healthy';
    this.isRateLimited = false;
    console.log('🔄 API circuit breaker reset');
  }

  // Utility method for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get current status
  getStatus() {
    return {
      healthStatus: this.healthStatus,
      consecutiveFailures: this.consecutiveFailures,
      isRateLimited: this.isRateLimited,
      isCircuitOpen: this.isCircuitOpen(),
      requestCount: this.requestCount,
      windowStart: this.windowStart
    };
  }
}

module.exports = { ApiValidator };