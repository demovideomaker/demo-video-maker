import { chromium, Browser, Page, BrowserContext } from '@playwright/test';
import * as path from 'path';
import { ExecutionPath, ExecutionStep, DemoConfig, VideoFormat } from '../types';
import { StorageManager } from '../utils/storageManager';

export class PlaywrightExecutor {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: DemoConfig;
  private storageManager: StorageManager;

  constructor(config: DemoConfig) {
    this.config = config;
    this.storageManager = new StorageManager(
      config.storage || {
        baseDir: config.outputPath,
        organizationStrategy: 'feature-based'
      }
    );
  }

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: false,
      slowMo: 100
    });

    const videoDir = path.join(this.config.outputPath, 'videos');
    
    this.context = await this.browser.newContext({
      viewport: this.config.viewport || { width: 1280, height: 720 },
      recordVideo: {
        dir: videoDir,
        size: this.config.viewport || { width: 1280, height: 720 }
      }
    });

    this.page = await this.context.newPage();
  }

  async executeFeatureDemo(executionPath: ExecutionPath): Promise<string> {
    if (!this.page) {
      throw new Error('Playwright not initialized');
    }

    console.log(`Starting demo for feature: ${executionPath.feature.name}`);
    
    const screenshotDir = path.join(
      this.config.outputPath, 
      'screenshots', 
      executionPath.feature.name
    );

    let stepNumber = 0;
    
    for (const step of executionPath.steps) {
      try {
        await this.executeStep(step, screenshotDir, stepNumber);
        stepNumber++;
      } catch (error) {
        console.error(`Error executing step: ${step.description}`, error);
        await this.captureErrorScreenshot(screenshotDir, stepNumber, step);
      }
    }

    const videoPath = await this.finalizeVideo(executionPath.feature.name);
    return videoPath;
  }

  private async executeStep(
    step: ExecutionStep, 
    screenshotDir: string, 
    stepNumber: number
  ): Promise<void> {
    if (!this.page) return;

    console.log(`  Step ${stepNumber + 1}: ${step.description}`);

    switch (step.action) {
      case 'navigate':
        if (step.value) {
          const url = new URL(step.value, this.config.baseUrl).toString();
          await this.page.goto(url);
        }
        break;

      case 'click':
        if (step.selector) {
          await this.page.waitForSelector(step.selector, { state: 'visible' });
          await this.page.click(step.selector);
        }
        break;

      case 'fill':
        if (step.selector && step.value) {
          await this.page.waitForSelector(step.selector, { state: 'visible' });
          await this.page.fill(step.selector, step.value);
        }
        break;

      case 'hover':
        if (step.selector) {
          await this.page.waitForSelector(step.selector, { state: 'visible' });
          await this.page.hover(step.selector);
        }
        break;

      case 'waitForSelector':
        if (step.selector) {
          await this.page.waitForSelector(step.selector, { state: 'visible' });
        }
        break;

      case 'waitForLoadState':
        await this.page.waitForLoadState('networkidle');
        break;

      case 'screenshot':
        await this.captureScreenshot(screenshotDir, stepNumber, step);
        break;

      case 'scroll':
        if (step.selector) {
          await this.page.locator(step.selector).scrollIntoViewIfNeeded();
        } else if (step.value) {
          await this.page.evaluate((scrollAmount: string) => {
            window.scrollBy(0, parseInt(scrollAmount));
          }, step.value);
        }
        break;
    }

    if (step.screenshot && step.action !== 'screenshot') {
      await this.captureScreenshot(screenshotDir, stepNumber, step);
    }

    if (step.wait) {
      await this.page.waitForTimeout(step.wait);
    }
  }

  private async captureScreenshot(
    dir: string, 
    stepNumber: number, 
    step: ExecutionStep
  ): Promise<void> {
    if (!this.page) return;

    const fileName = `step-${stepNumber.toString().padStart(3, '0')}-${
      step.action
    }.png`;
    
    await this.page.screenshot({
      path: path.join(dir, fileName),
      fullPage: step.action === 'screenshot'
    });
  }

  private async captureErrorScreenshot(
    dir: string, 
    stepNumber: number, 
    step: ExecutionStep
  ): Promise<void> {
    if (!this.page) return;

    const fileName = `error-step-${stepNumber.toString().padStart(3, '0')}-${
      step.action
    }.png`;
    
    await this.page.screenshot({
      path: path.join(dir, fileName),
      fullPage: true
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
        `${featureName}-demo.webm`
      );
      
      const fs = await import('fs/promises');
      await fs.rename(videoPath, newVideoPath);
      
      return newVideoPath;
    }

    throw new Error('Video recording failed');
  }

  async cleanup(): Promise<void> {
    const cleanupTasks = [];
    
    if (this.page) {
      cleanupTasks.push(
        this.page.close().catch(err => console.warn('Page cleanup error:', err))
      );
      this.page = null;
    }
    
    if (this.context) {
      cleanupTasks.push(
        this.context.close().catch(err => console.warn('Context cleanup error:', err))
      );
      this.context = null;
    }
    
    if (this.browser) {
      cleanupTasks.push(
        this.browser.close().catch(err => console.warn('Browser cleanup error:', err))
      );
      this.browser = null;
    }

    // Wait for all cleanup tasks with timeout
    try {
      await Promise.race([
        Promise.all(cleanupTasks),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Cleanup timeout')), 10000)
        )
      ]);
    } catch (error) {
      console.warn('Cleanup timeout or error:', error);
    }
  }

  async executeAllDemos(executionPaths: ExecutionPath[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    for (const path of executionPaths) {
      try {
        await this.initialize();
        
        // Execute with timeout protection
        const videoPath = await Promise.race([
          this.executeFeatureDemo(path),
          new Promise<string>((_, reject) => 
            setTimeout(() => reject(new Error('Demo execution timeout')), 300000) // 5 minutes
          )
        ]);
        
        results.set(path.feature.name, videoPath);
      } catch (error) {
        console.error(`Failed to create demo for ${path.feature.name}:`, error);
        results.set(path.feature.name, 'FAILED');
      } finally {
        // Always cleanup, even on error
        await this.cleanup();
      }
    }

    return results;
  }
}