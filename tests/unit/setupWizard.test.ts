import { InteractiveSetupWizard } from '../../src/setup/setupWizard';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock readline to simulate user input
const mockQuestion = jest.fn();
const mockClose = jest.fn();

jest.mock('readline/promises', () => ({
  createInterface: jest.fn(() => ({
    question: mockQuestion,
    close: mockClose
  }))
}));

// Mock child_process for system commands
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

describe('InteractiveSetupWizard', () => {
  let wizard: InteractiveSetupWizard;
  let testOutputPath: string;

  beforeEach(() => {
    wizard = new InteractiveSetupWizard();
    testOutputPath = path.join(__dirname, '../output/setup-test');
    
    // Reset mocks
    jest.clearAllMocks();
    mockQuestion.mockResolvedValue(''); // Default to pressing Enter
  });

  afterEach(async () => {
    try {
      await fs.rmdir(testOutputPath, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('environment checks', () => {
    it('should pass Node.js version check for supported versions', async () => {
      // Node.js version is checked via process.version, which is always available in tests
      const wizard = new InteractiveSetupWizard();
      
      // Access private method for testing
      const checkNodeVersion = (wizard as any).checkNodeVersion.bind(wizard);
      const result = await checkNodeVersion();
      
      expect(result).toBe(true);
    });

    it('should check npm installation', async () => {
      const { execSync } = require('child_process');
      execSync.mockReturnValueOnce('8.0.0'); // Mock npm version

      const wizard = new InteractiveSetupWizard();
      const checkNpmInstalled = (wizard as any).checkNpmInstalled.bind(wizard);
      const result = await checkNpmInstalled();
      
      expect(result).toBe(true);
      expect(execSync).toHaveBeenCalledWith('npm --version', { stdio: 'pipe' });
    });

    it('should handle npm not installed', async () => {
      const { execSync } = require('child_process');
      execSync.mockImplementation(() => {
        throw new Error('Command not found');
      });

      const wizard = new InteractiveSetupWizard();
      const checkNpmInstalled = (wizard as any).checkNpmInstalled.bind(wizard);
      const result = await checkNpmInstalled();
      
      expect(result).toBe(false);
    });

    it('should check write permissions', async () => {
      await fs.mkdir(testOutputPath, { recursive: true });
      
      // Change to test directory for permission check
      const originalCwd = process.cwd();
      process.chdir(testOutputPath);

      try {
        const wizard = new InteractiveSetupWizard();
        const checkWritePermissions = (wizard as any).checkWritePermissions.bind(wizard);
        const result = await checkWritePermissions();
        
        expect(result).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect when write permissions are denied', async () => {
      // Create a read-only directory (mock scenario)
      const wizard = new InteractiveSetupWizard();
      const checkWritePermissions = (wizard as any).checkWritePermissions.bind(wizard);
      
      // Mock fs.writeFile to throw permission error
      const originalWriteFile = fs.writeFile;
      (fs as any).writeFile = jest.fn().mockRejectedValue(
        new Error('EACCES: permission denied')
      );

      const result = await checkWritePermissions();
      expect(result).toBe(false);

      // Restore original function
      (fs as any).writeFile = originalWriteFile;
    });
  });

  describe('Playwright browser checks', () => {
    it('should detect when Playwright browsers are installed', async () => {
      // Mock file system to simulate installed browsers
      const originalAccess = fs.access;
      (fs as any).access = jest.fn().mockResolvedValue(undefined);

      const wizard = new InteractiveSetupWizard();
      const checkPlaywrightBrowsers = (wizard as any).checkPlaywrightBrowsers.bind(wizard);
      const result = await checkPlaywrightBrowsers();
      
      expect(result).toBe(true);

      // Restore original function
      (fs as any).access = originalAccess;
    });

    it('should detect when Playwright browsers are missing', async () => {
      // Mock file system to simulate missing browsers
      const originalAccess = fs.access;
      (fs as any).access = jest.fn().mockRejectedValue(new Error('ENOENT'));

      const wizard = new InteractiveSetupWizard();
      const checkPlaywrightBrowsers = (wizard as any).checkPlaywrightBrowsers.bind(wizard);
      const result = await checkPlaywrightBrowsers();
      
      expect(result).toBe(false);

      // Restore original function
      (fs as any).access = originalAccess;
    });

    it('should install Playwright browsers when requested', async () => {
      const { execSync } = require('child_process');
      execSync.mockReturnValueOnce(''); // Mock successful installation

      const wizard = new InteractiveSetupWizard();
      const installPlaywrightBrowsers = (wizard as any).installPlaywrightBrowsers.bind(wizard);
      
      await installPlaywrightBrowsers();
      
      expect(execSync).toHaveBeenCalledWith('npx playwright install', { stdio: 'inherit' });
    });
  });

  describe('demo app setup', () => {
    it('should detect existing demo app', async () => {
      // Create mock demo app structure
      const demoAppPath = path.join(testOutputPath, 'demo-app');
      await fs.mkdir(path.join(demoAppPath, 'node_modules'), { recursive: true });
      await fs.writeFile(
        path.join(demoAppPath, 'package.json'),
        JSON.stringify({ name: 'demo-app' })
      );

      // Change to test directory
      const originalCwd = process.cwd();
      process.chdir(testOutputPath);

      try {
        const wizard = new InteractiveSetupWizard();
        const checkDemoApp = (wizard as any).checkDemoApp.bind(wizard);
        const result = await checkDemoApp();
        
        expect(result).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should setup demo app when missing', async () => {
      const { execSync } = require('child_process');
      execSync.mockReturnValueOnce(''); // Mock successful npm install

      // Create minimal demo app structure
      const demoAppPath = path.join(testOutputPath, 'demo-app');
      await fs.mkdir(demoAppPath, { recursive: true });

      const originalCwd = process.cwd();
      process.chdir(testOutputPath);

      try {
        const wizard = new InteractiveSetupWizard();
        const setupDemoApp = (wizard as any).setupDemoApp.bind(wizard);
        
        await setupDemoApp();
        
        expect(execSync).toHaveBeenCalledWith('npm install', { stdio: 'inherit' });
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('state management', () => {
    it('should save and load setup state', async () => {
      const wizard = new InteractiveSetupWizard();
      
      // Mock state with completed steps
      (wizard as any).state.completed = ['node-version', 'npm-installed'];
      
      // Save state
      await (wizard as any).saveState();
      
      // Create new wizard instance and load state
      const newWizard = new InteractiveSetupWizard();
      await (newWizard as any).loadState();
      
      expect((newWizard as any).state.completed).toContain('node-version');
      expect((newWizard as any).state.completed).toContain('npm-installed');
    });

    it('should handle missing state file gracefully', async () => {
      const wizard = new InteractiveSetupWizard();
      
      // Should not throw when loading non-existent state
      await expect((wizard as any).loadState()).resolves.not.toThrow();
    });
  });

  describe('user interaction simulation', () => {
    it('should handle yes/no questions', async () => {
      mockQuestion.mockResolvedValueOnce('y');
      
      const wizard = new InteractiveSetupWizard();
      const result = await (wizard as any).askYesNo('Test question?');
      
      expect(result).toBe(true);
      expect(mockQuestion).toHaveBeenCalledWith('Test question? (y/n) ');
    });

    it('should handle no responses', async () => {
      mockQuestion.mockResolvedValueOnce('n');
      
      const wizard = new InteractiveSetupWizard();
      const result = await (wizard as any).askYesNo('Test question?');
      
      expect(result).toBe(false);
    });

    it('should handle full word responses', async () => {
      mockQuestion.mockResolvedValueOnce('yes');
      
      const wizard = new InteractiveSetupWizard();
      const result = await (wizard as any).askYesNo('Test question?');
      
      expect(result).toBe(true);
    });
  });

  describe('platform-specific behavior', () => {
    it('should handle macOS screen recording permission check', async () => {
      // Mock macOS platform
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'darwin' });

      try {
        const wizard = new InteractiveSetupWizard();
        const checkScreenRecordingPermission = (wizard as any).checkScreenRecordingPermission.bind(wizard);
        const result = await checkScreenRecordingPermission();
        
        // On macOS, should return true (with user guidance)
        expect(result).toBe(true);
      } finally {
        Object.defineProperty(process, 'platform', { value: originalPlatform });
      }
    });

    it('should skip screen recording check on non-macOS platforms', async () => {
      // Mock Linux platform
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'linux' });

      try {
        const wizard = new InteractiveSetupWizard();
        const checkScreenRecordingPermission = (wizard as any).checkScreenRecordingPermission.bind(wizard);
        const result = await checkScreenRecordingPermission();
        
        // On non-macOS, should return true (skip check)
        expect(result).toBe(true);
      } finally {
        Object.defineProperty(process, 'platform', { value: originalPlatform });
      }
    });
  });

  describe('error recovery', () => {
    it('should provide manual fix instructions when automatic fixes fail', async () => {
      mockQuestion.mockResolvedValueOnce('y'); // User wants to try fix
      mockQuestion.mockResolvedValueOnce(''); // User presses enter to recheck
      
      const wizard = new InteractiveSetupWizard();
      
      // Mock a step that fails and has a fix
      const mockStep = {
        id: 'test-step',
        name: 'Test Step',
        description: 'Test description',
        check: jest.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true),
        fix: jest.fn().mockResolvedValue(undefined),
        required: true
      };

      await (wizard as any).runStep(mockStep);
      
      expect(mockStep.fix).toHaveBeenCalled();
      expect(mockStep.check).toHaveBeenCalledTimes(2); // Initial check + recheck after fix
    });

    it('should allow skipping non-required steps', async () => {
      const wizard = new InteractiveSetupWizard();
      
      const mockStep = {
        id: 'optional-step',
        name: 'Optional Step',
        description: 'Optional description',
        check: jest.fn().mockResolvedValue(false),
        required: false
      };

      // Should not throw for failed optional step
      await expect((wizard as any).runStep(mockStep)).resolves.not.toThrow();
    });
  });
});