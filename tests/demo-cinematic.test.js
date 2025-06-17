const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('demo-cinematic CLI', () => {
  const scriptPath = path.join(__dirname, '..', 'demo-cinematic.js');
  
  describe('Command Line Arguments', () => {
    it('should show help when --help flag is used', () => {
      const result = execSync(`node ${scriptPath} --help`, { encoding: 'utf8' });
      expect(result).toContain('Cinematic Demo Generator');
      expect(result).toContain('Usage:');
      expect(result).toContain('--port');
      expect(result).toContain('--init');
    });

    it('should handle --init flag correctly', () => {
      const testDir = `/tmp/test-demo-${Date.now()}`;
      fs.mkdirSync(testDir, { recursive: true });
      
      const originalCwd = process.cwd();
      process.chdir(testDir);
      
      try {
        execSync(`node ${scriptPath} --init`, { encoding: 'utf8' });
        expect(fs.existsSync('demo.json')).toBe(true);
        
        const config = JSON.parse(fs.readFileSync('demo.json', 'utf8'));
        expect(config.name).toBe('Dashboard Feature Demo');
      } finally {
        process.chdir(originalCwd);
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });

    it('should handle --port flag with valid port', () => {
      const result = execSync(`node ${scriptPath} --port 4000 --help`, { encoding: 'utf8' });
      expect(result).not.toContain('Invalid port number');
    });

    it('should warn about invalid port numbers', () => {
      // Invalid port warning goes to stderr, but help still shows
      const result = execSync(`node ${scriptPath} --port 99999 --help 2>&1`, { encoding: 'utf8' });
      expect(result).toContain('Invalid port number');
    });

    it('should handle port flag without value', () => {
      // Port warning goes to stderr, but help still shows
      const result = execSync(`node ${scriptPath} --port --help 2>&1`, { encoding: 'utf8' });
      expect(result).toContain('Port flag requires a value');
    });

    it('should handle -p alias for port', () => {
      const result = execSync(`node ${scriptPath} -p 4000 --help`, { encoding: 'utf8' });
      expect(result).not.toContain('Invalid port number');
    });

    it('should handle custom project path', () => {
      const testProjectPath = '/tmp/test-project';
      const result = execSync(`node ${scriptPath} ${testProjectPath} --help`, { encoding: 'utf8' });
      expect(result).toContain('Cinematic Demo Generator');
    });

    it('should handle --baseUrl flag', () => {
      const result = execSync(`node ${scriptPath} --baseUrl http://example.com --help`, { encoding: 'utf8' });
      expect(result).toContain('Cinematic Demo Generator');
    });
  });

  describe('Module Import Test', () => {
    it('should import playwright without MODULE_NOT_FOUND error', (done) => {
      const testScript = `
        try {
          const { chromium } = require('playwright');
          console.log('SUCCESS: playwright imported');
          process.exit(0);
        } catch (error) {
          console.error('ERROR:', error.message);
          process.exit(1);
        }
      `;
      
      const child = spawn('node', ['-e', testScript], {
        cwd: path.dirname(scriptPath),
        env: { ...process.env }
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data;
      });
      
      child.stderr.on('data', (data) => {
        stderr += data;
      });
      
      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(stdout).toContain('SUCCESS: playwright imported');
        expect(stderr).not.toContain('MODULE_NOT_FOUND');
        done();
      });
    });
  });

  describe('Global Installation Simulation', () => {
    it('should work when script is run from different directory', () => {
      const testDir = `/tmp/test-run-${Date.now()}`;
      fs.mkdirSync(testDir, { recursive: true });
      
      const originalCwd = process.cwd();
      process.chdir(testDir);
      
      try {
        // Simulate running from a different directory
        const result = execSync(`node ${scriptPath} --help`, { encoding: 'utf8' });
        expect(result).toContain('Cinematic Demo Generator');
        expect(result).not.toContain('MODULE_NOT_FOUND');
      } finally {
        process.chdir(originalCwd);
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing demo app gracefully', () => {
      const testDir = `/tmp/test-no-app-${Date.now()}`;
      fs.mkdirSync(testDir, { recursive: true });
      
      const originalCwd = process.cwd();
      process.chdir(testDir);
      
      try {
        const result = execSync(`node ${scriptPath} .`, { encoding: 'utf8' });
        expect(result).toContain('No demo app detected');
      } catch (error) {
        // Expected to fail but should show proper message
        const output = error.stdout ? error.stdout.toString() : error.message;
        expect(output).toContain('No demo app detected');
      } finally {
        process.chdir(originalCwd);
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });

    it('should handle missing demo.json files gracefully', () => {
      const testDir = `/tmp/test-no-demos-${Date.now()}`;
      fs.mkdirSync(testDir, { recursive: true });
      
      // Create minimal app structure
      fs.mkdirSync(path.join(testDir, 'app'), { recursive: true });
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({
        name: 'test-app',
        dependencies: {}
      }));
      
      const originalCwd = process.cwd();
      process.chdir(testDir);
      
      try {
        const result = execSync(`node ${scriptPath} .`, { encoding: 'utf8' });
        expect(result).toContain('No demo.json files found');
      } catch (error) {
        // Expected to fail but should show proper message
        const output = error.stdout ? error.stdout.toString() : error.message;
        expect(output).toContain('No demo.json files found');
      } finally {
        process.chdir(originalCwd);
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });
  });
});

describe('Integration with playwright', () => {
  it('should not throw MODULE_NOT_FOUND when requiring playwright', () => {
    let error = null;
    try {
      require('playwright');
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeNull();
  });

  it('should be able to access chromium from playwright', () => {
    const { chromium } = require('playwright');
    expect(chromium).toBeDefined();
    expect(typeof chromium.launch).toBe('function');
  });
});