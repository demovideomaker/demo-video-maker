#!/usr/bin/env node

import { InteractiveSetupWizard } from './setupWizard';
import { ClaudeNarrator, createNarratedSetup } from './claudeNarrator';
// import * as chalk from 'chalk';
import { execSync } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

class EnhancedSetupWizard extends InteractiveSetupWizard {
  private narrator: ClaudeNarrator;
  private narrationCallbacks: ReturnType<typeof createNarratedSetup>;

  constructor() {
    super();
    this.narrator = new ClaudeNarrator(true);
    this.narrationCallbacks = createNarratedSetup();
  }

  async run(): Promise<void> {
    console.clear();
    await this.showWelcomeBanner();
    
    await this.narrator.narrate({
      type: 'info',
      message: 'Welcome! I\'m Claude, and I\'ll guide you through setting up the Demo Video Automation tool.',
      detail: 'I\'ll check your environment, explain what\'s needed, and help fix any issues we find.'
    });

    await this.narrator.explainPermissions();
    
    await this.waitForInput('\nPress Enter when you\'re ready to begin the setup...');

    // Run the parent setup with enhanced narration
    await super.run();
  }

  private async showWelcomeBanner(): Promise<void> {
    const banner = `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🎬 Demo Video Automation - Interactive Setup            ║
║                                                           ║
║  Powered by Claude Code Assistant                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`;
    console.log(banner);
  }

  async runStep(step: any): Promise<void> {
    // Provide context before each step
    await this.narrationCallbacks.beforeStep(step.id);
    
    try {
      await super.runStep(step);
      
      if (this.state.completed.includes(step.id)) {
        await this.narrationCallbacks.onSuccess(step.name);
      }
    } catch (error: any) {
      await this.narrationCallbacks.onError(error.message || error);
      throw error;
    }
  }

  async complete(): Promise<void> {
    await super.complete();
    await this.narrationCallbacks.onComplete();
    
    // Offer to start the demo
    const startDemo = await this.askYesNo('\nWould you like to start the demo app now?');
    
    if (startDemo) {
      await this.startDemoApp();
    }
  }

  private async startDemoApp(): Promise<void> {
    await this.narrator.narrate({
      type: 'action',
      message: 'Starting the demo application...',
      detail: 'This will open in a new terminal window'
    });

    try {
      // Check OS and open new terminal
      if (process.platform === 'darwin') {
        // macOS
        execSync(`osascript -e 'tell app "Terminal" to do script "cd ${process.cwd()}/demo-app && npm run dev"'`);
      } else if (process.platform === 'win32') {
        // Windows
        execSync(`start cmd /k "cd ${process.cwd()}\\demo-app && npm run dev"`);
      } else {
        // Linux/Other
        console.log('\nPlease open a new terminal and run:');
        console.log('  cd demo-app && npm run dev\n');
      }

      await this.narrator.narrate({
        type: 'success',
        message: 'Demo app starting!',
        detail: 'Wait for it to load at http://localhost:3000',
        suggestion: 'Once loaded, run: npm run demo ./demo-app http://localhost:3000'
      });
    } catch (error) {
      await this.narrator.narrate({
        type: 'warning',
        message: 'Could not automatically start the demo app',
        suggestion: 'Please manually run: cd demo-app && npm run dev'
      });
    }
  }
}

// Advanced permission checker with real-time updates
export class PermissionMonitor {
  private permissions: Map<string, boolean> = new Map();
  private narrator: ClaudeNarrator;

  constructor() {
    this.narrator = new ClaudeNarrator();
  }

  async monitor(): Promise<void> {
    console.log('\n🔍 Real-time Permission Monitor');
    console.log('Watching for permission changes...\n');

    // Set up file system watcher for permission changes
    if (process.platform === 'darwin') {
      this.watchMacOSPermissions();
    }

    // Check permissions every 2 seconds
    setInterval(async () => {
      await this.checkAllPermissions();
    }, 2000);
  }

  private async checkAllPermissions(): Promise<void> {
    const checks = [
      { name: 'file-write', check: this.canWriteFiles },
      { name: 'network', check: this.canAccessNetwork },
      { name: 'screen-record', check: this.canRecordScreen }
    ];

    for (const { name, check } of checks) {
      const current = await check();
      const previous = this.permissions.get(name);

      if (previous !== undefined && previous !== current) {
        if (current) {
          await this.narrator.narrate({
            type: 'success',
            message: `Permission granted: ${name}`,
            detail: 'Permission has been successfully enabled'
          });
        } else {
          await this.narrator.narrate({
            type: 'warning',
            message: `Permission revoked: ${name}`,
            detail: 'Permission has been disabled or removed'
          });
        }
      }

      this.permissions.set(name, current);
    }
  }

  private async canWriteFiles(): Promise<boolean> {
    try {
      const testFile = path.join(process.cwd(), '.perm-test');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      return true;
    } catch {
      return false;
    }
  }

  private async canAccessNetwork(): Promise<boolean> {
    try {
      execSync('ping -c 1 localhost', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  private async canRecordScreen(): Promise<boolean> {
    if (process.platform !== 'darwin') return true;
    
    // On macOS, check if screen recording permission is in TCC database
    try {
      const result = execSync(
        'sqlite3 ~/Library/Application\\ Support/com.apple.TCC/TCC.db "SELECT allowed FROM access WHERE service=\'kTCCServiceScreenCapture\' AND client=\'com.apple.Terminal\'"',
        { stdio: 'pipe' }
      ).toString().trim();
      
      return result === '1';
    } catch {
      // Can't check directly, assume not granted
      return false;
    }
  }

  private watchMacOSPermissions(): void {
    // Watch TCC database for changes (macOS only)
    try {
      const tccPath = path.join(process.env.HOME!, 'Library/Application Support/com.apple.TCC/TCC.db');
      
      // Note: This is a simplified example. In reality, watching TCC.db directly
      // requires special permissions. This demonstrates the concept.
      console.log('Monitoring macOS permission changes...');
    } catch (error) {
      // Silently fail if we can't watch
    }
  }
}

// Main entry point
if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2);
    
    if (args.includes('--monitor')) {
      // Run permission monitor
      const monitor = new PermissionMonitor();
      await monitor.monitor();
    } else {
      // Run setup wizard
      const wizard = new EnhancedSetupWizard();
      try {
        await wizard.run();
      } catch (error: any) {
        console.error('\n❌ Setup failed:', error.message);
        process.exit(1);
      }
    }
  })();
}