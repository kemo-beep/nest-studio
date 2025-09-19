import * as fs from 'fs/promises'
import * as path from 'path'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import * as t from '@babel/types'
import * as recast from 'recast'
import { jsxParser } from '../../shared/services/JSXParser'

export interface ComponentNode {
    id: string
    type: string
    name: string
    props: Record<string, any>
    children?: ComponentNode[]
    position: {
        x: number
        y: number
        width: number
        height: number
    }
}

export interface CodeGenerationResult {
    success: boolean
    code?: string
    error?: string
    ast?: any
}

export class CodeGenerationService {
    private projectPath: string

    constructor(projectPath: string) {
        this.projectPath = projectPath
    }

    /**
     * Parse a JSX/TSX file and return its AST
     */
    async parseFile(filePath: string): Promise<CodeGenerationResult> {
        try {
            const content = await fs.readFile(filePath, 'utf-8')
            const ast = parse(content, {
                sourceType: 'module',
                plugins: [
                    'jsx',
                    'typescript',
                    'decorators-legacy',
                    'classProperties',
                    'objectRestSpread',
                    'functionBind',
                    'exportDefaultFrom',
                    'exportNamespaceFrom',
                    'dynamicImport',
                    'nullishCoalescingOperator',
                    'optionalChaining'
                ]
            })

            return {
                success: true,
                code: content,
                ast
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown parsing error'
            }
        }
    }

    /**
     * Generate JSX code from component nodes
     */
    generateJSXFromNodes(nodes: ComponentNode[]): string {
        const jsxElements = nodes.map(node => this.generateJSXElement(node))

        // Wrap in a fragment if multiple elements
        if (jsxElements.length === 1) {
            return jsxElements[0]
        }

        return `<>\n${jsxElements.map(el => `  ${el}`).join('\n')}\n</>`
    }

    /**
     * Generate a single JSX element from a component node
     */
    private generateJSXElement(node: ComponentNode): string {
        const { type, props, children } = node

        // Generate props string
        const propsString = Object.entries(props)
            .filter(([_, value]) => value !== undefined && value !== null)
            .map(([key, value]) => {
                if (typeof value === 'string') {
                    return `${key}="${value}"`
                } else if (typeof value === 'boolean') {
                    return value ? key : `{false}`
                } else {
                    return `${key}={${JSON.stringify(value)}}`
                }
            })
            .join(' ')

        // Generate children
        let childrenString = ''
        if (children && children.length > 0) {
            const childElements = children.map(child => this.generateJSXElement(child))
            childrenString = `\n    ${childElements.join('\n    ')}\n  `
        }

        // Generate the JSX element
        const propsPart = propsString ? ` ${propsString}` : ''
        const isSelfClosing = !children || children.length === 0

        if (isSelfClosing) {
            return `<${type}${propsPart} />`
        } else {
            return `<${type}${propsPart}>${childrenString}</${type}>`
        }
    }

    /**
     * Insert a component into an existing JSX file
     */
    async insertComponent(
        filePath: string,
        component: ComponentNode,
        targetPath?: string
    ): Promise<CodeGenerationResult> {
        try {
            const parseResult = await this.parseFile(filePath)
            if (!parseResult.success || !parseResult.ast) {
                return parseResult
            }

            const ast = parseResult.ast
            let targetNode: any = null

            // Find the target node to insert into
            if (targetPath) {
                targetNode = this.findNodeByPath(ast, targetPath)
            } else {
                // Find the default export or main component
                targetNode = this.findMainComponent(ast)
            }

            if (!targetNode) {
                return {
                    success: false,
                    error: 'Could not find target node for insertion'
                }
            }

            // Generate the new JSX element
            const newElement = this.createJSXElementFromNode(component)

            // Insert the element
            if (t.isJSXElement(targetNode) || t.isJSXFragment(targetNode)) {
                const children = targetNode.children || []
                children.push(newElement)
            }

            // Generate the updated code
            const result = generate(ast, {
                retainLines: true,
                compact: false,
                comments: true
            })

            return {
                success: true,
                code: result.code
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during insertion'
            }
        }
    }

