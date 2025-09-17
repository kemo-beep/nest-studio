import { EventEmitter } from 'events'
import * as fs from 'fs/promises'
import * as path from 'path'
import { CodeGenerationService, ComponentNode } from './CodeGenerationService'
import { FileSystemService } from './FileSystemService'

export interface SyncEvent {
    type: 'component-added' | 'component-updated' | 'component-removed' | 'file-changed'
    componentId?: string
    filePath?: string
    data?: any
}

export interface ProjectState {
    components: Map<string, ComponentNode>
    files: Map<string, string>
    lastSync: number
}

export class SyncService extends EventEmitter {
    private codeGenerationService: CodeGenerationService
    private fileSystemService: FileSystemService
    private projectPath: string
    private projectState: ProjectState
    private isWatching: boolean = false
    private syncQueue: SyncEvent[] = []
    private isProcessingQueue: boolean = false

    constructor(projectPath: string) {
        super()
        this.projectPath = projectPath
        this.codeGenerationService = new CodeGenerationService(projectPath)
        this.fileSystemService = new FileSystemService()
        this.projectState = {
            components: new Map(),
            files: new Map(),
            lastSync: Date.now()
        }
    }

    /**
     * Start watching for file changes and enable sync
     */
    async startWatching(): Promise<void> {
        if (this.isWatching) {
            return
        }

        try {
            // Start file watching
            await this.fileSystemService.watchProject(this.projectPath)

            // Listen for file changes
            this.fileSystemService.on('file-changed', this.handleFileChange.bind(this))

            this.isWatching = true
            console.log('Sync service started watching for changes')
        } catch (error) {
            console.error('Failed to start sync service:', error)
            throw error
        }
    }

    /**
     * Stop watching for file changes
     */
    async stopWatching(): Promise<void> {
        if (!this.isWatching) {
            return
        }

        try {
            await this.fileSystemService.stopWatching()
            this.isWatching = false
            console.log('Sync service stopped watching')
        } catch (error) {
            console.error('Failed to stop sync service:', error)
        }
    }

    /**
     * Add a component to the project and sync to files
     */
    async addComponent(component: ComponentNode, targetFile?: string): Promise<boolean> {
        try {
            // Add to project state
            this.projectState.components.set(component.id, component)

            // Determine target file
            const filePath = targetFile || this.getDefaultComponentFile()

            // Generate code and write to file
            const result = await this.codeGenerationService.insertComponent(
                filePath,
                component
            )

            if (result.success && result.code) {
                await fs.writeFile(filePath, result.code, 'utf-8')

                // Update project state
                this.projectState.files.set(filePath, result.code)
                this.projectState.lastSync = Date.now()

                // Emit event
                this.emit('sync-event', {
                    type: 'component-added',
                    componentId: component.id,
                    filePath,
                    data: component
                })

                return true
            } else {
                console.error('Failed to generate code for component:', result.error)
                return false
            }
        } catch (error) {
            console.error('Failed to add component:', error)
            return false
        }
    }

    /**
     * Update a component and sync to files
     */
    async updateComponent(componentId: string, updates: Partial<ComponentNode>): Promise<boolean> {
        try {
            const existingComponent = this.projectState.components.get(componentId)
            if (!existingComponent) {
                console.error('Component not found:', componentId)
                return false
            }

            // Update component in state
            const updatedComponent = { ...existingComponent, ...updates }
            this.projectState.components.set(componentId, updatedComponent)

            // Find the file containing this component
            const filePath = await this.findComponentFile(componentId)
            if (!filePath) {
                console.error('Could not find file for component:', componentId)
                return false
            }

            // Update the file
            const result = await this.codeGenerationService.updateComponentProps(
                filePath,
                componentId,
                updates.props || {}
            )

            if (result.success && result.code) {
                await fs.writeFile(filePath, result.code, 'utf-8')

                // Update project state
                this.projectState.files.set(filePath, result.code)
                this.projectState.lastSync = Date.now()

                // Emit event
                this.emit('sync-event', {
                    type: 'component-updated',
                    componentId,
                    filePath,
                    data: updatedComponent
                })

                return true
            } else {
                console.error('Failed to update component:', result.error)
                return false
            }
        } catch (error) {
            console.error('Failed to update component:', error)
            return false
        }
    }

    /**
     * Remove a component and sync to files
     */
    async removeComponent(componentId: string): Promise<boolean> {
        try {
            const existingComponent = this.projectState.components.get(componentId)
            if (!existingComponent) {
                console.error('Component not found:', componentId)
                return false
            }

            // Remove from state
            this.projectState.components.delete(componentId)

            // Find the file containing this component
            const filePath = await this.findComponentFile(componentId)
            if (!filePath) {
                console.error('Could not find file for component:', componentId)
                return false
            }

            // Update the file
            const result = await this.codeGenerationService.removeComponent(
                filePath,
                componentId
            )

            if (result.success && result.code) {
                await fs.writeFile(filePath, result.code, 'utf-8')

                // Update project state
                this.projectState.files.set(filePath, result.code)
                this.projectState.lastSync = Date.now()

                // Emit event
                this.emit('sync-event', {
                    type: 'component-removed',
                    componentId,
                    filePath
                })

                return true
            } else {
                console.error('Failed to remove component:', result.error)
                return false
            }
        } catch (error) {
            console.error('Failed to remove component:', error)
            return false
        }
    }

    /**
     * Handle file changes from external editors
     */
    private async handleFileChange(filePath: string, eventType: string): Promise<void> {
        try {
            // Read the updated file
            const content = await fs.readFile(filePath, 'utf-8')

            // Parse the file to extract components
            const components = await this.extractComponentsFromFile(filePath, content)

            // Update project state
            this.projectState.files.set(filePath, content)
            this.projectState.lastSync = Date.now()

            // Update components in state
            components.forEach(component => {
                this.projectState.components.set(component.id, component)
            })

            // Emit event
            this.emit('sync-event', {
                type: 'file-changed',
                filePath,
                data: { components, content }
            })

        } catch (error) {
            console.error('Failed to handle file change:', error)
        }
    }

    /**
     * Extract components from a file's content
     */
    private async extractComponentsFromFile(filePath: string, content: string): Promise<ComponentNode[]> {
        try {
            const result = await this.codeGenerationService.parseFile(filePath)
            if (!result.success || !result.ast) {
                return []
            }

            const components: ComponentNode[] = []

            // Traverse the AST to find JSX elements
            // This is a simplified implementation
            // In a real implementation, you'd need more sophisticated parsing

            return components
        } catch (error) {
            console.error('Failed to extract components:', error)
            return []
        }
    }

    /**
     * Find the file containing a specific component
     */
    private async findComponentFile(componentId: string): Promise<string | null> {
        // Search through all tracked files to find the component
        for (const [filePath, content] of this.projectState.files) {
            if (content.includes(componentId)) {
                return filePath
            }
        }
        return null
    }

    /**
     * Get the default component file path
     */
    private getDefaultComponentFile(): string {
        return path.join(this.projectPath, 'src', 'app', 'page.tsx')
    }

    /**
     * Get the current project state
     */
    getProjectState(): ProjectState {
        return { ...this.projectState }
    }

    /**
     * Get all components
     */
    getComponents(): ComponentNode[] {
        return Array.from(this.projectState.components.values())
    }

    /**
     * Get a specific component
     */
    getComponent(componentId: string): ComponentNode | undefined {
        return this.projectState.components.get(componentId)
    }

    /**
     * Check if sync is active
     */
    isActive(): boolean {
        return this.isWatching
    }
}
