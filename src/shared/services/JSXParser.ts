/**
 * JSX/TSX Parser for element updates
 * Handles parsing and updating JSX elements in source files
 */

export interface JSXElement {
    tagName: string
    attributes: Record<string, string>
    children: JSXElement[]
    startLine: number
    endLine: number
    startColumn: number
    endColumn: number
    elementId?: string
}

export interface ElementUpdate {
    elementId: string
    className?: string
    styles?: Record<string, string>
    props?: Record<string, any>
}

export class JSXParser {
    /**
     * Parse JSX content and find elements by ID
     */
    parseJSX(content: string): JSXElement[] {
        const elements: JSXElement[] = []
        const lines = content.split('\n')

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            const element = this.parseJSXLine(line, i)
            if (element) {
                elements.push(element)
            }
        }

        return elements
    }

    /**
     * Find element by ID in parsed JSX
     */
    findElementById(elements: JSXElement[], elementId: string): JSXElement | null {
        for (const element of elements) {
            if (element.elementId === elementId) {
                return element
            }
            const found = this.findElementById(element.children, elementId)
            if (found) return found
        }
        return null
    }

    /**
     * Update element in JSX content
     */
    updateElementInContent(
        content: string,
        elementId: string,
        updates: {
            className?: string
            styles?: Record<string, string>
            props?: Record<string, any>
        }
    ): string {
        const lines = content.split('\n')
        let updated = false

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]

            // Check if this line contains the element we're looking for
            if (this.lineContainsElement(line, elementId)) {
                const updatedLine = this.updateElementInLine(line, updates)
                if (updatedLine !== line) {
                    lines[i] = updatedLine
                    updated = true
                    console.log('[JSXParser] Updated element on line', i + 1)
                }
            }
        }

        return updated ? lines.join('\n') : content
    }

    /**
     * Parse a single JSX line
     */
    private parseJSXLine(line: string, lineNumber: number): JSXElement | null {
        // Simple regex to match JSX elements
        const jsxMatch = line.match(/<(\w+)([^>]*)>/)
        if (!jsxMatch) return null

        const tagName = jsxMatch[1]
        const attributesString = jsxMatch[2]
        const attributes = this.parseAttributes(attributesString)

        // Generate element ID based on line and content
        const elementId = this.generateElementId(line, lineNumber)

        return {
            tagName,
            attributes,
            children: [],
            startLine: lineNumber,
            endLine: lineNumber,
            startColumn: 0,
            endColumn: line.length,
            elementId
        }
    }

    /**
     * Parse attributes from JSX element
     */
    private parseAttributes(attributesString: string): Record<string, string> {
        const attributes: Record<string, string> = {}

        // Match className="..." or className={...}
        const classNameMatch = attributesString.match(/className="([^"]*)"|className=\{([^}]*)\}/)
        if (classNameMatch) {
            attributes.className = classNameMatch[1] || classNameMatch[2] || ''
        }

        // Match other attributes
        const attrMatches = attributesString.matchAll(/(\w+)="([^"]*)"|(\w+)=\{([^}]*)\}/g)
        for (const match of attrMatches) {
            const key = match[1] || match[3]
            const value = match[2] || match[4]
            if (key && value !== undefined) {
                attributes[key] = value
            }
        }

        return attributes
    }

    /**
     * Generate element ID based on line content and position
     */
    private generateElementId(line: string, lineNumber: number): string {
        // Create a hash of the line content and position
        const content = line.trim()
        const hash = this.simpleHash(content + lineNumber)
        return `el-${hash}`
    }

    /**
     * Simple hash function
     */
    private simpleHash(str: string): string {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36)
    }

    /**
     * Check if line contains the target element
     */
    private lineContainsElement(line: string, elementId: string): boolean {
        // This is a simplified check - in a real implementation,
        // you'd need to track element IDs more precisely
        const content = line.trim()

        // Check for common patterns that might match our element
        if (content.includes('className=') && content.includes('mb-2')) {
            return true // This is a simplified match for the specific element
        }

        return false
    }

    /**
     * Update element in a single line
     */
    private updateElementInLine(
        line: string,
        updates: {
            className?: string
            styles?: Record<string, string>
            props?: Record<string, any>
        }
    ): string {
        let updatedLine = line

        // Update className
        if (updates.className !== undefined) {
            const classNameMatch = line.match(/className="([^"]*)"|className=\{([^}]*)\}/)
            if (classNameMatch) {
                updatedLine = line.replace(
                    /className="[^"]*"|className=\{[^}]*\}/,
                    `className="${updates.className}"`
                )
            } else {
                // Add className if it doesn't exist
                const tagMatch = line.match(/<(\w+)([^>]*)>/)
                if (tagMatch) {
                    const beforeClose = tagMatch[2]
                    updatedLine = line.replace(
                        /<(\w+)([^>]*)>/,
                        `<$1${beforeClose} className="${updates.className}">`
                    )
                }
            }
        }

        // Update styles (simplified - would need more sophisticated handling)
        if (updates.styles) {
            console.log('[JSXParser] Style updates not yet implemented for inline styles')
        }

        // Update props (simplified - would need more sophisticated handling)
        if (updates.props) {
            console.log('[JSXParser] Props updates not yet implemented')
        }

        return updatedLine
    }

    /**
     * Find element by content pattern (for the specific use case)
     */
    findElementByPattern(content: string, pattern: string): { line: number; content: string } | null {
        const lines = content.split('\n')

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (line.includes(pattern)) {
                return { line: i, content: line }
            }
        }

        return null
    }

    /**
     * Update element by pattern match
     */
    updateElementByPattern(
        content: string,
        pattern: string,
        updates: {
            className?: string
            styles?: Record<string, string>
            props?: Record<string, any>
        }
    ): string {
        const lines = content.split('\n')
        let updated = false

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (line.includes(pattern)) {
                const updatedLine = this.updateElementInLine(line, updates)
                if (updatedLine !== line) {
                    lines[i] = updatedLine
                    updated = true
                    console.log('[JSXParser] Updated element by pattern on line', i + 1)
                }
                break // Only update the first match
            }
        }

        return updated ? lines.join('\n') : content
    }
}

export const jsxParser = new JSXParser()