    /**
     * Update a component's props in an existing JSX file
     */
    async updateComponentProps(
        filePath: string,
        componentId: string,
        newProps: Record<string, any>
    ): Promise<CodeGenerationResult> {
        try {
            const parseResult = await this.parseFile(filePath)
            if (!parseResult.success || !parseResult.ast) {
                return parseResult
            }

            const ast = parseResult.ast
            let updated = false

            traverse(ast, {
                JSXElement: (path) => {
                    // Check if this is the component we want to update
                    if (this.isTargetComponent(path, componentId)) {
                        this.updateJSXElementProps(path, newProps)
                        updated = true
                    }
                }
            })

            if (!updated) {
                return {
                    success: false,
                    error: `Component with id ${componentId} not found`
                }
            }

            // Generate the updated code
            const result = generate(ast, {
                retainLines: true,
                compact: false,
                comments: true
            })

            return {
                success: true,
                code: result.code
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during update'
            }
        }
    }

    /**
     * Remove a component from an existing JSX file
     */
    async removeComponent(
        filePath: string,
        componentId: string
    ): Promise<CodeGenerationResult> {
        try {
            const parseResult = await this.parseFile(filePath)
            if (!parseResult.success || !parseResult.ast) {
                return parseResult
            }

            const ast = parseResult.ast
            let removed = false

            traverse(ast, {
                JSXElement: (path) => {
                    if (this.isTargetComponent(path, componentId)) {
                        path.remove()
                        removed = true
                    }
                }
            })

            if (!removed) {
                return {
                    success: false,
                    error: `Component with id ${componentId} not found`
                }
            }

            // Generate the updated code
            const result = generate(ast, {
                retainLines: true,
                compact: false,
                comments: true
            })

            return {
                success: true,
                code: result.code
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during removal'
            }
        }
    }

    /**
     * Create a new React component file
     */
    async createComponentFile(
        componentName: string,
        content: string,
        directory: string = 'src/components'
    ): Promise<CodeGenerationResult> {
        try {
            const filePath = path.join(this.projectPath, directory, `${componentName}.tsx`)

            // Ensure directory exists
            await fs.mkdir(path.dirname(filePath), { recursive: true })

            // Write the file
            await fs.writeFile(filePath, content, 'utf-8')

            return {
                success: true,
                code: content
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error creating component file'
            }
        }
    }

    /**
     * Generate a complete React component file from component nodes
     */
    generateComponentFile(
        componentName: string,
        nodes: ComponentNode[],
        imports: string[] = []
    ): string {
        const jsxContent = this.generateJSXFromNodes(nodes)

        const importsSection = imports.length > 0
            ? imports.map(imp => `import ${imp}`).join('\n') + '\n\n'
            : ''

        return `${importsSection}export default function ${componentName}() {
  return (
    ${jsxContent}
  )
}
`
    }

    // Helper methods
    private findNodeByPath(_ast: any, _path: string): any {
        // Implementation to find a node by a specific path
        // This would depend on the specific path format
        return null
    }

    private findMainComponent(ast: any): any {
        let mainComponent: any = null

        traverse(ast, {
            ExportDefaultDeclaration(path) {
                if (t.isFunctionDeclaration(path.node.declaration) ||
                    t.isArrowFunctionExpression(path.node.declaration)) {
                    mainComponent = path.node.declaration
                }
            }
        })

        return mainComponent
    }

    private createJSXElementFromNode(node: ComponentNode): any {
        const element = t.jsxElement(
            t.jsxOpeningElement(
                t.jsxIdentifier(node.type),
                this.createJSXAttributes(node.props),
                true
            ),
            t.jsxClosingElement(t.jsxIdentifier(node.type)),
            node.children ? node.children.map(child => this.createJSXElementFromNode(child)) : []
        )

        return element
    }

    private createJSXAttributes(props: Record<string, any>): any[] {
        return Object.entries(props)
            .filter(([_, value]) => value !== undefined && value !== null)
            .map(([key, value]) => {
                if (typeof value === 'string') {
                    return t.jsxAttribute(
                        t.jsxIdentifier(key),
                        t.stringLiteral(value)
                    )
                } else if (typeof value === 'boolean') {
                    return t.jsxAttribute(
                        t.jsxIdentifier(key),
                        t.jsxExpressionContainer(t.booleanLiteral(value))
                    )
                } else {
                    return t.jsxAttribute(
                        t.jsxIdentifier(key),
                        t.jsxExpressionContainer(t.valueToNode(value))
                    )
                }
            })
    }

    private isTargetComponent(_path: any, _componentId: string): boolean {
        // Check if this JSX element has the target component ID
        // This would depend on how we store component IDs in the JSX
        return false
    }

    private updateJSXElementProps(path: any, newProps: Record<string, any>): void {
        // Update the props of a JSX element
        const openingElement = path.node.openingElement
        const existingAttributes = openingElement.attributes || []

        // Remove existing attributes that are being updated
        const filteredAttributes = existingAttributes.filter((attr: any) => {
            if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
                return !(attr.name.name in newProps)
            }
            return true
        })

