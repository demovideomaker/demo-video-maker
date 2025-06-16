import * as fs from 'fs/promises';
import * as path from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import { Feature, InteractionPlan, InteractionStep } from '../types';

export class InteractionAnalyzer {
  async analyzeFeatureInteractions(feature: Feature): Promise<InteractionPlan> {
    const interactions: InteractionStep[] = [];
    const files = await this.getFeatureFiles(feature.path);
    
    for (const file of files) {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const fileInteractions = await this.analyzeFile(file);
        interactions.push(...fileInteractions);
      }
    }
    
    // Sort interactions by priority and create a logical flow
    const plan = this.createInteractionPlan(feature.name, interactions);
    
    return plan;
  }
  
  private async getFeatureFiles(featurePath: string): Promise<string[]> {
    const files: string[] = [];
    
    async function scanDir(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.includes('node_modules')) {
          await scanDir(fullPath);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    }
    
    await scanDir(featurePath);
    return files;
  }
  
  private async analyzeFile(filePath: string): Promise<InteractionStep[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    const interactions: InteractionStep[] = [];
    
    try {
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });
      
      traverse(ast, {
        JSXElement(path: any) {
          const element = path.node.openingElement;
          
          // Look for interactive elements
          const testId = this.getAttributeValue(element, 'data-testid');
          const onClick = this.hasAttribute(element, 'onClick');
          const onChange = this.hasAttribute(element, 'onChange');
          const href = this.getAttributeValue(element, 'href');
          
          if (testId || onClick || onChange) {
            const elementType = element.name?.name || 'unknown';
            
            // Determine interaction type
            let actionType: 'click' | 'type' | 'hover' | 'scroll' = 'click';
            let inputType = '';
            
            if (elementType === 'input' || elementType === 'textarea') {
              actionType = 'type';
              inputType = this.getAttributeValue(element, 'type') || 'text';
            } else if (elementType === 'select') {
              actionType = 'click';
            }
            
            // Extract meaningful label or placeholder
            const label = this.getAttributeValue(element, 'placeholder') || 
                         this.getAttributeValue(element, 'aria-label') ||
                         this.extractButtonText(path) ||
                         testId;
            
            interactions.push({
              selector: testId ? `[data-testid="${testId}"]` : '',
              action: actionType,
              label: label || 'Unknown',
              element: elementType,
              value: this.generateSampleValue(inputType, label),
              priority: this.calculatePriority(elementType, actionType),
              description: this.generateDescription(elementType, actionType, label)
            });
          }
        }
      });
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error);
    }
    
    return interactions;
  }
  
  private getAttributeValue(element: any, attrName: string): string | null {
    const attr = element.attributes?.find((a: any) => 
      a.name?.name === attrName
    );
    
    if (attr?.value?.value) {
      return attr.value.value;
    } else if (attr?.value?.expression?.value) {
      return attr.value.expression.value;
    }
    
    return null;
  }
  
  private hasAttribute(element: any, attrName: string): boolean {
    return element.attributes?.some((a: any) => a.name?.name === attrName) || false;
  }
  
  private extractButtonText(path: any): string {
    try {
      const children = path.node.children || [];
      for (const child of children) {
        if (child.type === 'JSXText') {
          return child.value.trim();
        }
      }
    } catch {}
    return '';
  }
  
  private generateSampleValue(inputType: string, label: string): string {
    const labelLower = label?.toLowerCase() || '';
    
    if (labelLower.includes('email')) return 'demo@example.com';
    if (labelLower.includes('name')) return 'John Smith';
    if (labelLower.includes('search')) return 'test search';
    if (labelLower.includes('password')) return 'SecurePass123!';
    if (labelLower.includes('phone')) return '(555) 123-4567';
    if (labelLower.includes('date')) return '2024-01-15';
    if (inputType === 'number') return '42';
    
    return 'Sample text';
  }
  
  private calculatePriority(element: string, action: string): number {
    // Higher priority for main navigation and primary actions
    const priorities: Record<string, number> = {
      'nav': 100,
      'button': 80,
      'a': 70,
      'input': 60,
      'select': 50,
      'checkbox': 40,
      'radio': 40,
      'div': 20
    };
    
    return priorities[element] || 10;
  }
  
  private generateDescription(element: string, action: string, label: string): string {
    const actionVerb = action === 'type' ? 'Fill in' : 'Click';
    return `${actionVerb} ${label || element}`;
  }
  
  private createInteractionPlan(featureName: string, interactions: InteractionStep[]): InteractionPlan {
    // Remove duplicates and sort by priority
    const uniqueInteractions = this.deduplicateInteractions(interactions);
    const sortedInteractions = uniqueInteractions.sort((a, b) => b.priority - a.priority);
    
    // Create a logical flow
    const flow: InteractionStep[] = [];
    
    // 1. Navigation first
    const navItems = sortedInteractions.filter(i => i.selector.includes('nav'));
    flow.push(...navItems.slice(0, 1));
    
    // 2. Main actions
    const buttons = sortedInteractions.filter(i => i.element === 'button');
    flow.push(...buttons.slice(0, 3));
    
    // 3. Form inputs
    const inputs = sortedInteractions.filter(i => i.action === 'type');
    flow.push(...inputs.slice(0, 3));
    
    // 4. Secondary actions
    const others = sortedInteractions.filter(i => 
      !navItems.includes(i) && !buttons.includes(i) && !inputs.includes(i)
    );
    flow.push(...others.slice(0, 2));
    
    return {
      featureName,
      steps: flow,
      duration: flow.length * 2000, // 2 seconds per interaction
      description: `Interactive demo of ${featureName} feature`
    };
  }
  
  private deduplicateInteractions(interactions: InteractionStep[]): InteractionStep[] {
    const seen = new Set<string>();
    return interactions.filter(interaction => {
      const key = `${interaction.selector}-${interaction.action}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}