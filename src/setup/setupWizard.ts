import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

interface SetupStep {
  id: string;
  name: string;
  description: string;
  check: () => Promise<boolean>;
  fix?: () => Promise<void>;
  required: boolean;
}

interface SetupState {
  steps: SetupStep[];
  completed: string[];
  warnings: string[];
  errors: string[];
}

export class InteractiveSetupWizard {
  private rl: readline.Interface;
  private state: SetupState;
  private setupPath: string;

  constructor() {
    this.rl = readline.createInterface({ input, output });
    this.setupPath = path.join(process.cwd(), '.demo-setup-state.json');
    this.state = {
      steps: this.defineSteps(),
      completed: [],
      warnings: [],
      errors: []
    };
  }

  private defineSteps(): SetupStep[] {
    return [
      {
        id: 'node-version',
        name: 'Node.js Version',
        description: 'Checking Node.js version (14.0.0 or higher required)',
        check: this.checkNodeVersion.bind(this),
        required: true
      },
      {
        id: 'npm-installed',
        name: 'NPM Installation',
        description: 'Verifying npm is installed',
        check: this.checkNpmInstalled.bind(this),
        required: true
      },
      {
        id: 'write-permissions',
        name: 'File System Permissions',
        description: 'Checking write permissions in current directory',
        check: this.checkWritePermissions.bind(this),
        fix: this.fixWritePermissions.bind(this),
        required: true
      },
      {
        id: 'playwright-browsers',
        name: 'Playwright Browsers',
        description: 'Checking if Playwright browsers are installed',
        check: this.checkPlaywrightBrowsers.bind(this),
        fix: this.installPlaywrightBrowsers.bind(this),
        required: true
      },
      {
        id: 'screen-recording',
        name: 'Screen Recording Permission',
        description: 'Checking screen recording permissions (macOS)',
        check: this.checkScreenRecordingPermission.bind(this),
        fix: this.requestScreenRecordingPermission.bind(this),
        required: process.platform === 'darwin'
      },
      {
        id: 'demo-app-check',
        name: 'Demo Application',
        description: 'Checking if demo app is set up',
        check: this.checkDemoApp.bind(this),
        fix: this.setupDemoApp.bind(this),
        required: false
      }
    ];
  }

  async run(): Promise<void> {
    console.clear();
    await this.loadState();
    
    console.log('🎬 Demo Video Automation - Interactive Setup Wizard');
    console.log('==================================================\n');
    
    console.log('Welcome! I\'ll guide you through setting up the demo video automation tool.');
    console.log('I\'ll check your environment and help fix any issues.\n');

    await this.waitForInput('Press Enter to begin...');

    for (const step of this.state.steps) {
      if (this.state.completed.includes(step.id)) {
        continue;
      }

      await this.runStep(step);
    }

    await this.complete();
  }

  private async runStep(step: SetupStep): Promise<void> {
    console.log(`\n📋 ${step.name}`);
    console.log(`   ${step.description}\n`);

    try {
      const passed = await step.check();
      
      if (passed) {
        console.log(`   ✅ ${step.name} - OK`);
        this.state.completed.push(step.id);
        await this.saveState();
      } else {
        console.log(`   ❌ ${step.name} - Failed`);
        
        if (step.fix) {
          const shouldFix = await this.askYesNo(`   Would you like me to fix this automatically?`);
          
          if (shouldFix) {
            console.log('   🔧 Attempting to fix...');
            await step.fix();
            
            // Re-check after fix
            const passedAfterFix = await step.check();
            if (passedAfterFix) {
              console.log(`   ✅ ${step.name} - Fixed!`);
              this.state.completed.push(step.id);
              await this.saveState();
            } else {
              console.log(`   ⚠️  Could not fix automatically. Manual intervention required.`);
              if (step.required) {
                await this.handleManualFix(step);
              } else {
                this.state.warnings.push(`Optional step '${step.name}' could not be completed`);
              }
            }
          } else if (step.required) {
            await this.handleManualFix(step);
          } else {
            this.state.warnings.push(`Skipped optional step: ${step.name}`);
          }
        } else if (step.required) {
          console.log(`   ⚠️  This step is required but cannot be fixed automatically.`);
          await this.handleManualFix(step);
        }
      }
    } catch (error) {
      console.error(`   ❌ Error during ${step.name}: ${error}`);
      this.state.errors.push(`${step.name}: ${error}`);
      
      if (step.required) {
        const retry = await this.askYesNo('   Would you like to retry this step?');
        if (retry) {
          await this.runStep(step);
        } else {
          throw new Error(`Required step '${step.name}' failed`);
        }
      }
    }
  }

  private async checkNodeVersion(): Promise<boolean> {
    try {
      const version = process.version;
      const major = parseInt(version.split('.')[0].substring(1));
      console.log(`   Found Node.js ${version}`);
      return major >= 14;
    } catch {
      return false;
    }
  }

