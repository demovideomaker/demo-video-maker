/**
 * End-to-end tests that actually create demo videos
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

describe('E2E Demo Video Creation', () => {
  const testDir = path.join(__dirname, '..', 'test-app');
  const scriptPath = path.join(__dirname, '..', 'demo-cinematic.js');
  let appProcess;
  
  beforeAll((done) => {
    // Create test app directory
    fs.mkdirSync(testDir, { recursive: true });
    
    // Create minimal Next.js-like app structure
    fs.mkdirSync(path.join(testDir, 'app'), { recursive: true });
    fs.mkdirSync(path.join(testDir, 'public'), { recursive: true });
    
    // Create package.json
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({
      name: 'test-demo-app',
      version: '1.0.0',
      scripts: {
        dev: 'node server.js'
      },
      dependencies: {
        express: '^4.18.0'
      }
    }, null, 2));
    
    // Create a simple Express server instead of Next.js for faster testing
    fs.writeFileSync(path.join(testDir, 'server.js'), `
const express = require('express');
const app = express();
const port = 3003;

app.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Test Demo App</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .hero { background: #f0f0f0; padding: 40px; text-align: center; }
          .button { background: #007bff; color: white; padding: 10px 20px; border: none; cursor: pointer; }
          .feature { margin: 20px 0; padding: 20px; background: #fff; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="hero" data-testid="hero">
          <h1>Welcome to Test App</h1>
          <button class="button" data-testid="cta-button">Get Started</button>
        </div>
        <div class="feature" data-testid="feature-1">
          <h2>Feature 1</h2>
          <p>This is a test feature</p>
        </div>
        <div class="feature" data-testid="feature-2">
          <h2>Feature 2</h2>
          <p>Another test feature</p>
        </div>
      </body>
    </html>
  \`);
});

app.get('/dashboard', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Dashboard</title>
      </head>
      <body>
        <h1 data-testid="dashboard-title">Dashboard</h1>
        <div data-testid="dashboard-content">
          <p>Dashboard content here</p>
        </div>
      </body>
    </html>
  \`);
});

app.listen(port, () => {
  console.log(\`Test app listening at http://localhost:\${port}\`);
});
`);
    
    // Create demo.json in app directory
    fs.writeFileSync(path.join(testDir, 'app', 'demo.json'), JSON.stringify({
      name: "Test App Demo",
      description: "E2E test demo",
      entry: {
        url: "/",
        selector: "[data-testid='hero']",
        waitTime: 1000
      },
      interactions: [
        {
          type: "click",
          selector: "[data-testid='cta-button']",
          waitBeforeMove: 500,
          waitAfterClick: 1000,
          description: "Click CTA button"
        },
        {
          type: "hover",
          selector: "[data-testid='feature-1']",
          waitBeforeMove: 500,
          waitAfterClick: 800,
          description: "Hover over feature 1"
        },
        {
          type: "wait",
          waitTime: 1000,
          description: "Wait a moment"
        }
      ],
      effects: {
        cameraFollow: true,
        zoomLevel: 1.5,
        clickAnimations: true
      },
      recording: {
        duration: 10000,
        skipErrors: true,
        outputName: "test-demo"
      },
      timings: {
        waitBeforeMove: 500,
        waitAfterClick: 800,
        pageLoadWait: 2000
      }
    }, null, 2));
    
    // Install express
    console.log('Installing test app dependencies...');
    try {
      execSync('npm install express@4.18.2 --no-save', { 
        cwd: testDir,
        stdio: 'pipe' // Don't show output in tests
      });
    } catch (error) {
      console.error('Failed to install express:', error.message);
      throw error;
    }
    
    // Start the test app
    console.log('Starting test app...');
    appProcess = spawn('node', ['server.js'], {
      cwd: testDir,
      detached: false
    });
    
    // Wait for app to start
    appProcess.stdout.on('data', (data) => {
      if (data.toString().includes('Test app listening')) {
        console.log('Test app started successfully');
        setTimeout(done, 1000); // Give it a second to fully initialize
      }
    });
    
    appProcess.stderr.on('data', (data) => {
      console.error('Test app error:', data.toString());
    });
    
  }, 30000); // 30 second timeout for setup
  
  afterAll(() => {
    // Kill the test app
    if (appProcess) {
      try {
        process.kill(-appProcess.pid);
      } catch (e) {
        // On some systems we might need to kill differently
        appProcess.kill('SIGTERM');
      }
    }
    
    // Clean up test directory
    fs.rmSync(testDir, { recursive: true, force: true });
    
    // Clean up any generated videos
    const files = fs.readdirSync(process.cwd());
    files.forEach(file => {
      if (file.endsWith('.webm') || file.endsWith('.mp4')) {
        fs.unlinkSync(file);
      }
    });
  });
  
  describe('Demo Video Generation', () => {
    it('should create a demo video from the test app', (done) => {
      const originalCwd = process.cwd();
      process.chdir(testDir);
      
      try {
        // Run the demo generator
        const demoProcess = spawn('node', [scriptPath, '.', '--port', '3003'], {
          env: { ...process.env, CI: 'true', HEADLESS: 'true' }, // Force headless mode
          cwd: testDir
        });
        
        let output = '';
        let errorOutput = '';
        
        demoProcess.stdout.on('data', (data) => {
          output += data.toString();
          console.log('Demo output:', data.toString());
        });
        
        demoProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
          console.error('Demo error:', data.toString());
        });
        
        demoProcess.on('close', (code) => {
          process.chdir(originalCwd);
          
          // Check that the process completed successfully
          expect(code).toBe(0);
          
          // Check output for expected messages
          expect(output).toContain('Demo app detected');
          expect(output).toContain('Found 1 demo configuration');
          expect(output).toContain('Creating demo for: Test App Demo');
          expect(output).toContain('All demos completed!');
          
          // Check that no MODULE_NOT_FOUND errors occurred
          expect(errorOutput).not.toContain('MODULE_NOT_FOUND');
          expect(errorOutput).not.toContain('Cannot find module');
          
          // Check that a video file was created
          const files = fs.readdirSync(testDir);
          const videoFile = files.find(f => f.includes('test-demo') && (f.endsWith('.webm') || f.endsWith('.mp4')));
          expect(videoFile).toBeDefined();
          
          done();
        });
      } catch (error) {
        process.chdir(originalCwd);
        throw error;
      }
    }, 60000); // 60 second timeout for video creation
    
    it('should handle demo with missing selectors gracefully', (done) => {
      // Create a demo.json with invalid selectors
      fs.writeFileSync(path.join(testDir, 'app', 'demo-invalid.json'), JSON.stringify({
        name: "Invalid Selector Demo",
        description: "Test with missing selectors",
        entry: {
          url: "/",
          selector: "[data-testid='hero']",
          waitTime: 1000
        },
        interactions: [
          {
            type: "click",
            selector: "[data-testid='non-existent']",
            skipIfNotFound: true,
            waitBeforeMove: 500,
            description: "Try to click non-existent element"
          },
          {
            type: "hover",
            selector: "[data-testid='feature-1']",
            waitBeforeMove: 500,
            description: "Hover over existing element"
          }
        ],
        recording: {
          duration: 5000,
          skipErrors: true,
          outputName: "test-invalid-demo"
        }
      }, null, 2));
      
      const originalCwd = process.cwd();
      process.chdir(testDir);
      
      try {
        const demoProcess = spawn('node', [scriptPath, '.', '--port', '3003'], {
          env: { ...process.env, CI: 'true', HEADLESS: 'true' },
          cwd: testDir
        });
        
        let output = '';
        
        demoProcess.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        demoProcess.on('close', (code) => {
          process.chdir(originalCwd);
          
          // Should complete successfully even with missing selectors
          expect(code).toBe(0);
          expect(output).toContain('All demos completed!');
          
          // Clean up the extra demo file
          fs.unlinkSync(path.join(testDir, 'app', 'demo-invalid.json'));
          
          done();
        });
      } catch (error) {
        process.chdir(originalCwd);
        throw error;
      }
    }, 30000);
  });
});