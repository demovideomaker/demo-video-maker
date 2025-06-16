import * as fs from 'fs/promises';
import * as path from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import { Feature, Component } from '../types';
import { SecurityUtils, ResourceMonitor } from '../utils/securityUtils';

export class CodebaseAnalyzer {
  private projectPath: string;
  private features: Map<string, Feature> = new Map();
  private components: Map<string, Component> = new Map();
  private cache = new Map<string, { mtime: Date, result: Component | null }>();
  private readonly MAX_FILE_SIZE = 1024 * 1024; // 1MB
  private readonly BATCH_SIZE = 10;

  constructor(projectPath: string) {
    if (!SecurityUtils.validateProjectPath(projectPath)) {
      throw new Error('Invalid or unsafe project path');
    }
    this.projectPath = projectPath;
  }

  async analyze(): Promise<{ features: Feature[], components: Component[] }> {
    await this.scanDirectory(this.projectPath);
    return {
      features: Array.from(this.features.values()),
      components: Array.from(this.components.values())
    };
  }

  private async scanDirectory(dirPath: string): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (this.shouldScanDirectory(entry.name)) {
          if (this.isFeatureDirectory(fullPath)) {
            await this.analyzeFeature(fullPath);
          }
          await this.scanDirectory(fullPath);
        }
      } else if (entry.isFile() && this.isSourceFile(entry.name)) {
        await this.analyzeFile(fullPath);
      }
    }
  }

  private shouldScanDirectory(name: string): boolean {
    const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next'];
    return !ignoreDirs.includes(name) && !name.startsWith('.');
  }

  private isFeatureDirectory(dirPath: string): boolean {
    const dirName = path.basename(dirPath);
    const parentDir = path.basename(path.dirname(dirPath));
    
    return (
      dirName === 'features' ||
      parentDir === 'features' ||
      parentDir === 'pages' ||
      parentDir === 'views' ||
      dirName.endsWith('Feature') ||
      dirName.endsWith('Page')
    );
  }

  private isSourceFile(fileName: string): boolean {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    return extensions.some(ext => fileName.endsWith(ext));
  }

  private async analyzeFeature(featurePath: string): Promise<void> {
    const featureName = path.basename(featurePath);
    const feature: Feature = {
      name: featureName,
      path: featurePath,
      components: [],
      dependencies: [],
      priority: this.calculatePriority(featurePath)
    };

    const files = await this.getFilesInDirectory(featurePath);
    for (const file of files) {
      const component = await this.analyzeFile(file);
      if (component) {
        feature.components.push(component);
      }
    }

    this.features.set(featureName, feature);
  }

  private async getFilesInDirectory(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        files.push(...await this.getFilesInDirectory(fullPath));
      } else if (entry.isFile() && this.isSourceFile(entry.name)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private async analyzeFile(filePath: string): Promise<Component | null> {
    try {
      // Check cache first
      const stats = await fs.stat(filePath);
      const cached = this.cache.get(filePath);
      
      if (cached && cached.mtime >= stats.mtime) {
        return cached.result;
      }

      // Check file size
      if (!SecurityUtils.isFileSizeAcceptable(stats.size, this.MAX_FILE_SIZE)) {
        console.warn(`Skipping large file: ${filePath} (${Math.round(stats.size / 1024)}KB)`);
        return null;
      }

      // Monitor memory usage
      ResourceMonitor.checkMemoryUsage();

      const content = await fs.readFile(filePath, 'utf-8');
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });

      const component: Component = {
        name: path.basename(filePath, path.extname(filePath)),
        type: this.determineComponentType(filePath, ast),
        path: filePath,
        exports: [],
        imports: [],
        selectors: []
      };

      traverse(ast, {
        ImportDeclaration(nodePath) {
          component.imports.push(nodePath.node.source.value);
        },
        ExportNamedDeclaration(nodePath) {
          if (nodePath.node.declaration) {
            const decl = nodePath.node.declaration;
            if (decl.type === 'VariableDeclaration' && decl.declarations[0].id.type === 'Identifier') {
              component.exports.push(decl.declarations[0].id.name);
            } else if (decl.type === 'FunctionDeclaration' && decl.id) {
              component.exports.push(decl.id.name);
            }
          }
        },
        ExportDefaultDeclaration() {
          component.exports.push('default');
        },
        JSXElement(nodePath) {
          const opening = nodePath.node.openingElement;
          if (opening.name.type === 'JSXIdentifier') {
            const attrs = opening.attributes
              .filter(attr => attr.type === 'JSXAttribute')
              .map(attr => {
                if (attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier') {
                  return { name: attr.name.name, value: attr.value };
                }
                return null;
              })
              .filter(Boolean);

            if (attrs.some(attr => attr?.name === 'onClick' || attr?.name === 'data-testid')) {
              const selector = this.extractSelector(opening, attrs);
              if (selector) {
                component.selectors?.push(selector);
              }
            }
          }
        }
      });

      this.components.set(component.name, component);
      
      // Cache the result
      this.cache.set(filePath, { mtime: stats.mtime, result: component });
      
      return component;
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error);
      
      // Cache null result to avoid re-processing broken files
      const stats = await fs.stat(filePath).catch(() => null);
      if (stats) {
        this.cache.set(filePath, { mtime: stats.mtime, result: null });
      }
      
      return null;
    }
  }

  private determineComponentType(filePath: string, ast: any): Component['type'] {
    const dir = path.dirname(filePath);
    if (dir.includes('pages') || dir.includes('views')) return 'page';
    if (dir.includes('hooks')) return 'hook';
    if (dir.includes('services')) return 'service';
    if (dir.includes('utils') || dir.includes('helpers')) return 'util';
    return 'component';
  }

  private calculatePriority(featurePath: string): number {
    const depth = featurePath.split(path.sep).length;
    const isMainFeature = featurePath.includes('pages') || featurePath.includes('views');
    return isMainFeature ? 10 - depth : 5 - depth;
  }

  private extractSelector(element: any, attrs: any[]): any {
    const testId = attrs.find(attr => attr?.name === 'data-testid');
    if (testId && testId.value?.type === 'StringLiteral') {
      return {
        name: element.name.name,
        selector: `[data-testid="${testId.value.value}"]`,
        action: attrs.some(attr => attr?.name === 'onClick') ? 'click' : 'wait'
      };
    }

    const id = attrs.find(attr => attr?.name === 'id');
    if (id && id.value?.type === 'StringLiteral') {
      return {
        name: element.name.name,
        selector: `#${id.value.value}`,
        action: attrs.some(attr => attr?.name === 'onClick') ? 'click' : 'wait'
      };
    }

    const className = attrs.find(attr => attr?.name === 'className');
    if (className && className.value?.type === 'StringLiteral') {
      return {
        name: element.name.name,
        selector: `.${className.value.value.split(' ')[0]}`,
        action: attrs.some(attr => attr?.name === 'onClick') ? 'click' : 'wait'
      };
    }

    return null;
  }
}