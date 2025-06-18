const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

describe('Viewport Bounds Protection', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage({
      viewport: { width: 1920, height: 1080 }
    });
  });

  afterEach(async () => {
    await page.close();
  });

  test('should prevent zoom out below 1.0', async () => {
    const scriptPath = path.join(__dirname, '..', 'lib', 'cinematicEffectsLite.js');
    const script = fs.readFileSync(scriptPath, 'utf8');
    
    await page.goto('data:text/html,<html><body><h1>Test Page</h1></body></html>');
    await page.evaluate(script);
    
    // Try to zoom out below 1.0
    await page.evaluate(() => {
      window.cinematicControl.zoomTo(0.5, 960, 540);
    });
    
    const currentZoom = await page.evaluate(() => {
      return window.cinematicControl.currentZoom;
    });
    
    expect(currentZoom).toBe(1.0);
  });

  test('should clamp zoom to minimum 1.0 for any value below', async () => {
    const scriptPath = path.join(__dirname, '..', 'lib', 'cinematicEffectsLite.js');
    const script = fs.readFileSync(scriptPath, 'utf8');
    
    await page.goto('data:text/html,<html><body><h1>Test Page</h1></body></html>');
    await page.evaluate(script);
    
    const testValues = [0.1, 0.5, 0.8, 0.9, 0.99];
    
    for (const value of testValues) {
      await page.evaluate((zoomValue) => {
        window.cinematicControl.zoomTo(zoomValue, 960, 540);
      }, value);
      
      const currentZoom = await page.evaluate(() => {
        return window.cinematicControl.currentZoom;
      });
      
      expect(currentZoom).toBe(1.0);
    }
  });

  test('should apply bounds when zoomed in and panning', async () => {
    const scriptPath = path.join(__dirname, '..', 'lib', 'cinematicEffectsLite.js');
    const script = fs.readFileSync(scriptPath, 'utf8');
    
    await page.goto('data:text/html,<html><body style="background: white;"><h1>Test Page</h1></body></html>');
    await page.evaluate(script);
    
    // Zoom in to 2x at far edge
    await page.evaluate(() => {
      window.cinematicControl.zoomTo(2.0, 0, 0); // Top-left corner
    });
    
    // Get transform values
    const transform = await page.evaluate(() => {
      const container = document.getElementById('zoom-container');
      return container.style.transform;
    });
    
    // Transform should be clamped to keep viewport in bounds
    expect(transform).toContain('scale(2)');
    // The translation values should be bounded
    expect(transform).toMatch(/translate\([^)]+\)/);
  });

  test('should maintain viewport coverage at all zoom levels', async () => {
    const scriptPath = path.join(__dirname, '..', 'lib', 'cinematicEffectsLite.js');
    const script = fs.readFileSync(scriptPath, 'utf8');
    
    await page.goto('data:text/html,<html><body><h1>Test Page</h1></body></html>');
    await page.evaluate(script);
    
    // Test various zoom levels and positions
    const testCases = [
      { zoom: 1.0, x: 960, y: 540 },   // Center, no zoom
      { zoom: 1.5, x: 0, y: 0 },       // Top-left, medium zoom
      { zoom: 2.0, x: 1920, y: 1080 }, // Bottom-right, high zoom
      { zoom: 3.0, x: 960, y: 0 },     // Top-center, very high zoom
    ];
    
    for (const testCase of testCases) {
      await page.evaluate(({ zoom, x, y }) => {
        window.cinematicControl.zoomTo(zoom, x, y);
      }, testCase);
      
      // Verify zoom container covers viewport
      const coverage = await page.evaluate(() => {
        const container = document.getElementById('zoom-container');
        const rect = container.getBoundingClientRect();
        return {
          coversViewport: rect.width >= window.innerWidth && rect.height >= window.innerHeight,
          width: rect.width,
          height: rect.height,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight
        };
      });
      
      expect(coverage.coversViewport).toBe(true);
    }
  });

  test('body should have background color to hide edges', async () => {
    const scriptPath = path.join(__dirname, '..', 'lib', 'cinematicEffectsLite.js');
    const script = fs.readFileSync(scriptPath, 'utf8');
    
    await page.goto('data:text/html,<html><body><h1>Test Page</h1></body></html>');
    await page.evaluate(script);
    
    const bodyStyles = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      return {
        backgroundColor: styles.backgroundColor,
        margin: styles.margin,
        overflow: styles.overflow
      };
    });
    
    expect(bodyStyles.backgroundColor).toBe('rgb(10, 10, 10)'); // #0a0a0a
    expect(bodyStyles.margin).toBe('0px');
    expect(bodyStyles.overflow).toBe('hidden');
  });

  test('zoom transitions should respect bounds during animation', async () => {
    const scriptPath = path.join(__dirname, '..', 'lib', 'cinematicEffectsLite.js');
    const script = fs.readFileSync(scriptPath, 'utf8');
    
    await page.goto('data:text/html,<html><body><h1>Test Page</h1></body></html>');
    await page.evaluate(script);
    
    // Start zoomed in at one corner
    await page.evaluate(() => {
      window.cinematicControl.zoomTo(2.5, 100, 100, 0); // Instant
    });
    
    // Transition to opposite corner
    await page.evaluate(() => {
      window.cinematicControl.zoomTo(2.5, 1820, 980, 1000); // 1 second transition
    });
    
    // Check bounds during transition (after 500ms)
    await page.waitForTimeout(500);
    
    const midTransitionCoverage = await page.evaluate(() => {
      const container = document.getElementById('zoom-container');
      const rect = container.getBoundingClientRect();
      // Check if any viewport edges are exposed
      return {
        leftCovered: rect.left <= 0,
        topCovered: rect.top <= 0,
        rightCovered: rect.right >= window.innerWidth,
        bottomCovered: rect.bottom >= window.innerHeight
      };
    });
    
    expect(midTransitionCoverage.leftCovered).toBe(true);
    expect(midTransitionCoverage.topCovered).toBe(true);
    expect(midTransitionCoverage.rightCovered).toBe(true);
    expect(midTransitionCoverage.bottomCovered).toBe(true);
  });
});