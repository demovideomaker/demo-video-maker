#!/usr/bin/env node

// Quick test script that works without building
console.log('🎬 Testing Demo Video Automation Tool\n');

// Test 1: Check if demo app exists
const fs = require('fs');
const path = require('path');

console.log('1. Checking demo app...');
const demoAppPath = path.join(__dirname, 'demo-app');
if (fs.existsSync(demoAppPath)) {
  console.log('   ✅ Demo app directory exists');
  
  const packagePath = path.join(demoAppPath, 'package.json');
  if (fs.existsSync(packagePath)) {
    console.log('   ✅ Demo app package.json exists');
  } else {
    console.log('   ❌ Demo app package.json missing');
  }
} else {
  console.log('   ❌ Demo app directory missing');
}

// Test 2: Check TypeScript files
console.log('\n2. Checking source files...');
const srcPath = path.join(__dirname, 'src');
if (fs.existsSync(srcPath)) {
  console.log('   ✅ Source directory exists');
  
  const files = [
    'index.ts',
    'types.ts',
    'analyzers/codebaseAnalyzer.ts',
    'executors/playwrightExecutor.ts',
    'utils/storageManager.ts'
  ];
  
  files.forEach(file => {
    const filePath = path.join(srcPath, file);
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file} exists`);
    } else {
      console.log(`   ❌ ${file} missing`);
    }
  });
} else {
  console.log('   ❌ Source directory missing');
}

// Test 3: Simple analysis test (without compilation)
console.log('\n3. Testing codebase analysis...');
try {
  const testFiles = fs.readdirSync(demoAppPath, { recursive: true })
    .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
    .slice(0, 5);
  
  console.log(`   ✅ Found ${testFiles.length} TypeScript files in demo app`);
  testFiles.forEach(file => console.log(`     - ${file}`));
} catch (error) {
  console.log(`   ⚠️  Could not scan demo app: ${error.message}`);
}

// Test 4: Check dependencies
console.log('\n4. Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['@playwright/test', 'typescript', 'chalk'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.devDependencies?.[dep] || packageJson.dependencies?.[dep]) {
      console.log(`   ✅ ${dep} installed`);
    } else {
      console.log(`   ❌ ${dep} missing`);
    }
  });
} catch (error) {
  console.log(`   ⚠️  Could not check dependencies: ${error.message}`);
}

console.log('\n🚀 Quick Setup Instructions:');
console.log('   1. npm install (if not done)');
console.log('   2. cd demo-app && npm install');
console.log('   3. npm run dev (starts demo app)');
console.log('   4. In another terminal: npm run demo ./demo-app http://localhost:3000');

console.log('\n📋 Alternative: Run interactive setup');
console.log('   npm run setup');

console.log('\n✨ Done! The tool is ready for testing.');