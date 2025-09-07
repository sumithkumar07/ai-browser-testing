#!/usr/bin/env python3
"""
KAiro Browser Backend Testing Suite
Tests the Electron main process functionality including:
- Environment configuration
- AI service integration (GROQ)
- IPC communication patterns
- Browser management
- Agent coordination system
- Error handling and recovery
"""

import os
import sys
import json
import time
import requests
import subprocess
from pathlib import Path
from typing import Dict, List, Any, Optional

class KAiroBrowserBackendTester:
    def __init__(self):
        self.app_root = Path("/app")
        self.test_results = {
            "environment": {},
            "ai_service": {},
            "browser_functionality": {},
            "agent_system": {},
            "ipc_communication": {},
            "error_handling": {},
            "performance": {}
        }
        self.groq_api_key = None
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
            
    def log_warning(self, message: str):
        """Log warning message"""
        self.warnings.append(message)
        print(f"⚠️  WARNING: {message}")

    def test_environment_configuration(self):
        """Test environment variables and configuration"""
        print("\n🔧 Testing Environment Configuration...")
        
        # Test .env file existence
        env_file = self.app_root / ".env"
        if env_file.exists():
            self.log_result("environment", "env_file_exists", True, "Environment file found")
            
            # Load and validate environment variables
            try:
                with open(env_file, 'r') as f:
                    env_content = f.read()
                    
                # Check for required variables
                required_vars = ["GROQ_API_KEY", "GROQ_API_URL", "NODE_ENV"]
                missing_vars = []
                
                for var in required_vars:
                    if var not in env_content:
                        missing_vars.append(var)
                    elif var == "GROQ_API_KEY":
                        # Extract API key for later testing
                        for line in env_content.split('\n'):
                            if line.startswith('GROQ_API_KEY='):
                                self.groq_api_key = line.split('=', 1)[1].strip()
                                break
                
                if missing_vars:
                    self.log_result("environment", "required_variables", False, 
                                  f"Missing variables: {missing_vars}")
                else:
                    self.log_result("environment", "required_variables", True, 
                                  "All required environment variables present")
                    
            except Exception as e:
                self.log_result("environment", "env_file_parsing", False, 
                              error=f"Failed to parse .env file: {str(e)}")
        else:
            self.log_result("environment", "env_file_exists", False, 
                          error="Environment file not found")
            
        # Test package.json configuration
        package_json = self.app_root / "package.json"
        if package_json.exists():
            try:
                with open(package_json, 'r') as f:
                    package_data = json.load(f)
                    
                # Check main entry point
                main_entry = package_data.get("main", "")
                if main_entry == "electron/main.js":
                    self.log_result("environment", "main_entry_point", True, 
                                  "Correct main entry point configured")
                else:
                    self.log_result("environment", "main_entry_point", False, 
                                  error=f"Incorrect main entry: {main_entry}")
                    
                # Check dependencies
                deps = package_data.get("dependencies", {})
                required_deps = ["electron", "groq-sdk", "dotenv", "react", "vite"]
                missing_deps = [dep for dep in required_deps if dep not in deps]
                
                if missing_deps:
                    self.log_result("environment", "dependencies", False, 
                                  error=f"Missing dependencies: {missing_deps}")
                else:
                    self.log_result("environment", "dependencies", True, 
                                  "All required dependencies present")
                    
            except Exception as e:
                self.log_result("environment", "package_json_parsing", False, 
                              error=f"Failed to parse package.json: {str(e)}")
        else:
            self.log_result("environment", "package_json_exists", False, 
                          error="package.json not found")

    def test_ai_service_integration(self):
        """Test GROQ AI service integration"""
        print("\n🤖 Testing AI Service Integration...")
        
        if not self.groq_api_key:
            self.log_result("ai_service", "api_key_available", False, 
                          error="GROQ API key not found in environment")
            return
            
        # Test API key format
        if self.groq_api_key.startswith('gsk_') and len(self.groq_api_key) > 20:
            self.log_result("ai_service", "api_key_format", True, 
                          "API key format appears valid")
        else:
            self.log_result("ai_service", "api_key_format", False, 
                          error="API key format appears invalid")
            
        # Test GROQ API connectivity
        try:
            headers = {
                "Authorization": f"Bearer {self.groq_api_key}",
                "Content-Type": "application/json"
            }
            
            # Test with a simple completion request
            test_payload = {
                "messages": [{"role": "user", "content": "test"}],
                "model": "llama3-8b-8192",
                "max_tokens": 1
            }
            
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=test_payload,
                timeout=10
            )
            
            if response.status_code == 200:
                self.log_result("ai_service", "groq_api_connectivity", True, 
                              "GROQ API connection successful")
                
                # Test response structure
                try:
                    response_data = response.json()
                    if "choices" in response_data and len(response_data["choices"]) > 0:
                        self.log_result("ai_service", "groq_response_format", True, 
                                      "GROQ API response format valid")
                    else:
                        self.log_result("ai_service", "groq_response_format", False, 
                                      error="Invalid GROQ API response format")
                except json.JSONDecodeError:
                    self.log_result("ai_service", "groq_response_format", False, 
                                  error="GROQ API response not valid JSON")
                    
            elif response.status_code == 401:
                self.log_result("ai_service", "groq_api_connectivity", False, 
                              error="GROQ API authentication failed - invalid API key")
            elif response.status_code == 429:
                self.log_result("ai_service", "groq_api_connectivity", False, 
                              error="GROQ API rate limit exceeded")
            else:
                self.log_result("ai_service", "groq_api_connectivity", False, 
                              error=f"GROQ API error: {response.status_code} - {response.text}")
                
        except requests.exceptions.Timeout:
            self.log_result("ai_service", "groq_api_connectivity", False, 
                          error="GROQ API connection timeout")
        except requests.exceptions.ConnectionError:
            self.log_result("ai_service", "groq_api_connectivity", False, 
                          error="GROQ API connection failed - network error")
        except Exception as e:
            self.log_result("ai_service", "groq_api_connectivity", False, 
                          error=f"GROQ API test failed: {str(e)}")

    def test_electron_main_process(self):
        """Test Electron main process functionality"""
        print("\n⚡ Testing Electron Main Process...")
        
        # Test main.js file existence and structure
        main_js = self.app_root / "electron" / "main.js"
        if main_js.exists():
            self.log_result("browser_functionality", "main_js_exists", True, 
                          "Main Electron process file found")
            
            try:
                with open(main_js, 'r') as f:
                    main_content = f.read()
                    
                # Check for required imports and classes
                required_components = [
                    "require('electron')",
                    "require('groq-sdk')",
                    "require('dotenv')",
                    "class KAiroBrowserManager",
                    "setupIPCHandlers",
                    "initializeAIService"
                ]
                
                missing_components = []
                for component in required_components:
                    if component not in main_content:
                        missing_components.append(component)
                        
                if missing_components:
                    self.log_result("browser_functionality", "main_js_structure", False, 
                                  error=f"Missing components: {missing_components}")
                else:
                    self.log_result("browser_functionality", "main_js_structure", True, 
                                  "Main.js has all required components")
                    
                # Check for IPC handlers
                ipc_handlers = [
                    "create-tab", "close-tab", "switch-tab", "navigate-to",
                    "send-ai-message", "execute-agent-task", "test-ai-connection"
                ]
                
                missing_handlers = []
                for handler in ipc_handlers:
                    if f"'{handler}'" not in main_content and f'"{handler}"' not in main_content:
                        missing_handlers.append(handler)
                        
                if missing_handlers:
                    self.log_result("browser_functionality", "ipc_handlers", False, 
                                  error=f"Missing IPC handlers: {missing_handlers}")
                else:
                    self.log_result("browser_functionality", "ipc_handlers", True, 
                                  "All required IPC handlers present")
                    
            except Exception as e:
                self.log_result("browser_functionality", "main_js_analysis", False, 
                              error=f"Failed to analyze main.js: {str(e)}")
        else:
            self.log_result("browser_functionality", "main_js_exists", False, 
                          error="Main Electron process file not found")

    def test_preload_script(self):
        """Test Electron preload script"""
        print("\n🔌 Testing Preload Script...")
        
        preload_js = self.app_root / "electron" / "preload" / "preload.js"
        if preload_js.exists():
            self.log_result("ipc_communication", "preload_exists", True, 
                          "Preload script found")
            
            try:
                with open(preload_js, 'r') as f:
                    preload_content = f.read()
                    
                # Check for security measures
                security_checks = [
                    "contextBridge.exposeInMainWorld",
                    "ipcRenderer.invoke",
                    "nodeIntegration: false"  # This should be in main.js but checking pattern
                ]
                
                security_issues = []
                if "contextBridge.exposeInMainWorld" not in preload_content:
                    security_issues.append("Missing contextBridge usage")
                if "require('electron')" not in preload_content:
                    security_issues.append("Missing electron import")
                    
                if security_issues:
                    self.log_result("ipc_communication", "preload_security", False, 
                                  error=f"Security issues: {security_issues}")
                else:
                    self.log_result("ipc_communication", "preload_security", True, 
                                  "Preload script follows security best practices")
                    
                # Check for API exposure
                api_methods = [
                    "createTab", "closeTab", "switchTab", "navigateTo",
                    "sendAIMessage", "executeAgentTask", "testAIConnection"
                ]
                
                missing_apis = []
                for api in api_methods:
                    if api not in preload_content:
                        missing_apis.append(api)
                        
                if missing_apis:
                    self.log_result("ipc_communication", "api_exposure", False, 
                                  error=f"Missing API methods: {missing_apis}")
                else:
                    self.log_result("ipc_communication", "api_exposure", True, 
                                  "All required API methods exposed")
                    
            except Exception as e:
                self.log_result("ipc_communication", "preload_analysis", False, 
                              error=f"Failed to analyze preload.js: {str(e)}")
        else:
            self.log_result("ipc_communication", "preload_exists", False, 
                          error="Preload script not found")

    def test_agent_system_architecture(self):
        """Test AI agent system architecture"""
        print("\n🤖 Testing Agent System Architecture...")
        
        main_js = self.app_root / "electron" / "main.js"
        if main_js.exists():
            try:
                with open(main_js, 'r') as f:
                    main_content = f.read()
                    
                # Check for agent system components
                agent_components = [
                    "analyzeAgentTask",
                    "executeSpecializedAgent", 
                    "executeResearchAgent",
                    "executeNavigationAgent",
                    "executeShoppingAgent",
                    "executeCommunicationAgent",
                    "executeAutomationAgent",
                    "executeAnalysisAgent"
                ]
                
                missing_agents = []
                for component in agent_components:
                    if component not in main_content:
                        missing_agents.append(component)
                        
                if missing_agents:
                    self.log_result("agent_system", "agent_methods", False, 
                                  error=f"Missing agent methods: {missing_agents}")
                else:
                    self.log_result("agent_system", "agent_methods", True, 
                                  "All agent execution methods present")
                    
                # Check for agent coordination logic
                coordination_features = [
                    "calculateKeywordScore",
                    "primaryAgent",
                    "supportingAgents",
                    "complexity",
                    "confidence"
                ]
                
                missing_coordination = []
                for feature in coordination_features:
                    if feature not in main_content:
                        missing_coordination.append(feature)
                        
                if missing_coordination:
                    self.log_result("agent_system", "coordination_logic", False, 
                                  error=f"Missing coordination features: {missing_coordination}")
                else:
                    self.log_result("agent_system", "coordination_logic", True, 
                                  "Agent coordination system complete")
                    
                # Check for AI tab management
                ai_tab_features = [
                    "create-ai-tab",
                    "save-ai-tab-content", 
                    "load-ai-tab-content",
                    "aiTabs"
                ]
                
                missing_ai_tabs = []
                for feature in ai_tab_features:
                    if feature not in main_content:
                        missing_ai_tabs.append(feature)
                        
                if missing_ai_tabs:
                    self.log_result("agent_system", "ai_tab_management", False, 
                                  error=f"Missing AI tab features: {missing_ai_tabs}")
                else:
                    self.log_result("agent_system", "ai_tab_management", True, 
                                  "AI tab management system complete")
                    
            except Exception as e:
                self.log_result("agent_system", "architecture_analysis", False, 
                              error=f"Failed to analyze agent system: {str(e)}")

    def test_error_handling_mechanisms(self):
        """Test error handling and recovery mechanisms"""
        print("\n🛡️ Testing Error Handling Mechanisms...")
        
        main_js = self.app_root / "electron" / "main.js"
        if main_js.exists():
            try:
                with open(main_js, 'r') as f:
                    main_content = f.read()
                    
                # Check for try-catch blocks
                try_catch_count = main_content.count("try {")
                if try_catch_count >= 10:  # Should have many error handling blocks
                    self.log_result("error_handling", "try_catch_coverage", True, 
                                  f"Found {try_catch_count} try-catch blocks")
                else:
                    self.log_result("error_handling", "try_catch_coverage", False, 
                                  error=f"Insufficient error handling: only {try_catch_count} try-catch blocks")
                    
                # Check for error response patterns
                error_patterns = [
                    "{ success: false, error:",
                    "console.error",
                    "throw new Error",
                    "catch (error)"
                ]
                
                missing_patterns = []
                for pattern in error_patterns:
                    if pattern not in main_content:
                        missing_patterns.append(pattern)
                        
                if missing_patterns:
                    self.log_result("error_handling", "error_patterns", False, 
                                  error=f"Missing error patterns: {missing_patterns}")
                else:
                    self.log_result("error_handling", "error_patterns", True, 
                                  "Proper error handling patterns present")
                    
                # Check for service availability checks
                availability_checks = [
                    "if (!this.aiService)",
                    "if (!this.mainWindow)",
                    "if (!this.activeTabId)"
                ]
                
                missing_checks = []
                for check in availability_checks:
                    if check not in main_content:
                        missing_checks.append(check)
                        
                if missing_checks:
                    self.log_result("error_handling", "availability_checks", False, 
                                  error=f"Missing availability checks: {missing_checks}")
                else:
                    self.log_result("error_handling", "availability_checks", True, 
                                  "Service availability checks present")
                    
            except Exception as e:
                self.log_result("error_handling", "error_analysis", False, 
                              error=f"Failed to analyze error handling: {str(e)}")

    def test_performance_considerations(self):
        """Test performance optimization features"""
        print("\n⚡ Testing Performance Considerations...")
        
        main_js = self.app_root / "electron" / "main.js"
        if main_js.exists():
            try:
                with open(main_js, 'r') as f:
                    main_content = f.read()
                    
                # Check for async/await patterns
                async_count = main_content.count("async ")
                await_count = main_content.count("await ")
                
                if async_count >= 10 and await_count >= 20:
                    self.log_result("performance", "async_patterns", True, 
                                  f"Good async usage: {async_count} async functions, {await_count} await calls")
                else:
                    self.log_result("performance", "async_patterns", False, 
                                  error=f"Limited async usage: {async_count} async functions, {await_count} await calls")
                    
                # Check for memory management
                memory_patterns = [
                    ".delete(",
                    ".clear()",
                    "browserView.webContents.destroy()",
                    "this.browserViews.delete"
                ]
                
                memory_management_score = sum(1 for pattern in memory_patterns if pattern in main_content)
                
                if memory_management_score >= 3:
                    self.log_result("performance", "memory_management", True, 
                                  f"Good memory management patterns: {memory_management_score}/4")
                else:
                    self.log_result("performance", "memory_management", False, 
                                  error=f"Limited memory management: {memory_management_score}/4 patterns")
                    
                # Check for performance optimizations
                optimization_patterns = [
                    "setTimeout",  # Delays to prevent system overload
                    "Math.min(",   # Limiting operations
                    "substring(",  # Content truncation
                    "slice("      # Array/string slicing
                ]
                
                optimization_score = sum(1 for pattern in optimization_patterns if pattern in main_content)
                
                if optimization_score >= 3:
                    self.log_result("performance", "optimization_patterns", True, 
                                  f"Performance optimizations present: {optimization_score}/4")
                else:
                    self.log_result("performance", "optimization_patterns", False, 
                                  error=f"Limited optimizations: {optimization_score}/4 patterns")
                    
            except Exception as e:
                self.log_result("performance", "performance_analysis", False, 
                              error=f"Failed to analyze performance: {str(e)}")

    def test_build_system(self):
        """Test build system and dependencies"""
        print("\n🔨 Testing Build System...")
        
        # Check if node_modules exists
        node_modules = self.app_root / "node_modules"
        if node_modules.exists():
            self.log_result("environment", "node_modules_exists", True, 
                          "Node modules directory found")
            
            # Check for key dependencies
            key_deps = ["electron", "groq-sdk", "react", "vite", "typescript"]
            missing_deps = []
            
            for dep in key_deps:
                dep_path = node_modules / dep
                if not dep_path.exists():
                    missing_deps.append(dep)
                    
            if missing_deps:
                self.log_result("environment", "key_dependencies", False, 
                              error=f"Missing key dependencies: {missing_deps}")
            else:
                self.log_result("environment", "key_dependencies", True, 
                              "All key dependencies installed")
        else:
            self.log_result("environment", "node_modules_exists", False, 
                          error="Node modules not installed")
            
        # Check TypeScript configuration
        tsconfig = self.app_root / "tsconfig.json"
        if tsconfig.exists():
            self.log_result("environment", "typescript_config", True, 
                          "TypeScript configuration found")
        else:
            self.log_result("environment", "typescript_config", False, 
                          error="TypeScript configuration missing")
            
        # Check Vite configuration
        vite_config = self.app_root / "vite.config.ts"
        if vite_config.exists():
            self.log_result("environment", "vite_config", True, 
                          "Vite configuration found")
        else:
            self.log_result("environment", "vite_config", False, 
                          error="Vite configuration missing")

    def generate_summary_report(self):
        """Generate comprehensive test summary"""
        print("\n" + "="*80)
        print("🧪 KAIRO BROWSER BACKEND TEST SUMMARY")
        print("="*80)
        
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        
        for category, tests in self.test_results.items():
            category_passed = 0
            category_total = len(tests)
            total_tests += category_total
            
            print(f"\n📊 {category.upper().replace('_', ' ')} ({category_total} tests)")
            print("-" * 50)
            
            for test_name, result in tests.items():
                status = "✅ PASS" if result["success"] else "❌ FAIL"
                print(f"  {status} {test_name}")
                
                if result["success"]:
                    passed_tests += 1
                    category_passed += 1
                else:
                    failed_tests += 1
                    if result["error"]:
                        print(f"    Error: {result['error']}")
                        
            success_rate = (category_passed / category_total * 100) if category_total > 0 else 0
            print(f"  Category Success Rate: {success_rate:.1f}% ({category_passed}/{category_total})")
        
        # Overall summary
        overall_success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n🎯 OVERALL RESULTS")
        print("-" * 30)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {overall_success_rate:.1f}%")
        
        # Critical issues
        if self.errors:
            print(f"\n🚨 CRITICAL ISSUES ({len(self.errors)})")
            print("-" * 40)
            for error in self.errors:
                print(f"  • {error}")
                
        # Warnings
        if self.warnings:
            print(f"\n⚠️  WARNINGS ({len(self.warnings)})")
            print("-" * 30)
            for warning in self.warnings:
                print(f"  • {warning}")
        
        # Recommendations
        print(f"\n💡 RECOMMENDATIONS")
        print("-" * 25)
        
        if overall_success_rate >= 90:
            print("  ✅ Excellent! Backend is ready for production")
        elif overall_success_rate >= 75:
            print("  ⚠️  Good foundation, address critical issues")
        elif overall_success_rate >= 50:
            print("  🔧 Significant issues need attention")
        else:
            print("  🚨 Major problems require immediate fixes")
            
        # Specific recommendations based on failures
        if any("groq" in error.lower() for error in self.errors):
            print("  • Fix GROQ AI service integration issues")
        if any("ipc" in error.lower() for error in self.errors):
            print("  • Resolve IPC communication problems")
        if any("environment" in error.lower() for error in self.errors):
            print("  • Check environment configuration")
        if any("agent" in error.lower() for error in self.errors):
            print("  • Review agent system implementation")
            
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": overall_success_rate,
            "critical_issues": len(self.errors),
            "warnings": len(self.warnings)
        }

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting KAiro Browser Backend Testing Suite...")
        print(f"📁 Testing application at: {self.app_root}")
        
        start_time = time.time()
        
        # Run all test categories
        self.test_environment_configuration()
        self.test_ai_service_integration()
        self.test_electron_main_process()
        self.test_preload_script()
        self.test_agent_system_architecture()
        self.test_error_handling_mechanisms()
        self.test_performance_considerations()
        self.test_build_system()
        
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"\n⏱️  Testing completed in {duration:.2f} seconds")
        
        # Generate and return summary
        return self.generate_summary_report()

def main():
    """Main test execution"""
    tester = KAiroBrowserBackendTester()
    summary = tester.run_all_tests()
    
    # Exit with appropriate code
    if summary["success_rate"] >= 75:
        sys.exit(0)  # Success
    else:
        sys.exit(1)  # Failure

if __name__ == "__main__":
    main()