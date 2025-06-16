import { StorageManager } from '../../src/utils/storageManager';
import { VideoFormat, StorageConfig } from '../../src/types';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('StorageManager', () => {
  let testBaseDir: string;
  let storageManager: StorageManager;
  let config: StorageConfig;

  beforeEach(async () => {
    testBaseDir = path.join(__dirname, '../output/storage-test');
    config = {
      baseDir: testBaseDir,
      organizationStrategy: 'feature-based',
      naming: {
        videos: '{feature}-{timestamp}',
        screenshots: '{feature}-step-{number}'
      }
    };
    storageManager = new StorageManager(config);
  });

  afterEach(async () => {
    try {
      await fs.rmdir(testBaseDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('directory management', () => {
    it('should create all required directories', async () => {
      await storageManager.ensureDirectories();

      const videoDir = storageManager.getVideoDir();
      const screenshotDir = storageManager.getScreenshotDir();
      const docDir = storageManager.getDocumentationDir();

      await expect(fs.access(videoDir)).resolves.not.toThrow();
      await expect(fs.access(screenshotDir)).resolves.not.toThrow();
      await expect(fs.access(docDir)).resolves.not.toThrow();
    });

    it('should handle absolute paths correctly', async () => {
      const absoluteConfig: StorageConfig = {
        baseDir: testBaseDir,
        videoDir: path.join(testBaseDir, 'custom-videos'),
        screenshotDir: path.join(testBaseDir, 'custom-screenshots')
      };

      const customStorageManager = new StorageManager(absoluteConfig);
      await customStorageManager.ensureDirectories();

      expect(customStorageManager.getVideoDir()).toBe(absoluteConfig.videoDir);
      expect(customStorageManager.getScreenshotDir()).toBe(absoluteConfig.screenshotDir);
    });

    it('should handle relative paths correctly', async () => {
      const relativeConfig: StorageConfig = {
        baseDir: testBaseDir,
        videoDir: 'my-videos',
        screenshotDir: 'my-screenshots'
      };

      const customStorageManager = new StorageManager(relativeConfig);
      
      expect(customStorageManager.getVideoDir()).toBe(
        path.join(testBaseDir, 'my-videos')
      );
      expect(customStorageManager.getScreenshotDir()).toBe(
        path.join(testBaseDir, 'my-screenshots')
      );
    });
  });

  describe('path generation', () => {
    const videoFormat: VideoFormat = { format: 'webm' };

    it('should generate video paths with feature-based organization', async () => {
      const featureName = 'UserProfile';
      const videoPath = storageManager.generateVideoPath(featureName, videoFormat);

      expect(videoPath).toContain('videos');
      expect(videoPath).toContain(featureName);
      expect(videoPath.endsWith('.webm')).toBe(true);
      expect(path.dirname(videoPath)).toContain(featureName);
    });

    it('should generate screenshot paths with proper numbering', async () => {
      const featureName = 'Dashboard';
      const stepNumber = 5;
      const action = 'click';

      const screenshotPath = storageManager.generateScreenshotPath(
        featureName, 
        stepNumber, 
        action
      );

      expect(screenshotPath).toContain('screenshots');
      expect(screenshotPath).toContain(featureName);
      expect(screenshotPath).toContain('005'); // Padded step number
      expect(screenshotPath.endsWith('.png')).toBe(true);
    });

    it('should apply naming templates correctly', async () => {
      const customConfig: StorageConfig = {
        baseDir: testBaseDir,
        organizationStrategy: 'flat',
        naming: {
          videos: 'demo-{feature}-final',
          screenshots: '{feature}-{action}-{number}'
        }
      };

      const customManager = new StorageManager(customConfig);
      const videoPath = customManager.generateVideoPath('TestFeature', videoFormat);
      const screenshotPath = customManager.generateScreenshotPath('TestFeature', 1, 'click');

      expect(path.basename(videoPath)).toMatch(/demo-TestFeature-final\.webm/);
      expect(path.basename(screenshotPath)).toMatch(/TestFeature-click-001\.png/);
    });

    it('should handle date-based organization', async () => {
      const dateConfig: StorageConfig = {
        baseDir: testBaseDir,
        organizationStrategy: 'date-based'
      };

      const dateManager = new StorageManager(dateConfig);
      const videoPath = dateManager.generateVideoPath('Feature', videoFormat);

      const today = new Date().toISOString().slice(0, 10);
      expect(videoPath).toContain(today);
    });
  });

  describe('video format handling', () => {
    it('should handle different video formats', async () => {
      const formats: VideoFormat[] = [
        { format: 'mp4' },
        { format: 'avi' },
        { format: 'webm' }
      ];

      formats.forEach(format => {
        const path = storageManager.generateVideoPath('Test', format);
        expect(path.endsWith(`.${format.format}`)).toBe(true);
      });
    });

    it('should convert video when format differs', async () => {
      // Create a mock input video file
      const inputPath = path.join(testBaseDir, 'input.webm');
      const outputPath = path.join(testBaseDir, 'output.mp4');
      
      await fs.mkdir(testBaseDir, { recursive: true });
      await fs.writeFile(inputPath, 'mock video content');

      const format: VideoFormat = { format: 'mp4', quality: 'high' };
      
      // Mock ffmpeg by creating the output file
      jest.spyOn(require('child_process'), 'execSync').mockImplementation(() => {
        require('fs').writeFileSync(outputPath, 'converted content');
      });

      const result = await storageManager.convertVideo(inputPath, outputPath, format);
      expect(result).toBe(outputPath);
    });

    it('should skip conversion when formats match', async () => {
      const inputPath = path.join(testBaseDir, 'input.webm');
      const outputPath = path.join(testBaseDir, 'output.webm');
      
      await fs.mkdir(testBaseDir, { recursive: true });
      await fs.writeFile(inputPath, 'video content');

      const format: VideoFormat = { format: 'webm' };
      
      const result = await storageManager.convertVideo(inputPath, outputPath, format);
      expect(result).toBe(outputPath);
      
      // Should copy the file
      const outputContent = await fs.readFile(outputPath, 'utf-8');
      expect(outputContent).toBe('video content');
    });
  });

  describe('index generation', () => {
    it('should generate index with video and screenshot links', async () => {
      const videoFiles = [
        path.join(testBaseDir, 'videos/feature1.webm'),
        path.join(testBaseDir, 'videos/feature2.mp4')
      ];
      const screenshotDirs = [
        path.join(testBaseDir, 'screenshots/feature1'),
        path.join(testBaseDir, 'screenshots/feature2')
      ];

      await storageManager.generateIndex(videoFiles, screenshotDirs);

      const indexPath = path.join(storageManager.getDocumentationDir(), 'INDEX.md');
      const indexContent = await fs.readFile(indexPath, 'utf-8');

      expect(indexContent).toContain('# Demo Video Index');
      expect(indexContent).toContain('feature1');
      expect(indexContent).toContain('feature2');
      expect(indexContent).toContain('Videos');
      expect(indexContent).toContain('Screenshots');
    });
  });

  describe('cleanup functionality', () => {
    it('should clean up old files', async () => {
      await storageManager.ensureDirectories();

      // Create old files
      const oldFile = path.join(storageManager.getVideoDir(), 'old-video.webm');
      await fs.writeFile(oldFile, 'old content');

      // Manually set the file's modification time to be old
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);
      await fs.utimes(oldFile, oldDate, oldDate);

      // Create new file
      const newFile = path.join(storageManager.getVideoDir(), 'new-video.webm');
      await fs.writeFile(newFile, 'new content');

      await storageManager.cleanup(7); // Clean files older than 7 days

      // Old file should be deleted, new file should remain
      await expect(fs.access(oldFile)).rejects.toThrow();
      await expect(fs.access(newFile)).resolves.not.toThrow();
    });

    it('should handle cleanup errors gracefully', async () => {
      // Try to cleanup non-existent directory
      await expect(storageManager.cleanup()).resolves.not.toThrow();
    });
  });
});