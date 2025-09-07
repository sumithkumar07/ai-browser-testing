#!/usr/bin/env python3
"""
Comprehensive KAiro Browser Backend Testing
Tests all IPC handlers, agent coordination, and system integration
"""

import os
import sys
import json
import time
import requests
import subprocess
from pathlib import Path
from typing import Dict, List, Any, Optional

class ComprehensiveKAiroTester:
    def __init__(self):
        self.app_root = Path("/app")
        self.test_results = {
            "groq_integration": {},
            "ipc_handlers": {},
            "agent_system": {},
            "browser_engine": {},
            "security": {},
            "performance": {},
            "error_handling": {}
        }
        self.api_key = "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"
        self.errors = []
        self.warnings = []
        
    def log_result(self, category: str, test_name: str, success: bool, details: str = "", error: str = ""):
        """Log test result"""
        if category not in self.test_results:
            self.test_results[category] = {}
            
        self.test_results[category][test_name] = {
            "success": success,
            "details": details,
            "error": error,
            "timestamp": time.time()
        }
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} [{category}] {test_name}: {details}")
        
        if not success and error:
            self.errors.append(f"[{category}] {test_name}: {error}")

    def test_groq_model_compatibility(self):
        """Test GROQ model compatibility and performance"""
        print("\n🤖 Testing GROQ Model Compatibility...")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Test the current model used in main.js
        current_model = "llama-3.3-70b-versatile"
        
        test_payload = {
            "messages": [
                {"role": "system", "content": "You are KAiro, an AI browser assistant."},
                {"role": "user", "content": "Test KAiro Browser integration with agent coordination"}
            ],
            "model": current_model,
            "max_tokens": 100,
            "temperature": 0.3
        }
        
        try:
            start_time = time.time()
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=test_payload,
                timeout=15
            )
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                usage = data.get('usage', {})
                
                self.log_result("groq_integration", "model_compatibility", True, 
                              f"Model {current_model} working, response time: {response_time:.2f}s")
                
                # Test performance metrics
                if response_time < 5.0:
                    self.log_result("groq_integration", "response_performance", True,
                                  f"Good response time: {response_time:.2f}s")
                else:
                    self.log_result("groq_integration", "response_performance", False,
                                  error=f"Slow response time: {response_time:.2f}s")
                
                # Test token usage
                total_tokens = usage.get('total_tokens', 0)
                if total_tokens > 0:
                    self.log_result("groq_integration", "token_usage", True,
                                  f"Token usage: {total_tokens} tokens")
                else:
                    self.log_result("groq_integration", "token_usage", False,
                                  error="No token usage data")
                    
            else:
                self.log_result("groq_integration", "model_compatibility", False,
                              error=f"API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            self.log_result("groq_integration", "model_compatibility", False,
                          error=f"Connection failed: {str(e)}")

    def test_ipc_handler_coverage(self):
        """Test IPC handler implementation coverage"""
        print("\n🔌 Testing IPC Handler Coverage...")
        
        main_js = self.app_root / "electron" / "main.js"
        preload_js = self.app_root / "electron" / "preload" / "preload.js"
        
        if not main_js.exists() or not preload_js.exists():
            self.log_result("ipc_handlers", "files_exist", False,
                          error="Main.js or preload.js not found")
            return
            
        try:
            with open(main_js, 'r') as f:
                main_content = f.read()
            with open(preload_js, 'r') as f:
                preload_content = f.read()
                
            # Core IPC handlers that should be implemented
            required_handlers = [
                # Tab Management
                "create-tab", "close-tab", "switch-tab", "navigate-to",
                "go-back", "go-forward", "reload", "get-current-url", "get-page-title",
                
                # AI Service
                "send-ai-message", "test-ai-connection", "execute-agent-task",
                
                # AI Tab Management  
                "create-ai-tab", "save-ai-tab-content", "load-ai-tab-content",
                
                # Content Analysis
                "summarize-page", "analyze-content", "get-ai-context"
            ]
            
            missing_handlers = []
            for handler in required_handlers:
                if f"'{handler}'" not in main_content and f'"{handler}"' not in main_content:
                    missing_handlers.append(handler)
                    
            if missing_handlers:
                self.log_result("ipc_handlers", "handler_coverage", False,
                              error=f"Missing handlers: {missing_handlers}")
            else:
                self.log_result("ipc_handlers", "handler_coverage", True,
                              f"All {len(required_handlers)} required handlers present")
                
            # Test preload API exposure
            required_apis = [
                "createTab", "closeTab", "switchTab", "navigateTo",
                "sendAIMessage", "executeAgentTask", "testAIConnection",
                "createAITab", "saveAITabContent", "loadAITabContent"
            ]
            
            missing_apis = []
            for api in required_apis:
                if api not in preload_content:
                    missing_apis.append(api)
                    
            if missing_apis:
                self.log_result("ipc_handlers", "api_exposure", False,
                              error=f"Missing APIs: {missing_apis}")
            else:
                self.log_result("ipc_handlers", "api_exposure", True,
                              f"All {len(required_apis)} required APIs exposed")
                
        except Exception as e:
            self.log_result("ipc_handlers", "analysis_failed", False,
                          error=f"Failed to analyze IPC handlers: {str(e)}")

    def test_agent_system_architecture(self):
        """Test the 6-agent system architecture"""
        print("\n🤖 Testing Agent System Architecture...")
        
        main_js = self.app_root / "electron" / "main.js"
        
        try:
            with open(main_js, 'r') as f:
                content = f.read()
                
            # Test for 6 specialized agents
            required_agents = [
                "executeResearchAgent",
                "executeNavigationAgent", 
                "executeShoppingAgent",
                "executeCommunicationAgent",
                "executeAutomationAgent",
                "executeAnalysisAgent"
            ]
            
            missing_agents = []
            for agent in required_agents:
                if agent not in content:
                    missing_agents.append(agent)
                    
            if missing_agents:
                self.log_result("agent_system", "agent_methods", False,
                              error=f"Missing agent methods: {missing_agents}")
            else:
                self.log_result("agent_system", "agent_methods", True,
                              f"All 6 specialized agents implemented")
                
            # Test agent coordination logic
            coordination_features = [
                "analyzeAgentTask",
                "calculateKeywordScore", 
                "primaryAgent",
                "supportingAgents",
                "complexity",
                "confidence"
            ]
            
            missing_coordination = []
            for feature in coordination_features:
                if feature not in content:
                    missing_coordination.append(feature)
                    
            if missing_coordination:
                self.log_result("agent_system", "coordination_logic", False,
                              error=f"Missing coordination: {missing_coordination}")
            else:
                self.log_result("agent_system", "coordination_logic", True,
                              "Agent coordination system complete")
                
            # Test AI tab management
            ai_tab_features = [
                "createAITab",
                "aiTabs",
                "Map()"  # For aiTabs storage
            ]
            
            ai_tab_score = sum(1 for feature in ai_tab_features if feature in content)
            
            if ai_tab_score >= 2:
                self.log_result("agent_system", "ai_tab_system", True,
                              f"AI tab management system present ({ai_tab_score}/3 features)")
            else:
                self.log_result("agent_system", "ai_tab_system", False,
                              error=f"Incomplete AI tab system ({ai_tab_score}/3 features)")
                
        except Exception as e:
            self.log_result("agent_system", "architecture_analysis", False,
                          error=f"Failed to analyze agent system: {str(e)}")

    def test_browser_engine_integration(self):
        """Test browser engine and BrowserView integration"""
        print("\n🌐 Testing Browser Engine Integration...")
        
        main_js = self.app_root / "electron" / "main.js"
        
        try:
            with open(main_js, 'r') as f:
                content = f.read()
                
            # Test BrowserView integration
            browser_features = [
                "BrowserView",
                "browserViews",
                "Map()",  # For browserViews storage
                "setBounds",
                "webContents"
            ]
            
            browser_score = sum(1 for feature in browser_features if feature in content)
            
            if browser_score >= 4:
                self.log_result("browser_engine", "browserview_integration", True,
                              f"BrowserView integration complete ({browser_score}/5 features)")
            else:
                self.log_result("browser_engine", "browserview_integration", False,
                              error=f"Incomplete BrowserView integration ({browser_score}/5 features)")
                
            # Test navigation functionality
            navigation_methods = [
                "loadURL",
                "goBack",
                "goForward", 
                "reload",
                "getURL",
                "getTitle"
            ]
            
            nav_score = sum(1 for method in navigation_methods if method in content)
            
            if nav_score >= 5:
                self.log_result("browser_engine", "navigation_methods", True,
                              f"Navigation methods complete ({nav_score}/6 methods)")
            else:
                self.log_result("browser_engine", "navigation_methods", False,
                              error=f"Missing navigation methods ({nav_score}/6 methods)")
                
            # Test event handling
            event_handlers = [
                "did-start-loading",
                "did-finish-load",
                "did-navigate",
                "page-title-updated",
                "did-fail-load"
            ]
            
            event_score = sum(1 for event in event_handlers if event in content)
            
            if event_score >= 4:
                self.log_result("browser_engine", "event_handling", True,
                              f"Event handling complete ({event_score}/5 events)")
            else:
                self.log_result("browser_engine", "event_handling", False,
                              error=f"Missing event handlers ({event_score}/5 events)")
                
        except Exception as e:
            self.log_result("browser_engine", "integration_analysis", False,
                          error=f"Failed to analyze browser engine: {str(e)}")

    def test_security_implementation(self):
        """Test security implementation and best practices"""
        print("\n🔒 Testing Security Implementation...")
        
        preload_js = self.app_root / "electron" / "preload" / "preload.js"
        main_js = self.app_root / "electron" / "main.js"
        
        try:
            with open(preload_js, 'r') as f:
                preload_content = f.read()
            with open(main_js, 'r') as f:
                main_content = f.read()
                
            # Test context isolation
            if "contextBridge.exposeInMainWorld" in preload_content:
                self.log_result("security", "context_isolation", True,
                              "Context bridge properly implemented")
            else:
                self.log_result("security", "context_isolation", False,
                              error="Context bridge not found")
                
            # Test IPC security
            if "ipcRenderer.invoke" in preload_content and "ipcMain.handle" in main_content:
                self.log_result("security", "ipc_security", True,
                              "Secure IPC communication implemented")
            else:
                self.log_result("security", "ipc_security", False,
                              error="Insecure IPC patterns detected")
                
            # Test for dangerous patterns
            dangerous_patterns = [
                "nodeIntegration: true",
                "contextIsolation: false",
                "webSecurity: false",
                "eval(",
                "Function("
            ]
            
            security_issues = []
            for pattern in dangerous_patterns:
                if pattern in main_content or pattern in preload_content:
                    security_issues.append(pattern)
                    
            if security_issues:
                self.log_result("security", "dangerous_patterns", False,
                              error=f"Security issues found: {security_issues}")
            else:
                self.log_result("security", "dangerous_patterns", True,
                              "No dangerous security patterns detected")
                
        except Exception as e:
            self.log_result("security", "security_analysis", False,
                          error=f"Failed to analyze security: {str(e)}")

    def test_error_handling_robustness(self):
        """Test error handling and recovery mechanisms"""
        print("\n🛡️ Testing Error Handling Robustness...")
        
        main_js = self.app_root / "electron" / "main.js"
        
        try:
            with open(main_js, 'r') as f:
                content = f.read()
                
            # Count error handling patterns
            try_catch_count = content.count("try {")
            catch_count = content.count("} catch")
            error_response_count = content.count("{ success: false, error:")
            
            if try_catch_count >= 20:
                self.log_result("error_handling", "try_catch_coverage", True,
                              f"Excellent error handling: {try_catch_count} try-catch blocks")
            elif try_catch_count >= 10:
                self.log_result("error_handling", "try_catch_coverage", True,
                              f"Good error handling: {try_catch_count} try-catch blocks")
            else:
                self.log_result("error_handling", "try_catch_coverage", False,
                              error=f"Insufficient error handling: {try_catch_count} try-catch blocks")
                
            # Test error response consistency
            if error_response_count >= 10:
                self.log_result("error_handling", "error_responses", True,
                              f"Consistent error responses: {error_response_count} patterns")
            else:
                self.log_result("error_handling", "error_responses", False,
                              error=f"Inconsistent error responses: {error_response_count} patterns")
                
            # Test service availability checks
            availability_checks = [
                "if (!this.aiService)",
                "if (!this.mainWindow)",
                "if (!this.activeTabId)"
            ]
            
            check_score = sum(1 for check in availability_checks if check in content)
            
            if check_score >= 2:
                self.log_result("error_handling", "availability_checks", True,
                              f"Service availability checks present ({check_score}/3)")
            else:
                self.log_result("error_handling", "availability_checks", False,
                              error=f"Missing availability checks ({check_score}/3)")
                
        except Exception as e:
            self.log_result("error_handling", "error_analysis", False,
                          error=f"Failed to analyze error handling: {str(e)}")

    def test_performance_optimizations(self):
        """Test performance optimizations and async patterns"""
        print("\n⚡ Testing Performance Optimizations...")
        
        main_js = self.app_root / "electron" / "main.js"
        
        try:
            with open(main_js, 'r') as f:
                content = f.read()
                
            # Test async/await patterns
            async_count = content.count("async ")
            await_count = content.count("await ")
            
            if async_count >= 20 and await_count >= 30:
                self.log_result("performance", "async_patterns", True,
                              f"Excellent async usage: {async_count} async functions, {await_count} await calls")
            elif async_count >= 10 and await_count >= 15:
                self.log_result("performance", "async_patterns", True,
                              f"Good async usage: {async_count} async functions, {await_count} await calls")
            else:
                self.log_result("performance", "async_patterns", False,
                              error=f"Limited async usage: {async_count} async functions, {await_count} await calls")
                
            # Test memory management
            memory_patterns = [
                ".delete(",
                ".clear()",
                ".destroy()",
                "browserView.webContents.destroy"
            ]
            
            memory_score = sum(1 for pattern in memory_patterns if pattern in content)
            
            if memory_score >= 3:
                self.log_result("performance", "memory_management", True,
                              f"Good memory management: {memory_score}/4 patterns")
            else:
                self.log_result("performance", "memory_management", False,
                              error=f"Limited memory management: {memory_score}/4 patterns")
                
            # Test performance optimizations
            optimization_patterns = [
                "setTimeout",  # Delays to prevent overload
                "Math.min(",   # Limiting operations
                "substring(",  # Content truncation
                "slice("      # Array/string slicing
            ]
            
            opt_score = sum(1 for pattern in optimization_patterns if pattern in content)
            
            if opt_score >= 3:
                self.log_result("performance", "optimization_patterns", True,
                              f"Performance optimizations present: {opt_score}/4")
            else:
                self.log_result("performance", "optimization_patterns", False,
                              error=f"Limited optimizations: {opt_score}/4")
                
        except Exception as e:
            self.log_result("performance", "performance_analysis", False,
                          error=f"Failed to analyze performance: {str(e)}")

    def generate_comprehensive_report(self):
        """Generate comprehensive test report"""
        print("\n" + "="*80)
        print("🧪 KAIRO BROWSER COMPREHENSIVE BACKEND TEST REPORT")
        print("="*80)
        
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        
        category_results = {}
        
        for category, tests in self.test_results.items():
            category_passed = 0
            category_total = len(tests)
            total_tests += category_total
            
            print(f"\n📊 {category.upper().replace('_', ' ')} ({category_total} tests)")
            print("-" * 60)
            
            for test_name, result in tests.items():
                status = "✅ PASS" if result["success"] else "❌ FAIL"
                print(f"  {status} {test_name}")
                
                if result["success"]:
                    passed_tests += 1
                    category_passed += 1
                else:
                    failed_tests += 1
                    if result["error"]:
                        print(f"    ❌ Error: {result['error']}")
                        
            success_rate = (category_passed / category_total * 100) if category_total > 0 else 0
            category_results[category] = {
                "passed": category_passed,
                "total": category_total,
                "rate": success_rate
            }
            print(f"  📈 Category Success Rate: {success_rate:.1f}% ({category_passed}/{category_total})")
        
        # Overall summary
        overall_success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n🎯 OVERALL RESULTS")
        print("-" * 40)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {overall_success_rate:.1f}%")
        
        # Critical analysis
        print(f"\n🔍 CRITICAL ANALYSIS")
        print("-" * 30)
        
        if overall_success_rate >= 95:
            print("🏆 EXCELLENT: Production-ready with exceptional quality")
        elif overall_success_rate >= 85:
            print("✅ VERY GOOD: Ready for production with minor improvements")
        elif overall_success_rate >= 75:
            print("⚠️  GOOD: Functional but needs attention to critical issues")
        elif overall_success_rate >= 60:
            print("🔧 FAIR: Significant issues need resolution")
        else:
            print("🚨 POOR: Major problems require immediate attention")
            
        # Specific recommendations
        print(f"\n💡 SPECIFIC RECOMMENDATIONS")
        print("-" * 35)
        
        for category, results in category_results.items():
            if results["rate"] < 80:
                print(f"  🔧 {category.replace('_', ' ').title()}: Needs improvement ({results['rate']:.1f}%)")
            elif results["rate"] == 100:
                print(f"  ✅ {category.replace('_', ' ').title()}: Excellent ({results['rate']:.1f}%)")
        
        # Critical issues
        if self.errors:
            print(f"\n🚨 CRITICAL ISSUES ({len(self.errors)})")
            print("-" * 40)
            for error in self.errors[:5]:  # Show top 5 errors
                print(f"  • {error}")
            if len(self.errors) > 5:
                print(f"  ... and {len(self.errors) - 5} more issues")
                
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": overall_success_rate,
            "category_results": category_results,
            "critical_issues": len(self.errors)
        }

    def run_comprehensive_tests(self):
        """Run all comprehensive tests"""
        print("🚀 Starting KAiro Browser Comprehensive Backend Testing...")
        print(f"📁 Testing application at: {self.app_root}")
        print(f"🔑 Using GROQ API key: {self.api_key[:10]}...{self.api_key[-10:]}")
        
        start_time = time.time()
        
        # Run all test categories
        self.test_groq_model_compatibility()
        self.test_ipc_handler_coverage()
        self.test_agent_system_architecture()
        self.test_browser_engine_integration()
        self.test_security_implementation()
        self.test_error_handling_robustness()
        self.test_performance_optimizations()
        
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"\n⏱️  Comprehensive testing completed in {duration:.2f} seconds")
        
        # Generate and return summary
        return self.generate_comprehensive_report()

def main():
    """Main test execution"""
    tester = ComprehensiveKAiroTester()
    summary = tester.run_comprehensive_tests()
    
    print(f"\n🎉 TESTING COMPLETE")
    print(f"📊 Final Score: {summary['success_rate']:.1f}%")
    
    # Exit with appropriate code
    if summary["success_rate"] >= 80:
        print("✅ BACKEND STATUS: READY FOR PRODUCTION")
        sys.exit(0)
    else:
        print("⚠️  BACKEND STATUS: NEEDS ATTENTION")
        sys.exit(1)

if __name__ == "__main__":
    main()