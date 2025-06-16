import * as path from 'path';

export class SecurityUtils {
  /**
   * Sanitize file names to prevent directory traversal and injection
   */
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9\-_.]/g, '')
      .slice(0, 255); // Limit length to prevent buffer overflow
  }

  /**
   * Validate that project path is within safe boundaries
   */
  static validateProjectPath(projectPath: string): boolean {
    try {
      const resolved = path.resolve(projectPath);
      const cwd = process.cwd();
      
      // Allow paths within current working directory or tmp
      return resolved.startsWith(cwd) || 
             resolved.startsWith('/tmp') || 
             resolved.startsWith(process.env.TMPDIR || '/tmp');
    } catch {
      return false;
    }
  }

  /**
   * Escape shell command arguments
   */
  static escapeShellArg(arg: string): string {
    return arg.replace(/[;&|`$()\\]/g, '\\$&');
  }

  /**
   * Validate URL to prevent SSRF attacks
   */
  static validateUrl(url: string, allowedHosts: string[] = ['localhost', '127.0.0.1']): boolean {
    try {
      const parsed = new URL(url);
      
      // Only allow http/https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return false;
      }

      // Check if hostname is in allowed list
      return allowedHosts.some(host => 
        parsed.hostname === host || 
        parsed.hostname.endsWith(`.${host}`)
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if file size is within acceptable limits
   */
  static isFileSizeAcceptable(size: number, maxSize: number = 1024 * 1024): boolean {
    return size <= maxSize;
  }
}

export class ResourceMonitor {
  private static readonly MAX_HEAP_SIZE = 512 * 1024 * 1024; // 512MB
  private static readonly CHECK_INTERVAL = 30000; // 30 seconds

  static startMonitoring(): NodeJS.Timeout {
    return setInterval(() => {
      this.checkMemoryUsage();
    }, this.CHECK_INTERVAL);
  }

  static checkMemoryUsage(): void {
    const usage = process.memoryUsage();
    const mb = (bytes: number) => Math.round(bytes / 1024 / 1024);
    
    if (usage.heapUsed > this.MAX_HEAP_SIZE) {
      console.warn(`High memory usage detected: ${mb(usage.heapUsed)}MB`);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('Forced garbage collection');
      }
    }
  }

  static getMemoryStats(): { rss: number; heapUsed: number; heapTotal: number } {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024),
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024)
    };
  }
}

export class TimeoutManager {
  /**
   * Wrap a promise with a timeout
   */
  static withTimeout<T>(promise: Promise<T>, ms: number, errorMessage?: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(errorMessage || 'Operation timeout')), ms)
      )
    ]);
  }

  /**
   * Create a cancellable timeout
   */
  static createCancellableTimeout(callback: () => void, ms: number): {
    timeout: NodeJS.Timeout;
    cancel: () => void;
  } {
    const timeout = setTimeout(callback, ms);
    
    return {
      timeout,
      cancel: () => clearTimeout(timeout)
    };
  }
}

export class RateLimiter {
  private static requestCounts = new Map<string, { count: number; resetTime: number }>();
  private static readonly WINDOW_SIZE = 60000; // 1 minute window

  static checkLimit(operation: string, limit: number = 10): boolean {
    const now = Date.now();
    const key = operation;
    const existing = this.requestCounts.get(key);

    // Reset if window has passed
    if (!existing || now > existing.resetTime) {
      this.requestCounts.set(key, { count: 1, resetTime: now + this.WINDOW_SIZE });
      return true;
    }

    // Check if within limit
    if (existing.count >= limit) {
      return false;
    }

    // Increment count
    existing.count++;
    return true;
  }

  static reset(operation?: string): void {
    if (operation) {
      this.requestCounts.delete(operation);
    } else {
      this.requestCounts.clear();
    }
  }
}