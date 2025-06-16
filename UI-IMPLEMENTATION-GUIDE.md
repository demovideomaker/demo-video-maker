# 🛠️ UI Implementation Guide - Technical Blueprint

## Quick Start Architecture

```bash
demo-video-automation-ui/
├── frontend/                    # Next.js 14 app
│   ├── app/                    # App router pages
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Core libraries
│   ├── store/                  # Zustand state
│   └── styles/                 # Tailwind config
├── backend/                    # Node.js services
│   ├── api/                    # REST endpoints
│   ├── services/               # Business logic
│   ├── workers/                # Background jobs
│   └── websocket/              # Real-time updates
├── shared/                     # Shared types/utils
└── electron/                   # Desktop app wrapper
```

## 🎨 Frontend Implementation

### 1. Core Layout Component
```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <div className="flex h-screen bg-gray-900">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
          
          {/* Claude Assistant Panel */}
          <ClaudePanel />
        </div>
        
        {/* Global notifications */}
        <Toaster />
      </body>
    </html>
  );
}
```

### 2. Project Analysis Real-time Updates
```tsx
// components/AnalysisProgress.tsx
import { useWebSocket } from '@/hooks/useWebSocket';

export function AnalysisProgress({ projectId }) {
  const { progress, logs } = useWebSocket(`/analysis/${projectId}`);
  
  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
        <motion.div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      {/* Live Logs */}
      <ScrollArea className="h-64 bg-black/50 rounded-lg p-4">
        {logs.map((log, i) => (
          <LogEntry key={i} {...log} />
        ))}
      </ScrollArea>
    </div>
  );
}
```

### 3. Interactive Feature Planner
```tsx
// components/FeaturePlanner/index.tsx
import { DndContext, DragEndEvent } from '@dnd-kit/sortable';

export function FeaturePlanner({ feature, onUpdate }) {
  const [plan, setPlan] = useState(feature.plan);
  const [preview, setPreview] = useState<BrowserPreview>();
  
  // Live browser preview
  useEffect(() => {
    const browser = new BrowserPreview();
    browser.connect(feature.url);
    setPreview(browser);
    
    return () => browser.disconnect();
  }, [feature.url]);
  
  // Drag and drop handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setPlan(reorderSteps(plan, active.id, over.id));
    }
  };
  
  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      {/* Browser Preview */}
      <div className="relative rounded-lg overflow-hidden bg-black">
        <BrowserFrame>
          <iframe 
            ref={preview?.attach} 
            className="w-full h-full"
          />
        </BrowserFrame>
        
        {/* Interaction Overlay */}
        <InteractionOverlay 
          onElementClick={(selector) => {
            addInteractionStep(plan, { 
              action: 'click', 
              selector 
            });
          }}
        />
      </div>
      
      {/* Interaction Steps */}
      <div className="space-y-4">
        <DndContext onDragEnd={handleDragEnd}>
          <SortableList>
            {plan.steps.map((step, index) => (
              <InteractionStep 
                key={step.id}
                step={step}
                index={index}
                onEdit={(updated) => updateStep(plan, index, updated)}
                onDelete={() => removeStep(plan, index)}
              />
            ))}
          </SortableList>
        </DndContext>
        
        <AddStepButton />
      </div>
    </div>
  );
}
```

### 4. Claude AI Integration Hook
```tsx
// hooks/useClaude.ts
export function useClaude() {
  const apiKey = useStore(state => state.apiKey);
  
  const analyzePage = useCallback(async (html: string) => {
    const response = await fetch('/api/claude/analyze', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ html })
    });
    
    return response.json();
  }, [apiKey]);
  
  const suggestInteractions = useCallback(async (feature: Feature) => {
    // Stream suggestions using SSE
    const eventSource = new EventSource(
      `/api/claude/suggest?feature=${feature.id}`,
      { headers: { 'Authorization': `Bearer ${apiKey}` }}
    );
    
    return new Promise((resolve) => {
      const suggestions = [];
      
      eventSource.onmessage = (event) => {
        const suggestion = JSON.parse(event.data);
        suggestions.push(suggestion);
      };
      
      eventSource.onerror = () => {
        eventSource.close();
        resolve(suggestions);
      };
    });
  }, [apiKey]);
  
  return { analyzePage, suggestInteractions };
}
```

