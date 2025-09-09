#!/usr/bin/env node

/**
 * KAiro Browser Electron Integration Testing Suite
 * Tests the main Electron process functionality without requiring GUI
 */

const path = require('path');
const fs = require('fs');

class ElectronIntegrationTester {
  constructor() {
    this.testResults = {
      main_process: {},
      ipc_handlers: {},
      preload_security: {},
      backend_services: {},
      file_structure: {}
    };
    this.startTime = Date.now();
  }

  log(message, level = "INFO") {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${level}: ${message}`);
  }

  async runAllTests() {
    this.log("🧪 Starting KAiro Browser Electron Integration Tests", "INFO");
    
    try {
      // Test file structure
      await this.testFileStructure();
      
      // Test main process configuration
      await this.testMainProcessConfig();
      
      // Test preload script security
      await this.testPreloadSecurity();
      
      // Test backend services integration
      await this.testBackendServicesIntegration();
      
      // Test IPC handler definitions
      await this.testIPCHandlers();
      
      // Generate report
      this.generateReport();
      
      return true;
    } catch (error) {
      this.log(`❌ Critical testing error: ${error.message}`, "ERROR");
      return false;
    }
  }

  async testFileStructure() {
    this.log("📁 Testing Electron File Structure...", "INFO");
    
    const requiredFiles = [
      'electron/main.js',
      'electron/preload/preload.js',
      'package.json',
      'dist/index.html',
      'src/main/App.tsx',
      '.env'
    ];

    let missingFiles = [];
    let existingFiles = [];

    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        existingFiles.push(file);
        this.log(`✅ Found: ${file}`, "SUCCESS");
      } else {
        missingFiles.push(file);
        this.log(`❌ Missing: ${file}`, "ERROR");
      }
    }

    this.testResults.file_structure = {
      required_files: requiredFiles.length,
      existing_files: existingFiles.length,
      missing_files: missingFiles,
      structure_complete: missingFiles.length === 0
    };

    if (missingFiles.length === 0) {
      this.log("✅ All required Electron files present", "SUCCESS");
    } else {
      this.log(`❌ Missing ${missingFiles.length} required files`, "ERROR");
    }
  }

  async testMainProcessConfig() {
    this.log("⚙️ Testing Main Process Configuration...", "INFO");
    
    try {
      // Test package.json configuration
      const packagePath = path.join(__dirname, 'package.json');
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      const mainEntry = packageData.main;
      const isMainCorrect = mainEntry === 'electron/main.js';
      
      this.testResults.main_process.package_main = isMainCorrect;
      this.log(`${isMainCorrect ? '✅' : '❌'} Package main entry: ${mainEntry}`, isMainCorrect ? "SUCCESS" : "ERROR");
      
      // Test Electron dependencies
      const hasElectron = packageData.devDependencies && packageData.devDependencies.electron;
      const hasElectronBuilder = packageData.devDependencies && packageData.devDependencies['electron-builder'];
      
      this.testResults.main_process.electron_dependency = !!hasElectron;
      this.testResults.main_process.electron_builder = !!hasElectronBuilder;
      
      this.log(`${hasElectron ? '✅' : '❌'} Electron dependency: ${hasElectron ? 'Present' : 'Missing'}`, hasElectron ? "SUCCESS" : "ERROR");
      this.log(`${hasElectronBuilder ? '✅' : '❌'} Electron Builder: ${hasElectronBuilder ? 'Present' : 'Missing'}`, hasElectronBuilder ? "SUCCESS" : "ERROR");
      
      // Test build configuration
      const buildConfig = packageData.build;
      const hasBuildConfig = !!buildConfig;
      
      this.testResults.main_process.build_config = hasBuildConfig;
      this.log(`${hasBuildConfig ? '✅' : '❌'} Build configuration: ${hasBuildConfig ? 'Present' : 'Missing'}`, hasBuildConfig ? "SUCCESS" : "ERROR");
      
      if (hasBuildConfig) {
        const hasAppId = !!buildConfig.appId;
        const hasFiles = !!buildConfig.files;
        
        this.testResults.main_process.app_id = hasAppId;
        this.testResults.main_process.build_files = hasFiles;
        
        this.log(`${hasAppId ? '✅' : '❌'} App ID configured: ${buildConfig.appId || 'Missing'}`, hasAppId ? "SUCCESS" : "ERROR");
        this.log(`${hasFiles ? '✅' : '❌'} Build files configured`, hasFiles ? "SUCCESS" : "ERROR");
      }
      
    } catch (error) {
      this.log(`❌ Main process config test failed: ${error.message}`, "ERROR");
      this.testResults.main_process.config_error = error.message;
    }
  }

  async testPreloadSecurity() {
    this.log("🔒 Testing Preload Script Security...", "INFO");
    
    try {
      const preloadPath = path.join(__dirname, 'electron/preload/preload.js');
      const preloadContent = fs.readFileSync(preloadPath, 'utf8');
      
      // Test for contextBridge usage
      const hasContextBridge = preloadContent.includes('contextBridge');
      const hasExposeInMainWorld = preloadContent.includes('exposeInMainWorld');
      
      this.testResults.preload_security.context_bridge = hasContextBridge;
      this.testResults.preload_security.expose_main_world = hasExposeInMainWorld;
      
      this.log(`${hasContextBridge ? '✅' : '❌'} Context Bridge usage: ${hasContextBridge ? 'Secure' : 'Missing'}`, hasContextBridge ? "SUCCESS" : "ERROR");
      this.log(`${hasExposeInMainWorld ? '✅' : '❌'} Main World exposure: ${hasExposeInMainWorld ? 'Secure' : 'Missing'}`, hasExposeInMainWorld ? "SUCCESS" : "ERROR");
      
      // Test for dangerous patterns
      const dangerousPatterns = [
        'require.*electron.*remote',
        'nodeIntegration.*true',
        'contextIsolation.*false',
        'webSecurity.*false'
      ];
      
      let securityIssues = [];
      for (const pattern of dangerousPatterns) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(preloadContent)) {
          securityIssues.push(pattern);
        }
      }
      
      this.testResults.preload_security.security_issues = securityIssues;
      this.testResults.preload_security.is_secure = securityIssues.length === 0;
      
      if (securityIssues.length === 0) {
        this.log("✅ No security issues found in preload script", "SUCCESS");
      } else {
        this.log(`❌ Security issues found: ${securityIssues.join(', ')}`, "ERROR");
      }
      
      // Test API exposure
      const apiMethods = [
        'createTab', 'closeTab', 'switchTab', 'navigateTo',
        'sendAIMessage', 'testConnection', 'getAgentStatus',
        'createAITab', 'saveAITabContent', 'loadAITabContent'
      ];
      
      let exposedMethods = [];
      for (const method of apiMethods) {
        if (preloadContent.includes(method)) {
          exposedMethods.push(method);
        }
      }
      
      this.testResults.preload_security.exposed_methods = exposedMethods;
      this.log(`✅ Exposed ${exposedMethods.length} API methods`, "SUCCESS");
      
    } catch (error) {
      this.log(`❌ Preload security test failed: ${error.message}`, "ERROR");
      this.testResults.preload_security.test_error = error.message;
    }
  }

  async testBackendServicesIntegration() {
    this.log("🔧 Testing Backend Services Integration...", "INFO");
    
    try {
      const mainPath = path.join(__dirname, 'electron/main.js');
      const mainContent = fs.readFileSync(mainPath, 'utf8');
      
      // Test for backend service imports
      const backendServices = [
        'DatabaseService',
        'AgentPerformanceMonitor', 
        'BackgroundTaskScheduler'
      ];
      
      let importedServices = [];
      for (const service of backendServices) {
        if (mainContent.includes(service)) {
          importedServices.push(service);
        }
      }
      
      this.testResults.backend_services.imported_services = importedServices;
      this.testResults.backend_services.all_services_imported = importedServices.length === backendServices.length;
      
      this.log(`${importedServices.length === backendServices.length ? '✅' : '❌'} Backend services imported: ${importedServices.length}/${backendServices.length}`, 
               importedServices.length === backendServices.length ? "SUCCESS" : "ERROR");
      
      // Test for GROQ integration
      const hasGroqImport = mainContent.includes('groq-sdk') || mainContent.includes('Groq');
      const hasGroqInit = mainContent.includes('new Groq');
      
      this.testResults.backend_services.groq_import = hasGroqImport;
      this.testResults.backend_services.groq_initialization = hasGroqInit;
      
      this.log(`${hasGroqImport ? '✅' : '❌'} GROQ SDK import: ${hasGroqImport ? 'Present' : 'Missing'}`, hasGroqImport ? "SUCCESS" : "ERROR");
      this.log(`${hasGroqInit ? '✅' : '❌'} GROQ initialization: ${hasGroqInit ? 'Present' : 'Missing'}`, hasGroqInit ? "SUCCESS" : "ERROR");
      
      // Test for environment variable usage
      const hasEnvConfig = mainContent.includes('process.env.GROQ_API_KEY');
      this.testResults.backend_services.env_config = hasEnvConfig;
      
      this.log(`${hasEnvConfig ? '✅' : '❌'} Environment configuration: ${hasEnvConfig ? 'Present' : 'Missing'}`, hasEnvConfig ? "SUCCESS" : "ERROR");
      
    } catch (error) {
      this.log(`❌ Backend services integration test failed: ${error.message}`, "ERROR");
      this.testResults.backend_services.test_error = error.message;
    }
  }

  async testIPCHandlers() {
    this.log("🔌 Testing IPC Handler Definitions...", "INFO");
    
    try {
      const mainPath = path.join(__dirname, 'electron/main.js');
      const mainContent = fs.readFileSync(mainPath, 'utf8');
      
      // Test for IPC handler setup
      const hasIPCSetup = mainContent.includes('setupIPCHandlers') || mainContent.includes('ipcMain.handle');
      this.testResults.ipc_handlers.setup_present = hasIPCSetup;
      
      this.log(`${hasIPCSetup ? '✅' : '❌'} IPC handlers setup: ${hasIPCSetup ? 'Present' : 'Missing'}`, hasIPCSetup ? "SUCCESS" : "ERROR");
      
      // Test for critical IPC handlers
      const criticalHandlers = [
        'create-tab', 'close-tab', 'switch-tab', 'navigate-to',
        'send-ai-message', 'test-ai-connection', 'get-agent-status',
        'create-ai-tab', 'save-ai-tab-content', 'load-ai-tab-content'
      ];
      
      let definedHandlers = [];
      for (const handler of criticalHandlers) {
        if (mainContent.includes(`'${handler}'`) || mainContent.includes(`"${handler}"`)) {
          definedHandlers.push(handler);
        }
      }
      
      this.testResults.ipc_handlers.defined_handlers = definedHandlers;
      this.testResults.ipc_handlers.all_handlers_defined = definedHandlers.length === criticalHandlers.length;
      
      this.log(`${definedHandlers.length === criticalHandlers.length ? '✅' : '❌'} IPC handlers defined: ${definedHandlers.length}/${criticalHandlers.length}`, 
               definedHandlers.length === criticalHandlers.length ? "SUCCESS" : "ERROR");
      
      // Test for error handling in IPC
      const hasErrorHandling = mainContent.includes('try') && mainContent.includes('catch') && mainContent.includes('error');
      this.testResults.ipc_handlers.error_handling = hasErrorHandling;
      
      this.log(`${hasErrorHandling ? '✅' : '❌'} IPC error handling: ${hasErrorHandling ? 'Present' : 'Missing'}`, hasErrorHandling ? "SUCCESS" : "ERROR");
      
    } catch (error) {
      this.log(`❌ IPC handlers test failed: ${error.message}`, "ERROR");
      this.testResults.ipc_handlers.test_error = error.message;
    }
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    
    console.log("\n" + "=".repeat(80));
    console.log("🧪 KAIRO BROWSER ELECTRON INTEGRATION TEST REPORT");
    console.log("=".repeat(80));
    console.log(`⏱️ Test Duration: ${duration}ms`);
    console.log(`📅 Test Date: ${new Date().toLocaleString()}`);
    console.log();
    
    // Calculate overall success
    let totalTests = 0;
    let passedTests = 0;
    
    for (const category in this.testResults) {
      const tests = this.testResults[category];
      for (const testName in tests) {
        totalTests++;
        const result = tests[testName];
        if (typeof result === 'boolean' && result) {
          passedTests++;
        } else if (Array.isArray(result) && result.length > 0) {
          passedTests++;
        } else if (typeof result === 'number' && result > 0) {
          passedTests++;
        }
      }
    }
    
    const successRate = totalTests > 0 ? (passedTests / totalTests * 100) : 0;
    console.log(`📊 Overall Success Rate: ${successRate.toFixed(1)}% (${passedTests}/${totalTests} tests passed)`);
    console.log();
    
    // Detailed results
    for (const category in this.testResults) {
      console.log(`📂 ${category.toUpperCase().replace(/_/g, ' ')}:`);
      const tests = this.testResults[category];
      for (const testName in tests) {
        const result = tests[testName];
        const status = this.getTestStatus(result);
        console.log(`  ${status} ${testName}: ${this.formatResult(result)}`);
      }
      console.log();
    }
    
    // Critical systems status
    console.log("🔍 CRITICAL ELECTRON SYSTEMS STATUS:");
    const criticalSystems = [
      ("File Structure", this.testResults.file_structure.structure_complete),
      ("Main Process Config", this.testResults.main_process.package_main),
      ("Preload Security", this.testResults.preload_security.is_secure),
      ("Backend Integration", this.testResults.backend_services.all_services_imported),
      ("IPC Handlers", this.testResults.ipc_handlers.all_handlers_defined)
    ];
    
    for (const [systemName, status] of criticalSystems) {
      const statusIcon = status ? "🟢" : "🔴";
      console.log(`  ${statusIcon} ${systemName}: ${status ? 'OPERATIONAL' : 'FAILED'}`);
    }
    
    console.log("\n" + "=".repeat(80));
    
    // Save report
    const reportPath = path.join(__dirname, 'electron_integration_test_report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: Date.now(),
      duration,
      success_rate: successRate,
      passed_tests: passedTests,
      total_tests: totalTests,
      results: this.testResults
    }, null, 2));
    
    this.log(`📄 Detailed report saved to: ${reportPath}`, "INFO");
  }

  getTestStatus(result) {
    if (typeof result === 'boolean') {
      return result ? "✅" : "❌";
    } else if (Array.isArray(result)) {
      return result.length > 0 ? "✅" : "❌";
    } else if (typeof result === 'number') {
      return result > 0 ? "✅" : "❌";
    } else if (typeof result === 'string') {
      return result.includes('error') || result.includes('Missing') ? "❌" : "✅";
    }
    return "⚠️";
  }

  formatResult(result) {
    if (typeof result === 'boolean') {
      return result ? "PASS" : "FAIL";
    } else if (Array.isArray(result)) {
      return `${result.length} items`;
    } else if (typeof result === 'number') {
      return result.toString();
    } else if (typeof result === 'string') {
      return result;
    }
    return "N/A";
  }
}

async function main() {
  console.log("🚀 KAiro Browser Electron Integration Testing Suite");
  console.log("=".repeat(60));
  
  const tester = new ElectronIntegrationTester();
  const success = await tester.runAllTests();
  
  if (success) {
    console.log("\n✅ Electron integration testing completed!");
    return 0;
  } else {
    console.log("\n❌ Electron integration testing completed with errors!");
    return 1;
  }
}

if (require.main === module) {
  main().then(code => process.exit(code));
}

module.exports = { ElectronIntegrationTester };