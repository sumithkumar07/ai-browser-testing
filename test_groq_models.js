#!/usr/bin/env node
/**
 * Test available GROQ models
 */

const Groq = require('groq-sdk')
require('dotenv').config()

async function testGroqModels() {
  console.log('🔍 Testing GROQ Models...')
  
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  })
  
  // Try different models that might be available
  const modelsToTest = [
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'llama3-70b-8192',
    'mixtral-8x7b-32768',
    'gemma-7b-it'
  ]
  
  for (const model of modelsToTest) {
    try {
      console.log(`\n🧪 Testing model: ${model}`)
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: "Hello! Please respond with exactly: 'Model test successful'"
          }
        ],
        model: model,
        max_tokens: 20,
        temperature: 0
      })
      
      const response = completion.choices[0]?.message?.content?.trim()
      console.log(`✅ ${model}: SUCCESS - "${response}"`)
      
      // If this model works, use it for further testing
      if (response && response.includes('successful')) {
        console.log(`\n🎯 Found working model: ${model}`)
        return model
      }
      
    } catch (error) {
      console.log(`❌ ${model}: FAILED - ${error.message}`)
    }
  }
  
  return null
}

testGroqModels().then(workingModel => {
  if (workingModel) {
    console.log(`\n✅ Recommended model for KAiro Browser: ${workingModel}`)
  } else {
    console.log('\n❌ No working models found')
  }
}).catch(error => {
  console.error('❌ Test failed:', error)
})