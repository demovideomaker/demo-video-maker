import { PlaywrightExecutor } from '../../src/executors/playwrightExecutor';
import { DemoConfig, ExecutionPath, Feature, Component } from '../../src/types';
import * as path from 'path';

// Mock Playwright
jest.mock('@playwright/test', () => ({
  chromium: {
    launch: jest.fn().mockResolvedValue({
      newContext: jest.fn().mockResolvedValue({
        newPage: jest.fn().mockResolvedValue({
          goto: jest.fn(),
          click: jest.fn(),
          fill: jest.fn(),
          hover: jest.fn(),
          waitForSelector: jest.fn(),
          waitForLoadState: jest.fn(),
          waitForTimeout: jest.fn(),
          screenshot: jest.fn(),
          locator: jest.fn().mockReturnValue({
            scrollIntoViewIfNeeded: jest.fn()
          }),
          evaluate: jest.fn(),
          video: jest.fn().mockReturnValue({
            path: jest.fn().mockResolvedValue('/mock/video/path.webm')
          }),
          close: jest.fn()
        }),
        close: jest.fn()
      }),
      close: jest.fn()
    })
  }
}));

describe('PlaywrightExecutor', () => {
  let executor: PlaywrightExecutor;
  let mockConfig: DemoConfig;
  let mockExecutionPath: ExecutionPath;

  beforeEach(() => {
    mockConfig = {
      projectPath: '/mock/project',
      baseUrl: 'http://localhost:3000',
      outputPath: path.join(__dirname, '../output/playwright-test'),
      viewport: { width: 1280, height: 720 },
      recording: {
        slowMo: 100,
        headless: false
      }
    };

    executor = new PlaywrightExecutor(mockConfig);
    mockExecutionPath = createMockExecutionPath();
  });

  describe('initialization', () => {
    it('should initialize browser and context', async () => {
      await executor.initialize();

      // Verify browser was launched with correct options
      const { chromium } = require('@playwright/test');
      expect(chromium.launch).toHaveBeenCalledWith({
        headless: false,
        slowMo: 100
      });
    });

    it('should configure video recording', async () => {
      await executor.initialize();

      const mockBrowser = await require('@playwright/test').chromium.launch();
      expect(mockBrowser.newContext).toHaveBeenCalledWith(
        expect.objectContaining({
          viewport: { width: 1280, height: 720 },
          recordVideo: expect.objectContaining({
            size: { width: 1280, height: 720 }
          })
        })
      );
    });
  });

  describe('executeFeatureDemo', () => {
    beforeEach(async () => {
      await executor.initialize();
    });

    it('should execute all steps in the execution path', async () => {
      const videoPath = await executor.executeFeatureDemo(mockExecutionPath);

      expect(videoPath).toBe('/mock/video/path.webm');

      // Verify steps were executed
      const mockPage = await (await require('@playwright/test').chromium.launch())
        .newContext().newPage();

      expect(mockPage.goto).toHaveBeenCalled();
      expect(mockPage.click).toHaveBeenCalled();
      expect(mockPage.fill).toHaveBeenCalled();
    });

    it('should handle navigation steps', async () => {
      await executor.executeFeatureDemo(mockExecutionPath);

      const mockPage = await (await require('@playwright/test').chromium.launch())
        .newContext().newPage();

      expect(mockPage.goto).toHaveBeenCalledWith('http://localhost:3000/dashboard');
    });

    it('should handle click interactions', async () => {
      await executor.executeFeatureDemo(mockExecutionPath);

      const mockPage = await (await require('@playwright/test').chromium.launch())
        .newContext().newPage();

      expect(mockPage.waitForSelector).toHaveBeenCalledWith(
        '[data-testid="submit-button"]',
        { state: 'visible' }
      );
      expect(mockPage.click).toHaveBeenCalledWith('[data-testid="submit-button"]');
    });

    it('should handle input interactions', async () => {
      await executor.executeFeatureDemo(mockExecutionPath);

      const mockPage = await (await require('@playwright/test').chromium.launch())
        .newContext().newPage();

      expect(mockPage.fill).toHaveBeenCalledWith(
        '[data-testid="name-input"]',
        'Test Value'
      );
    });

    it('should take screenshots when specified', async () => {
      await executor.executeFeatureDemo(mockExecutionPath);

      const mockPage = await (await require('@playwright/test').chromium.launch())
        .newContext().newPage();

      expect(mockPage.screenshot).toHaveBeenCalled();
    });

    it('should wait for specified durations', async () => {
      await executor.executeFeatureDemo(mockExecutionPath);

      const mockPage = await (await require('@playwright/test').chromium.launch())
        .newContext().newPage();

      expect(mockPage.waitForTimeout).toHaveBeenCalledWith(1000);
    });
  });

  describe('executeAllDemos', () => {
    beforeEach(async () => {
      await executor.initialize();
    });

    it('should execute multiple demos and return results', async () => {
      const paths = [mockExecutionPath, createMockExecutionPath('AnotherFeature')];
      const results = await executor.executeAllDemos(paths);

      expect(results.size).toBe(2);
      expect(results.get('TestFeature')).toBeDefined();
      expect(results.get('AnotherFeature')).toBeDefined();
    });

    it('should handle failures gracefully', async () => {
      // Mock a failure in one of the steps
      const mockPage = await (await require('@playwright/test').chromium.launch())
        .newContext().newPage();
      mockPage.click.mockRejectedValueOnce(new Error('Element not found'));

      const results = await executor.executeAllDemos([mockExecutionPath]);

      expect(results.get('TestFeature')).toBe('FAILED');
    });
  });

  describe('error handling', () => {
    it('should handle missing selectors gracefully', async () => {
      const pathWithMissingSelector: ExecutionPath = {
        feature: mockExecutionPath.feature,
        steps: [
          {
            description: 'Click missing element',
            action: 'click',
            // No selector provided
            wait: 500
          }
        ],
        duration: 500
      };

      await executor.initialize();
      
      // Should not throw
      await expect(
        executor.executeFeatureDemo(pathWithMissingSelector)
      ).resolves.toBeDefined();
    });

    it('should handle page navigation errors', async () => {
      const mockPage = await (await require('@playwright/test').chromium.launch())
        .newContext().newPage();
      mockPage.goto.mockRejectedValueOnce(new Error('Navigation timeout'));

      await executor.initialize();
      
      // Should handle the error and continue
      await expect(
        executor.executeFeatureDemo(mockExecutionPath)
      ).resolves.toBeDefined();
    });
  });

  describe('cleanup', () => {
    it('should close browser and context', async () => {
      await executor.initialize();
      await executor.cleanup();

      const mockBrowser = await require('@playwright/test').chromium.launch();
      const mockContext = await mockBrowser.newContext();

      expect(mockContext.close).toHaveBeenCalled();
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle cleanup when not initialized', async () => {
      // Should not throw when called without initialization
      await expect(executor.cleanup()).resolves.not.toThrow();
    });
  });
});

