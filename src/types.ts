export interface Feature {
  name: string;
  path: string;
  description?: string;
  components: Component[];
  dependencies: string[];
  priority: number;
  route?: string;
}

export interface Component {
  name: string;
  type: 'page' | 'component' | 'hook' | 'service' | 'util';
  path: string;
  exports: string[];
  imports: string[];
  props?: string[];
  events?: string[];
  selectors?: Selector[];
}

export interface Selector {
  name: string;
  selector: string;
  action: 'click' | 'input' | 'hover' | 'scroll' | 'wait';
  value?: string;
}

export interface ExecutionPath {
  feature: Feature;
  steps: ExecutionStep[];
  duration: number;
}

export interface ExecutionStep {
  description: string;
  selector?: string;
  action: string;
  value?: string;
  screenshot?: boolean;
  wait?: number;
}

export interface VideoFormat {
  format: 'webm' | 'mp4' | 'avi';
  codec?: 'vp8' | 'vp9' | 'h264' | 'h265';
  quality?: 'low' | 'medium' | 'high' | 'lossless';
  fps?: number;
}

export interface StorageConfig {
  baseDir: string;
  videoDir?: string;
  screenshotDir?: string;
  documentationDir?: string;
  organizationStrategy?: 'flat' | 'feature-based' | 'date-based';
  naming?: {
    videos?: string; // Template: {feature}-{timestamp}
    screenshots?: string; // Template: {feature}-step-{number}
    features?: string; // Template: {feature}-{date}
  };
}

export interface DemoConfig {
  projectPath: string;
  outputPath: string;
  baseUrl: string;
  viewport?: { width: number; height: number };
  features?: string[];
  videoFormat?: VideoFormat;
  storage?: StorageConfig;
  recording?: {
    slowMo?: number;
    headless?: boolean;
    devtools?: boolean;
    timeout?: number;
  };
  analysis?: {
    maxDepth?: number;
    excludePatterns?: string[];
    includePatterns?: string[];
  };
}

export interface InteractionStep {
  selector: string;
  action: 'click' | 'type' | 'hover' | 'scroll' | 'select';
  label: string;
  element: string;
  value?: string;
  priority: number;
  description: string;
  coordinates?: { x: number; y: number };
}

export interface InteractionPlan {
  featureName: string;
  steps: InteractionStep[];
  duration: number;
  description: string;
}