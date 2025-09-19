import { spawn } from 'child_process'
import * as fs from 'fs/promises'
import * as path from 'path'
import { ProjectInfo, ProjectOptions } from '@/shared/types'

export class ProjectService {
  async createProject(options: ProjectOptions): Promise<ProjectInfo> {
    console.log('=== PROJECT SERVICE DEBUG START ===')
    console.log('Creating project with options:', options)

    const {
      name,
      directory,
      nextjsVersion = '15',
      typescript = true,
      appRouter = true,
      tailwind = true,
      shadcn = true,
      eslint = true,
      prettier = true
    } = options

    const projectPath = path.join(directory, name)
    console.log('Project path:', projectPath)

    try {
      // Create project directory
      console.log('Creating project directory...')
      await fs.mkdir(projectPath, { recursive: true })
      console.log('Created project directory')

      // Create Next.js project using create-next-app
      console.log('Running create-next-app...')
      await this.runCreateNextApp(projectPath, {
        nextjsVersion,
        typescript,
        appRouter,
        tailwind,
        eslint,
        prettier
      })
      console.log('create-next-app completed')

      // Setup shadcn/ui if requested (skip for now to avoid interactive prompts)
      if (shadcn) {
        console.log('Skipping shadcn/ui setup to avoid interactive prompts')
        console.log('shadcn/ui can be set up manually later if needed')
      }

      // Create additional project structure
      console.log('Creating project structure...')
      await this.createProjectStructure(projectPath, { typescript, appRouter })
      console.log('Project structure created')

      // Generate project info
      console.log('Generating project info...')
      const projectInfo = await this.generateProjectInfo(projectPath)
      console.log('Project created successfully:', projectInfo)
      console.log('=== PROJECT SERVICE DEBUG END ===')

      return projectInfo
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  }

  async importProject(projectPath: string): Promise<ProjectInfo> {
    // Validate project path
    if (!await this.isValidNextJSProject(projectPath)) {
      throw new Error('Invalid Next.js project directory')
    }

    // Detect project configuration
    const projectInfo = await this.detectProject(projectPath)

    return projectInfo
  }

  async detectProject(projectPath: string): Promise<ProjectInfo> {
    console.log('ProjectService: detectProject called with path:', projectPath)
    const packageJsonPath = path.join(projectPath, 'package.json')
    console.log('ProjectService: checking package.json at:', packageJsonPath)

    if (!await this.fileExists(packageJsonPath)) {
      console.log('ProjectService: package.json not found')
      throw new Error('package.json not found')
    }

    console.log('ProjectService: package.json found, reading...')
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
    console.log('ProjectService: package.json contents:', packageJson)

    // Detect Next.js version
    const nextVersion = this.extractNextJSVersion(packageJson.dependencies)

    // Detect TypeScript
    const typescript = this.hasTypeScript(packageJson)

    // Detect App Router vs Pages Router
    const appRouter = await this.hasAppRouter(projectPath)

    // Detect Tailwind CSS
    const tailwind = this.hasTailwindCSS(packageJson)

    // Detect shadcn/ui
    const shadcn = await this.hasShadcnUI(projectPath)

    // Detect ESLint
    const eslint = this.hasESLint(packageJson)

    // Detect Prettier
    const prettier = this.hasPrettier(packageJson)

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
    }
  }

  private async runCreateNextApp(projectPath: string, options: any): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('=== RUN CREATE NEXT APP DEBUG START ===')
      console.log('Project path:', projectPath)
      console.log('Options:', options)

      // Use the project name as the directory name for create-next-app
      const projectName = path.basename(projectPath)
      const parentDir = path.dirname(projectPath)

      const args = [
        'create-next-app@latest',
        projectName, // Use just the project name, not full path
        '--typescript',
        '--tailwind',
        '--eslint',
        '--app',
        '--import-alias', '@/*',
        '--yes' // Skip all prompts
      ]

      if (!options.typescript) {
        args.splice(args.indexOf('--typescript'), 1)
      }

