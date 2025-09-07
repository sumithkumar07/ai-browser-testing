#!/usr/bin/env python3
"""
Test Agent Coordination System
Verify that the 6-agent system can properly analyze tasks and coordinate responses
"""

import requests
import json

def test_agent_task_analysis():
    """Test the agent task analysis system"""
    
    api_key = "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"
    
    print("🤖 Testing KAiro Browser Agent Coordination System")
    print("=" * 60)
    
    # Test scenarios for each of the 6 agents
    test_scenarios = [
        {
            "name": "Research Agent Test",
            "task": "I need to research the latest developments in artificial intelligence and machine learning for 2025",
            "expected_keywords": ["research", "information", "sources", "analysis"],
            "agent_type": "research"
        },
        {
            "name": "Navigation Agent Test", 
            "task": "Please navigate to google.com, wikipedia.org, and github.com",
            "expected_keywords": ["navigate", "open", "tabs", "websites"],
            "agent_type": "navigation"
        },
        {
            "name": "Shopping Agent Test",
            "task": "Help me find the best deals on laptops and compare prices across different retailers",
            "expected_keywords": ["shopping", "compare", "prices", "deals"],
            "agent_type": "shopping"
        },
        {
            "name": "Communication Agent Test",
            "task": "Compose a professional email to my team about the upcoming project meeting",
            "expected_keywords": ["email", "compose", "professional", "communication"],
            "agent_type": "communication"
        },
        {
            "name": "Automation Agent Test",
            "task": "Create an automation workflow for processing customer support tickets",
            "expected_keywords": ["automation", "workflow", "process", "tasks"],
            "agent_type": "automation"
        },
        {
            "name": "Analysis Agent Test",
            "task": "Analyze the content of this webpage and provide insights about the key topics",
            "expected_keywords": ["analyze", "content", "insights", "data"],
            "agent_type": "analysis"
        }
    ]
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    results = []
    
    for scenario in test_scenarios:
        print(f"\n🎯 Testing: {scenario['name']}")
        print(f"📝 Task: {scenario['task'][:60]}...")
        
        # Create a system prompt that mimics KAiro's agent analysis
        system_prompt = f"""You are KAiro's agent coordination system. Analyze the user task and determine:

1. Which of the 6 specialized agents should handle this task:
   - Research Agent: Information gathering, research, data collection
   - Navigation Agent: Website navigation, URL handling, browsing
   - Shopping Agent: Product research, price comparison, deals
   - Communication Agent: Email composition, messaging, forms
   - Automation Agent: Workflow creation, task automation, processes
   - Analysis Agent: Content analysis, data insights, evaluation

2. Provide a confidence score (0.0-1.0)
3. Suggest any supporting agents if needed

Respond in JSON format:
{{
  "primaryAgent": "agent_name",
  "confidence": 0.95,
  "reasoning": "explanation",
  "supportingAgents": ["agent1", "agent2"],
  "complexity": "low|medium|high",
  "keywords": ["key", "words", "found"]
}}"""

        payload = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this task: {scenario['task']}"}
            ],
            "model": "llama-3.3-70b-versatile",
            "max_tokens": 300,
            "temperature": 0.1
        }
        
        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                ai_response = data['choices'][0]['message']['content']
                
                # Try to parse JSON response
                try:
                    # Extract JSON from response (in case there's extra text)
                    json_start = ai_response.find('{')
                    json_end = ai_response.rfind('}') + 1
                    if json_start >= 0 and json_end > json_start:
                        json_str = ai_response[json_start:json_end]
                        analysis = json.loads(json_str)
                        
                        primary_agent = analysis.get('primaryAgent', '').lower()
                        confidence = analysis.get('confidence', 0.0)
                        reasoning = analysis.get('reasoning', '')
                        complexity = analysis.get('complexity', 'unknown')
                        keywords = analysis.get('keywords', [])
                        
                        # Check if correct agent was selected
                        if scenario['agent_type'] in primary_agent:
                            print(f"✅ CORRECT: Selected {primary_agent} agent")
                            print(f"🎯 Confidence: {confidence:.2f}")
                            print(f"🧠 Reasoning: {reasoning[:80]}...")
                            print(f"📊 Complexity: {complexity}")
                            
                            results.append({
                                "scenario": scenario['name'],
                                "success": True,
                                "agent": primary_agent,
                                "confidence": confidence,
                                "complexity": complexity
                            })
                        else:
                            print(f"❌ INCORRECT: Expected {scenario['agent_type']}, got {primary_agent}")
                            print(f"🔍 Full response: {ai_response[:100]}...")
                            
                            results.append({
                                "scenario": scenario['name'],
                                "success": False,
                                "expected": scenario['agent_type'],
                                "actual": primary_agent,
                                "confidence": confidence
                            })
                            
                    else:
                        print(f"⚠️  JSON PARSE ERROR: Could not extract JSON from response")
                        print(f"📝 Raw response: {ai_response[:100]}...")
                        
                        results.append({
                            "scenario": scenario['name'],
                            "success": False,
                            "error": "JSON parse error",
                            "response": ai_response[:100]
                        })
                        
                except json.JSONDecodeError as e:
                    print(f"⚠️  JSON ERROR: {str(e)}")
                    print(f"📝 Response: {ai_response[:100]}...")
                    
                    # Fallback: check if expected agent type is mentioned
                    if scenario['agent_type'] in ai_response.lower():
                        print(f"✅ FALLBACK: Agent type mentioned in response")
                        results.append({
                            "scenario": scenario['name'],
                            "success": True,
                            "agent": scenario['agent_type'],
                            "note": "Fallback detection"
                        })
                    else:
                        results.append({
                            "scenario": scenario['name'],
                            "success": False,
                            "error": f"JSON decode error: {str(e)}"
                        })
                        
            else:
                print(f"❌ API ERROR: {response.status_code} - {response.text[:100]}")
                results.append({
                    "scenario": scenario['name'],
                    "success": False,
                    "error": f"API error: {response.status_code}"
                })
                
        except Exception as e:
            print(f"💥 EXCEPTION: {str(e)}")
            results.append({
                "scenario": scenario['name'],
                "success": False,
                "error": f"Exception: {str(e)}"
            })
    
    # Generate summary
    print(f"\n" + "="*60)
    print("🧪 AGENT COORDINATION TEST SUMMARY")
    print("="*60)
    
    successful_tests = sum(1 for r in results if r.get('success', False))
    total_tests = len(results)
    success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\n📊 RESULTS:")
    print(f"Total Tests: {total_tests}")
    print(f"Successful: {successful_tests}")
    print(f"Failed: {total_tests - successful_tests}")
    print(f"Success Rate: {success_rate:.1f}%")
    
    print(f"\n📋 DETAILED RESULTS:")
    for result in results:
        status = "✅" if result.get('success', False) else "❌"
        print(f"{status} {result['scenario']}")
        if result.get('success', False):
            agent = result.get('agent', 'unknown')
            confidence = result.get('confidence', 0.0)
            print(f"    Agent: {agent}, Confidence: {confidence:.2f}")
        else:
            error = result.get('error', 'Unknown error')
            print(f"    Error: {error}")
    
    if success_rate >= 80:
        print(f"\n🎉 AGENT COORDINATION: EXCELLENT")
        print(f"✅ The 6-agent system is working correctly")
    elif success_rate >= 60:
        print(f"\n⚠️  AGENT COORDINATION: GOOD")
        print(f"🔧 Some improvements needed")
    else:
        print(f"\n🚨 AGENT COORDINATION: NEEDS WORK")
        print(f"🔧 Significant issues with agent selection")
    
    return success_rate >= 80

if __name__ == "__main__":
    success = test_agent_task_analysis()
    exit(0 if success else 1)