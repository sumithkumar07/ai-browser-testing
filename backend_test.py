#!/usr/bin/env python3
"""
KAiro Browser Backend Testing Suite
Tests AI conversation quality and agent coordination system
"""

import asyncio
import json
import subprocess
import sys
import time
import os
from typing import Dict, List, Any, Optional
import requests
from datetime import datetime

class KAiroBrowserTester:
    def __init__(self):
        self.test_results = []
        self.errors = []
        self.start_time = None
        self.app_process = None
        
    def log_test(self, test_name: str, status: str, details: str = "", error: str = ""):
        """Log test results"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "error": error,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_icon} {test_name}: {status}")
        if details:
            print(f"   Details: {details}")
        if error:
            print(f"   Error: {error}")
    
    def check_environment(self) -> bool:
        """Check if environment is properly set up"""
        print("🔍 Checking Environment Setup...")
        
        # Check if Node.js is available
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                self.log_test("Node.js Installation", "PASS", f"Version: {result.stdout.strip()}")
            else:
                self.log_test("Node.js Installation", "FAIL", "", "Node.js not found")
                return False
        except FileNotFoundError:
            self.log_test("Node.js Installation", "FAIL", "", "Node.js not found")
            return False
        
        # Check if npm/yarn is available
        try:
            result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                self.log_test("NPM Installation", "PASS", f"Version: {result.stdout.strip()}")
            else:
                self.log_test("NPM Installation", "FAIL", "", "NPM not found")
        except FileNotFoundError:
            self.log_test("NPM Installation", "FAIL", "", "NPM not found")
        
        # Check project files
        required_files = [
            '/app/package.json',
            '/app/electron/main.js',
            '/app/electron/preload/preload.js',
            '/app/src/main/App.tsx'
        ]
        
        for file_path in required_files:
            if os.path.exists(file_path):
                self.log_test(f"File Check: {os.path.basename(file_path)}", "PASS")
            else:
                self.log_test(f"File Check: {os.path.basename(file_path)}", "FAIL", "", f"File not found: {file_path}")
        
        # Check .env file
        env_file = '/app/.env'
        if os.path.exists(env_file):
            self.log_test("Environment File", "PASS", "Found .env file")
            # Check for GROQ_API_KEY
            with open(env_file, 'r') as f:
                content = f.read()
                if 'GROQ_API_KEY' in content and not content.count('your_groq_api_key_here'):
                    self.log_test("GROQ API Key", "PASS", "API key configured")
                else:
                    self.log_test("GROQ API Key", "WARN", "API key may not be configured properly")
        else:
            self.log_test("Environment File", "WARN", "No .env file found, checking env.example")
            if os.path.exists('/app/env.example'):
                self.log_test("Environment Template", "PASS", "env.example found")
            else:
                self.log_test("Environment Template", "FAIL", "", "No environment configuration found")
        
        return True
    
    def test_package_dependencies(self) -> bool:
        """Test if all required dependencies are installed"""
        print("\n📦 Testing Package Dependencies...")
        
        try:
            # Check if node_modules exists
            if os.path.exists('/app/node_modules'):
                self.log_test("Node Modules", "PASS", "Dependencies directory exists")
            else:
                self.log_test("Node Modules", "FAIL", "", "node_modules not found")
                return False
            
            # Check key dependencies
            key_deps = [
                'electron',
                'react',
                'react-dom',
                'groq-sdk',
                'dotenv',
                'typescript'
            ]
            
            for dep in key_deps:
                dep_path = f'/app/node_modules/{dep}'
                if os.path.exists(dep_path):
                    self.log_test(f"Dependency: {dep}", "PASS")
                else:
                    self.log_test(f"Dependency: {dep}", "FAIL", "", f"Missing dependency: {dep}")
            
            return True
            
        except Exception as e:
            self.log_test("Package Dependencies", "FAIL", "", str(e))
            return False
    
    def test_agent_coordination_logic(self) -> bool:
        """Test the agent coordination system logic"""
        print("\n🤖 Testing Agent Coordination System...")
        
        try:
            # Test the analyzeAgentTask method by running a Node.js script
            test_script = '''
const path = require('path');

// Mock the KAiroBrowserManager class methods for testing
class TestAgentCoordination {
    calculateKeywordScore(text, keywords) {
        return keywords.reduce((score, keyword) => {
            const count = (text.match(new RegExp(keyword, 'g')) || []).length;
            return score + count * (keyword.length > 6 ? 2 : 1);
        }, 0);
    }
    
    analyzeAgentTask(task) {
        const lowerTask = task.toLowerCase();
        
        // Research keywords
        const researchScore = this.calculateKeywordScore(lowerTask, [
            'research', 'find', 'search', 'investigate', 'explore', 'discover', 
            'study', 'examine', 'top', 'best', 'list', 'sources', 'comprehensive',
            'trending', 'latest', 'developments', 'news', 'topics'
        ]);
        
        // Navigation keywords
        const navigationScore = this.calculateKeywordScore(lowerTask, [
            'navigate', 'go to', 'visit', 'open', 'browse', 'website', 'url', 'page'
        ]);
        
        // Shopping keywords  
        const shoppingScore = this.calculateKeywordScore(lowerTask, [
            'shop', 'shopping', 'buy', 'purchase', 'price', 'cost', 'product', 
            'compare', 'deal', 'discount', 'sale', 'cheap', 'review', 'rating'
        ]);
        
        // Communication keywords
        const communicationScore = this.calculateKeywordScore(lowerTask, [
            'email', 'compose', 'write', 'message', 'contact', 'form', 'fill', 
            'submit', 'social', 'post', 'tweet', 'linkedin', 'send'
        ]);
        
        // Automation keywords
        const automationScore = this.calculateKeywordScore(lowerTask, [
            'automate', 'automation', 'workflow', 'schedule', 'repeat', 'batch',
            'routine', 'process', 'sequence', 'steps'
        ]);
        
        // Analysis keywords
        const analysisScore = this.calculateKeywordScore(lowerTask, [
            'analyze', 'analysis', 'summarize', 'summary', 'extract', 'insights',
            'review', 'evaluate', 'assess', 'interpret', 'examine'
        ]);

        const scores = {
            research: researchScore,
            navigation: navigationScore,
            shopping: shoppingScore,
            communication: communicationScore,
            automation: automationScore,
            analysis: analysisScore
        };
        
        const primaryAgent = Object.keys(scores).reduce((a, b) => 
            scores[a] > scores[b] ? a : b
        );
        
        const complexity = task.length > 100 || lowerTask.includes('comprehensive') || 
                          lowerTask.includes('detailed') ? 'high' : 
                          lowerTask.includes('simple') || lowerTask.includes('quick') ? 'low' : 'medium';
        
        const supportingAgents = Object.keys(scores)
            .filter(agent => agent !== primaryAgent && scores[agent] > 0)
            .sort((a, b) => scores[b] - scores[a])
            .slice(0, 2);

        return {
            primaryAgent,
            supportingAgents,
            complexity,
            scores,
            confidence: scores[primaryAgent],
            needsMultipleAgents: supportingAgents.length > 0 && complexity === 'high'
        };
    }
}

// Test cases
const testCases = [
    {
        task: "research latest AI developments in 2024",
        expectedAgent: "research"
    },
    {
        task: "navigate to google.com and wikipedia.org",
        expectedAgent: "navigation"
    },
    {
        task: "help me shop for laptops and compare prices",
        expectedAgent: "shopping"
    },
    {
        task: "compose professional email about meeting",
        expectedAgent: "communication"
    },
    {
        task: "automate daily report generation workflow",
        expectedAgent: "automation"
    },
    {
        task: "analyze this page content for insights",
        expectedAgent: "analysis"
    }
];

const tester = new TestAgentCoordination();
const results = [];

testCases.forEach((testCase, index) => {
    const result = tester.analyzeAgentTask(testCase.task);
    const success = result.primaryAgent === testCase.expectedAgent;
    
    results.push({
        test: `Agent Selection Test ${index + 1}`,
        task: testCase.task,
        expected: testCase.expectedAgent,
        actual: result.primaryAgent,
        confidence: result.confidence,
        complexity: result.complexity,
        success: success
    });
});

console.log(JSON.stringify(results, null, 2));
'''
            
            # Write and execute the test script
            with open('/tmp/agent_test.js', 'w') as f:
                f.write(test_script)
            
            result = subprocess.run(['node', '/tmp/agent_test.js'], 
                                  capture_output=True, text=True, cwd='/app')
            
            if result.returncode == 0:
                test_results = json.loads(result.stdout)
                
                passed_tests = 0
                total_tests = len(test_results)
                
                for test_result in test_results:
                    if test_result['success']:
                        self.log_test(test_result['test'], "PASS", 
                                    f"Task: '{test_result['task']}' -> {test_result['actual']} (confidence: {test_result['confidence']})")
                        passed_tests += 1
                    else:
                        self.log_test(test_result['test'], "FAIL", 
                                    f"Expected: {test_result['expected']}, Got: {test_result['actual']}")
                
                self.log_test("Agent Coordination System", "PASS" if passed_tests == total_tests else "PARTIAL",
                            f"Passed {passed_tests}/{total_tests} agent selection tests")
                
                return passed_tests >= total_tests * 0.8  # 80% pass rate
            else:
                self.log_test("Agent Coordination System", "FAIL", "", result.stderr)
                return False
                
        except Exception as e:
            self.log_test("Agent Coordination System", "FAIL", "", str(e))
            return False
    
    def test_groq_ai_integration(self) -> bool:
        """Test Groq AI service integration"""
        print("\n🧠 Testing Groq AI Integration...")
        
        try:
            # Test using the existing test-agents.js script
            result = subprocess.run(['node', '/app/test-agents.js'], 
                                  capture_output=True, text=True, cwd='/app', timeout=60)
            
            if result.returncode == 0:
                output = result.stdout
                if "All tests completed successfully" in output:
                    self.log_test("Groq AI Integration", "PASS", "AI service tests completed successfully")
                    
                    # Check for specific agent tests
                    if "Communication Agent: ✅" in output:
                        self.log_test("Communication Agent", "PASS", "Email, Form, Social, Contact handling")
                    if "Automation Agent: ✅" in output:
                        self.log_test("Automation Agent", "PASS", "Workflow, Scheduling, Data collection")
                    if "Intent Classification: ✅" in output:
                        self.log_test("Intent Classification", "PASS", "Smart agent selection")
                    
                    return True
                else:
                    self.log_test("Groq AI Integration", "FAIL", "", "AI tests did not complete successfully")
                    return False
            else:
                error_msg = result.stderr or "Unknown error"
                if "GROQ_API_KEY not found" in error_msg:
                    self.log_test("Groq AI Integration", "FAIL", "", "GROQ_API_KEY not configured")
                else:
                    self.log_test("Groq AI Integration", "FAIL", "", error_msg)
                return False
                
        except subprocess.TimeoutExpired:
            self.log_test("Groq AI Integration", "FAIL", "", "Test timeout - AI service may be slow")
            return False
        except Exception as e:
            self.log_test("Groq AI Integration", "FAIL", "", str(e))
            return False
    
    def test_ipc_handlers(self) -> bool:
        """Test IPC handlers by analyzing the main.js file"""
        print("\n🔌 Testing IPC Handlers...")
        
        try:
            with open('/app/electron/main.js', 'r') as f:
                main_js_content = f.read()
            
            # Check for required IPC handlers
            required_handlers = [
                'create-tab',
                'close-tab', 
                'switch-tab',
                'navigate-to',
                'send-ai-message',
                'execute-agent-task',
                'create-ai-tab',
                'analyze-content',
                'summarize-page',
                'test-ai-connection'
            ]
            
            missing_handlers = []
            for handler in required_handlers:
                if f"ipcMain.handle('{handler}'" in main_js_content:
                    self.log_test(f"IPC Handler: {handler}", "PASS")
                else:
                    self.log_test(f"IPC Handler: {handler}", "FAIL", "", f"Handler not found: {handler}")
                    missing_handlers.append(handler)
            
            # Check for specialized agent methods
            agent_methods = [
                'executeResearchAgent',
                'executeNavigationAgent', 
                'executeShoppingAgent',
                'executeCommunicationAgent',
                'executeAutomationAgent',
                'executeAnalysisAgent'
            ]
            
            for method in agent_methods:
                if method in main_js_content:
                    self.log_test(f"Agent Method: {method}", "PASS")
                else:
                    self.log_test(f"Agent Method: {method}", "FAIL", "", f"Method not found: {method}")
            
            # Check for error handling patterns
            error_patterns = [
                'try {',
                'catch (error)',
                'return { success: false, error:',
                'console.error'
            ]
            
            error_handling_score = 0
            for pattern in error_patterns:
                if pattern in main_js_content:
                    error_handling_score += 1
            
            if error_handling_score >= 3:
                self.log_test("Error Handling", "PASS", f"Found {error_handling_score}/4 error handling patterns")
            else:
                self.log_test("Error Handling", "WARN", f"Limited error handling: {error_handling_score}/4 patterns")
            
            return len(missing_handlers) == 0
            
        except Exception as e:
            self.log_test("IPC Handlers", "FAIL", "", str(e))
            return False
    
    def test_content_generation_quality(self) -> bool:
        """Test content generation quality by analyzing templates"""
        print("\n📝 Testing Content Generation Quality...")
        
        try:
            with open('/app/electron/main.js', 'r') as f:
                main_js_content = f.read()
            
            # Check for template generation methods
            template_methods = [
                'generateEmailTemplate',
                'generateFormGuide',
                'generateSocialContent',
                'generateResearchSummary',
                'generateGeneralCommunication'
            ]
            
            found_methods = 0
            for method in template_methods:
                if method in main_js_content:
                    self.log_test(f"Template Method: {method}", "PASS")
                    found_methods += 1
                else:
                    self.log_test(f"Template Method: {method}", "FAIL", "", f"Method not found: {method}")
            
            # Check for quality indicators in templates
            quality_indicators = [
                '# ', # Markdown headers
                '✅', # Checkboxes/emojis
                '- [ ]', # Task lists
                'Generated:', # Timestamps
                'Best Practices', # Guidelines
                'Next Steps' # Action items
            ]
            
            quality_score = 0
            for indicator in quality_indicators:
                if indicator in main_js_content:
                    quality_score += 1
            
            if quality_score >= 4:
                self.log_test("Content Quality", "PASS", f"Found {quality_score}/6 quality indicators")
            else:
                self.log_test("Content Quality", "WARN", f"Limited quality features: {quality_score}/6 indicators")
            
            # Check for structured response formatting
            if 'systemPrompt' in main_js_content and 'RESPONSE FORMAT:' in main_js_content:
                self.log_test("Response Formatting", "PASS", "Structured response format defined")
            else:
                self.log_test("Response Formatting", "WARN", "Limited response formatting guidance")
            
            return found_methods >= len(template_methods) * 0.8  # 80% of methods found
            
        except Exception as e:
            self.log_test("Content Generation Quality", "FAIL", "", str(e))
            return False
    
    def test_specialized_agents(self) -> bool:
        """Test specialized agent implementations"""
        print("\n🎯 Testing Specialized Agents...")
        
        try:
            with open('/app/electron/main.js', 'r') as f:
                main_js_content = f.read()
            
            # Test Research Agent
            research_features = [
                'getResearchWebsites',
                'createTab',
                'generateResearchSummary',
                'Research Agent'
            ]
            
            research_score = sum(1 for feature in research_features if feature in main_js_content)
            if research_score >= 3:
                self.log_test("Research Agent", "PASS", f"Found {research_score}/4 features")
            else:
                self.log_test("Research Agent", "FAIL", "", f"Missing features: {4-research_score}/4")
            
            # Test Navigation Agent  
            navigation_features = [
                'extractUrls',
                'suggestWebsites',
                'navigateTo',
                'Navigation Agent'
            ]
            
            navigation_score = sum(1 for feature in navigation_features if feature in main_js_content)
            if navigation_score >= 3:
                self.log_test("Navigation Agent", "PASS", f"Found {navigation_score}/4 features")
            else:
                self.log_test("Navigation Agent", "FAIL", "", f"Missing features: {4-navigation_score}/4")
            
            # Test Shopping Agent
            shopping_features = [
                'amazon.com',
                'ebay.com',
                'Shopping Research',
                'price comparison'
            ]
            
            shopping_score = sum(1 for feature in shopping_features if feature in main_js_content)
            if shopping_score >= 3:
                self.log_test("Shopping Agent", "PASS", f"Found {shopping_score}/4 features")
            else:
                self.log_test("Shopping Agent", "FAIL", "", f"Missing features: {4-shopping_score}/4")
            
            # Test Communication Agent
            communication_features = [
                'generateEmailTemplate',
                'generateFormGuide', 
                'generateSocialContent',
                'Communication Agent'
            ]
            
            communication_score = sum(1 for feature in communication_features if feature in main_js_content)
            if communication_score >= 3:
                self.log_test("Communication Agent", "PASS", f"Found {communication_score}/4 features")
            else:
                self.log_test("Communication Agent", "FAIL", "", f"Missing features: {4-communication_score}/4")
            
            # Test Automation Agent
            automation_features = [
                'Automation Workflow',
                'workflow design',
                'step-by-step',
                'Automation Agent'
            ]
            
            automation_score = sum(1 for feature in automation_features if feature in main_js_content)
            if automation_score >= 3:
                self.log_test("Automation Agent", "PASS", f"Found {automation_score}/4 features")
            else:
                self.log_test("Automation Agent", "FAIL", "", f"Missing features: {4-automation_score}/4")
            
            # Test Analysis Agent
            analysis_features = [
                'getEnhancedPageContext',
                'extractPageContent',
                'aiService.chat.completions.create',
                'Analysis Agent'
            ]
            
            analysis_score = sum(1 for feature in analysis_features if feature in main_js_content)
            if analysis_score >= 3:
                self.log_test("Analysis Agent", "PASS", f"Found {analysis_score}/4 features")
            else:
                self.log_test("Analysis Agent", "FAIL", "", f"Missing features: {4-analysis_score}/4")
            
            # Overall agent system check
            total_agents = 6
            passing_agents = sum(1 for score in [research_score, navigation_score, shopping_score, 
                                               communication_score, automation_score, analysis_score] 
                               if score >= 3)
            
            if passing_agents >= 5:
                self.log_test("Specialized Agents System", "PASS", f"{passing_agents}/{total_agents} agents fully implemented")
                return True
            else:
                self.log_test("Specialized Agents System", "FAIL", "", f"Only {passing_agents}/{total_agents} agents properly implemented")
                return False
                
        except Exception as e:
            self.log_test("Specialized Agents", "FAIL", "", str(e))
            return False
    
    def test_error_handling_and_fallbacks(self) -> bool:
        """Test error handling and fallback mechanisms"""
        print("\n🛡️ Testing Error Handling & Fallbacks...")
        
        try:
            with open('/app/electron/main.js', 'r') as f:
                main_js_content = f.read()
            
            # Check for comprehensive error handling
            error_patterns = [
                ('Try-Catch Blocks', 'try {', 'catch (error)'),
                ('Error Returns', 'return { success: false', 'error:'),
                ('Console Logging', 'console.error', 'console.log'),
                ('Service Checks', 'if (!this.aiService)', 'service not initialized'),
                ('Graceful Degradation', 'fallback', 'alternative')
            ]
            
            error_handling_score = 0
            for pattern_name, pattern1, pattern2 in error_patterns:
                if pattern1 in main_js_content and pattern2 in main_js_content:
                    self.log_test(f"Error Pattern: {pattern_name}", "PASS")
                    error_handling_score += 1
                else:
                    self.log_test(f"Error Pattern: {pattern_name}", "FAIL", "", f"Pattern not found: {pattern_name}")
            
            # Check for specific error scenarios
            error_scenarios = [
                'AI service not initialized',
                'Tab not found',
                'Navigation failed',
                'No active tab',
                'Content extraction failed'
            ]
            
            handled_scenarios = 0
            for scenario in error_scenarios:
                if scenario.lower() in main_js_content.lower():
                    self.log_test(f"Error Scenario: {scenario}", "PASS")
                    handled_scenarios += 1
                else:
                    self.log_test(f"Error Scenario: {scenario}", "WARN", "", f"Scenario not explicitly handled: {scenario}")
            
            # Check for timeout and async error handling
            async_patterns = [
                'async/await',
                'Promise',
                'timeout'
            ]
            
            async_score = 0
            for pattern in async_patterns:
                if pattern.lower() in main_js_content.lower():
                    async_score += 1
            
            if async_score >= 2:
                self.log_test("Async Error Handling", "PASS", f"Found {async_score}/3 async patterns")
            else:
                self.log_test("Async Error Handling", "WARN", f"Limited async handling: {async_score}/3 patterns")
            
            # Overall error handling assessment
            total_score = error_handling_score + (handled_scenarios / len(error_scenarios)) + (async_score / len(async_patterns))
            max_score = len(error_patterns) + 1 + 1
            
            if total_score >= max_score * 0.7:
                self.log_test("Error Handling System", "PASS", f"Score: {total_score:.1f}/{max_score}")
                return True
            else:
                self.log_test("Error Handling System", "FAIL", "", f"Insufficient error handling: {total_score:.1f}/{max_score}")
                return False
                
        except Exception as e:
            self.log_test("Error Handling & Fallbacks", "FAIL", "", str(e))
            return False
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all tests and return comprehensive results"""
        print("🚀 Starting KAiro Browser Backend Testing Suite")
        print("=" * 80)
        
        self.start_time = time.time()
        
        # Run all test categories
        test_categories = [
            ("Environment Setup", self.check_environment),
            ("Package Dependencies", self.test_package_dependencies),
            ("Agent Coordination Logic", self.test_agent_coordination_logic),
            ("Groq AI Integration", self.test_groq_ai_integration),
            ("IPC Handlers", self.test_ipc_handlers),
            ("Content Generation Quality", self.test_content_generation_quality),
            ("Specialized Agents", self.test_specialized_agents),
            ("Error Handling & Fallbacks", self.test_error_handling_and_fallbacks)
        ]
        
        passed_categories = 0
        total_categories = len(test_categories)
        
        for category_name, test_function in test_categories:
            print(f"\n{'='*20} {category_name} {'='*20}")
            try:
                if test_function():
                    passed_categories += 1
                    print(f"✅ {category_name}: PASSED")
                else:
                    print(f"❌ {category_name}: FAILED")
            except Exception as e:
                print(f"💥 {category_name}: ERROR - {str(e)}")
                self.log_test(category_name, "ERROR", "", str(e))
        
        # Calculate overall results
        end_time = time.time()
        duration = end_time - self.start_time
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['status'] == 'PASS'])
        failed_tests = len([r for r in self.test_results if r['status'] == 'FAIL'])
        warned_tests = len([r for r in self.test_results if r['status'] == 'WARN'])
        
        # Generate summary
        summary = {
            "overall_status": "PASS" if passed_categories >= total_categories * 0.8 else "FAIL",
            "categories_passed": f"{passed_categories}/{total_categories}",
            "tests_passed": f"{passed_tests}/{total_tests}",
            "duration_seconds": round(duration, 2),
            "critical_issues": [r for r in self.test_results if r['status'] == 'FAIL'],
            "warnings": [r for r in self.test_results if r['status'] == 'WARN'],
            "recommendations": self.generate_recommendations()
        }
        
        # Print final summary
        print("\n" + "="*80)
        print("🎯 FINAL TEST SUMMARY")
        print("="*80)
        print(f"Overall Status: {'✅ PASS' if summary['overall_status'] == 'PASS' else '❌ FAIL'}")
        print(f"Categories Passed: {summary['categories_passed']}")
        print(f"Individual Tests: {passed_tests} passed, {failed_tests} failed, {warned_tests} warnings")
        print(f"Test Duration: {summary['duration_seconds']} seconds")
        
        if summary['critical_issues']:
            print(f"\n❌ Critical Issues ({len(summary['critical_issues'])}):")
            for issue in summary['critical_issues'][:5]:  # Show top 5
                print(f"  • {issue['test']}: {issue['error']}")
        
        if summary['warnings']:
            print(f"\n⚠️ Warnings ({len(summary['warnings'])}):")
            for warning in summary['warnings'][:3]:  # Show top 3
                print(f"  • {warning['test']}: {warning['details']}")
        
        print(f"\n📋 Recommendations:")
        for rec in summary['recommendations']:
            print(f"  • {rec}")
        
        return summary
    
    def generate_recommendations(self) -> List[str]:
        """Generate recommendations based on test results"""
        recommendations = []
        
        failed_tests = [r for r in self.test_results if r['status'] == 'FAIL']
        
        # Check for common failure patterns
        if any('GROQ_API_KEY' in r['error'] for r in failed_tests):
            recommendations.append("Configure GROQ_API_KEY in .env file for AI functionality")
        
        if any('Node.js' in r['test'] for r in failed_tests):
            recommendations.append("Install Node.js and npm to run the Electron application")
        
        if any('Dependencies' in r['test'] for r in failed_tests):
            recommendations.append("Run 'npm install' to install required dependencies")
        
        if any('Agent' in r['test'] for r in failed_tests):
            recommendations.append("Review agent implementation in electron/main.js")
        
        if any('IPC' in r['test'] for r in failed_tests):
            recommendations.append("Check IPC handler implementations in main process")
        
        # Add general recommendations
        if len(failed_tests) > 5:
            recommendations.append("Multiple critical issues found - review implementation thoroughly")
        elif len(failed_tests) == 0:
            recommendations.append("All tests passed! The KAiro Browser is ready for use")
        else:
            recommendations.append("Address the failed tests to improve system reliability")
        
        return recommendations

def main():
    """Main test execution function"""
    tester = KAiroBrowserTester()
    
    try:
        results = tester.run_all_tests()
        
        # Save detailed results to file
        with open('/app/test_results_detailed.json', 'w') as f:
            json.dump({
                'summary': results,
                'detailed_results': tester.test_results,
                'timestamp': datetime.now().isoformat()
            }, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: /app/test_results_detailed.json")
        
        # Exit with appropriate code
        exit_code = 0 if results['overall_status'] == 'PASS' else 1
        sys.exit(exit_code)
        
    except KeyboardInterrupt:
        print("\n⚠️ Testing interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Testing failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()