      if (!options.tailwind) {
        args.splice(args.indexOf('--tailwind'), 1)
      }

      if (!options.eslint) {
        args.splice(args.indexOf('--eslint'), 1)
      }

      if (!options.appRouter) {
        args.splice(args.indexOf('--app'), 1)
      }

      console.log('Final args:', args)
      console.log('Working directory:', parentDir)
      console.log('Project name:', projectName)

      const process = spawn('npx', args, {
        stdio: 'pipe',
        cwd: parentDir // Run in the parent directory
      })

      let output = ''
      let errorOutput = ''

      process.stdout?.on('data', (data) => {
        const text = data.toString()
        output += text
        console.log('create-next-app stdout:', text)
      })

      process.stderr?.on('data', (data) => {
        const text = data.toString()
        errorOutput += text
        console.log('create-next-app stderr:', text)
      })

      process.on('close', (code) => {
        console.log('create-next-app process closed with code:', code)
        console.log('Full output:', output)
        if (errorOutput) {
          console.log('Error output:', errorOutput)
        }

        if (code === 0) {
          console.log('create-next-app completed successfully')
          resolve()
        } else {
          console.error('create-next-app failed with code:', code)
          reject(new Error(`create-next-app failed with code ${code}. Output: ${output}. Error: ${errorOutput}`))
        }
      })

      process.on('error', (error) => {
        console.error('create-next-app process error:', error)
        reject(error)
      })

      console.log('=== RUN CREATE NEXT APP DEBUG END ===')
    })
  }

  private async setupShadcnUI(projectPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Setting up shadcn/ui...')

      // Use non-interactive mode with default answers
      const process = spawn('npx', ['shadcn@latest', 'init', '-y', '--defaults'], {
        stdio: 'pipe',
        cwd: projectPath
      })

      let output = ''
      let errorOutput = ''

      process.stdout?.on('data', (data) => {
        const text = data.toString()
        output += text
        console.log('shadcn stdout:', text)
      })

      process.stderr?.on('data', (data) => {
        const text = data.toString()
        errorOutput += text
        console.log('shadcn stderr:', text)
      })

      process.on('close', (code) => {
        console.log('shadcn process closed with code:', code)
        console.log('shadcn output:', output)
        if (errorOutput) {
          console.log('shadcn error:', errorOutput)
        }

        if (code === 0) {
          console.log('shadcn setup completed successfully')
          resolve()
        } else {
          console.error('shadcn init failed with code:', code)
          reject(new Error(`shadcn init failed with code ${code}. Output: ${output}. Error: ${errorOutput}`))
        }
      })

      process.on('error', (error) => {
        console.error('shadcn process error:', error)
        reject(error)
      })
    })
  }

  private async createProjectStructure(projectPath: string, options: any): Promise<void> {
    const { typescript } = options

    // Create production-ready directory structure
    const dirs = [
      'components/ui',
      'components/custom',
      'components/layout',
      'components/forms',
      'lib',
      'types',
      'hooks',
      'utils',
      'store',
      'services',
      'constants',
      'config',
      'styles',
      'public/icons',
      'public/images',
      'public/assets'
    ]

    for (const dir of dirs) {
      await fs.mkdir(path.join(projectPath, dir), { recursive: true })
    }

    // Create utility files
    if (typescript) {
      await this.createUtilityFiles(projectPath)
    }
  }

  private async createUtilityFiles(projectPath: string): Promise<void> {
    // Create lib/utils.ts
    const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}
