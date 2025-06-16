import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs/promises';
import { DemoConfig, ExecutionPath, ExecutionStep } from '../types';
import { StorageManager } from '../utils/storageManager';

interface MousePosition {
  x: number;
  y: number;
}

export class InteractivePlaywrightExecutor {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: DemoConfig;
  private storageManager: StorageManager;
  private currentMousePos: MousePosition = { x: 0, y: 0 };

  constructor(config: DemoConfig) {
    this.config = config;
    this.storageManager = new StorageManager(config);
  }

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: false,
      args: ['--start-maximized']
    });

    this.context = await this.browser.newContext({
      viewport: this.config.viewport || { width: 1280, height: 720 },
      recordVideo: {
        dir: path.join(this.config.outputPath, 'videos'),
        size: this.config.viewport || { width: 1280, height: 720 }
      }
    });
  }

  private async smoothMouseMove(to: MousePosition, duration: number = 1000): Promise<void> {
    if (!this.page) return;
    
    const steps = 30;
    const from = this.currentMousePos;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      // Easing function for natural movement
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const x = from.x + (to.x - from.x) * easeProgress;
      const y = from.y + (to.y - from.y) * easeProgress;
      
      await this.page.mouse.move(x, y);
      await this.page.waitForTimeout(duration / steps);
    }
    
    this.currentMousePos = to;
  }

  private async moveToElement(selector: string): Promise<void> {
    if (!this.page) return;
    
    const element = await this.page.waitForSelector(selector, { timeout: 5000 });
    if (!element) return;
    
    const box = await element.boundingBox();
    if (!box) return;
    
    // Add some randomness to make it more natural
    const targetX = box.x + box.width / 2 + (Math.random() - 0.5) * 10;
    const targetY = box.y + box.height / 2 + (Math.random() - 0.5) * 10;
    
    await this.smoothMouseMove({ x: targetX, y: targetY });
  }

  private async humanClick(selector: string): Promise<void> {
    if (!this.page) return;
    
    // Move to element
    await this.moveToElement(selector);
    
    // Small pause before click (human hesitation)
    await this.page.waitForTimeout(200 + Math.random() * 300);
    
    // Hover effect
    await this.page.hover(selector);
    await this.page.waitForTimeout(100);
    
    // Click with slight delay
    await this.page.click(selector, {
      delay: 50 + Math.random() * 100 // Random click duration
    });
  }

  private async humanType(selector: string, text: string): Promise<void> {
    if (!this.page) return;
    
    // Click on input field
    await this.humanClick(selector);
    await this.page.waitForTimeout(300);
    
    // Clear existing text (Ctrl+A, Delete)
    await this.page.keyboard.press('Control+A');
    await this.page.waitForTimeout(100);
    await this.page.keyboard.press('Delete');
    await this.page.waitForTimeout(200);
    
    // Type with variable speed
    for (const char of text) {
      await this.page.keyboard.type(char);
      // Variable typing speed (60-120 WPM)
      await this.page.waitForTimeout(50 + Math.random() * 150);
    }
  }

  private async scrollToElement(selector: string): Promise<void> {
    if (!this.page) return;
    
    const element = await this.page.$(selector);
    if (!element) return;
    
    // Smooth scroll to element
    await this.page.evaluate((sel) => {
      const elem = document.querySelector(sel);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, selector);
    
    await this.page.waitForTimeout(1000);
  }

  async executeDemoWithInteractions(executionPath: ExecutionPath): Promise<string> {
    const screenshotDir = await this.storageManager.createScreenshotDirectory(
      executionPath.feature.name
    );

    console.log(`\n🎬 Starting interactive demo for: ${executionPath.feature.name}`);
    
    this.page = await this.context!.newPage();
    
    // Set initial mouse position
    const viewport = this.page.viewportSize();
    if (viewport) {
      this.currentMousePos = { x: viewport.width / 2, y: viewport.height / 2 };
    }

    try {
      // Navigate to the feature
      await this.page.goto(this.config.baseUrl, { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(2000);
      
      // Capture initial state
      await this.captureScreenshot(screenshotDir, 1, 'initial');

      // Execute interactive demo based on feature
      await this.performFeatureDemo(executionPath.feature.name);
      
      // Final screenshot
      await this.captureScreenshot(screenshotDir, 99, 'final');
      
      // Close page to save video
      const videoPath = await this.finalizeVideo(executionPath.feature.name);
      console.log(`   ✅ Demo completed: ${executionPath.feature.name}`);
      
      return videoPath;
      
    } catch (error) {
      console.error(`   ❌ Failed demo for ${executionPath.feature.name}:`, error);
      await this.captureScreenshot(screenshotDir, 999, 'error');
      throw error;
    }
  }

  private async performFeatureDemo(featureName: string): Promise<void> {
    if (!this.page) return;

    switch (featureName.toLowerCase()) {
      case 'dashboard':
        await this.demoDashboard();
        break;
      case 'analytics':
        await this.demoAnalytics();
        break;
      case 'usermanagement':
        await this.demoUserManagement();
        break;
      case 'settings':
        await this.demoSettings();
        break;
      default:
        await this.demoGenericFeature(featureName);
    }
  }

  private async demoDashboard(): Promise<void> {
    if (!this.page) return;
    
    console.log('   📊 Demonstrating Dashboard interactions...');
    
    // Navigate to dashboard
    await this.humanClick('[data-testid="nav-dashboard"]');
    await this.page.waitForTimeout(1500);
    
    // Interact with time range selector
    await this.humanClick('[data-testid="time-range-selector"]');
    await this.page.waitForTimeout(800);
    
    // Select an option if dropdown appears
    const optionSelector = '[data-testid="time-range-7d"]';
    if (await this.page.$(optionSelector)) {
      await this.humanClick(optionSelector);
    }
    
    // Hover over chart elements
    const chartSelector = '[data-testid="revenue-chart"]';
    if (await this.page.$(chartSelector)) {
      await this.moveToElement(chartSelector);
      await this.page.waitForTimeout(1000);
      
      // Simulate hovering over different data points
      const box = await this.page.$eval(chartSelector, el => el.getBoundingClientRect());
      for (let i = 0; i < 3; i++) {
        const x = box.x + (box.width * (i + 1)) / 4;
        const y = box.y + box.height / 2;
        await this.smoothMouseMove({ x, y }, 500);
        await this.page.waitForTimeout(800);
      }
    }
    
    // Click refresh button
    await this.humanClick('[data-testid="refresh-dashboard"]');
    await this.page.waitForTimeout(2000);
  }

  private async demoAnalytics(): Promise<void> {
    if (!this.page) return;
    
    console.log('   📈 Demonstrating Analytics interactions...');
    
    // Navigate to analytics
    await this.humanClick('[data-testid="nav-analytics"]');
    await this.page.waitForTimeout(1500);
    
    // Interact with metric cards
    const metricCards = await this.page.$$('[data-testid^="metric-"]');
    for (let i = 0; i < Math.min(3, metricCards.length); i++) {
      await this.moveToElement(`[data-testid^="metric-"]:nth-of-type(${i + 1})`);
      await this.page.waitForTimeout(800);
    }
    
    // Export data
    await this.humanClick('[data-testid="export-csv"]');
    await this.page.waitForTimeout(1000);
    
    // Schedule report
    await this.humanClick('[data-testid="schedule-report"]');
    await this.page.waitForTimeout(1500);
    
    // Close modal if it appears
    const closeButton = '[data-testid="modal-close"]';
    if (await this.page.$(closeButton)) {
      await this.humanClick(closeButton);
    }
  }

  private async demoUserManagement(): Promise<void> {
    if (!this.page) return;
    
    console.log('   👥 Demonstrating User Management interactions...');
    
    // Navigate to users
    await this.humanClick('[data-testid="nav-users"]');
    await this.page.waitForTimeout(1500);
    
    // Search for a user
    await this.humanType('[data-testid="user-search"]', 'John');
    await this.page.waitForTimeout(1000);
    
    // Change filter
    await this.humanClick('[data-testid="filter-status"]');
    await this.page.waitForTimeout(500);
    
    const activeOption = '[data-testid="filter-option-active"]';
    if (await this.page.$(activeOption)) {
      await this.humanClick(activeOption);
    }
    
    // Click add user button
    await this.humanClick('[data-testid="add-user-button"]');
    await this.page.waitForTimeout(1000);
    
    // Fill in user form if modal appears
    if (await this.page.$('[data-testid="input-name"]')) {
      await this.humanType('[data-testid="input-name"]', 'Jane Smith');
      await this.page.waitForTimeout(500);
      await this.humanType('[data-testid="input-email"]', 'jane@example.com');
      await this.page.waitForTimeout(500);
      
      // Cancel instead of submit for demo
      await this.humanClick('[data-testid="cancel-button"]');
    }
  }

  private async demoSettings(): Promise<void> {
    if (!this.page) return;
    
    console.log('   ⚙️ Demonstrating Settings interactions...');
    
    // Navigate to settings
    await this.humanClick('[data-testid="nav-settings"]');
    await this.page.waitForTimeout(1500);
    
    // Change app name
    await this.humanType('[data-testid="app-name-input"]', 'My Demo App');
    await this.page.waitForTimeout(800);
    
    // Toggle theme
    await this.humanClick('[data-testid="theme-dark"]');
    await this.page.waitForTimeout(1000);
    
    // Scroll to security section
    await this.scrollToElement('[data-testid="security-section"]');
    
    // Toggle 2FA
    await this.humanClick('[data-testid="toggle-2fa"]');
    await this.page.waitForTimeout(800);
    
    // Save settings
    await this.humanClick('[data-testid="save-general-settings"]');
    await this.page.waitForTimeout(1500);
  }

  private async demoGenericFeature(featureName: string): Promise<void> {
    if (!this.page) return;
    
    console.log(`   🎯 Demonstrating ${featureName} with generic interactions...`);
    
    // Try to navigate using feature name
    const navSelector = `[data-testid="nav-${featureName.toLowerCase()}"]`;
    if (await this.page.$(navSelector)) {
      await this.humanClick(navSelector);
      await this.page.waitForTimeout(1500);
    }
    
    // Find and interact with clickable elements
    const clickableElements = await this.page.$$('[data-testid*="button"], [data-testid*="link"]');
    for (let i = 0; i < Math.min(3, clickableElements.length); i++) {
      const element = clickableElements[i];
      const box = await element.boundingBox();
      if (box) {
        await this.smoothMouseMove({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
        await this.page.waitForTimeout(800);
      }
    }
    
    // Scroll through the page
    await this.page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' });
    });
    await this.page.waitForTimeout(1500);
  }

  private async captureScreenshot(dir: string, step: number, name: string): Promise<void> {
    if (!this.page) return;
    
    const fileName = `step-${step.toString().padStart(3, '0')}-${name}.png`;
    await this.page.screenshot({
      path: path.join(dir, fileName),
      fullPage: false
    });
  }

  private async finalizeVideo(featureName: string): Promise<string> {
    if (!this.page) {
      throw new Error('No page available');
    }

    await this.page.close();
    
    const videoPath = await this.page.video()?.path();
    
    if (videoPath) {
      const newVideoPath = path.join(
        path.dirname(videoPath),
        `${featureName}-interactive-demo.webm`
      );
      
      await fs.rename(videoPath, newVideoPath);
      return newVideoPath;
    }

    throw new Error('Video recording failed');
  }

  async cleanup(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }

  async executeAllInteractiveDemos(executionPaths: ExecutionPath[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    try {
      await this.initialize();
      
      for (const path of executionPaths) {
        try {
          const videoPath = await this.executeDemoWithInteractions(path);
          results.set(path.feature.name, videoPath);
        } catch (error) {
          console.error(`Failed to create interactive demo for ${path.feature.name}:`, error);
          results.set(path.feature.name, 'FAILED');
        }
      }
      
    } finally {
      await this.cleanup();
    }
    
    return results;
  }
}