// Test setup file
// Global test configuration and utilities

global.console = {
  ...console,
  // Mock console methods that are expected to be called during tests
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn()
};

// Helper to create temp directories for testing
global.createTempTestDir = () => {
  const path = require('path');
  const fs = require('fs');
  const tempDir = path.join(__dirname, '..', 'temp-test-' + Date.now());
  
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  return tempDir;
};

// Helper to clean up temp directories
global.cleanupTempDir = (dir) => {
  const fs = require('fs');
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

// Mock sample demo.json for testing
global.sampleDemoConfig = {
  name: "Test Demo",
  description: "Sample test configuration",
  entry: {
    url: "/test",
    selector: "[data-testid='test-container']",
    waitTime: 2000
  },
  interactions: [
    {
      type: "click",
      selector: "[data-testid='test-button']",
      waitBeforeMove: 1000,
      waitAfterClick: 1500,
      zoomLevel: 1.8,
      description: "Click test button"
    },
    {
      type: "hover",
      selector: "[data-testid='test-element']",
      waitBeforeMove: 800,
      waitAfterClick: 1000,
      description: "Hover over test element"
    }
  ],
  effects: {
    cameraFollow: true,
    zoomLevel: 1.6,
    glowEffects: true,
    clickAnimations: true,
    mouseMoveSpeed: 60,
    spotlightEffect: true
  },
  recording: {
    duration: 30000,
    skipErrors: true,
    outputName: "test-demo"
  },
  timings: {
    waitBeforeMove: 1000,
    waitAfterClick: 1500,
    waitBetweenSteps: 800,
    pageLoadWait: 2000
  }
};