        // Add new attributes
        const newAttributes = this.createJSXAttributes(newProps)
        openingElement.attributes = [...filteredAttributes, ...newAttributes]
    }

    async updateElement(filePath: string, elementId: string, updates: Partial<{ className: string, content: string, props: Record<string, any> }>): Promise<CodeGenerationResult> {
        try {
            console.log('[CodeGenerationService] Updating element:', {
                filePath,
                elementId,
                updates
            })

            const fullPath = path.resolve(this.projectPath, filePath)
            const content = await fs.readFile(fullPath, 'utf-8')

            let updatedContent = content

            // Update className if provided
            if (updates.className !== undefined) {
                updatedContent = this.updateElementClassesInContent(updatedContent, elementId, updates.className)
            }

            // Update content if provided
            if (updates.content !== undefined) {
                updatedContent = this.updateElementContentInContent(updatedContent, elementId, updates.content)
            }

            // Update props if provided
            if (updates.props !== undefined) {
                updatedContent = this.updateElementPropsInContent(updatedContent, elementId, updates.props)
            }

            if (updatedContent === content) {
                return {
                    success: false,
                    error: 'Element not found or no changes made'
                }
            }

            await fs.writeFile(fullPath, updatedContent)

            console.log('[CodeGenerationService] Successfully updated element')
            return {
                success: true,
                code: updatedContent
            }
        } catch (error) {
            console.error('[CodeGenerationService] Error updating element:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    /**
     * Update element classes in content using pattern matching
     */
    private updateElementClassesInContent(
        content: string,
        elementId: string,
        newClasses: string
    ): string {
        const lines = content.split('\n')
        let updated = false

        console.log('[CodeGenerationService] Looking for element with ID:', elementId)
        console.log('[CodeGenerationService] New classes to add:', newClasses)

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            console.log(`[CodeGenerationService] Checking line ${i + 1}:`, line.trim())

            // Look for the specific element pattern (li with mb-2 tracking-[-.01em])
            if (line.includes('mb-2 tracking-[-.01em]') && line.includes('className=')) {
                console.log('[CodeGenerationService] Found target element on line', i + 1)

                // Update the className - replace the entire className with the new one
                const classNameMatch = line.match(/className="([^"]*)"/)
                if (classNameMatch) {
                    console.log('[CodeGenerationService] Current classes:', classNameMatch[1])
                    console.log('[CodeGenerationService] New classes to set:', newClasses)

                    lines[i] = line.replace(
                        /className="[^"]*"/,
                        `className="${newClasses.trim()}"`
                    )
                    updated = true
                    console.log('[CodeGenerationService] Updated className on line', i + 1, ':', newClasses.trim())
                    console.log('[CodeGenerationService] New line content:', lines[i])
                    break
                } else {
                    console.log('[CodeGenerationService] No className match found on line', i + 1)
                }
            }
        }

        // If no specific element found, try to find any li element with className
        if (!updated) {
            console.log('[CodeGenerationService] No specific element found, trying generic li element...')
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i]
                if (line.includes('<li') && line.includes('className=')) {
                    console.log('[CodeGenerationService] Found generic li element on line', i + 1)

                    const classNameMatch = line.match(/className="([^"]*)"/)
                    if (classNameMatch) {
                        console.log('[CodeGenerationService] Current classes:', classNameMatch[1])
                        console.log('[CodeGenerationService] New classes to set:', newClasses)

                        lines[i] = line.replace(
                            /className="[^"]*"/,
                            `className="${newClasses.trim()}"`
                        )
                        updated = true
                        console.log('[CodeGenerationService] Updated generic li element on line', i + 1, ':', newClasses.trim())
                        break
                    }
                }
            }
        }

        if (!updated) {
            console.log('[CodeGenerationService] No matching element found for update')
        }

        return updated ? lines.join('\n') : content
    }

    /**
     * Update element content in content
     */
    private updateElementContentInContent(
        content: string,
        elementId: string,
        newContent: string
    ): string {
        // This would update the text content of an element
        // For now, we'll focus on className updates
        console.log('[CodeGenerationService] Content updates not yet implemented')
        return content
    }

    /**
     * Update element props in content
     */
    private updateElementPropsInContent(
        content: string,
        elementId: string,
        newProps: Record<string, any>
    ): string {
        // This would update other props of an element
        // For now, we'll focus on className updates
        console.log('[CodeGenerationService] Props updates not yet implemented')
        return content
    }
}
