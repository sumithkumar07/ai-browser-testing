#!/usr/bin/env node

// Test GROQ API integration
const Groq = require('groq-sdk');
require('dotenv').config();

async function testGroqAPI() {
  console.log('🧪 Testing GROQ API Integration...');
  
  try {
    // Check if API key is available
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not found in environment variables');
    }
    
    console.log('✅ GROQ API key found');

    // Initialize Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    console.log('✅ GROQ client initialized');

    // Test API connection
    console.log('🔍 Testing API connection...');
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Hello! Please respond with exactly "API_TEST_SUCCESS" to confirm the connection is working.'
        }
      ],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 10,
      temperature: 0.1
    });

    if (response && response.choices && response.choices.length > 0) {
      const content = response.choices[0].message.content;
      console.log('✅ API Response received:', content);
      
      if (content.includes('API_TEST_SUCCESS')) {
        console.log('✅ GROQ API integration test PASSED');
        return { success: true, message: 'API integration working correctly' };
      } else {
        console.log('⚠️ API responded but with unexpected content');
        return { success: true, message: 'API working but response unexpected', response: content };
      }
    } else {
      throw new Error('Invalid response structure from GROQ API');
    }

  } catch (error) {
    console.error('❌ GROQ API test FAILED:', error.message);
    
    // Provide specific error guidance
    if (error.message.includes('API key')) {
      console.log('💡 Fix: Check your GROQ_API_KEY in the .env file');
    } else if (error.message.includes('rate limit')) {
      console.log('💡 Fix: Rate limit exceeded, try again in a few moments');
    } else if (error.message.includes('model')) {
      console.log('💡 Fix: The model might not be available, try using llama3-8b-8192');
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      console.log('💡 Fix: Check your internet connection');
    }
    
    return { success: false, error: error.message };
  }
}

// Run test if called directly
if (require.main === module) {
  testGroqAPI()
    .then(result => {
      console.log('\n📊 Test Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 Test crashed:', error);
      process.exit(1);
    });
}

module.exports = { testGroqAPI };