### 5. Video Recording Controller
```tsx
// components/RecordingController.tsx
export function RecordingController({ plan }) {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  
  const startRecording = async () => {
    setStatus('preparing');
    
    // Initialize recording session
    const session = await fetch('/api/record/start', {
      method: 'POST',
      body: JSON.stringify({ plan })
    }).then(r => r.json());
    
    // Connect to WebSocket for real-time updates
    const ws = new WebSocket(`ws://localhost:3001/record/${session.id}`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      switch (update.type) {
        case 'step_complete':
          setCurrentStep(update.stepIndex);
          break;
        case 'recording_complete':
          setStatus('processing');
          break;
        case 'video_ready':
          setStatus('complete');
          onVideoReady(update.videoUrl);
          break;
      }
    };
    
    setStatus('recording');
  };
  
  return (
    <div className="space-y-6">
      {/* Recording Status */}
      <RecordingStatus status={status} />
      
      {/* Step Progress */}
      <StepProgress 
        steps={plan.steps}
        currentStep={currentStep}
      />
      
      {/* Controls */}
      <div className="flex gap-4">
        <Button 
          onClick={startRecording}
          disabled={status !== 'idle'}
        >
          Start Recording
        </Button>
        
        {status === 'recording' && (
          <>
            <Button variant="outline">Pause</Button>
            <Button variant="destructive">Stop</Button>
          </>
        )}
      </div>
    </div>
  );
}
```

## 🖥️ Backend Implementation

### 1. Project Analyzer Service
```typescript
// backend/services/ProjectAnalyzer.ts
import { Parser } from '@babel/parser';
import traverse from '@babel/traverse';

export class ProjectAnalyzer {
  async analyzeProject(projectPath: string): Promise<Analysis> {
    const features = await this.findFeatures(projectPath);
    const components = await this.findComponents(projectPath);
    const routes = await this.findRoutes(projectPath);
    
    // Send progress updates via WebSocket
    this.sendProgress('Analyzing interactions...', 60);
    
    const interactions = await this.findInteractions(components);
    
    return {
      features,
      components,
      routes,
      interactions
    };
  }
  
  private async findInteractions(components: Component[]) {
    const interactions: Interaction[] = [];
    
    for (const component of components) {
      const ast = Parser.parse(component.code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });
      
      traverse(ast, {
        JSXElement(path) {
          const element = path.node.openingElement;
          
          // Find interactive elements
          if (this.isInteractive(element)) {
            interactions.push({
              componentId: component.id,
              type: this.getInteractionType(element),
              selector: this.buildSelector(element),
              props: this.extractProps(element)
            });
          }
        }
      });
    }
    
    return interactions;
  }
}
```

### 2. Recording Orchestrator
```typescript
// backend/services/RecordingOrchestrator.ts
import { chromium, Browser, Page } from 'playwright';

export class RecordingOrchestrator {
  private sessions = new Map<string, RecordingSession>();
  
  async startRecording(sessionId: string, plan: DemoPlan) {
    const browser = await chromium.launch({
      args: ['--force-device-scale-factor=1']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: `./recordings/${sessionId}`,
        size: { width: 1920, height: 1080 }
      }
    });
    
    const page = await context.newPage();
    
    // Inject cinematic effects
    await page.addInitScript(cinematicEffectsScript);
    
    const session = {
      id: sessionId,
      browser,
      context,
      page,
      plan,
      currentStep: 0
    };
    
    this.sessions.set(sessionId, session);
    
    // Execute plan
    this.executePlan(session);
    
    return sessionId;
  }
  
  private async executePlan(session: RecordingSession) {
    const { page, plan } = session;
    
    // Navigate to starting URL
    await page.goto(plan.baseUrl);
    
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      session.currentStep = i;
      
      // Notify progress
      this.notifyProgress(session.id, {
        type: 'step_start',
        stepIndex: i,
        step: step
      });
      
      // Execute step
      await this.executeStep(page, step);
      
      // Notify completion
      this.notifyProgress(session.id, {
        type: 'step_complete',
        stepIndex: i
      });
      
      // Pause between steps
      await page.waitForTimeout(1000);
    }
    
    // Finalize recording
    await this.finalizeRecording(session);
  }
}
```

### 3. Video Processing Pipeline
```typescript
// backend/services/VideoProcessor.ts
import ffmpeg from 'fluent-ffmpeg';

