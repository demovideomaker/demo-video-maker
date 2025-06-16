import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';
import { StorageConfig, VideoFormat } from '../types';
import { SecurityUtils } from './securityUtils';

export class StorageManager {
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  async ensureDirectories(): Promise<void> {
    const dirs = [
      this.config.baseDir,
      this.getVideoDir(),
      this.getScreenshotDir(),
      this.getDocumentationDir()
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  getVideoDir(): string {
    if (this.config.videoDir) {
      return path.isAbsolute(this.config.videoDir) 
        ? this.config.videoDir 
        : path.join(this.config.baseDir, this.config.videoDir);
    }
    return path.join(this.config.baseDir, 'videos');
  }

  getScreenshotDir(): string {
    if (this.config.screenshotDir) {
      return path.isAbsolute(this.config.screenshotDir)
        ? this.config.screenshotDir
        : path.join(this.config.baseDir, this.config.screenshotDir);
    }
    return path.join(this.config.baseDir, 'screenshots');
  }

  getDocumentationDir(): string {
    if (this.config.documentationDir) {
      return path.isAbsolute(this.config.documentationDir)
        ? this.config.documentationDir
        : path.join(this.config.baseDir, this.config.documentationDir);
    }
    return this.config.baseDir;
  }

  generateVideoPath(featureName: string, format: VideoFormat): string {
    const template = this.config.naming?.videos || '{feature}-demo';
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    let filename = template
      .replace('{feature}', featureName)
      .replace('{timestamp}', timestamp)
      .replace('{date}', new Date().toISOString().slice(0, 10));

    const extension = this.getVideoExtension(format);
    
    if (this.config.organizationStrategy === 'feature-based') {
      return path.join(this.getVideoDir(), featureName, `${filename}.${extension}`);
    } else if (this.config.organizationStrategy === 'date-based') {
      const dateDir = new Date().toISOString().slice(0, 10);
      return path.join(this.getVideoDir(), dateDir, `${filename}.${extension}`);
    } else {
      return path.join(this.getVideoDir(), `${filename}.${extension}`);
    }
  }

  generateScreenshotPath(featureName: string, stepNumber: number, action: string): string {
    const template = this.config.naming?.screenshots || '{feature}-step-{number}';
    
    let filename = template
      .replace('{feature}', featureName)
      .replace('{number}', stepNumber.toString().padStart(3, '0'))
      .replace('{action}', action);

    if (this.config.organizationStrategy === 'feature-based') {
      return path.join(this.getScreenshotDir(), featureName, `${filename}.png`);
    } else if (this.config.organizationStrategy === 'date-based') {
      const dateDir = new Date().toISOString().slice(0, 10);
      return path.join(this.getScreenshotDir(), dateDir, featureName, `${filename}.png`);
    } else {
      return path.join(this.getScreenshotDir(), `${filename}.png`);
    }
  }

  private getVideoExtension(format: VideoFormat): string {
    return format.format;
  }

  async convertVideo(inputPath: string, outputPath: string, format: VideoFormat): Promise<string> {
    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // If no conversion needed
    if (inputPath.endsWith(`.${format.format}`)) {
      await fs.copyFile(inputPath, outputPath);
      return outputPath;
    }

    // Build ffmpeg command for conversion
    const ffmpegArgs = this.buildFFmpegArgs(inputPath, outputPath, format);
    
    try {
      execSync(`ffmpeg ${ffmpegArgs}`, { stdio: 'pipe' });
      return outputPath;
    } catch (error) {
      console.warn(`Failed to convert video to ${format.format}, keeping original format`);
      return inputPath;
    }
  }

  private buildFFmpegArgs(input: string, output: string, format: VideoFormat): string {
    // Escape and validate file paths
    const safeInput = SecurityUtils.escapeShellArg(input);
    const safeOutput = SecurityUtils.escapeShellArg(output);
    
    const args = [`-i "${safeInput}"`];

    // Video codec - whitelist allowed values
    if (format.codec) {
      const allowedCodecs = ['h264', 'h265', 'vp8', 'vp9'];
      if (allowedCodecs.includes(format.codec)) {
        switch (format.codec) {
          case 'h264':
            args.push('-c:v libx264');
            break;
          case 'h265':
            args.push('-c:v libx265');
            break;
          case 'vp8':
            args.push('-c:v libvpx');
            break;
          case 'vp9':
            args.push('-c:v libvpx-vp9');
            break;
        }
      }
    }

    // Quality settings - validate range
    if (format.quality) {
      const qualityMap = {
        'low': 35,
        'medium': 23,
        'high': 18,
        'lossless': 0
      };
      
      const crfValue = qualityMap[format.quality];
      if (crfValue !== undefined) {
        args.push(`-crf ${crfValue}`);
      }
    }

    // Frame rate - validate range
    if (format.fps && format.fps > 0 && format.fps <= 120) {
      args.push(`-r ${Math.floor(format.fps)}`);
    }

    args.push(`"${safeOutput}"`);
    return args.join(' ');
  }

  async generateIndex(videoFiles: string[], screenshotDirs: string[]): Promise<void> {
    const indexPath = path.join(this.getDocumentationDir(), 'INDEX.md');
    
    const content = [
      '# Demo Video Index',
      '',
      `Generated on: ${new Date().toISOString()}`,
      '',
      '## Videos',
      ''
    ];

    for (const videoFile of videoFiles) {
      const relativePath = path.relative(this.config.baseDir, videoFile);
      const featureName = path.basename(videoFile, path.extname(videoFile));
      content.push(`- [${featureName}](${relativePath})`);
    }

    content.push('', '## Screenshots', '');

    for (const screenshotDir of screenshotDirs) {
      const relativePath = path.relative(this.config.baseDir, screenshotDir);
      const featureName = path.basename(screenshotDir);
      content.push(`- [${featureName} Screenshots](${relativePath}/)`);
    }

    await fs.writeFile(indexPath, content.join('\n'));
  }

  async cleanup(olderThanDays: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    await this.cleanupDirectory(this.getVideoDir(), cutoffDate);
    await this.cleanupDirectory(this.getScreenshotDir(), cutoffDate);
  }

  private async cleanupDirectory(dir: string, cutoffDate: Date): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);
        const stats = await fs.stat(entryPath);
        
        if (stats.mtime < cutoffDate) {
          if (entry.isDirectory()) {
            await fs.rmdir(entryPath, { recursive: true });
          } else {
            await fs.unlink(entryPath);
          }
          console.log(`Cleaned up: ${entryPath}`);
        }
      }
    } catch (error) {
      console.warn(`Failed to cleanup directory ${dir}:`, error);
    }
  }
}