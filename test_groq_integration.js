// Quick test script to verify GROQ integration is working
const Groq = require('groq-sdk');
require('dotenv').config();

async function testGroqIntegration() {
  try {
    console.log('🧪 Testing GROQ API Integration...');
    
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not found in environment');
    }
    
    console.log('🔑 API Key found:', process.env.GROQ_API_KEY.substring(0, 10) + '...');
    
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    // Test with a simple message
    console.log('🚀 Making test API call...');
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Hello! Please respond with a brief message confirming you are working correctly.'
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 100
    });

    console.log('✅ GROQ API Response:');
    console.log('Model:', chatCompletion.model);
    console.log('Response:', chatCompletion.choices[0].message.content);
    console.log('Usage:', chatCompletion.usage);
    
    console.log('\n🎉 GROQ Integration Test: SUCCESS');
    return true;
    
  } catch (error) {
    console.error('❌ GROQ Integration Test Failed:', error.message);
    return false;
  }
}

// Run the test
testGroqIntegration().then(success => {
  process.exit(success ? 0 : 1);
});