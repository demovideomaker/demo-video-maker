import { CodebaseAnalyzer } from '../../src/analyzers/codebaseAnalyzer';
import * as fs from 'fs/promises';
import * as path from 'path';
import { sampleProjectStructure } from '../fixtures/sample-components';

describe('CodebaseAnalyzer', () => {
  let testProjectPath: string;
  let analyzer: CodebaseAnalyzer;

  beforeAll(async () => {
    // Create temporary test project
    testProjectPath = path.join(__dirname, '../output/test-project');
    await createTestProject(testProjectPath, sampleProjectStructure);
    analyzer = new CodebaseAnalyzer(testProjectPath);
  });

  afterAll(async () => {
    // Cleanup test project
    try {
      await fs.rmdir(testProjectPath, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('analyze', () => {
    it('should discover features in the project', async () => {
      const { features, components } = await analyzer.analyze();

      expect(features).toBeDefined();
      expect(components).toBeDefined();
      expect(features.length).toBeGreaterThan(0);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should identify UserProfile feature', async () => {
      const { features } = await analyzer.analyze();
      
      const userProfileFeature = features.find(f => f.name === 'UserProfile');
      expect(userProfileFeature).toBeDefined();
      expect(userProfileFeature?.components.length).toBeGreaterThan(0);
    });

    it('should identify Dashboard feature', async () => {
      const { features } = await analyzer.analyze();
      
      const dashboardFeature = features.find(f => f.name === 'Dashboard');
      expect(dashboardFeature).toBeDefined();
      expect(dashboardFeature?.components.length).toBeGreaterThan(0);
    });
  });

  describe('component analysis', () => {
    it('should extract interactive elements from components', async () => {
      const { components } = await analyzer.analyze();
      
      const userProfileComponent = components.find(c => c.name === 'UserProfile');
      expect(userProfileComponent).toBeDefined();
      expect(userProfileComponent?.selectors).toBeDefined();
      expect(userProfileComponent?.selectors?.length).toBeGreaterThan(0);
    });

    it('should identify data-testid selectors', async () => {
      const { components } = await analyzer.analyze();
      
      const userProfileComponent = components.find(c => c.name === 'UserProfile');
      const testIdSelectors = userProfileComponent?.selectors?.filter(
        s => s.selector.includes('data-testid')
      );
      
      expect(testIdSelectors?.length).toBeGreaterThan(0);
    });

    it('should classify component types correctly', async () => {
      const { components } = await analyzer.analyze();
      
      const pageComponent = components.find(c => c.path.includes('pages'));
      const featureComponent = components.find(c => c.path.includes('features'));
      
      if (pageComponent) {
        expect(pageComponent.type).toBe('page');
      }
      if (featureComponent) {
        expect(featureComponent.type).toBe('component');
      }
    });

    it('should extract imports and exports', async () => {
      const { components } = await analyzer.analyze();
      
      const userProfileComponent = components.find(c => c.name === 'UserProfile');
      expect(userProfileComponent?.exports).toContain('default');
      expect(userProfileComponent?.imports.length).toBeGreaterThan(0);
    });
  });

  describe('feature priority calculation', () => {
    it('should assign higher priority to page components', async () => {
      const { features } = await analyzer.analyze();
      
      const pageFeature = features.find(f => 
        f.components.some(c => c.type === 'page')
      );
      const componentFeature = features.find(f => 
        f.components.every(c => c.type === 'component')
      );
      
      if (pageFeature && componentFeature) {
        expect(pageFeature.priority).toBeGreaterThan(componentFeature.priority);
      }
    });
  });

  describe('error handling', () => {
    it('should handle malformed files gracefully', async () => {
      const malformedProjectPath = path.join(__dirname, '../output/malformed-project');
      await fs.mkdir(malformedProjectPath, { recursive: true });
      await fs.writeFile(
        path.join(malformedProjectPath, 'broken.tsx'),
        'import React from incomplete syntax {'
      );

      const malformedAnalyzer = new CodebaseAnalyzer(malformedProjectPath);
      const { features, components } = await malformedAnalyzer.analyze();

      // Should not crash and return empty results
      expect(features).toBeDefined();
      expect(components).toBeDefined();
    });

    it('should handle non-existent directories', async () => {
      const nonExistentAnalyzer = new CodebaseAnalyzer('/non/existent/path');
      
      await expect(nonExistentAnalyzer.analyze()).rejects.toThrow();
    });
  });

  describe('file filtering', () => {
    it('should only analyze supported file types', async () => {
      const { components } = await analyzer.analyze();
      
      // Should only find .tsx and .ts files from our test project
      components.forEach(component => {
        expect(['.ts', '.tsx', '.js', '.jsx']).toContain(
          path.extname(component.path)
        );
      });
    });

    it('should ignore node_modules and other excluded directories', async () => {
      // Create a node_modules directory with a component
      const nodeModulesPath = path.join(testProjectPath, 'node_modules/test');
      await fs.mkdir(nodeModulesPath, { recursive: true });
      await fs.writeFile(
        path.join(nodeModulesPath, 'Component.tsx'),
        'export default function Component() { return <div />; }'
      );

      const { components } = await analyzer.analyze();
      
      // Should not include components from node_modules
      const nodeModulesComponent = components.find(c => 
        c.path.includes('node_modules')
      );
      expect(nodeModulesComponent).toBeUndefined();
    });
  });
});

// Helper function to create test project structure
async function createTestProject(
  basePath: string, 
  structure: Record<string, string>
): Promise<void> {
  await fs.mkdir(basePath, { recursive: true });

  for (const [filePath, content] of Object.entries(structure)) {
    const fullPath = path.join(basePath, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
  }
}