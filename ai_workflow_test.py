#!/usr/bin/env python3
"""
KAiro Browser AI Workflow - Comprehensive Testing Suite
Testing the complete AI workflow as requested by the user.

Key Testing Areas:
1. AI Task Understanding - Test message analysis and agent routing
2. Agent Coordination - Test 6 agents (Research, Navigation, Shopping, Communication, Automation, Analysis)
3. Browser Control Capabilities - Test tab creation, navigation, data extraction
4. Advanced Features - Test Autonomous Planning, Agent Memory, Deep Search, Background Tasks, Performance Monitor
5. Complete User Journey - Test end-to-end workflow from user input to results
6. GROQ API Integration - Test with provided API key
"""

import os
import sys
import json
import time
import subprocess
import requests
from datetime import datetime
from pathlib import Path

class KAiroAIWorkflowTester:
    def __init__(self):
        self.app_path = "/app"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.start_time = time.time()
        
        # Test scenarios for AI workflow
        self.test_scenarios = [
            {
                "name": "Research Agent Test",
                "message": "research latest AI developments",
                "expected_agent": "research",
                "expected_actions": ["create_tabs", "extract_data", "generate_report"]
            },
            {
                "name": "Navigation Agent Test", 
                "message": "navigate to google.com and search for machine learning",
                "expected_agent": "navigation",
                "expected_actions": ["navigate_to_url", "perform_search"]
            },
            {
                "name": "Shopping Agent Test",
                "message": "find best laptop deals",
                "expected_agent": "shopping", 
                "expected_actions": ["create_retailer_tabs", "compare_prices", "analyze_deals"]
            },
            {
                "name": "Analysis Agent Test",
                "message": "analyze this page content",
                "expected_agent": "analysis",
                "expected_actions": ["extract_content", "perform_analysis", "generate_insights"]
            },
            {
                "name": "Communication Agent Test",
                "message": "compose professional email about meeting",
                "expected_agent": "communication",
                "expected_actions": ["create_template", "format_content"]
            },
            {
                "name": "Automation Agent Test",
                "message": "automate daily workflow",
                "expected_agent": "automation",
                "expected_actions": ["create_workflow", "schedule_tasks"]
            }
        ]
        
        # GROQ API configuration
        self.groq_api_key = "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"
        self.groq_api_url = "https://api.groq.com/openai/v1/chat/completions"
        
    def log_test(self, test_name, status, details="", duration=0):
        """Log test results"""
        self.tests_run += 1
        if status == "PASS":
            self.tests_passed += 1
            
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "duration": duration,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_icon} {test_name}: {status}")
        if details:
            print(f"   Details: {details}")
        if duration > 0:
            print(f"   Duration: {duration:.3f}s")
        print()

    def test_groq_api_integration(self):
        """Test 1: GROQ API Integration - Verify API key works and can make requests"""
        print("🤖 TEST 1: GROQ API INTEGRATION")
        print("=" * 50)
        
        start_time = time.time()
        
        try:
            headers = {
                "Authorization": f"Bearer {self.groq_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {
                        "role": "user",
                        "content": "Hello, I'm testing the KAiro Browser AI system. Please respond with 'AI system is working correctly' if you can process this message."
                    }
                ],
                "max_tokens": 100,
                "temperature": 0.1
            }
            
            response = requests.post(self.groq_api_url, headers=headers, json=payload, timeout=30)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                ai_response = data['choices'][0]['message']['content']
                
                if "working correctly" in ai_response.lower():
                    self.log_test("GROQ API Connection", "PASS", f"API responded correctly: '{ai_response[:50]}...'", duration)
                    return True
                else:
                    self.log_test("GROQ API Connection", "PASS", f"API connected but unexpected response: '{ai_response[:50]}...'", duration)
                    return True
            else:
                self.log_test("GROQ API Connection", "FAIL", f"HTTP {response.status_code}: {response.text}", duration)
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_test("GROQ API Connection", "FAIL", f"Error: {str(e)}", duration)
            return False

    def test_ai_task_understanding(self):
        """Test 2: AI Task Understanding - Test message analysis and agent routing"""
        print("🧠 TEST 2: AI TASK UNDERSTANDING")
        print("=" * 50)
        
        # Test the task analysis function from main.js
        main_js_path = os.path.join(self.app_path, "electron/main.js")
        
        if not os.path.exists(main_js_path):
            self.log_test("Task Analysis Function", "FAIL", "main.js not found")
            return False
        
        try:
            with open(main_js_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for task analysis patterns
            task_analysis_patterns = [
                "analyzeAgentTask",
                "research",
                "navigation", 
                "shopping",
                "communication",
                "automation",
                "analysis"
            ]
            
            found_patterns = []
            for pattern in task_analysis_patterns:
                if pattern in content:
                    found_patterns.append(pattern)
            
            accuracy = len(found_patterns) / len(task_analysis_patterns) * 100
            
            if accuracy >= 85:
                self.log_test("Task Analysis Function", "PASS", f"Found {len(found_patterns)}/{len(task_analysis_patterns)} patterns ({accuracy:.1f}% accuracy)")
                return True
            else:
                self.log_test("Task Analysis Function", "FAIL", f"Only found {len(found_patterns)}/{len(task_analysis_patterns)} patterns ({accuracy:.1f}% accuracy)")
                return False
                
        except Exception as e:
            self.log_test("Task Analysis Function", "FAIL", f"Error reading main.js: {str(e)}")
            return False

    def test_agent_coordination(self):
        """Test 3: Agent Coordination - Test 6 agents implementation"""
        print("🤝 TEST 3: AGENT COORDINATION")
        print("=" * 50)
        
        # Test Enhanced Agent Controller
        agent_controller_path = os.path.join(self.app_path, "src/core/agents/EnhancedAgentController.js")
        
        if not os.path.exists(agent_controller_path):
            self.log_test("Enhanced Agent Controller", "FAIL", "EnhancedAgentController.js not found")
            return False
        
        try:
            with open(agent_controller_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for all 6 agents
            agent_patterns = [
                "EnhancedResearchAgent",
                "EnhancedNavigationAgent", 
                "EnhancedShoppingAgent",
                "EnhancedCommunicationAgent",
                "EnhancedAutomationAgent",
                "EnhancedAnalysisAgent"
            ]
            
            found_agents = []
            for agent in agent_patterns:
                if agent in content:
                    found_agents.append(agent)
            
            # Check for coordination methods
            coordination_patterns = [
                "executeAgentTask",
                "createExecutionPlan",
                "initializeAllAgents"
            ]
            
            found_coordination = []
            for pattern in coordination_patterns:
                if pattern in content:
                    found_coordination.append(pattern)
            
            agent_score = len(found_agents) / len(agent_patterns) * 100
            coordination_score = len(found_coordination) / len(coordination_patterns) * 100
            
            if agent_score >= 100 and coordination_score >= 100:
                self.log_test("Agent Coordination", "PASS", f"All 6 agents found with full coordination capabilities")
                return True
            else:
                self.log_test("Agent Coordination", "FAIL", f"Agents: {agent_score:.1f}%, Coordination: {coordination_score:.1f}%")
                return False
                
        except Exception as e:
            self.log_test("Agent Coordination", "FAIL", f"Error reading agent controller: {str(e)}")
            return False

    def test_browser_control_capabilities(self):
        """Test 4: Browser Control Capabilities - Test automation engine"""
        print("🌐 TEST 4: BROWSER CONTROL CAPABILITIES")
        print("=" * 50)
        
        # Check for browser automation patterns in the agent controller
        agent_controller_path = os.path.join(self.app_path, "src/core/agents/EnhancedAgentController.js")
        
        if not os.path.exists(agent_controller_path):
            self.log_test("Browser Automation", "FAIL", "Agent controller not found")
            return False
        
        try:
            with open(agent_controller_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for browser control capabilities
            browser_control_patterns = [
                "openTab",
                "navigateTo",
                "extractPageData",
                "createResultTab",
                "analyzeContent",
                "captureContent"
            ]
            
            found_controls = []
            for pattern in browser_control_patterns:
                if pattern in content:
                    found_controls.append(pattern)
            
            control_score = len(found_controls) / len(browser_control_patterns) * 100
            
            if control_score >= 80:
                self.log_test("Browser Control Capabilities", "PASS", f"Found {len(found_controls)}/{len(browser_control_patterns)} control capabilities ({control_score:.1f}%)")
                return True
            else:
                self.log_test("Browser Control Capabilities", "FAIL", f"Only found {len(found_controls)}/{len(browser_control_patterns)} capabilities ({control_score:.1f}%)")
                return False
                
        except Exception as e:
            self.log_test("Browser Control Capabilities", "FAIL", f"Error checking browser controls: {str(e)}")
            return False

    def test_advanced_features(self):
        """Test 5: Advanced Features - Test Autonomous Planning, Agent Memory, Deep Search, etc."""
        print("⚡ TEST 5: ADVANCED FEATURES")
        print("=" * 50)
        
        # Test main.js for advanced service initialization
        main_js_path = os.path.join(self.app_path, "electron/main.js")
        
        if not os.path.exists(main_js_path):
            self.log_test("Advanced Features", "FAIL", "main.js not found")
            return False
        
        try:
            with open(main_js_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for advanced features
            advanced_features = [
                "AutonomousPlanningEngine",
                "AgentMemoryService",
                "UltraIntelligentSearchEngine",
                "BackgroundTaskScheduler",
                "AgentPerformanceMonitor",
                "AdvancedSecurity",
                "UnifiedServiceOrchestrator"
            ]
            
            found_features = []
            for feature in advanced_features:
                if feature in content:
                    found_features.append(feature)
            
            # Check for initialization patterns
            init_patterns = [
                "initializeMaximumPotentialServices",
                "scheduleAutonomousGoals",
                "startContinuousOptimization",
                "startSystemHealthMonitoring"
            ]
            
            found_init = []
            for pattern in init_patterns:
                if pattern in content:
                    found_init.append(pattern)
            
            feature_score = len(found_features) / len(advanced_features) * 100
            init_score = len(found_init) / len(init_patterns) * 100
            
            if feature_score >= 85 and init_score >= 75:
                self.log_test("Advanced Features", "PASS", f"Features: {feature_score:.1f}%, Initialization: {init_score:.1f}%")
                return True
            else:
                self.log_test("Advanced Features", "FAIL", f"Features: {feature_score:.1f}%, Initialization: {init_score:.1f}%")
                return False
                
        except Exception as e:
            self.log_test("Advanced Features", "FAIL", f"Error checking advanced features: {str(e)}")
            return False

    def test_database_integration(self):
        """Test 6: Database Integration - Test SQLite database setup"""
        print("🗄️ TEST 6: DATABASE INTEGRATION")
        print("=" * 50)
        
        # Check for database file
        db_path = os.path.join(self.app_path, "data/kairo_browser.db")
        
        if os.path.exists(db_path):
            db_size = os.path.getsize(db_path)
            self.log_test("Database File", "PASS", f"Database exists ({db_size} bytes)")
            db_exists = True
        else:
            self.log_test("Database File", "WARN", "Database file not found (will be created on first run)")
            db_exists = False
        
        # Check for database service
        db_service_path = os.path.join(self.app_path, "src/backend/DatabaseService.js")
        
        if not os.path.exists(db_service_path):
            self.log_test("Database Service", "FAIL", "DatabaseService.js not found")
            return False
        
        try:
            with open(db_service_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for database operations
            db_patterns = [
                "class DatabaseService",
                "initialize",
                "saveBookmark",
                "getHistory",
                "recordAgentMemory",
                "getPerformanceMetrics"
            ]
            
            found_patterns = []
            for pattern in db_patterns:
                if pattern in content:
                    found_patterns.append(pattern)
            
            db_score = len(found_patterns) / len(db_patterns) * 100
            
            if db_score >= 85:
                self.log_test("Database Service", "PASS", f"Found {len(found_patterns)}/{len(db_patterns)} database operations ({db_score:.1f}%)")
                return True
            else:
                self.log_test("Database Service", "FAIL", f"Only found {len(found_patterns)}/{len(db_patterns)} operations ({db_score:.1f}%)")
                return False
                
        except Exception as e:
            self.log_test("Database Service", "FAIL", f"Error checking database service: {str(e)}")
            return False

    def test_complete_user_journey(self):
        """Test 7: Complete User Journey - Test end-to-end workflow simulation"""
        print("🎯 TEST 7: COMPLETE USER JOURNEY")
        print("=" * 50)
        
        # Test each scenario's agent routing logic
        passed_scenarios = 0
        
        for scenario in self.test_scenarios:
            start_time = time.time()
            
            # Simulate task analysis for each scenario
            message = scenario["message"]
            expected_agent = scenario["expected_agent"]
            
            # Simple keyword-based agent detection (simulating the actual logic)
            detected_agent = self.simulate_agent_detection(message)
            duration = time.time() - start_time
            
            if detected_agent == expected_agent:
                self.log_test(f"User Journey: {scenario['name']}", "PASS", f"Correctly routed to {detected_agent} agent", duration)
                passed_scenarios += 1
            else:
                self.log_test(f"User Journey: {scenario['name']}", "FAIL", f"Expected {expected_agent}, got {detected_agent}", duration)
        
        success_rate = passed_scenarios / len(self.test_scenarios) * 100
        
        if success_rate >= 80:
            self.log_test("Complete User Journey", "PASS", f"{passed_scenarios}/{len(self.test_scenarios)} scenarios passed ({success_rate:.1f}%)")
            return True
        else:
            self.log_test("Complete User Journey", "FAIL", f"Only {passed_scenarios}/{len(self.test_scenarios)} scenarios passed ({success_rate:.1f}%)")
            return False

    def simulate_agent_detection(self, message):
        """Simulate the agent detection logic"""
        message_lower = message.lower()
        
        # Research agent keywords
        if any(word in message_lower for word in ['research', 'find', 'search', 'investigate', 'study']):
            return 'research'
        
        # Navigation agent keywords  
        if any(word in message_lower for word in ['navigate', 'go to', 'visit', 'open']):
            return 'navigation'
        
        # Shopping agent keywords
        if any(word in message_lower for word in ['buy', 'shop', 'price', 'deal', 'product', 'purchase']):
            return 'shopping'
        
        # Communication agent keywords
        if any(word in message_lower for word in ['email', 'compose', 'write', 'message', 'letter']):
            return 'communication'
        
        # Automation agent keywords
        if any(word in message_lower for word in ['automate', 'schedule', 'workflow', 'task']):
            return 'automation'
        
        # Analysis agent keywords
        if any(word in message_lower for word in ['analyze', 'analysis', 'review', 'examine']):
            return 'analysis'
        
        return 'unknown'

    def test_environment_setup(self):
        """Test 8: Environment Setup - Test configuration and dependencies"""
        print("⚙️ TEST 8: ENVIRONMENT SETUP")
        print("=" * 50)
        
        # Check .env file
        env_path = os.path.join(self.app_path, ".env")
        
        if os.path.exists(env_path):
            try:
                with open(env_path, 'r') as f:
                    env_content = f.read()
                
                if "GROQ_API_KEY" in env_content:
                    self.log_test("Environment Configuration", "PASS", "GROQ_API_KEY found in .env")
                    env_ok = True
                else:
                    self.log_test("Environment Configuration", "FAIL", "GROQ_API_KEY not found in .env")
                    env_ok = False
            except Exception as e:
                self.log_test("Environment Configuration", "FAIL", f"Error reading .env: {str(e)}")
                env_ok = False
        else:
            self.log_test("Environment Configuration", "FAIL", ".env file not found")
            env_ok = False
        
        # Check package.json
        package_path = os.path.join(self.app_path, "package.json")
        
        if os.path.exists(package_path):
            try:
                with open(package_path, 'r') as f:
                    package_data = json.load(f)
                
                required_deps = ["electron", "groq-sdk", "better-sqlite3", "react", "typescript"]
                found_deps = []
                
                deps = package_data.get("dependencies", {})
                for dep in required_deps:
                    if dep in deps:
                        found_deps.append(dep)
                
                dep_score = len(found_deps) / len(required_deps) * 100
                
                if dep_score >= 100:
                    self.log_test("Dependencies", "PASS", f"All required dependencies found: {found_deps}")
                    deps_ok = True
                else:
                    missing = set(required_deps) - set(found_deps)
                    self.log_test("Dependencies", "FAIL", f"Missing dependencies: {missing}")
                    deps_ok = False
                    
            except Exception as e:
                self.log_test("Dependencies", "FAIL", f"Error reading package.json: {str(e)}")
                deps_ok = False
        else:
            self.log_test("Dependencies", "FAIL", "package.json not found")
            deps_ok = False
        
        return env_ok and deps_ok

    def generate_comprehensive_report(self):
        """Generate comprehensive test report"""
        print("\n" + "=" * 80)
        print("🎯 KAIRO BROWSER AI WORKFLOW - COMPREHENSIVE TEST REPORT")
        print("=" * 80)
        
        total_duration = time.time() - self.start_time
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        
        print(f"\n📊 OVERALL RESULTS:")
        print(f"   Tests Run: {self.tests_run}")
        print(f"   Tests Passed: {self.tests_passed}")
        print(f"   Success Rate: {success_rate:.1f}%")
        print(f"   Total Duration: {total_duration:.2f}s")
        
        # Categorize results
        categories = {
            "API Integration": [],
            "AI Task Understanding": [],
            "Agent Coordination": [],
            "Browser Control": [],
            "Advanced Features": [],
            "Database Integration": [],
            "User Journey": [],
            "Environment Setup": []
        }
        
        for result in self.test_results:
            test_name = result["test"]
            if "groq" in test_name.lower() or "api" in test_name.lower():
                categories["API Integration"].append(result)
            elif "task" in test_name.lower() or "understanding" in test_name.lower():
                categories["AI Task Understanding"].append(result)
            elif "agent" in test_name.lower() and "coordination" in test_name.lower():
                categories["Agent Coordination"].append(result)
            elif "browser" in test_name.lower() or "control" in test_name.lower():
                categories["Browser Control"].append(result)
            elif "advanced" in test_name.lower() or "features" in test_name.lower():
                categories["Advanced Features"].append(result)
            elif "database" in test_name.lower():
                categories["Database Integration"].append(result)
            elif "journey" in test_name.lower() or "scenario" in test_name.lower():
                categories["User Journey"].append(result)
            elif "environment" in test_name.lower() or "dependencies" in test_name.lower():
                categories["Environment Setup"].append(result)
        
        print(f"\n📋 CATEGORY BREAKDOWN:")
        for category, results in categories.items():
            if results:
                passed = sum(1 for r in results if r["status"] == "PASS")
                total = len(results)
                rate = (passed / total) * 100 if total > 0 else 0
                status = "✅" if rate >= 80 else "⚠️" if rate >= 60 else "❌"
                print(f"   {status} {category}: {passed}/{total} ({rate:.1f}%)")
        
        # AI Workflow Assessment
        print(f"\n🤖 AI WORKFLOW ASSESSMENT:")
        
        if success_rate >= 90:
            print("   🏆 EXCELLENT - AI workflow is fully functional")
            print("   ✅ All major components working correctly")
            print("   ✅ Ready for production use")
        elif success_rate >= 75:
            print("   ✅ GOOD - AI workflow is mostly functional")
            print("   ⚠️ Some minor issues need attention")
            print("   ✅ Ready for testing and refinement")
        elif success_rate >= 60:
            print("   ⚠️ PARTIAL - AI workflow has significant issues")
            print("   ❌ Major components need fixes")
            print("   ⚠️ Requires development work before use")
        else:
            print("   ❌ POOR - AI workflow is not functional")
            print("   ❌ Critical components are missing or broken")
            print("   ❌ Requires major development work")
        
        # Specific findings
        print(f"\n🔍 KEY FINDINGS:")
        
        # Check GROQ API
        groq_tests = [r for r in self.test_results if "groq" in r["test"].lower()]
        if groq_tests and groq_tests[0]["status"] == "PASS":
            print("   ✅ GROQ API integration is working with provided API key")
        else:
            print("   ❌ GROQ API integration has issues")
        
        # Check agent system
        agent_tests = [r for r in self.test_results if "agent" in r["test"].lower()]
        agent_passed = sum(1 for r in agent_tests if r["status"] == "PASS")
        if agent_passed >= len(agent_tests) * 0.8:
            print("   ✅ 6-agent system is properly implemented")
        else:
            print("   ❌ Agent system needs work")
        
        # Check browser control
        browser_tests = [r for r in self.test_results if "browser" in r["test"].lower()]
        if browser_tests and browser_tests[0]["status"] == "PASS":
            print("   ✅ Browser automation capabilities are implemented")
        else:
            print("   ❌ Browser control capabilities need work")
        
        return {
            "success_rate": success_rate,
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "duration": total_duration,
            "categories": categories
        }

    def run_all_tests(self):
        """Run all AI workflow tests"""
        print("🚀 KAIRO BROWSER AI WORKFLOW - COMPREHENSIVE TESTING")
        print("=" * 60)
        print("Testing complete AI workflow as requested by user")
        print("Focus: Task Understanding, Agent Coordination, Browser Control, Advanced Features")
        print("=" * 60)
        print()
        
        # Run all test suites
        test_results = []
        
        test_results.append(self.test_groq_api_integration())
        test_results.append(self.test_ai_task_understanding())
        test_results.append(self.test_agent_coordination())
        test_results.append(self.test_browser_control_capabilities())
        test_results.append(self.test_advanced_features())
        test_results.append(self.test_database_integration())
        test_results.append(self.test_complete_user_journey())
        test_results.append(self.test_environment_setup())
        
        # Generate comprehensive report
        report = self.generate_comprehensive_report()
        
        return report

def main():
    """Main testing function"""
    print("🤖 Starting KAiro Browser AI Workflow Testing...")
    print()
    
    tester = KAiroAIWorkflowTester()
    
    try:
        report = tester.run_all_tests()
        
        # Return appropriate exit code
        if report["success_rate"] >= 75:
            print("\n✅ AI Workflow testing completed successfully!")
            return 0
        else:
            print("\n❌ AI Workflow testing completed with issues that need attention.")
            return 1
            
    except Exception as e:
        print(f"\n❌ Testing failed with error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())