const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

describe('Cursor Visibility in Video Recordings', () => {
  let browser;
  let context;
  let page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    context = await browser.newContext({
      recordVideo: {
        dir: path.join(__dirname, 'test-videos'),
        size: { width: 1920, height: 1080 }
      }
    });
    page = await context.newPage();
  });

  afterEach(async () => {
    await context.close();
  });

  test('should create visual cursor element on page', async () => {
    // Inject the cinematic effects script
    const scriptPath = path.join(__dirname, '..', 'lib', 'cinematicEffectsLite.js');
    const script = fs.readFileSync(scriptPath, 'utf8');
    
    await page.goto('data:text/html,<html><body><h1>Test Page</h1></body></html>');
    await page.evaluate(script);
    
    // Check if cursor element exists
    const cursorExists = await page.evaluate(() => {
      return document.getElementById('demo-cursor') !== null;
    });
    
    expect(cursorExists).toBe(true);
  });

  test('cursor should have correct styling', async () => {
    const scriptPath = path.join(__dirname, '..', 'lib', 'cinematicEffectsLite.js');
    const script = fs.readFileSync(scriptPath, 'utf8');
    
    await page.goto('data:text/html,<html><body><h1>Test Page</h1></body></html>');
    await page.evaluate(script);
    
    const cursorStyles = await page.evaluate(() => {
      const cursor = document.getElementById('demo-cursor');
      const styles = window.getComputedStyle(cursor);
      return {
        position: styles.position,
        width: styles.width,
        height: styles.height,
        background: styles.background,
        borderRadius: styles.borderRadius,
        pointerEvents: styles.pointerEvents,
        zIndex: styles.zIndex
      };
    });
    
    expect(cursorStyles.position).toBe('fixed');
    expect(cursorStyles.width).toBe('16px');
    expect(cursorStyles.height).toBe('16px');
    expect(cursorStyles.borderRadius).toBe('50%');
    expect(cursorStyles.pointerEvents).toBe('none');
    expect(parseInt(cursorStyles.zIndex)).toBeGreaterThan(1000000);
  });

  test('cursor should update position when updateCameraFollow is called', async () => {
    const scriptPath = path.join(__dirname, '..', 'lib', 'cinematicEffectsLite.js');
    const script = fs.readFileSync(scriptPath, 'utf8');
    
    await page.goto('data:text/html,<html><body><h1>Test Page</h1></body></html>');
    await page.evaluate(script);
    
    // Update cursor position
    await page.evaluate(() => {
      window.cinematicControl.updateCameraFollow(100, 200);
    });
    
    const cursorPosition = await page.evaluate(() => {
      const cursor = document.getElementById('demo-cursor');
      return {
        left: cursor.style.left,
        top: cursor.style.top
      };
    });
    
    expect(cursorPosition.left).toBe('100px');
    expect(cursorPosition.top).toBe('200px');
  });

  test('cursor should animate on click', async () => {
    const scriptPath = path.join(__dirname, '..', 'lib', 'cinematicEffectsLite.js');
    const script = fs.readFileSync(scriptPath, 'utf8');
    
    await page.goto('data:text/html,<html><body><h1>Test Page</h1></body></html>');
    await page.evaluate(script);
    
    // Trigger click animation
    await page.evaluate(() => {
      window.cinematicControl.animateClick(150, 250);
    });
    
    // Check if cursor transform changed
    const cursorTransform = await page.evaluate(() => {
      const cursor = document.getElementById('demo-cursor');
      return cursor.style.transform;
    });
    
    expect(cursorTransform).toContain('scale(0.8)');
    
    // Wait for animation to complete
    await page.waitForTimeout(150);
    
    const cursorTransformAfter = await page.evaluate(() => {
      const cursor = document.getElementById('demo-cursor');
      return cursor.style.transform;
    });
    
    expect(cursorTransformAfter).toContain('scale(1)');
  });

  test('cursor should be visible in video recording area', async () => {
    const scriptPath = path.join(__dirname, '..', 'lib', 'cinematicEffectsLite.js');
    const script = fs.readFileSync(scriptPath, 'utf8');
    
    await page.goto('data:text/html,<html><body style="background: white;"><h1>Test Page</h1></body></html>');
    await page.evaluate(script);
    
    // Move cursor to center of viewport
    await page.evaluate(() => {
      window.cinematicControl.updateCameraFollow(960, 540);
    });
    
    // Take screenshot to verify cursor is visible
    const screenshot = await page.screenshot();
    
    // In a real test, you would analyze the screenshot to verify the blue cursor is visible
    // For now, we just verify the cursor element exists and is positioned correctly
    const cursorInfo = await page.evaluate(() => {
      const cursor = document.getElementById('demo-cursor');
      const rect = cursor.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(cursor);
      return {
        exists: cursor !== null,
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      };
    });
    
    expect(cursorInfo.exists).toBe(true);
    expect(cursorInfo.display).not.toBe('none');
    expect(cursorInfo.visibility).not.toBe('hidden');
    expect(cursorInfo.width).toBeGreaterThan(0);
    expect(cursorInfo.height).toBeGreaterThan(0);
  });
});