/**
 * Pre-publish tests to ensure package works correctly when installed globally
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

describe('Pre-publish Package Tests', () => {
  const packageRoot = path.join(__dirname, '..');
  const testInstallDir = path.join(os.tmpdir(), `demo-video-test-${Date.now()}`);
  
  beforeAll(() => {
    // Create test directory
    fs.mkdirSync(testInstallDir, { recursive: true });
    
    // Create package tarball
    console.log('Creating package tarball...');
    execSync('npm pack', { 
      cwd: packageRoot,
      stdio: 'inherit'
    });
    
    // Find the created tarball
    const files = fs.readdirSync(packageRoot);
    const tarball = files.find(f => f.startsWith('demo-video-maker-') && f.endsWith('.tgz'));
    
    if (!tarball) {
      throw new Error('Failed to create package tarball');
    }
    
    // Install package globally in test directory
    console.log(`Installing package from tarball: ${tarball}`);
    execSync(`npm install -g ${path.join(packageRoot, tarball)}`, {
      env: {
        ...process.env,
        PREFIX: testInstallDir,
        NPM_CONFIG_PREFIX: testInstallDir
      },
      stdio: 'inherit'
    });
  });
  
  afterAll(() => {
    // Cleanup
    try {
      // Uninstall global package
      execSync('npm uninstall -g demo-video-maker', {
        env: {
          ...process.env,
          PREFIX: testInstallDir,
          NPM_CONFIG_PREFIX: testInstallDir
        },
        stdio: 'ignore'
      });
    } catch (e) {
      // Ignore uninstall errors
    }
    
    // Remove test directory
    fs.rmSync(testInstallDir, { recursive: true, force: true });
    
    // Remove tarball
    const files = fs.readdirSync(packageRoot);
    const tarball = files.find(f => f.startsWith('demo-video-maker-') && f.endsWith('.tgz'));
    if (tarball) {
      fs.unlinkSync(path.join(packageRoot, tarball));
    }
  });

  describe('Global Installation Tests', () => {
    const getBinPath = (binName) => {
      return path.join(testInstallDir, 'bin', binName);
    };

    it('should install demo-video command globally', () => {
      const binPath = getBinPath('demo-video');
      expect(fs.existsSync(binPath)).toBe(true);
    });

    it('should install cinematic-demo command globally', () => {
      const binPath = getBinPath('cinematic-demo');
      expect(fs.existsSync(binPath)).toBe(true);
    });

    it('should run demo-video --help without errors', () => {
      const binPath = getBinPath('demo-video');
      const result = execSync(`${binPath} --help`, { encoding: 'utf8' });
      
      expect(result).toContain('Cinematic Demo Generator');
      expect(result).toContain('Usage:');
      expect(result).not.toContain('MODULE_NOT_FOUND');
      expect(result).not.toContain('Cannot find module');
    });

    it('should run cinematic-demo --help without errors', () => {
      const binPath = getBinPath('cinematic-demo');
      const result = execSync(`${binPath} --help`, { encoding: 'utf8' });
      
      expect(result).toContain('Cinematic Demo Generator');
      expect(result).toContain('Usage:');
      expect(result).not.toContain('MODULE_NOT_FOUND');
      expect(result).not.toContain('Cannot find module');
    });

    it('should handle --init flag when installed globally', () => {
      const testDir = path.join(os.tmpdir(), `demo-init-test-${Date.now()}`);
      fs.mkdirSync(testDir, { recursive: true });
      
      const originalCwd = process.cwd();
      process.chdir(testDir);
      
      try {
        const binPath = getBinPath('demo-video');
        execSync(`${binPath} --init`, { encoding: 'utf8' });
        
        expect(fs.existsSync('demo.json')).toBe(true);
        const config = JSON.parse(fs.readFileSync('demo.json', 'utf8'));
        expect(config.name).toBe('Dashboard Feature Demo');
      } finally {
        process.chdir(originalCwd);
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });

    it('should not have playwright MODULE_NOT_FOUND errors', () => {
      const testDir = path.join(os.tmpdir(), `demo-playwright-test-${Date.now()}`);
      fs.mkdirSync(testDir, { recursive: true });
      
      // Create a minimal test that would trigger playwright loading
      fs.writeFileSync(path.join(testDir, 'test-playwright.js'), `
        const binPath = '${getBinPath('demo-video')}';
        const { spawn } = require('child_process');
        
        const child = spawn('node', [binPath, '--help']);
        
        let stderr = '';
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        child.on('close', (code) => {
          if (stderr.includes('MODULE_NOT_FOUND') || stderr.includes('Cannot find module')) {
            console.error('PLAYWRIGHT_ERROR:', stderr);
            process.exit(1);
          }
          console.log('SUCCESS: No playwright errors');
          process.exit(0);
        });
      `);
      
      const result = execSync(`node ${path.join(testDir, 'test-playwright.js')}`, { 
        encoding: 'utf8',
        cwd: testDir
      });
      
      expect(result).toContain('SUCCESS: No playwright errors');
      expect(result).not.toContain('PLAYWRIGHT_ERROR');
      
      fs.rmSync(testDir, { recursive: true, force: true });
    });
  });

  describe('Package Structure Tests', () => {
    it('should include all required files in package', () => {
      const installedPath = path.join(testInstallDir, 'lib', 'node_modules', 'demo-video-maker');
      
      // Check main script
      expect(fs.existsSync(path.join(installedPath, 'demo-cinematic.js'))).toBe(true);
      
      // Check lib directory
      expect(fs.existsSync(path.join(installedPath, 'lib'))).toBe(true);
      expect(fs.existsSync(path.join(installedPath, 'lib', 'configLoader.js'))).toBe(true);
      
      // Check package.json
      expect(fs.existsSync(path.join(installedPath, 'package.json'))).toBe(true);
      
      // Check README if exists
      if (fs.existsSync(path.join(packageRoot, 'README.md'))) {
        expect(fs.existsSync(path.join(installedPath, 'README.md'))).toBe(true);
      }
    });

    it('should have correct bin entries in package.json', () => {
      const installedPath = path.join(testInstallDir, 'lib', 'node_modules', 'demo-video-maker');
      const packageJson = JSON.parse(fs.readFileSync(path.join(installedPath, 'package.json'), 'utf8'));
      
      expect(packageJson.bin).toBeDefined();
      expect(packageJson.bin['demo-video']).toBe('demo-cinematic.js');
      expect(packageJson.bin['cinematic-demo']).toBe('demo-cinematic.js');
    });

    it('should have playwright as dependency not @playwright/test', () => {
      const installedPath = path.join(testInstallDir, 'lib', 'node_modules', 'demo-video-maker');
      const packageJson = JSON.parse(fs.readFileSync(path.join(installedPath, 'package.json'), 'utf8'));
      
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies.playwright).toBeDefined();
      expect(packageJson.dependencies['@playwright/test']).toBeUndefined();
    });
  });
});