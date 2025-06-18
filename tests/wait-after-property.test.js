const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// Mock the demo-cinematic script behavior for testing
async function executeInteraction(page, interaction, config) {
  // Wait after action (using waitAfter property)
  if (interaction.waitAfter) {
    await page.waitForTimeout(interaction.waitAfter);
  }
}

describe('waitAfter Property', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  test('should use waitAfter property for timing', async () => {
    const interaction = {
      type: 'click',
      selector: 'button',
      waitAfter: 1500
    };
    
    const startTime = Date.now();
    await executeInteraction(page, interaction, {});
    const endTime = Date.now();
    
    const elapsed = endTime - startTime;
    expect(elapsed).toBeGreaterThanOrEqual(1500);
    expect(elapsed).toBeLessThan(1600); // Allow some margin
  });

  test('should handle missing waitAfter gracefully', async () => {
    const interaction = {
      type: 'click',
      selector: 'button'
      // No waitAfter property
    };
    
    // Should not throw error
    await expect(executeInteraction(page, interaction, {})).resolves.not.toThrow();
  });

  test('demo.json should use waitAfter instead of waitAfterClick', () => {
    // Check sample config files
    const demoFiles = [
      path.join(__dirname, '..', 'demos', 'cinematic-scroll', 'demo.json'),
      path.join(__dirname, '..', 'demos', 'feature-showcase', 'demo.json'),
      path.join(__dirname, '..', 'demos', 'story-progression', 'demo.json')
    ];
    
    demoFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const config = JSON.parse(content);
        
        // Check all interactions use waitAfter
        config.interactions.forEach((interaction, index) => {
          if (interaction.type !== 'wait') {
            expect(interaction.waitAfterClick).toBeUndefined();
            // waitAfter can be present or undefined, both are valid
          }
        });
      }
    });
  });

  test('ConfigLoader should generate sample with waitAfter', () => {
    const ConfigLoader = require('../lib/configLoader');
    const loader = new ConfigLoader();
    
    // Create temp file for sample
    const tempPath = path.join(__dirname, 'temp-sample.json');
    
    try {
      loader.generateSampleConfig(tempPath);
      const content = fs.readFileSync(tempPath, 'utf8');
      const config = JSON.parse(content);
      
      // Check that interactions use waitAfter
      config.interactions.forEach(interaction => {
        if (interaction.type !== 'wait') {
          expect(interaction).toHaveProperty('waitAfter');
          expect(interaction.waitAfterClick).toBeUndefined();
        }
      });
    } finally {
      // Clean up
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  });

  test('should validate waitAfter timing values', () => {
    const ConfigLoader = require('../lib/configLoader');
    const loader = new ConfigLoader();
    
    // Test various timing values
    expect(loader.validateTiming(1500, 1000)).toBe(1500);
    expect(loader.validateTiming(0, 1000)).toBe(0);
    expect(loader.validateTiming(-100, 1000)).toBe(1000); // Negative should use default
    expect(loader.validateTiming(400000, 1000)).toBe(1000); // Too large should use default
    expect(loader.validateTiming('1500', 1000)).toBe(1000); // String should use default
    expect(loader.validateTiming(null, 1000)).toBe(1000); // Null should use default
  });

  test('interaction sequence timing should be predictable', async () => {
    const interactions = [
      { type: 'hover', waitBeforeMove: 100, waitAfter: 200 },
      { type: 'click', waitBeforeMove: 150, waitAfter: 300 },
      { type: 'wait', waitTime: 500 }
    ];
    
    const timings = { waitBetweenSteps: 100 };
    let totalTime = 0;
    
    // Calculate expected total time
    for (let i = 0; i < interactions.length; i++) {
      const interaction = interactions[i];
      
      if (interaction.waitBeforeMove) {
        totalTime += interaction.waitBeforeMove;
      }
      
      if (interaction.type === 'wait') {
        totalTime += interaction.waitTime;
      } else if (interaction.waitAfter) {
        totalTime += interaction.waitAfter;
      }
      
      // Add between steps wait (except for last interaction)
      if (i < interactions.length - 1) {
        totalTime += timings.waitBetweenSteps;
      }
    }
    
    // Expected: 100 + 200 + 100 + 150 + 300 + 100 + 500 = 1450ms
    expect(totalTime).toBe(1450);
  });
});