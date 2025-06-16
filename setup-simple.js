#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🎬 Demo Video Automation - Quick Setup                  ║
║                                                           ║
║  Simple setup without compilation                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

async function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function checkStep(name, checkFn, fixFn = null) {
  console.log(`\n📋 ${name}`);
  
  try {
    const passed = await checkFn();
    
    if (passed) {
      console.log(`   ✅ ${name} - OK`);
      return true;
    } else {
      console.log(`   ❌ ${name} - Failed`);
      
      if (fixFn) {
        const answer = await askQuestion('   Would you like me to fix this automatically? (y/n) ');
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          console.log('   🔧 Attempting to fix...');
          await fixFn();
          
          const passedAfterFix = await checkFn();
          if (passedAfterFix) {
            console.log(`   ✅ ${name} - Fixed!`);
            return true;
          } else {
            console.log(`   ⚠️  Could not fix automatically`);
            return false;
          }
        }
      }
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.split('.')[0].substring(1));
  console.log(`   Found Node.js ${version}`);
  return major >= 14;
}

async function checkNpmInstalled() {
  try {
    execSync('npm --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function checkWritePermissions() {
  try {
    const testFile = path.join(process.cwd(), '.permission-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return true;
  } catch {
    return false;
  }
}

async function checkDemoApp() {
  try {
    const demoAppPath = path.join(process.cwd(), 'demo-app', 'package.json');
    fs.accessSync(demoAppPath);
    
    const nodeModulesPath = path.join(process.cwd(), 'demo-app', 'node_modules');
    fs.accessSync(nodeModulesPath);
    return true;
  } catch {
    return false;
  }
}

async function setupDemoApp() {
  console.log('   Setting up demo application...');
  try {
    process.chdir('demo-app');
    execSync('npm install', { stdio: 'inherit' });
    process.chdir('..');
  } catch (error) {
    console.log('   Failed to set up demo app');
    throw error;
  }
}

async function checkPlaywrightBrowsers() {
  try {
    const playwrightPath = path.join(process.cwd(), 'node_modules', '@playwright', 'test');
    fs.accessSync(playwrightPath);
    return true;
  } catch {
    return false;
  }
}

async function installPlaywrightBrowsers() {
  console.log('   Installing Playwright browsers (this may take a few minutes)...');
  try {
    execSync('npx playwright install', { stdio: 'inherit' });
  } catch (error) {
    console.log('   Failed to install Playwright browsers automatically');
    throw error;
  }
}

async function main() {
  console.log('Welcome! I\'ll guide you through setting up the demo video automation tool.');
  console.log('I\'ll check your environment and help fix any issues.\n');
  
  await askQuestion('Press Enter to begin...');
  
  const steps = [
    {
      name: 'Node.js Version',
      check: checkNodeVersion,
      required: true
    },
    {
      name: 'NPM Installation', 
      check: checkNpmInstalled,
      required: true
    },
    {
      name: 'File System Permissions',
      check: checkWritePermissions,
      required: true
    },
    {
      name: 'Demo Application',
      check: checkDemoApp,
      fix: setupDemoApp,
      required: false
    },
    {
      name: 'Playwright Browsers',
      check: checkPlaywrightBrowsers,
      fix: installPlaywrightBrowsers,
      required: true
    }
  ];
  
  let allPassed = true;
  
  for (const step of steps) {
    const passed = await checkStep(step.name, step.check, step.fix);
    if (!passed && step.required) {
      allPassed = false;
    }
  }
  
  console.log('\n\n🎉 Setup Complete!');
  console.log('==================\n');
  
  if (allPassed) {
    console.log('✅ Your environment is ready for demo video automation!\n');
  } else {
    console.log('⚠️  Some issues remain, but you can still test the tool\n');
  }
  
  console.log('🚀 Next Steps:');
  console.log('   1. Start the demo app: cd demo-app && npm run dev');
  console.log('   2. In another terminal: npm run demo ./demo-app http://localhost:3000');
  console.log('   3. Or test immediately: node demo-now.js\n');
  
  const startDemo = await askQuestion('Would you like to start the demo app now? (y/n) ');
  
  if (startDemo.toLowerCase() === 'y' || startDemo.toLowerCase() === 'yes') {
    console.log('\n🚀 Starting demo app...');
    
    if (process.platform === 'darwin') {
      try {
        execSync(`osascript -e 'tell app "Terminal" to do script "cd ${process.cwd()}/demo-app && npm run dev"'`);
        console.log('✅ Demo app starting in new terminal window!');
        console.log('📝 Wait for "Ready - started server on 0.0.0.0:3000"');
        console.log('🎬 Then run: npm run demo ./demo-app http://localhost:3000');
      } catch {
        console.log('⚠️  Could not open new terminal. Please manually run:');
        console.log('   cd demo-app && npm run dev');
      }
    } else {
      console.log('Please open a new terminal and run:');
      console.log('   cd demo-app && npm run dev');
    }
  }
  
  console.log('\n✨ Setup wizard complete!');
}

main().catch(error => {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
});