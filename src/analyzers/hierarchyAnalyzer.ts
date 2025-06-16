import { Feature, Component, ExecutionPath, ExecutionStep } from '../types';

export class HierarchyAnalyzer {
  private features: Feature[];
  private routeMap: Map<string, Feature> = new Map();

  constructor(features: Feature[]) {
    this.features = features;
    this.buildRouteMap();
  }

  private buildRouteMap(): void {
    for (const feature of this.features) {
      const route = this.inferRoute(feature);
      if (route) {
        feature.route = route;
        this.routeMap.set(route, feature);
      }
    }
  }

  private inferRoute(feature: Feature): string | null {
    const pathParts = feature.path.split('/');
    
    const pagesIndex = pathParts.findIndex(part => 
      part === 'pages' || part === 'views' || part === 'routes'
    );
    
    if (pagesIndex !== -1 && pagesIndex < pathParts.length - 1) {
      const routeParts = pathParts.slice(pagesIndex + 1);
      const route = '/' + routeParts
        .filter(part => !part.includes('.'))
        .map(part => part.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, ''))
        .join('/');
      
      return route === '/index' ? '/' : route;
    }
    
    const featureName = feature.name
      .replace(/Feature$/, '')
      .replace(/Page$/, '')
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
    
    return `/${featureName}`;
  }

  buildExecutionPaths(): ExecutionPath[] {
    const sortedFeatures = [...this.features].sort((a, b) => b.priority - a.priority);
    return sortedFeatures.map(feature => this.buildFeatureExecutionPath(feature));
  }

  private buildFeatureExecutionPath(feature: Feature): ExecutionPath {
    const steps: ExecutionStep[] = [];
    
    if (feature.route) {
      steps.push({
        description: `Navigate to ${feature.route}`,
        action: 'navigate',
        value: feature.route,
        wait: 2000
      });
    }
    
    steps.push({
      description: 'Wait for page to load',
      action: 'waitForLoadState',
      wait: 1000
    });
    
    const interactiveComponents = this.findInteractiveComponents(feature);
    
    for (const component of interactiveComponents) {
      const componentSteps = this.buildComponentSteps(component);
      steps.push(...componentSteps);
    }
    
    if (steps.length < 3) {
      steps.push({
        description: 'Capture full page screenshot',
        action: 'screenshot',
        screenshot: true,
        wait: 500
      });
    }
    
    const duration = steps.reduce((sum, step) => sum + (step.wait || 0), 0);
    
    return {
      feature,
      steps,
      duration
    };
  }

  private findInteractiveComponents(feature: Feature): Component[] {
    return feature.components
      .filter(c => c.selectors && c.selectors.length > 0)
      .sort((a, b) => {
        const aIsPage = a.type === 'page' ? 1 : 0;
        const bIsPage = b.type === 'page' ? 1 : 0;
        return bIsPage - aIsPage;
      });
  }

  private buildComponentSteps(component: Component): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    
    if (!component.selectors) return steps;
    
    for (const selector of component.selectors) {
      switch (selector.action) {
        case 'click':
          steps.push({
            description: `Click ${selector.name} in ${component.name}`,
            selector: selector.selector,
            action: 'click',
            wait: 1000,
            screenshot: true
          });
          break;
          
        case 'input':
          steps.push({
            description: `Enter text in ${selector.name}`,
            selector: selector.selector,
            action: 'fill',
            value: selector.value || 'Demo text',
            wait: 500
          });
          break;
          
        case 'hover':
          steps.push({
            description: `Hover over ${selector.name}`,
            selector: selector.selector,
            action: 'hover',
            wait: 500,
            screenshot: true
          });
          break;
          
        default:
          steps.push({
            description: `Wait for ${selector.name} to be visible`,
            selector: selector.selector,
            action: 'waitForSelector',
            wait: 500
          });
      }
    }
    
    return steps;
  }

  getFeatureDependencyGraph(): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();
    
    for (const feature of this.features) {
      const deps = new Set<string>();
      
      for (const component of feature.components) {
        for (const importPath of component.imports) {
          const dependentFeature = this.findFeatureByImport(importPath);
          if (dependentFeature && dependentFeature.name !== feature.name) {
            deps.add(dependentFeature.name);
          }
        }
      }
      
      graph.set(feature.name, deps);
    }
    
    return graph;
  }

  private findFeatureByImport(importPath: string): Feature | null {
    for (const feature of this.features) {
      if (feature.components.some(c => 
        c.path.includes(importPath) || 
        importPath.includes(feature.name)
      )) {
        return feature;
      }
    }
    return null;
  }

  optimizeExecutionOrder(paths: ExecutionPath[]): ExecutionPath[] {
    const graph = this.getFeatureDependencyGraph();
    const visited = new Set<string>();
    const result: ExecutionPath[] = [];
    
    const visit = (featureName: string) => {
      if (visited.has(featureName)) return;
      visited.add(featureName);
      
      const deps = graph.get(featureName) || new Set();
      for (const dep of deps) {
        visit(dep);
      }
      
      const path = paths.find(p => p.feature.name === featureName);
      if (path) {
        result.push(path);
      }
    };
    
    for (const path of paths) {
      visit(path.feature.name);
    }
    
    for (const path of paths) {
      if (!result.includes(path)) {
        result.push(path);
      }
    }
    
    return result;
  }
}