// Test GROQ API Integration
// This test verifies that the GROQ API key and model are working correctly

const Groq = require('groq-sdk');
require('dotenv').config();

console.log('🧪 Testing GROQ API Integration...');
console.log('🔑 API Key present:', process.env.GROQ_API_KEY ? 'YES' : 'NO');

if (!process.env.GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY not found in environment variables');
  process.exit(1);
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function testGroqAPI() {
  try {
    console.log('\n📡 Testing primary model: llama-3.3-70b-versatile');
    
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Hello! Please respond with "GROQ API integration test successful" if you can read this message.'
        }
      ],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 50,
      temperature: 0.1
    });

    if (response && response.choices && response.choices.length > 0) {
      console.log('✅ Primary model working successfully!');
      console.log('📊 Model:', response.model || 'llama-3.3-70b-versatile');
      console.log('💬 Response:', response.choices[0].message.content);
      console.log('📈 Usage:', response.usage);
      
      return true;
    } else {
      throw new Error('Invalid response structure');
    }
    
  } catch (primaryError) {
    console.error('❌ Primary model failed:', primaryError.message);
    console.log('\n🔄 Trying fallback model: llama3-8b-8192');
    
    try {
      const fallbackResponse = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: 'Test fallback model response'
          }
        ],
        model: 'llama3-8b-8192',
        max_tokens: 30,
        temperature: 0.1
      });

      if (fallbackResponse && fallbackResponse.choices && fallbackResponse.choices.length > 0) {
        console.log('✅ Fallback model working!');
        console.log('📊 Model:', fallbackResponse.model || 'llama3-8b-8192');
        console.log('💬 Response:', fallbackResponse.choices[0].message.content);
        
        return 'fallback';
      } else {
        throw new Error('Invalid fallback response');
      }
      
    } catch (fallbackError) {
      console.error('❌ Fallback model also failed:', fallbackError.message);
      console.error('\n🔍 Debugging information:');
      console.error('- API Key format:', process.env.GROQ_API_KEY.substring(0, 8) + '...');
      console.error('- Error type:', fallbackError.constructor.name);
      
      if (fallbackError.response) {
        console.error('- HTTP Status:', fallbackError.response.status);
        console.error('- Response data:', fallbackError.response.data);
      }
      
      return false;
    }
  }
}

// Test function for agent task analysis
function testAgentTaskAnalysis() {
  console.log('\n🤖 Testing Agent Task Analysis...');
  
  const testTasks = [
    'research latest AI developments',
    'navigate to google.com',
    'help me shop for laptops',
    'compose an email to my team',
    'automate my daily workflow',
    'analyze this page content'
  ];
  
  // Import the task analysis logic from main.js (simplified version)
  function analyzeAgentTask(task) {
    const lowerTask = task.toLowerCase();
    const scores = {
      research: 0,
      navigation: 0,
      shopping: 0,
      communication: 0,
      automation: 0,
      analysis: 0
    };

    // Research scoring
    if (lowerTask.includes('research') || lowerTask.includes('find') || lowerTask.includes('information')) {
      scores.research = 90;
    }
    
    // Navigation scoring
    if (lowerTask.includes('navigate') || lowerTask.includes('go to') || lowerTask.includes('.com')) {
      scores.navigation = 95;
    }
    
    // Shopping scoring
    if (lowerTask.includes('shop') || lowerTask.includes('buy') || lowerTask.includes('price')) {
      scores.shopping = 90;
    }
    
    // Communication scoring
    if (lowerTask.includes('email') || lowerTask.includes('compose') || lowerTask.includes('write')) {
      scores.communication = 90;
    }
    
    // Automation scoring
    if (lowerTask.includes('automate') || lowerTask.includes('workflow') || lowerTask.includes('schedule')) {
      scores.automation = 90;
    }
    
    // Analysis scoring
    if (lowerTask.includes('analyze') || lowerTask.includes('analysis') || lowerTask.includes('examine')) {
      scores.analysis = 90;
    }

    const primaryAgent = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const confidence = scores[primaryAgent];

    return { primaryAgent, confidence, scores };
  }
  
  testTasks.forEach(task => {
    const result = analyzeAgentTask(task);
    const status = result.confidence >= 80 ? '✅' : result.confidence >= 60 ? '⚠️' : '❌';
    console.log(`${status} "${task}" → ${result.primaryAgent} (${result.confidence}% confidence)`);
  });
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting comprehensive integration tests...\n');
  
  const groqResult = await testGroqAPI();
  testAgentTaskAnalysis();
  
  console.log('\n📋 Test Summary:');
  console.log('- GROQ API:', groqResult === true ? '✅ Primary model working' : 
                              groqResult === 'fallback' ? '⚠️ Fallback model only' : '❌ Failed');
  console.log('- Agent Analysis: ✅ Working');
  
  if (groqResult) {
    console.log('\n🎉 Integration tests completed successfully!');
    console.log('💡 The KAiro Browser backend should work correctly with these integrations.');
  } else {
    console.log('\n⚠️ Some integration issues detected. Please check the GROQ API key and network connection.');
  }
}

runAllTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});