import { DemoVideoAutomation } from '../../src/index';
import { DemoConfig } from '../../src/types';
import * as fs from 'fs/promises';
import * as path from 'path';
import { sampleProjectStructure } from '../fixtures/sample-components';

// Mock Playwright to avoid actual browser automation in tests
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

describe('Full Demo Generation Integration', () => {
  let testProjectPath: string;
  let outputPath: string;
  let config: DemoConfig;

  beforeAll(async () => {
    // Create test project
    testProjectPath = path.join(__dirname, '../output/integration-project');
    outputPath = path.join(__dirname, '../output/integration-output');
    
    await createTestProject(testProjectPath, sampleProjectStructure);
    
    config = {
      projectPath: testProjectPath,
      baseUrl: 'http://localhost:3000',
      outputPath: outputPath,
      viewport: { width: 1280, height: 720 },
      recording: {
        headless: true,
        slowMo: 50
      },
      storage: {
        baseDir: outputPath,
        organizationStrategy: 'feature-based'
      }
    };
  });

  afterAll(async () => {
    // Cleanup
    try {
      await fs.rmdir(testProjectPath, { recursive: true });
      await fs.rmdir(outputPath, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('complete demo generation workflow', () => {
    it('should analyze, document, and generate demos for the entire project', async () => {
      const automation = new DemoVideoAutomation(config);
      
      // This will run the full workflow
      await automation.run();

      // Verify output structure was created
      await expect(fs.access(outputPath)).resolves.not.toThrow();
      await expect(fs.access(path.join(outputPath, 'videos'))).resolves.not.toThrow();
      await expect(fs.access(path.join(outputPath, 'screenshots'))).resolves.not.toThrow();
    });

    it('should generate feature documentation', async () => {
      const automation = new DemoVideoAutomation(config);
      await automation.run();

      // Check that FEATURE.md files were created
      const userProfileDocPath = path.join(
        testProjectPath, 
        'src/features/UserProfile/FEATURE.md'
      );
      const dashboardDocPath = path.join(
        testProjectPath,
        'src/features/Dashboard/FEATURE.md'
      );

      await expect(fs.access(userProfileDocPath)).resolves.not.toThrow();
      await expect(fs.access(dashboardDocPath)).resolves.not.toThrow();

      // Verify content
      const userProfileDoc = await fs.readFile(userProfileDocPath, 'utf-8');
      expect(userProfileDoc).toContain('# UserProfile');
      expect(userProfileDoc).toContain('## Components');
      expect(userProfileDoc).toContain('## Demo Automation');
    });

    it('should generate project overview', async () => {
      const automation = new DemoVideoAutomation(config);
      await automation.run();

      const overviewPath = path.join(outputPath, 'DEMO_OVERVIEW.md');
      await expect(fs.access(overviewPath)).resolves.not.toThrow();

      const overview = await fs.readFile(overviewPath, 'utf-8');
      expect(overview).toContain('# Demo Video Automation Overview');
      expect(overview).toContain('## Discovered Features');
      expect(overview).toContain('UserProfile');
      expect(overview).toContain('Dashboard');
    });

    it('should generate demo report', async () => {
      const automation = new DemoVideoAutomation(config);
      await automation.run();

      const reportPath = path.join(outputPath, 'DEMO_REPORT.md');
      await expect(fs.access(reportPath)).resolves.not.toThrow();

      const report = await fs.readFile(reportPath, 'utf-8');
      expect(report).toContain('# Demo Video Generation Report');
      expect(report).toContain('## Results');
    });
  });

  describe('feature-specific demos', () => {
    it('should generate demos for specific features only', async () => {
      const specificConfig: DemoConfig = {
        ...config,
        features: ['UserProfile']
      };

      const automation = new DemoVideoAutomation(specificConfig);
      await automation.run();

      // Should only process UserProfile feature
      const report = await fs.readFile(
        path.join(outputPath, 'DEMO_REPORT.md'), 
        'utf-8'
      );
      
      expect(report).toContain('UserProfile');
      // Should not contain Dashboard since it wasn't requested
      expect(report).not.toContain('Dashboard');
    });
  });

  describe('error handling in integration', () => {
    it('should handle missing project path gracefully', async () => {
      const invalidConfig: DemoConfig = {
        ...config,
        projectPath: '/non/existent/path'
      };

      const automation = new DemoVideoAutomation(invalidConfig);
      
      await expect(automation.run()).rejects.toThrow();
    });

    it('should handle invalid base URL gracefully', async () => {
      const invalidConfig: DemoConfig = {
        ...config,
        baseUrl: 'invalid-url'
      };

      const automation = new DemoVideoAutomation(invalidConfig);
      
      // Should not crash during analysis phase
      // Browser automation will fail, but that's expected
      await expect(automation.run()).resolves.not.toThrow();
    });
  });

  describe('configuration validation', () => {
    it('should use default values for missing configuration', async () => {
      const minimalConfig: DemoConfig = {
        projectPath: testProjectPath,
        baseUrl: 'http://localhost:3000',
        outputPath: outputPath
      };

      const automation = new DemoVideoAutomation(minimalConfig);
      
      // Should not throw with minimal configuration
      await expect(automation.run()).resolves.not.toThrow();
    });

    it('should respect custom storage configuration', async () => {
      const customStorageConfig: DemoConfig = {
        ...config,
        storage: {
          baseDir: outputPath,
          videoDir: 'custom-videos',
          screenshotDir: 'custom-screenshots',
          organizationStrategy: 'date-based'
        }
      };

      const automation = new DemoVideoAutomation(customStorageConfig);
      await automation.run();

      // Verify custom directories were created
      await expect(fs.access(path.join(outputPath, 'custom-videos'))).resolves.not.toThrow();
      await expect(fs.access(path.join(outputPath, 'custom-screenshots'))).resolves.not.toThrow();
    });
  });

  describe('performance and scalability', () => {
    it('should handle projects with many features efficiently', async () => {
      // Create a larger project structure
      const largeProject = { ...sampleProjectStructure };
      
      // Add more features
      for (let i = 1; i <= 10; i++) {
        largeProject[`src/features/Feature${i}/Component${i}.tsx`] = `
          export default function Component${i}() {
            return (
              <div data-testid="component-${i}">
                <button data-testid="button-${i}">Click me</button>
              </div>
            );
          }
        `;
      }

      const largeProjectPath = path.join(__dirname, '../output/large-project');
      await createTestProject(largeProjectPath, largeProject);

      const largeConfig: DemoConfig = {
        ...config,
        projectPath: largeProjectPath
      };

      const startTime = Date.now();
      const automation = new DemoVideoAutomation(largeConfig);
      await automation.run();
      const endTime = Date.now();

      // Should complete within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds

      // Cleanup
      await fs.rmdir(largeProjectPath, { recursive: true });
    });
  });
});

// Helper function to create test project structure
async function createTestProject(
  basePath: string, 
  structure: Record<string, string>
): Promise<void> {
  await fs.mkdir(basePath, { recursive: true });

  for (const [filePath, content] of Object.entries(structure)) {
    const fullPath = path.join(basePath, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
  }
}