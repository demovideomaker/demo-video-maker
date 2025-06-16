import * as fs from 'fs/promises';
import * as path from 'path';
import { CodebaseAnalyzer } from './analyzers/codebaseAnalyzer';
import { HierarchyAnalyzer } from './analyzers/hierarchyAnalyzer';
import { DocumentationGenerator } from './generators/documentationGenerator';
import { PlaywrightExecutor } from './executors/playwrightExecutor';
import { PlaywrightInstaller } from './utils/playwrightInstaller';
import { DemoConfig } from './types';

export class DemoVideoAutomation {
  private config: DemoConfig;

  constructor(config: DemoConfig) {
    this.config = config;
  }

  async run(): Promise<void> {
    console.log('Demo Video Automation Tool Starting...\n');

    try {
      // Ensure Playwright is installed before proceeding
      console.log('Checking Playwright installation...');
      await PlaywrightInstaller.ensureInstalled();
      console.log('');
      
      await this.ensureOutputDirectories();

      console.log('Step 1: Analyzing codebase...');
      const analyzer = new CodebaseAnalyzer(this.config.projectPath);
      const { features, components } = await analyzer.analyze();
      console.log(`   Found ${features.length} features and ${components.length} components\n`);

      console.log('Step 2: Generating feature documentation...');
      const docGenerator = new DocumentationGenerator();
      
      for (const feature of features) {
        await docGenerator.generateFeatureDocumentation(feature);
        console.log(`   Generated documentation for ${feature.name}`);
      }
      
      await docGenerator.generateProjectOverview(features, this.config.outputPath);
      console.log(`   Generated project overview\n`);

      console.log('Step 3: Analyzing feature hierarchy...');
      const hierarchyAnalyzer = new HierarchyAnalyzer(features);
      const executionPaths = hierarchyAnalyzer.buildExecutionPaths();
      const optimizedPaths = hierarchyAnalyzer.optimizeExecutionOrder(executionPaths);
      console.log(`   Created ${optimizedPaths.length} execution paths\n`);

      console.log('Step 4: Recording demo videos...');
      const executor = new PlaywrightExecutor(this.config);
      
      const filteredPaths = this.config.features 
        ? optimizedPaths.filter(p => this.config.features?.includes(p.feature.name))
        : optimizedPaths;

      const results = await executor.executeAllDemos(filteredPaths);
      
      console.log('\nDemo Video Generation Complete!\n');
      console.log('Results:');
      for (const [featureName, videoPath] of results) {
        if (videoPath !== 'FAILED') {
          console.log(`   - ${featureName}: ${videoPath}`);
        } else {
          console.log(`   - ${featureName}: Failed to generate video`);
        }
      }

      await this.generateSummaryReport(results);
      
    } catch (error) {
      console.error('\nError during demo generation:', error);
      throw error;
    }
  }

  private async ensureOutputDirectories(): Promise<void> {
    const dirs = [
      this.config.outputPath,
      path.join(this.config.outputPath, 'videos'),
      path.join(this.config.outputPath, 'screenshots')
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  private async generateSummaryReport(results: Map<string, string>): Promise<void> {
    const report = [];
    report.push('# Demo Video Generation Report');
    report.push('');
    report.push(`Generated at: ${new Date().toISOString()}`);
    report.push(`Project: ${this.config.projectPath}`);
    report.push(`Base URL: ${this.config.baseUrl}`);
    report.push('');
    report.push('## Results');
    report.push('');

    const successful = Array.from(results.entries()).filter(([_, path]) => path !== 'FAILED');
    const failed = Array.from(results.entries()).filter(([_, path]) => path === 'FAILED');

    report.push(`### Successful (${successful.length})`);
    for (const [feature, videoPath] of successful) {
      report.push(`- **${feature}**: \`${videoPath}\``);
    }

    if (failed.length > 0) {
      report.push('');
      report.push(`### Failed (${failed.length})`);
      for (const [feature] of failed) {
        report.push(`- ${feature}`);
      }
    }

    const reportPath = path.join(this.config.outputPath, 'DEMO_REPORT.md');
    await fs.writeFile(reportPath, report.join('\n'));
  }
}

export async function createDemoVideos(config: DemoConfig): Promise<void> {
  const automation = new DemoVideoAutomation(config);
  await automation.run();
}

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: demo-video-automation <project-path> <base-url> [output-path]');
    process.exit(1);
  }

  const config: DemoConfig = {
    projectPath: path.resolve(args[0]),
    baseUrl: args[1],
    outputPath: args[2] ? path.resolve(args[2]) : path.join(process.cwd(), 'demo-output'),
    viewport: { width: 1280, height: 720 }
  };

  createDemoVideos(config).catch(error => {
    console.error(error);
    process.exit(1);
  });
}