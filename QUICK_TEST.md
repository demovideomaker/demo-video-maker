# Quick Local Testing Guide

## 🚀 Test the Tool Right Now

### Step 1: Build and Setup
```bash
# Build the TypeScript
npm run build

# Install Playwright browsers (required for video recording)
npx playwright install
```

### Step 2: Start the Demo App
```bash
# In terminal 1 - Start the demo app
cd demo-app
npm install
npm run dev
```

Wait for the message: `Ready - started server on 0.0.0.0:3000`

### Step 3: Run the Demo Video Generation
```bash
# In terminal 2 - Generate demo videos
cd ..
npm run demo ./demo-app http://localhost:3000
```

## 🧪 Run the Interactive Setup (Recommended First)
```bash
# This will guide you through everything
npm run setup
```

## 🔍 Test Individual Components

### Test the Codebase Analyzer
```bash
# Test just the analysis
npm run test:unit -- --testNamePattern="codebaseAnalyzer"
```

### Test Video Storage Options
```bash
# Create a custom config
node -e "
const { createDemoVideos } = require('./dist/index.js');

createDemoVideos({
  projectPath: './demo-app',
  baseUrl: 'http://localhost:3000',
  outputPath: './test-output',
  videoFormat: {
    format: 'mp4',
    quality: 'high'
  },
  storage: {
    baseDir: './test-output',
    organizationStrategy: 'feature-based'
  }
}).then(() => console.log('Done!')).catch(console.error);
"
```

## 📱 Quick Demo Without Browser (Testing Only)
```bash
# Test analysis without video recording
node -e "
const { CodebaseAnalyzer } = require('./dist/analyzers/codebaseAnalyzer.js');
const analyzer = new CodebaseAnalyzer('./demo-app');
analyzer.analyze().then(result => {
  console.log('Features found:', result.features.length);
  console.log('Components found:', result.components.length);
  result.features.forEach(f => console.log('- ' + f.name));
});
"
```

## 🎯 Expected Output Structure
```
demo-output/
├── videos/
│   ├── HomePage-demo.webm
│   ├── Dashboard-demo.webm
│   ├── Analytics-demo.webm
│   ├── UserManagement-demo.webm
│   └── Settings-demo.webm
├── screenshots/
│   ├── HomePage/
│   ├── Dashboard/
│   └── ...
├── DEMO_OVERVIEW.md
└── DEMO_REPORT.md
```

## 🐛 Troubleshooting

### If Demo App Won't Start
```bash
cd demo-app
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### If Playwright Fails
```bash
# Install system dependencies
npx playwright install-deps

# Or just Chrome
npx playwright install chromium
```

### If Build Fails
```bash
# Clean build
rm -rf dist/
npm run build
```

### Memory Issues
```bash
# Run with increased memory
node --max-old-space-size=4096 dist/index.js ./demo-app http://localhost:3000
```

## 🎮 Interactive Testing Commands

### Run All Tests
```bash
npm test
```

### Test Specific Features
```bash
# Test storage manager
npm run test:unit -- --testNamePattern="storageManager"

# Test hierarchy analyzer  
npm run test:unit -- --testNamePattern="hierarchyAnalyzer"

# Test full integration
npm run test:integration
```

### Monitor Performance
```bash
# Run with memory monitoring
npm run setup:monitor
```

## 🔧 Custom Configuration Testing

Create `test-config.js`:
```javascript
const { createDemoVideos } = require('./dist/index.js');

const customConfig = {
  projectPath: './demo-app',
  baseUrl: 'http://localhost:3000',
  outputPath: './custom-output',
  features: ['Dashboard', 'UserManagement'], // Only these features
  videoFormat: {
    format: 'mp4',
    codec: 'h264',
    quality: 'high',
    fps: 30
  },
  storage: {
    baseDir: './custom-output',
    organizationStrategy: 'date-based',
    naming: {
      videos: '{feature}-{timestamp}-demo',
      screenshots: '{feature}-{action}-{number}'
    }
  },
  recording: {
    slowMo: 200,
    headless: false // See the browser in action
  }
};

createDemoVideos(customConfig).then(() => {
  console.log('Custom demo generation complete!');
}).catch(console.error);
```

Then run:
```bash
node test-config.js
```

## ⚡ One-Liner Full Test
```bash
npm install && npm run build && cd demo-app && npm install && npm run dev &
sleep 5 && cd .. && npm run demo ./demo-app http://localhost:3000
```

## 🎥 What You Should See

1. **Browser opens** showing your demo app
2. **Automated navigation** through different features
3. **Screenshots captured** at key interaction points
4. **Videos saved** in the output directory
5. **Documentation generated** for each feature

The whole process should take 2-5 minutes depending on your system!