import { EventEmitter } from 'events';
import * as chalk from 'chalk';

interface NarrationEvent {
  type: 'info' | 'success' | 'warning' | 'error' | 'action' | 'thinking';
  message: string;
  detail?: string;
  suggestion?: string;
}

export class ClaudeNarrator extends EventEmitter {
  private isVerbose: boolean;

  constructor(verbose: boolean = false) {
    super();
    this.isVerbose = verbose;
  }

  async narrate(event: NarrationEvent): Promise<void> {
    const timestamp = new Date().toLocaleTimeString();
    let icon = '';
    let color = chalk.white;

    switch (event.type) {
      case 'info':
        icon = '💭';
        color = chalk.blue;
        break;
      case 'success':
        icon = '✅';
        color = chalk.green;
        break;
      case 'warning':
        icon = '⚠️';
        color = chalk.yellow;
        break;
      case 'error':
        icon = '❌';
        color = chalk.red;
        break;
      case 'action':
        icon = '🔧';
        color = chalk.cyan;
        break;
      case 'thinking':
        icon = '🤔';
        color = chalk.magenta;
        break;
    }

    // Main message
    console.log(`\n${icon} ${color.bold(event.message)}`);
    
    if (event.detail && this.isVerbose) {
      console.log(chalk.gray(`   ${event.detail}`));
    }

    if (event.suggestion) {
      console.log(chalk.cyan(`   💡 ${event.suggestion}`));
    }

    // Emit event for external listeners
    this.emit('narration', event);

    // Add slight delay for readability
    await this.delay(300);
  }

  async explainPermissions(): Promise<void> {
    await this.narrate({
      type: 'info',
      message: 'Let me explain the permissions we need:',
      detail: 'Demo video automation requires several permissions to work properly'
    });

    const permissions = [
      {
        name: 'File System Access',
        reason: 'To analyze your code and save videos',
        risk: 'Low - only reads your project files and writes to output directory'
      },
      {
        name: 'Screen Recording (macOS)',
        reason: 'To capture browser interactions as video',
        risk: 'Low - only records the browser window during demos'
      },
      {
        name: 'Network Access',
        reason: 'To load your web application in the browser',
        risk: 'Low - only connects to localhost or specified URLs'
      }
    ];

    for (const perm of permissions) {
      await this.narrate({
        type: 'info',
        message: `${perm.name}:`,
        detail: `Needed for: ${perm.reason}`,
        suggestion: `Risk level: ${perm.risk}`
      });
      await this.delay(500);
    }
  }

  async troubleshoot(error: string): Promise<void> {
    await this.narrate({
      type: 'thinking',
      message: 'Let me analyze this error...'
    });

    await this.delay(1000);

    // Intelligent error analysis
    if (error.includes('EACCES') || error.includes('permission denied')) {
      await this.narrate({
        type: 'error',
        message: 'Permission denied error detected',
        detail: 'The system is blocking access to files or directories',
        suggestion: 'Try: sudo chown -R $(whoami) . or check directory permissions'
      });
    } else if (error.includes('ENOENT')) {
      await this.narrate({
        type: 'error',
        message: 'File or directory not found',
        detail: 'A required file or directory is missing',
        suggestion: 'Make sure you\'re in the right directory and all files are present'
      });
    } else if (error.includes('playwright')) {
      await this.narrate({
        type: 'error',
        message: 'Playwright issue detected',
        detail: 'The browser automation tool is having problems',
        suggestion: 'Try: npx playwright install'
      });
    } else if (error.includes('port') || error.includes('EADDRINUSE')) {
      await this.narrate({
        type: 'error',
        message: 'Port already in use',
        detail: 'Another process is using the required port',
        suggestion: 'Check if your app is already running or use a different port'
      });
    } else {
      await this.narrate({
        type: 'error',
        message: 'Unexpected error occurred',
        detail: error,
        suggestion: 'Check the error message above for more details'
      });
    }
  }

  async provideContextualHelp(step: string): Promise<void> {
    const helps: Record<string, NarrationEvent> = {
      'node-version': {
        type: 'info',
        message: 'Checking your Node.js installation',
        detail: 'Node.js 14+ is required for modern JavaScript features',
        suggestion: 'Visit nodejs.org to download the latest version'
      },
      'playwright-browsers': {
        type: 'info',
        message: 'Setting up browser automation',
        detail: 'Playwright needs to download browser binaries for Chrome, Firefox, and Safari',
        suggestion: 'This is a one-time download of about 300MB'
      },
      'screen-recording': {
        type: 'info',
        message: 'Configuring screen recording',
        detail: 'macOS requires explicit permission for screen recording',
        suggestion: 'You\'ll see a system prompt - click "Allow" to enable recording'
      },
      'demo-app': {
        type: 'info',
        message: 'Preparing the demo application',
        detail: 'Installing a sample Next.js app to demonstrate the tool',
        suggestion: 'This showcases how the tool works with real applications'
      }
    };

    const help = helps[step];
    if (help) {
      await this.narrate(help);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Example usage with the setup wizard
export function createNarratedSetup() {
  const narrator = new ClaudeNarrator(true);
  
  return {
    beforeStep: async (stepId: string) => {
      await narrator.provideContextualHelp(stepId);
    },
    
    onError: async (error: string) => {
      await narrator.troubleshoot(error);
    },
    
    onSuccess: async (stepName: string) => {
      await narrator.narrate({
        type: 'success',
        message: `${stepName} completed successfully!`
      });
    },
    
    onComplete: async () => {
      await narrator.narrate({
        type: 'success',
        message: 'Setup completed! You\'re ready to create demo videos!',
        detail: 'All requirements have been met and permissions configured',
        suggestion: 'Run "npm run demo ./demo-app http://localhost:3000" to start'
      });
    }
  };
}