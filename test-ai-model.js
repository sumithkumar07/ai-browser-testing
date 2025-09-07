// Test GROQ AI Model - Llama 3.3 70B Versatile
const Groq = require('groq-sdk')
require('dotenv').config()

async function testAIModel() {
  console.log('🧪 Testing GROQ AI Model - Llama 3.3 70B Versatile')
  console.log('================================================')
  
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not found in environment')
    }
    
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    })
    
    console.log('🔑 API Key: Configured ✅')
    console.log('🤖 Model: llama-3.3-70b-versatile')
    console.log('⏱️  Testing connection...\n')
    
    const startTime = Date.now()
    
    // Test AI capabilities with a complex question
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an advanced AI assistant. Demonstrate your reasoning capabilities by providing a structured, intelligent response.'
        },
        {
          role: 'user',
          content: 'Analyze the benefits of using a 70B parameter model vs an 8B parameter model for a desktop AI browser application. Be specific and technical.'
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024
    })
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    console.log('✅ CONNECTION SUCCESSFUL!')
    console.log(`⏱️  Response Time: ${responseTime}ms`)
    console.log(`📊 Tokens Used: ${response.usage?.total_tokens || 'N/A'}`)
    console.log('\n🤖 AI RESPONSE:')
    console.log('================')
    console.log(response.choices[0]?.message?.content || 'No response received')
    
    console.log('\n📈 PERFORMANCE METRICS:')
    console.log('=======================')
    console.log(`Response Time: ${responseTime}ms`)
    console.log(`Model: ${response.model || 'llama-3.3-70b-versatile'}`)
    console.log(`Input Tokens: ${response.usage?.prompt_tokens || 'N/A'}`)
    console.log(`Output Tokens: ${response.usage?.completion_tokens || 'N/A'}`)
    console.log(`Total Tokens: ${response.usage?.total_tokens || 'N/A'}`)
    
    // Performance assessment
    console.log('\n🎯 ASSESSMENT:')
    console.log('===============')
    if (responseTime < 10000) {
      console.log('⚡ Speed: Excellent (< 10s)')
    } else if (responseTime < 20000) {
      console.log('✅ Speed: Good (< 20s)')
    } else {
      console.log('⏳ Speed: Acceptable (> 20s)')
    }
    
    const responseLength = response.choices[0]?.message?.content?.length || 0
    if (responseLength > 500) {
      console.log('📝 Response Quality: Detailed and comprehensive')
    } else if (responseLength > 200) {
      console.log('📝 Response Quality: Good depth')
    } else {
      console.log('📝 Response Quality: Basic')
    }
    
    console.log('\n🎉 SUCCESS: Llama 3.3 70B Versatile is working perfectly!')
    console.log('🚀 Your KAiro Browser has access to the most advanced AI model from GROQ!')
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    
    if (error.message.includes('API key')) {
      console.log('🔧 Fix: Check your GROQ_API_KEY in .env file')
    } else if (error.message.includes('model')) {
      console.log('🔧 Fix: Model may not be available or name changed')
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      console.log('🔧 Fix: Check internet connection')
    } else {
      console.log('🔧 Fix: Check GROQ service status')
    }
    
    process.exit(1)
  }
}

// Run the test
testAIModel()