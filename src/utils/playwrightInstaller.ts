import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class PlaywrightInstaller {
  private static isInstalled(): boolean {
    try {
      // Check if Playwright browsers are installed
      const playwrightPath = require.resolve('@playwright/test');
      const browsersPath = path.join(path.dirname(playwrightPath), '..', '.local-browsers');
      
      // Check for Chromium specifically
      const chromiumPath = process.platform === 'darwin'
        ? path.join(process.env.HOME!, 'Library/Caches/ms-playwright/chromium-1178/chrome-mac/Chromium.app')
        : path.join(process.env.HOME!, '.cache/ms-playwright/chromium-1178');
        
      return fs.existsSync(chromiumPath) || fs.existsSync(browsersPath);
    } catch {
      return false;
    }
  }
  
  public static async ensureInstalled(): Promise<void> {
    if (this.isInstalled()) {
      console.log('✅ Playwright browsers already installed');
      return;
    }
    
    console.log('🎭 Playwright browsers not found. Installing automatically...');
    console.log('📥 This is a one-time download (may take 2-5 minutes)...\n');
    
    try {
      // Install browsers
      execSync('npx playwright install chromium', { 
        stdio: 'inherit',
        env: { ...process.env, PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS: '1' }
      });
      
      console.log('\n✅ Playwright browsers installed successfully!');
    } catch (error) {
      console.error('\n❌ Failed to install Playwright browsers automatically');
      console.error('Please run manually: npx playwright install');
      throw new Error('Playwright installation failed');
    }
  }
  
  public static async checkAndInstall(): Promise<boolean> {
    try {
      await this.ensureInstalled();
      return true;
    } catch {
      return false;
    }
  }
}