function createMockExecutionPath(featureName = 'TestFeature'): ExecutionPath {
  const mockComponent: Component = {
    name: 'TestComponent',
    type: 'component',
    path: '/mock/path/TestComponent.tsx',
    exports: ['default'],
    imports: [],
    selectors: [
      {
        name: 'submit-button',
        selector: '[data-testid="submit-button"]',
        action: 'click'
      },
      {
        name: 'name-input',
        selector: '[data-testid="name-input"]',
        action: 'input',
        value: 'Test Value'
      }
    ]
  };

  const mockFeature: Feature = {
    name: featureName,
    path: '/mock/path',
    components: [mockComponent],
    dependencies: [],
    priority: 5,
    route: '/dashboard'
  };

  return {
    feature: mockFeature,
    steps: [
      {
        description: 'Navigate to dashboard',
        action: 'navigate',
        value: '/dashboard',
        wait: 2000
      },
      {
        description: 'Wait for page load',
        action: 'waitForLoadState',
        wait: 1000
      },
      {
        description: 'Click submit button',
        selector: '[data-testid="submit-button"]',
        action: 'click',
        wait: 1000,
        screenshot: true
      },
      {
        description: 'Fill name input',
        selector: '[data-testid="name-input"]',
        action: 'fill',
        value: 'Test Value',
        wait: 500
      }
    ],
    duration: 4500
  };
}