`
    await fs.writeFile(path.join(projectPath, 'lib/utils.ts'), utilsContent)

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

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
`
    await fs.writeFile(path.join(projectPath, 'types/index.ts'), typesContent)

    // Create hooks/useLocalStorage.ts
    const useLocalStorageContent = `import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(\`Error reading localStorage key "\${key}":\`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(\`Error setting localStorage key "\${key}":\`, error)
    }
  }

  return [storedValue, setValue] as const
}
`
    await fs.writeFile(path.join(projectPath, 'hooks/useLocalStorage.ts'), useLocalStorageContent)

    // Create hooks/useDebounce.ts
    const useDebounceContent = `import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
`
    await fs.writeFile(path.join(projectPath, 'hooks/useDebounce.ts'), useDebounceContent)

    // Create constants/index.ts
    const constantsContent = `// App constants
export const APP_NAME = 'Nest Studio'
export const APP_VERSION = '1.0.0'

// API endpoints
export const API_ENDPOINTS = {
  USERS: '/api/users',
  PROJECTS: '/api/projects',
  AUTH: '/api/auth',
} as const

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user-preferences',
  RECENT_PROJECTS: 'recent-projects',
  THEME: 'theme',
} as const

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const

// Breakpoints
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const
`
    await fs.writeFile(path.join(projectPath, 'constants/index.ts'), constantsContent)

    // Create config/env.ts
    const envContent = `// Environment configuration
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const

export const isDevelopment = env.IS_DEVELOPMENT
export const isProduction = env.IS_PRODUCTION
export const isTest = env.IS_TEST
`
    await fs.writeFile(path.join(projectPath, 'config/env.ts'), envContent)

    // Create store/index.ts (basic store setup)
    const storeContent = `// Basic store setup - can be extended with Redux, Zustand, etc.
export interface StoreState {
  user: any | null
  theme: 'light' | 'dark' | 'system'
  isLoading: boolean
  error: string | null
}

export const initialState: StoreState = {
  user: null,
  theme: 'system',
  isLoading: false,
  error: null,
}

// Simple store implementation
class Store {
  private state: StoreState = initialState
  private listeners: Array<() => void> = []

  getState(): StoreState {
    return this.state
  }

  setState(newState: Partial<StoreState>): void {
    this.state = { ...this.state, ...newState }
    this.listeners.forEach(listener => listener())
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }
}

export const store = new Store()
`
    await fs.writeFile(path.join(projectPath, 'store/index.ts'), storeContent)

    // Create services/api.ts
    const apiContent = `// API service
import { ApiResponse, PaginatedResponse } from '@/types'

class ApiService {
  private baseURL: string

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'An error occurred',
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiService = new ApiService()
`
    await fs.writeFile(path.join(projectPath, 'services/api.ts'), apiContent)

    // Create components/ui/Button.tsx
    const buttonContent = `import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
            'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
            'text-primary underline-offset-4 hover:underline': variant === 'link',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-md px-3': size === 'sm',
            'h-11 rounded-md px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
`
    await fs.writeFile(path.join(projectPath, 'components/ui/Button.tsx'), buttonContent)

    // Create .gitignore additions
    const gitignoreContent = `
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/
`
    await fs.appendFile(path.join(projectPath, '.gitignore'), gitignoreContent)

    // Create README.md
    const readmeContent = `# ${path.basename(projectPath)}

A modern Next.js application built with TypeScript, Tailwind CSS, and shadcn/ui.

## 🚀 Features

- ⚡ Next.js 15 with App Router
- 🎨 Tailwind CSS for styling
- 🧩 shadcn/ui components
- 📱 Responsive design
- 🔧 TypeScript support
- 🎯 ESLint configuration
- 📦 Production-ready folder structure

## 📁 Project Structure

\`\`\`
├── app/                    # Next.js App Router pages
├── components/             # Reusable components
│   ├── ui/                # shadcn/ui components
│   ├── custom/            # Custom components
│   ├── layout/            # Layout components
│   └── forms/             # Form components
├── lib/                   # Utility functions
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
├── store/                 # State management
├── services/              # API services
├── constants/             # App constants
├── config/                # Configuration files
├── styles/                # Global styles
└── public/                # Static assets
    ├── icons/
    ├── images/
    └── assets/
\`\`\`

## 🛠️ Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint

## 🎨 Styling

This project uses Tailwind CSS for styling. You can customize the design system in the \`tailwind.config.js\` file.

## 🧩 Components

The project includes a comprehensive set of UI components from shadcn/ui, located in the \`components/ui/\` directory.

## 📝 TypeScript

This project is fully typed with TypeScript. Type definitions are organized in the \`types/\` directory.

## 🔧 Development

### Adding New Components

1. Create your component in the appropriate directory under \`components/\`
2. Export it from the main components directory
3. Use TypeScript for type safety

### Adding New Hooks

1. Create your hook in the \`hooks/\` directory
2. Follow the naming convention \`use[Name].ts\`
3. Export the hook function

### Adding New Utilities

1. Add utility functions to \`lib/utils.ts\` or create new files in \`utils/\`
2. Export functions for reuse across the application

## 📄 License

This project is licensed under the MIT License.
`
    await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent)

    // Add additional dependencies to package.json
    const packageJsonPath = path.join(projectPath, 'package.json')
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))

      // Add additional dependencies
      packageJson.dependencies = {
        ...packageJson.dependencies,
        'clsx': '^2.0.0',
        'tailwind-merge': '^2.0.0',
        'class-variance-authority': '^0.7.0',
        'lucide-react': '^0.400.0'
      }

      // Add additional dev dependencies
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        '@types/node': '^20',
        'autoprefixer': '^10.4.16',
        'postcss': '^8.4.32'
      }

      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
    } catch (error) {
      console.error('Failed to update package.json:', error)
    }
  }

  private async generateProjectInfo(projectPath: string): Promise<ProjectInfo> {
    return this.detectProject(projectPath)
  }

  private async isValidNextJSProject(projectPath: string): Promise<boolean> {
    const packageJsonPath = path.join(projectPath, 'package.json')

    if (!await this.fileExists(packageJsonPath)) {
      return false
    }

    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
    return !!(packageJson.dependencies?.next || packageJson.devDependencies?.next)
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  private extractNextJSVersion(dependencies: any): string {
    const nextVersion = dependencies?.next || dependencies?.['next.js']
    if (!nextVersion) return 'unknown'

    // Extract version number from version string
    const match = nextVersion.match(/(\d+\.\d+\.\d+)/)
    return match ? match[1] : nextVersion
  }

  private hasTypeScript(packageJson: any): boolean {
    return !!(packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript)
  }

  private async hasAppRouter(projectPath: string): Promise<boolean> {
    // Check for App Router in both possible locations
    const srcAppDir = path.join(projectPath, 'src/app')
    const appDir = path.join(projectPath, 'app')
    const srcPagesDir = path.join(projectPath, 'src/pages')
    const pagesDir = path.join(projectPath, 'pages')

    const srcAppExists = await this.fileExists(srcAppDir)
    const appExists = await this.fileExists(appDir)
    const srcPagesExists = await this.fileExists(srcPagesDir)
    const pagesExists = await this.fileExists(pagesDir)

    // App Router exists if either app directory exists and no pages directory exists
    return (srcAppExists || appExists) && !srcPagesExists && !pagesExists
  }

  private hasTailwindCSS(packageJson: any): boolean {
    return !!(packageJson.dependencies?.tailwindcss || packageJson.devDependencies?.tailwindcss)
  }

  private async hasShadcnUI(projectPath: string): Promise<boolean> {
    const componentsJsonPath = path.join(projectPath, 'components.json')
    const srcUiDir = path.join(projectPath, 'src/components/ui')
    const uiDir = path.join(projectPath, 'components/ui')

    const hasConfig = await this.fileExists(componentsJsonPath)
    const hasSrcUIDir = await this.fileExists(srcUiDir)
    const hasUIDir = await this.fileExists(uiDir)

    return hasConfig && (hasSrcUIDir || hasUIDir)
  }

  private hasESLint(packageJson: any): boolean {
    return !!(packageJson.dependencies?.eslint || packageJson.devDependencies?.eslint)
  }

  private hasPrettier(packageJson: any): boolean {
    return !!(packageJson.dependencies?.prettier || packageJson.devDependencies?.prettier)
  }
}
