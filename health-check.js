// Health Check Script for KAiro Browser
const fs = require('fs')
const path = require('path')
require('dotenv').config()

console.log('🔍 KAiro Browser Health Check')
console.log('================================')

// 1. Environment Variables Check
console.log('\n1. 📋 Environment Variables:')
const requiredVars = ['GROQ_API_KEY', 'APP_NAME', 'APP_VERSION']
let envHealth = true

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName}: Configured`)
  } else {
    console.log(`   ❌ ${varName}: Missing`)
    envHealth = false
  }
})

// 2. File Structure Check
console.log('\n2. 📁 File Structure:')
const criticalFiles = [
  'electron/main.js',
  'electron/preload/preload.js',
  'electron/services/AIService.ts',
  'electron/services/BrowserViewManager.ts',
  'electron/services/SecurityManager.ts',
  'dist/index.html',
  'package.json',
  '.env'
]

let fileHealth = true
criticalFiles.forEach(filePath => {
  if (fs.existsSync(path.join(__dirname, filePath))) {
    console.log(`   ✅ ${filePath}`)
  } else {
    console.log(`   ❌ ${filePath}: Missing`)
    fileHealth = false
  }
})

// 3. Dependencies Check
console.log('\n3. 📦 Dependencies:')
let depsHealth = true
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const criticalDeps = ['electron', 'react', 'groq-sdk', 'typescript', 'vite']
  
  criticalDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep] || packageJson.devDependencies[dep]}`)
    } else {
      console.log(`   ❌ ${dep}: Missing`)
      depsHealth = false
    }
  })
} catch (error) {
  console.log('   ❌ Cannot read package.json')
  depsHealth = false
}

// 4. Build Check
console.log('\n4. 🏗️ Build Status:')
const distExists = fs.existsSync('dist')
const mainBuilt = fs.existsSync('dist/index.html')

if (distExists && mainBuilt) {
  console.log('   ✅ React build: Complete')
  console.log('   ✅ Production files: Ready')
} else {
  console.log('   ❌ Build incomplete - run npm run build:react')
}

// 5. AI Configuration Check
console.log('\n5. 🤖 AI Configuration:')
if (process.env.GROQ_API_KEY) {
  if (process.env.GROQ_API_KEY.startsWith('gsk_')) {
    console.log('   ✅ GROQ API Key: Valid format')
  } else {
    console.log('   ⚠️ GROQ API Key: Invalid format')
  }
} else {
  console.log('   ❌ GROQ API Key: Missing')
}

// 6. Model Configuration Check
console.log('\n6. 📡 Model Configuration:')
try {
  const mainJs = fs.readFileSync('electron/main.js', 'utf8')
  const aiServiceTs = fs.readFileSync('electron/services/AIService.ts', 'utf8')
  
  const mainModel = mainJs.includes('llama-3.3-70b-versatile')
  const serviceModel = aiServiceTs.includes('llama-3.3-70b-versatile')
  
  if (mainModel && serviceModel) {
    console.log('   ✅ Model consistency: All files use llama-3.3-70b-versatile (BEST MODEL)')
    console.log('   🚀 Performance: 70B parameters, advanced reasoning, superior quality')
  } else {
    console.log('   ⚠️ Model inconsistency detected')
    if (!mainModel) console.log('     - main.js needs model update')
    if (!serviceModel) console.log('     - AIService.ts needs model update')
  }
} catch (error) {
  console.log('   ❌ Cannot verify model configuration')
}

// 7. Summary
console.log('\n📊 HEALTH CHECK SUMMARY:')
console.log('========================')

const allChecks = [envHealth, fileHealth, depsHealth && distExists, mainBuilt]
const healthScore = allChecks.filter(Boolean).length / allChecks.length * 100

if (healthScore === 100) {
  console.log('🎉 EXCELLENT: All systems healthy!')
  console.log('✅ Your KAiro Browser is ready to run')
} else if (healthScore >= 80) {
  console.log('👍 GOOD: Most systems healthy')
  console.log('⚠️ Minor issues detected but application should work')
} else if (healthScore >= 60) {
  console.log('⚠️ FAIR: Some issues detected')
  console.log('🔧 Recommended to fix issues before running')
} else {
  console.log('❌ POOR: Major issues detected')
  console.log('🚨 Please fix critical issues before running')
}

console.log(`\n📈 Health Score: ${Math.round(healthScore)}%`)
console.log('\n🚀 To start the application: npm start')
console.log('📚 For testing: npm test')
console.log('🔧 For development: Check README.md for setup instructions')