/**
 * Element Update SDK
 * Provides real-time element updates by modifying source files and triggering hot reload
 */

export interface ElementUpdate {
    elementId: string
    filePath: string
    className?: string
    styles?: Record<string, string>
    props?: Record<string, any>
}

export interface UpdateResult {
    success: boolean
    error?: string
    updatedElement?: ElementUpdate
}

export class ElementUpdateSDK {
    private fileWatchers: Map<string, any> = new Map()
    private updateCallbacks: Map<string, (update: ElementUpdate) => void> = new Map()
    private devServerUrl: string = ''

    constructor(devServerUrl: string = 'http://localhost:3005') {
        this.devServerUrl = devServerUrl
    }

    /**
     * Update element classes in real-time
     */
    async updateElementClasses(
        filePath: string,
        elementId: string,
        newClasses: string
    ): Promise<UpdateResult> {
        try {
            console.log('[ElementUpdateSDK] Updating element classes:', {
                filePath,
                elementId,
                newClasses
            })

            // Parse the file to find the element
            const fileContent = await this.readFile(filePath)
            const updatedContent = this.updateElementInFile(fileContent, elementId, {
                className: newClasses
            })

            if (updatedContent === fileContent) {
                return {
                    success: false,
                    error: 'Element not found or no changes made'
                }
            }

            // Write the updated content back to the file
            await this.writeFile(filePath, updatedContent)

            // Trigger hot reload
            await this.triggerHotReload(filePath)

            const update: ElementUpdate = {
                elementId,
                filePath,
                className: newClasses
            }

            // Notify callbacks
            this.notifyCallbacks(update)

            return {
                success: true,
                updatedElement: update
            }
        } catch (error) {
            console.error('[ElementUpdateSDK] Error updating element classes:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    /**
     * Update element styles in real-time
     */
    async updateElementStyles(
        filePath: string,
        elementId: string,
        styles: Record<string, string>
    ): Promise<UpdateResult> {
        try {
            console.log('[ElementUpdateSDK] Updating element styles:', {
                filePath,
                elementId,
                styles
            })

            const fileContent = await this.readFile(filePath)
            const updatedContent = this.updateElementInFile(fileContent, elementId, {
                styles
            })

            if (updatedContent === fileContent) {
                return {
                    success: false,
                    error: 'Element not found or no changes made'
                }
            }

            await this.writeFile(filePath, updatedContent)
            await this.triggerHotReload(filePath)

            const update: ElementUpdate = {
                elementId,
                filePath,
                styles
            }

            this.notifyCallbacks(update)

            return {
                success: true,
                updatedElement: update
            }
        } catch (error) {
            console.error('[ElementUpdateSDK] Error updating element styles:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    /**
     * Update element props in real-time
     */
    async updateElementProps(
        filePath: string,
        elementId: string,
        props: Record<string, any>
    ): Promise<UpdateResult> {
        try {
            console.log('[ElementUpdateSDK] Updating element props:', {
                filePath,
                elementId,
                props
            })

            const fileContent = await this.readFile(filePath)
            const updatedContent = this.updateElementInFile(fileContent, elementId, {
                props
            })

            if (updatedContent === fileContent) {
                return {
                    success: false,
                    error: 'Element not found or no changes made'
                }
            }

            await this.writeFile(filePath, updatedContent)
            await this.triggerHotReload(filePath)

            const update: ElementUpdate = {
                elementId,
                filePath,
                props
            }

            this.notifyCallbacks(update)

            return {
                success: true,
                updatedElement: update
            }
        } catch (error) {
            console.error('[ElementUpdateSDK] Error updating element props:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    /**
     * Parse file content and update the specified element
     */
    private updateElementInFile(
        fileContent: string,
        elementId: string,
        updates: {
            className?: string
            styles?: Record<string, string>
            props?: Record<string, any>
        }
    ): string {
        // This is a simplified implementation
        // In a real implementation, you'd use a proper JSX/TSX parser like @babel/parser

        const lines = fileContent.split('\n')
        let updated = false

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]

            // Look for JSX elements with className
            if (line.includes('className=') && line.includes(elementId)) {
                if (updates.className !== undefined) {
                    // Update className
                    const classNameMatch = line.match(/className="([^"]*)"|className=\{([^}]*)\}/)
                    if (classNameMatch) {
                        const newClassName = updates.className
                        lines[i] = line.replace(
                            /className="[^"]*"|className=\{[^}]*\}/,
                            `className="${newClassName}"`
                        )
                        updated = true
                        console.log('[ElementUpdateSDK] Updated className on line', i + 1)
                    }
                }
            }

            // Look for style objects
            if (updates.styles && line.includes('style=') && line.includes(elementId)) {
                // This would need more sophisticated parsing for style objects
                console.log('[ElementUpdateSDK] Style updates not yet implemented for inline styles')
            }
        }

        return updated ? lines.join('\n') : fileContent
    }

    /**
     * Read file content
     */
    private async readFile(filePath: string): Promise<string> {
        // This would use the file system service in the main process
        // For now, we'll use a placeholder
        return new Promise((resolve, reject) => {
            if (window.electronAPI?.fs?.readFile) {
                window.electronAPI.fs.readFile(filePath)
                    .then(resolve)
                    .catch(reject)
            } else {
                reject(new Error('File system API not available'))
            }
        })
    }

    /**
     * Write file content
     */
    private async writeFile(filePath: string, content: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (window.electronAPI?.fs?.writeFile) {
                window.electronAPI.fs.writeFile(filePath, content)
                    .then(() => resolve())
                    .catch(reject)
            } else {
                reject(new Error('File system API not available'))
            }
        })
    }

    /**
     * Trigger hot reload for the file
     */
    private async triggerHotReload(filePath: string): Promise<void> {
        try {
            // Send a message to the dev server to trigger hot reload
            const response = await fetch(`${this.devServerUrl}/_next/webpack-hmr`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'file-changed',
                    file: filePath
                })
            })

            if (!response.ok) {
                console.warn('[ElementUpdateSDK] Hot reload trigger failed:', response.statusText)
            } else {
                console.log('[ElementUpdateSDK] Hot reload triggered for:', filePath)
            }
        } catch (error) {
            console.warn('[ElementUpdateSDK] Could not trigger hot reload:', error)
        }
    }

    /**
     * Register a callback for element updates
     */
    onElementUpdate(callback: (update: ElementUpdate) => void): string {
        const id = Math.random().toString(36).substr(2, 9)
        this.updateCallbacks.set(id, callback)
        return id
    }

    /**
     * Unregister a callback
     */
    offElementUpdate(callbackId: string): void {
        this.updateCallbacks.delete(callbackId)
    }

    /**
     * Notify all registered callbacks
     */
    private notifyCallbacks(update: ElementUpdate): void {
        this.updateCallbacks.forEach(callback => {
            try {
                callback(update)
            } catch (error) {
                console.error('[ElementUpdateSDK] Error in callback:', error)
            }
        })
    }

    /**
     * Set the dev server URL
     */
    setDevServerUrl(url: string): void {
        this.devServerUrl = url
    }
}

// Global instance
export const elementUpdateSDK = new ElementUpdateSDK()
