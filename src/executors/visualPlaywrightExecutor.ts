import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs/promises';
import { DemoConfig, ExecutionPath, InteractionPlan, InteractionStep } from '../types';
import { StorageManager } from '../utils/storageManager';
import { InteractionAnalyzer } from '../analyzers/interactionAnalyzer';

export class VisualPlaywrightExecutor {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: DemoConfig;
  private storageManager: StorageManager;
  private interactionAnalyzer: InteractionAnalyzer;

  constructor(config: DemoConfig) {
    this.config = config;
    this.storageManager = new StorageManager(config);
    this.interactionAnalyzer = new InteractionAnalyzer();
  }

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: false,
      args: ['--start-maximized', '--force-device-scale-factor=1']
    });

    this.context = await this.browser.newContext({
      viewport: this.config.viewport || { width: 1280, height: 720 },
      recordVideo: {
        dir: path.join(this.config.outputPath, 'videos'),
        size: this.config.viewport || { width: 1280, height: 720 }
      }
    });
  }

  private async injectMouseCursor(): Promise<void> {
    if (!this.page) return;

    // Inject a visible mouse cursor
    await this.page.addInitScript(() => {
      // Create cursor element
      const cursor = document.createElement('div');
      cursor.id = 'demo-cursor';
      cursor.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
          <path d="M4 4 L20 10 L13 13 L10 20 Z" fill="white" stroke="black" stroke-width="1"/>
        </svg>
      `;
      
      // Style the cursor
      cursor.style.cssText = `
        position: fixed;
        width: 24px;
        height: 24px;
        pointer-events: none;
        z-index: 999999;
        transition: none;
        transform: translate(-2px, -2px);
      `;
      
      document.body.appendChild(cursor);
      
      // Track mouse position
      let mouseX = 0;
      let mouseY = 0;
      
      // Update cursor position
      function updateCursor(x: number, y: number) {
        mouseX = x;
        mouseY = y;
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
      }
      
      // Make it globally accessible
      (window as any).updateDemoCursor = updateCursor;
      (window as any).demoCursorPos = { x: mouseX, y: mouseY };
      
      // Add click animation
      (window as any).animateClick = () => {
        const click = document.createElement('div');
        click.style.cssText = `
          position: fixed;
          left: ${mouseX}px;
          top: ${mouseY}px;
          width: 30px;
          height: 30px;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          pointer-events: none;
          z-index: 999998;
          transform: translate(-15px, -15px);
          animation: clickRipple 0.6s ease-out;
        `;
        
        document.body.appendChild(click);
        
        setTimeout(() => click.remove(), 600);
      };
      
      // Add CSS animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes clickRipple {
          from {
            transform: translate(-15px, -15px) scale(0.5);
            opacity: 1;
          }
          to {
            transform: translate(-15px, -15px) scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    });
  }

  private async moveMouseSmooth(toX: number, toY: number, duration: number = 1000): Promise<void> {
    if (!this.page) return;

    // Get current position
    const fromPos = await this.page.evaluate(() => {
      return (window as any).demoCursorPos || { x: 640, y: 360 };
    });

    const steps = 60; // 60fps
    const stepDuration = duration / steps;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      // Ease-in-out curve
      const ease = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const x = fromPos.x + (toX - fromPos.x) * ease;
      const y = fromPos.y + (toY - fromPos.y) * ease;

      // Update visual cursor
      await this.page.evaluate(({ x, y }) => {
        (window as any).updateDemoCursor(x, y);
      }, { x, y });

      // Move real mouse
      await this.page.mouse.move(x, y);
      
      await this.page.waitForTimeout(stepDuration);
    }

    // Update final position
    await this.page.evaluate(({ x, y }) => {
      (window as any).demoCursorPos = { x, y };
    }, { x: toX, y: toY });
  }

  private async clickWithAnimation(x: number, y: number): Promise<void> {
    if (!this.page) return;

    // Move to position
    await this.moveMouseSmooth(x, y, 800);
    
    // Pause before click
    await this.page.waitForTimeout(200);
    
    // Show click animation
    await this.page.evaluate(() => {
      (window as any).animateClick();
    });
    
    // Perform actual click
    await this.page.mouse.click(x, y);
    
    // Small pause after click
    await this.page.waitForTimeout(300);
  }

  private async executeInteraction(step: InteractionStep): Promise<void> {
    if (!this.page) return;

    console.log(`   → ${step.description}`);

    try {
      // Wait for element
      const element = await this.page.waitForSelector(step.selector, { 
        timeout: 5000,
        state: 'visible'
      });

      if (!element) {
        console.log(`     ⚠️  Element not found: ${step.selector}`);
        return;
      }

      // Get element position
      const box = await element.boundingBox();
      if (!box) return;

      // Calculate click position (center with slight randomness)
      const x = box.x + box.width / 2 + (Math.random() - 0.5) * 4;
      const y = box.y + box.height / 2 + (Math.random() - 0.5) * 4;

      switch (step.action) {
        case 'click':
          await this.clickWithAnimation(x, y);
          break;

        case 'type':
          await this.clickWithAnimation(x, y);
          await this.page.waitForTimeout(300);
          
          // Clear existing text
          await this.page.keyboard.press('Control+A');
          await this.page.waitForTimeout(100);
          await this.page.keyboard.press('Delete');
          await this.page.waitForTimeout(200);
          
          // Type with variable speed
          if (step.value) {
            for (const char of step.value) {
              await this.page.keyboard.type(char);
              await this.page.waitForTimeout(50 + Math.random() * 100);
            }
          }
          break;

        case 'hover':
          await this.moveMouseSmooth(x, y, 600);
          await this.page.waitForTimeout(1000);
          break;

        case 'scroll':
          await this.page.evaluate(() => {
            window.scrollTo({ top: 400, behavior: 'smooth' });
          });
          await this.page.waitForTimeout(1000);
          break;
      }

      // Wait for any animations
      await this.page.waitForTimeout(500);

    } catch (error) {
      console.log(`     ⚠️  Interaction failed: ${error}`);
    }
  }

  async executeVisualDemo(executionPath: ExecutionPath): Promise<string> {
    const screenshotDir = await this.storageManager.createScreenshotDirectory(
      executionPath.feature.name
    );

    console.log(`\n🎬 Creating visual demo for: ${executionPath.feature.name}`);
    
    this.page = await this.context!.newPage();
    
    // Inject cursor before navigation
    await this.injectMouseCursor();

    try {
      // Navigate to the feature
      await this.page.goto(this.config.baseUrl, { waitUntil: 'networkidle' });
      
      // Set initial cursor position
      await this.page.evaluate(() => {
        (window as any).updateDemoCursor(640, 360);
      });
      
      await this.page.waitForTimeout(2000);
      
      // Analyze interactions for this feature
      console.log('   📋 Analyzing interactions...');
      const interactionPlan = await this.interactionAnalyzer.analyzeFeatureInteractions(
        executionPath.feature
      );
      
      console.log(`   🎯 Found ${interactionPlan.steps.length} interactions`);
      
      // Navigate to feature page if needed
      const navStep = interactionPlan.steps.find(s => 
        s.selector.includes('nav') && 
        s.selector.toLowerCase().includes(executionPath.feature.name.toLowerCase())
      );
      
      if (navStep) {
        await this.executeInteraction(navStep);
        await this.page.waitForTimeout(1500);
      }
      
      // Execute planned interactions
      for (const step of interactionPlan.steps) {
        if (step !== navStep) { // Skip if already executed
          await this.executeInteraction(step);
        }
      }
      
      // Final pause
      await this.page.waitForTimeout(2000);
      
      // Close page to save video
      const videoPath = await this.finalizeVideo(executionPath.feature.name);
      console.log(`   ✅ Visual demo completed: ${executionPath.feature.name}`);
      
      return videoPath;
      
    } catch (error) {
      console.error(`   ❌ Failed demo for ${executionPath.feature.name}:`, error);
      throw error;
    }
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
        `${featureName}-visual-demo.webm`
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

  async executeAllVisualDemos(executionPaths: ExecutionPath[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    try {
      await this.initialize();
      
      for (const path of executionPaths) {
        try {
          const videoPath = await this.executeVisualDemo(path);
          results.set(path.feature.name, videoPath);
        } catch (error) {
          console.error(`Failed to create visual demo for ${path.feature.name}:`, error);
          results.set(path.feature.name, 'FAILED');
        }
      }
      
    } finally {
      await this.cleanup();
    }
    
    return results;
  }
}