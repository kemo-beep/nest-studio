"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class ProjectService {
    async createProject(options) {
        console.log('=== PROJECT SERVICE DEBUG START ===');
        console.log('Creating project with options:', options);
        const { name, directory, nextjsVersion = '15', typescript = true, appRouter = true, tailwind = true, shadcn = true, eslint = true, prettier = true } = options;
        const projectPath = path.join(directory, name);
        console.log('Project path:', projectPath);
        try {
            // Create project directory
            console.log('Creating project directory...');
            await fs.mkdir(projectPath, { recursive: true });
            console.log('Created project directory');
            // Create Next.js project using create-next-app
            console.log('Running create-next-app...');
            await this.runCreateNextApp(projectPath, {
                nextjsVersion,
                typescript,
                appRouter,
                tailwind,
                eslint,
                prettier
            });
            console.log('create-next-app completed');
            // Setup shadcn/ui if requested (skip for now to avoid interactive prompts)
            if (shadcn) {
                console.log('Skipping shadcn/ui setup to avoid interactive prompts');
                console.log('shadcn/ui can be set up manually later if needed');
            }
            // Create additional project structure
            console.log('Creating project structure...');
            await this.createProjectStructure(projectPath, { typescript, appRouter });
            console.log('Project structure created');
            // Generate project info
            console.log('Generating project info...');
            const projectInfo = await this.generateProjectInfo(projectPath);
            console.log('Project created successfully:', projectInfo);
            console.log('=== PROJECT SERVICE DEBUG END ===');
            return projectInfo;
        }
        catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    }
    async importProject(projectPath) {
        // Validate project path
        if (!await this.isValidNextJSProject(projectPath)) {
            throw new Error('Invalid Next.js project directory');
        }
        // Detect project configuration
        const projectInfo = await this.detectProject(projectPath);
        return projectInfo;
    }
    async detectProject(projectPath) {
        const packageJsonPath = path.join(projectPath, 'package.json');
        if (!await this.fileExists(packageJsonPath)) {
            throw new Error('package.json not found');
        }
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        // Detect Next.js version
        const nextVersion = this.extractNextJSVersion(packageJson.dependencies);
        // Detect TypeScript
        const typescript = this.hasTypeScript(packageJson);
        // Detect App Router vs Pages Router
        const appRouter = await this.hasAppRouter(projectPath);
        // Detect Tailwind CSS
        const tailwind = this.hasTailwindCSS(packageJson);
        // Detect shadcn/ui
        const shadcn = await this.hasShadcnUI(projectPath);
        // Detect ESLint
        const eslint = this.hasESLint(packageJson);
        // Detect Prettier
        const prettier = this.hasPrettier(packageJson);
        return {
            name: packageJson.name || path.basename(projectPath),
            path: projectPath,
            nextjsVersion: nextVersion,
            typescript,
            appRouter,
            tailwind,
            shadcn,
            eslint,
            prettier,
            dependencies: packageJson.dependencies || {},
            devDependencies: packageJson.devDependencies || {},
            scripts: packageJson.scripts || {}
        };
    }
    async runCreateNextApp(projectPath, options) {
        return new Promise((resolve, reject) => {
            console.log('=== RUN CREATE NEXT APP DEBUG START ===');
            console.log('Project path:', projectPath);
            console.log('Options:', options);
            // Use the project name as the directory name for create-next-app
            const projectName = path.basename(projectPath);
            const parentDir = path.dirname(projectPath);
            const args = [
                'create-next-app@latest',
                projectName, // Use just the project name, not full path
                '--typescript',
                '--tailwind',
                '--eslint',
                '--app',
                '--src-dir',
                '--import-alias', '@/*',
                '--yes' // Skip all prompts
            ];
            if (!options.typescript) {
                args.splice(args.indexOf('--typescript'), 1);
            }
            if (!options.tailwind) {
                args.splice(args.indexOf('--tailwind'), 1);
            }
            if (!options.eslint) {
                args.splice(args.indexOf('--eslint'), 1);
            }
            if (!options.appRouter) {
                args.splice(args.indexOf('--app'), 1);
            }
            console.log('Final args:', args);
            console.log('Working directory:', parentDir);
            console.log('Project name:', projectName);
            const process = (0, child_process_1.spawn)('npx', args, {
                stdio: 'pipe',
                cwd: parentDir // Run in the parent directory
            });
            let output = '';
            let errorOutput = '';
            process.stdout?.on('data', (data) => {
                const text = data.toString();
                output += text;
                console.log('create-next-app stdout:', text);
            });
            process.stderr?.on('data', (data) => {
                const text = data.toString();
                errorOutput += text;
                console.log('create-next-app stderr:', text);
            });
            process.on('close', (code) => {
                console.log('create-next-app process closed with code:', code);
                console.log('Full output:', output);
                if (errorOutput) {
                    console.log('Error output:', errorOutput);
                }
                if (code === 0) {
                    console.log('create-next-app completed successfully');
                    resolve();
                }
                else {
                    console.error('create-next-app failed with code:', code);
                    reject(new Error(`create-next-app failed with code ${code}. Output: ${output}. Error: ${errorOutput}`));
                }
            });
            process.on('error', (error) => {
                console.error('create-next-app process error:', error);
                reject(error);
            });
            console.log('=== RUN CREATE NEXT APP DEBUG END ===');
        });
    }
    async setupShadcnUI(projectPath) {
        return new Promise((resolve, reject) => {
            console.log('Setting up shadcn/ui...');
            // Use non-interactive mode with default answers
            const process = (0, child_process_1.spawn)('npx', ['shadcn@latest', 'init', '-y', '--defaults'], {
                stdio: 'pipe',
                cwd: projectPath
            });
            let output = '';
            let errorOutput = '';
            process.stdout?.on('data', (data) => {
                const text = data.toString();
                output += text;
                console.log('shadcn stdout:', text);
            });
            process.stderr?.on('data', (data) => {
                const text = data.toString();
                errorOutput += text;
                console.log('shadcn stderr:', text);
            });
            process.on('close', (code) => {
                console.log('shadcn process closed with code:', code);
                console.log('shadcn output:', output);
                if (errorOutput) {
                    console.log('shadcn error:', errorOutput);
                }
                if (code === 0) {
                    console.log('shadcn setup completed successfully');
                    resolve();
                }
                else {
                    console.error('shadcn init failed with code:', code);
                    reject(new Error(`shadcn init failed with code ${code}. Output: ${output}. Error: ${errorOutput}`));
                }
            });
            process.on('error', (error) => {
                console.error('shadcn process error:', error);
                reject(error);
            });
        });
    }
    async createProjectStructure(projectPath, options) {
        const { typescript } = options;
        // Create additional directories
        const dirs = [
            'src/components/ui',
            'src/components/custom',
            'src/lib',
            'src/types',
            'src/hooks',
            'src/utils'
        ];
        for (const dir of dirs) {
            await fs.mkdir(path.join(projectPath, dir), { recursive: true });
        }
        // Create utility files
        if (typescript) {
            await this.createUtilityFiles(projectPath);
        }
    }
    async createUtilityFiles(projectPath) {
        // Create lib/utils.ts
        const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;
        await fs.writeFile(path.join(projectPath, 'src/lib/utils.ts'), utilsContent);
        // Create types/index.ts
        const typesContent = `// Global type definitions
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ProjectConfig {
  name: string
  path: string
  nextjsVersion: string
  typescript: boolean
  appRouter: boolean
  tailwind: boolean
  shadcn: boolean
}
`;
        await fs.writeFile(path.join(projectPath, 'src/types/index.ts'), typesContent);
    }
    async generateProjectInfo(projectPath) {
        return this.detectProject(projectPath);
    }
    async isValidNextJSProject(projectPath) {
        const packageJsonPath = path.join(projectPath, 'package.json');
        if (!await this.fileExists(packageJsonPath)) {
            return false;
        }
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        return !!(packageJson.dependencies?.next || packageJson.devDependencies?.next);
    }
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    extractNextJSVersion(dependencies) {
        const nextVersion = dependencies?.next || dependencies?.['next.js'];
        if (!nextVersion)
            return 'unknown';
        // Extract version number from version string
        const match = nextVersion.match(/(\d+\.\d+\.\d+)/);
        return match ? match[1] : nextVersion;
    }
    hasTypeScript(packageJson) {
        return !!(packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript);
    }
    async hasAppRouter(projectPath) {
        const appDir = path.join(projectPath, 'src/app');
        const pagesDir = path.join(projectPath, 'src/pages');
        const appExists = await this.fileExists(appDir);
        const pagesExists = await this.fileExists(pagesDir);
        return appExists && !pagesExists;
    }
    hasTailwindCSS(packageJson) {
        return !!(packageJson.dependencies?.tailwindcss || packageJson.devDependencies?.tailwindcss);
    }
    async hasShadcnUI(projectPath) {
        const componentsJsonPath = path.join(projectPath, 'components.json');
        const uiDir = path.join(projectPath, 'src/components/ui');
        const hasConfig = await this.fileExists(componentsJsonPath);
        const hasUIDir = await this.fileExists(uiDir);
        return hasConfig && hasUIDir;
    }
    hasESLint(packageJson) {
        return !!(packageJson.dependencies?.eslint || packageJson.devDependencies?.eslint);
    }
    hasPrettier(packageJson) {
        return !!(packageJson.dependencies?.prettier || packageJson.devDependencies?.prettier);
    }
}
exports.ProjectService = ProjectService;
