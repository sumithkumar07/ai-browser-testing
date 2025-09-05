class AIService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || null
    this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions'
    this.browserService = null
    console.log('Phase 5: AIService initialized with advanced features')
    
    if (this.apiKey) {
      console.log('Phase 5: Groq API key loaded')
    } else {
      console.log('Phase 5: No Groq API key found - using placeholder responses')
    }
  }

  setBrowserService(browserService) {
    this.browserService = browserService
    console.log('Phase 5: BrowserService connected to AIService')
  }

  async tryAlternativeModel(message, context = '') {
    console.log('Phase 5: Trying alternative model names...')
    
    const models = [
      'gemma2-9b-it' // Only use the working model
    ]
    
    for (const model of models) {
      try {
        console.log(`Phase 5: Trying model: ${model}`)
        
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
                  body: JSON.stringify({
          model: 'gemma2-9b-it', // Use working model
          messages: [
              {
                role: 'system',
                content: `You are an AI assistant integrated into KAiro Browser. You help users browse the web, answer questions, and provide intelligent assistance. ${context ? `Current context: ${context}` : ''}`
              },
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        })
        
        if (response.ok) {
          console.log(`Phase 5: Success with model: ${model}`)
          const data = await response.json()
          return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
        } else {
          console.log(`Phase 5: Model ${model} failed with status: ${response.status}`)
        }
      } catch (error) {
        console.log(`Phase 5: Model ${model} error:`, error.message)
      }
    }
    
    console.log('Phase 5: All models failed - using placeholder response')
    return this.getPlaceholderResponse(message)
  }

    async sendMessage(message, context = '') {
    console.log('Phase 5: Sending AI message:', message)

    if (!this.apiKey) {
      console.log('Phase 5: No API key - using placeholder response')
      return this.getPlaceholderResponse(message)
    }

    try {
      console.log('Phase 5: Making API request to Groq...')
      console.log('Phase 5: Request details:')
      console.log('  - Model:', 'gemma2-9b-it') // Use the working model
      console.log('  - API Key length:', this.apiKey ? this.apiKey.length : 0)
      console.log('  - Base URL:', this.baseUrl)
      
      // Enhanced system prompt with browser capabilities
      const systemPrompt = `You are an AI assistant integrated into KAiro Browser. You help users browse the web, answer questions, and provide intelligent assistance.

BROWSER CAPABILITIES:
- Navigate to websites: "go to youtube.com", "open google.com"
- Search the web: "search for weather", "search for news"
- Manage tabs: "new tab", "close tab", "switch tabs"
- Get browser info: "current page", "how many tabs"

${context ? `Current context: ${context}` : ''}

Always be helpful, concise, and browser-aware. If the user asks about browser actions, guide them on how to use the commands.`
      
      const requestBody = {
        model: 'gemma2-9b-it', // Use the working model
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }
      
      console.log('Phase 5: Request body:', JSON.stringify(requestBody, null, 2))
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Phase 5: API response status:', response.status)

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Phase 5: API key is invalid - using placeholder response')
          return this.getPlaceholderResponse(message)
        }
        
        // Log the error response for debugging
        const errorText = await response.text()
        console.log('Phase 5: API error response:', errorText)
        
        if (response.status === 400) {
          console.log('Phase 5: Bad request - checking if model name is correct')
          // Try with a different model name
          return this.tryAlternativeModel(message, context)
        }
        
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
      
      console.log('Phase 5: AI response received successfully')
      return aiResponse

    } catch (error) {
      console.error('Phase 5: AI service error:', error)
      console.log('Phase 5: Falling back to placeholder response')
      return this.getPlaceholderResponse(message)
    }
  }

  async summarizePage() {
    console.log('Phase 5: Summarizing current page')
    
    if (!this.browserService) {
      return 'Unable to access current page content'
    }

    try {
      const pageContent = await this.browserService.getPageContent()
      const pageTitle = await this.browserService.getPageTitle()
      const pageUrl = await this.browserService.getCurrentUrl()

      if (!this.apiKey) {
        return `Page Summary (Placeholder):\nTitle: ${pageTitle}\nURL: ${pageUrl}\nContent length: ${pageContent.length} characters`
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemma2-9b-it', // Use working model
          messages: [
            {
              role: 'system',
              content: 'You are a web page summarizer. Provide a concise, informative summary of the page content.'
            },
            {
              role: 'user',
              content: `Please summarize this web page:\nTitle: ${pageTitle}\nURL: ${pageUrl}\nContent: ${pageContent.substring(0, 3000)}`
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const summary = data.choices[0]?.message?.content || 'Unable to generate summary'
      
      console.log('Phase 5: Page summary generated')
      return summary

    } catch (error) {
      console.error('Phase 5: Page summarization error:', error)
      return `Error generating summary: ${error.message}`
    }
  }

  async analyzeContent() {
    console.log('Phase 5: Analyzing page content')
    
    if (!this.browserService) {
      return 'Unable to access current page content'
    }

    try {
      const pageContent = await this.browserService.getPageContent()
      const pageTitle = await this.browserService.getPageTitle()

      if (!this.apiKey) {
        return `Content Analysis (Placeholder):\nTitle: ${pageTitle}\nContent type: Web page\nWord count: ${pageContent.split(' ').length}`
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemma2-9b-it', // Use working model
          messages: [
            {
              role: 'system',
              content: 'You are a content analyzer. Analyze the web page content and provide insights about its type, main topics, and key information.'
            },
            {
              role: 'user',
              content: `Analyze this web page content:\nTitle: ${pageTitle}\nContent: ${pageContent.substring(0, 2000)}`
            }
          ],
          max_tokens: 400,
          temperature: 0.3,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const analysis = data.choices[0]?.message?.content || 'Unable to analyze content'
      
      console.log('Phase 5: Content analysis completed')
      return analysis

    } catch (error) {
      console.error('Phase 5: Content analysis error:', error)
      return `Error analyzing content: ${error.message}`
    }
  }

  async getContext() {
    if (this.browserService) {
      try {
        const pageTitle = await this.browserService.getPageTitle()
        const pageUrl = await this.browserService.getCurrentUrl()
        return `You are helping a user browse the web with KAiro Browser. Current page: ${pageTitle} (${pageUrl})`
      } catch (error) {
        console.error('Phase 5: Error getting context:', error)
      }
    }
    return 'You are helping a user browse the web with KAiro Browser.'
  }

  getPlaceholderResponse(message) {
    const responses = [
      `I understand you said: "${message}". I'm your AI assistant for KAiro Browser! 🚀

Currently, I'm running in development mode. To enable full AI capabilities including:
• Intelligent web browsing assistance
• Page summarization and analysis
• Content understanding and insights
• Real-time web research

Please configure your Groq API key in the environment variables.`,
      
      `Thanks for your message: "${message}"! I'm here to help with your web browsing experience.

I can assist with:
• Understanding web page content
• Summarizing articles and pages
• Analyzing information and data
• Answering questions about what you're browsing

To unlock these features, add your Groq API key to the configuration.`,
      
      `Message received: "${message}". I'm your intelligent browsing companion for KAiro Browser!

Features I can provide:
• Smart page analysis
• Content summarization
• Web research assistance
• Intelligent answers about web content

Set up your Groq API key to activate these advanced AI features.`,
      
      `I understand: "${message}". Welcome to KAiro Browser's AI assistant! 🤖

I'm designed to help you:
• Navigate and understand web content
• Get quick summaries of pages
• Analyze information and data
• Answer questions about what you're browsing

Configure your Groq API key to enable these intelligent features.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  isConnected() {
    return this.apiKey !== null
  }
}

module.exports = { AIService }
