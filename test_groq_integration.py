#!/usr/bin/env python3
"""
Test GROQ API Integration with the provided API key
"""

import os
import requests
import json

def test_groq_api():
    """Test GROQ API with the provided key"""
    
    # Use the API key from the review request
    api_key = "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"
    
    print("🧪 Testing GROQ API Integration...")
    print(f"🔑 API Key: {api_key[:10]}...{api_key[-10:]}")
    
    # Test with the latest model mentioned in the review request
    test_models = [
        "llama-3.3-70b-versatile",  # Latest model mentioned in review
        "llama-3.1-8b-instant",     # Model mentioned in test results
        "llama3-8b-8192"            # Deprecated model
    ]
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    for model in test_models:
        print(f"\n🤖 Testing model: {model}")
        
        test_payload = {
            "messages": [
                {
                    "role": "system", 
                    "content": "You are KAiro, an AI browser assistant. Respond briefly."
                },
                {
                    "role": "user", 
                    "content": "Test message for KAiro Browser integration"
                }
            ],
            "model": model,
            "max_tokens": 50,
            "temperature": 0.3
        }
        
        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=test_payload,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                message = data['choices'][0]['message']['content']
                print(f"✅ SUCCESS: {model}")
                print(f"📝 Response: {message[:100]}...")
                print(f"⚡ Usage: {data.get('usage', {})}")
                return True, model, message
                
            elif response.status_code == 400:
                error_data = response.json()
                if "does not exist" in str(error_data):
                    print(f"❌ DEPRECATED: {model} - Model no longer available")
                else:
                    print(f"❌ ERROR: {model} - {error_data}")
                    
            elif response.status_code == 401:
                print(f"🔐 AUTH ERROR: Invalid API key")
                return False, model, "Authentication failed"
                
            elif response.status_code == 429:
                print(f"⏰ RATE LIMIT: Too many requests")
                return False, model, "Rate limited"
                
            else:
                print(f"❌ HTTP ERROR: {response.status_code} - {response.text}")
                
        except requests.exceptions.Timeout:
            print(f"⏰ TIMEOUT: {model}")
        except requests.exceptions.ConnectionError:
            print(f"🌐 CONNECTION ERROR: {model}")
        except Exception as e:
            print(f"💥 EXCEPTION: {model} - {str(e)}")
    
    return False, None, "All models failed"

def test_agent_coordination():
    """Test agent coordination with AI"""
    
    api_key = "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"
    
    print("\n🤖 Testing Agent Coordination...")
    
    # Test different agent scenarios
    test_scenarios = [
        {
            "name": "Research Agent",
            "prompt": "I need to research the latest AI developments in 2025",
            "expected_agent": "research"
        },
        {
            "name": "Navigation Agent", 
            "prompt": "Navigate to google.com and wikipedia.org",
            "expected_agent": "navigation"
        },
        {
            "name": "Shopping Agent",
            "prompt": "Help me find the best laptop deals",
            "expected_agent": "shopping"
        },
        {
            "name": "Analysis Agent",
            "prompt": "Analyze this webpage content for key insights",
            "expected_agent": "analysis"
        }
    ]
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    for scenario in test_scenarios:
        print(f"\n🎯 Testing: {scenario['name']}")
        
        system_prompt = """You are KAiro, an AI browser assistant with 6 specialized agents:
1. Research Agent - for information gathering and research
2. Navigation Agent - for website navigation and URL handling  
3. Shopping Agent - for product research and price comparison
4. Communication Agent - for emails and messaging
5. Automation Agent - for workflow automation
6. Analysis Agent - for content analysis and insights

Analyze the user request and determine which agent should handle it. Respond with just the agent name and a brief explanation."""

        payload = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": scenario["prompt"]}
            ],
            "model": "llama-3.3-70b-versatile",
            "max_tokens": 100,
            "temperature": 0.1
        }
        
        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                ai_response = data['choices'][0]['message']['content'].lower()
                
                if scenario["expected_agent"] in ai_response:
                    print(f"✅ CORRECT: AI selected {scenario['expected_agent']} agent")
                    print(f"📝 Response: {ai_response[:80]}...")
                else:
                    print(f"⚠️  UNEXPECTED: Expected {scenario['expected_agent']}, got: {ai_response[:80]}...")
                    
            else:
                print(f"❌ API ERROR: {response.status_code}")
                
        except Exception as e:
            print(f"💥 ERROR: {str(e)}")

if __name__ == "__main__":
    print("🚀 KAiro Browser - GROQ API Integration Test")
    print("=" * 60)
    
    # Test basic API functionality
    success, working_model, response = test_groq_api()
    
    if success:
        print(f"\n✅ GROQ API Integration: WORKING")
        print(f"🎯 Best Model: {working_model}")
        
        # Test agent coordination
        test_agent_coordination()
        
        print(f"\n🎉 INTEGRATION TEST COMPLETE")
        print(f"📊 Status: Ready for KAiro Browser usage")
        
    else:
        print(f"\n❌ GROQ API Integration: FAILED")
        print(f"🔧 Issue: {response}")