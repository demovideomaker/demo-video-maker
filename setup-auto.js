#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const readline = require('readline');

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🎬 Demo Video Automation - Automated Setup              ║
║                                                           ║
║  Transparent dependency management & auto-fixing         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function log(message, type = 'info') {
  const prefix = {
    info: '📝',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    action: '🔧',
    checking: '🔍'
  };
  console.log(`${prefix[type] || '•'} ${message}`);
}

function execCommand(cmd, options = {}) {
  log(`Running: ${cmd}`, 'action');
  try {
    const result = execSync(cmd, { stdio: 'pipe', ...options });
    return { success: true, output: result.toString() };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout?.toString() || '' };
  }
}

async function checkAndFixDependencies() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('🔍 Dependency Analysis & Auto-Fix');
  console.log('══════════════════════════════════════════════════════\n');
  
  // Step 1: Check package managers
  log('Checking package managers...', 'checking');
  
  const hasNpm = execCommand('npm --version').success;
  const hasYarn = execCommand('yarn --version').success;
  const hasPnpm = execCommand('pnpm --version').success;
  
  log(`npm: ${hasNpm ? 'installed' : 'not found'}`, hasNpm ? 'success' : 'warning');
  log(`yarn: ${hasYarn ? 'installed' : 'not found'}`, hasYarn ? 'success' : 'info');
  log(`pnpm: ${hasPnpm ? 'installed' : 'not found'}`, hasPnpm ? 'success' : 'info');
  
  if (!hasNpm) {
    log('npm is required. Please install Node.js from https://nodejs.org', 'error');
    return false;
  }
  
  // Step 2: Clean and reinstall dependencies
  console.log('\n📦 Cleaning and reinstalling dependencies...\n');
  
  const cleanupSteps = [
    {
      name: 'Clean npm cache',
      cmd: 'npm cache clean --force',
      skipOnFail: true
    },
    {
      name: 'Remove node_modules',
      action: () => {
        const nodeModulesPath = path.join(process.cwd(), 'node_modules');
        if (fs.existsSync(nodeModulesPath)) {
          log('Removing node_modules directory...', 'action');
          execSync(process.platform === 'win32' 
            ? `rmdir /s /q "${nodeModulesPath}"` 
            : `rm -rf "${nodeModulesPath}"`
          );
        }
      }
    },
    {
      name: 'Remove package-lock.json',
      action: () => {
        const lockPath = path.join(process.cwd(), 'package-lock.json');
        if (fs.existsSync(lockPath)) {
          log('Removing package-lock.json...', 'action');
          fs.unlinkSync(lockPath);
        }
      }
    }
  ];
  
  for (const step of cleanupSteps) {
    try {
      if (step.cmd) {
        execCommand(step.cmd);
      } else if (step.action) {
        step.action();
      }
      log(`${step.name} - completed`, 'success');
    } catch (error) {
      if (!step.skipOnFail) {
        log(`${step.name} - failed: ${error.message}`, 'error');
        return false;
      }
    }
  }
  
  // Step 3: Install with specific configurations
  console.log('\n📥 Installing dependencies with optimized settings...\n');
  
  const installCommands = [
    {
      name: 'Set npm registry',
      cmd: 'npm config set registry https://registry.npmjs.org/'
    },
    {
      name: 'Disable strict SSL (temporary)',
      cmd: 'npm config set strict-ssl false',
      revert: 'npm config set strict-ssl true'
    },
    {
      name: 'Install production dependencies',
      cmd: 'npm install --production=false --legacy-peer-deps'
    }
  ];
  
  const revertCommands = [];
  
  for (const step of installCommands) {
    log(`${step.name}...`, 'action');
    const result = execCommand(step.cmd);
    
    if (result.success) {
      log(`${step.name} - completed`, 'success');
      if (step.revert) {
        revertCommands.push(step.revert);
      }
    } else {
      log(`${step.name} - failed`, 'error');
      
      // Try alternative approaches
      if (step.name === 'Install production dependencies') {
        log('Trying alternative installation methods...', 'action');
        
        // Try with different flags
        const alternatives = [
          'npm install --force',
          'npm install --legacy-peer-deps',
          'npm install'
        ];
        
        for (const alt of alternatives) {
          log(`Trying: ${alt}`, 'action');
          const altResult = execCommand(alt);
          if (altResult.success) {
            log('Alternative installation succeeded!', 'success');
            break;
          }
        }
      }
    }
  }
  
  // Revert temporary settings
  for (const cmd of revertCommands) {
    execCommand(cmd);
  }
  
  return true;
}

async function setupDemoApp() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('🚀 Demo App Setup');
  console.log('══════════════════════════════════════════════════════\n');
  
  const demoAppPath = path.join(process.cwd(), 'demo-app');
  
  if (!fs.existsSync(demoAppPath)) {
    log('Demo app directory not found', 'error');
    return false;
  }
  
  log('Setting up demo app dependencies...', 'action');
  
  try {
    // Clean demo app
    const demoNodeModules = path.join(demoAppPath, 'node_modules');
    const demoLock = path.join(demoAppPath, 'package-lock.json');
    
    if (fs.existsSync(demoNodeModules)) {
      log('Cleaning demo app node_modules...', 'action');
      execSync(process.platform === 'win32'
        ? `rmdir /s /q "${demoNodeModules}"`
        : `rm -rf "${demoNodeModules}"`
      );
    }
    
    if (fs.existsSync(demoLock)) {
      fs.unlinkSync(demoLock);
    }
    
    // Install demo app dependencies
    process.chdir(demoAppPath);
    log('Installing demo app dependencies...', 'action');
    
    const result = execCommand('npm install --legacy-peer-deps');
    
    if (!result.success) {
      log('Trying alternative installation for demo app...', 'action');
      execCommand('npm install --force');
    }
    
    process.chdir('..');
    log('Demo app setup completed', 'success');
    return true;
    
  } catch (error) {
    log(`Demo app setup failed: ${error.message}`, 'error');
    process.chdir('..');
    return false;
  }
}

