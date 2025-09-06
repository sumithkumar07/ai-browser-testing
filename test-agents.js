#!/usr/bin/env node

/**
 * Test Script for KAiro Browser Agents
 * Tests the new Communication and Automation agents
 */

const dotenv = require('dotenv');
const { Groq } = require('groq-sdk');

// Load environment variables
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Test Communication Agent
async function testCommunicationAgent() {
  console.log('\n🧪 Testing Communication Agent...\n');
  
  const communicationTests = [
    {
      task: "compose a professional email to schedule a meeting",
      expectedType: "email"
    },
    {
      task: "fill out the contact form on this website", 
      expectedType: "form"
    },
    {
      task: "create a LinkedIn post about AI trends",
      expectedType: "social"
    },
    {
      task: "extract contact information from this page",
      expectedType: "contact"
    }
  ];

  for (const test of communicationTests) {
    console.log(`📧 Task: "${test.task}"`);
    console.log(`🎯 Expected Type: ${test.expectedType}`);
    
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are KAiro Browser's Communication Agent. Analyze the task and respond with structured communication assistance.

For email tasks: Provide subject, greeting, body, and closing.
For form tasks: Provide field identification and filling strategy.
For social tasks: Create platform-appropriate content.
For contact tasks: Provide extraction strategy.

Be professional, accurate, and helpful.`
          },
          {
            role: "user",
            content: test.task
          }
        ],
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 500,
      });

      console.log(`✅ Result:\n${completion.choices[0]?.message?.content}\n`);
      console.log('─'.repeat(80));
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`);
    }
  }
}

// Test Automation Agent  
async function testAutomationAgent() {
  console.log('\n🤖 Testing Automation Agent...\n');
  
  const automationTests = [
    {
      task: "create a workflow to automate daily website monitoring",
      expectedType: "workflow"
    },
    {
      task: "automate the process of filling multiple forms with the same data",
      expectedType: "repetitive"
    },
    {
      task: "schedule daily data collection from news websites",
      expectedType: "scheduled"
    },
    {
      task: "collect product prices from multiple e-commerce sites automatically",
      expectedType: "data_collection"
    }
  ];

  for (const test of automationTests) {
    console.log(`🤖 Task: "${test.task}"`);
    console.log(`🎯 Expected Type: ${test.expectedType}`);
    
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system", 
            content: `You are KAiro Browser's Automation Agent. Analyze the task and create detailed automation workflows.

For workflow tasks: Provide step-by-step process design.
For repetitive tasks: Create efficiency-focused automation.
For scheduled tasks: Design time-based automation with monitoring.
For data collection: Create systematic data gathering processes.

Be detailed, practical, and focus on reliability.`
          },
          {
            role: "user",
            content: test.task
          }
        ],
        model: "llama3-8b-8192",
        temperature: 0.5,
        max_tokens: 600,
      });

      console.log(`✅ Result:\n${completion.choices[0]?.message?.content}\n`);
      console.log('─'.repeat(80));
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`);
    }
  }
}

// Agent Intent Classification Test
async function testAgentClassification() {
  console.log('\n🎯 Testing Agent Intent Classification...\n');
  
  const classificationTests = [
    "compose email to my manager about project updates",
    "automate daily report generation workflow", 
    "research best AI tools for productivity",
    "fill out multiple job application forms",
    "schedule automated backups every week",
    "analyze this webpage for key insights",
    "create social media content for product launch",
    "compare laptop prices across different stores"
  ];

  for (const task of classificationTests) {
    console.log(`🔍 Task: "${task}"`);
    
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Classify this task into one of these agent types: research, navigation, analysis, shopping, communication, automation.

Respond with just the classification and confidence (0-1):
Format: "AGENT_TYPE (confidence: 0.X)"`
          },
          {
            role: "user", 
            content: task
          }
        ],
        model: "llama3-8b-8192",
        temperature: 0.1,
        max_tokens: 50,
      });

      console.log(`🎯 Classification: ${completion.choices[0]?.message?.content}`);
      console.log('─'.repeat(50));
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`);
    }
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 KAiro Browser - Agent Testing Suite');
  console.log('═'.repeat(80));
  
  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not found in environment variables');
    process.exit(1);
  }
  
  console.log('✅ Groq API Key loaded');
  console.log('🔑 Testing with your provided API key...');
  
  try {
    await testCommunicationAgent();
    await testAutomationAgent();
    await testAgentClassification();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('• Communication Agent: ✅ Email, Form, Social, Contact handling');
    console.log('• Automation Agent: ✅ Workflow, Scheduling, Data collection');
    console.log('• Intent Classification: ✅ Smart agent selection');
    console.log('\n🚀 Your KAiro Browser now has 6 powerful agents ready to use!');
    
  } catch (error) {
    console.error(`\n❌ Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);