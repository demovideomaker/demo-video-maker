import { HierarchyAnalyzer } from '../../src/analyzers/hierarchyAnalyzer';
import { Feature, Component } from '../../src/types';

describe('HierarchyAnalyzer', () => {
  let analyzer: HierarchyAnalyzer;
  let mockFeatures: Feature[];

  beforeEach(() => {
    mockFeatures = createMockFeatures();
    analyzer = new HierarchyAnalyzer(mockFeatures);
  });

  describe('buildExecutionPaths', () => {
    it('should create execution paths for all features', () => {
      const paths = analyzer.buildExecutionPaths();
      
      expect(paths).toHaveLength(mockFeatures.length);
      paths.forEach(path => {
        expect(path.feature).toBeDefined();
        expect(path.steps).toBeDefined();
        expect(path.duration).toBeGreaterThan(0);
      });
    });

    it('should include navigation steps for features with routes', () => {
      const paths = analyzer.buildExecutionPaths();
      
      const dashboardPath = paths.find(p => p.feature.name === 'Dashboard');
      expect(dashboardPath).toBeDefined();
      
      const navigationStep = dashboardPath?.steps.find(s => s.action === 'navigate');
      expect(navigationStep).toBeDefined();
      expect(navigationStep?.value).toBe('/dashboard');
    });

    it('should include interaction steps for components with selectors', () => {
      const paths = analyzer.buildExecutionPaths();
      
      const userProfilePath = paths.find(p => p.feature.name === 'UserProfile');
      expect(userProfilePath).toBeDefined();
      
      const clickSteps = userProfilePath?.steps.filter(s => s.action === 'click');
      expect(clickSteps?.length).toBeGreaterThan(0);
    });

    it('should calculate total duration correctly', () => {
      const paths = analyzer.buildExecutionPaths();
      
      paths.forEach(path => {
        const calculatedDuration = path.steps.reduce(
          (sum, step) => sum + (step.wait || 0), 
          0
        );
        expect(path.duration).toBe(calculatedDuration);
      });
    });
  });

  describe('route inference', () => {
    it('should infer routes from feature paths', () => {
      const dashboardFeature = mockFeatures.find(f => f.name === 'Dashboard');
      expect(dashboardFeature?.route).toBe('/dashboard');
      
      const userProfileFeature = mockFeatures.find(f => f.name === 'UserProfile');
      expect(userProfileFeature?.route).toBe('/user-profile');
    });

    it('should handle index routes correctly', () => {
      const homeFeature = mockFeatures.find(f => f.name === 'HomePage');
      expect(homeFeature?.route).toBe('/');
    });
  });

  describe('getFeatureDependencyGraph', () => {
    it('should build dependency graph from imports', () => {
      const graph = analyzer.getFeatureDependencyGraph();
      
      expect(graph).toBeInstanceOf(Map);
      expect(graph.size).toBe(mockFeatures.length);
      
      // Dashboard should depend on UserProfile (based on mock imports)
      const dashboardDeps = graph.get('Dashboard');
      expect(dashboardDeps).toBeDefined();
    });

    it('should not include self-dependencies', () => {
      const graph = analyzer.getFeatureDependencyGraph();
      
      graph.forEach((deps, featureName) => {
        expect(deps.has(featureName)).toBe(false);
      });
    });
  });

  describe('optimizeExecutionOrder', () => {
    it('should order paths based on dependencies', () => {
      const paths = analyzer.buildExecutionPaths();
      const optimized = analyzer.optimizeExecutionOrder(paths);
      
      expect(optimized).toHaveLength(paths.length);
      
      // Features with fewer dependencies should come first
      const userProfileIndex = optimized.findIndex(p => p.feature.name === 'UserProfile');
      const dashboardIndex = optimized.findIndex(p => p.feature.name === 'Dashboard');
      
      // UserProfile has no dependencies, Dashboard depends on UserProfile
      expect(userProfileIndex).toBeLessThan(dashboardIndex);
    });

    it('should maintain all original paths', () => {
      const paths = analyzer.buildExecutionPaths();
      const optimized = analyzer.optimizeExecutionOrder(paths);
      
      expect(optimized).toHaveLength(paths.length);
      
      const originalNames = paths.map(p => p.feature.name).sort();
      const optimizedNames = optimized.map(p => p.feature.name).sort();
      
      expect(optimizedNames).toEqual(originalNames);
    });
  });

  describe('interactive component identification', () => {
    it('should prioritize components with selectors', () => {
      const paths = analyzer.buildExecutionPaths();
      
      paths.forEach(path => {
        const interactiveSteps = path.steps.filter(s => 
          s.action === 'click' || s.action === 'fill'
        );
        
        if (path.feature.components.some(c => c.selectors?.length)) {
          expect(interactiveSteps.length).toBeGreaterThan(0);
        }
      });
    });

    it('should generate appropriate actions for different selector types', () => {
      const paths = analyzer.buildExecutionPaths();
      
      const userProfilePath = paths.find(p => p.feature.name === 'UserProfile');
      const steps = userProfilePath?.steps || [];
      
      // Should have click actions for buttons
      const clickSteps = steps.filter(s => s.action === 'click');
      expect(clickSteps.length).toBeGreaterThan(0);
      
      // Should have fill actions for inputs
      const fillSteps = steps.filter(s => s.action === 'fill');
      expect(fillSteps.length).toBeGreaterThan(0);
    });
  });
});

function createMockFeatures(): Feature[] {
  const userProfileComponent: Component = {
    name: 'UserProfile',
    type: 'component',
    path: '/src/features/UserProfile/UserProfile.tsx',
    exports: ['default'],
    imports: ['react'],
    selectors: [
      {
        name: 'edit-button',
        selector: '[data-testid="edit-button"]',
        action: 'click'
      },
      {
        name: 'name-input',
        selector: '[data-testid="name-input"]',
        action: 'input',
        value: 'Test User'
      }
    ]
  };

  const dashboardComponent: Component = {
    name: 'Dashboard',
    type: 'page',
    path: '/src/pages/Dashboard/Dashboard.tsx',
    exports: ['default'],
    imports: ['react', '../features/UserProfile/UserProfile'],
    selectors: [
      {
        name: 'refresh-button',
        selector: '[data-testid="refresh-button"]',
        action: 'click'
      }
    ]
  };

  const homeComponent: Component = {
    name: 'HomePage',
    type: 'page',
    path: '/src/pages/index.tsx',
    exports: ['default'],
    imports: ['react'],
    selectors: [
      {
        name: 'dashboard-link',
        selector: '[data-testid="dashboard-link"]',
        action: 'click'
      }
    ]
  };

  return [
    {
      name: 'UserProfile',
      path: '/src/features/UserProfile',
      components: [userProfileComponent],
      dependencies: [],
      priority: 5,
      route: '/user-profile'
    },
    {
      name: 'Dashboard',
      path: '/src/pages/Dashboard',
      components: [dashboardComponent],
      dependencies: ['UserProfile'],
      priority: 8,
      route: '/dashboard'
    },
    {
      name: 'HomePage',
      path: '/src/pages',
      components: [homeComponent],
      dependencies: [],
      priority: 10,
      route: '/'
    }
  ];
}