async function installPlaywright() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('🎭 Playwright Setup');
  console.log('══════════════════════════════════════════════════════\n');
  
  log('Checking Playwright installation...', 'checking');
  
  const playwrightPath = path.join(process.cwd(), 'node_modules', '@playwright', 'test');
  
  if (!fs.existsSync(playwrightPath)) {
    log('Playwright not found in node_modules', 'warning');
    log('Installing Playwright...', 'action');
    
    const result = execCommand('npm install @playwright/test --save-dev');
    if (!result.success) {
      log('Failed to install Playwright', 'error');
      return false;
    }
  }
  
  log('Installing Playwright browsers (this may take a few minutes)...', 'action');
  log('Downloading Chromium, Firefox, and WebKit...', 'info');
  
  const browserResult = execCommand('npx playwright install');
  
  if (!browserResult.success) {
    log('Failed to install all browsers, trying Chromium only...', 'warning');
    const chromiumResult = execCommand('npx playwright install chromium');
    
    if (!chromiumResult.success) {
      log('Failed to install Playwright browsers', 'error');
      log('You may need to install them manually: npx playwright install', 'info');
      return false;
    }
  }
  
  log('Playwright setup completed', 'success');
  return true;
}

async function verifySetup() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('✔️  Verification');
  console.log('══════════════════════════════════════════════════════\n');
  
  const checks = [
    {
      name: 'TypeScript files exist',
      check: () => fs.existsSync(path.join(process.cwd(), 'src', 'index.ts'))
    },
    {
      name: 'Demo app exists',
      check: () => fs.existsSync(path.join(process.cwd(), 'demo-app', 'package.json'))
    },
    {
      name: 'Dependencies installed',
      check: () => fs.existsSync(path.join(process.cwd(), 'node_modules'))
    },
    {
      name: 'Playwright installed',
      check: () => fs.existsSync(path.join(process.cwd(), 'node_modules', '@playwright'))
    }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    const passed = check.check();
    log(`${check.name}: ${passed ? 'OK' : 'Failed'}`, passed ? 'success' : 'error');
    if (!passed) allPassed = false;
  }
  
  return allPassed;
}

async function createQuickStart() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('🚀 Creating Quick Start Scripts');
  console.log('══════════════════════════════════════════════════════\n');
  
  // Create a simple run script
  const runScript = `#!/usr/bin/env node
console.log('🎬 Starting Demo Video Automation...\\n');

const { spawn } = require('child_process');
const path = require('path');

// Start demo app
console.log('1. Starting demo app...');
const demoApp = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'demo-app'),
  stdio: 'inherit'
});

// Wait a bit for server to start
setTimeout(() => {
  console.log('\\n2. Running demo generation...');
  const demo = spawn('npm', ['run', 'demo', './demo-app', 'http://localhost:3000'], {
    cwd: __dirname,
    stdio: 'inherit'
  });
  
  demo.on('close', (code) => {
    console.log('\\n✅ Demo generation complete!');
    console.log('📁 Check the demo-output directory for videos');
    demoApp.kill();
    process.exit(0);
  });
}, 5000);
`;
  
  fs.writeFileSync('run-demo.js', runScript);
  execSync('chmod +x run-demo.js');
  
  log('Created run-demo.js for easy execution', 'success');
}

async function main() {
  try {
    console.log('\n🤖 This automated setup will:');
    console.log('   • Clean and reinstall dependencies');
    console.log('   • Handle common npm issues');
    console.log('   • Install Playwright browsers');
    console.log('   • Set up the demo app');
    console.log('   • Create quick-start scripts\n');
    
    const proceed = await askQuestion('Ready to start? (y/n) ');
    
    if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
    
    // Run setup steps
    const steps = [
      { name: 'Dependencies', fn: checkAndFixDependencies },
      { name: 'Demo App', fn: setupDemoApp },
      { name: 'Playwright', fn: installPlaywright },
      { name: 'Quick Start Scripts', fn: createQuickStart }
    ];
    
    for (const step of steps) {
      const success = await step.fn();
      if (!success && step.name !== 'Demo App') {
        log(`${step.name} setup failed, but continuing...`, 'warning');
      }
    }
    
    // Verify setup
    const verified = await verifySetup();
    
    console.log('\n══════════════════════════════════════════════════════');
    console.log(verified ? '✅ Setup Complete!' : '⚠️  Setup Completed with Issues');
    console.log('══════════════════════════════════════════════════════\n');
    
    console.log('📚 Quick Start Options:\n');
    console.log('   1. Run everything automatically:');
    console.log('      node run-demo.js\n');
    
    console.log('   2. Test without compilation:');
    console.log('      node demo-now.js\n');
    
    console.log('   3. Manual steps:');
    console.log('      Terminal 1: cd demo-app && npm run dev');
    console.log('      Terminal 2: npm run demo ./demo-app http://localhost:3000\n');
    
    const runNow = await askQuestion('Would you like to run the demo now? (y/n) ');
    
    if (runNow.toLowerCase() === 'y' || runNow.toLowerCase() === 'yes') {
      console.log('\n🎬 Starting demo...\n');
      require('./run-demo.js');
    }
    
  } catch (error) {
    log(`Setup error: ${error.message}`, 'error');
  } finally {
    rl.close();
  }
}

// Handle interrupts gracefully
process.on('SIGINT', () => {
  console.log('\n\nSetup interrupted. Cleaning up...');
  rl.close();
  process.exit(0);
});

main();