export class VideoProcessor {
  async processVideo(
    inputPath: string, 
    outputPath: string,
    effects: VideoEffects
  ): Promise<void> {
    const command = ffmpeg(inputPath);
    
    // Add cursor if needed
    if (effects.cursor) {
      command.complexFilter([
        {
          filter: 'overlay',
          options: {
            x: 'cursor.x',
            y: 'cursor.y'
          },
          inputs: ['cursor.png']
        }
      ]);
    }
    
    // Add zoom effects
    if (effects.zoom) {
      for (const zoom of effects.zoom) {
        command.complexFilter([
          {
            filter: 'zoompan',
            options: {
              z: `if(between(t,${zoom.start},${zoom.end}),${zoom.scale},1)`,
              x: zoom.x,
              y: zoom.y,
              d: 1,
              s: '1920x1080'
            }
          }
        ]);
      }
    }
    
    // Export with optimizations
    command
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-preset fast',
        '-crf 22',
        '-movflags +faststart'
      ])
      .on('progress', (progress) => {
        this.emitProgress(progress.percent);
      })
      .on('end', () => {
        this.emitComplete(outputPath);
      })
      .save(outputPath);
  }
}
```

### 4. Claude API Service
```typescript
// backend/services/ClaudeService.ts
export class ClaudeService {
  private client: Anthropic;
  
  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }
  
  async analyzeComponent(componentCode: string) {
    const response = await this.client.messages.create({
      model: 'claude-3-opus-20240229',
      messages: [{
        role: 'user',
        content: `Analyze this React component and identify:
        1. What feature/functionality it provides
        2. Interactive elements (buttons, forms, etc)
        3. Suggested demo interactions
        
        Component code:
        ${componentCode}`
      }],
      max_tokens: 1000
    });
    
    return this.parseAnalysis(response.content);
  }
  
  async generateDemoScript(feature: Feature) {
    const response = await this.client.messages.create({
      model: 'claude-3-opus-20240229',
      messages: [{
        role: 'user',
        content: `Create a demo script for this feature:
        
        Feature: ${feature.name}
        Components: ${feature.components.join(', ')}
        Interactive Elements: ${JSON.stringify(feature.interactions)}
        
        Generate a natural, engaging demo flow that showcases the key functionality.`
      }],
      stream: true
    });
    
    // Stream responses back to frontend
    for await (const chunk of response) {
      yield chunk;
    }
  }
}
```

## 🎯 State Management

```typescript
// store/demoStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface DemoStore {
  // Project State
  project: Project | null;
  setProject: (project: Project) => void;
  
  // Analysis State
  analysis: {
    status: 'idle' | 'analyzing' | 'complete' | 'error';
    progress: number;
    results: AnalysisResults | null;
  };
  
  // Planning State
  plans: Map<string, DemoPlan>;
  currentPlan: DemoPlan | null;
  updatePlan: (featureId: string, plan: DemoPlan) => void;
  
  // Recording State
  recording: {
    status: 'idle' | 'preparing' | 'recording' | 'processing' | 'complete';
    sessionId: string | null;
    progress: number;
    currentStep: number;
  };
  
  // Video State
  videos: Video[];
  addVideo: (video: Video) => void;
  
  // Claude State
  claude: {
    apiKey: string | null;
    conversation: Message[];
    suggestions: Suggestion[];
  };
  
  // Actions
  analyzeProject: async () => void;
  startRecording: async (plan: DemoPlan) => void;
  exportVideo: async (videoId: string, format: ExportFormat) => void;
}

export const useDemoStore = create<DemoStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ... implementation
      }),
      {
        name: 'demo-store',
        partialize: (state) => ({
          project: state.project,
          videos: state.videos,
          claude: { apiKey: state.claude.apiKey }
        })
      }
    )
  )
);
```

## 🚀 Desktop App Wrapper (Electron)

```typescript
// electron/main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';

let mainWindow: BrowserWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0a0a'
  });
  
  // Load the Next.js app
  mainWindow.loadURL('http://localhost:3000');
  
  // Handle file selection
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    return result.filePaths[0];
  });
  
  // Handle video export
  ipcMain.handle('export-video', async (event, videoPath, format) => {
    // Use native system dialogs for save location
    const savePath = await dialog.showSaveDialog(mainWindow, {
      defaultPath: `demo.${format}`,
      filters: [{ name: 'Video', extensions: [format] }]
    });
    
    if (!savePath.canceled) {
      await exportVideo(videoPath, savePath.filePath, format);
    }
  });
});
```

## 🎨 Component Library Setup

```tsx
// components/ui/index.ts
export { Button } from './button';
export { Card } from './card';
export { Dialog } from './dialog';
export { Progress } from './progress';
export { ScrollArea } from './scroll-area';
export { Tabs } from './tabs';
export { Toast } from './toast';

// Custom components
export { VideoPlayer } from './video-player';
export { CodeEditor } from './code-editor';
export { DragDropList } from './drag-drop-list';
export { BrowserFrame } from './browser-frame';
export { Timeline } from './timeline';
```

This implementation provides a solid foundation for building the UI. The modular architecture allows for easy scaling, and the real-time features create an engaging user experience. The combination of Next.js, Playwright, and Claude API creates a powerful tool for automated demo creation! 🚀