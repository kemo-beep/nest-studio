import * as fs from 'fs/promises'
import * as path from 'path'
import { spawn } from 'child_process'

export interface RenderedComponent {
    id: string
    type: string
    props: Record<string, any>
    className?: string
    children?: string
    position: {
        x: number
        y: number
        width: number
        height: number
    }
    html: string
    css?: string
}

export class ComponentRendererService {
    private projectPath: string
    private tempDir: string

    constructor(projectPath: string) {
        this.projectPath = projectPath
        this.tempDir = path.join(projectPath, '.nest-studio', 'temp-render')
    }

    /**
     * Initialize the renderer service
     */
    async initialize(): Promise<void> {
        // Create temp directory for rendering
        await fs.mkdir(this.tempDir, { recursive: true })

        // Create a temporary React app for rendering components
        await this.createTempReactApp()
    }

    /**
     * Render a component to HTML
     */
    async renderComponent(component: RenderedComponent): Promise<{ success: boolean; html?: string; error?: string }> {
        try {
            // Create a temporary component file
            const componentFile = await this.createTempComponent(component)

            // Generate HTML using React Server Components or similar
            const html = await this.generateHTML(componentFile, component)

            return { success: true, html }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    /**
     * Render multiple components to HTML
     */
    async renderComponents(components: RenderedComponent[]): Promise<{ success: boolean; html?: string; error?: string }> {
        try {
            // Create a temporary page with all components
            const pageFile = await this.createTempPage(components)

            // Generate HTML
            const html = await this.generateHTML(pageFile, components[0])

            return { success: true, html }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    /**
     * Create a temporary React app for rendering
     */
    private async createTempReactApp(): Promise<void> {
        const packageJson = {
            name: "nest-studio-renderer",
            version: "1.0.0",
            private: true,
            dependencies: {
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
                "next": "^15.0.0",
                "@types/react": "^18.2.0",
                "@types/react-dom": "^18.2.0",
                "typescript": "^5.0.0"
            }
        }

        await fs.writeFile(
            path.join(this.tempDir, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        )

        // Create a simple Next.js app structure
        const appDir = path.join(this.tempDir, 'app')
        await fs.mkdir(appDir, { recursive: true })

        // Create layout.tsx
        const layoutContent = `import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`
        await fs.writeFile(path.join(appDir, 'layout.tsx'), layoutContent)

        // Create globals.css with Tailwind
        const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;`
        await fs.writeFile(path.join(appDir, 'globals.css'), globalsCss)

        // Create tailwind.config.js
        const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
        await fs.writeFile(path.join(this.tempDir, 'tailwind.config.js'), tailwindConfig)

        // Create next.config.js
        const nextConfig = `/** @type {import('next').Config} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig`
        await fs.writeFile(path.join(this.tempDir, 'next.config.js'), nextConfig)
    }

    /**
     * Create a temporary component file
     */
    private async createTempComponent(component: RenderedComponent): Promise<string> {
        const componentName = this.getComponentName(component.type)
        const componentContent = this.generateComponentCode(component)

        const componentFile = path.join(this.tempDir, 'app', `${componentName}.tsx`)
        await fs.writeFile(componentFile, componentContent)

        return componentFile
    }

    /**
     * Create a temporary page with all components
     */
    private async createTempPage(components: RenderedComponent[]): Promise<string> {
        const pageContent = this.generatePageCode(components)

        const pageFile = path.join(this.tempDir, 'app', 'page.tsx')
        await fs.writeFile(pageFile, pageContent)

        return pageFile
    }

    /**
     * Generate component code
     */
    private generateComponentCode(component: RenderedComponent): string {
        const { type, props, className, children } = component

        // Map component types to actual implementations
        const componentImplementations: Record<string, string> = {
            'Button': this.generateButtonCode(props, className, children),
            'Input': this.generateInputCode(props, className),
            'Card': this.generateCardCode(props, className, children),
            'Badge': this.generateBadgeCode(props, className, children),
            'Avatar': this.generateAvatarCode(props, className)
        }

        return componentImplementations[type] || this.generateGenericCode(type, props, className, children)
    }

    /**
     * Generate Button component code
     */
    private generateButtonCode(props: Record<string, any>, className?: string, children?: string): string {
        const { variant = 'default', size = 'default', disabled = false, ...otherProps } = props

        const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

        const variantClasses = {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground',
            link: 'underline-offset-4 hover:underline text-primary'
        }

        const sizeClasses = {
            default: 'h-10 py-2 px-4',
            sm: 'h-9 px-3 rounded-md',
            lg: 'h-11 px-8 rounded-md',
            icon: 'h-10 w-10'
        }

        const classes = [
            baseClasses,
            variantClasses[variant as keyof typeof variantClasses] || variantClasses.default,
            sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default,
            className
        ].filter(Boolean).join(' ')

        return `export default function Button() {
  return (
    <button 
      className="${classes}"
      ${disabled ? 'disabled' : ''}
      ${Object.entries(otherProps).map(([key, value]) => `${key}="${value}"`).join(' ')}
    >
      ${children || 'Button'}
    </button>
  )
}`
    }

    /**
     * Generate Input component code
     */
    private generateInputCode(props: Record<string, any>, className?: string): string {
        const { type = 'text', placeholder, disabled = false, required = false, ...otherProps } = props

        const baseClasses = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

        const classes = [baseClasses, className].filter(Boolean).join(' ')

        return `export default function Input() {
  return (
    <input 
      type="${type}"
      className="${classes}"
      placeholder="${placeholder || ''}"
      ${disabled ? 'disabled' : ''}
      ${required ? 'required' : ''}
      ${Object.entries(otherProps).map(([key, value]) => `${key}="${value}"`).join(' ')}
    />
  )
}`
    }

    /**
     * Generate Card component code
     */
    private generateCardCode(props: Record<string, any>, className?: string, children?: string): string {
        const { title, description } = props

        const baseClasses = 'rounded-lg border bg-card text-card-foreground shadow-sm'
        const classes = [baseClasses, className].filter(Boolean).join(' ')

        return `export default function Card() {
  return (
    <div className="${classes}">
      <div className="p-6">
        ${title ? `<h3 className="text-2xl font-semibold leading-none tracking-tight">${title}</h3>` : ''}
        ${description ? `<p className="text-sm text-muted-foreground mt-2">${description}</p>` : ''}
        ${children ? `<div className="mt-4">${children}</div>` : ''}
      </div>
    </div>
  )
}`
    }

    /**
     * Generate Badge component code
     */
    private generateBadgeCode(props: Record<string, any>, className?: string, children?: string): string {
        const { variant = 'default' } = props

        const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'

        const variantClasses = {
            default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
            secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
            destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
            outline: 'text-foreground'
        }

        const classes = [
            baseClasses,
            variantClasses[variant as keyof typeof variantClasses] || variantClasses.default,
            className
        ].filter(Boolean).join(' ')

        return `export default function Badge() {
  return (
    <div className="${classes}">
      ${children || 'Badge'}
    </div>
  )
}`
    }

    /**
     * Generate Avatar component code
     */
    private generateAvatarCode(props: Record<string, any>, className?: string): string {
        const { src, alt, fallback, size = 'default' } = props

        const sizeClasses = {
            sm: 'h-8 w-8',
            default: 'h-10 w-10',
            lg: 'h-12 w-12'
        }

        const classes = [
            'relative flex shrink-0 overflow-hidden rounded-full',
            sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default,
            className
        ].filter(Boolean).join(' ')

        return `export default function Avatar() {
  return (
    <div className="${classes}">
      ${src ? `<img src="${src}" alt="${alt || ''}" className="aspect-square h-full w-full" />` : ''}
      ${!src && fallback ? `<div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium">${fallback}</div>` : ''}
    </div>
  )
}`
    }

    /**
     * Generate generic component code
     */
    private generateGenericCode(type: string, props: Record<string, any>, className?: string, children?: string): string {
        const propsString = Object.entries(props)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ')

        return `export default function ${type}() {
  return (
    <div 
      className="${className || ''}"
      ${propsString}
    >
      ${children || ''}
    </div>
  )
}`
    }

    /**
     * Generate page code with all components
     */
    private generatePageCode(components: RenderedComponent[]): string {
        const imports = components.map(comp =>
            `import ${comp.type} from './${this.getComponentName(comp.type)}'`
        ).join('\n')

        const componentElements = components.map(comp => {
            const { position, className } = comp
            const style = `position: absolute; left: ${position.x}px; top: ${position.y}px; width: ${position.width}px; height: ${position.height}px;`

            return `<div style="${style}" className="${className || ''}">
              <${comp.type} />
            </div>`
        }).join('\n')

        return `${imports}

export default function Page() {
  return (
    <div className="relative w-full h-screen bg-white">
      ${componentElements}
    </div>
  )
}`
    }

    /**
     * Generate HTML using Next.js build
     */
    private async generateHTML(pageFile: string, component: RenderedComponent): Promise<string> {
        return new Promise((resolve, reject) => {
            // For now, return a simple HTML representation
            // In a real implementation, this would use Next.js build process
            const html = this.generateSimpleHTML(component)
            resolve(html)
        })
    }

    /**
     * Generate simple HTML representation
     */
    private generateSimpleHTML(component: RenderedComponent): string {
        const { type, props, className, children, position } = component

        const style = `position: absolute; left: ${position.x}px; top: ${position.y}px; width: ${position.width}px; height: ${position.height}px;`

        // Generate HTML based on component type
        switch (type) {
            case 'Button':
                return `<button style="${style}" class="${className || ''}" ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')}>${children || 'Button'}</button>`

            case 'Input':
                return `<input style="${style}" class="${className || ''}" type="${props.type || 'text'}" placeholder="${props.placeholder || ''}" ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')} />`

            case 'Card':
                return `<div style="${style}" class="${className || ''}">
                    <div class="p-6">
                        ${props.title ? `<h3 class="text-2xl font-semibold">${props.title}</h3>` : ''}
                        ${props.description ? `<p class="text-sm text-gray-600 mt-2">${props.description}</p>` : ''}
                        ${children ? `<div class="mt-4">${children}</div>` : ''}
                    </div>
                </div>`

            case 'Badge':
                return `<div style="${style}" class="${className || ''} inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">${children || 'Badge'}</div>`

            case 'Avatar':
                return `<div style="${style}" class="${className || ''} relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    ${props.src ? `<img src="${props.src}" alt="${props.alt || ''}" class="aspect-square h-full w-full" />` : ''}
                    ${!props.src && props.fallback ? `<div class="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-sm font-medium">${props.fallback}</div>` : ''}
                </div>`

            default:
                return `<div style="${style}" class="${className || ''}" ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')}>${children || ''}</div>`
        }
    }

    /**
     * Get component name from type
     */
    private getComponentName(type: string): string {
        return type.charAt(0).toLowerCase() + type.slice(1)
    }

    /**
     * Clean up temporary files
     */
    async cleanup(): Promise<void> {
        try {
            await fs.rm(this.tempDir, { recursive: true, force: true })
        } catch (error) {
            console.error('Error cleaning up temp directory:', error)
        }
    }
}