  private async checkNpmInstalled(): Promise<boolean> {
    try {
      execSync('npm --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  private async checkWritePermissions(): Promise<boolean> {
    try {
      const testFile = path.join(process.cwd(), '.permission-test');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      return true;
    } catch {
      return false;
    }
  }

  private async fixWritePermissions(): Promise<void> {
    console.log('   📝 Instructions to fix permissions:');
    console.log('   1. Check that you have write access to this directory');
    console.log('   2. On macOS/Linux, you might need to run: chmod -R u+w .');
    console.log('   3. Make sure you\'re not in a read-only file system');
    
    await this.waitForInput('\n   Press Enter after fixing permissions...');
  }

  private async checkPlaywrightBrowsers(): Promise<boolean> {
    try {
      const playwrightPath = path.join(process.cwd(), 'node_modules', '@playwright', 'test');
      await fs.access(playwrightPath);
      
      // Check if browsers are installed
      const browsersPath = path.join(require.resolve('@playwright/test'), '..', '..', '.local-browsers');
      try {
        await fs.access(browsersPath);
        return true;
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }

  private async installPlaywrightBrowsers(): Promise<void> {
    console.log('   Installing Playwright browsers (this may take a few minutes)...');
    try {
      execSync('npx playwright install', { stdio: 'inherit' });
    } catch (error) {
      console.error('   Failed to install Playwright browsers automatically');
      throw error;
    }
  }

  private async checkScreenRecordingPermission(): Promise<boolean> {
    if (process.platform !== 'darwin') {
      return true; // Not macOS, skip
    }

    // On macOS, we can't directly check screen recording permission
    // but we can inform the user
    console.log('   ℹ️  Screen recording permission is required on macOS');
    console.log('   The browser will prompt for permission when recording starts');
    return true;
  }

  private async requestScreenRecordingPermission(): Promise<void> {
    console.log('   📹 Screen Recording Permission (macOS):');
    console.log('   1. When you run the demo, macOS will prompt for permission');
    console.log('   2. Go to System Preferences > Security & Privacy > Screen Recording');
    console.log('   3. Enable permission for your terminal application');
    
    await this.waitForInput('\n   Press Enter to continue...');
  }

  private async checkDemoApp(): Promise<boolean> {
    try {
      const demoAppPath = path.join(process.cwd(), 'demo-app', 'package.json');
      await fs.access(demoAppPath);
      
      // Check if dependencies are installed
      const nodeModulesPath = path.join(process.cwd(), 'demo-app', 'node_modules');
      await fs.access(nodeModulesPath);
      return true;
    } catch {
      return false;
    }
  }

  private async setupDemoApp(): Promise<void> {
    console.log('   Setting up demo application...');
    try {
      process.chdir('demo-app');
      execSync('npm install', { stdio: 'inherit' });
      process.chdir('..');
    } catch (error) {
      console.error('   Failed to set up demo app');
      throw error;
    }
  }

  private async handleManualFix(step: SetupStep): Promise<void> {
    console.log(`\n   ⚠️  Manual action required for: ${step.name}`);
    console.log('   Please fix this issue and then continue.');
    
    let fixed = false;
    while (!fixed) {
      await this.waitForInput('\n   Press Enter to re-check...');
      
      fixed = await step.check();
      if (fixed) {
        console.log(`   ✅ ${step.name} - Now working!`);
        this.state.completed.push(step.id);
        await this.saveState();
      } else {
        const skip = await this.askYesNo('   Still not working. Skip this step? (not recommended)');
        if (skip) {
          this.state.warnings.push(`Skipped required step: ${step.name}`);
          break;
        }
      }
    }
  }

  private async complete(): Promise<void> {
    console.log('\n\n🎉 Setup Complete!');
    console.log('==================\n');

    if (this.state.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      this.state.warnings.forEach(w => console.log(`   - ${w}`));
      console.log('');
    }

    console.log('✅ Your environment is ready for demo video automation!\n');
    
    console.log('🚀 Next Steps:');
    console.log('   1. Start the demo app: cd demo-app && npm run dev');
    console.log('   2. In another terminal: npm run demo ./demo-app http://localhost:3000');
    console.log('   3. Watch as your demo videos are created automatically!\n');

    console.log('📚 For more information:');
    console.log('   - Documentation: https://github.com/yourusername/demo-video-automation');
    console.log('   - Issues: https://github.com/yourusername/demo-video-automation/issues\n');

    // Clean up state file
    try {
      await fs.unlink(this.setupPath);
    } catch {
      // Ignore if file doesn't exist
    }

    this.rl.close();
  }

  private async loadState(): Promise<void> {
    try {
      const data = await fs.readFile(this.setupPath, 'utf-8');
      const savedState = JSON.parse(data);
      this.state.completed = savedState.completed || [];
      this.state.warnings = savedState.warnings || [];
      
      console.log('📂 Found previous setup state, continuing where you left off...\n');
    } catch {
      // No saved state, starting fresh
    }
  }

  private async saveState(): Promise<void> {
    try {
      await fs.writeFile(this.setupPath, JSON.stringify({
        completed: this.state.completed,
        warnings: this.state.warnings,
        timestamp: new Date().toISOString()
      }, null, 2));
    } catch {
      // Ignore save errors
    }
  }

  private async waitForInput(prompt: string): Promise<void> {
    await this.rl.question(prompt);
  }

  private async askYesNo(question: string): Promise<boolean> {
    const answer = await this.rl.question(`${question} (y/n) `);
    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
  }
}

// Run the wizard if called directly
if (require.main === module) {
  const wizard = new InteractiveSetupWizard();
  wizard.run().catch(error => {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  });
}