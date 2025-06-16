# 🎬 Demo Video Maker

**Create stunning cinematic demo videos automatically from your web applications**

[![npm version](https://badge.fury.io/js/demo-video-maker.svg)](https://www.npmjs.com/package/demo-video-maker)
[![Node.js CI](https://github.com/lanemc/demo-video-maker/workflows/Node.js%20CI/badge.svg)](https://github.com/lanemc/demo-video-maker/actions)
[![Security Rating](https://img.shields.io/badge/security-A+-green.svg)](https://github.com/lanemc/demo-video-maker/security)

Transform your web application into professional demo videos with cinematic mouse movements, dynamic camera following, zoom effects, and gorgeous visual polish. Perfect for product launches, feature demonstrations, marketing materials, and investor presentations.

![Demo Video Example](https://via.placeholder.com/800x450/1a1a1a/ffffff?text=Cinematic+Demo+Video+Example)

## ✨ Features

- 🎯 **Configuration-Driven**: JSON-based demo definitions for precise control
- 📷 **Camera Follow**: Dynamic zoom and pan that follows mouse movement  
- ✨ **Visual Effects**: Glowing cursor, click animations, and smooth transitions
- 🎬 **Cinematic Quality**: Professional 1920x1080 HD video output
- 🔧 **Highly Configurable**: Customize timing, effects, interactions, and visual style
- 🖱️ **Realistic Interactions**: Click, hover, type, scroll, navigate with natural timing
- 🚀 **Multiple Demos**: Create separate demos for different features automatically
- 🛡️ **Enterprise Security**: Path validation, input sanitization, memory management

## 🚀 Quick Start

### Global Installation (Recommended)

```bash
# Install globally for use in any project
npm install -g demo-video-maker

# Navigate to your project directory
cd /path/to/your/webapp

# Create a sample configuration
cinematic-demo --init

# Start your web app (in another terminal)
npm start # or your app's start command

# Run the demo (will find all demo.json files)
cinematic-demo
```

### Local Installation

```bash
# Add to your project
npm install --save-dev demo-video-maker

# Add to package.json scripts
{
  "scripts": {
    "demo": "cinematic-demo",
    "demo:init": "cinematic-demo --init"
  }
}

# Generate sample configuration
npm run demo:init

# Run demos
npm run demo
```

## 📋 System Requirements

### Required
- **Node.js**: 18.0.0 or higher
- **Operating System**: macOS, Linux, or Windows 10+
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Browser**: Chromium/Chrome (automatically managed by Playwright)

### Optional
- **FFmpeg**: For video format conversion (auto-detected)
- **Git**: For version control integration

### Supported Web Frameworks
- ✅ React (Create React App, Next.js, Vite)
- ✅ Vue.js (Vue CLI, Nuxt.js, Vite)
- ✅ Angular (Angular CLI)
- ✅ Svelte/SvelteKit
- ✅ Plain HTML/JavaScript
- ✅ Any web framework running on localhost

## 📖 Configuration Guide

Demo Video Maker uses `demo.json` files to define interactive demonstrations. Place these files anywhere in your project to create targeted demos.

### Basic Configuration Structure

```json
{
  "name": "Feature Name",
  "description": "What this demo shows",
  "entry": {
    "url": "/feature-page",
    "selector": "[data-testid='main-container']",
    "waitTime": 2000
  },
  "interactions": [
    {
      "type": "click",
      "selector": "[data-testid='button']",
      "waitBeforeMove": 1000,
      "waitAfterClick": 1500,
      "zoomLevel": 2.0,
      "description": "Click the main action button"
    }
  ],
  "effects": {
    "cameraFollow": true,
    "zoomLevel": 1.6,
    "glowEffects": true,
    "clickAnimations": true
  },
  "recording": {
    "duration": 30000,
    "outputName": "feature-demo"
  }
}
```

### 🎯 Entry Configuration

Controls where the demo starts and initial setup.

```json
{
  "entry": {
    "url": "/dashboard",              // Relative URL to navigate to
    "selector": ".main-content",      // Element to focus on (optional)
    "waitTime": 3000                  // Time to wait after navigation (ms)
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `url` | string | `"/"` | Relative URL path to navigate to |
| `selector` | string | `null` | CSS selector to focus camera on entry |
| `waitTime` | number | `2000` | Milliseconds to wait after page load |

### 🎭 Interaction Types

Define the sequence of user interactions to demonstrate.

#### Click Interaction
```json
{
  "type": "click",
  "selector": "[data-testid='submit-button']",
  "waitBeforeMove": 1000,
  "waitAfterClick": 1500,
  "zoomLevel": 2.0,
  "skipIfNotFound": false,
  "description": "Submit the form"
}
```

#### Hover Interaction
```json
{
  "type": "hover",
  "selector": ".tooltip-trigger",
  "waitBeforeMove": 800,
  "waitAfterClick": 1200,
  "zoomLevel": 1.8,
  "description": "Show tooltip on hover"
}
```

#### Type Interaction
```json
{
  "type": "type",
  "selector": "input[name='email']",
  "text": "user@example.com",
  "waitBeforeMove": 500,
  "waitAfterClick": 2000,
  "zoomLevel": 1.9,
  "description": "Enter email address"
}
```

#### Scroll Interaction
```json
{
  "type": "scroll",
  "selector": "#bottom-section",
  "waitBeforeMove": 800,
  "waitAfterClick": 1500,
  "description": "Scroll to bottom section"
}
```

#### Wait Interaction
```json
{
  "type": "wait",
  "waitTime": 3000,
  "description": "Wait for animation to complete"
}
```

#### Navigate Interaction
```json
{
  "type": "navigate",
  "url": "/settings",
  "waitBeforeMove": 1000,
  "waitAfterClick": 2500,
  "description": "Navigate to settings page"
}
```

### 🎨 Visual Effects Configuration

Control the cinematic visual effects and camera behavior.

```json
{
  "effects": {
    "cameraFollow": true,           // Enable dynamic camera following
    "zoomLevel": 1.6,              // Default zoom level (1.0-5.0)
    "glowEffects": true,           // Mouse cursor glow effects
    "clickAnimations": true,       // Ripple effects on clicks
    "mouseMoveSpeed": 60,          // Cursor movement speed (10-200)
    "spotlightEffect": true        // Spotlight following cursor
  }
}
```

| Property | Type | Default | Range | Description |
|----------|------|---------|-------|-------------|
| `cameraFollow` | boolean | `true` | - | Enable dynamic zoom and camera following |
| `zoomLevel` | number | `1.6` | `1.0-5.0` | Default zoom level for interactions |
| `glowEffects` | boolean | `true` | - | Show glowing cursor effects |
| `clickAnimations` | boolean | `true` | - | Show click ripple animations |
| `mouseMoveSpeed` | number | `60` | `10-200` | Cursor movement speed (steps per second) |
| `spotlightEffect` | boolean | `true` | - | Dynamic spotlight following cursor |

### ⏱️ Timing Configuration

Fine-tune the timing and pacing of interactions.

```json
{
  "timings": {
    "waitBeforeMove": 1000,        // Delay before moving cursor (ms)
    "waitAfterClick": 1500,        // Delay after clicking (ms)
    "waitBetweenSteps": 800,       // Delay between interaction steps (ms)
    "pageLoadWait": 2000           // Wait time after navigation (ms)
  }
}
```

| Property | Type | Default | Range | Description |
|----------|------|---------|-------|-------------|
| `waitBeforeMove` | number | `1000` | `0-10000` | Milliseconds to wait before moving cursor |
| `waitAfterClick` | number | `1500` | `0-10000` | Milliseconds to wait after interaction |
| `waitBetweenSteps` | number | `800` | `0-5000` | Milliseconds between interaction steps |
| `pageLoadWait` | number | `2000` | `1000-30000` | Milliseconds to wait after page navigation |

### 🎥 Recording Configuration

Control video output and recording behavior.

```json
{
  "recording": {
    "duration": 45000,             // Maximum recording time (ms)
    "skipErrors": true,            // Continue recording on interaction errors
    "outputName": "custom-name"    // Custom filename (optional)
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `duration` | number | `30000` | Maximum recording duration in milliseconds |
| `skipErrors` | boolean | `true` | Continue recording if interactions fail |
| `outputName` | string | `null` | Custom filename (auto-generated if not specified) |

## 📂 Project Structure & Organization

### Recommended Directory Layout

```
your-project/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   └── demo.json          # Button component demo
│   │   └── Modal/
│   │       ├── Modal.jsx
│   │       └── demo.json          # Modal component demo
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   └── demo.json          # Dashboard page demo
│   │   └── Settings/
│   │       ├── Settings.jsx
│   │       └── demo.json          # Settings page demo
│   └── features/
│       ├── UserManagement/
│       │   ├── UserTable.jsx
│       │   └── demo.json          # User management demo
│       └── Analytics/
│           ├── Charts.jsx
│           └── demo.json          # Analytics demo
├── demo.json                      # Root-level overview demo
└── package.json
```

### Multiple Demo Strategy

Create focused demos for different audiences:

- **`/demo.json`** - Complete application overview
- **`/src/pages/*/demo.json`** - Individual page demonstrations  
- **`/src/components/*/demo.json`** - Component-specific demos
- **`/src/features/*/demo.json`** - Feature-focused demonstrations

## 🎪 Example Configurations

### Complete E-commerce Demo

```json
{
  "name": "E-commerce Checkout Flow",
  "description": "Complete checkout process from cart to confirmation",
  "entry": {
    "url": "/cart",
    "selector": "[data-testid='cart-container']",
    "waitTime": 2500
  },
  "interactions": [
    {
      "type": "hover",
      "selector": "[data-testid='cart-item']",
      "waitBeforeMove": 1000,
      "waitAfterClick": 1200,
      "zoomLevel": 1.8,
      "description": "Review cart items"
    },
    {
      "type": "click",
      "selector": "[data-testid='proceed-checkout']",
      "waitBeforeMove": 1500,
      "waitAfterClick": 2000,
      "zoomLevel": 2.0,
      "description": "Proceed to checkout"
    },
    {
      "type": "type",
      "selector": "[name='email']",
      "text": "customer@example.com",
      "waitBeforeMove": 800,
      "waitAfterClick": 1000,
      "zoomLevel": 2.2,
      "description": "Enter email address"
    },
    {
      "type": "type",
      "selector": "[name='address']",
      "text": "123 Main St, City, State 12345",
      "waitBeforeMove": 600,
      "waitAfterClick": 1200,
      "description": "Enter shipping address"
    },
    {
      "type": "click",
      "selector": "[data-testid='payment-credit-card']",
      "waitBeforeMove": 1000,
      "waitAfterClick": 1500,
      "zoomLevel": 1.9,
      "description": "Select credit card payment"
    },
    {
      "type": "wait",
      "waitTime": 2000,
      "description": "Wait for payment form animation"
    },
    {
      "type": "click",
      "selector": "[data-testid='place-order']",
      "waitBeforeMove": 1500,
      "waitAfterClick": 3000,
      "zoomLevel": 2.1,
      "description": "Complete the purchase"
    }
  ],
  "effects": {
    "cameraFollow": true,
    "zoomLevel": 1.7,
    "glowEffects": true,
    "clickAnimations": true,
    "mouseMoveSpeed": 55,
    "spotlightEffect": true
  },
  "recording": {
    "duration": 60000,
    "skipErrors": false,
    "outputName": "ecommerce-checkout-flow"
  },
  "timings": {
    "waitBeforeMove": 1200,
    "waitAfterClick": 1600,
    "waitBetweenSteps": 900,
    "pageLoadWait": 2500
  }
}
```

### Dashboard Analytics Demo

```json
{
  "name": "Analytics Dashboard",
  "description": "Interactive analytics dashboard with charts and filters",
  "entry": {
    "url": "/analytics",
    "selector": "[data-testid='analytics-dashboard']",
    "waitTime": 3000
  },
  "interactions": [
    {
      "type": "hover",
      "selector": "[data-testid='revenue-chart']",
      "waitBeforeMove": 1200,
      "waitAfterClick": 1500,
      "zoomLevel": 1.9,
      "description": "Examine revenue trends"
    },
    {
      "type": "click",
      "selector": "[data-testid='time-filter']",
      "waitBeforeMove": 1000,
      "waitAfterClick": 1200,
      "zoomLevel": 1.8,
      "description": "Open time period filter"
    },
    {
      "type": "click",
      "selector": "[data-value='last-30-days']",
      "waitBeforeMove": 800,
      "waitAfterClick": 2000,
      "zoomLevel": 2.0,
      "description": "Select last 30 days"
    },
    {
      "type": "scroll",
      "selector": "[data-testid='detailed-metrics']",
      "waitBeforeMove": 1000,
      "waitAfterClick": 1500,
      "description": "Scroll to detailed metrics"
    },
    {
      "type": "hover",
      "selector": "[data-testid='conversion-rate']",
      "waitBeforeMove": 800,
      "waitAfterClick": 1200,
      "zoomLevel": 1.7,
      "description": "Review conversion metrics"
    }
  ],
  "effects": {
    "cameraFollow": true,
    "zoomLevel": 1.6,
    "glowEffects": true,
    "clickAnimations": true,
    "mouseMoveSpeed": 65,
    "spotlightEffect": true
  },
  "recording": {
    "duration": 40000,
    "skipErrors": true,
    "outputName": "analytics-dashboard"
  }
}
```

## 🔧 Command Line Interface

### Basic Usage

```bash
# Run all demos in current directory
cinematic-demo

# Run demos for specific directory
cinematic-demo ./src/features

# Specify custom base URL
cinematic-demo . http://localhost:8080

# Generate sample configuration
cinematic-demo --init

# Show help
cinematic-demo --help
```

### Advanced Options

```bash
# Custom output directory
cinematic-demo --output ./custom-videos

# Specific demo file
cinematic-demo --config ./path/to/demo.json

# Verbose logging
cinematic-demo --verbose

# Skip browser installation check
cinematic-demo --skip-browser-check

# Custom viewport size
cinematic-demo --viewport 1280x720
```

## 🛠️ Integration Examples

### Next.js Integration

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "demo": "concurrently \"next dev\" \"wait-on http://localhost:3000 && cinematic-demo\"",
    "demo:record": "next build && next start & wait-on http://localhost:3000 && cinematic-demo && kill %1"
  },
  "devDependencies": {
    "demo-video-maker": "^1.0.0",
    "concurrently": "^7.6.0",
    "wait-on": "^7.0.1"
  }
}
```

### React (Vite) Integration

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "demo": "concurrently \"vite\" \"wait-on http://localhost:5173 && cinematic-demo . http://localhost:5173\"",
    "demo:ci": "vite build && vite preview & wait-on http://localhost:4173 && cinematic-demo . http://localhost:4173"
  }
}
```

### Vue.js Integration

```json
// package.json
{
  "scripts": {
    "serve": "vue-cli-service serve",
    "demo": "concurrently \"vue-cli-service serve\" \"wait-on http://localhost:8080 && cinematic-demo . http://localhost:8080\""
  }
}
```

## 🎨 Customization

### Custom CSS Selectors

Use data attributes for reliable element targeting:

```html
<!-- Recommended: Use data-testid -->
<button data-testid="submit-form">Submit</button>

<!-- Alternative: Use semantic selectors -->
<button className="btn-primary" aria-label="Submit form">Submit</button>

<!-- Avoid: Generic selectors -->
<button className="btn">Submit</button>
```

### Responsive Design Considerations

```json
{
  "interactions": [
    {
      "type": "click",
      "selector": "[data-testid='mobile-menu'], [data-testid='desktop-menu']",
      "skipIfNotFound": true,
      "description": "Open menu (responsive)"
    }
  ]
}
```

### Conditional Interactions

```json
{
  "interactions": [
    {
      "type": "click",
      "selector": "[data-testid='cookie-consent']",
      "skipIfNotFound": true,
      "description": "Accept cookies if banner is present"
    },
    {
      "type": "click",
      "selector": "[data-testid='main-action']",
      "skipIfNotFound": false,
      "description": "Required main action"
    }
  ]
}
```

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/demo-videos.yml
name: Generate Demo Videos

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  demo-videos:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install demo video automation
        run: npm install -g demo-video-maker
        
      - name: Build application
        run: npm run build
        
      - name: Start application
        run: npm start &
        
      - name: Wait for application
        run: npx wait-on http://localhost:3000
        
      - name: Generate demo videos
        run: cinematic-demo
        
      - name: Upload demo videos
        uses: actions/upload-artifact@v3
        with:
          name: demo-videos
          path: demo-output-cinematic/videos/
```

### Docker Integration

```dockerfile
# Dockerfile.demo
FROM node:18-slim

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci

# Install demo video automation
RUN npm install -g demo-video-maker

COPY . .
RUN npm run build

EXPOSE 3000

# Start app and generate demos
CMD ["sh", "-c", "npm start & sleep 10 && cinematic-demo"]
```

## 🔍 Troubleshooting

### Common Issues

#### Demo videos show 404 pages
```bash
# Ensure your app is running
npm start

# Check if the URL is accessible
curl http://localhost:3000

# Verify the correct port in your command
cinematic-demo . http://localhost:3000  # Adjust port as needed
```

#### Elements not found during demo
```json
{
  "interactions": [
    {
      "type": "click",
      "selector": "[data-testid='button']",
      "skipIfNotFound": true,  // Add this to continue on missing elements
      "description": "Optional interaction"
    }
  ]
}
```

#### Slow or jerky mouse movements
```json
{
  "effects": {
    "mouseMoveSpeed": 80,  // Increase for faster movement (10-200)
    "cameraFollow": false  // Disable if causing performance issues
  }
}
```

#### Browser crashes or timeouts
```json
{
  "timings": {
    "waitBeforeMove": 2000,     // Increase wait times
    "waitAfterClick": 3000,
    "pageLoadWait": 5000
  },
  "recording": {
    "duration": 120000,         // Increase recording duration
    "skipErrors": true          // Continue on errors
  }
}
```

### Debug Mode

```bash
# Enable verbose logging
DEBUG=demo-video-maker cinematic-demo

# Keep browser open for inspection
cinematic-demo --headed --no-close

# Generate single demo for testing
cinematic-demo --config ./src/components/Button/demo.json
```

### Performance Optimization

```json
{
  "effects": {
    "cameraFollow": false,      // Disable for better performance
    "mouseMoveSpeed": 100,      // Faster movements
    "glowEffects": false        // Disable for simpler rendering
  },
  "timings": {
    "waitBetweenSteps": 500     // Reduce delays
  }
}
```

## 📚 API Reference

### Configuration Schema

Complete TypeScript interface for configuration validation:

```typescript
interface DemoConfig {
  name: string;
  description?: string;
  entry: {
    url?: string;
    selector?: string;
    waitTime?: number;
  };
  interactions: Interaction[];
  effects?: EffectsConfig;
  recording?: RecordingConfig;
  timings?: TimingsConfig;
}

interface Interaction {
  type: 'click' | 'hover' | 'type' | 'scroll' | 'wait' | 'navigate';
  selector?: string;
  text?: string;              // For 'type' interactions
  url?: string;               // For 'navigate' interactions
  waitTime?: number;          // For 'wait' interactions
  waitBeforeMove?: number;
  waitAfterClick?: number;
  zoomLevel?: number;
  skipIfNotFound?: boolean;
  description?: string;
}

interface EffectsConfig {
  cameraFollow?: boolean;
  zoomLevel?: number;
  glowEffects?: boolean;
  clickAnimations?: boolean;
  mouseMoveSpeed?: number;
  spotlightEffect?: boolean;
}

interface RecordingConfig {
  duration?: number;
  skipErrors?: boolean;
  outputName?: string;
}

interface TimingsConfig {
  waitBeforeMove?: number;
  waitAfterClick?: number;
  waitBetweenSteps?: number;
  pageLoadWait?: number;
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/lanemc/demo-video-maker.git
cd demo-video-maker

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the project
npm run build
```

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests  
npm run test:integration

# Coverage report
npm run test:coverage

# Security audit
npm audit
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Playwright](https://playwright.dev/) for browser automation
- [Chromium](https://www.chromium.org/) for rendering engine
- Community contributors and testers

## 📞 Support

- 📖 [Documentation](https://github.com/lanemc/demo-video-maker/wiki)
- 🐛 [Issue Tracker](https://github.com/lanemc/demo-video-maker/issues)
- 💬 [Discussions](https://github.com/lanemc/demo-video-maker/discussions)
- 📧 [Email Support](mailto:support@demo-video-maker.com)

---

Made with ❤️ by the Demo Video Maker team