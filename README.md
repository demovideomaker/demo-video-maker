# Demo Video Automation Tool

## Overview

The Demo Video Automation Tool is an advanced AI-powered system that automatically generates professional-quality demo videos from any codebase. It combines intelligent code analysis, Claude AI integration, and cinematic visual effects to create engaging product demonstrations without manual effort.

## Architecture

### 1. Core Components

**TypeScript Engine (Core)**
- **CodebaseAnalyzer**: Uses Babel AST parsing to understand code structure, identify features, and map component relationships
- **PlaywrightExecutor**: Handles browser automation with multiple execution modes (standard, visual, interactive)
- **DocumentationGenerator**: Creates comprehensive documentation from analyzed features
- **Security & Performance**: Built-in file validation, memory monitoring, and caching systems

**Command-Line Tools**
- `demo-planner.js`: Interactive planning with user approval workflow
- `demo-executor.js`: Executes approved plans with visual effects
- `demo-cinematic.js`: Creates broadcast-quality demos with zoom, glow, and camera effects
- `demo-interactive-real.js`: Generates demos with visible mouse interactions

**Web UI (Next.js Application)**
- Modern React interface with real-time WebSocket updates
- Drag-and-drop project management
- Interactive demo planning with live preview
- Integrated Claude AI assistant
- Video repository and player

### 2. How It Works

**Phase 1: Code Analysis**
The tool performs deep AST analysis to understand your codebase:
- Identifies features, components, and their relationships
- Finds interactive elements (buttons, forms, navigation)
- Maps component dependencies and data flow
- Detects framework (React, Vue, Angular, etc.)

**Phase 2: AI-Powered Planning**
Claude AI analyzes the discovered features to:
- Suggest optimal demo flows based on component purpose
- Generate realistic test data contextually
- Recommend user journey paths
- Provide explanations for technical decisions

**Phase 3: Interactive Review**
Users can review and modify demo plans:
- See step-by-step actions with selectors
- Edit, reorder, or remove steps
- Add custom interactions
- Preview element highlighting

**Phase 4: Cinematic Recording**
The tool records demos with professional effects:
- **Glowing Cursor**: Animated cursor with trailing effects
- **Dynamic Zoom**: Intelligent 1.8x zoom on interactions
- **Spotlight Effect**: Follows cursor movements
- **Click Animations**: Ripple effects and visual feedback
- **Smooth Transitions**: Professional camera movements

**Phase 5: Output Generation**
Videos are automatically:
- Recorded in full HD (1920x1080)
- Saved in WebM format
- Organized by feature and timestamp
- Ready for sharing or conversion

### 3. Key Features

**Intelligent Feature Discovery**
- Automatically identifies all features in your codebase
- Understands component relationships and dependencies
- Detects interactive elements and user flows
- Works with any JavaScript framework

**AI Integration**
- Claude AI provides contextual assistance throughout
- Suggests improvements to demo flows
- Helps troubleshoot issues
- Generates meaningful demo narratives

**Professional Visual Effects**
- Cinema-quality mouse tracking and movements
- Dynamic zoom and pan effects
- Element highlighting with glow effects
- Smooth, natural-looking interactions

**Real-Time Control**
- WebSocket-based live updates
- Pause/resume recording capability
- Skip steps on the fly
- Progress tracking and error handling

**Human-in-the-Loop Design**
- Combines AI intelligence with human verification
- Interactive editing before recording
- Approval workflow ensures quality
- Customizable for specific needs

### 4. Technical Stack

**Frontend**
- Next.js 14 with App Router
- React 19 with TypeScript
- Tailwind CSS + Radix UI
- Framer Motion animations
- Zustand state management

**Backend**
- Node.js with TypeScript
- Playwright for browser automation
- WebSocket for real-time communication
- Babel parser for AST analysis

**AI Integration**
- Claude AI SDK
- Intelligent code understanding
- Contextual assistance
- Error troubleshooting

### 5. Project Structure

```
demo-video-automation/
├── src/                        # Core TypeScript source code
│   ├── analyzers/             # Code analysis components
│   ├── executors/             # Demo execution engines
│   ├── generators/            # Documentation generators
│   └── types.ts               # TypeScript interfaces
├── demo-app/                   # Sample application for testing
├── demo-video-automation-ui/   # Next.js UI application
│   ├── app/                   # App Router pages
│   ├── components/            # React components
│   ├── backend/               # Recording orchestration
│   └── scripts/               # Standalone servers
├── bin/                        # CLI executable scripts
├── demo-*.js                   # Various demo execution scripts
└── demo-output-*/              # Generated demo outputs
```

### 6. Getting Started

**Installation**
```bash
# Install dependencies
npm install

# Build the TypeScript core
npm run build

# Start the UI application
cd demo-video-automation-ui
npm install
npm run dev
```

**Basic Usage**
```bash
# Run interactive demo planner
node demo-planner.js ./path/to/your/project

# Execute with cinematic effects
node demo-cinematic.js ./path/to/your/project

# Use the web UI
# Navigate to http://localhost:3000
```

### 7. Use Cases

- **Product Demos**: Automatically generate demos for new features
- **Documentation**: Create visual guides for complex workflows
- **Testing**: Validate UI flows and interactions
- **Marketing**: Produce professional demo videos
- **Training**: Generate onboarding materials

### 8. Innovation Highlights

1. **Deep Code Understanding**: Not just recording clicks, but understanding feature purpose through AST analysis
2. **AI-Powered Workflows**: Claude AI suggests optimal demo paths based on code structure
3. **Broadcast Quality**: Professional visual effects rival manually created videos
4. **Framework Agnostic**: Works with any JavaScript framework automatically
5. **Interactive Planning**: Human verification ensures demo quality
6. **Real-Time Control**: Live recording management via WebSocket

### 9. Configuration

The tool can be configured via `demo-automation.config.js`:
```javascript
module.exports = {
  viewport: { width: 1280, height: 720 },
  features: {
    patterns: ['pages', 'features', 'components'],
    exclude: ['__tests__', 'node_modules']
  },
  selectors: {
    priority: ['data-testid', 'id', 'aria-label', 'type', 'class']
  }
}
```

### 10. Output Examples

The tool generates various outputs:
- **Videos**: WebM format demo recordings
- **Screenshots**: PNG captures of key interactions
- **Documentation**: Markdown files describing features
- **Reports**: JSON summaries of demo execution

This tool represents a paradigm shift in demo creation, transforming hours of manual work into an automated, AI-driven process that produces professional results in minutes.