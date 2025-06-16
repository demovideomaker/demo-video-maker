#!/usr/bin/env node

/**
 * Dependency Doctor - Diagnoses and fixes common npm issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🏥 Dependency Doctor                                    ║
║                                                           ║
║  Automated diagnosis and treatment of npm issues         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

function diagnose() {
  console.log('\n🔍 Diagnosing issues...\n');
  
  const issues = [];
  
  // Check 1: Node/npm versions
  try {
    const nodeVersion = process.version;
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    
    console.log(`📌 Node.js: ${nodeVersion}`);
    console.log(`📌 npm: ${npmVersion}`);
    
    const nodeMajor = parseInt(nodeVersion.split('.')[0].substring(1));
    if (nodeMajor < 14) {
      issues.push({
        type: 'version',
        severity: 'critical',
        message: 'Node.js version too old (requires 14+)',
        fix: 'Update Node.js from https://nodejs.org'
      });
    }
  } catch (error) {
    issues.push({
      type: 'npm',
      severity: 'critical',
      message: 'npm not found',
      fix: 'Install Node.js from https://nodejs.org'
    });
  }
  
  // Check 2: Package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    issues.push({
      type: 'package',
      severity: 'critical',
      message: 'package.json not found',
      fix: 'Run this script in the project root directory'
    });
    return issues;
  }
  
  // Check 3: Corrupted node_modules
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    try {
      const moduleCount = fs.readdirSync(nodeModulesPath).length;
      console.log(`📦 Found ${moduleCount} packages in node_modules`);
      
      if (moduleCount < 10) {
        issues.push({
          type: 'modules',
          severity: 'warning',
          message: 'Very few packages in node_modules',
          fix: 'Clean reinstall recommended'
        });
      }
    } catch (error) {
      issues.push({
        type: 'modules',
        severity: 'error',
        message: 'Cannot read node_modules',
        fix: 'Delete and reinstall'
      });
    }
  }
  
  // Check 4: Lock file conflicts
  const hasPackageLock = fs.existsSync(path.join(process.cwd(), 'package-lock.json'));
  const hasYarnLock = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));
  const hasPnpmLock = fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'));
  
  const lockFiles = [hasPackageLock, hasYarnLock, hasPnpmLock].filter(Boolean).length;
  if (lockFiles > 1) {
    issues.push({
      type: 'locks',
      severity: 'warning',
      message: 'Multiple lock files detected',
      fix: 'Remove all but one lock file'
    });
  }
  
  // Check 5: npm cache
  try {
    const cacheInfo = execSync('npm cache verify', { encoding: 'utf8' });
    console.log('✅ npm cache verified');
  } catch (error) {
    issues.push({
      type: 'cache',
      severity: 'warning',
      message: 'npm cache may be corrupted',
      fix: 'Clean npm cache'
    });
  }
  
  return issues;
}

function treat(issues) {
  console.log('\n💊 Treatment Plan:\n');
  
  if (issues.length === 0) {
    console.log('✅ No issues found! Your dependencies look healthy.');
    return;
  }
  
  const treatments = {
    cache: () => {
      console.log('🔧 Cleaning npm cache...');
      try {
        execSync('npm cache clean --force', { stdio: 'inherit' });
        console.log('✅ Cache cleaned');
      } catch (error) {
        console.log('❌ Failed to clean cache');
      }
    },
    
    modules: () => {
      console.log('🔧 Removing node_modules...');
      const nodeModulesPath = path.join(process.cwd(), 'node_modules');
      if (fs.existsSync(nodeModulesPath)) {
        if (process.platform === 'win32') {
          execSync(`rmdir /s /q "${nodeModulesPath}"`);
        } else {
          execSync(`rm -rf "${nodeModulesPath}"`);
        }
        console.log('✅ node_modules removed');
      }
    },
    
    locks: () => {
      console.log('🔧 Cleaning lock files...');
      const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
      let kept = null;
      
      for (const file of lockFiles) {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          if (!kept && file === 'package-lock.json') {
            kept = file;
            console.log(`📌 Keeping ${file}`);
          } else {
            fs.unlinkSync(filePath);
            console.log(`🗑️  Removed ${file}`);
          }
        }
      }
    }
  };
  
  // Apply treatments
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  if (criticalIssues.length > 0) {
    console.log('❌ Critical issues found:');
    criticalIssues.forEach(issue => {
      console.log(`   - ${issue.message}`);
      console.log(`     Fix: ${issue.fix}`);
    });
    return;
  }
  
  // Apply automatic fixes
  issues.forEach(issue => {
    if (treatments[issue.type]) {
      treatments[issue.type]();
    }
  });
  
  // Reinstall
  console.log('\n📥 Reinstalling dependencies...\n');
  
  try {
    // Try different installation methods
    const installMethods = [
      { cmd: 'npm ci', desc: 'Clean install from lock file' },
      { cmd: 'npm install --legacy-peer-deps', desc: 'Install with legacy peer deps' },
      { cmd: 'npm install --force', desc: 'Force install' },
      { cmd: 'npm install', desc: 'Standard install' }
    ];
    
    let installed = false;
    
    for (const method of installMethods) {
      console.log(`🔧 Trying: ${method.desc}...`);
      try {
        execSync(method.cmd, { stdio: 'inherit' });
        installed = true;
        console.log(`✅ Installation successful with: ${method.cmd}`);
        break;
      } catch (error) {
        console.log(`❌ Failed: ${method.cmd}`);
      }
    }
    
    if (!installed) {
      console.log('\n❌ All installation methods failed.');
      console.log('   Please check your internet connection and npm configuration.');
    }
    
  } catch (error) {
    console.log('❌ Installation failed:', error.message);
  }
}

function quickFix() {
  console.log('\n⚡ Running Quick Fix Protocol...\n');
  
  const commands = [
    'rm -rf node_modules package-lock.json',
    'npm cache clean --force',
    'npm install --legacy-peer-deps'
  ];
  
  commands.forEach(cmd => {
    console.log(`🔧 Running: ${cmd}`);
    try {
      execSync(cmd, { stdio: 'inherit' });
      console.log('✅ Success\n');
    } catch (error) {
      console.log('❌ Failed\n');
    }
  });
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--quick')) {
  quickFix();
} else {
  const issues = diagnose();
  treat(issues);
}

console.log('\n✨ Dependency Doctor has completed the checkup!');
console.log('\n📚 Next steps:');
console.log('   1. Try the setup again: node setup-auto.js');
console.log('   2. Or test immediately: node demo-now.js');
console.log('   3. If issues persist: node fix-dependencies.js --quick\n');